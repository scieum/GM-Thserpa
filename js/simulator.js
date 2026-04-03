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
 * 타자 simStats 생성
 * ratings(contact, power, eye, speed, defense)와 realStats 기반
 */
function generateBatterSimStats(p, totalGames, seasonPct) {
    const r = p.ratings || {};
    const real = p.realStats || {};
    const ovr = p.ovr || 50;

    // 출전 경기 — OVR 높을수록 많이 출전 (주전 vs 백업)
    const playRate = ovr >= 55 ? clamp(0.85 + (ovr - 55) * 0.005, 0.85, 0.98) :
                     ovr >= 45 ? clamp(0.5 + (ovr - 45) * 0.035, 0.5, 0.85) :
                     clamp(0.2 + (ovr - 20) * 0.012, 0.15, 0.5);
    const G = Math.round(totalGames * playRate);
    if (G <= 0) return null;

    // 타석수 — 경기당 약 3.5~4.5 PA
    const paPerGame = clamp(randNorm(4.0, 0.3), 3.3, 4.7);
    const PA = Math.round(G * paPerGame);

    // realStats 기반 비율 (있으면 참고, 없으면 ratings 기반 추정)
    const contactR = (r.contact || 50) / 100;
    const powerR = (r.power || 50) / 100;
    const eyeR = (r.eye || 50) / 100;
    const speedR = (r.speed || 50) / 100;

    // 볼넷률 (BB/PA): eye 기반
    const bbRate = real.BB && real.PA ? real.BB / real.PA :
                   clamp(0.04 + eyeR * 0.12, 0.03, 0.18);
    const BB = Math.round(PA * clamp(randNorm(bbRate, 0.01), 0.02, 0.20));
    const HBP = Math.round(PA * clamp(randNorm(0.008, 0.003), 0, 0.02));
    const SF = Math.round(PA * 0.005);
    const SH = 0;
    const AB = PA - BB - HBP - SF - SH;

    // 타율: contact 기반 + realStats 참고
    const baseAVG = real.AVG || (0.200 + contactR * 0.15);
    const AVG = clamp(randNorm(baseAVG, 0.015), 0.150, 0.380);
    const H = Math.round(AB * AVG);

    // 장타: power 기반
    const baseISO = real.IsoP || (0.05 + powerR * 0.25);
    const ISO = clamp(randNorm(baseISO, 0.02), 0.02, 0.35);
    const SLG = clamp(AVG + ISO, AVG, 0.700);

    // 홈런
    const hrRate = real.HR && real.AB ? real.HR / real.AB :
                   clamp(0.005 + powerR * 0.05, 0.002, 0.06);
    const HR = Math.round(AB * clamp(randNorm(hrRate, 0.005), 0, 0.07));

    // 2루타, 3루타
    const doubles = Math.round(H * clamp(randNorm(0.22, 0.03), 0.12, 0.35));
    const triples = Math.round(H * clamp(randNorm(0.015 + speedR * 0.02, 0.005), 0, 0.05));
    const singles = Math.max(0, H - HR - doubles - triples);

    // 타점, 득점
    const RBI = Math.round(clamp(HR * 2.5 + (H - HR) * 0.35 + BB * 0.1, 0, PA * 0.25));
    const R = Math.round(clamp(H * 0.35 + BB * 0.3 + HR * 0.5, 0, PA * 0.2));

    // 도루
    const sbRate = real.SB && real.G ? real.SB / real.G :
                   clamp(speedR * 0.3, 0, 0.3);
    const SB = Math.round(G * clamp(randNorm(sbRate, 0.03), 0, 0.5));
    const CS = Math.round(SB * clamp(randNorm(0.25, 0.08), 0.1, 0.5));

    // 삼진
    const soRate = real.SO && real.PA ? real.SO / real.PA :
                   clamp(0.25 - contactR * 0.15, 0.08, 0.35);
    const SO = Math.round(PA * clamp(randNorm(soRate, 0.02), 0.05, 0.40));

    // 비율 스탯
    const OBP = PA > 0 ? (H + BB + HBP) / PA : 0;
    const TB = singles + doubles * 2 + triples * 3 + HR * 4;
    const realSLG = AB > 0 ? TB / AB : 0;
    const OPS = OBP + realSLG;
    const wrcPlus = clamp(randNorm(OPS * 130, 10), 30, 220);
    const dWAR = real.dWAR != null ? real.dWAR * seasonPct : 0;
    const oWAR = clamp((wrcPlus - 100) / 20 * seasonPct * 2.5, -2, 8);
    const WAR = clamp(oWAR + dWAR, -3, 12);

    return {
        G, PA, AB, H, '2B': doubles, '3B': triples, HR, RBI, R,
        SB, CS, BB, HBP, SO, SF,
        AVG: Math.round(AVG * 1000) / 1000,
        OBP: Math.round(OBP * 1000) / 1000,
        SLG: Math.round(realSLG * 1000) / 1000,
        OPS: Math.round((OBP + realSLG) * 1000) / 1000,
        'wRC+': Math.round(wrcPlus * 10) / 10,
        IsoP: Math.round((realSLG - AVG) * 1000) / 1000,
        WAR: Math.round(WAR * 100) / 100,
        oWAR: Math.round(oWAR * 100) / 100,
        dWAR: Math.round(dWAR * 100) / 100,
    };
}

