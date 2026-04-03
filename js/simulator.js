// ===== 몬테카를로 시즌 시뮬레이션 =====

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateQuarter(state, quarter, onProgress) {
    const games = 36;
    const qKey = `q${quarter}`;
    const teamCodes = Object.keys(state.teams);

    // Reset this quarter's record
    for (const code of teamCodes) {
        state.teams[code].seasonRecord[qKey] = { wins: 0, losses: 0 };
    }

    // Precalculate win rates for all teams
    const winRates = {};
    for (const code of teamCodes) {
        const pp = calcTeamPitchPower(state, code);
        const bp = calcTeamBatPower(state, code);
        winRates[code] = calcWinRate(pp, bp);
    }

    // Simulate game by game
    for (let game = 1; game <= games; game++) {
        for (const code of teamCodes) {
            if (Math.random() < winRates[code]) {
                state.teams[code].seasonRecord[qKey].wins++;
            } else {
                state.teams[code].seasonRecord[qKey].losses++;
            }
        }

        if (onProgress) {
            onProgress(game, games);
        }

        await delay(50);
    }

    return getStandings(state);
}

function getStandings(state) {
    const teamCodes = Object.keys(state.teams);
    const standings = teamCodes.map(code => {
        const team = state.teams[code];
        const record = getTeamTotalRecord(team);
        return {
            code,
            name: team.name,
            color: team.color,
            wins: record.wins,
            losses: record.losses,
            draws: record.draws,
            rate: record.rate,
            rs: record.rs,
            ra: record.ra,
            pythag: record.pythag,
            pitchPower: calcTeamPitchPower(state, code),
            batPower: calcTeamBatPower(state, code),
        };
    });

    // KBO 순위: 승률 내림 → 승수 내림
    standings.sort((a, b) => b.rate - a.rate || b.wins - a.wins);

    // 게임차 (승+패 기준, 무 제외)
    standings.forEach((s, i) => {
        if (i === 0) {
            s.gb = '-';
        } else {
            const gb = ((standings[0].wins - s.wins) - (standings[0].losses - s.losses)) / 2;
            s.gb = gb > 0 ? gb.toFixed(1) : '-';
        }
        s.rank = i + 1;
    });

    return standings;
}

function getCurrentQuarter(state) {
    for (let q = 1; q <= 4; q++) {
        const qKey = `q${q}`;
        const anyPlayed = Object.values(state.teams).some(
            t => t.seasonRecord[qKey].wins > 0 || t.seasonRecord[qKey].losses > 0
        );
        if (!anyPlayed) return q;
    }
    return 5; // All quarters done
}

function getCompletedQuarters(state) {
    let completed = 0;
    for (let q = 1; q <= 4; q++) {
        const qKey = `q${q}`;
        const anyPlayed = Object.values(state.teams).some(
            t => t.seasonRecord[qKey].wins > 0 || t.seasonRecord[qKey].losses > 0
        );
        if (anyPlayed) completed = q;
    }
    return completed;
}

// 총 진행 경기 수 (승+패+무)
function getTotalGamesPlayed(state) {
    const first = Object.values(state.teams)[0];
    if (!first) return 0;
    let total = 0;
    for (let q = 1; q <= 4; q++) {
        const r = first.seasonRecord[`q${q}`];
        total += (r.wins || 0) + (r.losses || 0) + (r.draws || 0);
    }
    return total;
}

