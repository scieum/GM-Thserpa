// ===== 능력치 계산 & 로스터 검증 =====

function calcPitcherPower(stats) {
    const ivb = Math.min(stats.IVB / 50, 1.0) * 40;
    const vaa = Math.max(0, (5.0 - Math.abs(stats.VAA)) / 5) * 30;
    const csw = Math.min(stats['CSW%'] / 40, 1.0) * 20;
    const fip = Math.max(0, (6.0 - stats.FIP) / 6) * 10;
    return Math.round((ivb + vaa + csw + fip) * 10) / 10;
}

function calcBatterPower(stats) {
    const wrc = Math.min(stats['wRC+'] / 160, 1.0) * 50;
    const barrel = Math.min(stats['Barrel%'] / 20, 1.0) * 30;
    const ops = Math.min(stats.OPS / 1.0, 1.0) * 20;
    return Math.round((wrc + barrel + ops) * 10) / 10;
}

function calcPlayerPower(player) {
    // OVR이 있으면 사용 (실제 데이터 기반)
    if (player.ratings && player.ovr != null) {
        return player.ovr;
    }
    return player.position === 'P'
        ? calcPitcherPower(player.stats)
        : calcBatterPower(player.stats);
}

// ── 20-80 스카우팅 스케일 ──

function clamp2080(val) {
    return Math.round(Math.max(20, Math.min(80, val)));
}

// 타자 5툴 20-80 변환 (KBO 기준)
function calcBatterRatings(stats) {
    const AVG = stats.AVG || 0;
    const OBP = stats.OBP || 0;
    const SLG = stats.SLG || 0;
    const G = stats.G || 1;
    const PA = stats.PA || 1;
    const BB = stats.BB || 0;
    const SB = stats.SB || 0;
    const dWAR = stats.dWAR || 0;

    const ISO = stats.IsoP || (SLG - AVG);
    const bbPct = BB / PA;
    const sbSeason = SB / Math.max(G, 20) * 144;
    const dwarSeason = dWAR / Math.max(G, 20) * 144;

    // 컨택 (AVG 기준): KBO 평균 .265, 1SD ≈ .020
    const contact = clamp2080(50 + (AVG - 0.265) / 0.020 * 10);

    // 파워 (IsoP 기준): KBO 평균 .145, 1SD ≈ .042
    const power = clamp2080(50 + (ISO - 0.145) / 0.042 * 10);

    // 선구안 (BB% 기준): KBO 평균 8.5%, 1SD ≈ 2.5%
    const eye = clamp2080(50 + (bbPct - 0.085) / 0.025 * 10);

    // 스피드 (SB/시즌 기준): 비선형 스케일
    const speed = clamp2080(20 + sbSeason * 1.2);

    // 수비 (dWAR/시즌 기준): 0 = 50, ±3 = 20/80
    const defense = clamp2080(50 + dwarSeason * 10);

    return { contact, power, eye, speed, defense };
}

// OVR 계산 (가중 평균)
function calcBatterOVR(ratings) {
    return Math.round(
        ratings.contact * 0.20 +
        ratings.power * 0.25 +
        ratings.eye * 0.20 +
        ratings.speed * 0.15 +
        ratings.defense * 0.20
    );
}

function getTeamPlayers(state, teamCode) {
    const team = state.teams[teamCode];
    return team.roster.map(id => state.players[id]);
}

function getTeamPitchers(state, teamCode) {
    return getTeamPlayers(state, teamCode).filter(p => p.position === 'P');
}

function getTeamBatters(state, teamCode) {
    return getTeamPlayers(state, teamCode).filter(p => p.position !== 'P');
}

function calcTeamPitchPower(state, teamCode) {
    const pitchers = getTeamPitchers(state, teamCode);
    if (pitchers.length === 0) return 0;
    const total = pitchers.reduce((sum, p) => sum + calcPlayerPower(p), 0);
    return Math.round((total / pitchers.length) * 10) / 10;
}

function calcTeamBatPower(state, teamCode) {
    const batters = getTeamBatters(state, teamCode);
    if (batters.length === 0) return 0;
    const total = batters.reduce((sum, b) => sum + calcPlayerPower(b), 0);
    return Math.round((total / batters.length) * 10) / 10;
}

