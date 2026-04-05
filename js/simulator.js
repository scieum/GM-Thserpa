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

// 5경기 단위 시뮬레이션 — 실제 일정(KBO_SCHEDULE_2026) 기반
async function simulateBatch(state, batchSize, onProgress) {
    const teamCodes = Object.keys(state.teams);

    // 게임 로그 초기화
    if (!state.gameLog) state.gameLog = [];

    // 팀별 전력 사전 계산
    const teamPower = {};
    for (const code of teamCodes) {
        const pp = calcTeamPitchPower(state, code);
        const bp = calcTeamBatPower(state, code);
        teamPower[code] = { pitch: pp, bat: bp, total: pp * 0.5 + bp * 0.5 };
    }

    const DRAW_RATE = 0.03;
    const schedule = (typeof KBO_SCHEDULE_2026 !== 'undefined') ? KBO_SCHEDULE_2026 : null;

    for (let game = 1; game <= batchSize; game++) {
        const totalPlayed = getTotalGamesPlayed(state);
        const q = Math.min(4, Math.floor(totalPlayed / 36) + 1);
        const qKey = `q${q}`;
        const dayIdx = totalPlayed; // 현재 경기일 인덱스

        // 실제 일정에서 매치업 가져오기
        let matches = [];
        if (schedule && schedule[dayIdx] && schedule[dayIdx].g) {
            matches = schedule[dayIdx].g.map(g => ({
                home: g.h, away: g.a,
                date: schedule[dayIdx].d, time: g.t, stadium: g.s
            }));
        }

        // 일정이 없으면 랜덤 매치업 폴백
        if (matches.length === 0) {
            const shuffled = [...teamCodes].sort(() => Math.random() - 0.5);
            for (let m = 0; m < 5; m++) {
                matches.push({ home: shuffled[m*2], away: shuffled[m*2+1], date: '', time: '', stadium: '' });
            }
        }

        // 각 매치 시뮬레이션
        for (const match of matches) {
            const { home, away } = match;
            if (!state.teams[home] || !state.teams[away]) continue;

            const homePwr = teamPower[home]?.total || 50;
            const awayPwr = teamPower[away]?.total || 50;
            const homeExpR = 4.5 * (homePwr / 50) * 1.04;
            const awayExpR = 4.5 * (awayPwr / 50);
            const homeRuns = poissonRandom(Math.max(0.5, homeExpR));
            const awayRuns = poissonRandom(Math.max(0.5, awayExpR));

            let result, winner = null;
            if (homeRuns === awayRuns && Math.random() < DRAW_RATE) {
                result = 'draw';
                state.teams[home].seasonRecord[qKey].draws = (state.teams[home].seasonRecord[qKey].draws || 0) + 1;
                state.teams[away].seasonRecord[qKey].draws = (state.teams[away].seasonRecord[qKey].draws || 0) + 1;
            } else {
                if (homeRuns !== awayRuns) {
                    winner = homeRuns > awayRuns ? home : away;
                } else {
                    const homeProb = homePwr / (homePwr + awayPwr);
                    winner = Math.random() < homeProb ? home : away;
                }
                const loser = winner === home ? away : home;
                state.teams[winner].seasonRecord[qKey].wins++;
                state.teams[loser].seasonRecord[qKey].losses++;
                result = winner === home ? 'home' : 'away';
            }

            state.teams[home].seasonRecord[qKey].rs = (state.teams[home].seasonRecord[qKey].rs || 0) + homeRuns;
            state.teams[home].seasonRecord[qKey].ra = (state.teams[home].seasonRecord[qKey].ra || 0) + awayRuns;
            state.teams[away].seasonRecord[qKey].rs = (state.teams[away].seasonRecord[qKey].rs || 0) + awayRuns;
            state.teams[away].seasonRecord[qKey].ra = (state.teams[away].seasonRecord[qKey].ra || 0) + homeRuns;

            // 이닝별 스코어 + 팀 상세 통계 생성
            const homeInnings = distributeRunsToInnings(homeRuns);
            const awayInnings = distributeRunsToInnings(awayRuns);
            const homeDetail = generateGameTeamStats(state, home, homeRuns);
            const awayDetail = generateGameTeamStats(state, away, awayRuns);

            // 게임 로그 저장
            state.gameLog.push({
                day: dayIdx + 1,
                date: match.date,
                time: match.time,
                stadium: match.stadium,
                home, away,
                homeRuns, awayRuns,
                homeHits: homeDetail.H, awayHits: awayDetail.H,
                homeErrors: homeDetail.E, awayErrors: awayDetail.E,
                homeInnings, awayInnings,
                homeDetail, awayDetail,
                winner,
                result,
                quarter: q,
            });
        }

        if (onProgress) onProgress(game, batchSize);
        await delay(30);
    }

    // 부상 발생 & 복귀
    processInjuries(state);

    // AI 팀 1/2군 교체
    aiRosterShuffle(state);

    // 개인 선수 시즌 스탯 갱신
    updateAllSimStats(state);

    return getStandings(state);
}

