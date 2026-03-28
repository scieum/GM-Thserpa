// ===== 트레이드 시스템 =====

// 캡 적용 연봉 계산 (임시 로스터용 — 외국인 제외, 프랜차이즈 스타 50%)
function calcCapSalaryForRoster(state, rosterIds) {
    let total = 0;
    for (const id of rosterIds) {
        const p = state.players[id];
        if (p.isForeign) continue;
        if (p.isFranchiseStar) {
            total += p.salary * 0.5;
        } else {
            total += p.salary;
        }
    }
    return Math.round(total * 10) / 10;
}

function validateTrade(state, sendTeamCode, recvTeamCode, sendPlayerIds, recvPlayerIds) {
    const errors = [];
    const warnings = [];

    if (sendTeamCode === recvTeamCode) {
        errors.push('같은 팀 간 트레이드는 불가합니다.');
        return { valid: false, errors, warnings };
    }

    if (sendPlayerIds.length === 0 || recvPlayerIds.length === 0) {
        errors.push('양 팀 모두 최소 1명의 선수를 선택해야 합니다.');
        return { valid: false, errors, warnings };
    }

    const sendTeam = state.teams[sendTeamCode];
    const recvTeam = state.teams[recvTeamCode];

    // Simulate rosters after trade
    const newSendRoster = sendTeam.roster
        .filter(id => !sendPlayerIds.includes(id))
        .concat(recvPlayerIds);
    const newRecvRoster = recvTeam.roster
        .filter(id => !recvPlayerIds.includes(id))
        .concat(sendPlayerIds);

    // Check roster sizes
    if (newSendRoster.length !== 29) {
        errors.push(`${sendTeam.name}: 로스터 ${newSendRoster.length}명 (29명 필요)`);
    }
    if (newRecvRoster.length !== 29) {
        errors.push(`${recvTeam.name}: 로스터 ${newRecvRoster.length}명 (29명 필요)`);
    }

    // Check pitcher minimum
    const sendPitchers = newSendRoster.filter(id => state.players[id].position === 'P').length;
    const recvPitchers = newRecvRoster.filter(id => state.players[id].position === 'P').length;
    if (sendPitchers < 10) errors.push(`${sendTeam.name}: 투수 ${sendPitchers}명 (최소 10명)`);
    if (recvPitchers < 10) errors.push(`${recvTeam.name}: 투수 ${recvPitchers}명 (최소 10명)`);

    // Check batter minimum
    const sendBatters = newSendRoster.filter(id => state.players[id].position !== 'P').length;
    const recvBatters = newRecvRoster.filter(id => state.players[id].position !== 'P').length;
    if (sendBatters < 14) errors.push(`${sendTeam.name}: 야수 ${sendBatters}명 (최소 14명)`);
    if (recvBatters < 14) errors.push(`${recvTeam.name}: 야수 ${recvBatters}명 (최소 14명)`);

    // Check salary cap (경고만, 차단하지 않음 — 실제 KBO도 초과 가능하되 제재금)
    const sendCapSalary = calcCapSalaryForRoster(state, newSendRoster);
    const recvCapSalary = calcCapSalaryForRoster(state, newRecvRoster);
    const cap = KBO_SALARY_CAP;

    if (sendCapSalary > cap) {
        const excess = (sendCapSalary - cap).toFixed(1);
        warnings.push(`${sendTeam.name}: 캡 초과 ${excess}억 (제재금 발생)`);
    }
    if (recvCapSalary > cap) {
        const excess = (recvCapSalary - cap).toFixed(1);
        warnings.push(`${recvTeam.name}: 캡 초과 ${excess}억 (제재금 발생)`);
    }

    // Detail info for summary
    const sendSalaryRaw = newSendRoster.reduce((s, id) => s + state.players[id].salary, 0);
    const recvSalaryRaw = newRecvRoster.reduce((s, id) => s + state.players[id].salary, 0);
    const sendSalaryDelta = recvPlayerIds.reduce((s, id) => s + state.players[id].salary, 0)
                          - sendPlayerIds.reduce((s, id) => s + state.players[id].salary, 0);
    const recvSalaryDelta = -sendSalaryDelta;

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        sendSalaryDelta,
        recvSalaryDelta,
        sendNewSalaryRaw: Math.round(sendSalaryRaw * 10) / 10,
        recvNewSalaryRaw: Math.round(recvSalaryRaw * 10) / 10,
        sendCapSalary,
        recvCapSalary,
    };
}

function executeTrade(state, sendTeamCode, recvTeamCode, sendPlayerIds, recvPlayerIds) {
    const sendTeam = state.teams[sendTeamCode];
    const recvTeam = state.teams[recvTeamCode];

    // Update rosters
    sendTeam.roster = sendTeam.roster.filter(id => !sendPlayerIds.includes(id)).concat(recvPlayerIds);
    recvTeam.roster = recvTeam.roster.filter(id => !recvPlayerIds.includes(id)).concat(sendPlayerIds);

    // Update player team assignments
    sendPlayerIds.forEach(id => { state.players[id].team = recvTeamCode; });
    recvPlayerIds.forEach(id => { state.players[id].team = sendTeamCode; });

    // Log trade
    const tradeLog = {
        timestamp: new Date().toLocaleString('ko-KR'),
        sendTeam: sendTeam.name,
        recvTeam: recvTeam.name,
        sent: sendPlayerIds.map(id => state.players[id].name),
        received: recvPlayerIds.map(id => state.players[id].name),
    };

    sendTeam.tradeHistory.push(tradeLog);
    recvTeam.tradeHistory.push(tradeLog);

    if (!state.tradeHistory) state.tradeHistory = [];
    state.tradeHistory.push(tradeLog);

    return tradeLog;
}

window.validateTrade = validateTrade;
window.executeTrade = executeTrade;