function calcWinRate(teamPitchPower, teamBatPower) {
    const leagueAvg = 50;
    let wr = 0.5 + (teamPitchPower - leagueAvg) * 0.004
                 + (teamBatPower - leagueAvg) * 0.004;
    return Math.max(0.2, Math.min(0.85, wr));
}

// ── 샐러리캡 관련 계산 ──

// 실제 연봉 합계 (단순 합산)
function calcTeamSalaryRaw(state, teamCode) {
    const players = getTeamPlayers(state, teamCode);
    return Math.round(players.reduce((sum, p) => sum + p.salary, 0) * 10) / 10;
}

// 샐러리캡 적용 연봉 (외국인 선수 제외 + 프랜차이즈 스타 50% 할인)
function calcTeamSalaryCap(state, teamCode) {
    const players = getTeamPlayers(state, teamCode);
    let total = 0;
    for (const p of players) {
        if (p.isForeign) continue; // 외국인 선수는 캡 계산 제외
        if (p.isFranchiseStar) {
            total += p.salary * 0.5; // 7시즌 이상 프랜차이즈 스타: 50%만 적용
        } else {
            total += p.salary;
        }
    }
    return Math.round(total * 10) / 10;
}

// 외국인 선수 연봉 합계 (별도 관리: 3명 합산 400만 달러)
function calcForeignSalary(state, teamCode) {
    const players = getTeamPlayers(state, teamCode);
    const foreignPlayers = players.filter(p => p.isForeign);
    const total = foreignPlayers.reduce((sum, p) => sum + p.salary, 0);
    return { total: Math.round(total * 10) / 10, count: foreignPlayers.length };
}

// 외국인 선수 티어별 상세 정보
function calcForeignTierSummary(state, teamCode) {
    const players = getTeamPlayers(state, teamCode);
    const foreignPlayers = players.filter(p => p.isForeign);
    const tierCounts = { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 };
    const details = [];
    for (const p of foreignPlayers) {
        const tier = p.foreignTier || 'T3';
        tierCounts[tier]++;
        const tierInfo = FOREIGN_TIERS[tier];
        details.push({
            name: p.name,
            tier,
            tierName: tierInfo ? tierInfo.name : '미분류',
            origin: p.foreignOrigin || '미상',
            ovr: p.ovr || 0,
            salary: p.salary,
            color: tierInfo ? tierInfo.color : '#999',
        });
    }
    return { tierCounts, details, total: foreignPlayers.length };
}

// 외국인 선수 티어별 연봉 검증
function validateForeignSalaryByTier(player) {
    if (!player.isForeign || !player.foreignTier) return null;
    const tier = FOREIGN_TIERS[player.foreignTier];
    if (!tier) return null;
    const [lo, hi] = tier.salaryRange;
    if (player.salary < lo) return { valid: false, msg: `${player.name} 연봉 ${player.salary}억 < 티어 하한 ${lo}억` };
    if (player.salary > hi * 1.5) return { valid: false, msg: `${player.name} 연봉 ${player.salary}억 > 티어 상한 ${hi}억의 150%` };
    return { valid: true };
}

// 경쟁균형세(제재금) 계산
function calcCapPenalty(state, teamCode) {
    const team = state.teams[teamCode];
    const capSalary = calcTeamSalaryCap(state, teamCode);
    const cap = KBO_SALARY_CAP;

    if (capSalary <= cap) {
        return { overCap: false, excess: 0, penaltyRate: 0, penaltyAmount: 0, violations: team.capViolations, description: '정상' };
    }

    const excess = Math.round((capSalary - cap) * 10) / 10;
    const violations = team.capViolations + 1; // 이번 시즌 포함

    let penaltyRate, description;
    if (violations === 1) {
        penaltyRate = 0.5;
        description = '1회 초과: 초과분의 50%';
    } else if (violations === 2) {
        penaltyRate = 1.0;
        description = '2회 연속 초과: 초과분의 100%';
    } else {
        penaltyRate = 1.5;
        description = '3회+ 연속 초과: 초과분의 150% + 지명권 하락';
    }

    const penaltyAmount = Math.round(excess * penaltyRate * 10) / 10;

    return { overCap: true, excess, penaltyRate, penaltyAmount, violations, description };
}