// 5경기 단위 시뮬레이션 — 실제 대전 방식 (팀 vs 팀, 무승부 포함)
async function simulateBatch(state, batchSize, onProgress) {
    const teamCodes = Object.keys(state.teams);

    // 팀별 전력 사전 계산
    const teamPower = {};
    for (const code of teamCodes) {
        const pp = calcTeamPitchPower(state, code);
        const bp = calcTeamBatPower(state, code);
        // 피타고리안 기대 득점 (전력 기반)
        teamPower[code] = { pitch: pp, bat: bp, total: pp * 0.5 + bp * 0.5 };
    }

    // 10팀 → 5경기(매치) per 라운드
    // KBO: 연장 12회 제한, 무승부 발생률 약 2-4%
    const DRAW_RATE = 0.03;

    for (let game = 1; game <= batchSize; game++) {
        const totalPlayed = getTotalGamesPlayed(state);
        const q = Math.min(4, Math.floor(totalPlayed / 36) + 1);
        const qKey = `q${q}`;

        // 팀 셔플하여 5개 매치 생성
        const shuffled = [...teamCodes].sort(() => Math.random() - 0.5);
        for (let m = 0; m < 5; m++) {
            const home = shuffled[m * 2];
            const away = shuffled[m * 2 + 1];

            // 피타고리안 기반 득점 생성
            const homePwr = teamPower[home].total;
            const awayPwr = teamPower[away].total;
            // 기대 득점: 리그 평균 4.5점, 전력 비례
            const homeExpR = 4.5 * (homePwr / 50) * (1 + 0.04); // 홈 어드밴티지 4%
            const awayExpR = 4.5 * (awayPwr / 50);
            // 포아송 근사 득점 (정수)
            const homeRuns = poissonRandom(Math.max(0.5, homeExpR));
            const awayRuns = poissonRandom(Math.max(0.5, awayExpR));

            if (homeRuns === awayRuns && Math.random() < DRAW_RATE) {
                // 무승부 (연장 12회 동점)
                state.teams[home].seasonRecord[qKey].draws = (state.teams[home].seasonRecord[qKey].draws || 0) + 1;
                state.teams[away].seasonRecord[qKey].draws = (state.teams[away].seasonRecord[qKey].draws || 0) + 1;
            } else {
                // 승패 결정 (동점이면 연장 승부)
                let winner, loser;
                if (homeRuns !== awayRuns) {
                    winner = homeRuns > awayRuns ? home : away;
                    loser = homeRuns > awayRuns ? away : home;
                } else {
                    // 동점 → 연장 승부 (전력 기반)
                    const homeProb = homePwr / (homePwr + awayPwr);
                    winner = Math.random() < homeProb ? home : away;
                    loser = winner === home ? away : home;
                }
                state.teams[winner].seasonRecord[qKey].wins++;
                state.teams[loser].seasonRecord[qKey].losses++;
            }

            // 득실점 누적 (피타고리안 승률 산출용)
            state.teams[home].seasonRecord[qKey].rs = (state.teams[home].seasonRecord[qKey].rs || 0) + homeRuns;
            state.teams[home].seasonRecord[qKey].ra = (state.teams[home].seasonRecord[qKey].ra || 0) + awayRuns;
            state.teams[away].seasonRecord[qKey].rs = (state.teams[away].seasonRecord[qKey].rs || 0) + awayRuns;
            state.teams[away].seasonRecord[qKey].ra = (state.teams[away].seasonRecord[qKey].ra || 0) + homeRuns;
        }

        if (onProgress) onProgress(game, batchSize);
        await delay(30);
    }

    // AI 팀 1/2군 교체
    aiRosterShuffle(state);

    // 개인 선수 시즌 스탯 갱신
    updateAllSimStats(state);

    return getStandings(state);
}

/** 포아송 분포 난수 생성 */
function poissonRandom(lambda) {
    let L = Math.exp(-lambda), k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
}

// ══════════════════════════════════════════
// ── 개인 선수 시즌 스탯 생성 (simStats) ──
// ══════════════════════════════════════════

/**
 * 전체 선수 simStats를 현재 진행 경기수 기반으로 누적 생성
 * 선수 ratings(20-80)와 realStats를 기반으로 현실적인 스탯 산출
 */
function updateAllSimStats(state) {
    const totalGames = getTotalGamesPlayed(state);
    if (totalGames <= 0) return;

    const seasonPct = totalGames / 144; // 시즌 진행률 (0~1)
    const teamCodes = Object.keys(state.teams);

    for (const code of teamCodes) {
        const team = state.teams[code];
        const record = getTeamTotalRecord(team);
        const teamWins = record.wins;
        const teamLosses = record.losses;

        for (const pid of team.roster) {
            const p = state.players[pid];
            if (!p) continue;

            if (p.position === 'P') {
                p.simStats = generatePitcherSimStats(p, totalGames, seasonPct, teamWins, teamLosses);
            } else {
                p.simStats = generateBatterSimStats(p, totalGames, seasonPct);
            }
        }
    }
}