/** 경기별 팀 상세 통계 생성 (안타/홈런/삼진/도루/에러 + 승리투수/패전투수) */
function generateGameTeamStats(state, teamCode, runs) {
    const team = state.teams[teamCode];
    const batPower = (team ? calcTeamBatPower(state, teamCode) : 50) / 50;
    const pitPower = (team ? calcTeamPitchPower(state, teamCode) : 50) / 50;

    const H = Math.max(runs, Math.round(runs * 1.5 + Math.random() * 4 + 2));
    const HR = Math.floor(Math.random() * (runs > 3 ? 3 : 2));
    const doubles = Math.floor(Math.random() * Math.min(H - HR, 4));
    const BB = Math.round(2 + Math.random() * 4);
    const SO = Math.round(4 + Math.random() * 6);
    const SB = Math.random() < 0.3 ? Math.floor(1 + Math.random() * 2) : 0;
    const E = Math.random() < 0.25 ? 1 : (Math.random() < 0.05 ? 2 : 0);
    const DP = Math.random() < 0.3 ? 1 : 0;

    // 선발투수 정보
    const pitchers = team ? team.roster.map(id => state.players[id]).filter(p => p && p.position === 'P') : [];
    const starters = pitchers.filter(p => p.role === '선발').sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
    const relievers = pitchers.filter(p => p.role === '중계' || p.role === '마무리');
    const sp = starters.length > 0 ? starters[Math.floor(Math.random() * Math.min(5, starters.length))] : null;
    const spIP = roundIP(5 + Math.random() * 2);
    const spER = Math.floor(runs * (0.3 + Math.random() * 0.4));
    const rpCount = Math.floor(1 + Math.random() * 3);

    return {
        H, HR, '2B': doubles, BB, SO, SB, E, DP, runs,
        sp: sp ? { name: sp.name, id: sp.id, IP: spIP, H: Math.round(H * 0.6), ER: spER, SO: Math.round(SO * 0.5) } : null,
        rpCount,
    };
}

/** 총 득점을 9이닝에 랜덤 분배 */
function distributeRunsToInnings(totalRuns) {
    const innings = new Array(9).fill(0);
    for (let r = 0; r < totalRuns; r++) {
        innings[Math.floor(Math.random() * 9)]++;
    }
    return innings;
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

    const seasonPct = totalGames / 144;
    const teamCodes = Object.keys(state.teams);

    for (const code of teamCodes) {
        const team = state.teams[code];
        const record = getTeamTotalRecord(team);
        const teamWins = record.wins;
        const teamLosses = record.losses;

        // 1) 타자 simStats 생성 — 선수별 시드 RNG 사용
        for (const pid of team.roster) {
            const p = state.players[pid];
            if (!p || p.position === 'P') continue;
            _currentRng = createSeededRng(hashStr(pid + '_bat_' + totalGames));
            p.simStats = generateBatterSimStats(p, totalGames, seasonPct);
        }

        // 2) 투수 simStats 생성 (승/패는 배분 함수에서 처리)
        const pitcherList = [];
        for (const pid of team.roster) {
            const p = state.players[pid];
            if (!p || p.position !== 'P') continue;
            _currentRng = createSeededRng(hashStr(pid + '_pit_' + totalGames));
            p.simStats = generatePitcherSimStats(p, totalGames, seasonPct, teamWins, teamLosses);
            if (p.simStats) pitcherList.push(p);
        }

        // 3) 팀 승/패를 투수들에게 배분 (개인 승/패 합 = 팀 승/패)
        distributePitcherWinLoss(pitcherList, teamWins, teamLosses);
    }

    // RNG 복원 (시뮬레이션 대전은 Math.random 사용)
    _currentRng = Math.random;
}