// 팀 가용예산 (트레이드에 쓸 수 있는 돈)
function calcAvailableBudget(state, teamCode) {
    const team = state.teams[teamCode];
    const rawSalary = calcTeamSalaryRaw(state, teamCode);
    const originalSalary = team.finance.playerSalary;
    // 가용예산 = 원래 가용예산 - (현재 연봉 - 원래 연봉)
    const spent = rawSalary - originalSalary;
    return Math.round((team.finance.availableBudget - spent) * 10) / 10;
}

// ── 로스터 검증 ──

function validateRoster(state, teamCode) {
    const team = state.teams[teamCode];
    const players = getTeamPlayers(state, teamCode);
    const pitchers = players.filter(p => p.position === 'P');
    const batters = players.filter(p => p.position !== 'P');
    const rawSalary = calcTeamSalaryRaw(state, teamCode);
    const capSalary = calcTeamSalaryCap(state, teamCode);
    const penalty = calcCapPenalty(state, teamCode);
    const availBudget = calcAvailableBudget(state, teamCode);

    const errors = [];
    const warnings = [];

    if (players.length !== 29) errors.push(`로스터 ${players.length}명 (29명 필요)`);
    if (pitchers.length < 10) errors.push(`투수 ${pitchers.length}명 (최소 10명)`);
    if (batters.length < 14) errors.push(`야수 ${batters.length}명 (최소 14명)`);

    // 샐러리캡 초과는 제재금(경고)이지 시뮬레이션 잠금은 아님
    if (penalty.overCap) {
        warnings.push(`샐러리캡 초과 ${penalty.excess.toFixed(1)}억 → 제재금 ${penalty.penaltyAmount.toFixed(1)}억 (${penalty.description})`);
    }

    // 하한선 미달
    if (capSalary < KBO_SALARY_FLOOR) {
        warnings.push(`샐러리 하한선 미달: ${capSalary.toFixed(1)}억 < ${KBO_SALARY_FLOOR}억`);
    }

    return {
        valid: errors.length === 0, // 로스터 규정만 체크 (캡 초과는 경고)
        errors,
        warnings,
        pitcherCount: pitchers.length,
        batterCount: batters.length,
        rawSalary,
        capSalary,
        salaryCap: KBO_SALARY_CAP,
        salaryFloor: KBO_SALARY_FLOOR,
        penalty,
        availableBudget: availBudget,
    };
}

// ── 2군 관련 ──

function getTeamFuturesPlayers(state, teamCode) {
    const team = state.teams[teamCode];
    return (team.futuresRoster || []).map(id => state.players[id]).filter(Boolean);
}

function getTeamMilitaryPlayers(state, teamCode) {
    const team = state.teams[teamCode];
    return (team.militaryRoster || []).map(id => state.players[id]).filter(Boolean);
}

// 등록: 2군 → 1군 (1군에서 1명 말소 필수)
function promotePlayer(state, teamCode, futuresPlayerId, demotePlayerId) {
    const team = state.teams[teamCode];
    if (!team.futuresRoster.includes(futuresPlayerId)) return { success: false, msg: '2군에 없는 선수입니다.' };
    if (!team.roster.includes(demotePlayerId)) return { success: false, msg: '1군에 없는 선수입니다.' };

    // 포지션 체크: 투수↔투수, 야수↔야수만 교환 가능 (또는 자유 교환)
    const up = state.players[futuresPlayerId];
    const down = state.players[demotePlayerId];

    // 이동
    team.roster = team.roster.filter(id => id !== demotePlayerId);
    team.roster.push(futuresPlayerId);
    team.futuresRoster = team.futuresRoster.filter(id => id !== futuresPlayerId);
    team.futuresRoster.push(demotePlayerId);

    // isFutures 플래그 업데이트
    up.isFutures = false;
    down.isFutures = true;

    return { success: true, msg: `${up.name} 등록 ↑ / ${down.name} 말소 ↓` };
}

// 단순 등록 (1군 29명 미만일 때)
function promotePlayerSimple(state, teamCode, futuresPlayerId) {
    const team = state.teams[teamCode];
    if (!team.futuresRoster.includes(futuresPlayerId)) return { success: false, msg: '2군에 없는 선수입니다.' };

    const up = state.players[futuresPlayerId];
    team.futuresRoster = team.futuresRoster.filter(id => id !== futuresPlayerId);
    team.roster.push(futuresPlayerId);
    up.isFutures = false;

    return { success: true, msg: `${up.name} 등록 ↑` };
}