/** 난수 헬퍼: 정규분포 근사 */
function randNorm(mean, sd) {
    const u1 = Math.random(), u2 = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/**
 * 시즌 변동 팩터 — 브레이크아웃(+15%) / 슬럼프(-15%) / 평년
 * 선수별로 시즌 초 1회 결정, 이후 유지 (선수 id 기반 시드)
 */
function getSeasonVariance(playerId) {
    // 간단한 해시로 시즌 내 일관성 유지
    if (!window._seasonVarCache) window._seasonVarCache = {};
    if (window._seasonVarCache[playerId] != null) return window._seasonVarCache[playerId];
    // 20% 확률 브레이크아웃, 20% 슬럼프, 60% 평년
    const roll = Math.random();
    const v = roll < 0.20 ? randNorm(0.12, 0.04) :   // 브레이크아웃 (+8~16%)
              roll < 0.40 ? randNorm(-0.10, 0.04) :   // 슬럼프 (-6~14%)
              randNorm(0, 0.03);                        // 평년 (±3%)
    window._seasonVarCache[playerId] = clamp(v, -0.20, 0.25);
    return window._seasonVarCache[playerId];
}

/**
 * 타자 simStats 생성 — 랜덤 시즌 변동 포함
 */
function generateBatterSimStats(p, totalGames, seasonPct) {
    const r = p.ratings || {};
    const real = p.realStats || {};
    const ovr = p.ovr || 50;
    const sv = getSeasonVariance(p.id); // 시즌 변동 팩터

    // 출전 경기
    const playRate = ovr >= 55 ? clamp(0.85 + (ovr - 55) * 0.005, 0.85, 0.98) :
                     ovr >= 45 ? clamp(0.5 + (ovr - 45) * 0.035, 0.5, 0.85) :
                     clamp(0.2 + (ovr - 20) * 0.012, 0.15, 0.5);
    const G = Math.round(totalGames * playRate);
    if (G <= 0) return null;

    const paPerGame = clamp(randNorm(4.0, 0.3), 3.3, 4.7);
    const PA = Math.round(G * paPerGame);

    const contactR = (r.contact || 50) / 100;
    const powerR = (r.power || 50) / 100;
    const eyeR = (r.eye || 50) / 100;
    const speedR = (r.speed || 50) / 100;

    // 볼넷률
    const bbBase = real.BB && real.PA ? real.BB / real.PA : clamp(0.04 + eyeR * 0.12, 0.03, 0.18);
    const bbRate = clamp(bbBase * (1 + sv * 0.3), 0.02, 0.22);
    const BB = Math.round(PA * clamp(randNorm(bbRate, 0.015), 0.02, 0.22));
    const HBP = Math.round(PA * clamp(randNorm(0.008, 0.003), 0, 0.02));
    const SF = Math.round(PA * 0.005);
    const AB = PA - BB - HBP - SF;

    // 타율 — ratings 기반 + 시즌 변동
    const ratingAVG = 0.200 + contactR * 0.15;
    const baseAVG = real.AVG ? real.AVG * 0.4 + ratingAVG * 0.6 : ratingAVG; // 60% 랜덤, 40% 참고
    const AVG = clamp(randNorm(baseAVG * (1 + sv), 0.025), 0.140, 0.400);
    const H = Math.round(AB * AVG);

    // 장타력 — 시즌 변동 크게 적용
    const ratingISO = 0.05 + powerR * 0.25;
    const baseISO = real.IsoP ? real.IsoP * 0.3 + ratingISO * 0.7 : ratingISO;
    const ISO = clamp(randNorm(baseISO * (1 + sv * 1.5), 0.035), 0.02, 0.40);

    // 홈런
    const ratingHRrate = 0.005 + powerR * 0.055;
    const baseHRrate = real.HR && real.AB ? real.HR / real.AB * 0.3 + ratingHRrate * 0.7 : ratingHRrate;
    const HR = Math.round(AB * clamp(randNorm(baseHRrate * (1 + sv * 1.5), 0.008), 0, 0.08));

    const doubles = Math.round(H * clamp(randNorm(0.22, 0.04), 0.10, 0.38));
    const triples = Math.round(H * clamp(randNorm(0.015 + speedR * 0.02, 0.008), 0, 0.06));
    const singles = Math.max(0, H - HR - doubles - triples);

    // 타점/득점 — 파워/OBP에 비례, 변동 반영
    const rbiMult = 1 + sv * 0.5;
    const RBI = Math.round(clamp((HR * 3.0 + (H - HR) * 0.40 + BB * 0.12) * rbiMult, 0, PA * 0.30));
    const R = Math.round(clamp((H * 0.40 + BB * 0.35 + HR * 0.55) * rbiMult, 0, PA * 0.25));

    // 도루
    const sbBase = real.SB && real.G ? real.SB / real.G * 0.4 + speedR * 0.3 * 0.6 : speedR * 0.3;
    const SB = Math.round(G * clamp(randNorm(sbBase, 0.05), 0, 0.6));
    const CS = Math.round(SB * clamp(randNorm(0.25, 0.08), 0.1, 0.5));

    // 삼진
    const soBase = real.SO && real.PA ? real.SO / real.PA : clamp(0.25 - contactR * 0.15, 0.08, 0.35);
    const SO = Math.round(PA * clamp(randNorm(soBase * (1 - sv * 0.3), 0.025), 0.05, 0.40));

    // 비율 스탯
    const OBP = PA > 0 ? (H + BB + HBP) / PA : 0;
    const TB = singles + doubles * 2 + triples * 3 + HR * 4;
    const calcSLG = AB > 0 ? TB / AB : 0;
    const OPS = OBP + calcSLG;

    // wRC+ — OPS 기반이지만 변동폭 확대
    const wrcPlus = clamp(randNorm(OPS * 140 - 5, 15), 20, 230);

    // WAR — 분산 확대, 엘리트는 7+ 가능
    const dWAR = real.dWAR != null ? real.dWAR * seasonPct * (1 + sv * 0.3) : randNorm(0, 0.5) * seasonPct;
    const oWAR = clamp((wrcPlus - 95) / 15 * seasonPct * 3.5, -3, 10);
    const WAR = clamp(oWAR + dWAR, -4, 14);

    return {
        G, PA, AB, H, '2B': doubles, '3B': triples, HR, RBI, R,
        SB, CS, BB, HBP, SO, SF,
        AVG: Math.round((AB > 0 ? H / AB : 0) * 1000) / 1000,
        OBP: Math.round(OBP * 1000) / 1000,
        SLG: Math.round(calcSLG * 1000) / 1000,
        OPS: Math.round(OPS * 1000) / 1000,
        'wRC+': Math.round(wrcPlus * 10) / 10,
        IsoP: Math.round(Math.max(0, calcSLG - (AB > 0 ? H / AB : 0)) * 1000) / 1000,
        WAR: Math.round(WAR * 100) / 100,
        oWAR: Math.round(oWAR * 100) / 100,
        dWAR: Math.round(dWAR * 100) / 100,
    };
}

/**
 * 투수 simStats 생성 — 승수 현실화 + 시즌 변동
 */
function generatePitcherSimStats(p, totalGames, seasonPct, teamW, teamL) {
    const r = p.ratings || {};
    const real = p.realStats || {};
    const ovr = p.ovr || 50;
    const role = p.role || '중계';
    const sv = getSeasonVariance(p.id);

    let G, GS, IP;
    if (role === '선발') {
        GS = Math.round(totalGames / 5 * clamp(randNorm(0.92, 0.04), 0.75, 1.0));
        G = GS;
        // 에이스는 이닝 더 많이 — OVR 반영 강화
        const ipPerStart = clamp(randNorm(5.8 + (ovr - 50) * 0.04, 0.5), 4.5, 7.5);
        IP = Math.round(GS * ipPerStart * (1 + sv * 0.1) * 10) / 10;
    } else if (role === '마무리') {
        G = Math.round(totalGames * clamp(randNorm(0.42, 0.05), 0.25, 0.55));
        GS = 0;
        IP = Math.round(G * clamp(randNorm(1.0, 0.15), 0.7, 1.3) * 10) / 10;
    } else {
        const reliefRate = ovr >= 55 ? 0.48 : ovr >= 45 ? 0.35 : 0.2;
        G = Math.round(totalGames * clamp(randNorm(reliefRate, 0.06), 0.1, 0.58));
        GS = 0;
        IP = Math.round(G * clamp(randNorm(1.1, 0.2), 0.6, 2.0) * 10) / 10;
    }

    if (G <= 0 || IP <= 0) return null;

    // ERA — 시즌 변동 강하게 적용 (에이스 커리어하이 / 부진 가능)
    const ratingERA = clamp(6.5 - ovr * 0.07, 1.5, 8.5);
    const baseERA = real.ERA ? real.ERA * 0.3 + ratingERA * 0.7 : ratingERA; // 70% 랜덤
    const ERA = clamp(randNorm(baseERA * (1 - sv * 0.8), 0.6), 0.80, 10.0);

    // WHIP
    const ratingWHIP = clamp(2.0 - ovr * 0.014, 0.80, 2.3);
    const baseWHIP = real.WHIP ? real.WHIP * 0.3 + ratingWHIP * 0.7 : ratingWHIP;
    const WHIP = clamp(randNorm(baseWHIP * (1 - sv * 0.5), 0.12), 0.65, 2.60);

    const hPerIP = WHIP * 0.7;
    const bbPerIP = WHIP * 0.3;
    const H = Math.round(IP * hPerIP);
    const BB = Math.round(IP * bbPerIP);
    const HBP = Math.round(IP * clamp(randNorm(0.04, 0.015), 0, 0.1));

    // 삼진
    const ratingK9 = clamp(4 + ovr * 0.12, 3, 15);
    const baseK9 = real.SO && real.IP ? real.SO / real.IP * 9 * 0.3 + ratingK9 * 0.7 : ratingK9;
    const SO = Math.round(IP * clamp(randNorm(baseK9 * (1 + sv * 0.4) / 9, 0.12), 0.3, 1.8));

    // 피홈런
    const hrBase = real.HR && real.IP ? real.HR / real.IP * 0.3 + (0.10 - ovr * 0.0008) * 0.7 : 0.10 - ovr * 0.0008;
    const HR = Math.round(IP * clamp(randNorm(hrBase, 0.025), 0.02, 0.22));

    const ER = Math.round(IP * ERA / 9);
    const R = ER + Math.round(ER * clamp(randNorm(0.1, 0.05), 0, 0.3));

    // ── 승패 현실화 ──
    const teamTotal = teamW + teamL || 1;
    const teamWinRate = teamW / teamTotal;
    let W = 0, L = 0, S = 0, HLD = 0;
    if (role === '선발') {
        // KBO 에이스: 144경기 시 약 28~30 선발, 결정률 75%, 개인 ERA 반영
        const decisions = Math.round(GS * clamp(randNorm(0.75, 0.05), 0.60, 0.85));
        // 개인 ERA가 낮을수록 승률 높음 (팀 승률 + 개인 보정)
        const personalWinRate = clamp(
            teamWinRate * 0.6 + (1 - ERA / 7) * 0.4 + (ovr - 50) * 0.004,
            0.25, 0.80
        );
        W = Math.round(decisions * personalWinRate);
        L = decisions - W;
        // 에이스 보너스: ERA < 3.0 이면 추가 승수
        if (ERA < 3.0 && sv > 0) W = Math.round(W * 1.1);
    } else if (role === '마무리') {
        S = Math.round(G * clamp(teamWinRate * 0.75 + sv * 0.1, 0.15, 0.70));
        W = Math.round(G * clamp(randNorm(0.06, 0.02), 0.02, 0.12));
        L = Math.round(G * clamp(randNorm(0.06, 0.02), 0.02, 0.12));
    } else {
        HLD = Math.round(G * clamp(teamWinRate * 0.35 + sv * 0.05, 0.05, 0.45));
        W = Math.round(G * clamp(randNorm(0.07, 0.02), 0.02, 0.14));
        L = Math.round(G * clamp(randNorm(0.06, 0.02), 0.02, 0.12));
    }

    // FIP
    const FIP = clamp((13 * HR + 3 * BB - 2 * SO) / Math.max(IP, 1) + 3.2, 1.0, 9.0);
    const BABIP = clamp(randNorm(0.300, 0.025), 0.230, 0.390);

    // WAR — 분산 확대, 에이스는 8+ 가능
    const WAR = role === '선발'
        ? clamp((4.8 - ERA) * IP / 160 * 6.5 * (1 + sv * 0.3), -3, 12)
        : clamp((3.8 - ERA) * IP / 65 * 2.5 * (1 + sv * 0.3), -1.5, 6);

    return {
        G, GS, W, L, S, HLD, IP,
        H, HR, BB, HBP, SO, ER, R,
        ERA: Math.round(ERA * 100) / 100,
        WHIP: Math.round(WHIP * 100) / 100,
        FIP: Math.round(FIP * 100) / 100,
        WAR: Math.round(WAR * 100) / 100,
        BABIP: Math.round(BABIP * 1000) / 1000,
    };
}

/**
 * AI 팀 1/2군 교체 — 시뮬레이션 배치마다 실행
 * 부진한 선수 강등, 유망주 승격
 */
function aiRosterShuffle(state) {
    const teamCodes = Object.keys(state.teams);
    for (const code of teamCodes) {
        const team = state.teams[code];
        // 학생 팀은 건드리지 않음
        if (typeof session !== 'undefined' && session.teamCode === code) continue;

        const roster1 = team.roster || [];
        const roster2 = team.futuresRoster || [];
        if (roster2.length === 0) continue;

        // 1군에서 가장 부진한 타자 찾기 (simStats 기준)
        const batters1 = roster1.map(id => state.players[id]).filter(p => p && p.position !== 'P' && p.simStats);
        const pitchers1 = roster1.map(id => state.players[id]).filter(p => p && p.position === 'P' && p.simStats);

        // 2군에서 유망주 찾기
        const prospects2 = roster2.map(id => state.players[id]).filter(p => p && p.ovr >= 40);

        // 10% 확률로 교체 시도 (매 배치마다)
        if (Math.random() > 0.10) continue;

        // 부진 타자 교체
        if (batters1.length > 0 && prospects2.filter(p => p.position !== 'P').length > 0) {
            const worst = batters1.filter(b => !b.isForeign).sort((a, b) => (a.simStats.OPS || 0) - (b.simStats.OPS || 0))[0];
            const bestProspect = prospects2.filter(p => p.position !== 'P').sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0];
            if (worst && bestProspect && (worst.simStats.OPS || 0) < 0.550 && bestProspect.ovr >= worst.ovr - 5) {
                // 교체 실행
                const idx1 = roster1.indexOf(worst.id);
                const idx2 = roster2.indexOf(bestProspect.id);
                if (idx1 >= 0 && idx2 >= 0) {
                    roster1[idx1] = bestProspect.id;
                    roster2[idx2] = worst.id;
                    bestProspect.team = code;
                }
            }
        }

        // 부진 투수 교체
        if (pitchers1.length > 0 && prospects2.filter(p => p.position === 'P').length > 0) {
            const worstP = pitchers1.filter(p => !p.isForeign && p.role !== '마무리').sort((a, b) => (b.simStats.ERA || 99) - (a.simStats.ERA || 99))[0];
            const bestPProspect = prospects2.filter(p => p.position === 'P').sort((a, b) => (b.ovr || 0) - (a.ovr || 0))[0];
            if (worstP && bestPProspect && (worstP.simStats.ERA || 99) > 6.0 && bestPProspect.ovr >= worstP.ovr - 5) {
                const idx1 = roster1.indexOf(worstP.id);
                const idx2 = roster2.indexOf(bestPProspect.id);
                if (idx1 >= 0 && idx2 >= 0) {
                    roster1[idx1] = bestPProspect.id;
                    roster2[idx2] = worstP.id;
                    bestPProspect.team = code;
                }
            }
        }
    }
}

window.simulateQuarter = simulateQuarter;
window.simulateBatch = simulateBatch;
window.updateAllSimStats = updateAllSimStats;
window.aiRosterShuffle = aiRosterShuffle;
window.getTotalGamesPlayed = getTotalGamesPlayed;
window.getStandings = getStandings;
window.getCurrentQuarter = getCurrentQuarter;
window.getCompletedQuarters = getCompletedQuarters;
window.delay = delay;
