// ===== 포스트시즌 (PO + 한국시리즈) =====

// ══════════════════════════════════════════
// ██ 1단계: 이닝별 게임 시뮬레이션 엔진
// ══════════════════════════════════════════

/**
 * 단일 경기 시뮬레이션 (9이닝 + 연장)
 * @param {object} state - 전역 state
 * @param {string} homeCode - 홈팀 코드
 * @param {string} awayCode - 원정팀 코드
 * @param {string[]} homeLineup - 홈팀 라인업 (9명 선수 ID)
 * @param {string[]} awayLineup - 원정팀 라인업 (9명 선수 ID)
 * @param {string} homeSP - 홈팀 선발투수 ID
 * @param {string} awaySP - 원정팀 선발투수 ID
 * @returns {object} 경기 결과
 */
function simulateGame(state, homeCode, awayCode, homeLineup, awayLineup, homeSP, awaySP) {
    const innings = [];
    let homeScore = 0, awayScore = 0;
    let homeHits = 0, awayHits = 0;
    let homeErrors = 0, awayErrors = 0;
    let homeBB = 0, awayBB = 0;

    // 현재 투수 상태
    let homePitcher = state.players[homeSP];
    let awayPitcher = state.players[awaySP];
    let homePitcherIP = 0, awayPitcherIP = 0;
    let homePitcherPC = 0, awayPitcherPC = 0; // 투구수

    // 타순 인덱스
    let homeBatIdx = 0, awayBatIdx = 0;

    // 타자별 경기 성적
    const playerGameStats = {};
    function initPlayerGame(pid) {
        if (!playerGameStats[pid]) {
            playerGameStats[pid] = { PA: 0, AB: 0, H: 0, '2B': 0, '3B': 0, HR: 0, RBI: 0, R: 0, BB: 0, SO: 0, HBP: 0 };
        }
    }
    // 투수별 경기 성적
    const pitcherGameStats = {};
    function initPitcherGame(pid) {
        if (!pitcherGameStats[pid]) {
            pitcherGameStats[pid] = { IP: 0, H: 0, R: 0, ER: 0, BB: 0, SO: 0, HR: 0, PC: 0, BF: 0 };
        }
    }
    initPitcherGame(homeSP);
    initPitcherGame(awaySP);

    // 플레이바이플레이 로그
    const playLog = [];

    // 9이닝 + 연장 (최대 12회)
    const maxInnings = 12;
    for (let inn = 1; inn <= maxInnings; inn++) {
        const innResult = { inning: inn, away: 0, home: 0, awayPlays: [], homePlays: [] };

        // ── 초(원정 공격) ──
        const awayRuns = simulateHalfInning(
            state, awayLineup, awayBatIdx, homePitcher,
            playerGameStats, pitcherGameStats, innResult.awayPlays, initPlayerGame, initPitcherGame
        );
        innResult.away = awayRuns.runs;
        awayScore += awayRuns.runs;
        awayHits += awayRuns.hits;
        awayBB += awayRuns.bb;
        awayBatIdx = awayRuns.nextBatIdx;
        homePitcherIP += awayRuns.outs / 3;
        homePitcherPC += awayRuns.pitches;

        // 투수 교체 판단 (7이닝 이상 or 100구 이상)
        if (homePitcherPC >= 100 || homePitcherIP >= 6) {
            const reliever = findReliever(state, homeCode, homeSP, homePitcher?.id);
            if (reliever) {
                homePitcher = reliever;
                initPitcherGame(reliever.id);
            }
        }

        // ── 말(홈 공격) ──
        // 9회말: 홈팀 리드면 스킵
        if (inn >= 9 && homeScore > awayScore) {
            innResult.home = 0;
            innings.push(innResult);
            break;
        }

        const homeRuns = simulateHalfInning(
            state, homeLineup, homeBatIdx, awayPitcher,
            playerGameStats, pitcherGameStats, innResult.homePlays, initPlayerGame, initPitcherGame
        );
        innResult.home = homeRuns.runs;
        homeScore += homeRuns.runs;
        homeHits += homeRuns.hits;
        homeBB += homeRuns.bb;
        homeBatIdx = homeRuns.nextBatIdx;
        awayPitcherIP += homeRuns.outs / 3;
        awayPitcherPC += homeRuns.pitches;

        // 투수 교체
        if (awayPitcherPC >= 100 || awayPitcherIP >= 6) {
            const reliever = findReliever(state, awayCode, awaySP, awayPitcher?.id);
            if (reliever) {
                awayPitcher = reliever;
                initPitcherGame(reliever.id);
            }
        }

        innings.push(innResult);

        // 9회 이후 승부 결정
        if (inn >= 9 && homeScore !== awayScore) break;
        // 12회 동점이면 무승부 (포스트시즌에서는 연장 계속하지만 일단 제한)
    }

    return {
        homeCode, awayCode,
        homeScore, awayScore,
        homeHits, awayHits,
        homeErrors: Math.floor(Math.random() * 2), // 에러는 간단히
        awayErrors: Math.floor(Math.random() * 2),
        homeBB, awayBB,
        innings,
        winner: homeScore > awayScore ? homeCode : (awayScore > homeScore ? awayCode : null),
        playerGameStats,
        pitcherGameStats,
        homeSP, awaySP,
    };
}