// 말소 (2군으로)
function demotePlayer(state, teamCode, playerId) {
    const team = state.teams[teamCode];
    if (!team.roster.includes(playerId)) return { success: false, msg: '1군에 없는 선수입니다.' };

    const p = state.players[playerId];

    team.roster = team.roster.filter(id => id !== playerId);
    team.futuresRoster.push(playerId);
    p.isFutures = true;

    return { success: true, msg: `${p.name} 말소 ↓` };
}

// ── 역할/포지션 변경 ──

// 투수 역할 변경
function changePitcherRole(state, playerId, newRole) {
    const p = state.players[playerId];
    if (!p || p.position !== 'P') return { success: false, msg: '투수가 아닙니다.' };
    if (!['선발', '중계', '마무리'].includes(newRole)) return { success: false, msg: '잘못된 역할입니다.' };
    p.role = newRole;
    return { success: true, msg: `${p.name} → ${newRole}` };
}

// 야수 포지션 변경 (유틸리티)
// primaryPosition: 원래 포지션 (최초 생성 시), assignedPosition: 현재 배정 포지션
// 포지션 패널티 (현실 반영)
// SS→2B 쉬움, CF→코너OF 쉬움, RF→LF 쉬움, LF→RF/CF 어려움
const POSITION_GROUPS = {
    'C':  { group: 'C',  penalty: { 'C': 0, '1B': -10, '2B': -25, '3B': -20, 'SS': -30, 'LF': -15, 'CF': -25, 'RF': -15 } },
    '1B': { group: 'IF', penalty: { 'C': -35, '1B': 0, '2B': -15, '3B': -10, 'SS': -22, 'LF': -10, 'CF': -20, 'RF': -10 } },
    '2B': { group: 'IF', penalty: { 'C': -30, '2B': 0, 'SS': -8, '3B': -6, '1B': -3, 'LF': -12, 'CF': -18, 'RF': -12 } },
    '3B': { group: 'IF', penalty: { 'C': -30, '3B': 0, '1B': -3, 'SS': -10, '2B': -8, 'LF': -10, 'CF': -20, 'RF': -12 } },
    'SS': { group: 'IF', penalty: { 'SS': 0, '2B': -2, '3B': -3, '1B': -2, 'C': -25, 'LF': -8, 'CF': -10, 'RF': -8 } },
    'LF': { group: 'OF', penalty: { 'LF': 0, 'RF': -8, 'CF': -15, '1B': -8, '2B': -18, '3B': -15, 'SS': -25, 'C': -35 } },
    'CF': { group: 'OF', penalty: { 'CF': 0, 'LF': -1, 'RF': -1, '1B': -10, '2B': -12, '3B': -15, 'SS': -18, 'C': -35 } },
    'RF': { group: 'OF', penalty: { 'RF': 0, 'LF': -2, 'CF': -6, '1B': -8, '2B': -18, '3B': -15, 'SS': -22, 'C': -35 } },
};

function getPositionPenalty(primaryPos, assignedPos) {
    if (primaryPos === assignedPos) return 0;
    const config = POSITION_GROUPS[primaryPos];
    if (!config) return -20;
    return config.penalty[assignedPos] ?? -20;
}

function changePlayerPosition(state, playerId, newPos) {
    const p = state.players[playerId];
    if (!p || p.position === 'P') return { success: false, msg: '투수는 포지션 변경이 불가합니다.' };
    const validPos = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
    if (!validPos.includes(newPos)) return { success: false, msg: '잘못된 포지션입니다.' };

    // 원본 포지션 저장 (최초 1회)
    if (!p.primaryPosition) p.primaryPosition = p.position;

    const penalty = getPositionPenalty(p.primaryPosition, newPos);
    p.position = newPos;
    p.positionPenalty = penalty;

    const penaltyMsg = penalty < 0 ? ` (수비 ${penalty})` : '';
    return { success: true, msg: `${p.name} → ${newPos}${penaltyMsg}`, penalty };
}