/**
 * 팀 승/패를 투수들에게 배분
 * 선발: GS × ERA 역수 비례로 승 배분, GS × ERA 비례로 패 배분
 * 불펜: 잔여 승/패를 등판수 비례로 배분
 */
function distributePitcherWinLoss(pitchers, teamW, teamL) {
    if (!pitchers.length || (teamW + teamL) === 0) return;
    // 팀 코드 기반 시드로 배분 결과도 결정론적
    const teamSeed = pitchers[0]?.team || 'X';
    _currentRng = createSeededRng(hashStr(teamSeed + '_wl_' + teamW + '_' + teamL));

    const starters = pitchers.filter(p => p.role === '선발' && p.simStats);
    const closers = pitchers.filter(p => p.role === '마무리' && p.simStats);
    const relievers = pitchers.filter(p => p.role === '중계' && p.simStats);

    // 모든 투수 W/L/S/HLD 초기화
    for (const p of pitchers) {
        if (p.simStats) { p.simStats.W = 0; p.simStats.L = 0; p.simStats.S = 0; p.simStats.HLD = 0; }
    }

    // ── 선발 승/패 배분 (팀 승의 약 70~80%, 팀 패의 약 75~85%) ──
    const starterWinShare = clamp(0.75 + randNorm(0, 0.03), 0.65, 0.85);
    const starterLossShare = clamp(0.80 + randNorm(0, 0.03), 0.70, 0.90);
    let starterWins = Math.round(teamW * starterWinShare);
    let starterLosses = Math.round(teamL * starterLossShare);

    if (starters.length > 0) {
        const wWeights = starters.map(p => {
            const gs = p.simStats.GS || 1;
            const era = p.simStats.ERA || 4.5;
            const sv = getSeasonVariance(p.id);
            return gs * (1 / Math.max(era, 0.5)) * (1 + sv * 0.5);
        });
        const wTotal = wWeights.reduce((s, w) => s + w, 0) || 1;

        const lWeights = starters.map(p => {
            const gs = p.simStats.GS || 1;
            const era = p.simStats.ERA || 4.5;
            return gs * Math.max(era, 0.5);
        });
        const lTotal = lWeights.reduce((s, w) => s + w, 0) || 1;

        let wLeft = starterWins, lLeft = starterLosses;
        for (let i = 0; i < starters.length; i++) {
            const p = starters[i];
            const gs = p.simStats.GS || 0;
            const g = p.simStats.G || 0;
            if (i === starters.length - 1) {
                p.simStats.W = Math.min(Math.max(0, wLeft), gs);
                p.simStats.L = Math.min(Math.max(0, lLeft), gs - p.simStats.W);
            } else {
                p.simStats.W = Math.min(Math.round(starterWins * wWeights[i] / wTotal), gs);
                p.simStats.L = Math.min(Math.round(starterLosses * lWeights[i] / lTotal), gs - p.simStats.W);
                wLeft -= p.simStats.W;
                lLeft -= p.simStats.L;
            }
        }
        // 상한 초과분 재계산
        starterWins = starters.reduce((s, p) => s + p.simStats.W, 0);
        starterLosses = starters.reduce((s, p) => s + p.simStats.L, 0);
    }

    // ── 불펜 승/패 배분 (잔여분) ──
    let bullpenWins = Math.max(0, teamW - starterWins);
    let bullpenLosses = Math.max(0, teamL - starterLosses);

    const bullpen = [...closers, ...relievers];
    if (bullpen.length > 0) {
        const bWeights = bullpen.map(p => p.simStats?.G || 1);
        const bTotal = bWeights.reduce((s, w) => s + w, 0) || 1;
        let bwLeft = bullpenWins, blLeft = bullpenLosses;
        for (let i = 0; i < bullpen.length; i++) {
            const p = bullpen[i];
            const g = p.simStats?.G || 0;
            if (i === bullpen.length - 1) {
                p.simStats.W = Math.min(Math.max(0, bwLeft), g);
                p.simStats.L = Math.min(Math.max(0, blLeft), g - p.simStats.W);
            } else {
                p.simStats.W = Math.min(Math.round(bullpenWins * bWeights[i] / bTotal), g);
                p.simStats.L = Math.min(Math.round(bullpenLosses * bWeights[i] / bTotal), g - p.simStats.W);
                bwLeft -= p.simStats.W;
                blLeft -= p.simStats.L;
            }
        }
    }

    // ── 세이브: 마무리 투수에게 팀 승의 약 35~45% ──
    if (closers.length > 0) {
        const teamWinRate = teamW / Math.max(teamW + teamL, 1);
        const totalSaves = Math.round(teamW * clamp(randNorm(0.40, 0.05), 0.25, 0.55));
        const cWeights = closers.map(p => p.simStats?.G || 1);
        const cTotal = cWeights.reduce((s, w) => s + w, 0) || 1;
        let sLeft = totalSaves;
        for (let i = 0; i < closers.length; i++) {
            const g = closers[i].simStats?.G || 0;
            if (i === closers.length - 1) {
                closers[i].simStats.S = Math.min(Math.max(0, sLeft), g);
            } else {
                closers[i].simStats.S = Math.min(Math.round(totalSaves * cWeights[i] / cTotal), g);
                sLeft -= closers[i].simStats.S;
            }
        }
    }

    // ── 홀드: 중계 투수에게 등판수 비례 ──
    if (relievers.length > 0) {
        const teamWinRate = teamW / Math.max(teamW + teamL, 1);
        const totalHolds = Math.round(teamW * clamp(randNorm(0.50, 0.08), 0.30, 0.70));
        const hWeights = relievers.map(p => p.simStats?.G || 1);
        const hTotal = hWeights.reduce((s, w) => s + w, 0) || 1;
        let hLeft = totalHolds;
        for (let i = 0; i < relievers.length; i++) {
            const g = relievers[i].simStats?.G || 0;
            if (i === relievers.length - 1) {
                relievers[i].simStats.HLD = Math.min(Math.max(0, hLeft), g);
            } else {
                relievers[i].simStats.HLD = Math.min(Math.round(totalHolds * hWeights[i] / hTotal), g);
                hLeft -= relievers[i].simStats.HLD;
            }
        }
    }
}

