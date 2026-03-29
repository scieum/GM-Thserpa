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
            rate: record.rate,
            pitchPower: calcTeamPitchPower(state, code),
            batPower: calcTeamBatPower(state, code),
        };
    });

    // Sort by win rate desc, then wins desc
    standings.sort((a, b) => b.rate - a.rate || b.wins - a.wins);

    // Calculate games behind
    const topRate = standings[0].rate;
    const topGames = standings[0].wins + standings[0].losses;
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

// 총 진행 경기 수
function getTotalGamesPlayed(state) {
    const first = Object.values(state.teams)[0];
    if (!first) return 0;
    let total = 0;
    for (let q = 1; q <= 4; q++) {
        const r = first.seasonRecord[`q${q}`];
        total += (r.wins || 0) + (r.losses || 0);
    }
    return total;
}

// 5경기 단위 시뮬레이션
async function simulateBatch(state, batchSize, onProgress) {
    const teamCodes = Object.keys(state.teams);

    // 현재 쿼터 파악 및 남은 경기
    const winRates = {};
    for (const code of teamCodes) {
        const pp = calcTeamPitchPower(state, code);
        const bp = calcTeamBatPower(state, code);
        winRates[code] = calcWinRate(pp, bp);
    }

    for (let game = 1; game <= batchSize; game++) {
        // 현재 총 경기 수로 어느 쿼터인지 결정
        const totalPlayed = getTotalGamesPlayed(state);
        const q = Math.min(4, Math.floor(totalPlayed / 36) + 1);
        const qKey = `q${q}`;

        for (const code of teamCodes) {
            if (Math.random() < winRates[code]) {
                state.teams[code].seasonRecord[qKey].wins++;
            } else {
                state.teams[code].seasonRecord[qKey].losses++;
            }
        }

        if (onProgress) onProgress(game, batchSize);
        await delay(30);
    }

    return getStandings(state);
}

window.simulateQuarter = simulateQuarter;
window.simulateBatch = simulateBatch;
window.getTotalGamesPlayed = getTotalGamesPlayed;
window.getStandings = getStandings;
window.getCurrentQuarter = getCurrentQuarter;
window.getCompletedQuarters = getCompletedQuarters;
window.delay = delay;