/**
 * 투수 simStats 생성
 * ratings(stuff, command, stamina, effectiveness, consistency)와 realStats 기반
 */
function generatePitcherSimStats(p, totalGames, seasonPct, teamW, teamL) {
    const r = p.ratings || {};
    const real = p.realStats || {};
    const ovr = p.ovr || 50;
    const role = p.role || '중계';

    // 선발: 5경기마다 1등판, 중계: 2-3경기마다 1등판, 마무리: 세이브 상황
    let G, GS, IP;
    if (role === '선발') {
        GS = Math.round(totalGames / 5 * clamp(randNorm(0.9, 0.05), 0.7, 1.0));
        G = GS;
        const ipPerStart = clamp(randNorm(5.5 + (ovr - 50) * 0.03, 0.5), 4.0, 7.5);
        IP = Math.round(GS * ipPerStart * 10) / 10;
    } else if (role === '마무리') {
        G = Math.round(totalGames * clamp(randNorm(0.4, 0.05), 0.25, 0.55));
        GS = 0;
        IP = Math.round(G * clamp(randNorm(1.0, 0.15), 0.7, 1.3) * 10) / 10;
    } else { // 중계
        const reliefRate = ovr >= 55 ? 0.45 : ovr >= 45 ? 0.35 : 0.2;
        G = Math.round(totalGames * clamp(randNorm(reliefRate, 0.05), 0.1, 0.55));
        GS = 0;
        IP = Math.round(G * clamp(randNorm(1.1, 0.2), 0.6, 2.0) * 10) / 10;
    }

    if (G <= 0 || IP <= 0) return null;

    // ERA: OVR 기반 + realStats 참고
    const baseERA = real.ERA || clamp(6.5 - ovr * 0.065, 1.5, 8.0);
    const ERA = clamp(randNorm(baseERA, 0.4), 1.0, 9.0);

    // 이닝당 안타+볼넷 (WHIP)
    const baseWHIP = real.WHIP || clamp(2.0 - ovr * 0.012, 0.85, 2.2);
    const WHIP = clamp(randNorm(baseWHIP, 0.1), 0.70, 2.50);

    // 피안타, 볼넷
    const hPerIP = WHIP * 0.7;
    const bbPerIP = WHIP * 0.3;
    const H = Math.round(IP * hPerIP);
    const BB = Math.round(IP * bbPerIP);
    const HBP = Math.round(IP * clamp(randNorm(0.04, 0.015), 0, 0.1));

    // 삼진
    const baseSO9 = real.SO && real.IP ? real.SO / real.IP * 9 :
                    clamp(4 + ovr * 0.1, 3, 14);
    const SO = Math.round(IP * clamp(randNorm(baseSO9 / 9, 0.1), 0.3, 1.6));

    // 피홈런
    const hrRate = real.HR && real.IP ? real.HR / real.IP :
                   clamp(0.15 - ovr * 0.001, 0.03, 0.20);
    const HR = Math.round(IP * clamp(randNorm(hrRate, 0.02), 0.02, 0.25));

    // 자책점
    const ER = Math.round(IP * ERA / 9);
    const R = ER + Math.round(ER * clamp(randNorm(0.1, 0.05), 0, 0.3));

    // 승패 — 팀 승률에 비례, 선발만 승수 가능
    const teamTotal = teamW + teamL || 1;
    const teamWinRate = teamW / teamTotal;
    let W = 0, L = 0, S = 0, HLD = 0;
    if (role === '선발') {
        const decisions = Math.round(GS * 0.65);
        W = Math.round(decisions * clamp(teamWinRate + (ovr - 50) * 0.005, 0.2, 0.85));
        L = decisions - W;
    } else if (role === '마무리') {
        S = Math.round(G * clamp(teamWinRate * 0.7, 0.15, 0.65));
        W = Math.round(G * 0.05);
        L = Math.round(G * 0.08);
    } else {
        HLD = Math.round(G * clamp(teamWinRate * 0.3, 0.05, 0.4));
        W = Math.round(G * 0.06);
        L = Math.round(G * 0.05);
    }

    // FIP
    const FIP = real.FIP || clamp((13 * HR + 3 * BB - 2 * SO) / Math.max(IP, 1) + 3.2, 1.5, 8.0);
    // BABIP
    const BABIP = clamp(randNorm(0.300, 0.02), 0.240, 0.380);
    // WAR
    const WAR = role === '선발'
        ? clamp((4.5 - ERA) * IP / 180 * 5, -2, 10)
        : clamp((3.8 - ERA) * IP / 70 * 2, -1, 5);

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

window.simulateQuarter = simulateQuarter;
window.simulateBatch = simulateBatch;
window.updateAllSimStats = updateAllSimStats;
window.getTotalGamesPlayed = getTotalGamesPlayed;
window.getStandings = getStandings;
window.getCurrentQuarter = getCurrentQuarter;
window.getCompletedQuarters = getCompletedQuarters;
window.delay = delay;