// ══════════════════════════════════════════
// ── 결정론적 시드 난수 (교사-학생 동일 결과 보장) ──
// ══════════════════════════════════════════

/** 문자열 → 32비트 해시 */
function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h >>> 0;
}

/** 시드 기반 PRNG (Mulberry32) — 0~1 사이 값 반환 */
function createSeededRng(seed) {
    let t = seed >>> 0;
    return function() {
        t = (t + 0x6D2B79F5) | 0;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

/** 현재 스탯 생성에 사용할 시드 RNG — 선수별로 결정론적 */
let _currentRng = Math.random;

/** 시드 기반 정규분포 */
function randNorm(mean, sd) {
    const u1 = _currentRng(), u2 = _currentRng();
    return mean + sd * Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** IP를 야구식 1/3 단위로 반올림: 5.0, 5.1(1/3), 5.2(2/3) */
function roundIP(rawIP) {
    const full = Math.floor(rawIP);
    const frac = rawIP - full;
    const thirds = Math.round(frac * 3);
    return thirds >= 3 ? full + 1 : full + thirds / 10;
}

/**
 * 시즌 변동 팩터 — 브레이크아웃(+15%) / 슬럼프(-15%) / 평년
 * 선수 ID 기반 시드로 교사-학생 동일 값 보장
 */
function getSeasonVariance(playerId) {
    if (!window._seasonVarCache) window._seasonVarCache = {};
    if (window._seasonVarCache[playerId] != null) return window._seasonVarCache[playerId];
    // 선수 ID로 시드 고정
    const rng = createSeededRng(hashStr('sv_' + playerId));
    const roll = rng();
    // 임시로 rng 사용
    const oldRng = _currentRng;
    _currentRng = rng;
    const v = roll < 0.20 ? randNorm(0.12, 0.04) :
              roll < 0.40 ? randNorm(-0.10, 0.04) :
              randNorm(0, 0.03);
    _currentRng = oldRng;
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
        IP = roundIP(GS * ipPerStart * (1 + sv * 0.1));
    } else if (role === '마무리') {
        G = Math.round(totalGames * clamp(randNorm(0.42, 0.05), 0.25, 0.55));
        GS = 0;
        IP = roundIP(G * clamp(randNorm(1.0, 0.15), 0.7, 1.3));
    } else {
        const reliefRate = ovr >= 55 ? 0.48 : ovr >= 45 ? 0.35 : 0.2;
        G = Math.round(totalGames * clamp(randNorm(reliefRate, 0.06), 0.1, 0.58));
        GS = 0;
        IP = roundIP(G * clamp(randNorm(1.1, 0.2), 0.6, 2.0));
    }

    if (G <= 0 || IP <= 0) return null;

    // 피안타율 (H/IP 비율) — OVR 기반
    const ratingH9 = clamp(10.5 - ovr * 0.06, 6, 13);
    const baseH9 = real.H && real.IP ? real.H / real.IP * 9 * 0.3 + ratingH9 * 0.7 : ratingH9;
    const H = Math.round(IP * clamp(randNorm(baseH9 * (1 - sv * 0.3) / 9, 0.08), 0.5, 1.6));

    // 볼넷
    const ratingBB9 = clamp(4.5 - ovr * 0.04, 1.5, 6);
    const baseBB9 = real.BB && real.IP ? real.BB / real.IP * 9 * 0.3 + ratingBB9 * 0.7 : ratingBB9;
    const BB = Math.round(IP * clamp(randNorm(baseBB9 * (1 - sv * 0.2) / 9, 0.04), 0.1, 0.8));
    const HBP = Math.round(IP * clamp(randNorm(0.04, 0.015), 0, 0.1));

    // 삼진
    const ratingK9 = clamp(4 + ovr * 0.12, 3, 15);
    const baseK9 = real.SO && real.IP ? real.SO / real.IP * 9 * 0.3 + ratingK9 * 0.7 : ratingK9;
    const SO = Math.round(IP * clamp(randNorm(baseK9 * (1 + sv * 0.4) / 9, 0.12), 0.3, 1.8));

    // 피홈런
    const hrBase = real.HR && real.IP ? real.HR / real.IP * 0.3 + (0.10 - ovr * 0.0008) * 0.7 : 0.10 - ovr * 0.0008;
    const HR = Math.round(IP * clamp(randNorm(hrBase, 0.025), 0.02, 0.22));

    // 자책점 (ER) → ERA 역산 (정확한 계산 보장)
    const ratingER9 = clamp(6.5 - ovr * 0.07, 1.5, 8.5);
    const baseER9 = real.ERA ? real.ERA * 0.3 + ratingER9 * 0.7 : ratingER9;
    const targetER9 = clamp(randNorm(baseER9 * (1 - sv * 0.8), 0.6), 0.80, 10.0);
    const ER = Math.max(0, Math.round(IP * targetER9 / 9));
    const R = ER + Math.round(ER * clamp(randNorm(0.1, 0.05), 0, 0.3));

    // ERA = ER * 9 / IP (실제 계산)
    const ERA = IP > 0 ? ER * 9 / IP : 0;
    // WHIP = (H + BB) / IP (실제 계산)
    const WHIP = IP > 0 ? (H + BB) / IP : 0;

    let W = 0, L = 0, S = 0, HLD = 0;

    // FIP = (13*HR + 3*BB - 2*SO) / IP + 3.2
    const FIP = IP > 0 ? clamp((13 * HR + 3 * BB - 2 * SO) / IP + 3.2, 1.0, 9.0) : 0;
    const BABIP = clamp(randNorm(0.300, 0.025), 0.230, 0.390);

    // WAR
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
 * AI 팀 1/2군 교체 — KBO 현실 반영 (팀당 배치마다 1~2건)
 * 실제 KBO: 팀당 하루 평균 0.8~1.2건 엔트리 변동
 * 5경기 배치 = 약 5일 → 팀당 4~6건 시도
 */
function aiRosterShuffle(state) {
    const teamCodes = Object.keys(state.teams);
    const totalGames = getTotalGamesPlayed(state);

    for (const code of teamCodes) {
        const team = state.teams[code];
        // 학생 팀은 건드리지 않음
        if (typeof session !== 'undefined' && session.teamCode === code) continue;

        const roster1 = team.roster || [];
        const roster2 = team.futuresRoster || [];
        if (roster2.length === 0) continue;

        // 배치(5경기)당 교체 횟수: 5~9회 시도 (KBO 현실: 팀당 하루 1건+)
        const swapAttempts = Math.floor(5 + Math.random() * 5);

        for (let attempt = 0; attempt < swapAttempts; attempt++) {
            // 1군 선수 중 비보호 대상 (외국인, 프랜차이즈스타 제외)
            const demotable1 = roster1.map(id => state.players[id]).filter(p =>
                p && !p.isForeign && !p.isFranchiseStar
            );
            const prospects2 = roster2.map(id => state.players[id]).filter(p => p);

            if (demotable1.length === 0 || prospects2.length === 0) break;

            // 교체 사유를 랜덤으로 선택
            const reason = Math.random();

            if (reason < 0.40) {
                // ── 부진 타자 강등 + 유망 타자 승격 (40%) ──
                const batters1 = demotable1.filter(p => p.position !== 'P' && p.simStats);
                const batProspects = prospects2.filter(p => p.position !== 'P');
                if (batters1.length === 0 || batProspects.length === 0) continue;

                // OPS 하위 30% 중 랜덤 선택
                batters1.sort((a, b) => (a.simStats.OPS || 0) - (b.simStats.OPS || 0));
                const cutoff = Math.max(1, Math.floor(batters1.length * 0.3));
                const demoteIdx = Math.floor(Math.random() * cutoff);
                const demoteP = batters1[demoteIdx];

                // 2군에서 OVR 높은 순 + 약간의 랜덤
                batProspects.sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
                const promoteP = batProspects[Math.floor(Math.random() * Math.min(3, batProspects.length))];

                if (demoteP && promoteP && (demoteP.simStats.OPS || 0) < 0.650) {
                    swapPlayers(roster1, roster2, demoteP, promoteP, code);
                }

            } else if (reason < 0.75) {
                // ── 부진 투수 강등 + 유망 투수 승격 (35%) ──
                const pitchers1 = demotable1.filter(p => p.position === 'P' && p.role !== '마무리' && p.simStats);
                const pitProspects = prospects2.filter(p => p.position === 'P');
                if (pitchers1.length === 0 || pitProspects.length === 0) continue;

                // ERA 상위 30% 중 랜덤
                pitchers1.sort((a, b) => (b.simStats.ERA || 0) - (a.simStats.ERA || 0));
                const cutoff = Math.max(1, Math.floor(pitchers1.length * 0.3));
                const demoteP = pitchers1[Math.floor(Math.random() * cutoff)];

                pitProspects.sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
                const promoteP = pitProspects[Math.floor(Math.random() * Math.min(3, pitProspects.length))];

                if (demoteP && promoteP && (demoteP.simStats.ERA || 0) > 5.0) {
                    swapPlayers(roster1, roster2, demoteP, promoteP, code);
                }

            } else {
                // ── 컨디션/로테이션 관리 교체 (25%) ──
                // 출전 많은 1군 → 휴식 강등, 신선한 2군 승격
                const tired1 = demotable1.filter(p => p.simStats && (p.simStats.G || 0) > totalGames * 0.85);
                if (tired1.length === 0) continue;
                const demoteP = tired1[Math.floor(Math.random() * tired1.length)];
                const samePos = prospects2.filter(p => p.position === demoteP.position || (p.position !== 'P' && demoteP.position !== 'P'));
                if (samePos.length === 0) continue;
                const promoteP = samePos[Math.floor(Math.random() * Math.min(3, samePos.length))];

                if (demoteP && promoteP) {
                    swapPlayers(roster1, roster2, demoteP, promoteP, code);
                }
            }
        }
    }
}

/** 1군 ↔ 2군 선수 교체 실행 */
function swapPlayers(roster1, roster2, demoteP, promoteP, teamCode) {
    const idx1 = roster1.indexOf(demoteP.id);
    const idx2 = roster2.indexOf(promoteP.id);
    if (idx1 >= 0 && idx2 >= 0) {
        roster1[idx1] = promoteP.id;
        roster2[idx2] = demoteP.id;
        promoteP.team = teamCode;
    }
}

/**
 * 부상 발생 & 복귀 시스템
 * KBO 현실: 시즌 중 팀당 15~25명 부상 등록 (평균 배치당 1~2명 발생)
 */
function processInjuries(state) {
    const teamCodes = Object.keys(state.teams);
    const totalGames = getTotalGamesPlayed(state);

    for (const code of teamCodes) {
        const team = state.teams[code];
        // 학생 팀은 건드리지 않음
        if (typeof session !== 'undefined' && session.teamCode === code) continue;

        const roster1 = team.roster || [];
        const roster2 = team.futuresRoster || [];
        const injured = team.injuredRoster || [];
        if (!team.injuredRoster) team.injuredRoster = [];

        // ── 부상 복귀 체크 ──
        for (let i = injured.length - 1; i >= 0; i--) {
            const pid = injured[i];
            const p = state.players[pid];
            if (!p) continue;

            // 복귀 가능 여부: 부상 기간 경과
            const injDuration = p._injuryDuration || 10;
            const injStart = p._injuryStartGame || 0;
            if (totalGames >= injStart + injDuration) {
                // 복귀: 부상 → 2군 (재활)
                injured.splice(i, 1);
                roster2.push(pid);
                delete p._injuryDuration;
                delete p._injuryStartGame;
                delete p._injuryType;
            }
        }

        // ── 부상 발생 (배치당 0~2명) ──
        // 확률: 선수당 약 0.8% per 배치 (시즌 29배치 × 0.8% ≈ 시즌당 팀 ~7명 부상)
        const INJURY_RATE = 0.008;
        const injuryTypes = [
            { name: '햄스트링 부상', duration: 15, rate: 0.25 },
            { name: '어깨 염증', duration: 20, rate: 0.15 },
            { name: '팔꿈치 통증', duration: 25, rate: 0.10 },
            { name: '허리 부상', duration: 12, rate: 0.15 },
            { name: '손가락 부상', duration: 8, rate: 0.10 },
            { name: '발목 염좌', duration: 10, rate: 0.10 },
            { name: '타박상', duration: 5, rate: 0.10 },
            { name: '컨디션 난조', duration: 3, rate: 0.05 },
        ];

        for (let i = roster1.length - 1; i >= 0; i--) {
            const pid = roster1[i];
            const p = state.players[pid];
            if (!p || p.isForeign || p.isFranchiseStar) continue; // 외국인/프랜차이즈 보호

            if (Math.random() < INJURY_RATE) {
                // 부상 유형 결정
                let roll = Math.random();
                let injType = injuryTypes[injuryTypes.length - 1];
                for (const t of injuryTypes) {
                    roll -= t.rate;
                    if (roll <= 0) { injType = t; break; }
                }

                // 1군 → 부상 리스트
                roster1.splice(i, 1);
                team.injuredRoster.push(pid);
                p._injuryDuration = injType.duration;
                p._injuryStartGame = totalGames;
                p._injuryType = injType.name;

                // 2군에서 같은 포지션 승격
                const samePos = roster2.filter(id => {
                    const pr = state.players[id];
                    return pr && (p.position === 'P' ? pr.position === 'P' : pr.position !== 'P');
                });
                if (samePos.length > 0) {
                    samePos.sort((a, b) => (state.players[b]?.ovr || 0) - (state.players[a]?.ovr || 0));
                    const promoteId = samePos[0];
                    const idx2 = roster2.indexOf(promoteId);
                    if (idx2 >= 0) {
                        roster2.splice(idx2, 1);
                        roster1.push(promoteId);
                    }
                }

                break; // 팀당 배치마다 최대 1명 부상
            }
        }
    }
}

window.simulateQuarter = simulateQuarter;
window.simulateBatch = simulateBatch;
window.updateAllSimStats = updateAllSimStats;
window.aiRosterShuffle = aiRosterShuffle;
window.processInjuries = processInjuries;
window.getTotalGamesPlayed = getTotalGamesPlayed;
window.getStandings = getStandings;
window.getCurrentQuarter = getCurrentQuarter;
window.getCompletedQuarters = getCompletedQuarters;
window.delay = delay;