/**
 * 반이닝 시뮬레이션 — 3아웃까지
 */
function simulateHalfInning(state, lineup, batIdx, pitcher, pStats, pitStats, plays, initP, initPit) {
    let outs = 0, runs = 0, hits = 0, bb = 0;
    let bases = [0, 0, 0]; // 1루, 2루, 3루 (0=비어있음, 1=주자)
    let pitches = 0;
    const pitcherId = pitcher?.id;
    const pitcherOvr = pitcher?.ovr || 50;

    while (outs < 3) {
        const batId = lineup[batIdx % lineup.length];
        const batter = state.players[batId];
        if (!batter) { batIdx++; continue; }

        initP(batId);
        if (pitcherId) initPit(pitcherId);

        const batterOvr = batter.ovr || 50;
        const contact = batter.ratings?.contact || 50;
        const power = batter.ratings?.power || 50;
        const eye = batter.ratings?.eye || 50;

        // 타석당 투구수 (3~7구)
        const paPC = 3 + Math.floor(Math.random() * 5);
        pitches += paPC;

        // 결과 확률 계산 (KBO 포스트시즌 기준)
        // KBO 평균: 아웃 68%, 안타 22%, 볼넷 8%, 삼진 20%, HR 2.5%
        // 포스트시즌: 투수 우위, 긴장감 → 삼진↑ 안타↓
        const matchup = (batterOvr - pitcherOvr) / 250;
        const bbRate = clamp(0.055 + eye / 2000 + matchup * 0.008, 0.025, 0.10);
        const soRate = clamp(0.21 - contact / 1200 + pitcherOvr / 1200, 0.12, 0.28);
        const hitRate = clamp(0.13 + contact / 1000 + matchup * 0.025, 0.06, 0.20);
        const hrRate = clamp(0.012 + power / 4000 + matchup * 0.005, 0.002, 0.03);
        const hbpRate = 0.005;

        const roll = Math.random();
        let result, rbi = 0, earnedRuns = 0;

        pStats[batId].PA++;

        if (roll < bbRate) {
            // 볼넷
            result = '볼넷';
            bb++;
            pStats[batId].BB++;
            if (pitcherId) { pitStats[pitcherId].BB++; pitStats[pitcherId].BF++; }
            // 주자 밀기
            if (bases[0] && bases[1] && bases[2]) { runs++; rbi++; earnedRuns++; }
            if (bases[0] && bases[1]) { bases[2] = 1; }
            if (bases[0]) { bases[1] = 1; }
            bases[0] = 1;
        } else if (roll < bbRate + hbpRate) {
            // 몸에 맞는 공
            result = '사구';
            pStats[batId].HBP++;
            if (pitcherId) { pitStats[pitcherId].BF++; }
            if (bases[0] && bases[1] && bases[2]) { runs++; rbi++; earnedRuns++; }
            if (bases[0] && bases[1]) { bases[2] = 1; }
            if (bases[0]) { bases[1] = 1; }
            bases[0] = 1;
        } else if (roll < bbRate + hbpRate + soRate) {
            // 삼진
            result = '삼진';
            outs++;
            pStats[batId].AB++;
            pStats[batId].SO++;
            if (pitcherId) { pitStats[pitcherId].SO++; pitStats[pitcherId].BF++; }
        } else if (roll < bbRate + hbpRate + soRate + hrRate) {
            // 홈런
            result = '홈런';
            rbi = 1 + bases[0] + bases[1] + bases[2];
            earnedRuns = rbi;
            runs += rbi;
            hits++;
            pStats[batId].AB++;
            pStats[batId].H++;
            pStats[batId].HR++;
            pStats[batId].RBI += rbi;
            if (pitcherId) { pitStats[pitcherId].H++; pitStats[pitcherId].HR++; pitStats[pitcherId].BF++; }
            bases = [0, 0, 0];
        } else if (roll < bbRate + hbpRate + soRate + hrRate + hitRate) {
            // 안타 (단타/2루타/3루타)
            const extraRoll = Math.random();
            let hitType;
            if (extraRoll < 0.65) {
                hitType = '안타';
                // 주자 진루: 3루→홈, 2루→3루(or홈), 1루→2루
                if (bases[2]) { runs++; rbi++; earnedRuns++; bases[2] = 0; }
                if (bases[1]) { bases[2] = 1; bases[1] = 0; if (Math.random() < 0.4) { runs++; rbi++; earnedRuns++; bases[2] = 0; } }
                if (bases[0]) { bases[1] = 1; bases[0] = 0; }
                bases[0] = 1;
            } else if (extraRoll < 0.90) {
                hitType = '2루타';
                pStats[batId]['2B']++;
                if (bases[2]) { runs++; rbi++; earnedRuns++; }
                if (bases[1]) { runs++; rbi++; earnedRuns++; }
                if (bases[0]) { bases[2] = 1; bases[0] = 0; }
                bases[1] = 1;
                bases[2] = bases[2] || 0; // 기존 3루 주자는 이미 득점
            } else {
                hitType = '3루타';
                pStats[batId]['3B']++;
                rbi += bases[0] + bases[1] + bases[2];
                earnedRuns += bases[0] + bases[1] + bases[2];
                runs += bases[0] + bases[1] + bases[2];
                bases = [0, 0, 1];
            }
            result = hitType;
            hits++;
            pStats[batId].AB++;
            pStats[batId].H++;
            pStats[batId].RBI += rbi;
            if (pitcherId) { pitStats[pitcherId].H++; pitStats[pitcherId].BF++; }
        } else {
            // 아웃 (땅볼/뜬공/라인드라이브)
            const outTypes = ['땅볼 아웃', '뜬공 아웃', '플라이 아웃'];
            result = outTypes[Math.floor(Math.random() * 3)];
            outs++;
            pStats[batId].AB++;
            if (pitcherId) { pitStats[pitcherId].BF++; }
            // 희생플라이 (뜬공 + 3루주자 + 아웃 2개 이하)
            if (result === '플라이 아웃' && bases[2] && outs <= 3) {
                runs++;
                rbi++;
                earnedRuns++;
                bases[2] = 0;
                pStats[batId].RBI++;
                result = '희생플라이';
            }
        }

        // 투수 실점 기록
        if (pitcherId && earnedRuns > 0) {
            pitStats[pitcherId].R += earnedRuns;
            pitStats[pitcherId].ER += earnedRuns;
        }
        // 타자 득점 (홈런 타자 본인 득점)
        if (result === '홈런') pStats[batId].R++;

        plays.push({
            batter: batter.name, batterId: batId,
            pitcher: pitcher?.name, pitcherId,
            result, rbi, pitches: paPC,
            bases: [...bases], outs, score: runs,
        });

        batIdx++;
    }

    // 투수 이닝 기록
    if (pitcherId) {
        pitStats[pitcherId].IP = roundIP((pitStats[pitcherId].IP || 0) + outs / 3);
        pitStats[pitcherId].PC = (pitStats[pitcherId].PC || 0) + pitches;
    }

    return { runs, hits, bb, outs: 3, pitches, nextBatIdx: batIdx };
}