// 에러 발생 확률 계산 (시뮬레이션에서 사용, 볼파크 팩터 반영)
function getErrorRate(player, teamCode) {
    const baseDef = player.ratings ? player.ratings.defense : 50;
    const penalty = player.positionPenalty || 0;
    let effectiveDef = Math.max(20, baseDef + penalty);
    // 볼파크 팩터 기반 수비 보정 (구장 실책 팩터 + 조명)
    if (teamCode) {
        effectiveDef = applyParkFactorToDefense(effectiveDef, teamCode);
        effectiveDef = Math.max(20, effectiveDef);
    }
    // 수비 능력 80 → 에러율 1%, 수비 능력 20 → 에러율 10%
    return Math.max(0.01, 0.12 - effectiveDef * 0.00135);
}

function canSimulateAll(state) {
    const allErrors = [];
    for (const code of Object.keys(state.teams)) {
        const v = validateRoster(state, code);
        if (!v.valid) {
            allErrors.push({ team: state.teams[code].name, errors: v.errors });
        }
    }
    return { valid: allErrors.length === 0, teamErrors: allErrors };
}

// ── 리그 통계 ──

function calcLeagueAvg(state, statKey, playerType) {
    let total = 0, count = 0;
    for (const code of Object.keys(state.teams)) {
        const players = playerType === 'P' ? getTeamPitchers(state, code) : getTeamBatters(state, code);
        for (const p of players) {
            if (p.stats[statKey] !== undefined) {
                total += p.stats[statKey];
                count++;
            }
        }
    }
    return count > 0 ? total / count : 0;
}

function calcLeagueAvgPitchPower(state) {
    let total = 0, count = 0;
    for (const code of Object.keys(state.teams)) {
        total += calcTeamPitchPower(state, code);
        count++;
    }
    return count > 0 ? total / count : 50;
}

function calcLeagueAvgBatPower(state) {
    let total = 0, count = 0;
    for (const code of Object.keys(state.teams)) {
        total += calcTeamBatPower(state, code);
        count++;
    }
    return count > 0 ? total / count : 50;
}

function getTeamTotalRecord(team) {
    const r = team.seasonRecord;
    let w = 0, l = 0;
    for (const q of ['q1','q2','q3','q4']) {
        w += r[q].wins;
        l += r[q].losses;
    }
    return { wins: w, losses: l, rate: (w + l) > 0 ? w / (w + l) : 0 };
}

function getAcePitcher(state, teamCode) {
    const pitchers = getTeamPitchers(state, teamCode).filter(p => p.role === '선발');
    if (pitchers.length === 0) return getTeamPitchers(state, teamCode)[0];
    return pitchers.reduce((best, p) =>
        calcPlayerPower(p) > calcPlayerPower(best) ? p : best
    );
}

// 전역
window.calcPitcherPower = calcPitcherPower;
window.calcBatterPower = calcBatterPower;
window.calcPlayerPower = calcPlayerPower;
window.getTeamPlayers = getTeamPlayers;
window.getTeamPitchers = getTeamPitchers;
window.getTeamBatters = getTeamBatters;
window.calcTeamPitchPower = calcTeamPitchPower;
window.calcTeamBatPower = calcTeamBatPower;
window.calcWinRate = calcWinRate;
window.calcTeamSalaryRaw = calcTeamSalaryRaw;
window.calcTeamSalaryCap = calcTeamSalaryCap;
window.calcForeignSalary = calcForeignSalary;
window.calcForeignTierSummary = calcForeignTierSummary;
window.validateForeignSalaryByTier = validateForeignSalaryByTier;
window.calcCapPenalty = calcCapPenalty;
window.calcAvailableBudget = calcAvailableBudget;
window.validateRoster = validateRoster;
window.canSimulateAll = canSimulateAll;
window.calcLeagueAvg = calcLeagueAvg;
window.calcLeagueAvgPitchPower = calcLeagueAvgPitchPower;
window.calcLeagueAvgBatPower = calcLeagueAvgBatPower;
window.getTeamTotalRecord = getTeamTotalRecord;
window.getAcePitcher = getAcePitcher;
window.calcBatterRatings = calcBatterRatings;
window.calcBatterOVR = calcBatterOVR;
window.getTeamFuturesPlayers = getTeamFuturesPlayers;
window.getTeamMilitaryPlayers = getTeamMilitaryPlayers;
window.promotePlayer = promotePlayer;
window.promotePlayerSimple = promotePlayerSimple;
window.demotePlayer = demotePlayer;
