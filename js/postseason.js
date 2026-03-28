// ===== 포스트시즌 (PO + 한국시리즈) =====

async function playoffSeries(state, teamCodeA, teamCodeB, bestOf, onGameResult) {
    const targetWins = bestOf === 3 ? 2 : 3;
    let winsA = 0, winsB = 0;
    const gameResults = [];

    // 에이스 가중치 ×1.3
    const aceA = getAcePitcher(state, teamCodeA);
    const aceB = getAcePitcher(state, teamCodeB);
    const acePowerA = aceA ? calcPlayerPower(aceA) * 1.3 : 50;
    const acePowerB = aceB ? calcPlayerPower(aceB) * 1.3 : 50;

    // 팀 타선 파워
    const batA = calcTeamBatPower(state, teamCodeA);
    const batB = calcTeamBatPower(state, teamCodeB);

    // 종합 파워
    const powerA = acePowerA * 0.5 + batA * 0.5;
    const powerB = acePowerB * 0.5 + batB * 0.5;

    let gameNum = 0;
    while (winsA < targetWins && winsB < targetWins) {
        gameNum++;
        const probA = powerA / (powerA + powerB);
        const aWins = Math.random() < probA;

        if (aWins) winsA++;
        else winsB++;

        const result = {
            game: gameNum,
            winner: aWins ? teamCodeA : teamCodeB,
            scoreA: winsA,
            scoreB: winsB,
        };
        gameResults.push(result);

        if (onGameResult) {
            onGameResult(result);
            await delay(800);
        }
    }

    return {
        winner: winsA >= targetWins ? teamCodeA : teamCodeB,
        loser: winsA >= targetWins ? teamCodeB : teamCodeA,
        winsA,
        winsB,
        games: gameResults,
    };
}

function applyFatigue(state, teamCode) {
    // PO를 거친 팀의 첫 선발 투수 능력치 -5%
    const ace = getAcePitcher(state, teamCode);
    if (ace) {
        ace._originalIVB = ace._originalIVB || ace.stats.IVB;
        ace._originalCSW = ace._originalCSW || ace.stats['CSW%'];
        ace.stats.IVB = Math.round(ace.stats.IVB * 0.95 * 10) / 10;
        ace.stats['CSW%'] = Math.round(ace.stats['CSW%'] * 0.95 * 10) / 10;
    }
}

function removeFatigue(state, teamCode) {
    const ace = getAcePitcher(state, teamCode);
    if (ace && ace._originalIVB) {
        ace.stats.IVB = ace._originalIVB;
        ace.stats['CSW%'] = ace._originalCSW;
        delete ace._originalIVB;
        delete ace._originalCSW;
    }
}

function getPostseasonTeams(state) {
    const standings = getStandings(state);
    if (standings.length < 4) return null;
    return {
        seed1: standings[0],
        seed2: standings[1],
        seed3: standings[2],
        seed4: standings[3],
    };
}

function computeAwards(state) {
    const standings = getStandings(state);
    const awards = [];

    // 올해의 단장상: 한국시리즈 우승팀 (별도 처리)

    // 데이터 혁신상: 가장 높은 평균 파워 점수
    const bestPower = [...standings].sort((a, b) =>
        (b.pitchPower + b.batPower) - (a.pitchPower + a.batPower)
    )[0];
    awards.push({ icon: '📊', title: '데이터 혁신상', team: bestPower.name, desc: '최고 평균 파워 점수' });

    // 머니볼상: 가장 낮은 연봉으로 높은 승수
    const moneyball = [...standings].map(s => ({
        ...s,
        efficiency: s.wins / Math.max(calcTeamSalaryRaw(state, s.code), 1),
    })).sort((a, b) => b.efficiency - a.efficiency)[0];
    awards.push({ icon: '💰', title: '머니볼상', team: moneyball.name, desc: '최고 연봉 효율' });

    // 성장상: 1Q 대비 최종 승률 상승폭
    let bestGrowth = { name: '', growth: -Infinity };
    for (const code of Object.keys(state.teams)) {
        const team = state.teams[code];
        const q1 = team.seasonRecord.q1;
        const q1Rate = (q1.wins + q1.losses) > 0 ? q1.wins / (q1.wins + q1.losses) : 0.5;
        const total = getTeamTotalRecord(team);
        const growth = total.rate - q1Rate;
        if (growth > bestGrowth.growth) {
            bestGrowth = { name: team.name, growth };
        }
    }
    awards.push({ icon: '📈', title: '성장상', team: bestGrowth.name, desc: '1Q 대비 최고 승률 성장' });

    return awards;
}

window.playoffSeries = playoffSeries;
window.applyFatigue = applyFatigue;
window.removeFatigue = removeFatigue;
window.getPostseasonTeams = getPostseasonTeams;
window.computeAwards = computeAwards;