/** 불펜에서 교체 투수 찾기 */
function findReliever(state, teamCode, spId, currentPitcherId) {
    const team = state.teams[teamCode];
    if (!team?.depthChart?.bullpen) return null;
    const bp = team.depthChart.bullpen;
    const candidates = [...(bp.setup || []), ...(bp.middle || []), ...(bp.closer || [])];
    for (const pid of candidates) {
        if (pid && pid !== spId && pid !== currentPitcherId) {
            return state.players[pid] || null;
        }
    }
    return null;
}

/**
 * 게임 결과를 박스스코어 HTML로 렌더링
 */
function renderBoxScore(game, state) {
    const home = state.teams[game.homeCode];
    const away = state.teams[game.awayCode];

    // 이닝별 스코어보드
    const maxInn = game.innings.length;
    const innHeaders = game.innings.map(i => `<th>${i.inning}</th>`).join('');
    const awayScores = game.innings.map(i => `<td>${i.away}</td>`).join('');
    const homeScores = game.innings.map(i => `<td>${i.home}</td>`).join('');

    // 라인업 성적
    function renderLineupStats(lineup, teamLabel) {
        return lineup.map((pid, i) => {
            const p = state.players[pid];
            if (!p) return '';
            const gs = game.playerGameStats[pid] || {};
            const avg = gs.AB > 0 ? (gs.H / gs.AB).toFixed(3) : '-';
            return `<tr>
                <td>${i + 1}</td>
                <td>${p.position}</td>
                <td style="cursor:pointer;text-decoration:underline dotted;" onclick="if(state.players['${pid}'])showPlayerModal(state.players['${pid}'])">${p.name}</td>
                <td>${gs.AB || 0}-${gs.H || 0}</td>
                <td>${gs.RBI || 0}</td>
                <td>${gs.R || 0}</td>
                <td>${gs.HR || 0}</td>
                <td>${gs.BB || 0}</td>
                <td>${gs.SO || 0}</td>
            </tr>`;
        }).join('');
    }

    return `
    <div class="boxscore">
        <div class="boxscore__scoreboard">
            <table>
                <thead><tr><th>팀</th>${innHeaders}<th>R</th><th>H</th><th>E</th><th>B</th></tr></thead>
                <tbody>
                    <tr><td><strong>${away.name}</strong></td>${awayScores}<td><strong>${game.awayScore}</strong></td><td>${game.awayHits}</td><td>${game.awayErrors}</td><td>${game.awayBB}</td></tr>
                    <tr><td><strong>${home.name}</strong></td>${homeScores}<td><strong>${game.homeScore}</strong></td><td>${game.homeHits}</td><td>${game.homeErrors}</td><td>${game.homeBB}</td></tr>
                </tbody>
            </table>
        </div>
        <div class="boxscore__lineups" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;">
            <div>
                <h4>${away.name} 라인업</h4>
                <table class="player-table" style="font-size:12px;">
                    <thead><tr><th>#</th><th>포지션</th><th>선수</th><th>타수-안타</th><th>타점</th><th>득점</th><th>HR</th><th>BB</th><th>SO</th></tr></thead>
                    <tbody>${renderLineupStats(game.awayLineup || [], away.name)}</tbody>
                </table>
            </div>
            <div>
                <h4>${home.name} 라인업</h4>
                <table class="player-table" style="font-size:12px;">
                    <thead><tr><th>#</th><th>포지션</th><th>선수</th><th>타수-안타</th><th>타점</th><th>득점</th><th>HR</th><th>BB</th><th>SO</th></tr></thead>
                    <tbody>${renderLineupStats(game.homeLineup || [], home.name)}</tbody>
                </table>
            </div>
        </div>
    </div>`;
}

/**
 * 플레이바이플레이 HTML 렌더링
 */
function renderPlayByPlay(game, state) {
    const home = state.teams[game.homeCode];
    const away = state.teams[game.awayCode];

    let html = '';
    for (const inn of game.innings) {
        html += `<div class="pbp-inning"><h4>${inn.inning}회</h4>`;
        // 초 (원정 공격)
        html += `<div class="pbp-half"><strong>${away.name} 공격</strong>`;
        for (const play of inn.awayPlays) {
            const cls = play.result.includes('홈런') ? 'pbp-hr' : play.result.includes('안타') || play.result.includes('2루타') || play.result.includes('3루타') ? 'pbp-hit' : play.result.includes('삼진') ? 'pbp-so' : '';
            html += `<div class="pbp-play ${cls}"><span class="pbp-batter">${play.batter}</span> <span class="pbp-result">${play.result}</span>${play.rbi > 0 ? ` <span class="pbp-rbi">${play.rbi}타점</span>` : ''}</div>`;
        }
        html += `</div>`;
        // 말 (홈 공격)
        if (inn.homePlays.length > 0) {
            html += `<div class="pbp-half"><strong>${home.name} 공격</strong>`;
            for (const play of inn.homePlays) {
                const cls = play.result.includes('홈런') ? 'pbp-hr' : play.result.includes('안타') || play.result.includes('2루타') || play.result.includes('3루타') ? 'pbp-hit' : play.result.includes('삼진') ? 'pbp-so' : '';
                html += `<div class="pbp-play ${cls}"><span class="pbp-batter">${play.batter}</span> <span class="pbp-result">${play.result}</span>${play.rbi > 0 ? ` <span class="pbp-rbi">${play.rbi}타점</span>` : ''}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    }
    return html;
}

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
window.simulateGame = simulateGame;
window.renderBoxScore = renderBoxScore;
window.renderPlayByPlay = renderPlayByPlay;
