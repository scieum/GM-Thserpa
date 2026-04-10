// ===== 메인 앱 컨트롤러 =====

let state = null;
let tradeSelection = { send: [], recv: [] };

// ── 초기화 ──
function initApp() {
    state = loadState();
    window.state = state;
    updateAllPowerScores();
    setupNav();
    setupTopBarActions();
    renderTeamSidebar();
    setupPlayerSearch();
    renderDashboard();
    setupRosterView();
    setupDepthChartView();
    setupTradeView();
    setupSimulatorView();
    setupPostseasonView();
    initForeignScout();
    updateQuarterBadge();
    showView('dashboard');

    // 글로벌 ESC 키 → 모달/패널 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const playerModal = document.getElementById('playerModal');
            if (playerModal && playerModal.style.display !== 'none') { playerModal.style.display = 'none'; return; }
            const swapModal = document.getElementById('swapModal');
            if (swapModal && swapModal.style.display !== 'none') { closeSwapModal(); return; }
            // 스카우트 비교/상세 페이지 → 검색 결과로 복귀
            const comparePage = document.getElementById('scoutComparePage');
            if (comparePage && comparePage.style.display !== 'none') {
                document.getElementById('scoutCompareBack').click(); return;
            }
            const detailPage = document.getElementById('scoutDetailPage');
            if (detailPage && detailPage.style.display !== 'none') {
                document.getElementById('scoutDetailBack').click();
            }
        }
    });
}

function loadState() {
    try {
        const saved = localStorage.getItem('kbo-sim-state');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.teams && parsed.players) {
                // 시즌 완료 감지: 144경기 모두 진행 or 챔피언 결정
                const firstTeam = Object.values(parsed.teams)[0];
                if (firstTeam) {
                    let totalGames = 0;
                    for (let q = 1; q <= 4; q++) {
                        const r = firstTeam.seasonRecord?.[`q${q}`];
                        if (r) totalGames += (r.wins || 0) + (r.losses || 0) + (r.draws || 0);
                    }
                    const hasChampion = !!parsed.champion;
                    if (totalGames >= 144 || hasChampion) {
                        if (confirm('이전 시즌이 종료되었습니다.\n새로운 시즌을 시작하시겠습니까?\n\n[확인] → 새 시즌 시작\n[취소] → 이전 시즌 데이터 유지')) {
                            localStorage.removeItem('kbo-sim-state');
                            localStorage.removeItem('kbo-foreign-scout-state');
                            return generateSampleData();
                        }
                    }
                }
                return parsed;
            }
        }
    } catch (e) { /* ignore */ }
    return generateSampleData();
}

function saveState() {
    localStorage.setItem('kbo-sim-state', JSON.stringify(state));
    showToast('저장 완료!', 'success');
}

function resetState() {
    // 교사만 초기화 가능
    if (typeof isStudent === 'function' && isStudent()) {
        showToast('초기화는 교사만 실행할 수 있습니다.', 'warning');
        return;
    }

    const totalPlayed = getTotalGamesPlayed(state);
    let msg = '모든 데이터를 초기 상태로 되돌립니다.\n계속하시겠습니까?';
    if (totalPlayed > 0) {
        msg = `⚠️ 현재 ${totalPlayed}/144 경기가 진행된 상태입니다.\n\n` +
              `초기화하면 모든 시즌 기록, 트레이드 내역, 선수 데이터가 삭제됩니다.\n` +
              `학생 화면도 함께 초기화됩니다.\n\n정말 처음부터 다시 시작하시겠습니까?`;
    }
    if (!confirm(msg)) return;

    // 시즌 진행 중이면 2차 확인
    if (totalPlayed >= 36) {
        if (!confirm('정말로 초기화합니다. 되돌릴 수 없습니다!')) return;
    }

    // 로컬 데이터 모두 제거
    localStorage.removeItem('kbo-sim-state');
    localStorage.removeItem('kbo-foreign-scout-state');
    // 시즌 변동 캐시 초기화
    window._seasonVarCache = {};

    // ── Supabase 동기화: 학생에게 초기화 전파 ──
    const teamCodes = ['LG','두산','롯데','KIA','KT','한화','NC','SSG','키움','삼성'];
    const emptyRecord = {
        q1:{wins:0,losses:0,draws:0,rs:0,ra:0}, q2:{wins:0,losses:0,draws:0,rs:0,ra:0},
        q3:{wins:0,losses:0,draws:0,rs:0,ra:0}, q4:{wins:0,losses:0,draws:0,rs:0,ra:0}
    };

    try {
        const promises = [];

        // 1) 전체 팀 시즌 기록 초기화
        if (typeof saveAllGameStates === 'function') {
            const statesMap = {};
            for (const code of teamCodes) {
                statesMap[code] = { season_record: emptyRecord };
            }
            promises.push(saveAllGameStates(statesMap));
        }

        // 2) sim_results 전체 삭제 후 빈 데이터 저장
        if (typeof clearSimResults === 'function') {
            promises.push(clearSimResults());
        }
        if (typeof saveSimResult === 'function') {
            const emptyStandings = teamCodes.map(code => ({
                code, wins: 0, losses: 0, draws: 0, rate: 0,
                seasonRecord: emptyRecord,
            }));
            promises.push(saveSimResult(0, emptyStandings, { totalGames: 0, reset: true }));
        }

        // 3) 교실 상태 초기화
        if (typeof updateClassroom === 'function') {
            promises.push(updateClassroom({ is_simulating: false, current_quarter: 0, season_phase: 'pre' }));
        }

        // 4) 활동 로그
        if (typeof logActivity === 'function') {
            promises.push(logActivity(null, 'reset', { message: '교사가 시즌을 초기화했습니다.' }));
        }

        // 모든 Supabase 작업 완료 후 새로고침
        Promise.all(promises).then(() => {
            location.reload();
        }).catch(() => {
            location.reload();
        });
    } catch (e) {
        // Supabase 없어도 새로고침
        location.reload();
    }
}

function updateAllPowerScores() {
    for (const id of Object.keys(state.players)) {
        state.players[id].powerScore = calcPlayerPower(state.players[id]);
    }
}

// ── 뷰 라우팅 ──
function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        // foreign-scout 탭은 foreign-scout.js에서 별도 처리
        if (btn.id === 'navForeignScout') return;
        btn.addEventListener('click', () => showView(btn.dataset.view));
    });
}

function showView(viewName) {
    // 외국인 스카우트: 학생은 1Q 완료 전 진입 차단
    if (viewName === 'foreign-scout' && typeof isStudent === 'function' && isStudent()) {
        const totalPlayed = (typeof getTotalGamesPlayed === 'function' && state) ? getTotalGamesPlayed(state) : 0;
        if (totalPlayed < 36) {
            if (typeof showToast === 'function') showToast('1Q 시뮬레이션이 완료된 후 외국인 스카우트가 열립니다.');
            return;
        }
    }

    // admin 뷰 처리
    if (viewName === 'admin') {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('view-admin').classList.add('active');
        if (typeof renderAdminPanel === 'function') renderAdminPanel();
        return;
    }

    // "futures" 탭은 roster 뷰를 열고 2군 탭으로 전환
    const isFutures = viewName === 'futures';
    const actualView = isFutures ? 'roster' : viewName;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const viewEl = document.getElementById(`view-${actualView}`);
    if (viewEl) viewEl.classList.add('active');
    const navBtn = document.querySelector(`.nav-btn[data-view="${viewName}"]`);
    if (navBtn) navBtn.classList.add('active');

    // 1군/2군 탭 전환
    if (isFutures || viewName === 'roster') {
        rosterTier = isFutures ? '2군' : '1군';
        document.querySelectorAll('.tier-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tier === rosterTier);
        });
    }

    // 로스터에서 선택한 구단을 뎁스차트/트레이드에 동기화
    if (viewName === 'depthchart' || viewName === 'trade') {
        const rosterSel = document.getElementById('rosterTeamSelect');
        if (rosterSel && rosterSel.value) {
            if (viewName === 'depthchart') {
                const dcSel = document.getElementById('dcTeamSelect');
                if (dcSel) { dcSel.value = rosterSel.value; dcTeam = rosterSel.value; }
            }
            if (viewName === 'trade') {
                const tradeSel = document.getElementById('tradeSendTeam');
                if (tradeSel) tradeSel.value = rosterSel.value;
            }
        }
    }

    // 뎁스차트/트레이드에서 선택한 구단을 로스터에 역동기화
    if (viewName === 'roster' || isFutures) {
        const dcSel = document.getElementById('dcTeamSelect');
        const rosterSel = document.getElementById('rosterTeamSelect');
        if (dcSel && dcSel.value && rosterSel) {
            rosterSel.value = dcSel.value;
        }
    }

    // Refresh view data
    if (actualView === 'dashboard') renderDashboard();
    if (actualView === 'roster') renderRoster();
    if (viewName === 'depthchart') renderDepthChart();
    if (viewName === 'trade') renderTradeView();
    if (viewName === 'scout') setupScoutView();
    if (viewName === 'foreign-scout') renderForeignScout();
    if (viewName === 'stadium') renderStadiumView();
    if (viewName === 'schedule') renderScheduleView();
    if (viewName === 'simulator') renderSimulator();
    if (viewName === 'postseason') renderPostseason();
    if (viewName === 'news') renderNewsView();
}

function updateQuarterBadge() {
    const badge = document.getElementById('quarterBadge');
    const totalPlayed = getTotalGamesPlayed(state);
    if (totalPlayed >= 144) {
        badge.textContent = '시즌 종료';
        badge.style.background = '#22c55e';
        badge.style.cursor = 'default';
    } else if (totalPlayed === 0) {
        badge.textContent = '시즌 시작 전';
        badge.style.cursor = 'pointer';
    } else {
        const q = Math.floor(totalPlayed / 36) + 1;
        badge.textContent = `현재: ${Math.min(q, 4)}Q`;
        badge.style.cursor = 'pointer';
    }
}

// ── 상단 액션 ──
function setupTopBarActions() {
    document.getElementById('btnSave').addEventListener('click', saveState);
    document.getElementById('btnReset').addEventListener('click', resetState);

    // 다크/라이트 모드 토글
    const themeBtn = document.getElementById('btnThemeToggle');
    const savedTheme = localStorage.getItem('kbo-sim-theme') || 'light';
    applyTheme(savedTheme);

    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        applyTheme(isDark ? 'light' : 'dark');
    });
}

function applyTheme(theme) {
    const btn = document.getElementById('btnThemeToggle');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        btn.textContent = '다크';
    } else {
        document.documentElement.removeAttribute('data-theme');
        btn.textContent = '라이트';
    }
    localStorage.setItem('kbo-sim-theme', theme);
}

// ── 구단 사이드바 ──
function renderTeamSidebar() {
    const sidebar = document.getElementById('teamSidebar');
    sidebar.innerHTML = '';

    // 스카우트 버튼
    const scoutBtn = document.createElement('button');
    scoutBtn.className = 'team-sidebar__scout';
    scoutBtn.title = '선수 스카우트';
    scoutBtn.innerHTML = '🔍';
    scoutBtn.addEventListener('click', () => {
        showView('scout');
    });
    sidebar.appendChild(scoutBtn);

    // 구분선
    const divider = document.createElement('div');
    divider.className = 'team-sidebar__divider';
    sidebar.appendChild(divider);

    for (const code of Object.keys(state.teams)) {
        const item = document.createElement('div');
        item.className = 'team-sidebar__item';
        item.dataset.team = code;
        item.title = state.teams[code].name;
        item.innerHTML = `<img src="${teamLogo(code)}" alt="${code}">`;
        item.addEventListener('click', () => {
            // 현재 어떤 뷰에 있는지 확인
            const currentView = document.querySelector('.view.active');
            const viewId = currentView ? currentView.id : '';

            if (viewId === 'view-depthchart') {
                // 뎁스차트 → 같은 뎁스차트에서 팀만 변경
                const dcSel = document.getElementById('dcTeamSelect');
                if (dcSel) dcSel.value = code;
                dcTeam = code;
                ensureDepthChart(code);
                renderDepthChart();
            } else if (viewId === 'view-trade') {
                // 트레이드 → 보내는 팀 변경
                const tradeSel = document.getElementById('tradeSendTeam');
                if (tradeSel) tradeSel.value = code;
                renderTradeView();
            } else {
                // 로스터 (1군/2군 유지)
                const sel = document.getElementById('rosterTeamSelect');
                if (sel) sel.value = code;
                // 현재 1군/2군 탭 상태 유지
                if (viewId !== 'view-roster') {
                    showView('roster');
                }
                renderRoster();
            }
            updateSidebarActive(code);
        });
        sidebar.appendChild(item);
    }
}

function updateSidebarActive(code) {
    document.querySelectorAll('.team-sidebar__item').forEach(el => {
        el.classList.toggle('active', el.dataset.team === code);
    });
}

// ── 선수 검색 ──
function setupPlayerSearch() {
    const input = document.getElementById('playerSearchInput');
    const resultsDiv = document.getElementById('searchResults');

    input.addEventListener('input', () => {
        const q = input.value.trim();
        if (q.length < 1) { resultsDiv.style.display = 'none'; return; }
        const results = searchPlayers(q);
        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="search-result__no-match">검색 결과 없음</div>';
        } else {
            resultsDiv.innerHTML = results.slice(0, 15).map(p => `
                <div class="search-result" data-team="${p.team}" data-id="${p.id}">
                    <img class="search-result__logo" src="${teamLogo(p.team)}" alt="">
                    <span class="search-result__name">${p.name}</span>
                    <span class="search-result__info">#${p.number || '-'} ${p.pos} ${p.salary ? p.salary.toFixed(1) + '억' : ''}${p.statLine ? ' · ' + p.statLine : ''}</span>
                </div>
            `).join('');
        }
        resultsDiv.style.display = 'block';
    });

    // 엔터키: 첫 번째 결과로 이동
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const firstResult = resultsDiv.querySelector('.search-result');
            if (firstResult) firstResult.click();
        }
    });

    resultsDiv.addEventListener('click', (e) => {
        const item = e.target.closest('.search-result');
        if (!item) return;
        const playerId = item.dataset.id;
        const player = state.players[playerId];
        if (player) {
            // 스카우트 뷰로 이동 후 해당 선수 모달 바로 오픈
            showView('scout');
            // 모드 설정 (투수/야수)
            scoutMode = player.position === 'P' ? 'pitcher' : 'batter';
            document.querySelectorAll('.scout-mode-tab').forEach(t => t.classList.toggle('active', t.dataset.scoutMode === scoutMode));
            document.getElementById('scoutPitcherFilters').style.display = scoutMode === 'pitcher' ? '' : 'none';
            document.getElementById('scoutBatterFilters').style.display = scoutMode === 'batter' ? '' : 'none';
            // 이름 필터 설정
            const panelId = scoutMode === 'pitcher' ? 'scoutPitcherFilters' : 'scoutBatterFilters';
            document.getElementById(panelId).querySelector('input[data-f="name"]').value = player.name;
            runScoutSearch();
            // 인라인 상세 패널로 표시
            setTimeout(() => showScoutDetailInline(player), 100);
        }
        input.value = '';
        resultsDiv.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#searchBox')) resultsDiv.style.display = 'none';
    });
}

function searchPlayers(query) {
    const results = [];
    const q = query.toLowerCase();
    for (const [id, p] of Object.entries(state.players)) {
        if (p.name && p.name.toLowerCase().includes(q)) {
            const rs = p.realStats;
            let statLine = '';
            if (rs && p.position === 'P') {
                statLine = `ERA ${rs.ERA != null ? rs.ERA.toFixed(2) : '-'} / WAR ${rs.WAR != null ? rs.WAR.toFixed(1) : '-'}`;
            } else if (rs && p.position !== 'P') {
                statLine = `AVG ${rs.AVG != null ? rs.AVG.toFixed(3) : '-'} / OPS ${rs.OPS != null ? rs.OPS.toFixed(3) : '-'}`;
            }
            results.push({ id, name: p.name, team: p.team, pos: p.position || p.pos || '', number: p.number, salary: p.salary, statLine });
        }
    }
    results.sort((a, b) => (b.salary || 0) - (a.salary || 0));
    return results;
}

// ══════════════════════════════════════════
// ██ DASHBOARD VIEW
// ══════════════════════════════════════════

function renderDashboard() {
    const grid = document.getElementById('teamGrid');
    grid.innerHTML = '';

    for (const code of Object.keys(state.teams)) {
        const team = state.teams[code];
        const pp = calcTeamPitchPower(state, code);
        const bp = calcTeamBatPower(state, code);
        const record = getTeamTotalRecord(team);
        const capSalary = calcTeamSalaryCap(state, code);
        const penalty = calcCapPenalty(state, code);
        const capPct = Math.min((capSalary / KBO_SALARY_CAP) * 100, 120);
        const capColor = penalty.overCap ? '#ED1C24' : capPct > 90 ? '#B3A177' : '#22c55e';

        const card = document.createElement('div');
        card.className = 'team-card';
        card.style.setProperty('--team-color', team.color);
        card.innerHTML = `
            <div class="team-card__header">
                <img class="team-emblem" src="${teamEmblem(code)}" alt="${team.name}">
                <div>
                    <div class="team-card__name">${team.name}</div>
                    <div class="team-card__record">${record.wins}승 ${record.losses}패 (${formatRate(record.rate)})</div>
                </div>
            </div>
            <div class="team-card__power">
                <div class="power-row">
                    <span class="power-row__label">투수</span>
                    <div class="power-bar">
                        <div class="power-bar__fill" style="width:${pp}%; background:${powerColor(pp)};"></div>
                    </div>
                    <span class="power-row__value">${pp.toFixed(1)}</span>
                </div>
                <div class="power-row">
                    <span class="power-row__label">타자</span>
                    <div class="power-bar">
                        <div class="power-bar__fill" style="width:${bp}%; background:${powerColor(bp)};"></div>
                    </div>
                    <span class="power-row__value">${bp.toFixed(1)}</span>
                </div>
                <div class="power-row" style="margin-top:4px;">
                    <span class="power-row__label" style="color:${capColor};">연봉</span>
                    <div class="power-bar">
                        <div class="power-bar__fill" style="width:${Math.min(capPct, 100)}%; background:${capColor};"></div>
                    </div>
                    <span class="power-row__value" style="color:${capColor}; width:50px;">${capSalary.toFixed(0)}억</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => showTeamDetail(code));
        grid.appendChild(card);
    }
}

function showTeamDetail(code) {
    const detail = document.getElementById('teamDetail');
    detail.style.display = 'block';
    const team = state.teams[code];
    const record = getTeamTotalRecord(team);

    document.getElementById('detailTeamName').textContent = team.name;
    document.getElementById('detailRecord').textContent = `${record.wins}승 ${record.losses}패 (${formatRate(record.rate)})`;
    document.getElementById('detailEmblem').src = teamEmblem(code);
    document.getElementById('detailEmblem').alt = team.name;

    // Power compare bars
    const pp = calcTeamPitchPower(state, code);
    const bp = calcTeamBatPower(state, code);
    const leaguePP = calcLeagueAvgPitchPower(state);
    const leagueBP = calcLeagueAvgBatPower(state);

    document.getElementById('detailPitchCompare').innerHTML = `
        <div class="compare-bar">
            <span class="compare-bar__label">우리 팀</span>
            <div class="compare-bar__track">
                <div class="compare-bar__fill" style="width:${pp}%; background:${team.color};"></div>
            </div>
            <span class="compare-bar__value">${pp.toFixed(1)}</span>
        </div>
        <div class="compare-bar">
            <span class="compare-bar__label">리그 평균</span>
            <div class="compare-bar__track">
                <div class="compare-bar__fill" style="width:${leaguePP}%; background:#8899aa;"></div>
            </div>
            <span class="compare-bar__value">${leaguePP.toFixed(1)}</span>
        </div>
    `;

    document.getElementById('detailBatCompare').innerHTML = `
        <div class="compare-bar">
            <span class="compare-bar__label">우리 팀</span>
            <div class="compare-bar__track">
                <div class="compare-bar__fill" style="width:${bp}%; background:${team.color};"></div>
            </div>
            <span class="compare-bar__value">${bp.toFixed(1)}</span>
        </div>
        <div class="compare-bar">
            <span class="compare-bar__label">리그 평균</span>
            <div class="compare-bar__track">
                <div class="compare-bar__fill" style="width:${leagueBP}%; background:#8899aa;"></div>
            </div>
            <span class="compare-bar__value">${leagueBP.toFixed(1)}</span>
        </div>
    `;

    // Finance info
    const fin = team.finance;
    const rawSalary = calcTeamSalaryRaw(state, code);
    const capSalary = calcTeamSalaryCap(state, code);
    const penalty = calcCapPenalty(state, code);
    const availBudget = calcAvailableBudget(state, code);
    const franchiseStar = getTeamPlayers(state, code).find(p => p.isFranchiseStar);

    let capStatusClass = 'cap-status--ok';
    let capStatusText = `샐러리캡 준수 (${capSalary.toFixed(1)}억 / ${KBO_SALARY_CAP}억)`;
    if (penalty.overCap) {
        capStatusClass = 'cap-status--over';
        capStatusText = `샐러리캡 초과! ${penalty.excess.toFixed(1)}억 초과 → 제재금 ${penalty.penaltyAmount.toFixed(1)}억 (${penalty.description})`;
    } else if (capSalary / KBO_SALARY_CAP > 0.9) {
        capStatusClass = 'cap-status--warning';
        capStatusText = `샐러리캡 근접 주의 (${capSalary.toFixed(1)}억 / ${KBO_SALARY_CAP}억)`;
    }

    document.getElementById('detailFinance').innerHTML = `
        <h4 style="margin-top:16px;">재정 현황</h4>
        <div class="finance-grid">
            <div class="finance-item">
                <div class="finance-item__label">총 자산</div>
                <div class="finance-item__value">${fin.totalAssets}억</div>
            </div>
            <div class="finance-item">
                <div class="finance-item__label">현금</div>
                <div class="finance-item__value">${fin.cash}억</div>
            </div>
            <div class="finance-item ${fin.debt > 50 ? 'finance-item--danger' : fin.debt > 0 ? 'finance-item--warning' : 'finance-item--success'}">
                <div class="finance-item__label">부채</div>
                <div class="finance-item__value">${fin.debt}억</div>
            </div>
            <div class="finance-item">
                <div class="finance-item__label">선수 연봉 (실제)</div>
                <div class="finance-item__value">${rawSalary.toFixed(1)}억</div>
            </div>
            <div class="finance-item">
                <div class="finance-item__label">캡 적용 연봉</div>
                <div class="finance-item__value">${capSalary.toFixed(1)}억</div>
            </div>
            <div class="finance-item ${availBudget < 10 ? 'finance-item--danger' : 'finance-item--success'}">
                <div class="finance-item__label">가용 예산</div>
                <div class="finance-item__value">${availBudget.toFixed(1)}억</div>
            </div>
        </div>
        <div class="cap-status ${capStatusClass}" style="margin-top:10px;">
            ${capStatusText}
        </div>
        ${franchiseStar ? `<div style="margin-top:8px; font-size:12px; color:#8899aa;">
            <span class="franchise-star-badge">★ 프랜차이즈 스타</span>
            ${franchiseStar.name} (연봉 ${franchiseStar.salary}억 → 캡 적용 ${(franchiseStar.salary * 0.5).toFixed(1)}억)
        </div>` : ''}
    `;

    // Radar chart
    const teamData = getTeamRadarData(state, code);
    const leagueData = getLeagueRadarData(state);
    createRadarChart('radarChart', teamData, leagueData, team.color);

    // 감독/코치 + 1군 로스터 요약
    renderDetailRoster(code);
    // 홈구장 정보
    renderDetailStadium(code);

    document.getElementById('detailClose').onclick = () => { detail.style.display = 'none'; };
}

function renderDetailRoster(code) {
    const el = document.getElementById('detailRoster');
    const team = state.teams[code];
    const staff = COACHING_STAFF[code];
    const players = getTeamPlayers(state, code);
    const pitchers = players.filter(p => p.position === 'P');
    const batters = players.filter(p => p.position !== 'P');

    // 코칭스태프
    const coachList = staff ? staff.coaches.map(c => {
        return `<span class="staff-tag">${c}</span>`;
    }).join('') : '';

    // 투수 목록
    const pRows = pitchers.map(p => {
        const hasOvr = p.ovr != null;
        const displayVal = hasOvr ? p.ovr : ((typeof p.power === 'number') ? p.power.toFixed(1) : '-');
        const displayColor = hasOvr ? ratingColor(p.ovr) : powerColor(p.power);
        return `<tr>
            <td class="num-cell" style="color:var(--text-dim);cursor:pointer;" onclick="event.stopPropagation(); editPlayerNumber('${p.id}', this)" title="클릭하여 등번호 변경">${p.number != null ? p.number : '-'}</td>
            <td style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;" onclick="if(state.players['${p.id}'])showPlayerModal(state.players['${p.id}'])">${p.name}${p.isForeign ? ' <span style="color:var(--kbo-gold);font-size:10px;">외</span>' : ''}${p.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}</td>
            <td>${p.role || '-'}</td>
            <td style="color:${displayColor};">${displayVal}</td>
            <td>${p.salary}억</td>
        </tr>`;
    }).join('');

    // 야수 목록
    const bRows = batters.map(b => {
        const pw = (typeof b.power === 'number') ? b.power.toFixed(1) : '-';
        const ovr = b.ovr != null ? b.ovr : pw;
        return `<tr>
            <td style="color:var(--text-dim);">${b.number != null ? b.number : '-'}</td>
            <td style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;" onclick="if(state.players['${b.id}'])showPlayerModal(state.players['${b.id}'])">${b.name}${b.isForeign ? ' <span style="color:var(--kbo-gold);font-size:10px;">외</span>' : ''}${b.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}</td>
            <td>${b.position}</td>
            <td style="color:${powerColor(typeof ovr === 'number' ? ovr : b.power)};">${typeof ovr === 'number' ? ovr.toFixed(0) : pw}</td>
            <td>${b.salary}억</td>
        </tr>`;
    }).join('');

    el.innerHTML = `
        <div class="detail-staff">
            <h4>코칭스태프</h4>
            <div class="staff-manager">
                <img class="team-logo-sm" src="${teamLogo(code)}" alt="">
                <strong>감독</strong> ${(staff ? staff.manager : team.manager).replace(/#\d+/, '')}
            </div>
            <div class="staff-coaches">${coachList}</div>
        </div>
        <div class="detail-roster-tables">
            <div class="detail-roster-col">
                <h4>투수진 <span class="detail-count">${pitchers.length}명</span></h4>
                <table class="detail-roster-table">
                    <thead><tr><th>#</th><th>이름</th><th>역할</th><th>OVR</th><th>연봉</th></tr></thead>
                    <tbody>${pRows}</tbody>
                </table>
            </div>
            <div class="detail-roster-col">
                <h4>야수진 <span class="detail-count">${batters.length}명</span></h4>
                <table class="detail-roster-table">
                    <thead><tr><th>#</th><th>이름</th><th>포지션</th><th>OVR</th><th>연봉</th></tr></thead>
                    <tbody>${bRows}</tbody>
                </table>
            </div>
        </div>
    `;
}

// ══════════════════════════════════════════
// ██ STADIUM VIEW
// ══════════════════════════════════════════

const KBO_STADIUMS = {
    'LG':  {
        main:'서울종합운동장 야구장', short:'잠실야구장', alt:null,
        city:'서울', type:'개방형',
        dims:{L:100, LC:120, C:125, RC:120, R:100, wall:2.6},
        note:'LG·두산 공동 홈구장',
        chars:[
            { icon:'🏟', text:'KBO 최대 규모 구장' },
            { icon:'💨', text:'깊은 외야로 홈런 억제, 투수 유리' },
            { icon:'🏃', text:'외야 수비 범위가 승패 좌우' },
            { icon:'📉', text:'득점 낮은 투수전 경향' },
        ],
    },
    '두산': {
        main:'서울종합운동장 야구장', short:'잠실야구장', alt:null,
        city:'서울', type:'개방형',
        dims:{L:100, LC:120, C:125, RC:120, R:100, wall:2.6},
        note:'LG·두산 공동 홈구장',
        chars:[
            { icon:'🏟', text:'KBO 최대 규모 구장' },
            { icon:'💨', text:'깊은 외야로 홈런 억제, 투수 유리' },
            { icon:'🏃', text:'외야 수비 범위가 승패 좌우' },
            { icon:'📉', text:'득점 낮은 투수전 경향' },
        ],
    },
    '한화': {
        main:'대전 한화생명 볼파크', short:'한화생명 볼파크', alt:'청주 야구장†',
        city:'대전', type:'개방형',
        dims:{L:99, LC:115, C:122, RC:112, R:95, wall:null},
        note:'비대칭 구장 — 우측 펜스 95m',
        chars:[
            { icon:'⚖️', text:'비대칭 설계 — 우측이 좌측보다 4m 짧음' },
            { icon:'💥', text:'좌타자 당겨치기 홈런 유리 (우측 95m)' },
            { icon:'🎯', text:'배트 컨트롤·상황 대응 능력이 핵심' },
            { icon:'🆕', text:'2024 신축 구장, 관중 친화 설계' },
        ],
    },
    'SSG': {
        main:'인천 SSG 랜더스필드', short:'랜더스필드', alt:null,
        city:'인천', type:'개방형',
        dims:{L:95, LC:115, C:120, RC:115, R:95, wall:2.8},
        note:null,
        chars:[
            { icon:'💥', text:'좌우 폴 95m — KBO 최단 수준, 홈런 다발' },
            { icon:'⚾', text:'타자 친화적, 득점 많은 경기 多' },
            { icon:'🌊', text:'해풍 영향으로 타구 방향 예측 어려움' },
            { icon:'🏃', text:'짧은 외야지만 코너 타구 처리가 변수' },
        ],
    },
    '삼성': {
        main:'대구 삼성 라이온즈 파크', short:'라이온즈파크', alt:'포항 야구장',
        city:'대구', type:'개방형',
        dims:{L:99.5, LC:107, C:122.5, RC:107, R:99.5, wall:3.6},
        note:'좌우중간 107m · 펜스 높이 3.6m',
        chars:[
            { icon:'🧱', text:'높은 펜스(3.6m)로 홈런 억제 효과 큼' },
            { icon:'📏', text:'좌우중간 107m — KBO 최단, 2루타가 줄어듦' },
            { icon:'⚾', text:'장타보다 컨택·라인드라이브 타격 유리' },
            { icon:'🌿', text:'투수·수비 중심 야구가 잘 맞는 구장' },
        ],
    },
    'NC':  {
        main:'창원NC파크', short:'NC파크', alt:null,
        city:'창원', type:'개방형',
        dims:{L:101, LC:107, C:122, RC:107, R:101, wall:3.3},
        note:'중앙 좌우측 123m · 투수 친화',
        chars:[
            { icon:'🔵', text:'좌우폴 101m — KBO에서 가장 넓은 편' },
            { icon:'🏃', text:'광활한 외야, 수비 범위와 스피드 필수' },
            { icon:'🌿', text:'투수 친화 구장 — 실점 억제에 유리' },
            { icon:'📏', text:'좌우중간 좁음(107m)으로 장타 예측 어려움' },
        ],
    },
    'KT':  {
        main:'수원 케이티 위즈 파크', short:'위즈파크', alt:null,
        city:'수원', type:'개방형',
        dims:{L:98, LC:115, C:120, RC:115, R:98, wall:4.0},
        note:'펜스 높이 4m',
        chars:[
            { icon:'🧱', text:'KBO 최고 높이 펜스(4m) — 홈런 크게 줄어듦' },
            { icon:'🎯', text:'펜스 직격 2루타 전략이 중요' },
            { icon:'🏃', text:'발 빠른 외야수가 더 빛나는 구장' },
            { icon:'⚾', text:'컨택 타자·2루타 생산력이 핵심 지표' },
        ],
    },
    '롯데': {
        main:'사직 야구장', short:'사직야구장', alt:'울산 문수 야구장',
        city:'부산', type:'개방형',
        dims:{L:95.8, LC:null, C:121, RC:null, R:95.8, wall:'4.8~6.0'},
        note:'폴대 근처 6m · 중앙·좌우측 4.8m',
        chars:[
            { icon:'🎭', text:'짧은 거리(95.8m)와 높은 펜스(6m)의 역설' },
            { icon:'💥', text:'홈런 여부 예측 불가 — 경기 변수 최대' },
            { icon:'👥', text:'성지 분위기, 홈 어드밴티지 KBO 최강' },
            { icon:'🌊', text:'해풍 강해 우타자 밀어치기 홈런 유리' },
        ],
    },
    'KIA': {
        main:'광주-기아 챔피언스 필드', short:'챔피언스필드', alt:'월명종합경기장 야구장†',
        city:'광주', type:'개방형',
        dims:{L:99, LC:117, C:121, RC:117, R:99, wall:2.6},
        note:'낮은 펜스(2.6m) · 타자 친화',
        chars:[
            { icon:'💥', text:'낮은 펜스(2.6m) — KBO 최저, 홈런 빈발' },
            { icon:'📈', text:'타자 천국 — 득점 많은 화끈한 경기 多' },
            { icon:'🏃', text:'넓은 외야 + 잦은 홈런, 외야 수비력 필수' },
            { icon:'⚾', text:'장타력 있는 타선이 더욱 빛나는 구장' },
        ],
    },
    '키움': {
        main:'고척 스카이돔', short:'고척돔', alt:null,
        city:'서울', type:'돔',
        dims:{L:99, LC:null, C:122, RC:null, R:99, wall:4.0},
        note:'KBO 유일 돔구장 · 연면적 83,476㎡',
        chars:[
            { icon:'🏛', text:'KBO 유일 돔구장 — 우천 취소 없음' },
            { icon:'⚡', text:'인조잔디로 타구 바운드 빠르고 예측 어려움' },
            { icon:'🌡', text:'바람 없어 타구 궤적이 안정적' },
            { icon:'🎵', text:'밀폐 공간 함성 울림 — 홈 심리적 이점 큼' },
        ],
    },
};

// SVG 구장 다이어그램 생성
function generateStadiumSVG(dims, color, mini = false) {
    const W = mini ? 180 : 240, H = mini ? 140 : 190;
    const hx = W / 2, hy = H - 10;
    const scale = (H - 45) / dims.C;

    const SIN45 = 0.7071, COS45 = 0.7071;
    const SIN22 = 0.3746, COS22 = 0.9272;

    function pt(dist, sx, cx) {
        return { x: +(hx + dist * scale * sx).toFixed(1), y: +(hy - dist * scale * cx).toFixed(1) };
    }

    const LP = pt(dims.L,    -SIN45, COS45);
    const LC = dims.LC ? pt(dims.LC, -SIN22, COS22) : null;
    const CT = pt(dims.C,    0,      1);
    const RC = dims.RC ? pt(dims.RC,  SIN22, COS22) : null;
    const RP = pt(dims.R,     SIN45, COS45);

    const infR = +(19 * scale).toFixed(1);
    const sb = pt(infR * 1.414, 0, 1);
    const fb = { x: +(hx + infR).toFixed(1), y: +(hy - infR).toFixed(1) };
    const tb = { x: +(hx - infR).toFixed(1), y: +(hy - infR).toFixed(1) };

    const fencePts = [LP, ...(LC ? [LC] : []), CT, ...(RC ? [RC] : []), RP];
    const fencePath = 'M ' + fencePts.map(p => `${p.x},${p.y}`).join(' L ');
    const grassPath = `M ${hx},${hy} L ${LP.x},${LP.y} ` +
        fencePts.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') + ` L ${RP.x},${RP.y} Z`;

    const fs = mini ? 7 : 9, fsc = mini ? 8 : 10;
    const uid = Math.random().toString(36).slice(2, 7);

    const labels = [
        `<text x="${LP.x}" y="${Math.min(LP.y + 13, H - 2)}" fill="white" font-size="${fs}" text-anchor="middle" font-family="sans-serif">${dims.L}m</text>`,
        LC ? `<text x="${LC.x - 4}" y="${LC.y - 3}" fill="rgba(255,255,255,0.85)" font-size="${fs - 1}" text-anchor="middle" font-family="sans-serif">${dims.LC}m</text>` : '',
        `<text x="${hx}" y="${CT.y - 4}" fill="white" font-size="${fsc}" text-anchor="middle" font-weight="bold" font-family="sans-serif">${dims.C}m</text>`,
        RC ? `<text x="${RC.x + 4}" y="${RC.y - 3}" fill="rgba(255,255,255,0.85)" font-size="${fs - 1}" text-anchor="middle" font-family="sans-serif">${dims.RC}m</text>` : '',
        `<text x="${RP.x}" y="${Math.min(RP.y + 13, H - 2)}" fill="white" font-size="${fs}" text-anchor="middle" font-family="sans-serif">${dims.R}m</text>`,
    ].filter(Boolean).join('');

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block;">
  <defs><clipPath id="fc${uid}"><path d="${grassPath}"/></clipPath></defs>
  <rect width="${W}" height="${H}" fill="#0a180a" rx="${mini?4:6}"/>
  <path d="${grassPath}" fill="#1d5e1d"/>
  <circle cx="${hx}" cy="${hy - infR * 0.8}" r="${infR * 1.15}" fill="#6b4f28" clip-path="url(#fc${uid})"/>
  <polygon points="${hx},${hy} ${fb.x},${fb.y} ${sb.x},${sb.y} ${tb.x},${tb.y}" fill="#1d5e1d"/>
  <line x1="${hx}" y1="${hy}" x2="${LP.x}" y2="${LP.y}" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
  <line x1="${hx}" y1="${hy}" x2="${RP.x}" y2="${RP.y}" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
  <path d="${fencePath}" fill="none" stroke="${color}" stroke-width="${mini?2:2.5}" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="${fb.x-2.5}" y="${fb.y-2.5}" width="5" height="5" fill="white" transform="rotate(45,${fb.x},${fb.y})"/>
  <rect x="${sb.x-2.5}" y="${sb.y-2.5}" width="5" height="5" fill="white" transform="rotate(45,${sb.x},${sb.y})"/>
  <rect x="${tb.x-2.5}" y="${tb.y-2.5}" width="5" height="5" fill="white" transform="rotate(45,${tb.x},${tb.y})"/>
  <circle cx="${hx}" cy="${hy}" r="3" fill="white"/>
  <circle cx="${hx}" cy="${hy - infR * 0.78}" r="3" fill="#9b7a3e"/>
  ${labels}
</svg>`;
}

function getStadiumParkType(s) {
    const avg = 99 + 122 + 99; // 리그 평균 총 펜스
    const total = s.dims.L + s.dims.C + s.dims.R;
    if (total > avg + 3) return { type: 'pitcher', label: '투수 친화', cls: 'pitcher' };
    if (total < avg - 3) return { type: 'hitter', label: '타자 친화', cls: 'hitter' };
    // 특이 구장 체크 (비대칭, 높은 펜스 등)
    if (s.dims.wall && parseFloat(s.dims.wall) >= 3.5) return { type: 'unique', label: '특수 구장', cls: 'unique' };
    return { type: 'neutral', label: '중립', cls: 'neutral' };
}

function getStadiumStrategy(s, parkInfo) {
    const strategies = [];
    if (parkInfo.type === 'pitcher') {
        strategies.push({ icon: '🎯', text: '그라운드볼 투수 영입 시 구장 시너지 극대화' });
        strategies.push({ icon: '💪', text: '장타력 있는 타자로 약점 상쇄 필요' });
    } else if (parkInfo.type === 'hitter') {
        strategies.push({ icon: '🎯', text: '탈삼진 투수로 구장 불리함 최소화' });
        strategies.push({ icon: '💪', text: '파워 히터가 구장 이점 극대화' });
    } else {
        strategies.push({ icon: '⚖️', text: '투타 밸런스 편성이 유효한 구장' });
        if (s.dims.wall && parseFloat(s.dims.wall) >= 3.5) {
            strategies.push({ icon: '📏', text: '높은 펜스 활용 — 라인드라이브 타자 우선' });
        }
    }
    return strategies;
}

// ══════════════════════════════════════════
// ██ SCHEDULE VIEW
// ══════════════════════════════════════════
let scheduleTeamFilter = 'all';
let scheduleCurrentDate = null;

function renderScheduleView() {
    const container = document.getElementById('scheduleContainer');
    const dateLabel = document.getElementById('scheduleDate');
    const teamBtns = document.getElementById('scheduleTeamBtns');
    if (!container) return;

    const schedule = typeof KBO_SCHEDULE_2026 !== 'undefined' ? KBO_SCHEDULE_2026 : [];
    if (schedule.length === 0) { container.innerHTML = '<p style="text-align:center;color:var(--text-dim);">일정 데이터가 없습니다.</p>'; return; }

    // Team name mapping
    const TEAM_NAMES = {'LG':'LG 트윈스','두산':'두산 베어스','KT':'KT 위즈','SSG':'SSG 랜더스','NC':'NC 다이노스',
        '한화':'한화 이글스','KIA':'KIA 타이거즈','롯데':'롯데 자이언츠','삼성':'삼성 라이온즈','키움':'키움 히어로즈'};
    const ORDER = ['LG','두산','한화','SSG','삼성','NC','KT','롯데','KIA','키움'];

    // Init date
    if (!scheduleCurrentDate) {
        scheduleCurrentDate = schedule[0].d;
    }

    // Team filter buttons
    if (teamBtns && teamBtns.children.length === 0) {
        ORDER.forEach(code => {
            const btn = document.createElement('button');
            btn.style.cssText = 'background:none;border:2px solid transparent;border-radius:50%;cursor:pointer;padding:4px;width:40px;height:40px;display:flex;align-items:center;justify-content:center;';
            btn.innerHTML = `<img src="${teamLogo(code)}" alt="${code}" style="width:28px;height:28px;">`;
            btn.dataset.team = code;
            btn.title = TEAM_NAMES[code] || code;
            btn.onclick = () => {
                scheduleTeamFilter = code;
                document.querySelector('.schedule-team-btn.active')?.classList.remove('active');
                document.querySelectorAll('#scheduleTeamBtns button').forEach(b => b.style.borderColor = 'transparent');
                btn.style.borderColor = 'var(--accent)';
                renderScheduleContent();
            };
            teamBtns.appendChild(btn);
        });
    }

    // "전체" button
    const allBtn = document.querySelector('.schedule-team-btn[data-team="all"]');
    if (allBtn) {
        allBtn.onclick = () => {
            scheduleTeamFilter = 'all';
            allBtn.classList.add('active');
            document.querySelectorAll('#scheduleTeamBtns button').forEach(b => b.style.borderColor = 'transparent');
            renderScheduleContent();
        };
    }

    // Date navigation
    document.getElementById('schedulePrev').onclick = () => {
        const dates = schedule.map(d => d.d);
        if (scheduleTeamFilter !== 'all') {
            const teamDates = schedule.filter(day => day.g.some(g => g.h === scheduleTeamFilter || g.a === scheduleTeamFilter)).map(d => d.d);
            const idx = teamDates.indexOf(scheduleCurrentDate);
            if (idx > 0) scheduleCurrentDate = teamDates[idx - 1];
            else if (idx === -1 && teamDates.length > 0) scheduleCurrentDate = teamDates[teamDates.length - 1];
        } else {
            const idx = dates.indexOf(scheduleCurrentDate);
            if (idx > 0) scheduleCurrentDate = dates[idx - 1];
        }
        renderScheduleContent();
    };
    document.getElementById('scheduleNext').onclick = () => {
        const dates = schedule.map(d => d.d);
        if (scheduleTeamFilter !== 'all') {
            const teamDates = schedule.filter(day => day.g.some(g => g.h === scheduleTeamFilter || g.a === scheduleTeamFilter)).map(d => d.d);
            const idx = teamDates.indexOf(scheduleCurrentDate);
            if (idx < teamDates.length - 1) scheduleCurrentDate = teamDates[idx + 1];
            else if (idx === -1 && teamDates.length > 0) scheduleCurrentDate = teamDates[0];
        } else {
            const idx = dates.indexOf(scheduleCurrentDate);
            if (idx < dates.length - 1) scheduleCurrentDate = dates[idx + 1];
        }
        renderScheduleContent();
    };

    renderScheduleContent();

    function renderScheduleContent() {
        const DAYS = ['일','월','화','수','목','금','토'];
        const dateObj = new Date(scheduleCurrentDate);
        const dayName = DAYS[dateObj.getDay()];
        dateLabel.textContent = `${scheduleCurrentDate} (${dayName})`;

        // 게임 로그에서 해당 날짜 결과 찾기
        const gameLog = state.gameLog || [];
        function findGameResult(date, home, away) {
            return gameLog.find(gl => gl.date === date && gl.home === home && gl.away === away);
        }

        if (scheduleTeamFilter === 'all') {
            const dayData = schedule.find(d => d.d === scheduleCurrentDate);
            if (!dayData || dayData.g.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:40px;">이 날은 경기가 없습니다.</p>';
                return;
            }
            container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;">
                ${dayData.g.map((g, gi) => {
                    const homeName = TEAM_NAMES[g.h] || g.h;
                    const awayName = TEAM_NAMES[g.a] || g.a;
                    const res = findGameResult(dayData.d, g.h, g.a);
                    const hasResult = !!res;
                    const scoreHTML = hasResult
                        ? `<div style="font-size:28px;font-weight:900;margin:8px 0;letter-spacing:2px;">
                            <span style="color:${res.winner===g.h?'var(--accent)':'var(--text-dim)'}">${res.homeRuns}</span>
                            <span style="color:var(--text-muted);margin:0 8px;">:</span>
                            <span style="color:${res.winner===g.a?'var(--accent)':'var(--text-dim)'}">${res.awayRuns}</span>
                           </div>
                           <div style="font-size:11px;color:var(--text-muted);">${res.result==='draw'?'무승부': (res.winner===g.h?homeName:awayName)+' 승'}</div>`
                        : `<div style="font-size:20px;font-weight:900;color:var(--text-dim);padding:8px 0;">VS</div>
                           <div style="font-size:11px;color:var(--text-muted);">${g.t} 예정</div>`;
                    const clickAttr = hasResult ? `onclick="showGameDetail(${gameLog.indexOf(res)})" style="cursor:pointer;"` : '';
                    return `<div ${clickAttr} class="schedule-card ${hasResult?'schedule-card--done':''}" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center;${hasResult?'cursor:pointer;':''}">
                        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:8px;">
                            <div style="text-align:center;">
                                <img src="${teamLogo(g.h)}" style="width:48px;height:48px;margin-bottom:4px;"><br>
                                <span style="font-weight:700;font-size:14px;">${homeName}</span>
                            </div>
                            <div style="min-width:80px;">
                                ${scoreHTML}
                            </div>
                            <div style="text-align:center;">
                                <img src="${teamLogo(g.a)}" style="width:48px;height:48px;margin-bottom:4px;"><br>
                                <span style="font-weight:700;font-size:14px;">${awayName}</span>
                            </div>
                        </div>
                        <div style="color:var(--text-dim);font-size:11px;">${g.s}${hasResult?' · 클릭하여 상세 보기':''}</div>
                    </div>`;
                }).join('')}
            </div>`;
        } else {
            // 팀별 보기: 해당 팀 일정 리스트
            const teamGames = [];
            schedule.forEach(day => {
                day.g.forEach(g => {
                    if (g.h === scheduleTeamFilter || g.a === scheduleTeamFilter) {
                        const isHome = g.h === scheduleTeamFilter;
                        const opponent = isHome ? g.a : g.h;
                        teamGames.push({ date: day.d, time: g.t, stadium: g.s, isHome, opponent });
                    }
                });
            });

            // Find current week range (7 days from current date)
            const curDate = new Date(scheduleCurrentDate);
            const weekStart = new Date(curDate);
            // KBO: 화~일이 한 주 (화요일 시작)
            const dayOfWeek = weekStart.getDay(); // 0=일, 1=월, 2=화 ...
            const offsetToTuesday = (dayOfWeek + 5) % 7; // 화요일까지 역산
            weekStart.setDate(weekStart.getDate() - offsetToTuesday);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // 월요일까지

            const weekGames = teamGames.filter(g => {
                const d = new Date(g.date);
                return d >= weekStart && d <= weekEnd;
            });

            const teamName = TEAM_NAMES[scheduleTeamFilter] || scheduleTeamFilter;
            dateLabel.textContent = `${teamName} — ${weekStart.toISOString().slice(0,10)} ~ ${weekEnd.toISOString().slice(0,10)}`;

            if (weekGames.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:40px;">이 주에는 경기가 없습니다.</p>';
                return;
            }

            container.innerHTML = `<div style="background:var(--card);border-radius:12px;overflow:hidden;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:var(--bg-darker);">
                        <th style="padding:10px;text-align:center;color:var(--text-dim);font-size:12px;">날짜</th>
                        <th style="padding:10px;text-align:center;color:var(--text-dim);font-size:12px;">H/A</th>
                        <th style="padding:10px;text-align:center;color:var(--text-dim);font-size:12px;">상대</th>
                        <th style="padding:10px;text-align:center;color:var(--text-dim);font-size:12px;">결과</th>
                        <th style="padding:10px;text-align:center;color:var(--text-dim);font-size:12px;">구장</th>
                    </tr></thead>
                    <tbody>
                    ${weekGames.map(g => {
                        const d = new Date(g.date);
                        const dayStr = DAYS[d.getDay()];
                        const oppName = TEAM_NAMES[g.opponent] || g.opponent;
                        const home = g.isHome ? scheduleTeamFilter : g.opponent;
                        const away = g.isHome ? g.opponent : scheduleTeamFilter;
                        const res = findGameResult(g.date, home, away);
                        let resultHTML = `<span style="color:var(--text-dim);">${g.time}</span>`;
                        let rowClick = '';
                        if (res) {
                            const myRuns = g.isHome ? res.homeRuns : res.awayRuns;
                            const oppRuns = g.isHome ? res.awayRuns : res.homeRuns;
                            const isWin = res.winner === scheduleTeamFilter;
                            const isDraw = res.result === 'draw';
                            const badge = isDraw ? '<span style="color:#f59e0b;font-weight:700;">무</span>' : isWin ? '<span style="color:#22c55e;font-weight:700;">승</span>' : '<span style="color:#ef4444;font-weight:700;">패</span>';
                            resultHTML = `${badge} <strong>${myRuns}</strong>:<strong>${oppRuns}</strong>`;
                            const logIdx = gameLog.indexOf(res);
                            rowClick = `onclick="showGameDetail(${logIdx})" style="cursor:pointer;"`;
                        }
                        return `<tr ${rowClick} style="border-bottom:1px solid var(--border);">
                            <td style="padding:10px;text-align:center;font-size:13px;">${g.date.slice(5)} (${dayStr})</td>
                            <td style="padding:10px;text-align:center;font-weight:700;color:${g.isHome ? '#22c55e' : '#ED1C24'};">${g.isHome ? 'H' : 'A'}</td>
                            <td style="padding:10px;text-align:center;">
                                <img src="${teamLogo(g.opponent)}" style="width:20px;height:20px;vertical-align:middle;margin-right:4px;">
                                <span style="font-size:13px;">${oppName}</span>
                            </td>
                            <td style="padding:10px;text-align:center;font-size:13px;">${resultHTML}</td>
                            <td style="padding:10px;text-align:center;font-size:13px;color:var(--text-dim);">${g.stadium}</td>
                        </tr>`;
                    }).join('')}
                    </tbody>
                </table>
            </div>`;
        }
    }
}

function buildCompareRows(gl) {
    const rows = [
        [gl.awayDetail?.H||0, '안타', gl.homeDetail?.H||0],
        [gl.awayDetail?.HR||0, '홈런', gl.homeDetail?.HR||0],
        [gl.awayDetail?.BB||0, '볼넷', gl.homeDetail?.BB||0],
        [gl.awayDetail?.SO||0, '삼진', gl.homeDetail?.SO||0],
        [gl.awayDetail?.SB||0, '도루', gl.homeDetail?.SB||0],
        [gl.awayDetail?.E||0, '실책', gl.homeDetail?.E||0],
        [gl.awayDetail?.DP||0, '병살', gl.homeDetail?.DP||0],
    ];
    return rows.map(function(r) {
        var a = r[0], label = r[1], h = r[2];
        var aBar = Math.min(a * 8, 100);
        var hBar = Math.min(h * 8, 100);
        return '<tr style="border-bottom:1px solid var(--border);">' +
            '<td style="padding:4px 8px;"><span style="display:inline-block;background:#ef4444;height:8px;width:' + aBar + '%;border-radius:4px;vertical-align:middle;margin-right:4px;"></span><strong>' + a + '</strong></td>' +
            '<td style="padding:4px 8px;color:var(--text-dim);">' + label + '</td>' +
            '<td style="padding:4px 8px;"><strong>' + h + '</strong><span style="display:inline-block;background:#3b82f6;height:8px;width:' + hBar + '%;border-radius:4px;vertical-align:middle;margin-left:4px;"></span></td>' +
            '</tr>';
    }).join('');
}

/** 경기 상세 결과 모달 (일정 탭에서 클릭 시) */
function showGameDetail(logIdx) {
    const gl = state.gameLog?.[logIdx];
    if (!gl) return;

    const homeName = state.teams[gl.home]?.name || gl.home;
    const awayName = state.teams[gl.away]?.name || gl.away;
    const isDraw = gl.result === 'draw';
    const winnerName = isDraw ? '무승부' : (state.teams[gl.winner]?.name || gl.winner);

    const modal = document.getElementById('psGameModal');
    if (!modal) return;

    // 이닝별 스코어보드
    const hInn = gl.homeInnings || [];
    const aInn = gl.awayInnings || [];
    const innCount = Math.max(hInn.length, aInn.length, 9);
    let innHeaders = '', homeScores = '', awayScores = '';
    for (let i = 0; i < innCount; i++) {
        innHeaders += `<th>${i+1}</th>`;
        awayScores += `<td>${aInn[i] != null ? aInn[i] : '-'}</td>`;
        homeScores += `<td>${hInn[i] != null ? hInn[i] : '-'}</td>`;
    }

    document.getElementById('psGameTitle').textContent = `${gl.date || ''} ${homeName} vs ${awayName}`;
    document.getElementById('psGameBody').innerHTML = `
        <div style="text-align:center;margin:12px 0;">
            <div style="display:flex;align-items:center;justify-content:center;gap:24px;">
                <div style="cursor:pointer;" onclick="closePSGameModal();document.getElementById('rosterTeamSelect').value='${gl.home}';showView('roster');">
                    <img src="${teamLogo(gl.home)}" style="width:48px;height:48px;"><br>
                    <strong style="text-decoration:underline dotted;text-underline-offset:3px;">${homeName}</strong>
                </div>
                <div style="font-size:32px;font-weight:900;letter-spacing:4px;">
                    <span style="color:${gl.winner===gl.home?'var(--accent)':'var(--text-dim)'}">${gl.homeRuns}</span>
                    <span style="color:var(--text-muted);margin:0 6px;">:</span>
                    <span style="color:${gl.winner===gl.away?'var(--accent)':'var(--text-dim)'}">${gl.awayRuns}</span>
                </div>
                <div style="cursor:pointer;" onclick="closePSGameModal();document.getElementById('rosterTeamSelect').value='${gl.away}';showView('roster');">
                    <img src="${teamLogo(gl.away)}" style="width:48px;height:48px;"><br>
                    <strong style="text-decoration:underline dotted;text-underline-offset:3px;">${awayName}</strong>
                </div>
            </div>
            <div style="margin-top:6px;font-size:14px;color:var(--accent);font-weight:700;">
                ${isDraw ? '무승부' : winnerName + ' 승리'}
            </div>
            <div style="font-size:12px;color:var(--text-dim);">${gl.date || ''} ${gl.time || ''} | ${gl.stadium || ''}</div>
        </div>

        <div class="boxscore__scoreboard" style="margin:16px auto;max-width:700px;">
            <table>
                <thead><tr><th>팀</th>${innHeaders}<th style="border-left:2px solid var(--border);">R</th><th>H</th><th>E</th></tr></thead>
                <tbody>
                    <tr><td><strong>${awayName}</strong></td>${awayScores}<td style="border-left:2px solid var(--border);font-weight:700;">${gl.awayRuns}</td><td>${gl.awayHits||'-'}</td><td>${gl.awayErrors||0}</td></tr>
                    <tr><td><strong>${homeName}</strong></td>${homeScores}<td style="border-left:2px solid var(--border);font-weight:700;">${gl.homeRuns}</td><td>${gl.homeHits||'-'}</td><td>${gl.homeErrors||0}</td></tr>
                </tbody>
            </table>
        </div>

        ${gl.homeDetail || gl.awayDetail ? `
        <!-- 선발투수 정보 -->
        <div style="display:flex;justify-content:center;gap:40px;margin:16px 0;font-size:13px;">
            ${gl.awayDetail?.sp ? `<div style="text-align:center;">
                <div style="font-weight:700;cursor:pointer;text-decoration:underline dotted;" onclick="if(state.players['${gl.awayDetail.sp.id}'])showPlayerModal(state.players['${gl.awayDetail.sp.id}'])">${gl.awayDetail.sp.name}</div>
                <div style="color:var(--text-dim);font-size:11px;">이닝 ${fmtIP(gl.awayDetail.sp.IP)} | 피안타 ${gl.awayDetail.sp.H} | 자책 ${gl.awayDetail.sp.ER} | 삼진 ${gl.awayDetail.sp.SO}</div>
                <div style="color:${gl.winner === gl.away ? '#22c55e' : '#ef4444'};font-weight:700;font-size:11px;">${gl.winner === gl.away ? '승리' : '패전'}</div>
            </div>` : ''}
            ${gl.homeDetail?.sp ? `<div style="text-align:center;">
                <div style="font-weight:700;cursor:pointer;text-decoration:underline dotted;" onclick="if(state.players['${gl.homeDetail.sp.id}'])showPlayerModal(state.players['${gl.homeDetail.sp.id}'])">${gl.homeDetail.sp.name}</div>
                <div style="color:var(--text-dim);font-size:11px;">이닝 ${fmtIP(gl.homeDetail.sp.IP)} | 피안타 ${gl.homeDetail.sp.H} | 자책 ${gl.homeDetail.sp.ER} | 삼진 ${gl.homeDetail.sp.SO}</div>
                <div style="color:${gl.winner === gl.home ? '#22c55e' : '#ef4444'};font-weight:700;font-size:11px;">${gl.winner === gl.home ? '승리' : '패전'}</div>
            </div>` : ''}
        </div>

        <!-- 팀 비교 통계 -->
        <div style="max-width:500px;margin:0 auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:center;">
                <thead><tr><th>${awayName}</th><th></th><th>${homeName}</th></tr></thead>
                <tbody>
                    ${buildCompareRows(gl, awayName, homeName)}
                </tbody>
            </table>
        </div>` : ''}
    `;

    modal.style.display = 'flex';
}
window.showGameDetail = showGameDetail;

function renderStadiumView() {
    const grid = document.getElementById('stadiumGrid');
    if (!grid) return;

    const ORDER = ['LG','두산','한화','SSG','삼성','NC','KT','롯데','KIA','키움'];
    grid.innerHTML = ORDER.map(code => {
        const team = state?.teams[code];
        const s = KBO_STADIUMS[code];
        if (!s) return '';
        const color = team?.color || '#3399cc';
        const parkInfo = getStadiumParkType(s);
        const strategies = getStadiumStrategy(s, parkInfo);

        const dimRow = (label, val, unit='m') => val != null
            ? `<tr><td>${label}</td><td><strong>${val}${unit}</strong></td></tr>` : '';

        // 앞면 (기존 + 힌트)
        const frontHTML = `
            <div class="stadium-flip__front">
                <div class="stadium-card__header" style="background:${color}22;border-left:4px solid ${color};">
                    <img class="stadium-card__emblem" src="image/${code}_emblem.png" alt="${code}" onerror="this.style.display='none'">
                    <div>
                        <div class="stadium-card__team">${team?.name || code}</div>
                        <div class="stadium-card__name">${s.short}</div>
                        <div class="stadium-card__city">📍 ${s.city} · ${s.type === '돔' ? '🏛 돔구장' : '🏟 개방형'}</div>
                    </div>
                </div>
                <div class="stadium-card__svg">${generateStadiumSVG(s.dims, color, false)}</div>
                <div class="stadium-card__info">
                    <table class="stadium-dim-table">
                        <thead><tr><th colspan="2">구장 제원</th></tr></thead>
                        <tbody>
                            ${dimRow('좌측 폴', s.dims.L)}
                            ${s.dims.LC ? dimRow('좌중간', s.dims.LC) : ''}
                            ${dimRow('중앙', s.dims.C)}
                            ${s.dims.RC ? dimRow('우중간', s.dims.RC) : ''}
                            ${dimRow('우측 폴', s.dims.R)}
                            ${s.dims.wall != null ? dimRow('펜스 높이', s.dims.wall) : ''}
                        </tbody>
                    </table>
                    ${s.alt ? `<div class="stadium-alt">🏟 보조: ${s.alt}</div>` : ''}
                    ${s.note ? `<div class="stadium-note">💡 ${s.note}</div>` : ''}
                </div>
                <div class="stadium-card__flip-hint">클릭하여 스카우팅 리포트 보기 →</div>
            </div>`;

        // 뒷면 (스카우팅 리포트)
        const charsHTML = (s.chars || []).map(c =>
            `<div class="scout-report__item"><span class="scout-report__icon">${c.icon}</span><span class="scout-report__text">${c.text}</span></div>`
        ).join('');

        const stratHTML = strategies.map(st =>
            `<div class="scout-report__strategy-item"><span class="scout-report__icon">${st.icon}</span><span class="scout-report__text">${st.text}</span></div>`
        ).join('');

        const backHTML = `
            <div class="stadium-flip__back">
                <div class="scout-report" style="--sr-color:${color};">
                    <div class="scout-report__header">
                        <span class="scout-report__header-icon">📋</span>
                        <div class="scout-report__header-text">
                            <div class="scout-report__team-name">${team?.name || code}</div>
                            <div class="scout-report__subtitle">Scouting Report</div>
                        </div>
                        <span class="scout-report__badge scout-report__badge--${parkInfo.cls}">${parkInfo.label}</span>
                    </div>
                    <div class="scout-report__items">
                        ${charsHTML}
                    </div>
                    <div class="scout-report__strategy">
                        <div class="scout-report__strategy-title">GM 전략 제안</div>
                        ${stratHTML}
                    </div>
                    <div class="scout-report__back-hint">← 클릭하여 돌아가기</div>
                </div>
            </div>`;

        return `<div class="stadium-flip" style="--team-color:${color}" onclick="this.classList.toggle('flipped')">
            <div class="stadium-flip__inner">${frontHTML}${backHTML}</div>
        </div>`;
    }).join('');
}

function renderDetailStadium(code) {
    const el = document.getElementById('detailStadium');
    if (!el) return;
    const s = KBO_STADIUMS[code];
    if (!s) { el.innerHTML = ''; return; }
    const team = state?.teams[code];
    const color = team?.color || '#3399cc';
    const dimItem = (label, val, unit='m') => val != null
        ? `<div class="ds-dim-item"><span>${label}</span><strong>${val}${unit}</strong></div>` : '';

    el.innerHTML = `
    <div class="detail-stadium-wrap">
        <h4>홈구장</h4>
        <div class="detail-stadium-inner">
            <div class="detail-stadium-svg">${generateStadiumSVG(s.dims, color, true)}</div>
            <div class="detail-stadium-info">
                <div class="detail-stadium-name">${s.main}</div>
                <div class="detail-stadium-city">📍 ${s.city} · ${s.type === '돔' ? '🏛 돔' : '🏟 개방형'}</div>
                <div class="ds-dims">
                    ${dimItem('좌폴', s.dims.L)}
                    ${s.dims.LC ? dimItem('좌중간', s.dims.LC) : ''}
                    ${dimItem('중앙', s.dims.C)}
                    ${s.dims.RC ? dimItem('우중간', s.dims.RC) : ''}
                    ${dimItem('우폴', s.dims.R)}
                    ${s.dims.wall != null ? dimItem('펜스', s.dims.wall) : ''}
                </div>
                ${s.alt ? `<div class="stadium-alt">🏟 보조: ${s.alt}</div>` : ''}
                ${s.note ? `<div class="stadium-note">💡 ${s.note}</div>` : ''}
            </div>
        </div>
    </div>`;
}

// ══════════════════════════════════════════
// ██ ROSTER VIEW
// ══════════════════════════════════════════

let rosterSortKey = null;
let rosterSortDir = 'desc';
let rosterTier = '1군'; // '1군' or '2군'
let futuresTier = '2군'; // '2군' or '육성'

function setupRosterView() {
    const select = document.getElementById('rosterTeamSelect');
    populateTeamSelect(select, state.teams);
    select.addEventListener('change', () => { renderRoster(); updateSidebarActive(select.value); });

    // Tier tabs — 2군 클릭 시 상단 네비도 퓨처스 탭으로 전환
    document.querySelectorAll('.tier-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tier = tab.dataset.tier;
            if (tier === '2군') {
                showView('futures');
            } else {
                rosterTier = '1군';
                document.querySelectorAll('.tier-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // 상단 네비도 1군 로스터로
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                const rosterNav = document.querySelector('.nav-btn[data-view="roster"]');
                if (rosterNav) rosterNav.classList.add('active');
                renderRoster();
            }
        });
    });

    // 육성선수 서브탭
    document.querySelectorAll('.futures-sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            futuresTier = tab.dataset.futuresTier;
            document.querySelectorAll('.futures-sub-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderRoster();
        });
    });

    // Sort headers
    document.querySelectorAll('.player-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (rosterSortKey === key) {
                rosterSortDir = rosterSortDir === 'asc' ? 'desc' : 'asc';
            } else {
                rosterSortKey = key;
                // 역할/포지션/이름/번호는 오름차순 기본, 나머지(능력치)는 내림차순
                const ascKeys = ['role', 'position', 'name', 'number', 'throwBat', 'age'];
                rosterSortDir = ascKeys.includes(key) ? 'asc' : 'desc';
            }
            renderRoster();
        });
    });

    // Swap modal events
    const swapModal = document.getElementById('swapModal');
    document.getElementById('swapModalClose').onclick = closeSwapModal;
    document.getElementById('btnSwapCancel').onclick = closeSwapModal;
    swapModal.onclick = (e) => { if (e.target === swapModal) closeSwapModal(); };

    document.querySelectorAll('.swap-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (!swapModalState) return;
            swapModalState.tab = tab.dataset.swapTab;
            document.querySelectorAll('.swap-tab').forEach(t => t.classList.toggle('swap-tab--active', t === tab));
            renderSwapList();
        });
    });

    document.getElementById('swapList').addEventListener('click', (e) => {
        const row = e.target.closest('.swap-player-row');
        if (!row) return;
        handleSwapSelect(row.dataset.swapId);
    });
}

function renderRoster() {
    const code = document.getElementById('rosterTeamSelect').value;
    if (!code || !state.teams[code]) return;

    const team = state.teams[code];

    // 로스터 뷰 엠블럼/워드마크 업데이트
    document.getElementById('rosterEmblem').src = teamEmblem(code);
    document.getElementById('rosterWordmark').src = teamWordmark(code);

    // 1군/2군 탭 카운트 업데이트
    const allFutPlayers = getTeamFuturesPlayers(state, code);
    const regFutPlayers = allFutPlayers.filter(p => !p.number || p.number < 100);
    const devFutPlayers = allFutPlayers.filter(p => p.number >= 100);
    const milPlayers = getTeamMilitaryPlayers(state, code);
    const injPlayers = (team.injuredRoster || []).map(id => state.players[id]).filter(Boolean);
    const totalFutCount = (team.futuresRoster || []).length + (team.militaryRoster || []).length + (team.injuredRoster || []).length;
    document.getElementById('tabFirstTeam').textContent = `1군 (${team.roster.length}명)`;
    document.getElementById('tabFutures').textContent = `2군 (${totalFutCount}명)`;

    // 1군/2군 영역 토글
    const firstSection = document.getElementById('firstTeamSection');
    const futuresSection = document.getElementById('futuresSection');
    if (rosterTier === '2군') {
        firstSection.style.display = 'none';
        futuresSection.style.display = 'block';
        // 서브탭 카운트 업데이트
        document.getElementById('subTab2gun').textContent = `2군 (${regFutPlayers.length}명)`;
        document.getElementById('subTabDev').textContent = `육성선수 (${devFutPlayers.length}명)`;
        document.getElementById('subTabMil').textContent = `군보류 (${milPlayers.length}명)`;
        // 부상 서브탭 (있으면 표시)
        let subTabInj = document.getElementById('subTabInj');
        if (!subTabInj && injPlayers.length > 0) {
            const milTab = document.getElementById('subTabMil');
            subTabInj = document.createElement('button');
            subTabInj.id = 'subTabInj';
            subTabInj.className = 'futures-sub-tab';
            subTabInj.onclick = () => {
                futuresTier = '부상';
                document.querySelectorAll('.futures-sub-tab').forEach(t => t.classList.remove('active'));
                subTabInj.classList.add('active');
                renderRoster(code, '2군');
            };
            milTab.parentNode.insertBefore(subTabInj, milTab.nextSibling);
        }
        if (subTabInj) {
            subTabInj.textContent = `부상 및 징계 (${injPlayers.length}명)`;
            if (futuresTier === '부상') subTabInj.classList.add('active');
        }
        const displayPlayers = futuresTier === '부상' ? injPlayers : (futuresTier === '군보류' ? milPlayers : (futuresTier === '육성' ? devFutPlayers : regFutPlayers));
        const tierLabel = futuresTier === '부상' ? '부상 및 징계' : (futuresTier === '군보류' ? '군보류' : (futuresTier === '육성' ? '육성선수' : '퓨처스리그'));
        document.getElementById('futuresInfo').innerHTML = displayPlayers.length > 0
            ? `${tierLabel} 등록 선수 <strong>${displayPlayers.length}명</strong> (투수 ${displayPlayers.filter(p=>p.position==='P').length}명 / 야수 ${displayPlayers.filter(p=>p.position!=='P').length}명)${futuresTier === '군보류' ? ' <span style="color:#ED1C24;font-size:11px;">※ 이번 시즌 등록 불가</span>' : (futuresTier === '부상' ? ' <span style="color:#D97706;font-size:11px;">※ 복귀일까지 1군 등록 불가</span>' : '')}`
            : `<em>${tierLabel} 선수가 없습니다.</em>`;
    } else {
        firstSection.style.display = 'block';
        futuresSection.style.display = 'none';
    }

    const validation = validateRoster(state, code);

    // Validation badges
    const vEl = document.getElementById('rosterValidation');
    vEl.innerHTML = `
        <span class="validation-badge ${validation.pitcherCount >= 10 ? 'validation-badge--ok' : 'validation-badge--warn'}">
            투수 ${validation.pitcherCount}명 ${validation.pitcherCount >= 10 ? '✓' : '✗'}
        </span>
        <span class="validation-badge ${validation.batterCount >= 14 ? 'validation-badge--ok' : 'validation-badge--warn'}">
            야수 ${validation.batterCount}명 ${validation.batterCount >= 14 ? '✓' : '✗'}
        </span>
        <span class="validation-badge ${validation.pitcherCount + validation.batterCount === 29 ? 'validation-badge--ok' : 'validation-badge--warn'}">
            로스터 ${validation.pitcherCount + validation.batterCount}명
        </span>
        ${validation.penalty.overCap ?
            `<span class="validation-badge validation-badge--warn">샐러리캡 초과 ${validation.penalty.excess.toFixed(1)}억</span>` :
            `<span class="validation-badge validation-badge--ok">샐러리캡 준수 ✓</span>`
        }
    `;

    // Salary gauge (캡 적용 연봉 기준)
    const pct = Math.min((validation.capSalary / validation.salaryCap) * 100, 120);
    const salaryColor = validation.penalty.overCap ? '#ED1C24' :
                        pct > 90 ? '#B3A177' : '#22c55e';
    document.getElementById('rosterSalary').innerHTML = `
        <div class="salary-gauge">
            <div class="salary-gauge__track">
                <div class="salary-gauge__fill" style="width:${Math.min(pct, 100)}%; background:${salaryColor};"></div>
            </div>
            <span class="salary-gauge__text">캡 적용: ${validation.capSalary.toFixed(1)}억 / ${validation.salaryCap}억 (실제: ${validation.rawSalary.toFixed(1)}억)</span>
        </div>
    `;

    // Cap detail cards
    const penalty = validation.penalty;
    const availBudget = validation.availableBudget;
    const franchiseStar = getTeamPlayers(state, code).find(p => p.isFranchiseStar);
    const foreignInfo = calcForeignSalary(state, code);
    document.getElementById('rosterCapDetail').innerHTML = `
        <div class="cap-detail-card">
            <div class="cap-detail-card__label">샐러리캡 (2026)</div>
            <div class="cap-detail-card__value">${KBO_SALARY_CAP}억</div>
            <div class="cap-detail-card__sub">외국인·신인 제외 기준</div>
        </div>
        <div class="cap-detail-card">
            <div class="cap-detail-card__label">캡 적용 연봉</div>
            <div class="cap-detail-card__value" style="color:${salaryColor};">${validation.capSalary.toFixed(1)}억</div>
            <div class="cap-detail-card__sub">${franchiseStar ? `★${franchiseStar.name} 50% 할인` : ''} / 외국인 ${foreignInfo.count}명 제외</div>
        </div>
        <div class="cap-detail-card">
            <div class="cap-detail-card__label">가용 예산</div>
            <div class="cap-detail-card__value" style="color:${availBudget < 10 ? '#ED1C24' : '#22c55e'};">${availBudget.toFixed(1)}억</div>
            <div class="cap-detail-card__sub">트레이드 가능 금액</div>
        </div>
        <div class="cap-detail-card">
            <div class="cap-detail-card__label">외국인 선수 연봉</div>
            <div class="cap-detail-card__value">${foreignInfo.total.toFixed(1)}억</div>
            <div class="cap-detail-card__sub">${foreignInfo.count}명 (별도 캡 적용)</div>
        </div>
        <div class="cap-detail-card">
            <div class="cap-detail-card__label">제재금 (경쟁균형세)</div>
            <div class="cap-detail-card__value" style="color:${penalty.overCap ? '#ED1C24' : '#22c55e'};">${penalty.overCap ? penalty.penaltyAmount.toFixed(1) + '억' : '없음'}</div>
            <div class="cap-detail-card__sub">${penalty.overCap ? penalty.description : '정상'}</div>
        </div>
    `;

    // 1군/2군에 따라 선수 목록 분기
    let allPlayers;
    if (rosterTier === '2군') {
        if (futuresTier === '부상') {
            allPlayers = (team.injuredRoster || []).map(id => state.players[id]).filter(Boolean);
        } else if (futuresTier === '군보류') {
            allPlayers = getTeamMilitaryPlayers(state, code);
        } else {
            const futAll = getTeamFuturesPlayers(state, code);
            if (futuresTier === '육성') {
                allPlayers = futAll.filter(p => p.number >= 100);
            } else {
                allPlayers = futAll.filter(p => !p.number || p.number < 100);
            }
        }
    } else {
        allPlayers = getTeamPlayers(state, code);
    }
    let pitchers = allPlayers.filter(p => p.position === 'P').map(p => ({ ...p, power: calcPlayerPower(p) }));
    let batters = allPlayers.filter(p => p.position !== 'P').map(b => ({ ...b, power: calcPlayerPower(b) }));

    // 기본 정렬: 투수 = 선발→중계→마무리, 야수 = C→1B→2B→3B→SS→RF→CF→LF
    const ROLE_ORDER = { '선발': 0, '중계': 1, '마무리': 2 };
    const POS_ORDER = { 'C': 0, '1B': 1, '2B': 2, '3B': 3, 'SS': 4, 'RF': 5, 'CF': 6, 'LF': 7 };
    pitchers.sort((a, b) => (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9));
    batters.sort((a, b) => (POS_ORDER[a.position] ?? 9) - (POS_ORDER[b.position] ?? 9));

    if (rosterSortKey) {
        const sortFn = (a, b) => {
            let va, vb;
            // role/position은 지정된 순서표 사용
            if (rosterSortKey === 'role') { va = ROLE_ORDER[a.role] ?? 9; vb = ROLE_ORDER[b.role] ?? 9; }
            else if (rosterSortKey === 'position') { va = POS_ORDER[a.position] ?? 9; vb = POS_ORDER[b.position] ?? 9; }
            else if (rosterSortKey === 'name') { va = a.name; vb = b.name; }
            else if (rosterSortKey === 'number') { va = a.number || 99; vb = b.number || 99; }
            else if (rosterSortKey === 'throwBat') { va = a.throwBat || ''; vb = b.throwBat || ''; }
            else if (rosterSortKey === 'age') { va = a.age || 0; vb = b.age || 0; }
            else if (rosterSortKey === 'contact') { va = a.ratings ? a.ratings.contact : 0; vb = b.ratings ? b.ratings.contact : 0; }
            else if (rosterSortKey === 'power_r') { va = a.ratings ? a.ratings.power : 0; vb = b.ratings ? b.ratings.power : 0; }
            else if (rosterSortKey === 'eye') { va = a.ratings ? a.ratings.eye : 0; vb = b.ratings ? b.ratings.eye : 0; }
            else if (rosterSortKey === 'speed_r') { va = a.ratings ? a.ratings.speed : 0; vb = b.ratings ? b.ratings.speed : 0; }
            else if (rosterSortKey === 'defense_r') { va = a.ratings ? a.ratings.defense : 0; vb = b.ratings ? b.ratings.defense : 0; }
            else if (rosterSortKey === 'stuff') { va = a.ratings ? a.ratings.stuff : 0; vb = b.ratings ? b.ratings.stuff : 0; }
            else if (rosterSortKey === 'command') { va = a.ratings ? a.ratings.command : 0; vb = b.ratings ? b.ratings.command : 0; }
            else if (rosterSortKey === 'stamina') { va = a.ratings ? a.ratings.stamina : 0; vb = b.ratings ? b.ratings.stamina : 0; }
            else if (rosterSortKey === 'effectiveness') { va = a.ratings ? a.ratings.effectiveness : 0; vb = b.ratings ? b.ratings.effectiveness : 0; }
            else if (rosterSortKey === 'consistency') { va = a.ratings ? a.ratings.consistency : 0; vb = b.ratings ? b.ratings.consistency : 0; }
            else if (rosterSortKey === 'ovr') { va = a.ovr || a.power; vb = b.ovr || b.power; }
            else if (rosterSortKey === 'power') { va = a.power; vb = b.power; }
            else if (rosterSortKey === 'salary') { va = a.salary; vb = b.salary; }
            else { va = a.stats[rosterSortKey] || 0; vb = b.stats[rosterSortKey] || 0; }

            if (typeof va === 'string') {
                return rosterSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
            }
            return rosterSortDir === 'asc' ? va - vb : vb - va;
        };
        pitchers.sort(sortFn);
        batters.sort(sortFn);
    }

    // Update sort indicators
    document.querySelectorAll('.player-table th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === rosterSortKey) {
            th.classList.add(rosterSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });

    const actionCol = rosterTier === '2군'
        ? '<th style="width:50px;">등록</th>'
        : '<th style="width:50px;">말소</th>';

    const pTbody = document.querySelector('#pitcherTable tbody');
    pTbody.innerHTML = pitchers.map(p => {
        const actionBtn = rosterTier === '2군'
            ? (p.isMilitary ? `<td><span style="color:#4A6741;font-size:11px;">복무중</span></td>` : (p.isInjured ? `<td><span style="${p.injuryType && p.injuryType.includes('징계') ? 'color:#ED1C24' : 'color:#D97706'};font-size:11px;">${p.injuryType || '부상'}<br>${p.injuryRecovery || ''} 복귀</span></td>` : `<td><button class="promote-btn" data-id="${p.id}" data-team="${code}">↑ 등록</button></td>`))
            : `<td><button class="demote-btn" data-id="${p.id}" data-team="${code}">↓ 말소</button></td>`;
        const roleSelect = `<select class="role-select" data-id="${p.id}">
            <option value="선발" ${p.role==='선발'?'selected':''}>선발</option>
            <option value="중계" ${p.role==='중계'?'selected':''}>중계</option>
            <option value="마무리" ${p.role==='마무리'?'selected':''}>마무리</option>
        </select>`;
        const r = p.ratings;
        const hasRatings = !!r;
        return `<tr data-player-id="${p.id}">
            <td class="num-cell" style="color:var(--text-dim);cursor:pointer;" onclick="event.stopPropagation(); editPlayerNumber('${p.id}', this)" title="클릭하여 등번호 변경">${p.number != null ? p.number : '-'}</td>
            <td>${p.name}${p.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}${p.isForeign ? ' <span style="color:#B3A177;font-size:10px;">외</span>' : ''}${p.isInjured ? ` <span class="injured-badge">${p.injuryType && p.injuryType.includes('징계') ? '징계' : '부상'}</span>` : (p.isMilitary ? ' <span class="mil-badge">군보류</span>' : (p.isFutures ? (p.number >= 100 ? ' <span class="dev-badge">육성</span>' : ' <span class="futures-badge">2군</span>') : ''))}</td>
            <td>${roleSelect}</td>
            <td style="font-size:11px;color:${p.throwBat && p.throwBat.startsWith('좌') ? '#00AEEF' : '#8899aa'};">${p.throwBat ? p.throwBat.substring(0, 2) : '-'}</td>
            <td style="font-size:11px;">${p.age != null ? p.age + '세' : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.stuff) : '#8899aa'};">${hasRatings ? r.stuff : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.command) : '#8899aa'};">${hasRatings ? r.command : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.stamina) : '#8899aa'};">${hasRatings ? r.stamina : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.effectiveness) : '#8899aa'};">${hasRatings ? r.effectiveness : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.consistency) : '#8899aa'};">${hasRatings ? r.consistency : '-'}</td>
            <td><div class="power-cell">
                <div class="power-mini-bar"><div class="power-mini-bar__fill" style="width:${(hasRatings ? p.ovr : p.power) / 80 * 100}%; background:${hasRatings ? ratingColor(p.ovr) : powerColor(p.power)};"></div></div>
                <span style="font-weight:700;">${hasRatings ? p.ovr : p.power.toFixed(1)}</span>
            </div></td>
            <td>${p.salary}억</td>
            ${actionBtn}
        </tr>`;
    }).join('');

    const bTbody = document.querySelector('#batterTable tbody');
    bTbody.innerHTML = batters.map(b => {
        const actionBtn = rosterTier === '2군'
            ? (b.isMilitary ? `<td><span style="color:#4A6741;font-size:11px;">복무중</span></td>` : (b.isInjured ? `<td><span style="${b.injuryType && b.injuryType.includes('징계') ? 'color:#ED1C24' : 'color:#D97706'};font-size:11px;">${b.injuryType && b.injuryType.includes('징계') ? b.injuryType : '부상중'}</span></td>` : `<td><button class="promote-btn" data-id="${b.id}" data-team="${code}">↑ 등록</button></td>`))
            : `<td><button class="demote-btn" data-id="${b.id}" data-team="${code}">↓ 말소</button></td>`;
        const r = b.ratings;
        const hasRatings = !!r;
        const penaltyVal = b.positionPenalty || 0;
        const penaltyBadge = penaltyVal < 0 ? ` <span class="pos-penalty">${penaltyVal}</span>` : '';
        const primaryPos = b.primaryPosition || b.position;
        const posOptions = ['C','1B','2B','3B','SS','LF','CF','RF'].map(pos => {
            const pen = getPositionPenalty(primaryPos, pos);
            const label = pen < 0 ? `${pos} (${pen})` : pos;
            return `<option value="${pos}" ${b.position===pos?'selected':''}>${label}</option>`;
        }).join('');
        const posSelect = `<select class="pos-select ${penaltyVal < 0 ? 'pos-select--penalty' : ''}" data-id="${b.id}">${posOptions}</select>`;
        return `<tr data-player-id="${b.id}">
            <td style="color:var(--text-dim);">${b.number != null ? b.number : '-'}</td>
            <td>${b.name}${b.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}${b.isForeign ? ' <span style="color:#B3A177;font-size:10px;">외</span>' : ''}${b.isInjured ? ' <span class="injured-badge">부상</span>' : (b.isMilitary ? ' <span class="mil-badge">군보류</span>' : (b.isFutures ? (b.number >= 100 ? ' <span class="dev-badge">육성</span>' : ' <span class="futures-badge">2군</span>') : ''))}</td>
            <td>${posSelect}${penaltyBadge}</td>
            <td style="font-size:11px;color:#8899aa;">${b.throwBat || '-'}</td>
            <td style="font-size:11px;">${b.age != null ? b.age + '세' : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.contact) : '#8899aa'};">${hasRatings ? r.contact : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.power) : '#8899aa'};">${hasRatings ? r.power : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.eye) : '#8899aa'};">${hasRatings ? r.eye : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.speed) : '#8899aa'};">${hasRatings ? r.speed : '-'}</td>
            <td style="color:${hasRatings ? ratingColor(r.defense) : '#8899aa'};">${hasRatings ? r.defense : '-'}</td>
            <td><div class="power-cell">
                <div class="power-mini-bar"><div class="power-mini-bar__fill" style="width:${(b.ovr || b.power) / 80 * 100}%; background:${hasRatings ? ratingColor(b.ovr) : powerColor(b.power)};"></div></div>
                <span style="font-weight:700;">${hasRatings ? b.ovr : b.power.toFixed(1)}</span>
            </div></td>
            <td>${b.salary}억</td>
            ${actionBtn}
        </tr>`;
    }).join('');

    // 등록/말소 버튼 이벤트 바인딩
    document.querySelectorAll('.promote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); handlePromote(btn.dataset.team, btn.dataset.id); });
    });
    document.querySelectorAll('.demote-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); handleDemote(btn.dataset.team, btn.dataset.id); });
    });

    // 투수 역할 변경
    const rosterTeamCode = document.getElementById('rosterTeamSelect')?.value;
    const isMyTeam = typeof isStudent !== 'function' || !isStudent() || (typeof getMyTeam === 'function' && getMyTeam() === rosterTeamCode);
    document.querySelectorAll('.role-select').forEach(sel => {
        if (!isMyTeam) { sel.disabled = true; sel.title = '다른 팀은 변경할 수 없습니다'; return; }
        sel.addEventListener('click', e => e.stopPropagation());
        sel.addEventListener('change', (e) => {
            e.stopPropagation();
            const result = changePitcherRole(state, sel.dataset.id, sel.value);
            if (result.success) {
                showToast(result.msg, 'success');
                renderRoster();
            } else {
                showToast(result.msg, 'error');
            }
        });
    });

    // 야수 포지션 변경
    document.querySelectorAll('.pos-select').forEach(sel => {
        if (!isMyTeam) { sel.disabled = true; sel.title = '다른 팀은 변경할 수 없습니다'; return; }
        sel.addEventListener('click', e => e.stopPropagation());
        sel.addEventListener('change', (e) => {
            e.stopPropagation();
            const result = changePlayerPosition(state, sel.dataset.id, sel.value);
            if (result.success) {
                updateAllPowerScores();
                showToast(result.msg, result.penalty < 0 ? 'error' : 'success');
                renderRoster();
            } else {
                showToast(result.msg, 'error');
            }
        });
    });

    // 선수 행 클릭 → 상세 모달
    document.querySelectorAll('.player-table tbody tr[data-player-id]').forEach(row => {
        row.addEventListener('click', () => {
            const pid = row.dataset.playerId;
            if (pid && state.players[pid]) showPlayerModal(state.players[pid]);
        });
    });
}

// ── 등록/말소 스왑 모달 ──

let swapModalState = null; // { mode, teamCode, playerId, tab }

function openSwapModal(mode, teamCode, playerId) {
    // 권한 체크
    if (typeof guardTeamAction === 'function' && !guardTeamAction(teamCode, '등록/말소')) return;
    // mode: 'promote' (2군→1군 등록, 1군에서 말소 대상 선택)
    //        'demote' (1군→2군 말소, 2군에서 등록 대상 선택)
    const player = state.players[playerId];
    const modal = document.getElementById('swapModal');
    const title = document.getElementById('swapModalTitle');
    const desc = document.getElementById('swapModalDesc');

    const swapModalEl = document.querySelector('.modal--swap');
    if (mode === 'promote') {
        title.textContent = `1군 등록: ${player.name}`;
        desc.innerHTML = `${player.name}을(를) 1군에 등록합니다.<br>말소할 선수를 선택하거나, 말소 없이 바로 등록할 수 있습니다.`;
        swapModalEl.style.borderTop = '3px solid #00AEEF';
    } else {
        title.textContent = `1군 말소: ${player.name}`;
        desc.innerHTML = `${player.name}을(를) 말소합니다.<br>등록할 선수를 선택하거나, 등록 없이 바로 말소할 수 있습니다.`;
        swapModalEl.style.borderTop = '3px solid #00A5BD';
    }

    swapModalState = { mode, teamCode, playerId, tab: 'pitcher' };

    // 탭 초기화
    document.querySelectorAll('.swap-tab').forEach(t => {
        t.classList.toggle('swap-tab--active', t.dataset.swapTab === 'pitcher');
    });

    renderSwapList();
    modal.style.display = 'flex';
}

function renderSwapList() {
    if (!swapModalState) return;
    const { mode, teamCode, playerId, tab } = swapModalState;
    const listEl = document.getElementById('swapList');
    const player = state.players[playerId];

    // 단독 등록/말소 버튼
    let soloBtn = '';
    if (mode === 'promote') {
        soloBtn = `<div class="swap-solo-action">
            <button class="btn btn--primary btn--sm" id="btnSoloPromote">말소 없이 바로 등록 ↑</button>
            <span class="swap-solo-hint">${player.name}을(를) 1군에 바로 등록합니다</span>
        </div>`;
    } else {
        soloBtn = `<div class="swap-solo-action">
            <button class="btn btn--sm" id="btnSoloDemote" style="background:var(--kbo-mint);color:#fff;border-color:var(--kbo-mint);">등록 없이 바로 말소 ↓</button>
            <span class="swap-solo-hint">${player.name}을(를) 2군으로 바로 말소합니다</span>
        </div>`;
    }

    let candidates;
    if (mode === 'promote') {
        candidates = getTeamPlayers(state, teamCode);
    } else {
        candidates = getTeamFuturesPlayers(state, teamCode);
    }

    if (tab === 'pitcher') {
        candidates = candidates.filter(p => p.position === 'P');
    } else {
        candidates = candidates.filter(p => p.position !== 'P');
    }

    const divider = `<div class="swap-divider"><span>또는 교환할 선수 선택</span></div>`;

    const header = `<div class="swap-player-row swap-header">
        <span class="sp-no">번호</span>
        <span class="sp-name">이름</span>
        <span class="sp-pos">포지션</span>
        <span class="sp-tb">투타</span>
        <span class="sp-ovr">OVR</span>
        <span class="sp-salary">연봉</span>
    </div>`;

    const rows = candidates.length === 0
        ? '<div class="swap-empty">해당 포지션 선수가 없습니다.</div>'
        : candidates.map(p => {
            const pw = (typeof p.power === 'number') ? p.power.toFixed(1) : '-';
            const pwNum = (typeof p.power === 'number') ? p.power : 0;
            const sal = (typeof p.salary === 'number') ? p.salary + '억' : '-';
            const ovrBar = (typeof p.power === 'number')
                ? `<div class="sp-ovr">
                    <div class="sp-ovr-bar"><div class="sp-ovr-bar__fill" style="width:${pwNum}%; background:${powerColor(pwNum)};"></div></div>
                    <span style="color:${powerColor(pwNum)};">${pw}</span>
                   </div>`
                : `<div class="sp-ovr"><span>-</span></div>`;
            return `<div class="swap-player-row" data-swap-id="${p.id}">
                <span class="sp-no">#${p.number != null ? p.number : '-'}</span>
                <span class="sp-name">${p.name}${p.isForeign ? ' <span style="color:#B3A177;font-size:10px;">외</span>' : ''}</span>
                <span class="sp-pos">${p.position || '-'}</span>
                <span class="sp-tb">${p.throwBat || '-'}</span>
                ${ovrBar}
                <span class="sp-salary">${sal}</span>
            </div>`;
        }).join('');

    listEl.innerHTML = soloBtn + divider + header + rows;

    // 단독 버튼 이벤트
    const soloProm = document.getElementById('btnSoloPromote');
    if (soloProm) {
        soloProm.addEventListener('click', () => {
            if (!confirm(`${player.name}을(를) 말소 없이 1군에 등록합니다.\n진행하시겠습니까?`)) return;
            const result = promotePlayerSimple(state, teamCode, playerId);
            if (result.success) {
                updateAllPowerScores();
                showToast(result.msg, 'success');
                closeSwapModal();
                renderRoster();
            } else {
                showToast(result.msg, 'error');
            }
        });
    }
    const soloDem = document.getElementById('btnSoloDemote');
    if (soloDem) {
        soloDem.addEventListener('click', () => {
            if (!confirm(`${player.name}을(를) 등록 없이 2군으로 말소합니다.\n진행하시겠습니까?`)) return;
            const result = demotePlayer(state, teamCode, playerId);
            if (result.success) {
                updateAllPowerScores();
                showToast(result.msg, 'success');
                closeSwapModal();
                renderRoster();
            } else {
                showToast(result.msg, 'error');
            }
        });
    }
}

function closeSwapModal() {
    document.getElementById('swapModal').style.display = 'none';
    swapModalState = null;
}

function handleSwapSelect(selectedId) {
    if (!swapModalState) return;
    const { mode, teamCode, playerId } = swapModalState;
    // 권한 체크
    if (typeof guardTeamAction === 'function' && !guardTeamAction(teamCode, '등록/말소')) { closeSwapModal(); return; }
    const player = state.players[playerId];
    const selected = state.players[selectedId];

    const fmtOvr = p => (typeof p.power === 'number') ? `OVR ${p.power.toFixed(1)}` : '';

    if (mode === 'promote') {
        // playerId = 2군 선수 (등록), selectedId = 1군 선수 (말소)
        if (!confirm(`${player.name} (${fmtOvr(player)}) 등록 ↑\n${selected.name} (${fmtOvr(selected)}) 말소 ↓\n\n진행하시겠습니까?`)) return;
        const result = promotePlayer(state, teamCode, playerId, selectedId);
        if (result.success) {
            updateAllPowerScores();
            showToast(result.msg, 'success');
            closeSwapModal();
            renderRoster();
        } else {
            showToast(result.msg, 'error');
        }
    } else {
        // playerId = 1군 선수 (말소), selectedId = 2군 선수 (등록)
        if (!confirm(`${selected.name} (${fmtOvr(selected)}) 등록 ↑\n${player.name} (${fmtOvr(player)}) 말소 ↓\n\n진행하시겠습니까?`)) return;
        const result = promotePlayer(state, teamCode, selectedId, playerId);
        if (result.success) {
            updateAllPowerScores();
            showToast(result.msg, 'success');
            closeSwapModal();
            renderRoster();
        } else {
            showToast(result.msg, 'error');
        }
    }
}

function handlePromote(teamCode, playerId) {
    openSwapModal('promote', teamCode, playerId);
}

function handleDemote(teamCode, playerId) {
    openSwapModal('demote', teamCode, playerId);
}

// ── 선수 상세 모달 ──

function generateScoutReport(player) {
    const r = player.ratings;
    const rs = player.realStats;
    const age = player.age;

    if (!r) {
        if (player.isForeign) return '외국인 선수 — KBO 기록 분석 필요';
        if (player.isInjured) return `${player.injuryType && player.injuryType.includes('징계') ? '징계 선수' : '부상 선수'} — ${player.injuryType || '부상'} (복귀: ${player.injuryRecovery || '미정'})`;
        if (player.isMilitary) return '군보류 선수 — 이번 시즌 등록 불가';
        if (player.isFutures) return '2군 유망주 — 성장 가능성 주목';
        if (player.position === 'P') return '';
        if (age && age <= 23) return '영건 — 실전 경험 필요';
        return '데이터 부족 — 시즌 기록 확인 필요';
    }

    // 나이 구간: 유망주/성장기/전성기/베테랑/노장
    const agePhase = !age ? 'unknown'
        : age <= 23 ? 'prospect'   // 유망주
        : age <= 27 ? 'rising'     // 성장기
        : age <= 32 ? 'prime'      // 전성기
        : age <= 35 ? 'veteran'    // 베테랑
        : 'aging';                 // 노장

    // ── 투수 스카우트 리포트 ──
    if (player.position === 'P' && r.stuff != null) {
        const strengths = [];
        const weaknesses = [];

        if (r.stuff >= 70) strengths.push('압도적 구위');
        else if (r.stuff >= 60) strengths.push('좋은 구위');
        if (r.command >= 70) strengths.push('정밀 제구');
        else if (r.command >= 60) strengths.push('안정적 제구');
        if (r.stamina >= 70) strengths.push('강철 체력');
        else if (r.stamina >= 60) strengths.push('준수한 체력');
        if (r.effectiveness >= 70) strengths.push('뛰어난 효율');
        else if (r.effectiveness >= 60) strengths.push('좋은 효율');
        if (r.consistency >= 70) strengths.push('탁월한 안정감');
        else if (r.consistency >= 60) strengths.push('안정적');

        if (r.stuff <= 30) weaknesses.push('구위 부족');
        if (r.command <= 30) weaknesses.push('제구 불안');
        if (r.stamina <= 30) weaknesses.push('체력 약점');
        if (r.effectiveness <= 35) weaknesses.push('효율 낮음');
        if (r.consistency <= 30) weaknesses.push('안정감 부족');

        let type = '';
        const role = player.role || '';
        if (r.stuff >= 65 && r.command >= 60 && r.effectiveness >= 60) type = '에이스형';
        else if (r.stuff >= 65 && r.effectiveness >= 55) type = '파워 피처';
        else if (r.command >= 65 && r.effectiveness >= 60) type = '컨트롤 피처';
        else if (r.stamina >= 70 && r.effectiveness >= 55) type = '이닝이터';
        else if (r.stuff >= 60 && role === '마무리') type = '마무리형';
        else if (r.consistency >= 60 && role === '중계') type = '셋업형';
        else if (r.effectiveness >= 55) type = '안정형';
        else if (player.ovr >= 50) type = '밸런스형';
        else if (agePhase === 'prospect') type = '성장형 유망주';
        else if (agePhase === 'rising') type = '기량 발전 중';
        else type = '보강 고려';

        let report = type;
        if (weaknesses.length > 0 && strengths.length > 0) report += ', ' + weaknesses[0];

        let warTag = '';
        if (rs) {
            if (rs.WAR >= 5) warTag = '에이스급';
            else if (rs.WAR >= 3) warTag = '올스타급';
            else if (rs.WAR >= 2) warTag = '팀 핵심';
            else if (rs.WAR >= 1) warTag = '주전급';
            else if (rs.WAR >= 0) warTag = role === '선발' ? '로테이션 요원' : '불펜 요원';
            else warTag = '보강 고려';
        }

        let ageTag = '';
        if (agePhase === 'prospect' && player.ovr >= 45) ageTag = '유망주';
        else if (agePhase === 'prospect') ageTag = '영건';
        else if (agePhase === 'rising' && player.ovr >= 55) ageTag = '성장세';
        else if (agePhase === 'veteran' && player.ovr >= 55) ageTag = '노익장';
        else if (agePhase === 'veteran') ageTag = '베테랑';
        else if (agePhase === 'aging' && player.ovr >= 50) ageTag = '노장 건재';
        else if (agePhase === 'aging') ageTag = '은퇴 고려';

        const parts = [];
        if (ageTag) parts.push(ageTag);
        parts.push(report);
        let result = parts.join(' · ');
        if (warTag) result += ' — ' + warTag;
        return result;
    }

    // ── 타자 스카우트 리포트 ──
    const strengths = [];
    const weaknesses = [];

    if (r.contact >= 70) strengths.push('뛰어난 컨택');
    else if (r.contact >= 60) strengths.push('안정적 컨택');
    if (r.power >= 70) strengths.push('강력한 장타력');
    else if (r.power >= 60) strengths.push('준수한 파워');
    if (r.eye >= 70) strengths.push('탁월한 선구안');
    else if (r.eye >= 60) strengths.push('좋은 선구안');
    if (r.speed >= 70) strengths.push('발이 빠른');
    else if (r.speed >= 60) strengths.push('준족');
    if (r.defense >= 70) strengths.push('골글 수비');
    else if (r.defense >= 60) strengths.push('안정적 수비');

    if (r.contact <= 25) weaknesses.push('컨택 취약');
    if (r.power <= 25) weaknesses.push('파워 부족');
    if (r.eye <= 25) weaknesses.push('선구안 부족');
    if (r.speed <= 25) weaknesses.push('주루 느림');
    if (r.defense <= 30) weaknesses.push('수비 불안');

    // 종합 유형 판별
    let type = '';
    if (r.power >= 65 && r.contact >= 60 && r.eye >= 60) type = '만능 타자';
    else if (r.speed >= 65 && r.defense >= 60) type = '스피드+수비 특화';
    else if (r.speed >= 65 && r.contact >= 60) type = '리드오프형';
    else if (r.power >= 65 && r.contact >= 55) type = '중심 타자';
    else if (r.power >= 65) type = '장타형';
    else if (r.defense >= 65 && r.contact >= 60) type = '수비형 타자';
    else if (r.defense >= 65) type = '수비 전문';
    else if (r.contact >= 65 && r.eye >= 65) type = '출루형 타자';
    else if (r.eye >= 65 && r.power >= 50) type = '선구안형 타자';
    else if (r.contact >= 65) type = '교타형';
    else if (r.speed >= 55) type = '기동력형';
    else if (player.ovr >= 50) type = '밸런스형';
    else {
        // OVR 낮을 때: 나이에 따라 다른 표현
        if (agePhase === 'prospect') type = '성장형 유망주';
        else if (agePhase === 'rising') type = '기량 발전 중';
        else if (agePhase === 'prime') type = '부진 탈출 필요';
        else if (agePhase === 'veteran') type = '에이징 커브 진입';
        else if (agePhase === 'aging') type = '하락세 뚜렷';
        else type = '밸런스 부족';
    }

    // 나이별 수식어
    let ageTag = '';
    if (agePhase === 'prospect' && player.ovr >= 45) ageTag = '유망주';
    else if (agePhase === 'prospect') ageTag = '영건';
    else if (agePhase === 'rising' && player.ovr >= 55) ageTag = '성장세';
    else if (agePhase === 'veteran' && player.ovr >= 55) ageTag = '노익장';
    else if (agePhase === 'veteran' && strengths.length > 0) ageTag = '베테랑';
    else if (agePhase === 'aging' && player.ovr >= 50) ageTag = '노장 건재';
    else if (agePhase === 'aging') ageTag = '은퇴 고려';

    // 조합
    let report = type;
    if (weaknesses.length > 0 && strengths.length > 0) {
        report += ', ' + weaknesses[0];
    } else if (strengths.length >= 2 && player.ovr < 50) {
        report = strengths.slice(0, 2).join(' + ');
    }

    // WAR 기반 등급
    let warTag = '';
    if (rs) {
        if (rs.WAR >= 5) warTag = '리그 MVP급';
        else if (rs.WAR >= 4) warTag = '올스타급';
        else if (rs.WAR >= 3) warTag = '팀 핵심';
        else if (rs.WAR >= 2) warTag = '주전급';
        else if (rs.WAR >= 0 && agePhase === 'veteran') warTag = '역할 축소';
        else if (rs.WAR < 0 && agePhase === 'prospect') warTag = '경험 축적 중';
        else if (rs.WAR < 0) warTag = '보강 고려';
    }

    // 최종 조합: [나이태그] 유형 — WAR등급
    const parts = [];
    if (ageTag) parts.push(ageTag);
    parts.push(report);
    let result = parts.join(' · ');
    if (warTag) result += ' — ' + warTag;

    return result;
}

function showPlayerModal(player) {
    const modal = document.getElementById('playerModal');
    modal.style.display = 'flex';

    const p = player;
    const teamName = state.teams[p.team] ? state.teams[p.team].name : p.team;
    const teamColor = state.teams[p.team] ? state.teams[p.team].color : '#888';

    // 한줄평
    const scoutReport = generateScoutReport(p);

    // 헤더
    const modalOvr = p.ovr || p.powerScore || 0;
    document.getElementById('playerModalHeader').innerHTML = `
        <img class="pm-team-logo" src="${teamLogo(p.team)}" alt="${teamName}">
        <div class="pm-number" style="color:${teamColor};">${p.number != null ? '#' + p.number : ''}</div>
        <div class="pm-info">
            <div class="pm-name">${p.name}</div>
            <div class="pm-meta">
                <span>${teamName}</span>
                <span>${p.position === 'P' ? '투수 (' + (p.role || '') + ')' : p.position}</span>
                ${p.throwBat ? `<span>${p.position === 'P' ? (p.throwBat.startsWith('좌') ? '좌투수' : '우투수') : p.throwBat}</span>` : ''}
                ${p.age != null ? `<span>${p.age}세</span>` : ''}
                ${p.height ? `<span>${p.height}cm / ${p.weight}kg</span>` : ''}
            </div>
            ${scoutReport ? `<div class="pm-scout-report">${scoutReport}</div>` : ''}
            <div class="pm-badges">
                ${p.isFranchiseStar ? '<span class="franchise-star-badge">★ 프랜차이즈 스타</span>' : ''}
                ${p.isForeign ? '<span style="display:inline-block;padding:1px 6px;background:rgba(179,161,119,0.15);color:#B3A177;border-radius:4px;font-size:11px;">외국인</span>' : ''}
                ${p.isFutures ? '<span class="futures-badge">2군</span>' : ''}
                <span style="display:inline-block;padding:1px 8px;background:rgba(255,255,255,0.06);border-radius:4px;font-size:12px;font-weight:600;">연봉 ${p.salary}억</span>
            </div>
        </div>
        <div style="text-align:center;flex-shrink:0;margin-left:auto;">
            <div style="font-size:10px;font-weight:600;color:var(--text-dim);">OVR</div>
            <div style="font-size:32px;font-weight:900;color:${ratingColor(modalOvr)};line-height:1;">${Math.round(modalOvr)}</div>
        </div>
    `;

    // 레이팅 (20-80)
    const ratingsEl = document.getElementById('playerModalRatings');

    if (p.ratings && p.position !== 'P') {
        const r = p.ratings;
        const tools = [
            { label: '컨택', val: r.contact },
            { label: '파워', val: r.power },
            { label: '선구안', val: r.eye },
            { label: '스피드', val: r.speed },
            { label: '수비', val: r.defense },
        ];
        const posDiamond = renderPositionDiamondOnly(p);
        const fiveToolRadar = renderFiveToolRadar(p);
        ratingsEl.innerHTML = `
            <div class="pm-ratings-title">20-80 스카우팅 레이팅</div>
            ${tools.map(t => `
                <div class="pm-rating-row">
                    <span class="pm-rating-label">${t.label}</span>
                    <div class="pm-rating-bar">
                        <div class="pm-rating-fill" style="width:${(t.val - 20) / 60 * 100}%; background:${ratingColor(t.val)};"></div>
                    </div>
                    <span class="pm-rating-value" style="color:${ratingColor(t.val)};">${t.val}</span>
                </div>
            `).join('')}
            ${posDiamond}
            ${fiveToolRadar}
        `;
    } else if (p.ratings && p.position === 'P') {
        const r = p.ratings;
        const tools = [
            { label: '구위', val: r.stuff },
            { label: '제구', val: r.command },
            { label: '체력', val: r.stamina },
            { label: '효율', val: r.effectiveness },
            { label: '안정', val: r.consistency },
        ];
        const pitchData = (p.realStats && p.realStats.pitches) ? p.realStats : (p.pitches ? { pitches: p.pitches } : null);
        const pitchSection = pitchData ? `<div class="pm-ratings-title" style="margin-top:12px;">구종</div>${renderPitcherPitchTypes(pitchData)}` : '';
        ratingsEl.innerHTML = `
            <div class="pm-ratings-title">20-80 스카우팅 레이팅</div>
            ${tools.map(t => `
                <div class="pm-rating-row">
                    <span class="pm-rating-label">${t.label}</span>
                    <div class="pm-rating-bar">
                        <div class="pm-rating-fill" style="width:${(t.val - 20) / 60 * 100}%; background:${ratingColor(t.val)};"></div>
                    </div>
                    <span class="pm-rating-value" style="color:${ratingColor(t.val)};">${t.val}</span>
                </div>
            `).join('')}
            ${pitchSection}
        `;
    } else if (p.position === 'P') {
        const pw = calcPlayerPower(p);
        ratingsEl.innerHTML = profileHTML + `
            <div class="pm-ratings-title">투수 능력치</div>
            <div class="pm-rating-row">
                <span class="pm-rating-label">파워</span>
                <div class="pm-rating-bar">
                    <div class="pm-rating-fill" style="width:${pw}%; background:${powerColor(pw)};"></div>
                </div>
                <span class="pm-rating-value" style="color:${powerColor(pw)};">${pw.toFixed(1)}</span>
            </div>
        `;
    } else {
        ratingsEl.innerHTML = profileHTML;
    }

    // 시즌 성적 (3탭) — 시뮬 시작 후에는 simStats 우선 표시
    const statsEl = document.getElementById('playerModalStats');
    const rs = (isSeasonStarted() && p.simStats) ? p.simStats : p.realStats;
    const statsLabel = (isSeasonStarted() && p.simStats) ? '2026' : '2025';

    if (rs && p.position !== 'P') {
        statsEl.innerHTML = `
            <div class="pm-tabs">
                <button class="pm-tab active" data-pm-tab="classic">클래식</button>
                <button class="pm-tab" data-pm-tab="saber">세이버메트릭스</button>
                <button class="pm-tab" data-pm-tab="defense">수비</button>
            </div>
            <div class="pm-tab-content" id="pmTabClassic">
                ${renderClassicStats(rs)}
            </div>
            <div class="pm-tab-content" id="pmTabSaber" style="display:none;">
                ${renderSaberStats(rs)}
            </div>
            <div class="pm-tab-content" id="pmTabDefense" style="display:none;">
                ${renderDefenseStats(rs, p)}
            </div>
        `;
        // 탭 전환 이벤트
        statsEl.querySelectorAll('.pm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                statsEl.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('pmTabClassic').style.display = tab.dataset.pmTab === 'classic' ? 'block' : 'none';
                document.getElementById('pmTabSaber').style.display = tab.dataset.pmTab === 'saber' ? 'block' : 'none';
                document.getElementById('pmTabDefense').style.display = tab.dataset.pmTab === 'defense' ? 'block' : 'none';
            });
        });
    } else if (rs && p.position === 'P') {
        statsEl.innerHTML = `
            <div class="pm-tabs">
                <button class="pm-tab active" data-pm-tab="p-classic">클래식</button>
                <button class="pm-tab" data-pm-tab="p-saber">세이버메트릭스</button>
            </div>
            <div class="pm-tab-content" id="pmTabPClassic">
                ${renderPitcherClassicStats(rs)}
            </div>
            <div class="pm-tab-content" id="pmTabPSaber" style="display:none;">
                ${renderPitcherSaberStats(rs)}
            </div>
        `;
        statsEl.querySelectorAll('.pm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                statsEl.querySelectorAll('.pm-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('pmTabPClassic').style.display = tab.dataset.pmTab === 'p-classic' ? 'block' : 'none';
                document.getElementById('pmTabPSaber').style.display = tab.dataset.pmTab === 'p-saber' ? 'block' : 'none';
            });
        });
    } else {
        statsEl.innerHTML = `
            <div class="pm-stats-title">${statsLabel} 시즌 성적</div>
            <div class="pm-no-data">
                ${p.isForeign ? '외국인 선수 — KBO 이전 시즌 기록 없음' :
                  p.isFutures ? '2군 선수 — 1군 시즌 기록 없음' :
                  isSeasonStarted() ? '아직 시뮬레이션 데이터가 부족합니다.' :
                  '시즌 기록 데이터가 등록되지 않았습니다.'}
            </div>
        `;
    }

    // 닫기
    document.getElementById('playerModalClose').onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function renderClassicStats(rs) {
    const items = [
        { label: '경기', value: rs.G },
        { label: '타석', value: rs.PA },
        { label: '타수', value: rs.AB },
        { label: '타율', value: rs.AVG.toFixed(3) },
        { label: '안타', value: rs.H },
        { label: '2루타', value: rs['2B'] },
        { label: '3루타', value: rs['3B'] },
        { label: '홈런', value: rs.HR },
        { label: '타점', value: rs.RBI },
        { label: '득점', value: rs.R },
        { label: '도루', value: rs.SB },
        { label: '도실', value: rs.CS },
        { label: '볼넷', value: rs.BB },
        { label: '삼진', value: rs.SO },
    ];
    return `<div class="pm-stats-grid">${items.map(s =>
        `<div class="pm-stat-cell">
            <div class="pm-stat-label">${s.label}</div>
            <div class="pm-stat-value">${s.value != null ? s.value : '-'}</div>
        </div>`
    ).join('')}</div>`;
}

function renderSaberStats(rs) {
    const valColor = (label, val) => {
        if (label === 'wRC+') return val >= 130 ? '#22c55e' : val >= 100 ? '#2563eb' : val >= 80 ? '#92400e' : '#ED1C24';
        if (label === 'WAR') return val >= 4 ? '#22c55e' : val >= 2 ? '#2563eb' : val >= 1 ? '#0e7490' : val >= 0 ? '#92400e' : '#ED1C24';
        if (label === 'OPS') return val >= .900 ? '#22c55e' : val >= .750 ? '#2563eb' : val >= .650 ? '#92400e' : '#ED1C24';
        if (label === 'OBP') return val >= .380 ? '#22c55e' : val >= .340 ? '#2563eb' : val >= .300 ? 'var(--text)' : '#ED1C24';
        if (label === 'SLG') return val >= .500 ? '#22c55e' : val >= .420 ? '#2563eb' : val >= .350 ? 'var(--text)' : '#ED1C24';
        if (label === 'IsoP') return val >= .200 ? '#22c55e' : val >= .140 ? '#2563eb' : val >= .100 ? 'var(--text)' : '#92400e';
        if (label === 'oWAR') return val >= 3 ? '#22c55e' : val >= 1.5 ? '#2563eb' : val >= 0 ? 'var(--text)' : '#ED1C24';
        if (label === 'dWAR') return val >= 1 ? '#22c55e' : val >= 0 ? '#2563eb' : '#ED1C24';
        if (label === 'BB%') return val >= 12 ? '#22c55e' : val >= 8 ? '#2563eb' : val >= 5 ? 'var(--text)' : '#92400e';
        if (label === 'K%') return val <= 15 ? '#22c55e' : val <= 20 ? '#2563eb' : val <= 25 ? 'var(--text)' : '#ED1C24';
        if (label === 'BB/K') return val >= 0.6 ? '#22c55e' : val >= 0.4 ? '#2563eb' : val >= 0.25 ? 'var(--text)' : '#ED1C24';
        return 'var(--text)';
    };
    const items = [
        { label: 'OBP', value: rs.OBP.toFixed(3) },
        { label: 'SLG', value: rs.SLG.toFixed(3) },
        { label: 'OPS', value: rs.OPS.toFixed(3) },
        { label: 'IsoP', value: (rs.IsoP || 0).toFixed(3) },
        { label: 'wRC+', value: rs['wRC+'].toFixed(1) },
        { label: 'WAR', value: rs.WAR.toFixed(2) },
        { label: 'oWAR', value: (rs.oWAR || 0).toFixed(2) },
        { label: 'dWAR', value: (rs.dWAR || 0).toFixed(2) },
        { label: 'BB%', value: (rs.BB / rs.PA * 100).toFixed(1) + '%' },
        { label: 'K%', value: (rs.SO / rs.PA * 100).toFixed(1) + '%' },
        { label: 'BB/K', value: rs.SO > 0 ? (rs.BB / rs.SO).toFixed(2) : '-' },
    ];
    return `<div class="pm-stats-grid">${items.map(s => {
        const c = valColor(s.label, parseFloat(s.value));
        return `<div class="pm-stat-cell">
            <div class="pm-stat-label">${s.label}</div>
            <div class="pm-stat-value" style="color:${c};">${s.value}</div>
        </div>`;
    }).join('')}</div>`;
}

function renderDefenseStats(rs, player) {
    const defRAA = rs.defRAA;
    if (defRAA == null) {
        return '<div class="pm-no-data">수비 데이터가 등록되지 않았습니다.</div>';
    }

    const defColor = v => v > 2 ? '#22c55e' : v > 0 ? '#4ade80' : v > -2 ? '#B3A177' : '#ED1C24';
    const fmt = v => v != null ? (v >= 0 ? '+' : '') + v.toFixed(2) : '-';

    const items = [
        { label: '수비 RAA', value: fmt(rs.defRAA), color: defColor(rs.defRAA || 0) },
        { label: 'Range RAA', value: fmt(rs.rangeRAA), color: defColor(rs.rangeRAA || 0) },
        { label: 'Err RAA', value: fmt(rs.errRAA), color: defColor(rs.errRAA || 0) },
    ];

    // 포지션별 추가 지표
    if (player.position === 'C') {
        items.push({ label: 'CS RAA', value: fmt(rs.csRAA), color: defColor(rs.csRAA || 0) });
        items.push({ label: 'Framing RAA', value: fmt(rs.frmRAA), color: defColor(rs.frmRAA || 0) });
        if (rs.BBO != null) items.push({ label: '도루저지%', value: rs.BBO.toFixed(1) + '%', color: '#e8edf2' });
    }
    if (['LF','CF','RF'].includes(player.position) && rs.armRAA != null) {
        items.push({ label: 'Arm RAA', value: fmt(rs.armRAA), color: defColor(rs.armRAA || 0) });
    }
    if (['2B','3B','SS'].includes(player.position) && rs.dpRAA != null) {
        items.push({ label: 'DP RAA', value: fmt(rs.dpRAA), color: defColor(rs.dpRAA || 0) });
    }

    items.push({ label: 'dWAR', value: (rs.dWAR || 0).toFixed(2), color: defColor(rs.dWAR || 0) });

    // 수비 등급 텍스트
    const grade = rs.defRAA >= 8 ? '골드글러브급' : rs.defRAA >= 4 ? '상위' : rs.defRAA >= 0 ? '평균' : rs.defRAA >= -4 ? '평균 이하' : '약점';
    const gradeColor = rs.defRAA >= 4 ? '#22c55e' : rs.defRAA >= 0 ? '#00AEEF' : rs.defRAA >= -4 ? '#B3A177' : '#ED1C24';

    return `
        <div style="text-align:center;margin-bottom:12px;">
            <span style="font-size:12px;color:var(--text-dim);">수비 종합 평가</span><br>
            <span style="font-size:22px;font-weight:900;color:${gradeColor};">${grade}</span>
            <span style="font-size:14px;color:${defColor(rs.defRAA)};margin-left:8px;">(${fmt(rs.defRAA)} RAA)</span>
        </div>
        <div class="pm-stats-grid">${items.map(s =>
            `<div class="pm-stat-cell">
                <div class="pm-stat-label">${s.label}</div>
                <div class="pm-stat-value" style="color:${s.color};">${s.value}</div>
            </div>`
        ).join('')}</div>
    `;
}

// ── 투수 스탯 렌더링 ──

function renderPitcherClassicStats(rs) {
    const items = [
        { label: '경기', value: rs.G },
        { label: '선발', value: rs.GS },
        { label: '승', value: rs.W },
        { label: '패', value: rs.L },
        { label: '세이브', value: rs.S },
        { label: '홀드', value: rs.HLD },
        { label: '이닝', value: fmtIP(rs.IP) },
        { label: '피안타', value: rs.H },
        { label: '피홈런', value: rs.HR },
        { label: '볼넷', value: rs.BB },
        { label: '사구', value: rs.HBP },
        { label: '삼진', value: rs.SO },
        { label: '자책점', value: rs.ER },
        { label: '실점', value: rs.R },
        { label: 'ERA', value: rs.ERA.toFixed(2) },
        { label: 'WHIP', value: rs.WHIP.toFixed(2) },
    ];
    return `<div class="pm-stats-grid">${items.map(s =>
        `<div class="pm-stat-cell">
            <div class="pm-stat-label">${s.label}</div>
            <div class="pm-stat-value">${s.value != null ? s.value : '-'}</div>
        </div>`
    ).join('')}</div>`;
}

function renderPitcherSaberStats(rs) {
    const IP = rs.IP || 1;
    const TBF = IP * 3 + (rs.H || 0) + (rs.BB || 0) + (rs.HBP || 0);
    const K9 = (rs.SO / IP * 9).toFixed(2);
    const BB9 = (rs.BB / IP * 9).toFixed(2);
    const KPCT = (rs.SO / TBF * 100).toFixed(1);
    const BBPCT = (rs.BB / TBF * 100).toFixed(1);
    const KBBPCT = ((rs.SO - rs.BB) / TBF * 100).toFixed(1);

    const valColor = (label, val) => {
        if (label === 'FIP') return val <= 3.0 ? '#22c55e' : val <= 3.8 ? '#2563eb' : val <= 4.5 ? 'var(--text)' : val <= 5.5 ? '#92400e' : '#ED1C24';
        if (label === 'WAR') return val >= 4 ? '#22c55e' : val >= 2 ? '#2563eb' : val >= 1 ? '#0e7490' : val >= 0 ? 'var(--text)' : '#ED1C24';
        if (label === 'ERA') return val <= 3.0 ? '#22c55e' : val <= 3.8 ? '#2563eb' : val <= 4.5 ? 'var(--text)' : val <= 5.5 ? '#92400e' : '#ED1C24';
        if (label === 'WPA') return val >= 2 ? '#22c55e' : val >= 0.5 ? '#2563eb' : val >= 0 ? 'var(--text)' : val >= -0.5 ? '#92400e' : '#ED1C24';
        if (label === 'K/9') return val >= 9 ? '#22c55e' : val >= 7 ? '#2563eb' : val >= 5 ? 'var(--text)' : '#92400e';
        if (label === 'BB/9') return val <= 2.5 ? '#22c55e' : val <= 3.5 ? '#2563eb' : val <= 4.5 ? 'var(--text)' : '#ED1C24';
        if (label === 'K%') return val >= 25 ? '#22c55e' : val >= 20 ? '#2563eb' : val >= 15 ? 'var(--text)' : '#92400e';
        if (label === 'BB%') return val <= 6 ? '#22c55e' : val <= 8 ? '#2563eb' : val <= 10 ? 'var(--text)' : '#ED1C24';
        if (label === 'K-BB%') return val >= 15 ? '#22c55e' : val >= 10 ? '#2563eb' : val >= 5 ? 'var(--text)' : '#92400e';
        if (label === 'BABIP') return 'var(--text)';
        return 'var(--text)';
    };
    const items = [
        { label: 'FIP', value: rs.FIP.toFixed(2) },
        { label: 'WAR', value: rs.WAR.toFixed(2) },
        { label: 'K/9', value: K9 },
        { label: 'BB/9', value: BB9 },
        { label: 'K%', value: KPCT + '%' },
        { label: 'BB%', value: BBPCT + '%' },
        { label: 'K-BB%', value: KBBPCT + '%' },
        { label: 'BABIP', value: rs.BABIP != null ? rs.BABIP.toFixed(3) : '-' },
        { label: 'WPA', value: rs.WPA != null ? rs.WPA.toFixed(2) : '-' },
        { label: 'ERA', value: rs.ERA.toFixed(2) },
    ];
    return `<div class="pm-stats-grid">${items.map(s => {
        const c = valColor(s.label, parseFloat(s.value));
        return `<div class="pm-stat-cell">
            <div class="pm-stat-label">${s.label}</div>
            <div class="pm-stat-value" style="color:${c};">${s.value}</div>
        </div>`;
    }).join('')}</div>`;
}

function renderPitcherPitchTypes(rs) {
    if (!rs.pitches || rs.pitches.length === 0) {
        return '<div class="pm-no-data">구종 데이터가 등록되지 않았습니다.</div>';
    }
    const fb = rs.pitches.find(pt => pt.name === '포심' || pt.name === '투심');
    const avgVelo = fb ? fb.velo : (rs.pitches[0] ? rs.pitches[0].velo : 0);
    const maxPct = Math.max(...rs.pitches.map(p => p.pct));
    const pitchColor = (name) => {
        if (name.includes('포심') || name.includes('투심')) return '#ED1C24';
        if (name.includes('슬라이더')) return '#00AEEF';
        if (name.includes('커브')) return '#22c55e';
        if (name.includes('체인지업')) return '#B3A177';
        if (name.includes('커터')) return '#f97316';
        if (name.includes('포크')) return '#a855f7';
        return '#8899aa';
    };
    const veloHeader = `<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
        <span style="font-size:28px;font-weight:900;color:#ED1C24;line-height:1;">${avgVelo}</span>
        <span style="font-size:11px;color:var(--text-dim);">km/h 평균구속</span>
        <div style="display:flex;gap:4px;margin-left:auto;flex-wrap:wrap;">${rs.pitches.map(pt => `<span class="pm-pitch-tag" style="background:${pitchColor(pt.name)};font-size:10px;padding:2px 6px;">${pt.name} ${pt.velo}</span>`).join('')}</div>
    </div>`;
    return veloHeader + `<div class="pm-pitch-list">${rs.pitches.map(p => `
        <div class="pm-pitch-row">
            <span class="pm-pitch-name">${p.name}</span>
            <div class="pm-pitch-bar-wrap">
                <div class="pm-pitch-bar" style="width:${p.pct / maxPct * 100}%; background:${pitchColor(p.name)};"></div>
            </div>
            <span class="pm-pitch-pct">${p.pct}%</span>
            <span class="pm-pitch-velo">${p.velo} km/h</span>
        </div>
    `).join('')}</div>`;
}

// ══════════════════════════════════════════
// ██ TRADE VIEW
// ══════════════════════════════════════════

function setupTradeView() {
    const sendSel = document.getElementById('tradeSendTeam');
    const recvSel = document.getElementById('tradeRecvTeam');
    populateTeamSelect(sendSel, state.teams);
    populateTeamSelect(recvSel, state.teams);

    // Default: second team for recv
    const codes = Object.keys(state.teams);
    if (codes.length > 1) recvSel.value = codes[1];

    sendSel.addEventListener('change', renderTradeView);
    recvSel.addEventListener('change', renderTradeView);

    document.getElementById('btnExecuteTrade').addEventListener('click', doTrade);
}

function renderTradeView() {
    tradeSelection = { send: [], recv: [] };
    const sendCode = document.getElementById('tradeSendTeam').value;
    const recvCode = document.getElementById('tradeRecvTeam').value;

    // 트레이드 팀 로고 업데이트
    if (sendCode) document.getElementById('tradeSendLogo').src = teamLogo(sendCode);
    if (recvCode) document.getElementById('tradeRecvLogo').src = teamLogo(recvCode);

    renderTradePlayerList('tradeSendList', sendCode, 'send');
    renderTradePlayerList('tradeRecvList', recvCode, 'recv');
    document.getElementById('tradeSendSelected').innerHTML = '<em style="color:#8899aa;">선수를 선택하세요</em>';
    document.getElementById('tradeRecvSelected').innerHTML = '<em style="color:#8899aa;">선수를 선택하세요</em>';
    updateTradeSummary();
    renderTradeHistory();
}

function renderTradePlayerList(containerId, teamCode, side) {
    const container = document.getElementById(containerId);
    const team = state.teams[teamCode];
    // 1군 + 2군 선수 모두 (군보류 제외)
    const rosterIds = [...(team.roster || []), ...(team.futuresRoster || [])];
    const players = rosterIds.map(id => state.players[id]).filter(Boolean);

    const pitchers = players.filter(p => p.position === 'P').sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
    const batters = players.filter(p => p.position !== 'P').sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

    function playerRow(p) {
        const power = calcPlayerPower(p);
        const is2gun = (team.futuresRoster || []).includes(p.id);
        const tierBadge = is2gun ? '<span style="background:#6366f1;color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;margin-left:3px;">2군</span>' : '';
        return `<div class="trade-player-item" data-id="${p.id}" data-side="${side}">
            <div class="trade-player-item__info">
                <span style="color:${powerColor(power)};">●</span>
                <span>${p.name}${tierBadge}</span>
                <span style="color:#8899aa; font-size:11px;">${p.position === 'P' ? (p.role || 'P') : p.position}</span>
                <span style="font-size:11px;">(${power.toFixed(1)})</span>
            </div>
            <span class="trade-player-item__salary">${p.salary}억</span>
        </div>`;
    }

    container.innerHTML = `
        <div style="display:flex;gap:4px;margin-bottom:8px;">
            <button class="btn btn--sm trade-pos-tab active" data-pos="pitcher" data-container="${containerId}">투수 (${pitchers.length})</button>
            <button class="btn btn--sm trade-pos-tab" data-pos="batter" data-container="${containerId}">타자 (${batters.length})</button>
        </div>
        <div class="trade-pos-list" data-pos="pitcher">${pitchers.map(playerRow).join('')}</div>
        <div class="trade-pos-list" data-pos="batter" style="display:none;">${batters.map(playerRow).join('')}</div>
    `;

    // 투수/타자 탭 전환
    container.querySelectorAll('.trade-pos-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.trade-pos-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            container.querySelectorAll('.trade-pos-list').forEach(l => l.style.display = 'none');
            container.querySelector(`.trade-pos-list[data-pos="${tab.dataset.pos}"]`).style.display = '';
        });
    });

    container.querySelectorAll('.trade-player-item').forEach(item => {
        item.addEventListener('click', () => toggleTradePlayer(item, side));
    });
}

function toggleTradePlayer(item, side) {
    const id = item.dataset.id;
    const arr = tradeSelection[side];
    const idx = arr.indexOf(id);

    if (idx >= 0) {
        arr.splice(idx, 1);
        item.classList.remove('selected');
    } else {
        arr.push(id);
        item.classList.add('selected');
    }

    // Update selected display
    const selectedEl = document.getElementById(side === 'send' ? 'tradeSendSelected' : 'tradeRecvSelected');
    if (arr.length === 0) {
        selectedEl.innerHTML = '<em style="color:#8899aa;">선수를 선택하세요</em>';
    } else {
        selectedEl.innerHTML = arr.map(pid => {
            const p = state.players[pid];
            return `<div style="font-size:13px; padding:2px 0;">${p.name} (${p.salary}억)</div>`;
        }).join('');
    }

    updateTradeSummary();
}

function updateTradeSummary() {
    const sendCode = document.getElementById('tradeSendTeam').value;
    const recvCode = document.getElementById('tradeRecvTeam').value;
    const summaryEl = document.getElementById('tradeSummary');
    const validEl = document.getElementById('tradeValidation');
    const btn = document.getElementById('btnExecuteTrade');

    if (tradeSelection.send.length === 0 && tradeSelection.recv.length === 0) {
        summaryEl.innerHTML = '양 팀에서 트레이드할 선수를 선택하세요.';
        validEl.innerHTML = '';
        btn.disabled = true;
        return;
    }

    const sendSalary = tradeSelection.send.reduce((s, id) => s + state.players[id].salary, 0);
    const recvSalary = tradeSelection.recv.reduce((s, id) => s + state.players[id].salary, 0);

    summaryEl.innerHTML = `
        <div>${state.teams[sendCode].name}: ${tradeSelection.send.length}명 보냄 (${sendSalary.toFixed(1)}억)</div>
        <div style="font-size:20px; margin:4px 0;">⇄</div>
        <div>${state.teams[recvCode].name}: ${tradeSelection.recv.length}명 보냄 (${recvSalary.toFixed(1)}억)</div>
    `;

    if (tradeSelection.send.length > 0 && tradeSelection.recv.length > 0) {
        const v = validateTrade(state, sendCode, recvCode, tradeSelection.send, tradeSelection.recv);
        const checks = [];

        // Roster size check
        const sameCount = tradeSelection.send.length === tradeSelection.recv.length;
        checks.push({ ok: sameCount, text: `인원 수 일치 (${tradeSelection.send.length} : ${tradeSelection.recv.length})` });

        if (v.valid) {
            checks.push({ ok: true, text: '로스터 규정 충족' });
        } else {
            v.errors.forEach(e => checks.push({ ok: false, text: e }));
        }

        // Cap warnings (경고지만 차단은 안 함)
        if (v.warnings && v.warnings.length > 0) {
            v.warnings.forEach(w => checks.push({ ok: false, text: `⚠ ${w}`, warn: true }));
        } else if (v.valid) {
            checks.push({ ok: true, text: '샐러리캡 정상' });
        }

        // Cap summary
        checks.push({ ok: true, text: `${state.teams[sendCode].name} 캡연봉: ${v.sendCapSalary}억 / ${KBO_SALARY_CAP}억`, info: true });
        checks.push({ ok: true, text: `${state.teams[recvCode].name} 캡연봉: ${v.recvCapSalary}억 / ${KBO_SALARY_CAP}억`, info: true });

        validEl.innerHTML = checks.map(c => {
            if (c.info) return `<div class="trade-validation__item" style="color:#8899aa;">ℹ ${c.text}</div>`;
            if (c.warn) return `<div class="trade-validation__item" style="color:#B3A177;">${c.text}</div>`;
            return `<div class="trade-validation__item ${c.ok ? 'trade-validation__item--ok' : 'trade-validation__item--fail'}">
                ${c.ok ? '✓' : '✗'} ${c.text}
            </div>`;
        }).join('');

        btn.disabled = !v.valid;
    } else {
        validEl.innerHTML = '<div style="color:#8899aa;">양 팀 모두 선수를 선택해야 합니다.</div>';
        btn.disabled = true;
    }
}

function doTrade() {
    const sendCode = document.getElementById('tradeSendTeam').value;
    const recvCode = document.getElementById('tradeRecvTeam').value;

    const log = executeTrade(state, sendCode, recvCode, tradeSelection.send, tradeSelection.recv);
    updateAllPowerScores();
    showToast(`트레이드 완료: ${log.sent.join(', ')} ⇄ ${log.received.join(', ')}`, 'success');
    renderTradeView();
}

function renderTradeHistory() {
    const container = document.getElementById('tradeHistory');
    const history = state.tradeHistory || [];
    if (history.length === 0) {
        container.innerHTML = '<p style="color:#8899aa; font-size:13px;">아직 트레이드 기록이 없습니다.</p>';
        return;
    }
    container.innerHTML = history.slice().reverse().map(h =>
        `<div class="trade-log">
            <strong>${h.timestamp}</strong> — ${h.sendTeam}: ${h.sent.join(', ')} ⇄ ${h.recvTeam}: ${h.received.join(', ')}
        </div>`
    ).join('');
}

// ══════════════════════════════════════════
// ██ SIMULATOR VIEW
// ══════════════════════════════════════════

let simRunning = false;

function setupSimulatorView() {
    document.getElementById('btnSimulate').addEventListener('click', runSimulation);
    // 탭 전환
    document.querySelectorAll('.sim-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sim-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.sim-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('simPanel' + capitalize(tab.dataset.simTab)).classList.add('active');
            if (tab.dataset.simTab === 'batter-records') renderBatterRecords();
            if (tab.dataset.simTab === 'pitcher-records') renderPitcherRecords();
            if (tab.dataset.simTab === 'team-records') renderTeamRecords();
        });
    });
}
function capitalize(str) {
    return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

function renderSimulator() {
    const currentQ = getCurrentQuarter(state);
    const completedQ = getCompletedQuarters(state);

    // Quarter buttons - 총 경기 기반
    const played = getTotalGamesPlayed(state);
    document.querySelectorAll('.quarter-btn').forEach(btn => {
        const q = parseInt(btn.dataset.q);
        const qStart = (q - 1) * 36;
        const qEnd = q * 36;
        btn.classList.remove('current', 'completed');
        if (played >= qEnd) btn.classList.add('completed');
        else if (played >= qStart) btn.classList.add('current');
    });

    // Sim button
    const btn = document.getElementById('btnSimulate');
    const lockMsg = document.getElementById('simLockMsg');

    // 현재 진행된 총 경기 수 계산
    const totalPlayed = getTotalGamesPlayed(state);
    const totalGames = 144;
    const remaining = totalGames - totalPlayed;

    if (remaining <= 0) {
        btn.disabled = true;
        btn.textContent = '시즌 종료';
        btn.classList.remove('pulse');
        lockMsg.style.display = 'none';
    } else {
        const canSim = canSimulateAll(state);
        const giq = totalPlayed % 36;
        const riq = 36 - giq;
        const batch = (riq > 0 && riq <= 6) ? Math.min(riq, remaining) : Math.min(5, remaining);
        btn.disabled = !canSim.valid || simRunning;
        btn.textContent = simRunning ? '시뮬레이션 중...' : `${batch}경기 진행 (${totalPlayed}/${totalGames})`;

        if (!canSim.valid) {
            btn.classList.remove('pulse');
            lockMsg.style.display = 'block';
            lockMsg.innerHTML = canSim.teamErrors.map(te =>
                `<div><strong>${te.team}:</strong> ${te.errors.join(', ')}</div>`
            ).join('');
        } else {
            if (!simRunning) btn.classList.add('pulse');
            // 학생팀 5선발 경고 표시
            const warns = canSim.teamWarnings || [];
            if (warns.length > 0) {
                lockMsg.style.display = 'block';
                lockMsg.innerHTML = warns.map(tw =>
                    `<div style="color:#f59e0b;">⚠️ <strong>${tw.team}:</strong> ${tw.warnings.join(', ')}</div>`
                ).join('');
            } else {
                lockMsg.style.display = 'none';
            }
        }
    }

    // Standings
    renderStandings();

    // Trend chart
    if (completedQ > 0) {
        const trendData = getTrendData(state, completedQ);
        createTrendChart('trendChart', trendData, completedQ);
    }
}

let standingSortKey = null;
let standingSortDir = 'desc';

function renderStandings() {
    let standings = getStandings(state);
    const tbody = document.querySelector('#standingsTable tbody');
    const thead = document.querySelector('#standingsTable thead');

    // 헤더 정렬 기능
    if (thead && !thead.dataset.sortBound) {
        thead.dataset.sortBound = '1';
        const headers = [
            {key:'rank',label:'순위'},{key:'name',label:'팀'},{key:'wins',label:'승'},{key:'losses',label:'패'},{key:'draws',label:'무'},
            {key:'rate',label:'승률'},{key:'gb',label:'GB'},{key:'pitchPower',label:'투수력'},{key:'batPower',label:'타력'}
        ];
        thead.innerHTML = '<tr>' + headers.map(h =>
            `<th data-sort="${h.key}" style="cursor:pointer;">${h.label}</th>`
        ).join('') + '</tr>';
        thead.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.dataset.sort;
                if (standingSortKey === key) standingSortDir = standingSortDir === 'asc' ? 'desc' : 'asc';
                else { standingSortKey = key; standingSortDir = 'desc'; }
                renderStandings();
            });
        });
    }

    // 정렬 적용
    if (standingSortKey) {
        standings = [...standings].sort((a, b) => {
            let va = a[standingSortKey], vb = b[standingSortKey];
            if (standingSortKey === 'name') return standingSortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
            return standingSortDir === 'asc' ? va - vb : vb - va;
        });
    }

    // 정렬 인디케이터
    if (thead) {
        thead.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === standingSortKey) th.classList.add(standingSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        });
    }

    tbody.innerHTML = standings.map((s, i) => {
        const rankClass = s.rank <= 3 ? `rank-${s.rank}` : '';
        return `<tr class="${rankClass}">
            <td>${standingSortKey ? i + 1 : s.rank}</td>
            <td><div class="team-name-cell">
                <img class="team-logo-sm" src="${teamLogo(s.code)}" alt="${s.name}">
                ${s.name}
            </div></td>
            <td>${s.wins}</td>
            <td>${s.losses}</td>
            <td>${s.draws || 0}</td>
            <td>${formatRate(s.rate)}</td>
            <td>${s.gb}</td>
            <td>${s.pitchPower.toFixed(1)}</td>
            <td>${s.batPower.toFixed(1)}</td>
        </tr>`;
    }).join('');
}

async function runSimulation() {
    // 권한 체크: 학생은 시뮬레이션 실행 불가
    if (typeof isStudent === 'function' && isStudent()) {
        if (typeof showToast === 'function') showToast('시뮬레이션은 교사만 실행할 수 있습니다.');
        return;
    }
    const totalPlayed = getTotalGamesPlayed(state);
    const remaining = 144 - totalPlayed;
    if (remaining <= 0 || simRunning) return;

    // 쿼터(36경기) 경계 처리: 쿼터 내 남은 경기가 6 이하면 한번에 마무리
    const gamesInQuarter = totalPlayed % 36;
    const remainInQuarter = 36 - gamesInQuarter;
    const batch = (remainInQuarter > 0 && remainInQuarter <= 6)
        ? Math.min(remainInQuarter, remaining)
        : Math.min(5, remaining);
    simRunning = true;
    const btn = document.getElementById('btnSimulate');
    btn.disabled = true;
    btn.classList.remove('pulse');
    btn.textContent = '시뮬레이션 중...';

    const progress = document.getElementById('simProgress');
    progress.style.display = 'flex';

    // ── Supabase 동기화: 시뮬레이션 시작 알림 ──
    try {
        if (typeof updateClassroom === 'function') {
            await updateClassroom({ is_simulating: true, current_quarter: getCurrentQuarter(state) });
        }
    } catch (e) { console.warn('교실 상태 업데이트 실패:', e); }

    await simulateBatch(state, batch, (game, total) => {
        const pct = (game / total) * 100;
        document.getElementById('simFill').style.width = pct + '%';
        document.getElementById('simText').textContent = `${game} / ${total} 경기`;
        renderStandings();
    });

    simRunning = false;
    progress.style.display = 'none';
    updateQuarterBadge();
    renderSimulator();
    const newTotal = getTotalGamesPlayed(state);
    showToast(`${batch}경기 완료! (${newTotal}/144 경기 진행)`, 'success');

    // Auto-save (로컬)
    localStorage.setItem('kbo-sim-state', JSON.stringify(state));

    // ── Supabase 동기화: 시뮬레이션 결과 전체 팀에 전파 ──
    try {
        const teamCodes = Object.keys(state.teams);
        const standings = getStandings(state);
        const quarter = getCompletedQuarters(state);
        const phaseMap = { 0: 'pre', 1: 'q1', 2: 'q2', 3: 'q3', 4: 'post' };

        // 1) 전체 팀 시즌 기록 동기화
        if (typeof saveAllGameStates === 'function') {
            const statesMap = {};
            for (const code of teamCodes) {
                const team = state.teams[code];
                statesMap[code] = {
                    season_record: team.seasonRecord,
                    players_json: team.roster.map(id => {
                        const p = state.players[id];
                        return p ? { id: p.id, name: p.name, ovr: p.ovr, position: p.position } : null;
                    }).filter(Boolean),
                };
            }
            await saveAllGameStates(statesMap);
        }

        // 2) 시뮬레이션 결과(순위표) 저장 — 학생이 바로 적용 가능하도록 상세 포함
        if (typeof saveSimResult === 'function') {
            const richStandings = standings.map(s => ({
                ...s,
                seasonRecord: state.teams[s.code]?.seasonRecord || {},
            }));
            await saveSimResult(quarter, richStandings, { totalGames: newTotal, batch });
        }

        // 3) 교실 상태 업데이트 (시뮬레이션 완료)
        if (typeof updateClassroom === 'function') {
            await updateClassroom({
                is_simulating: false,
                current_quarter: quarter,
                season_phase: phaseMap[quarter] || 'pre',
            });
        }

        // 4) 활동 로그
        if (typeof logActivity === 'function') {
            await logActivity(null, 'sim', { quarter, totalGames: newTotal, batch });
        }
    } catch (e) {
        console.warn('Supabase 동기화 실패 (로컬 저장은 완료):', e);
    }

    // 경기 일정 날짜를 마지막 진행 경기일로 자동 이동
    if (state.gameLog && state.gameLog.length > 0) {
        const lastGame = state.gameLog[state.gameLog.length - 1];
        if (lastGame.date) scheduleCurrentDate = lastGame.date;
    }

    // 시뮬 결과 기반 뉴스 생성
    generateBatchNews(state);

    // 외국인 스카우트 미션 체크 (1Q/2Q 완료 시)
    checkForeignMissionTrigger();
}

// ══════════════════════════════════════════
// ██ RECORDS (기록실)
// ══════════════════════════════════════════

// KBO 규정 기준: 규정타석 = 팀경기수 × 3.1, 규정이닝 = 팀경기수 × 1.0
function getQualificationPA(gamesPlayed) {
    const teamGames = gamesPlayed || 144;
    return Math.floor(teamGames * 3.1);
}
function getQualificationIP(gamesPlayed) {
    const teamGames = gamesPlayed || 144;
    return Math.floor(teamGames * 1.0);
}

function getAllBattersWithStats() {
    // 2025 시즌 기록: 144경기 기준 규정타석 = 446
    const qualPA = getQualificationPA(144);
    return Object.values(state.players).filter(p => p.position !== 'P' && p.realStats && (p.realStats.PA || 0) >= qualPA);
}
function getAllPitchersWithStats() {
    // 2025 시즌 기록: 144경기 기준 규정이닝 = 144
    const qualIP = getQualificationIP(144);
    return Object.values(state.players).filter(p => p.position === 'P' && p.realStats && (p.realStats.IP || 0) >= qualIP);
}

function renderRecordCard(title, players, valueFn, formatFn, moreCallback) {
    const top5 = [...players].sort((a, b) => valueFn(b) - valueFn(a)).slice(0, 5);
    return `<div class="record-card">
        <div class="record-card__title">${title}<button class="record-card__more" onclick="${moreCallback}">자세히 &gt;</button></div>
        <ul class="record-card__list">${top5.map((p, i) => `
            <li class="record-card__item">
                <span class="record-card__rank ${i < 3 ? 'rank-' + (i + 1) : ''}">${i + 1}</span>
                <img class="record-card__team-logo" src="${teamLogo(p.team)}" alt="">
                <span class="record-card__name" style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;" onclick="if(state.players['${p.id}'])showPlayerModal(state.players['${p.id}'])">${p.name}</span>
                <span class="record-card__value">${formatFn(valueFn(p))}</span>
            </li>
        `).join('')}</ul>
    </div>`;
}

function renderRecordCardAsc(title, players, valueFn, formatFn, moreCallback) {
    const top5 = [...players].sort((a, b) => valueFn(a) - valueFn(b)).slice(0, 5);
    return `<div class="record-card">
        <div class="record-card__title">${title}<button class="record-card__more" onclick="${moreCallback}">자세히 &gt;</button></div>
        <ul class="record-card__list">${top5.map((p, i) => `
            <li class="record-card__item">
                <span class="record-card__rank ${i < 3 ? 'rank-' + (i + 1) : ''}">${i + 1}</span>
                <img class="record-card__team-logo" src="${teamLogo(p.team)}" alt="">
                <span class="record-card__name" style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:2px;" onclick="if(state.players['${p.id}'])showPlayerModal(state.players['${p.id}'])">${p.name}</span>
                <span class="record-card__value">${formatFn(valueFn(p))}</span>
            </li>
        `).join('')}</ul>
    </div>`;
}

const fmt3 = v => v != null ? v.toFixed(3) : '-';
const fmt2 = v => v != null ? v.toFixed(2) : '-';
const fmt1 = v => v != null ? v.toFixed(1) : '-';
const fmtInt = v => v != null ? Math.round(v) : '-';
// 이닝 표기: 5.333... → 5.1, 5.666... → 5.2, 5.0 → 5.0 (야구식 1/3이닝)
const fmtIP = v => {
    if (v == null) return '-';
    const full = Math.floor(v);
    const frac = v - full;
    const thirds = Math.round(frac * 3);
    return thirds >= 3 ? `${full + 1}.0` : `${full}.${thirds}`;
};

// 시즌 시작 여부 확인: 1Q 첫 경기가 진행되었으면 true
function isSeasonStarted() {
    return state && getTotalGamesPlayed(state) > 0;
}

// 현재 활성 스탯 소스: 시즌 시작 전 = 'real', 시즌 시작 후 = 'sim'
function getActiveStats() {
    return isSeasonStarted() ? 'sim' : 'real';
}

// simStats가 있는 타자 목록 (KBO 규정타석 기준)
function getAllBattersWithSimStats() {
    const gamesPlayed = getTotalGamesPlayed(state);
    const qualPA = getQualificationPA(gamesPlayed);
    return Object.values(state.players).filter(p => p.position !== 'P' && p.simStats && (p.simStats.PA || 0) >= qualPA);
}

// simStats가 있는 투수 — 규정이닝 충족 (ERA/WHIP 등 비율 스탯용)
function getAllPitchersWithSimStats() {
    const gamesPlayed = getTotalGamesPlayed(state);
    const qualIP = getQualificationIP(gamesPlayed);
    return Object.values(state.players).filter(p => p.position === 'P' && p.simStats && (p.simStats.IP || 0) >= qualIP);
}
// simStats가 있는 투수 — 1경기 이상 등판 (승/S/HLD/SO 등 누적 스탯용)
function getAllPitchersWithAnySimStats() {
    return Object.values(state.players).filter(p => p.position === 'P' && p.simStats && (p.simStats.G || 0) >= 1);
}
// 2025 실제 기록 — 누적 스탯용 (1경기 이상)
function getAllPitchersWithAnyStats() {
    return Object.values(state.players).filter(p => p.position === 'P' && p.realStats && (p.realStats.G || 0) >= 1);
}

function renderBatterRecords() {
    const grid = document.getElementById('batterTop5Grid');
    const active = getActiveStats();

    if (active === 'sim') {
        const gp = getTotalGamesPlayed(state);
        const qualPA = getQualificationPA(gp);
        const batters = getAllBattersWithSimStats();
        if (!batters.length) { grid.innerHTML = `<div class="pm-no-data">규정타석(${qualPA} PA) 충족 선수가 없습니다.<br><span style="font-size:11px;color:var(--text-dim);">현재 ${gp}경기 진행 (규정타석 = ${gp} × 3.1 = ${qualPA})</span></div>`; return; }
        const sk = 'simStats';
        grid.innerHTML = [
            renderRecordCard('타율 (AVG)', batters, p => p[sk].AVG||0, fmt3, "showFullBatterRecord('AVG')"),
            renderRecordCard('홈런 (HR)', batters, p => p[sk].HR||0, fmtInt, "showFullBatterRecord('HR')"),
            renderRecordCard('타점 (RBI)', batters, p => p[sk].RBI||0, fmtInt, "showFullBatterRecord('RBI')"),
            renderRecordCard('도루 (SB)', batters, p => p[sk].SB||0, fmtInt, "showFullBatterRecord('SB')"),
            renderRecordCard('OPS', batters, p => p[sk].OPS||0, fmt3, "showFullBatterRecord('OPS')"),
            renderRecordCard('WAR', batters, p => p[sk].WAR||0, fmt2, "showFullBatterRecord('WAR')"),
            renderRecordCard('안타 (H)', batters, p => p[sk].H||0, fmtInt, "showFullBatterRecord('H')"),
            renderRecordCard('출루율 (OBP)', batters, p => p[sk].OBP||0, fmt3, "showFullBatterRecord('OBP')"),
            renderRecordCard('장타율 (SLG)', batters, p => p[sk].SLG||0, fmt3, "showFullBatterRecord('SLG')"),
            renderRecordCard('경기 (G)', batters, p => p[sk].G||0, fmtInt, "showFullBatterRecord('G')"),
        ].join('');
    } else {
        // 시즌 시작 전: 2025 데이터 표시 (참고용)
        const batters = getAllBattersWithStats();
        if (!batters.length) { grid.innerHTML = '<div class="pm-no-data">2026 시즌이 아직 시작되지 않았습니다.<br><span style="font-size:11px;color:var(--text-dim);">아래는 2025 시즌 참고 기록입니다.</span></div>'; return; }
        grid.innerHTML = '<div style="text-align:center;margin-bottom:12px;color:var(--text-dim);font-size:12px;">📋 2025 시즌 기록 (참고용) — 시뮬레이션 시작 후 2026 데이터로 전환됩니다</div>' + [
            renderRecordCard('타율 (AVG)', batters, p => p.realStats.AVG, fmt3, "showFullBatterRecord('AVG')"),
            renderRecordCard('홈런 (HR)', batters, p => p.realStats.HR, fmtInt, "showFullBatterRecord('HR')"),
            renderRecordCard('타점 (RBI)', batters, p => p.realStats.RBI, fmtInt, "showFullBatterRecord('RBI')"),
            renderRecordCard('도루 (SB)', batters, p => p.realStats.SB, fmtInt, "showFullBatterRecord('SB')"),
            renderRecordCard('OPS', batters, p => p.realStats.OPS, fmt3, "showFullBatterRecord('OPS')"),
            renderRecordCard('wRC+', batters, p => p.realStats['wRC+'], fmt1, "showFullBatterRecord('wRC+')"),
            renderRecordCard('WAR', batters, p => p.realStats.WAR, fmt2, "showFullBatterRecord('WAR')"),
            renderRecordCard('안타 (H)', batters, p => p.realStats.H, fmtInt, "showFullBatterRecord('H')"),
            renderRecordCard('출루율 (OBP)', batters, p => p.realStats.OBP, fmt3, "showFullBatterRecord('OBP')"),
            renderRecordCard('장타율 (SLG)', batters, p => p.realStats.SLG, fmt3, "showFullBatterRecord('SLG')"),
        ].join('');
    }
}

function renderPitcherRecords() {
    const grid = document.getElementById('pitcherTop5Grid');
    const active = getActiveStats();

    if (active === 'sim') {
        const gp = getTotalGamesPlayed(state);
        const qualIP = getQualificationIP(gp);
        const qualPitchers = getAllPitchersWithSimStats();  // 규정이닝 충족 (비율 스탯)
        const allPitchers = getAllPitchersWithAnySimStats(); // 1G+ 등판 (누적 스탯)
        if (!allPitchers.length) { grid.innerHTML = `<div class="pm-no-data">아직 등판 기록이 없습니다.</div>`; return; }
        const sk = 'simStats';
        const rateMsg = qualPitchers.length === 0 ? `<div style="text-align:center;margin-bottom:8px;color:var(--text-dim);font-size:11px;">규정이닝(${qualIP}IP) 충족 선수 없음 — ERA/WHIP는 규정 충족 후 표시</div>` : '';
        grid.innerHTML = rateMsg + [
            ...(qualPitchers.length > 0 ? [renderRecordCardAsc('평균자책 (ERA)', qualPitchers, p => p[sk].ERA||99, fmt2, "showFullPitcherRecord('ERA')")] : []),
            renderRecordCard('승리 (W)', allPitchers, p => p[sk].W||0, fmtInt, "showFullPitcherRecord('W')"),
            renderRecordCard('삼진 (SO)', allPitchers, p => p[sk].SO||0, fmtInt, "showFullPitcherRecord('SO')"),
            renderRecordCard('세이브 (S)', allPitchers, p => p[sk].S||0, fmtInt, "showFullPitcherRecord('S')"),
            renderRecordCard('홀드 (HLD)', allPitchers, p => p[sk].HLD||0, fmtInt, "showFullPitcherRecord('HLD')"),
            ...(qualPitchers.length > 0 ? [renderRecordCardAsc('WHIP', qualPitchers, p => p[sk].WHIP||99, fmt2, "showFullPitcherRecord('WHIP')")] : []),
            renderRecordCard('WAR', allPitchers, p => p[sk].WAR||0, fmt2, "showFullPitcherRecord('WAR')"),
            renderRecordCard('이닝 (IP)', allPitchers, p => p[sk].IP||0, fmtIP, "showFullPitcherRecord('IP')"),
            renderRecordCard('경기 (G)', allPitchers, p => p[sk].G||0, fmtInt, "showFullPitcherRecord('G')"),
        ].join('');
    } else {
        const qualPitchers = getAllPitchersWithStats(); // 규정이닝 충족
        const allPitchers = getAllPitchersWithAnyStats(); // 1G+ 등판
        if (!allPitchers.length) { grid.innerHTML = '<div class="pm-no-data">2026 시즌이 아직 시작되지 않았습니다.</div>'; return; }
        grid.innerHTML = '<div style="text-align:center;margin-bottom:12px;color:var(--text-dim);font-size:12px;">📋 2025 시즌 기록 (참고용) — 시뮬레이션 시작 후 2026 데이터로 전환됩니다</div>' + [
            ...(qualPitchers.length > 0 ? [renderRecordCardAsc('평균자책 (ERA)', qualPitchers, p => p.realStats.ERA, fmt2, "showFullPitcherRecord('ERA')")] : []),
            renderRecordCard('승리 (W)', allPitchers, p => p.realStats.W||0, fmtInt, "showFullPitcherRecord('W')"),
            renderRecordCard('삼진 (SO)', allPitchers, p => p.realStats.SO||0, fmtInt, "showFullPitcherRecord('SO')"),
            renderRecordCard('세이브 (S)', allPitchers, p => p.realStats.S||0, fmtInt, "showFullPitcherRecord('S')"),
            renderRecordCard('홀드 (HLD)', allPitchers, p => p.realStats.HLD||0, fmtInt, "showFullPitcherRecord('HLD')"),
            ...(qualPitchers.length > 0 ? [renderRecordCardAsc('WHIP', qualPitchers, p => p.realStats.WHIP, fmt2, "showFullPitcherRecord('WHIP')")] : []),
            ...(qualPitchers.length > 0 ? [renderRecordCardAsc('FIP', qualPitchers, p => p.realStats.FIP, fmt2, "showFullPitcherRecord('FIP')")] : []),
            renderRecordCard('WAR', pitchers, p => p.realStats.WAR, fmt2, "showFullPitcherRecord('WAR')"),
            renderRecordCard('이닝 (IP)', pitchers, p => p.realStats.IP, fmtIP, "showFullPitcherRecord('IP')"),
            renderRecordCard('WPA', pitchers, p => p.realStats.WPA, fmt2, "showFullPitcherRecord('WPA')"),
        ].join('');
    }
}

let batterRecordSortKey = null;
let batterRecordSortDir = 'desc';

function showFullBatterRecord(stat) {
    const batters = getActiveStats() === 'sim' ? getAllBattersWithSimStats() : getAllBattersWithStats();
    if (!batterRecordSortKey) { batterRecordSortKey = stat; batterRecordSortDir = 'desc'; }
    const sortKey = batterRecordSortKey;
    const sortDir = batterRecordSortDir;
    const statsKey = getActiveStats() === 'sim' ? 'simStats' : 'realStats';

    const sorted = [...batters].sort((a, b) => {
        const va = a[statsKey][sortKey] || 0, vb = b[statsKey][sortKey] || 0;
        return sortDir === 'asc' ? va - vb : vb - va;
    });
    const container = document.getElementById('batterFullRecords');
    const formatVal = v => typeof v === 'number' ? (v < 1 && v > -1 && stat !== 'WAR' && stat !== 'wRC+' ? v.toFixed(3) : Number.isInteger(v) ? v : v.toFixed(2)) : (v || '-');

    const headers = [
        {key:null,label:'#'},{key:null,label:'팀'},{key:null,label:'이름'},{key:null,label:'포지션'},
        {key:'G',label:'G'},{key:'PA',label:'PA'},{key:'AB',label:'AB'},
        {key:'AVG',label:'AVG'},{key:'OBP',label:'OBP'},{key:'SLG',label:'SLG'},{key:'OPS',label:'OPS'},
        {key:'H',label:'H'},{key:'2B',label:'2B'},{key:'3B',label:'3B'},{key:'HR',label:'HR'},
        {key:'RBI',label:'RBI'},{key:'R',label:'R'},{key:'SB',label:'SB'},{key:'CS',label:'CS'},
        {key:'BB',label:'BB'},{key:'SO',label:'SO'},{key:'wRC+',label:'wRC+'},{key:'WAR',label:'WAR'},
    ];

    container.innerHTML = `
        <h3 style="margin-bottom:8px;">타자 기록</h3>
        <button class="btn btn--sm" onclick="document.getElementById('batterFullRecords').style.display='none'" style="margin-bottom:12px;">닫기</button>
        <div style="overflow-x:auto;">
        <table class="player-table records-full-table" id="batterRecordTable" style="min-width:900px;">
            <thead><tr>${headers.map(h => h.key
                ? `<th data-sort="${h.key}" style="cursor:pointer;white-space:nowrap;${h.key === sortKey ? 'color:var(--accent);' : ''}">${h.label}${h.key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>`
                : `<th>${h.label}</th>`
            ).join('')}</tr></thead>
            <tbody>${sorted.map((p, i) => {
                const rs = p[statsKey];
                return `<tr><td>${i + 1}</td><td><img src="${teamLogo(p.team)}" style="width:18px;height:18px;vertical-align:middle"></td><td style="font-weight:600;cursor:pointer;text-decoration:underline dotted;white-space:nowrap;" onclick="if(state.players['${p.id}'])showPlayerModal(state.players['${p.id}'])">${p.name}</td><td>${p.position}</td><td>${rs.G||0}</td><td>${rs.PA||0}</td><td>${rs.AB||0}</td><td>${(rs.AVG||0).toFixed(3)}</td><td>${(rs.OBP||0).toFixed(3)}</td><td>${(rs.SLG||0).toFixed(3)}</td><td>${(rs.OPS||0).toFixed(3)}</td><td>${rs.H||0}</td><td>${rs['2B']||0}</td><td>${rs['3B']||0}</td><td>${rs.HR||0}</td><td>${rs.RBI||0}</td><td>${rs.R||0}</td><td>${rs.SB||0}</td><td>${rs.CS||0}</td><td>${rs.BB||0}</td><td>${rs.SO||0}</td><td>${(rs['wRC+']||0).toFixed(1)}</td><td>${(rs.WAR||0).toFixed(1)}</td></tr>`;
            }).join('')}</tbody>
        </table></div>`;

    // 정렬 이벤트
    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (batterRecordSortKey === key) batterRecordSortDir = batterRecordSortDir === 'asc' ? 'desc' : 'asc';
            else { batterRecordSortKey = key; batterRecordSortDir = ['AVG','ERA','WHIP','FIP'].includes(key) ? 'asc' : 'desc'; }
            showFullBatterRecord(stat);
        });
    });

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

let pitcherRecordSortKey = null;
let pitcherRecordSortDir = 'desc';

function showFullPitcherRecord(stat) {
    const pitchers = getActiveStats() === 'sim' ? getAllPitchersWithSimStats() : getAllPitchersWithStats();
    if (!pitcherRecordSortKey) { pitcherRecordSortKey = stat; pitcherRecordSortDir = ['ERA','WHIP','FIP'].includes(stat) ? 'asc' : 'desc'; }
    const sortKey = pitcherRecordSortKey;
    const sortDir = pitcherRecordSortDir;
    const statsKey = getActiveStats() === 'sim' ? 'simStats' : 'realStats';

    const sorted = [...pitchers].sort((a, b) => {
        const va = a[statsKey][sortKey] || 0, vb = b[statsKey][sortKey] || 0;
        return sortDir === 'asc' ? va - vb : vb - va;
    });
    const container = document.getElementById('pitcherFullRecords');

    const headers = [
        {key:null,label:'#'},{key:null,label:'팀'},{key:null,label:'이름'},{key:null,label:'역할'},
        {key:'ERA',label:'ERA'},{key:'G',label:'G'},{key:'GS',label:'GS'},
        {key:'W',label:'W'},{key:'L',label:'L'},{key:'S',label:'S'},{key:'HLD',label:'HLD'},
        {key:'IP',label:'IP'},{key:'H',label:'H'},{key:'HR',label:'HR'},
        {key:'BB',label:'BB'},{key:'HBP',label:'HBP'},{key:'SO',label:'SO'},
        {key:'ER',label:'ER'},{key:'WHIP',label:'WHIP'},{key:'FIP',label:'FIP'},
        {key:'WAR',label:'WAR'},{key:'BABIP',label:'BABIP'},
    ];

    container.innerHTML = `
        <h3 style="margin-bottom:8px;">투수 기록</h3>
        <button class="btn btn--sm" onclick="document.getElementById('pitcherFullRecords').style.display='none'" style="margin-bottom:12px;">닫기</button>
        <div style="overflow-x:auto;">
        <table class="player-table records-full-table" id="pitcherRecordTable" style="min-width:950px;">
            <thead><tr>${headers.map(h => h.key
                ? `<th data-sort="${h.key}" style="cursor:pointer;white-space:nowrap;${h.key === sortKey ? 'color:var(--accent);' : ''}">${h.label}${h.key === sortKey ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</th>`
                : `<th>${h.label}</th>`
            ).join('')}</tr></thead>
            <tbody>${sorted.map((p, i) => {
                const rs = p[statsKey];
                return `<tr><td>${i + 1}</td><td><img src="${teamLogo(p.team)}" style="width:18px;height:18px;vertical-align:middle"></td><td style="font-weight:600;cursor:pointer;text-decoration:underline dotted;white-space:nowrap;" onclick="if(state.players['${p.id}'])showPlayerModal(state.players['${p.id}'])">${p.name}</td><td>${p.role || '-'}</td><td>${(rs.ERA||0).toFixed(2)}</td><td>${rs.G||0}</td><td>${rs.GS||0}</td><td>${rs.W||0}</td><td>${rs.L||0}</td><td>${rs.S||0}</td><td>${rs.HLD||0}</td><td>${fmtIP(rs.IP||0)}</td><td>${rs.H||0}</td><td>${rs.HR||0}</td><td>${rs.BB||0}</td><td>${rs.HBP||0}</td><td>${rs.SO||0}</td><td>${rs.ER||0}</td><td>${(rs.WHIP||0).toFixed(2)}</td><td>${(rs.FIP||0).toFixed(2)}</td><td>${(rs.WAR||0).toFixed(1)}</td><td>${(rs.BABIP||0).toFixed(3)}</td></tr>`;
            }).join('')}</tbody>
        </table></div>`;

    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (pitcherRecordSortKey === key) pitcherRecordSortDir = pitcherRecordSortDir === 'asc' ? 'desc' : 'asc';
            else { pitcherRecordSortKey = key; pitcherRecordSortDir = ['ERA','WHIP','FIP'].includes(key) ? 'asc' : 'desc'; }
            showFullPitcherRecord(stat);
        });
    });

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

let teamRecordSortKey = 'avgAVG';
let teamRecordSortDir = 'desc';
let teamRecordSection = 'bat'; // 'bat' or 'pit'

function renderTeamRecords() {
    const standings = getStandings(state);
    const container = document.getElementById('teamRecordsContent');
    const active = getActiveStats();
    const sk = active === 'sim' ? 'simStats' : 'realStats';
    const yearLabel = active === 'sim' ? '2026' : '2025';

    const teamStats = standings.map(s => {
        const batters = Object.values(state.players).filter(p => p.team === s.code && p.position !== 'P' && p[sk]);
        const pitchers = Object.values(state.players).filter(p => p.team === s.code && p.position === 'P' && p[sk]);
        const avgAVG = batters.length ? batters.reduce((sum, b) => sum + (b[sk].AVG || 0), 0) / batters.length : 0;
        const totalH = batters.reduce((sum, b) => sum + (b[sk].H || 0), 0);
        const totalHR = batters.reduce((sum, b) => sum + (b[sk].HR || 0), 0);
        const totalRBI = batters.reduce((sum, b) => sum + (b[sk].RBI || 0), 0);
        const totalR = batters.reduce((sum, b) => sum + (b[sk].R || 0), 0);
        const totalSB = batters.reduce((sum, b) => sum + (b[sk].SB || 0), 0);
        const totalBB = batters.reduce((sum, b) => sum + (b[sk].BB || 0), 0);
        const totalSO_bat = batters.reduce((sum, b) => sum + (b[sk].SO || 0), 0);
        const avgOBP = batters.length ? batters.reduce((sum, b) => sum + (b[sk].OBP || 0), 0) / batters.length : 0;
        const avgSLG = batters.length ? batters.reduce((sum, b) => sum + (b[sk].SLG || 0), 0) / batters.length : 0;
        const avgOPS = batters.length ? batters.reduce((sum, b) => sum + (b[sk].OPS || 0), 0) / batters.length : 0;
        const qualPitchers = pitchers.filter(p => (p[sk].IP || 0) > 0);
        const avgERA = qualPitchers.length ? qualPitchers.reduce((sum, p) => sum + (p[sk].ERA || 0), 0) / qualPitchers.length : 0;
        const avgWHIP = qualPitchers.length ? qualPitchers.reduce((sum, p) => sum + (p[sk].WHIP || 0), 0) / qualPitchers.length : 0;
        const totalSO = pitchers.reduce((sum, p) => sum + (p[sk].SO || 0), 0);
        const totalW = s.wins, totalL = s.losses, totalD = s.draws || 0;
        return { ...s, avgAVG, totalH, totalHR, totalRBI, totalR, totalSB, totalBB, totalSO_bat, avgOBP, avgSLG, avgOPS, avgERA, avgWHIP, totalSO, totalW, totalL, totalD };
    });

    if (active === 'sim' && teamStats.every(t => t.avgAVG === 0)) {
        container.innerHTML = '<div class="pm-no-data">아직 시뮬레이션이 진행되지 않았습니다.</div>';
        return;
    }

    function sortTH(key, label, isAsc) {
        var active = teamRecordSortKey === key;
        var arrow = active ? (teamRecordSortDir === 'asc' ? ' ▲' : ' ▼') : '';
        return '<th data-tsort="' + key + '" style="cursor:pointer;white-space:nowrap;' + (active ? 'color:var(--accent);' : '') + '">' + label + arrow + '</th>';
    }

    var sorted = [...teamStats].sort(function(a, b) {
        var va = a[teamRecordSortKey] || 0, vb = b[teamRecordSortKey] || 0;
        return teamRecordSortDir === 'asc' ? va - vb : vb - va;
    });

    container.innerHTML =
        '<div style="text-align:center;margin-bottom:12px;color:var(--text-dim);font-size:12px;">' + yearLabel + ' 시즌 팀 기록</div>' +
        '<h3 style="margin-bottom:12px;">팀 공격 기록</h3>' +
        '<div style="overflow-x:auto;"><table class="player-table" style="min-width:700px;"><thead><tr>' +
        '<th>#</th><th>팀</th>' + sortTH('avgAVG','타율') + sortTH('avgOBP','출루') + sortTH('avgSLG','장타') + sortTH('avgOPS','OPS') +
        sortTH('totalH','안타') + sortTH('totalHR','홈런') + sortTH('totalRBI','타점') + sortTH('totalR','득점') +
        sortTH('totalSB','도루') + sortTH('totalBB','볼넷') + sortTH('totalSO_bat','삼진') + sortTH('rs','득점(팀)') +
        '</tr></thead><tbody>' +
        sorted.map(function(s, i) {
            return '<tr><td>' + (i+1) + '</td><td><div class="team-name-cell"><img class="team-logo-sm" src="' + teamLogo(s.code) + '">' + s.name + '</div></td>' +
                '<td>' + s.avgAVG.toFixed(3) + '</td><td>' + s.avgOBP.toFixed(3) + '</td><td>' + s.avgSLG.toFixed(3) + '</td><td>' + s.avgOPS.toFixed(3) + '</td>' +
                '<td>' + s.totalH + '</td><td>' + s.totalHR + '</td><td>' + s.totalRBI + '</td><td>' + s.totalR + '</td>' +
                '<td>' + s.totalSB + '</td><td>' + s.totalBB + '</td><td>' + s.totalSO_bat + '</td><td>' + (s.rs||0) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>' +
        '<h3 style="margin:20px 0 12px;">팀 투수 기록</h3>' +
        '<div style="overflow-x:auto;"><table class="player-table" style="min-width:600px;"><thead><tr>' +
        '<th>#</th><th>팀</th>' + sortTH('avgERA','ERA') + sortTH('avgWHIP','WHIP') + sortTH('totalSO','삼진') +
        sortTH('ra','실점') + sortTH('totalW','승') + sortTH('totalL','패') + sortTH('totalD','무') + sortTH('rate','승률') +
        '</tr></thead><tbody>' +
        sorted.map(function(s, i) {
            return '<tr><td>' + (i+1) + '</td><td><div class="team-name-cell"><img class="team-logo-sm" src="' + teamLogo(s.code) + '">' + s.name + '</div></td>' +
                '<td>' + s.avgERA.toFixed(2) + '</td><td>' + s.avgWHIP.toFixed(2) + '</td><td>' + s.totalSO + '</td>' +
                '<td>' + (s.ra||0) + '</td><td>' + s.totalW + '</td><td>' + s.totalL + '</td><td>' + s.totalD + '</td><td>' + formatRate(s.rate) + '</td></tr>';
        }).join('') +
        '</tbody></table></div>';

    // 정렬 이벤트
    container.querySelectorAll('th[data-tsort]').forEach(function(th) {
        th.addEventListener('click', function() {
            var key = th.dataset.tsort;
            if (teamRecordSortKey === key) teamRecordSortDir = teamRecordSortDir === 'asc' ? 'desc' : 'asc';
            else { teamRecordSortKey = key; teamRecordSortDir = ['avgERA','avgWHIP'].includes(key) ? 'asc' : 'desc'; }
            renderTeamRecords();
        });
    });
}

// ══════════════════════════════════════════
// ██ POSTSEASON VIEW
// ══════════════════════════════════════════

let postseasonState = { po1: null, po2: null, ks: null };

function setupPostseasonView() {
    document.getElementById('btnPO1').addEventListener('click', () => runPO(1));
    document.getElementById('btnPO2').addEventListener('click', () => runPO(2));
    document.getElementById('btnKS').addEventListener('click', runKS);
    document.getElementById('psGameClose').addEventListener('click', closePSGameModal);
}

function renderPostseason() {
    const completedQ = getCompletedQuarters(state);
    const lockEl = document.getElementById('postseasonLock');
    const contentEl = document.getElementById('postseasonContent');

    if (completedQ < 4) {
        lockEl.style.display = 'block';
        contentEl.style.display = 'none';
        lockEl.innerHTML = `<p>정규시즌이 완료된 후 포스트시즌이 활성화됩니다. (현재: ${completedQ}Q / 4Q)</p>`;
        return;
    }

    lockEl.style.display = 'none';
    contentEl.style.display = 'block';

    const seeds = getPostseasonTeams(state);

    // PO1: 1위 vs 4위
    document.getElementById('po1TeamA').innerHTML = `<img class="team-logo-sm" src="${teamLogo(seeds.seed1.code)}"> 1위 ${seeds.seed1.name}`;
    document.getElementById('po1TeamB').innerHTML = `<img class="team-logo-sm" src="${teamLogo(seeds.seed4.code)}"> 4위 ${seeds.seed4.name}`;

    // PO2: 2위 vs 3위
    document.getElementById('po2TeamA').innerHTML = `<img class="team-logo-sm" src="${teamLogo(seeds.seed2.code)}"> 2위 ${seeds.seed2.name}`;
    document.getElementById('po2TeamB').innerHTML = `<img class="team-logo-sm" src="${teamLogo(seeds.seed3.code)}"> 3위 ${seeds.seed3.name}`;

    // Update button states
    if (postseasonState.po1) {
        document.getElementById('btnPO1').disabled = true;
        document.getElementById('btnPO1').textContent = '완료';
    }
    if (postseasonState.po2) {
        document.getElementById('btnPO2').disabled = true;
        document.getElementById('btnPO2').textContent = '완료';
    }

    // KS
    if (postseasonState.po1 && postseasonState.po2) {
        const ksBtn = document.getElementById('btnKS');
        if (!postseasonState.ks) {
            ksBtn.disabled = false;
            document.getElementById('ksTeamA').textContent = state.teams[postseasonState.po1.winner].name;
            document.getElementById('ksTeamB').textContent = state.teams[postseasonState.po2.winner].name;
        } else {
            ksBtn.disabled = true;
            ksBtn.textContent = '완료';
        }
    }
}

// ── 포스트시즌 시리즈 상태 관리 ──
let psSeriesState = null; // { seriesKey, teamA, teamB, targetWins, winsA, winsB, games, matchLabel }

function openPSGameModal() { document.getElementById('psGameModal').style.display = 'flex'; }
function closePSGameModal() { document.getElementById('psGameModal').style.display = 'none'; }

async function runPO(matchNum) {
    const seeds = getPostseasonTeams(state);
    let teamA, teamB, matchLabel;
    if (matchNum === 1) { teamA = seeds.seed1.code; teamB = seeds.seed4.code; matchLabel = 'PO1 (1위 vs 4위)'; }
    else { teamA = seeds.seed2.code; teamB = seeds.seed3.code; matchLabel = 'PO2 (2위 vs 3위)'; }

    psSeriesState = { seriesKey: `po${matchNum}`, teamA, teamB, targetWins: 2, winsA: 0, winsB: 0, games: [], matchLabel, matchNum };
    showPSLineupScreen();
}

async function runKS() {
    const teamA = postseasonState.po1.winner;
    const teamB = postseasonState.po2.winner;
    psSeriesState = { seriesKey: 'ks', teamA, teamB, targetWins: 3, winsA: 0, winsB: 0, games: [], matchLabel: '한국시리즈', matchNum: 0 };
    showPSLineupScreen();
}

/** 라인업 제출 화면 표시 */
function showPSLineupScreen() {
    const ss = psSeriesState;
    const gameNum = ss.games.length + 1;
    const nameA = state.teams[ss.teamA].name;
    const nameB = state.teams[ss.teamB].name;

    ensureDepthChart(ss.teamA);
    ensureDepthChart(ss.teamB);
    const dcA = state.teams[ss.teamA].depthChart;
    const dcB = state.teams[ss.teamB].depthChart;

    // 현재 라인업/선발
    const lineupA = (dcA.lineup.vsRHP || []).filter(Boolean);
    const lineupB = (dcB.lineup.vsRHP || []).filter(Boolean);
    const rotA = dcA.rotation.filter(Boolean);
    const rotB = dcB.rotation.filter(Boolean);
    const spA = rotA[(gameNum - 1) % (rotA.length || 1)] || getAcePitcher(state, ss.teamA)?.id;
    const spB = rotB[(gameNum - 1) % (rotB.length || 1)] || getAcePitcher(state, ss.teamB)?.id;
    const spAname = state.players[spA]?.name || '미정';
    const spBname = state.players[spB]?.name || '미정';

    document.getElementById('psGameTitle').textContent = `${ss.matchLabel} — ${gameNum}차전 라인업`;

    function renderLineupList(lineup, teamCode) {
        return lineup.map((pid, i) => {
            const p = state.players[pid];
            if (!p) return `<tr><td>${i + 1}</td><td>-</td><td>-</td></tr>`;
            return `<tr><td>${i + 1}</td><td>${p.position}</td><td style="cursor:pointer;text-decoration:underline dotted;" onclick="if(state.players['${pid}'])showPlayerModal(state.players['${pid}'])">${p.name}</td><td>${p.ovr}</td></tr>`;
        }).join('');
    }

    document.getElementById('psGameBody').innerHTML = `
        <div style="text-align:center;margin:8px 0;font-size:14px;color:var(--text-dim);">
            시리즈 ${nameA} ${ss.winsA} - ${ss.winsB} ${nameB}
        </div>
        <div style="text-align:center;margin:8px 0;">
            <button class="btn btn--sm" onclick="closePSGameModal();document.getElementById('dcTeamSelect').value='${ss.teamA}';dcTeam='${ss.teamA}';showView('depthchart');">
                📋 ${nameA} 뎁스차트 편집
            </button>
            <button class="btn btn--sm" onclick="closePSGameModal();document.getElementById('dcTeamSelect').value='${ss.teamB}';dcTeam='${ss.teamB}';showView('depthchart');">
                📋 ${nameB} 뎁스차트 편집
            </button>
            <div style="font-size:11px;color:var(--text-dim);margin-top:4px;">뎁스차트에서 라인업을 수정한 후 포스트시즌 탭으로 돌아오세요</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div>
                <h4 style="margin-bottom:8px;">${nameA} (홈)</h4>
                <div style="margin-bottom:8px;"><strong>선발:</strong> <span style="cursor:pointer;text-decoration:underline dotted;" onclick="if(state.players['${spA}'])showPlayerModal(state.players['${spA}'])">${spAname}</span></div>
                <table class="player-table" style="font-size:12px;">
                    <thead><tr><th>#</th><th>포지션</th><th>선수</th><th>OVR</th></tr></thead>
                    <tbody>${renderLineupList(lineupA, ss.teamA)}</tbody>
                </table>
            </div>
            <div>
                <h4 style="margin-bottom:8px;">${nameB} (원정)</h4>
                <div style="margin-bottom:8px;"><strong>선발:</strong> <span style="cursor:pointer;text-decoration:underline dotted;" onclick="if(state.players['${spB}'])showPlayerModal(state.players['${spB}'])">${spBname}</span></div>
                <table class="player-table" style="font-size:12px;">
                    <thead><tr><th>#</th><th>포지션</th><th>선수</th><th>OVR</th></tr></thead>
                    <tbody>${renderLineupList(lineupB, ss.teamB)}</tbody>
                </table>
            </div>
        </div>
        <div style="text-align:center;margin-top:16px;">
            <button class="btn btn--accent" id="btnPSStartGame" style="font-size:16px;padding:12px 40px;">
                ⚾ ${gameNum}차전 경기 시작
            </button>
        </div>
    `;

    document.getElementById('btnPSStartGame').addEventListener('click', () => {
        runPSGame(lineupA, lineupB, spA, spB);
    });

    openPSGameModal();
}

/** 경기 진행 (타석 단위 실시간 중계 — 전체 화면) */
async function runPSGame(lineupA, lineupB, spA, spB) {
    const ss = psSeriesState;
    const gameNum = ss.games.length + 1;
    const nameA = state.teams[ss.teamA].name;
    const nameB = state.teams[ss.teamB].name;

    // 모달 전체화면
    const modalContent = document.querySelector('#psGameModal .modal-content');
    modalContent.style.maxWidth = '100%';
    modalContent.style.width = '100%';
    modalContent.style.height = '100vh';
    modalContent.style.maxHeight = '100vh';
    modalContent.style.borderRadius = '0';

    document.getElementById('psGameTitle').textContent = `${ss.matchLabel} — ${gameNum}차전`;

    const game = simulateGame(state, ss.teamA, ss.teamB, lineupA, lineupB, spA, spB);
    game.homeLineup = lineupA;
    game.awayLineup = lineupB;
    ss.games.push(game);
    if (game.winner === ss.teamA) ss.winsA++;
    else if (game.winner === ss.teamB) ss.winsB++;

    // 라인업 행 (야구공 표시용 id 부여)
    function makeLineupRow(pid, idx, side) {
        var p = state.players[pid]; if (!p) return '';
        return '<tr id="ps_' + side + '_' + idx + '">' +
            '<td style="width:20px;" id="ps_ball_' + side + '_' + idx + '"></td>' +
            '<td>' + (idx+1) + '</td>' +
            '<td style="font-size:11px;color:var(--text-dim);">' + p.position + '</td>' +
            '<td style="cursor:pointer;text-decoration:underline dotted;font-weight:600;" onclick="if(state.players[\'' + pid + '\'])showPlayerModal(state.players[\'' + pid + '\'])">' + p.name + '</td>' +
            '<td id="ps_abs_' + side + '_' + idx + '">0-0</td>' +
            '<td id="ps_rbi_' + side + '_' + idx + '">0</td>' +
            '</tr>';
    }

    const body = document.getElementById('psGameBody');
    body.innerHTML =
        '<div style="text-align:center;margin:4px 0;font-size:14px;font-weight:700;">' + nameA + ' vs ' + nameB + ' — ' + gameNum + '차전</div>' +
        '<div id="psLiveScoreboard" style="margin:8px 0;"></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:8px;height:calc(100vh - 200px);">' +
            '<div style="overflow-y:auto;">' +
                '<h4 style="font-size:12px;text-align:center;margin:4px 0;">' + nameA + '</h4>' +
                '<table class="player-table" style="font-size:11px;"><thead><tr><th></th><th>#</th><th>포지션</th><th>선수</th><th>타수</th><th>타점</th></tr></thead>' +
                '<tbody>' + lineupA.map(function(pid, i) { return makeLineupRow(pid, i, 'A'); }).join('') + '</tbody></table>' +
            '</div>' +
            '<div id="psLivePBP" style="overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;font-size:12px;background:var(--bg-darker);"></div>' +
            '<div style="overflow-y:auto;">' +
                '<h4 style="font-size:12px;text-align:center;margin:4px 0;">' + nameB + '</h4>' +
                '<table class="player-table" style="font-size:11px;"><thead><tr><th></th><th>#</th><th>포지션</th><th>선수</th><th>타수</th><th>타점</th></tr></thead>' +
                '<tbody>' + lineupB.map(function(pid, i) { return makeLineupRow(pid, i, 'B'); }).join('') + '</tbody></table>' +
            '</div>' +
        '</div>' +
        '<div id="psGameFooter" style="text-align:center;margin-top:8px;"></div>';

    var scoreboardEl = document.getElementById('psLiveScoreboard');
    var pbpEl = document.getElementById('psLivePBP');
    var batIdxA = {}, batIdxB = {}; // 타자별 누적 타수/안타/타점

    // 타석별 순차 표시
    for (var i = 0; i < game.innings.length; i++) {
        var inn = game.innings[i];

        // 스코어보드 업데이트
        var partial = game.innings.slice(0, i + 1);
        var pAway = partial.reduce(function(s, x) { return s + x.away; }, 0);
        var pHome = partial.reduce(function(s, x) { return s + x.home; }, 0);
        var innH = partial.map(function(x) { return '<th>' + x.inning + '</th>'; }).join('');
        var awayS = partial.map(function(x) { return '<td>' + x.away + '</td>'; }).join('');
        var homeS = partial.map(function(x) { return '<td>' + x.home + '</td>'; }).join('');
        scoreboardEl.innerHTML = '<table class="boxscore__scoreboard" style="margin:0 auto;max-width:600px;"><thead><tr><th>팀</th>' + innH + '<th>R</th></tr></thead><tbody>' +
            '<tr><td><strong>' + nameB + '</strong></td>' + awayS + '<td><strong>' + pAway + '</strong></td></tr>' +
            '<tr><td><strong>' + nameA + '</strong></td>' + homeS + '<td><strong>' + pHome + '</strong></td></tr></tbody></table>';

        // 이닝 헤더
        pbpEl.innerHTML += '<div style="border-bottom:2px solid var(--accent);padding:4px 0;margin:8px 0 4px;font-weight:700;color:var(--accent);">' + inn.inning + '회</div>';

        // 초 (원정 공격) — 타석별 표시
        pbpEl.innerHTML += '<div style="font-size:10px;color:var(--text-dim);margin:2px 0;">' + nameB + ' 공격</div>';
        for (var j = 0; j < inn.awayPlays.length; j++) {
            var play = inn.awayPlays[j];
            // 현재 타자 야구공 표시
            clearBalls();
            var batLineupIdx = lineupB.indexOf(play.batterId) >= 0 ? lineupB.indexOf(play.batterId) : (j % lineupB.length);
            var ballEl = document.getElementById('ps_ball_B_' + batLineupIdx);
            if (ballEl) ballEl.textContent = '⚾';

            // 중계 텍스트
            var cls = play.result.indexOf('홈런') >= 0 ? 'color:#f59e0b;font-weight:700;' : play.result.indexOf('안타') >= 0 || play.result.indexOf('루타') >= 0 ? 'color:#34d399;' : play.result.indexOf('삼진') >= 0 ? 'color:#ef4444;' : '';
            pbpEl.innerHTML += '<div style="padding:2px 0;"><span style="font-weight:600;">' + play.batter + '</span> <span style="' + cls + '">' + play.result + '</span>' + (play.rbi > 0 ? ' <span style="color:var(--accent);font-weight:700;">' + play.rbi + '타점</span>' : '') + '</div>';
            pbpEl.scrollTop = pbpEl.scrollHeight;

            // 타자 성적 업데이트
            updateBatterDisplay(play, 'B', lineupB);

            await delay(1000);
        }

        // 말 (홈 공격) — 타석별 표시
        if (inn.homePlays && inn.homePlays.length > 0) {
            pbpEl.innerHTML += '<div style="font-size:10px;color:var(--text-dim);margin:2px 0;">' + nameA + ' 공격</div>';
            for (var k = 0; k < inn.homePlays.length; k++) {
                var play2 = inn.homePlays[k];
                clearBalls();
                var batLineupIdx2 = lineupA.indexOf(play2.batterId) >= 0 ? lineupA.indexOf(play2.batterId) : (k % lineupA.length);
                var ballEl2 = document.getElementById('ps_ball_A_' + batLineupIdx2);
                if (ballEl2) ballEl2.textContent = '⚾';

                var cls2 = play2.result.indexOf('홈런') >= 0 ? 'color:#f59e0b;font-weight:700;' : play2.result.indexOf('안타') >= 0 || play2.result.indexOf('루타') >= 0 ? 'color:#34d399;' : play2.result.indexOf('삼진') >= 0 ? 'color:#ef4444;' : '';
                pbpEl.innerHTML += '<div style="padding:2px 0;"><span style="font-weight:600;">' + play2.batter + '</span> <span style="' + cls2 + '">' + play2.result + '</span>' + (play2.rbi > 0 ? ' <span style="color:var(--accent);font-weight:700;">' + play2.rbi + '타점</span>' : '') + '</div>';
                pbpEl.scrollTop = pbpEl.scrollHeight;

                updateBatterDisplay(play2, 'A', lineupA);

                await delay(1000);
            }
        }
        clearBalls();
    }

    function clearBalls() {
        document.querySelectorAll('[id^="ps_ball_"]').forEach(function(el) { el.textContent = ''; });
    }

    function updateBatterDisplay(play, side, lineup) {
        var idx = lineup.indexOf(play.batterId);
        if (idx < 0) return;
        var gs = game.playerGameStats[play.batterId] || {};
        var absEl = document.getElementById('ps_abs_' + side + '_' + idx);
        var rbiEl = document.getElementById('ps_rbi_' + side + '_' + idx);
        if (absEl) absEl.textContent = (gs.AB||0) + '-' + (gs.H||0);
        if (rbiEl) rbiEl.textContent = (gs.RBI||0);
    }

    // 모달 크기 복원 함수
    function restoreModalSize() {
        modalContent.style.maxWidth = '960px';
        modalContent.style.width = '95%';
        modalContent.style.height = '';
        modalContent.style.maxHeight = '90vh';
        modalContent.style.borderRadius = '12px';
    }

    // 경기 결과
    var winnerName = game.winner ? state.teams[game.winner].name : '무승부';
    var seriesDone = ss.winsA >= ss.targetWins || ss.winsB >= ss.targetWins;
    var footerHTML = '<div style="font-size:18px;font-weight:700;margin:8px 0;">' + winnerName + ' 승리! (' + game.homeScore + ' : ' + game.awayScore + ')</div>';
    footerHTML += '<div style="margin:4px 0;">시리즈 ' + nameA + ' ' + ss.winsA + ' - ' + ss.winsB + ' ' + nameB + '</div>';

    if (seriesDone) {
        var sw = ss.winsA >= ss.targetWins ? ss.teamA : ss.teamB;
        footerHTML += '<div style="font-size:20px;font-weight:700;color:var(--accent);margin:8px 0;">' + state.teams[sw].name + ' 시리즈 승리!</div>';
        footerHTML += '<button class="btn btn--accent" id="btnPSFinish">확인</button>';
    } else {
        footerHTML += '<button class="btn btn--accent" id="btnPSNext" style="padding:10px 30px;">다음 ' + (ss.games.length + 1) + '차전 라인업 제출</button>';
    }
    document.getElementById('psGameFooter').innerHTML = footerHTML;

    if (seriesDone) {
        document.getElementById('btnPSFinish').addEventListener('click', function() { restoreModalSize(); finishPSSeries(); });
    } else {
        document.getElementById('btnPSNext').addEventListener('click', function() { restoreModalSize(); showPSLineupScreen(); });
    }
}

/** 시리즈 종료 처리 */
function finishPSSeries() {
    closePSGameModal();
    const ss = psSeriesState;
    const winner = ss.winsA >= ss.targetWins ? ss.teamA : ss.teamB;
    const loser = winner === ss.teamA ? ss.teamB : ss.teamA;
    const result = { winner, loser, winsA: ss.winsA, winsB: ss.winsB, games: ss.games };

    // 시리즈 요약 카드
    const summaryDiv = document.getElementById('postseasonSeriesSummary');
    summaryDiv.innerHTML += `
        <div style="margin:8px 0;padding:12px;background:var(--bg-card);border-radius:8px;border:1px solid var(--border);">
            <strong>${ss.matchLabel}</strong> — ${state.teams[winner].name} 승리 (${ss.winsA}-${ss.winsB})
            ${ss.games.map((g, i) => `<div style="font-size:12px;color:var(--text-dim);">${i + 1}차전: ${state.teams[g.homeCode].name} ${g.homeScore} - ${g.awayScore} ${state.teams[g.awayCode].name}</div>`).join('')}
        </div>`;

    if (ss.seriesKey === 'po1' || ss.seriesKey === 'po2') {
        // PO 결과 저장
        const resultEl = document.getElementById(`${ss.seriesKey.replace('po', 'po')}Result`);
        const btn = document.getElementById(`btn${ss.seriesKey.toUpperCase()}`);
        if (ss.seriesKey === 'po1') postseasonState.po1 = result;
        else postseasonState.po2 = result;

        document.getElementById(`po${ss.matchNum}Result`).innerHTML = `<strong>${state.teams[winner].name} 승리!</strong> (${ss.winsA}-${ss.winsB})`;
        document.getElementById(`btnPO${ss.matchNum}`).textContent = '완료';
        document.getElementById(`btnPO${ss.matchNum}`).disabled = true;

        applyFatigue(state, winner);

        if (postseasonState.po1 && postseasonState.po2) {
            document.getElementById('btnKS').disabled = false;
            document.getElementById('ksTeamA').innerHTML = `<img class="team-logo-sm" src="${teamLogo(postseasonState.po1.winner)}"> ${state.teams[postseasonState.po1.winner].name}`;
            document.getElementById('ksTeamB').innerHTML = `<img class="team-logo-sm" src="${teamLogo(postseasonState.po2.winner)}"> ${state.teams[postseasonState.po2.winner].name}`;
        }
        showToast(`${ss.matchLabel}: ${state.teams[winner].name} 승리!`, 'success');
    } else {
        // 한국시리즈 결과
        postseasonState.ks = result;
        document.getElementById('ksResult').innerHTML = `<strong>${state.teams[winner].name} 우승!</strong> (${ss.winsA}-${ss.winsB})`;
        document.getElementById('btnKS').textContent = '완료';
        document.getElementById('btnKS').disabled = true;

        // Remove fatigue
        removeFatigue(state, winner);
        removeFatigue(state, loser);

        // Champion!
        state.champion = winner;
        const championEl = document.getElementById('champion');
        championEl.style.display = 'block';
        document.getElementById('championName').textContent = `🏆 ${state.teams[winner].name}`;
        createConfetti();

        // 시즌 완료 저장
        localStorage.setItem('kbo-sim-state', JSON.stringify(state));

        // Awards
        const awardsEl = document.getElementById('postseasonAwards');
        awardsEl.style.display = 'block';
        const awards = computeAwards(state);
        awards.unshift({ icon: '🥇', title: '올해의 단장상', team: state.teams[winner].name, desc: '한국시리즈 우승' });

        document.getElementById('awardsContent').innerHTML = awards.map(a =>
            `<div class="award-item">
                <span class="award-item__icon">${a.icon}</span>
                <span class="award-item__title">${a.title}</span>
                <span class="award-item__team">${a.team}</span>
                <span style="color:#8899aa; font-size:12px;">${a.desc}</span>
            </div>`
        ).join('');

        showToast(`🏆 ${state.teams[winner].name} 한국시리즈 우승!`, 'success');

        localStorage.setItem('kbo-sim-state', JSON.stringify(state));
    }
}

// ══════════════════════════════════════════
// ██ SCOUT VIEW
// ══════════════════════════════════════════

let scoutInitialized = false;
let scoutMode = 'pitcher'; // 'pitcher' or 'batter'
let scoutSortKey = 'ovr';
let scoutSortDir = -1; // -1 = desc
let scoutResults = [];

function setupScoutView() {
    // 팀 셀렉트 채우기
    document.querySelectorAll('.scout-filters select.scout-f[data-f="team"]').forEach(sel => {
        if (sel.options.length <= 1) {
            for (const code of Object.keys(state.teams)) {
                const opt = document.createElement('option');
                opt.value = code; opt.textContent = state.teams[code].name;
                sel.appendChild(opt);
            }
        }
    });

    if (!scoutInitialized) {
        scoutInitialized = true;

        // 모드 탭 전환
        document.querySelectorAll('.scout-mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                scoutMode = tab.dataset.scoutMode;
                document.querySelectorAll('.scout-mode-tab').forEach(t => t.classList.toggle('active', t === tab));
                document.getElementById('scoutPitcherFilters').style.display = scoutMode === 'pitcher' ? '' : 'none';
                document.getElementById('scoutBatterFilters').style.display = scoutMode === 'batter' ? '' : 'none';
                scoutSortKey = 'ovr'; scoutSortDir = -1;
                runScoutSearch();
            });
        });

        document.getElementById('btnScoutSearchP').addEventListener('click', runScoutSearch);
        document.getElementById('btnScoutSearchB').addEventListener('click', runScoutSearch);
        document.getElementById('btnScoutResetP').addEventListener('click', () => resetScoutPanel('scoutPitcherFilters'));
        document.getElementById('btnScoutResetB').addEventListener('click', () => resetScoutPanel('scoutBatterFilters'));

        // Enter 키
        document.querySelectorAll('.scout-filters').forEach(el => {
            el.addEventListener('keydown', e => { if (e.key === 'Enter') runScoutSearch(); });
        });
    }

    runScoutSearch();
}

function resetScoutPanel(panelId) {
    const panel = document.getElementById(panelId);
    panel.querySelectorAll('input.scout-f').forEach(i => { i.value = ''; if (i.type === 'checkbox') i.checked = false; });
    panel.querySelectorAll('select.scout-f').forEach(s => s.value = '');
    runScoutSearch();
}

function getScoutFilters() {
    const panelId = scoutMode === 'pitcher' ? 'scoutPitcherFilters' : 'scoutBatterFilters';
    const panel = document.getElementById(panelId);
    const f = {};
    panel.querySelectorAll('.scout-f').forEach(el => {
        const key = el.dataset.f;
        if (el.type === 'checkbox') {
            if (el.checked) { if (!f[key]) f[key] = []; f[key].push(el.value); }
        } else {
            const v = el.value.trim();
            if (v !== '') f[key] = v;
        }
    });
    return f;
}

function runScoutSearch() {
    const f = getScoutFilters();
    const results = [];

    for (const [id, p] of Object.entries(state.players)) {
        const isPitcher = p.position === 'P';
        if (scoutMode === 'pitcher' && !isPitcher) continue;
        if (scoutMode === 'batter' && isPitcher) continue;

        if (f.name && !p.name.includes(f.name)) continue;
        if (f.team && p.team !== f.team) continue;

        const tb = p.throwBat || '';
        if (f.throw && !tb.includes(f.throw)) continue;
        if (f.bat && !tb.includes(f.bat)) continue;

        const ageMin = parseFloat(f.ageMin); if (!isNaN(ageMin) && (p.age == null || p.age < ageMin)) continue;
        const ageMax = parseFloat(f.ageMax); if (!isNaN(ageMax) && (p.age == null || p.age > ageMax)) continue;
        const salMin = parseFloat(f.salMin); if (!isNaN(salMin) && (p.salary == null || p.salary < salMin)) continue;
        const salMax = parseFloat(f.salMax); if (!isNaN(salMax) && (p.salary == null || p.salary > salMax)) continue;

        const r = p.ratings || {};
        const ovr = p.ovr || p.powerScore || 0;

        // OVR 범위
        const ovrMin = parseFloat(f.ovrMin); if (!isNaN(ovrMin) && ovr < ovrMin) continue;
        const ovrMax = parseFloat(f.ovrMax); if (!isNaN(ovrMax) && ovr > ovrMax) continue;

        if (scoutMode === 'pitcher') {
            // 역할 멀티
            if (f.role && f.role.length > 0 && !f.role.includes(p.role)) continue;
            // 레이팅 범위
            const checks = ['stuff','command','stamina','effectiveness','consistency'];
            let skip = false;
            for (const c of checks) {
                const mn = parseFloat(f[c + 'Min']); if (!isNaN(mn) && (r[c] || 0) < mn) { skip = true; break; }
                const mx = parseFloat(f[c + 'Max']); if (!isNaN(mx) && (r[c] || 0) > mx) { skip = true; break; }
            }
            if (skip) continue;
            // 구속
            const _pitches = (p.realStats && p.realStats.pitches) ? p.realStats.pitches : p.pitches;
            if (_pitches) {
                const pitches = _pitches;
                const veloMin = parseFloat(f.veloMin); const veloMax = parseFloat(f.veloMax);
                if (!isNaN(veloMin) || !isNaN(veloMax)) {
                    const fb = pitches.find(pt => pt.name === '포심' || pt.name === '투심');
                    const v = fb ? fb.velo : 0;
                    if (!isNaN(veloMin) && v < veloMin) continue;
                    if (!isNaN(veloMax) && v > veloMax) continue;
                }
                if (f.pitchType && !pitches.some(pt => pt.name === f.pitchType)) continue;
            } else if (f.pitchType || !isNaN(parseFloat(f.veloMin)) || !isNaN(parseFloat(f.veloMax))) {
                continue; // 구종 데이터 없으면 구속/구종 필터 시 제외
            }
        } else {
            // 포지션 멀티
            if (f.pos && f.pos.length > 0 && !f.pos.includes(p.position)) continue;
            const checks = ['contact','power','eye','speed','defense'];
            let skip = false;
            for (const c of checks) {
                const mn = parseFloat(f[c + 'Min']); if (!isNaN(mn) && (r[c] || 0) < mn) { skip = true; break; }
                const mx = parseFloat(f[c + 'Max']); if (!isNaN(mx) && (r[c] || 0) > mx) { skip = true; break; }
            }
            if (skip) continue;
        }

        results.push(p);
    }

    scoutResults = results;
    sortScoutResults();
    const countEl = scoutMode === 'pitcher' ? 'scoutCountP' : 'scoutCountB';
    document.getElementById(countEl).textContent = `${results.length}명`;
    renderScoutTable();
}

function sortScoutResults() {
    scoutResults.sort((a, b) => {
        let va, vb;
        const ra = a.ratings || {}, rb = b.ratings || {};
        switch (scoutSortKey) {
            case 'name': va = a.name || ''; vb = b.name || ''; return scoutSortDir * va.localeCompare(vb);
            case 'team': va = a.team || ''; vb = b.team || ''; return scoutSortDir * va.localeCompare(vb);
            case 'age': va = a.age || 0; vb = b.age || 0; break;
            case 'salary': va = a.salary || 0; vb = b.salary || 0; break;
            case 'ovr': va = a.ovr || a.powerScore || 0; vb = b.ovr || b.powerScore || 0; break;
            case 'number': va = a.number || 999; vb = b.number || 999; break;
            case 'stuff': va = ra.stuff || 0; vb = rb.stuff || 0; break;
            case 'command': va = ra.command || 0; vb = rb.command || 0; break;
            case 'stamina': va = ra.stamina || 0; vb = rb.stamina || 0; break;
            case 'effectiveness': va = ra.effectiveness || 0; vb = rb.effectiveness || 0; break;
            case 'consistency': va = ra.consistency || 0; vb = rb.consistency || 0; break;
            case 'contact': va = ra.contact || 0; vb = rb.contact || 0; break;
            case 'power': va = ra.power || 0; vb = rb.power || 0; break;
            case 'eye': va = ra.eye || 0; vb = rb.eye || 0; break;
            case 'speed': va = ra.speed || 0; vb = rb.speed || 0; break;
            case 'defense': va = ra.defense || 0; vb = rb.defense || 0; break;
            default: va = 0; vb = 0;
        }
        return scoutSortDir * (va - vb);
    });
}

function renderScoutTable() {
    const thead = document.getElementById('scoutResultHead');
    const tbody = document.getElementById('scoutResultBody');

    const arrow = key => `<span class="sort-arrow ${scoutSortKey === key ? 'active' : ''}">${scoutSortKey === key ? (scoutSortDir > 0 ? '▲' : '▼') : '▽'}</span>`;
    const sh = (label, key) => `<th data-sort="${key}">${label}${arrow(key)}</th>`;

    let cols;
    if (scoutMode === 'pitcher') {
        cols = `<tr><th style="width:30px;"><input type="checkbox" id="scoutCheckAll" title="전체 선택"></th>${sh('팀','team')}${sh('#','number')}${sh('이름','name')}<th>역할</th><th>투타</th>${sh('나이','age')}${sh('구위','stuff')}${sh('제구','command')}${sh('체력','stamina')}${sh('효율','effectiveness')}${sh('안정','consistency')}${sh('OVR','ovr')}${sh('연봉','salary')}</tr>`;
    } else {
        cols = `<tr><th style="width:30px;"><input type="checkbox" id="scoutCheckAll" title="전체 선택"></th>${sh('팀','team')}${sh('#','number')}${sh('이름','name')}<th>포지션</th><th>투타</th>${sh('나이','age')}${sh('컨택','contact')}${sh('파워','power')}${sh('선구','eye')}${sh('스피드','speed')}${sh('수비','defense')}${sh('OVR','ovr')}${sh('연봉','salary')}</tr>`;
    }
    thead.innerHTML = cols;

    // 정렬 클릭 이벤트
    thead.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            if (scoutSortKey === th.dataset.sort) scoutSortDir *= -1;
            else { scoutSortKey = th.dataset.sort; scoutSortDir = -1; }
            sortScoutResults();
            renderScoutTable();
        });
    });

    if (!scoutResults.length) {
        tbody.innerHTML = '<tr><td colspan="13" style="text-align:center;padding:32px;color:var(--text-dim);">검색 결과가 없습니다</td></tr>';
        return;
    }

    // 비교 버튼 (테이블 위)
    const tableEl = document.getElementById('scoutResultTable');
    let compareBar = document.getElementById('scoutCompareBar');
    if (!compareBar) {
        compareBar = document.createElement('div');
        compareBar.id = 'scoutCompareBar';
        compareBar.className = 'scout-compare-bar';
        tableEl.parentElement.insertBefore(compareBar, tableEl);
    }
    compareBar.innerHTML = `<button class="btn btn--primary btn--sm" id="btnScoutCompare" disabled>선수 비교 (0명 선택)</button>`;
    document.getElementById('btnScoutCompare').addEventListener('click', openScoutCompare);

    // 전체 선택
    setTimeout(() => {
        const checkAll = document.getElementById('scoutCheckAll');
        if (checkAll) checkAll.addEventListener('change', (e) => {
            document.querySelectorAll('.scout-compare-check').forEach(cb => cb.checked = e.target.checked);
            updateCompareCount();
        });
    }, 0);

    tbody.innerHTML = scoutResults.slice(0, 300).map(p => {
        const r = p.ratings || {};
        const ovr = p.ovr || p.powerScore || 0;
        const ovrStyle = ovr >= 70 ? 'color:#16a34a;font-weight:700' : ovr >= 55 ? 'color:var(--accent);font-weight:600' : ovr < 40 ? 'color:var(--danger)' : '';
        let row = `<tr class="scout-row-selectable" style="cursor:pointer">`;
        row += `<td onclick="event.stopPropagation()"><input type="checkbox" class="scout-compare-check" data-id="${p.id}"></td>`;
        row += `<td onclick="selectScoutRow(this.parentElement,'${p.id}')"><img src="${teamLogo(p.team)}" style="width:20px;height:20px;vertical-align:middle" alt="${p.team}"></td>`;
        const oc = `onclick="selectScoutRow(this.parentElement,'${p.id}')"`;
        row += `<td ${oc}>${p.number || '-'}</td>`;
        row += `<td ${oc} style="font-weight:600">${p.name}${p.isForeign ? ' <span style="color:var(--kbo-gold);font-size:10px;">외</span>' : ''}</td>`;
        if (scoutMode === 'pitcher') {
            row += `<td ${oc}>${p.role || '-'}</td><td ${oc} style="font-size:11px">${p.throwBat || '-'}</td><td ${oc}>${p.age || '-'}</td>`;
            row += `<td ${oc}>${ratingCell(r.stuff)}</td><td ${oc}>${ratingCell(r.command)}</td><td ${oc}>${ratingCell(r.stamina)}</td><td ${oc}>${ratingCell(r.effectiveness)}</td><td ${oc}>${ratingCell(r.consistency)}</td>`;
        } else {
            row += `<td ${oc}>${p.position || '-'}</td><td ${oc} style="font-size:11px">${p.throwBat || '-'}</td><td ${oc}>${p.age || '-'}</td>`;
            row += `<td ${oc}>${ratingCell(r.contact)}</td><td ${oc}>${ratingCell(r.power)}</td><td ${oc}>${ratingCell(r.eye)}</td><td ${oc}>${ratingCell(r.speed)}</td><td ${oc}>${ratingCell(r.defense)}</td>`;
        }
        row += `<td ${oc} style="${ovrStyle}">${Math.round(ovr)}</td><td ${oc}>${p.salary ? p.salary.toFixed(1) : '-'}</td></tr>`;
        return row;
    }).join('');

    // 체크박스 이벤트
    tbody.querySelectorAll('.scout-compare-check').forEach(cb => {
        cb.addEventListener('change', updateCompareCount);
    });
}

function updateCompareCount() {
    const checked = document.querySelectorAll('.scout-compare-check:checked');
    const btn = document.getElementById('btnScoutCompare');
    if (btn) {
        btn.textContent = `선수 비교 (${checked.length}명 선택)`;
        btn.disabled = checked.length < 2;
    }
}

function openScoutCompare() {
    const ids = [...document.querySelectorAll('.scout-compare-check:checked')].map(cb => cb.dataset.id);
    if (ids.length < 2) return;
    const players = ids.map(id => state.players[id]).filter(Boolean).slice(0, 5);

    // 페이지 전환
    document.getElementById('scoutResultsArea').style.display = 'none';
    document.querySelector('.scout-left').style.display = 'none';
    const page = document.getElementById('scoutComparePage');
    page.style.display = 'block';
    document.getElementById('view-scout').scrollIntoView({ behavior: 'auto', block: 'start' });

    document.getElementById('scoutCompareBack').onclick = () => {
        page.style.display = 'none';
        document.getElementById('scoutResultsArea').style.display = '';
        document.querySelector('.scout-left').style.display = '';
    };

    renderScoutCompare(players);
}

function renderScoutCompare(players) {
    const container = document.getElementById('scoutCompareContent');
    const isPitcher = scoutMode === 'pitcher';
    const colors = ['#2563eb', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

    // 비교 레이더 차트
    const tools = isPitcher
        ? [{key:'stuff',label:'구위'},{key:'command',label:'제구'},{key:'stamina',label:'체력'},{key:'effectiveness',label:'효율'},{key:'consistency',label:'안정'}]
        : [{key:'contact',label:'컨택'},{key:'power',label:'파워'},{key:'eye',label:'선구안'},{key:'speed',label:'스피드'},{key:'defense',label:'수비'}];

    const cx = 160, cy = 150, radius = 110;
    const n = tools.length;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;

    // 격자
    let gridLines = '';
    for (const level of [20, 40, 60, 80]) {
        const frac = (level - 20) / 60;
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = startAngle + i * angleStep;
            pts.push(`${cx + Math.cos(a) * radius * frac},${cy + Math.sin(a) * radius * frac}`);
        }
        gridLines += `<polygon points="${pts.join(' ')}" fill="none" stroke="var(--border)" stroke-width="0.5" opacity="0.5"/>`;
    }
    let axisLines = '';
    for (let i = 0; i < n; i++) {
        const a = startAngle + i * angleStep;
        axisLines += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * radius}" y2="${cy + Math.sin(a) * radius}" stroke="var(--border)" stroke-width="0.5" opacity="0.4"/>`;
    }

    // 각 선수 폴리곤
    let polygons = '';
    players.forEach((p, pi) => {
        const r = p.ratings || {};
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = startAngle + i * angleStep;
            const val = r[tools[i].key] || 20;
            const frac = Math.max(0, (val - 20) / 60);
            pts.push(`${cx + Math.cos(a) * radius * frac},${cy + Math.sin(a) * radius * frac}`);
        }
        const color = colors[pi % colors.length];
        polygons += `<polygon points="${pts.join(' ')}" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="2.5"/>`;
    });

    // 라벨
    let labels = '';
    for (let i = 0; i < n; i++) {
        const a = startAngle + i * angleStep;
        const lx = cx + Math.cos(a) * (radius + 28);
        const ly = cy + Math.sin(a) * (radius + 28);
        labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="700" fill="var(--text-dim)">${tools[i].label}</text>`;
    }

    const radarSvg = `<svg viewBox="0 0 320 320" width="360" height="360" style="max-width:100%;display:block;margin:0 auto;">
        ${gridLines}${axisLines}${polygons}${labels}
    </svg>`;

    // 범례
    const legend = `<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:12px 0 24px;">
        ${players.map((p, i) => `<div style="display:flex;align-items:center;gap:6px;">
            <div style="width:14px;height:14px;border-radius:3px;background:${colors[i % colors.length]};"></div>
            <img src="${teamLogo(p.team)}" style="width:16px;height:16px;">
            <span style="font-size:13px;font-weight:600;">${p.name}</span>
            <span style="font-size:11px;color:var(--text-dim);">OVR ${p.ovr || '-'}</span>
        </div>`).join('')}
    </div>`;

    // 스탯 비교 테이블
    let tableHeader = `<tr><th style="text-align:left;">항목</th>`;
    players.forEach((p, i) => {
        tableHeader += `<th style="color:${colors[i % colors.length]}"><img src="${teamLogo(p.team)}" style="width:16px;height:16px;vertical-align:middle"> ${p.name}</th>`;
    });
    tableHeader += '</tr>';

    const rows = tools.map(t => {
        const vals = players.map(p => (p.ratings || {})[t.key] || 0);
        const maxVal = Math.max(...vals);
        return `<tr><td style="font-weight:600;">${t.label}</td>${players.map((p, i) => {
            const v = (p.ratings || {})[t.key] || 0;
            const isBest = v === maxVal && maxVal > 0;
            return `<td style="text-align:center;${isBest ? 'font-weight:900;color:' + colors[i % colors.length] : ''}">${v}</td>`;
        }).join('')}</tr>`;
    });

    // OVR + 연봉 + 나이
    const extraRows = [
        { label: 'OVR', fn: p => p.ovr || 0, best: 'max' },
        { label: '연봉', fn: p => p.salary || 0, best: 'min', fmt: v => v.toFixed(1) + '억' },
        { label: '나이', fn: p => p.age || 0, best: 'min' },
    ];
    const extraHTML = extraRows.map(er => {
        const vals = players.map(er.fn);
        const bestVal = er.best === 'max' ? Math.max(...vals) : Math.min(...vals.filter(v => v > 0));
        return `<tr style="border-top:1px solid var(--border);"><td style="font-weight:600;">${er.label}</td>${players.map((p, i) => {
            const v = er.fn(p);
            const isBest = v === bestVal && v > 0;
            return `<td style="text-align:center;${isBest ? 'font-weight:900;color:' + colors[i % colors.length] : ''}">${er.fmt ? er.fmt(v) : v}</td>`;
        }).join('')}</tr>`;
    }).join('');

    container.innerHTML = `
        ${radarSvg}
        ${legend}
        <table class="player-table" style="max-width:700px;margin:0 auto;">
            <thead>${tableHeader}</thead>
            <tbody>${rows.join('')}${extraHTML}</tbody>
        </table>
    `;
}

function showScoutDetailInline(p) {
    // 테이블+필터 숨기고 상세 페이지 표시
    const resultsArea = document.getElementById('scoutResultsArea');
    const leftPanel = document.querySelector('.scout-left');
    const detailPage = document.getElementById('scoutDetailPage');
    if (resultsArea) resultsArea.style.display = 'none';
    if (leftPanel) leftPanel.style.display = 'none';
    if (detailPage) detailPage.style.display = 'block';

    // 뒤로가기 버튼
    document.getElementById('scoutDetailBack').onclick = () => {
        detailPage.style.display = 'none';
        if (resultsArea) resultsArea.style.display = '';
        if (leftPanel) leftPanel.style.display = '';
    };

    // 페이지 맨 위로 스크롤
    document.getElementById('view-scout').scrollIntoView({ behavior: 'auto', block: 'start' });

    const panel = document.getElementById('scoutDetail');
    const headerEl = document.getElementById('scoutDetailHeader');
    const ratingsEl = document.getElementById('scoutDetailRatings');
    const statsEl = document.getElementById('scoutDetailStats');

    const teamName = state.teams[p.team] ? state.teams[p.team].name : p.team;
    const teamColor = state.teams[p.team] ? state.teams[p.team].color : '#888';
    const scoutReport = generateScoutReport(p);

    // 헤더
    const ovr = p.ovr || p.powerScore || 0;
    const ovrColor = ratingColor(ovr);
    headerEl.innerHTML = `
        <img src="${teamLogo(p.team)}" style="width:40px;height:40px;" alt="${teamName}">
        <div style="color:${teamColor};font-size:28px;font-weight:900;">${p.number != null ? '#' + p.number : ''}</div>
        <div style="flex:1;">
            <div style="font-size:20px;font-weight:900;color:var(--text);">${p.name}</div>
            <div style="font-size:13px;color:var(--text-dim);">
                ${teamName} &nbsp; ${p.position === 'P' ? '투수 (' + (p.role || '') + ')' : p.position}
                ${p.throwBat ? ' &nbsp; ' + p.throwBat : ''}
                ${p.age != null ? ' &nbsp; ' + p.age + '세' : ''}
                ${p.height ? ' &nbsp; ' + p.height + 'cm / ' + p.weight + 'kg' : ''}
            </div>
            ${scoutReport ? `<div class="pm-scout-report" style="margin-top:4px;">${scoutReport}</div>` : ''}
            <div style="margin-top:4px;font-size:13px;">
                ${p.isFranchiseStar ? '<span class="franchise-star-badge">★ 프랜차이즈 스타</span> ' : ''}
                ${p.isForeign ? '<span style="padding:1px 6px;background:rgba(179,161,119,0.15);color:#B3A177;border-radius:4px;font-size:11px;">외국인</span> ' : ''}
                <span style="padding:1px 8px;background:var(--bg-input);border-radius:4px;font-size:12px;font-weight:600;">연봉 ${p.salary}억</span>
            </div>
        </div>
        <div style="text-align:center;flex-shrink:0;">
            <div style="font-size:11px;font-weight:600;color:var(--text-dim);">OVR</div>
            <div style="font-size:36px;font-weight:900;color:${ovrColor};line-height:1;">${Math.round(ovr)}</div>
        </div>
    `;

    // 좌측: 야수=포지션 다이아몬드, 투수=구종 그래프에 통합
    const r = p.ratings || {};
    let ratingsHTML = '';
    if (p.position === 'P' && r.stuff != null) {
        const tools = [{label:'구위',val:r.stuff},{label:'제구',val:r.command},{label:'체력',val:r.stamina},{label:'효율',val:r.effectiveness},{label:'안정',val:r.consistency}];
        const inlinePitchData = (p.realStats && p.realStats.pitches) ? p.realStats : (p.pitches ? { pitches: p.pitches } : null);
        const inlinePitch = inlinePitchData ? `<div class="pm-ratings-title" style="margin-top:12px;">구종</div>${renderPitcherPitchTypes(inlinePitchData)}` : '';
        ratingsHTML = `<div class="pm-ratings-title">20-80 스카우팅 레이팅</div>` +
            tools.map(t => `<div class="pm-rating-row"><span class="pm-rating-label">${t.label}</span><div class="pm-rating-bar"><div class="pm-rating-fill" style="width:${(t.val-20)/60*100}%;background:${ratingColor(t.val)};"></div></div><span class="pm-rating-value" style="color:${ratingColor(t.val)};">${t.val}</span></div>`).join('') + inlinePitch;
    } else if (p.position !== 'P' && r.contact != null) {
        const tools = [{label:'컨택',val:r.contact},{label:'파워',val:r.power},{label:'선구안',val:r.eye},{label:'스피드',val:r.speed},{label:'수비',val:r.defense}];
        const profileHTML = renderPositionDiamond(p);
        ratingsHTML = `<div class="pm-ratings-title">20-80 스카우팅 레이팅</div>` +
            tools.map(t => `<div class="pm-rating-row"><span class="pm-rating-label">${t.label}</span><div class="pm-rating-bar"><div class="pm-rating-fill" style="width:${(t.val-20)/60*100}%;background:${ratingColor(t.val)};"></div></div><span class="pm-rating-value" style="color:${ratingColor(t.val)};">${t.val}</span></div>`).join('') + profileHTML;
    }
    ratingsEl.innerHTML = ratingsHTML;

    // 우측: 시즌 성적 — 시뮬 시작 후에는 simStats 우선
    const rs = (typeof isSeasonStarted === 'function' && isSeasonStarted() && p.simStats) ? p.simStats : p.realStats;
    const sLabel = (typeof isSeasonStarted === 'function' && isSeasonStarted() && p.simStats) ? '2026' : '2025';
    if (rs && p.position !== 'P') {
        statsEl.innerHTML = `
            <div class="pm-ratings-title">${sLabel} 시즌 성적</div>
            ${renderClassicStats(rs)}
            <div class="pm-ratings-title" style="margin-top:12px;">세이버메트릭스</div>
            ${renderSaberStats(rs)}
            ${rs.defRAA != null ? `<div class="pm-ratings-title" style="margin-top:12px;">수비</div>${renderDefenseStats(rs, p)}` : ''}
        `;
    } else if (rs && p.position === 'P') {
        statsEl.innerHTML = `
            <div class="pm-ratings-title">${sLabel} 시즌 성적</div>
            ${renderPitcherClassicStats(rs)}
            <div class="pm-ratings-title" style="margin-top:12px;">세이버메트릭스</div>
            ${renderPitcherSaberStats(rs)}
        `;
    } else {
        statsEl.innerHTML = `<div class="pm-no-data">${p.isForeign ? '외국인 선수 — KBO 이전 시즌 기록 없음' : p.isFutures ? '2군 선수 — 1군 시즌 기록 없음' : '시즌 기록 데이터가 등록되지 않았습니다.'}</div>`;
    }

}

// 포지션 다이아몬드만 (5툴 없이) — 모달용
function renderPositionDiamondOnly(p) {
    return renderPositionDiamondInner(p);
}

// 포지션 + 5툴 2분할 — 스카우트 인라인용
function renderPositionDiamond(p) {
    const diamond = renderPositionDiamondInner(p);
    const radar = renderFiveToolRadar(p);
    return `<div class="pm-profile-split"><div class="pm-profile-split__left">${diamond}</div><div class="pm-profile-split__right">${radar}</div></div>`;
}

function renderPositionDiamondInner(p) {
    const primaryPos = p.primaryPosition || p.position || '';
    const baseDef = (p.ratings && p.ratings.defense) ? p.ratings.defense : 40;
    const subs = p.subPositions || [primaryPos];

    // 외야 (상단) - 240px 기준
    const outfield = {
        LF: { x: 20,  y: 15 },
        CF: { x: 101, y: 0 },
        RF: { x: 182, y: 15 },
    };
    // 내야 (중단)
    const infield = {
        SS:  { x: 60,  y: 75 },
        '2B': { x: 150, y: 75 },
        '3B': { x: 30,  y: 120 },
        '1B': { x: 180, y: 120 },
        C:   { x: 101, y: 165 },
    };
    // DH (바깥)
    const dhPos = { x: 2, y: 165 };

    // subPositions 기반 + POSITION_GROUPS 패널티 → FM 등급
    function getPosClass(targetPos) {
        if (targetPos === primaryPos) return 'pos-primary';
        // subPositions에 있으면 연두색(충분히 가능)
        if (subs.includes(targetPos)) return 'pos-good';
        // 없으면 패널티 기반 계산
        const config = typeof POSITION_GROUPS !== 'undefined' ? POSITION_GROUPS[primaryPos] : null;
        if (!config) return 'pos-bad';
        const penalty = config.penalty[targetPos];
        if (penalty == null) return 'pos-bad';
        const effective = baseDef + penalty;
        if (effective >= 55) return 'pos-good';
        if (effective >= 45) return 'pos-fair';
        if (effective >= 35) return 'pos-weak';
        return 'pos-bad';
    }

    let html = `<div class="pm-position-chart">`;
    html += `<div class="pm-field-outfield"></div>`;
    html += `<div class="pm-field-diamond"></div>`;
    html += `<div class="pm-field-infield"></div>`;
    html += `<div class="pm-field-mound-mini"></div>`;

    // 외야
    for (const [key, coord] of Object.entries(outfield)) {
        const cls = getPosClass(key);
        html += `<div class="pm-pos-dot ${cls}" style="left:${coord.x}px;top:${coord.y}px;">${key}</div>`;
    }
    // 내야
    for (const [key, coord] of Object.entries(infield)) {
        const cls = getPosClass(key);
        html += `<div class="pm-pos-dot ${cls}" style="left:${coord.x}px;top:${coord.y}px;">${key}</div>`;
    }
    // DH (다이아몬드 바깥, 왼쪽 아래)
    const dhClass = primaryPos === 'DH' ? 'pos-primary' : '';
    html += `<div class="pm-pos-dh ${dhClass}" style="left:${dhPos.x}px;top:${dhPos.y}px;">DH</div>`;

    html += `</div>`;
    return html;
}

function renderFiveToolRadar(p) {
    const r = p.ratings || {};
    // 5툴: 컨택(타격정확도), 파워(장타력), 스피드(주루), 수비(순발력&핸들링), 어깨(송구=수비보정)
    const tools = [
        { label: '컨택', value: r.contact || 20 },
        { label: '파워', value: r.power || 20 },
        { label: '스피드', value: r.speed || 20 },
        { label: '수비', value: r.defense || 20 },
        { label: '선구안', value: r.eye || 20 },
    ];

    const cx = 120, cy = 110, radius = 80;
    const n = tools.length;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2; // 12시 방향 시작

    // 배경 격자 (20, 40, 60, 80 기준)
    let gridLines = '';
    for (const level of [20, 40, 60, 80]) {
        const frac = (level - 20) / 60;
        const pts = [];
        for (let i = 0; i < n; i++) {
            const angle = startAngle + i * angleStep;
            pts.push(`${cx + Math.cos(angle) * radius * frac},${cy + Math.sin(angle) * radius * frac}`);
        }
        gridLines += `<polygon points="${pts.join(' ')}" fill="none" stroke="var(--border)" stroke-width="0.5" opacity="0.5"/>`;
    }

    // 축선
    let axisLines = '';
    for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const ex = cx + Math.cos(angle) * radius;
        const ey = cy + Math.sin(angle) * radius;
        axisLines += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="var(--border)" stroke-width="0.5" opacity="0.4"/>`;
    }

    // 데이터 영역
    const dataPoints = [];
    for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const frac = Math.max(0, (tools[i].value - 20) / 60);
        dataPoints.push(`${cx + Math.cos(angle) * radius * frac},${cy + Math.sin(angle) * radius * frac}`);
    }

    // 등급 색상
    const avg = tools.reduce((s, t) => s + t.value, 0) / n;
    const fillColor = avg >= 65 ? 'rgba(34,197,94,0.25)' : avg >= 50 ? 'rgba(37,99,235,0.2)' : avg >= 40 ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.15)';
    const strokeColor = avg >= 65 ? '#22c55e' : avg >= 50 ? '#2563eb' : avg >= 40 ? '#eab308' : '#ef4444';

    // 라벨
    let labels = '';
    for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const lx = cx + Math.cos(angle) * (radius + 22);
        const ly = cy + Math.sin(angle) * (radius + 22);
        const val = tools[i].value;
        const valColor = val >= 65 ? '#22c55e' : val >= 50 ? '#2563eb' : val >= 40 ? 'var(--text)' : '#ef4444';
        labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="10" font-weight="700" fill="var(--text-dim)">${tools[i].label}</text>`;
        // 값 표시
        const vx = cx + Math.cos(angle) * (radius + 10);
        const vy = cy + Math.sin(angle) * (radius + 10);
        labels += `<text x="${lx}" y="${ly + 12}" text-anchor="middle" font-size="11" font-weight="900" fill="${valColor}">${val}</text>`;
    }

    // 꼭짓점 점
    let dots = '';
    for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const frac = Math.max(0, (tools[i].value - 20) / 60);
        const dx = cx + Math.cos(angle) * radius * frac;
        const dy = cy + Math.sin(angle) * radius * frac;
        dots += `<circle cx="${dx}" cy="${dy}" r="3.5" fill="${strokeColor}" stroke="#fff" stroke-width="1.5"/>`;
    }

    return `
        <div style="text-align:center;">
            <div style="font-size:11px;font-weight:700;color:var(--text-dim);margin-bottom:2px;">5 Tool Radar</div>
            <svg viewBox="0 0 240 240" width="100%" style="max-width:220px;">
                ${gridLines}
                ${axisLines}
                <polygon points="${dataPoints.join(' ')}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
                ${dots}
                ${labels}
            </svg>
        </div>`;
}

function selectScoutRow(trEl, id) {
    // 하이라이트
    document.querySelectorAll('.scout-row-selectable').forEach(r => r.classList.remove('scout-row-selected'));
    trEl.classList.add('scout-row-selected');
    openPlayerDetail(id);
}

function openPlayerDetail(id) {
    const p = state.players[id];
    if (!p) return;
    // 스카우트 뷰에서는 인라인 패널로 표시
    const detailPanel = document.getElementById('scoutDetail');
    if (detailPanel) {
        showScoutDetailInline(p);
        return;
    }
    showPlayerModal(p);
}

function ratingCell(val) {
    if (val == null) return '-';
    const v = Math.round(val);
    const color = v >= 70 ? '#16a34a' : v >= 60 ? '#2563eb' : v >= 50 ? 'var(--text)' : v >= 40 ? '#d97706' : '#dc2626';
    return `<span style="color:${color};font-weight:600">${v}</span>`;
}

// ── 등번호 인라인 편집 ──
function editPlayerNumber(playerId, td) {
    const p = state.players[playerId];
    if (!p) return;

    // 이미 편집 중이면 무시
    if (td.querySelector('input')) return;

    const oldVal = p.number != null ? p.number : '';
    td.innerHTML = `<input type="number" min="0" max="999" value="${oldVal}"
        style="width:40px;padding:2px 4px;font-size:12px;text-align:center;border:1px solid var(--accent);border-radius:4px;background:var(--bg-input);color:var(--text-primary);outline:none;"
        onclick="event.stopPropagation()">`;
    const input = td.querySelector('input');
    input.focus();
    input.select();

    function save() {
        const val = input.value.trim();
        if (val === '') {
            // 빈 값 → 번호 제거
            p.number = null;
            td.textContent = '-';
        } else {
            const num = parseInt(val);
            if (isNaN(num) || num < 0 || num > 999) {
                showToast('0~999 사이의 번호를 입력하세요.', 'error');
                td.textContent = oldVal || '-';
                return;
            }
            // 중복 체크
            const teamCode = p.team;
            const team = state.teams[teamCode];
            const duplicate = team.roster
                .map(id => state.players[id])
                .find(pl => pl && pl.id !== playerId && pl.number === num);
            if (duplicate) {
                showToast(`${num}번은 ${duplicate.name}이(가) 사용 중입니다.`, 'error');
                td.textContent = oldVal || '-';
                return;
            }
            p.number = num;
            td.textContent = num;
        }
        localStorage.setItem('kbo-sim-state', JSON.stringify(state));
    }

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
        if (e.key === 'Escape') { td.textContent = oldVal || '-'; }
    });
}

// ══════════════════════════════════════════
// ██ NEWS FEED (뉴스 피드)
// ══════════════════════════════════════════

const NEWS_CATEGORIES = [
    { id: 'all', label: '전체' },
    { id: 'trade', label: '이적/트레이드' },
    { id: 'salary', label: '연봉/계약' },
    { id: 'ranking', label: '팀순위' },
    { id: 'coaching', label: '감독/코칭' },
    { id: 'management', label: '구단경영' },
    { id: 'prospect', label: '육성/마이너' },
    { id: 'event', label: '시즌이벤트' },
    { id: 'column', label: '칼럼/분석' },
    { id: 'fan', label: '팬여론' },
];

let newsCategoryFilter = 'all';
let newsMyTeamOnly = false;

/** 시즌 이벤트 기반 뉴스 자동 생성 */
function generateNews() {
    if (!state || !state.teams) return [];
    const totalPlayed = getTotalGamesPlayed(state);
    const standings = getStandings(state);
    const news = [];
    const teamCodes = Object.keys(state.teams);
    const date = '2026-01-15';

    // 시드 기반 일관성
    function seededPick(arr, seed) {
        var h = 0;
        for (var i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
        return arr[(h >>> 0) % arr.length];
    }

    // ── 시즌 시작 전 뉴스 ──
    teamCodes.forEach(function(code) {
        var team = state.teams[code];
        var name = team.name;
        var manager = team.manager || '감독';

        news.push({
            cat: 'management', priority: '속보', team: code,
            title: '[속보] ' + name + ', 새 단장에 테스트씨 선임…구단 쇄신 나선다',
            date: date, tags: ['구단경영','속보','단독'],
            body: name + '에 테스트 단장이 취임했다. 구단 쇄신의 기대감이 높지만, 그에게 주어진 시간은 많지 않다. 2026 시즌 개막까지 약 두 달, 스프링캠프 출발까지는 보름 남짓이다.\n\n' + name + '의 현재 상황을 객관적으로 점검할 필요가 있다. 지난 시즌 성적표는 겉으로는 나쁘지 않았지만, 팬들이 기대하는 수준에는 미치지 못했다는 평가가 지배적이다.\n\n테스트 단장의 첫 번째 과제는 외국인 선수 영입을 마무리하는 것이다. 이어서 FA 시장 마무리, 유망주 육성 체계 구축, 재정 운영 효율화가 뒤따라야 한다.',
            views: Math.floor(300 + Math.random() * 500), comments: Math.floor(50 + Math.random() * 100),
        });

        news.push({
            cat: 'coaching', priority: '일반', team: code,
            title: manager + ' ' + name + ' 감독 "새 단장과 호흡 기대, 시즌 준비 만전"',
            date: date, tags: ['감독/코칭','기사'],
            body: manager + ' 감독은 인터뷰에서 "새 단장님과의 소통이 원활하다"며 시즌 준비에 자신감을 내비쳤다.\n\n"올 시즌 목표는 분명합니다. 포스트시즌 진출, 그리고 한국시리즈 우승입니다. 선수단의 분위기도 좋고, 스프링캠프에서의 훈련도 순조롭습니다."\n\n' + manager + ' 감독 체제는 지난 시즌부터 이어져 온 전술적 기반 위에 새 단장의 데이터 분석 역량이 더해질 것으로 기대된다. 특히 투수 운용과 타순 배치에서 데이터를 적극 활용하겠다는 방침이다.\n\n"과거에는 경험과 감에 의존했지만, 이제는 데이터가 말하는 것을 무시할 수 없는 시대입니다. 단장님과 함께 최적의 의사결정을 내리겠습니다."\n\n코칭스태프 역시 전면 개편되었다. 투수코치와 타격코치가 새로 합류하면서 기존의 약점을 보완할 계획이다.',
            views: Math.floor(100 + Math.random() * 200), comments: Math.floor(20 + Math.random() * 50),
        });

        // 유망주 기사 — 실제 2군 로스터 데이터 활용
        var futures = (team.futuresRoster || []).map(function(id) { return state.players[id]; }).filter(Boolean);
        var topProspects = futures.sort(function(a,b) { return (b.ovr||0)-(a.ovr||0); }).slice(0,5);
        var prospectList = topProspects.map(function(p, i) {
            return (i+1) + '. ' + p.name + ' (' + p.position + (p.position==='P' ? '/' + (p.role||'') : '') + ', OVR ' + (p.ovr||'?') + ')';
        }).join('\n');
        news.push({
            cat: 'prospect', priority: '일반', team: code,
            title: name + ' 2026 기대주 TOP 5, 1군 합류 전망은?',
            date: date, tags: ['육성/마이너','기사'],
            body: name + '의 퓨처스리그에서 두각을 나타낸 유망주들이 2026 시즌 1군 합류를 노리고 있다.\n\n▶ ' + name + ' 유망주 TOP 5\n' + prospectList + '\n\n' + (topProspects[0] ? topProspects[0].name + '은(는) 2군에서 꾸준한 성장세를 보이며 1군 엔트리 경쟁에서 가장 유력한 후보로 꼽힌다. ' + (topProspects[0].position==='P' ? '투수진의 두께를 더할 수 있는 카드로 평가받고 있다.' : '타선에 활력을 불어넣을 수 있는 자원으로 기대를 모으고 있다.') : '') + '\n\n' + manager + ' 감독은 "스프링캠프에서 누구에게나 기회를 줄 것"이라며 "결과로 증명하는 선수가 1군에 올라갈 것"이라고 밝혔다.\n\n다만, 유망주의 성공과 팀 성적 사이에서 균형을 잡는 것은 모든 단장의 숙제다. 무리한 승격보다는 적절한 시기에, 적절한 역할을 부여하는 것이 핵심이다.',
            views: Math.floor(800 + Math.random() * 500), comments: Math.floor(30 + Math.random() * 40),
        });

        // 팀 전력 분석 기사 — 실제 1군 로스터 데이터 활용
        var pitchers1 = team.roster.map(function(id){return state.players[id];}).filter(function(p){return p&&p.position==='P';});
        var batters1 = team.roster.map(function(id){return state.players[id];}).filter(function(p){return p&&p.position!=='P';});
        var ace = pitchers1.filter(function(p){return p.role==='선발';}).sort(function(a,b){return (b.ovr||0)-(a.ovr||0);})[0];
        var closer = pitchers1.filter(function(p){return p.role==='마무리';})[0];
        var topBatter = batters1.sort(function(a,b){return (b.ovr||0)-(a.ovr||0);})[0];
        var foreigners = team.roster.map(function(id){return state.players[id];}).filter(function(p){return p&&p.isForeign;});
        var foreignList = foreigners.map(function(p){return p.name+'('+p.position+(p.position==='P'?'/'+p.role:'')+')';}).join(', ');
        var teamSalary = typeof calcTeamSalaryRaw === 'function' ? calcTeamSalaryRaw(state, code).toFixed(1) : '?';

        news.push({
            cat: 'column', priority: '참고', team: code,
            title: '2025 시즌 리뷰: ' + name + ' — 전력 분석 및 2026 전망',
            date: date, tags: ['팀순위','기사'],
            body: name + '의 2026 시즌을 앞두고 전력을 분석한다.\n\n▶ 투수진\n에이스: ' + (ace?ace.name+' (OVR '+ace.ovr+')':'미정') + '\n마무리: ' + (closer?closer.name+' (OVR '+closer.ovr+')':'미정') + '\n선발 로테이션: ' + pitchers1.filter(function(p){return p.role==='선발';}).map(function(p){return p.name;}).join(', ') + '\n불펜: ' + pitchers1.filter(function(p){return p.role==='중계';}).length + '명\n\n▶ 타선\n주포: ' + (topBatter?topBatter.name+' ('+topBatter.position+', OVR '+topBatter.ovr+')':'미정') + '\n주전 야수: ' + batters1.slice(0,9).map(function(p){return p.name+'('+p.position+')';}).join(', ') + '\n\n▶ 외국인 선수\n' + (foreignList||'없음') + '\n\n▶ 재정\n총 연봉: ' + teamSalary + '억원\n\n' + name + '는 ' + (ace?ace.name+'을(를) 중심으로 한 선발 로테이션':'투수진 재편') + '과 ' + (topBatter?topBatter.name+'이(가) 이끄는 타선':'타선 보강') + '으로 2026 시즌에 도전한다.',
            views: Math.floor(800 + Math.random() * 600), comments: Math.floor(30 + Math.random() * 30),
        });
    });

    // ── 리그 공통 뉴스 ──
    news.push({
        cat: 'column', priority: '참고', team: null,
        title: '[칼럼] 테스트 단장이 직면한 5가지 과제',
        date: date, tags: ['칼럼/분석','칼럼'],
        body: '신임 단장이 첫 시즌에 가장 중요한 것은 화려한 영입이 아니라, 조직 내 신뢰 구축이다. 감독, 코칭스태프, 스카우트, 선수까지 모든 구성원이 같은 방향을 바라보게 만드는 것이 진정한 리더십이다.\n\n첫째, 외국인 선수 영입. 둘째, FA 시장 마무리. 셋째, 유망주 육성 체계 구축. 넷째, 재정 운영 효율화. 다섯째, 감독과의 소통 체계 정립.',
        views: Math.floor(1200 + Math.random() * 800), comments: Math.floor(60 + Math.random() * 60),
    });

    news.push({
        cat: 'salary', priority: '참고', team: null,
        title: 'FA 시장 마무리 국면…주요 잔류 FA 선수 동향 정리',
        date: date, tags: ['연봉/계약','기사'],
        body: 'KBO FA 시장이 마무리 단계에 접어들었다. 대형 FA 계약이 완료되면서, 남은 선수들의 행선지에 관심이 집중되고 있다.',
        views: Math.floor(1500 + Math.random() * 600), comments: Math.floor(10 + Math.random() * 20),
    });

    // 스토브리그 점검 — 실제 팀별 외국인/연봉 데이터
    var stoveBody = '각 구단의 스토브리그 성적표를 중간 점검한다.\n\n';
    teamCodes.forEach(function(code) {
        var t = state.teams[code];
        var foreignP = t.roster.map(function(id){return state.players[id];}).filter(function(p){return p&&p.isForeign;});
        var sal = typeof calcTeamSalaryRaw === 'function' ? calcTeamSalaryRaw(state, code).toFixed(1) : '?';
        stoveBody += '▶ ' + t.name + ' — 외국인 ' + foreignP.length + '명 (' + foreignP.map(function(p){return p.name;}).join(', ') + ') | 총연봉 ' + sal + '억\n';
    });
    news.push({
        cat: 'event', priority: '주요', team: null,
        title: '2025-26 스토브리그 중간 점검: KBO 10개 구단 보강 현황',
        date: date, tags: ['이적/트레이드','기사'],
        body: stoveBody,
        views: Math.floor(500 + Math.random() * 300), comments: Math.floor(30 + Math.random() * 30),
    });

    // ── 시즌 진행 중 뉴스 (시뮬 결과 기반) ──
    if (totalPlayed > 0 && standings.length > 0) {
        var top = standings[0];
        var bot = standings[standings.length - 1];

        // 선두팀 뉴스 — 실제 스탯 참조
        var topAce = getTeamPitchers(state, top.code).filter(function(p){return p.role==='선발';}).sort(function(a,b){return (b.ovr||0)-(a.ovr||0);})[0];
        var topSlugger = getTeamBatters(state, top.code).sort(function(a,b){return (b.ovr||0)-(a.ovr||0);})[0];
        news.push({
            cat: 'ranking', priority: '속보', team: top.code,
            title: top.name + ', ' + totalPlayed + '경기 소화 후 ' + top.wins + '승 ' + (top.draws||0) + '무 ' + top.losses + '패로 선두 질주!',
            date: date, tags: ['팀순위','기사'],
            body: top.name + '가 리그 선두를 달리고 있다. 승률 ' + formatRate(top.rate) + '로 2위와의 격차를 벌리고 있다.\n\n▶ 선두 비결\n투수력 ' + top.pitchPower.toFixed(1) + ' | 타력 ' + top.batPower.toFixed(1) + '\n' + (topAce ? '에이스 ' + topAce.name + '(OVR ' + topAce.ovr + ')이(가) 마운드를 이끌고 있으며, ' : '') + (topSlugger ? topSlugger.name + '(OVR ' + topSlugger.ovr + ')이(가) 타선의 핵심이다.' : '') + '\n\n' + (totalPlayed >= 72 ? '후반기에도 이 기세를 이어갈 수 있을지, 추격팀들의 반격이 있을지 주목된다.' : '아직 시즌 초반이지만 기세가 예사롭지 않다. 다만 시즌은 길고, 변수는 항상 존재한다.') + '\n\n팬들의 반응도 뜨겁다. "올해는 진짜 우승 가능하다"는 낙관론과 "아직 너무 이르다"는 신중론이 공존하고 있다.',
            views: Math.floor(2000 + Math.random() * 1000), comments: Math.floor(100 + Math.random() * 100),
        });

        // 하위팀 뉴스
        var botPitchers = getTeamPitchers(state, bot.code);
        var botBatters = getTeamBatters(state, bot.code);
        news.push({
            cat: 'ranking', priority: '일반', team: bot.code,
            title: bot.name + ', 시즌 ' + bot.wins + '승 ' + bot.losses + '패 부진…반등 가능할까?',
            date: date, tags: ['팀순위','기사'],
            body: bot.name + '가 리그 하위권에 머물고 있다. 승률 ' + formatRate(bot.rate) + '로 고전 중이다.\n\n▶ 부진 원인 분석\n투수력 ' + bot.pitchPower.toFixed(1) + ' | 타력 ' + bot.batPower.toFixed(1) + '\n투수진 ' + botPitchers.length + '명, 야수진 ' + botBatters.length + '명 체제로 운영 중이나 전체적인 전력이 리그 평균을 밑돌고 있다.\n\n트레이드나 외국인 선수 교체 등 대대적인 보강이 필요하다는 목소리가 높다. 팬들 사이에서는 "리빌딩이 필요하다"는 의견과 "아직 포기하기 이르다"는 의견이 엇갈리고 있다.',
            views: Math.floor(1000 + Math.random() * 500), comments: Math.floor(50 + Math.random() * 50),
        });

        // 트레이드 뉴스
        teamCodes.forEach(function(code) {
            var history = state.teams[code].tradeHistory || [];
            if (history.length > 0) {
                var last = history[history.length - 1];
                news.push({
                    cat: 'trade', priority: '속보', team: code,
                    title: '[트레이드] ' + state.teams[code].name + ', ' + (last.sent || []).join('·') + ' ↔ ' + (last.received || []).join('·'),
                    date: last.timestamp || date, tags: ['이적/트레이드','기사'],
                    body: state.teams[code].name + '가 트레이드를 단행했다. ' + (last.recvTeam || '상대팀') + '과의 트레이드를 통해 전력 보강에 나섰다.',
                    views: Math.floor(500 + Math.random() * 1000), comments: Math.floor(30 + Math.random() * 80),
                });
            }
        });

        // 부상 뉴스
        teamCodes.forEach(function(code) {
            var injured = state.teams[code].injuredRoster || [];
            injured.forEach(function(pid) {
                var p = state.players[pid];
                if (p && p._injuryType) {
                    var posLabel = p.position === 'P' ? (p.role||'투수') : p.position;
                    news.push({
                        cat: 'event', priority: '속보', team: code,
                        title: '[부상] ' + state.teams[code].name + ' ' + p.name + '(' + posLabel + '), ' + p._injuryType + '으로 이탈',
                        date: date, tags: ['시즌이벤트','기사'],
                        body: state.teams[code].name + '의 ' + posLabel + ' ' + p.name + '(OVR ' + (p.ovr||'?') + ')이(가) ' + p._injuryType + '으로 부상자 명단에 등록되었다.\n\n예상 이탈 기간: 약 ' + (p._injuryDuration || '?') + '일\n\n' + (p.ovr >= 60 ? '주전급 선수의 이탈로 팀 전력에 큰 영향이 예상된다. 대체 자원 확보가 시급한 상황이다.' : '전력 손실은 크지 않지만, 로스터 운영에 차질이 불가피하다.') + '\n\n' + state.teams[code].name + '는 2군에서 대체 선수를 승격시켜 공백을 메울 예정이다.',
                        views: Math.floor(300 + Math.random() * 500), comments: Math.floor(20 + Math.random() * 40),
                    });
                }
            });
        });
    }

    // 팬여론
    if (totalPlayed > 0) {
        teamCodes.slice(0, 3).forEach(function(code) {
            news.push({
                cat: 'fan', priority: '일반', team: code,
                title: state.teams[code].name + ' 팬들, "올 시즌 기대 반 우려 반"',
                date: date, tags: ['팬여론','커뮤니티'],
                body: state.teams[code].name + ' 팬 커뮤니티에서는 올 시즌 전망에 대해 다양한 의견이 나오고 있다. 일부는 보강에 만족하고, 일부는 추가 영입을 요구하고 있다.',
                views: Math.floor(1000 + Math.random() * 700), comments: Math.floor(40 + Math.random() * 50),
            });
        });
    }

    // 시뮬 진행 중 누적 뉴스 합치기
    if (state.newsLog && state.newsLog.length > 0) {
        news = news.concat(state.newsLog);
    }

    // 우선순위 정렬 (속보 > 주요 > 참고 > 일반), 같으면 최신순
    var priorityOrder = { '속보': 0, '주요': 1, '참고': 2, '일반': 3 };
    news.sort(function(a, b) {
        var pa = priorityOrder[a.priority] || 3, pb = priorityOrder[b.priority] || 3;
        if (pa !== pb) return pa - pb;
        return (b.gameDay || 0) - (a.gameDay || 0);
    });

    return news;
}

/**
 * 시뮬레이션 배치 후 호출 — 새 뉴스를 state.newsLog에 추가
 * 매 배치마다 2~5개의 뉴스가 생성됨
 */
function generateBatchNews(state) {
    if (!state || !state.teams) return;
    if (!state.newsLog) state.newsLog = [];

    var totalPlayed = getTotalGamesPlayed(state);
    var standings = getStandings(state);
    if (totalPlayed <= 0 || standings.length < 2) return;

    var teamCodes = Object.keys(state.teams);
    var date = '';
    if (state.gameLog && state.gameLog.length > 0) {
        date = state.gameLog[state.gameLog.length - 1].date || '';
    }

    // 이미 이 경기일에 뉴스를 생성했으면 스킵
    if (state._lastNewsDay === totalPlayed) return;
    state._lastNewsDay = totalPlayed;

    var newNews = [];

    // ── 1) 최근 5경기 성적 기반 핫/콜드 팀 뉴스 ──
    var hotTeam = standings[0];
    var coldTeam = standings[standings.length - 1];
    var q = Math.min(4, Math.floor((totalPlayed - 1) / 36) + 1);

    // 연승/연패 팀 감지 (gameLog에서)
    var streaks = {};
    teamCodes.forEach(function(code) { streaks[code] = 0; });
    if (state.gameLog) {
        var recentGames = state.gameLog.slice(-50);
        teamCodes.forEach(function(code) {
            var teamGames = recentGames.filter(function(g) { return g.home === code || g.away === code; }).slice(-5);
            var streak = 0;
            for (var i = teamGames.length - 1; i >= 0; i--) {
                if (teamGames[i].winner === code) streak++;
                else break;
            }
            streaks[code] = streak;
        });
    }

    // 5연승 이상 팀
    teamCodes.forEach(function(code) {
        if (streaks[code] >= 5) {
            newNews.push({
                cat: 'ranking', priority: '속보', team: code, gameDay: totalPlayed,
                title: state.teams[code].name + ' ' + streaks[code] + '연승! 파죽지세 질주',
                date: date, tags: ['팀순위','기사'],
                body: state.teams[code].name + '가 ' + streaks[code] + '연승을 달리며 무서운 기세를 보이고 있다.\n\n' + totalPlayed + '경기 소화 시점에서 ' + (standings.find(function(s){return s.code===code;})?.wins||0) + '승을 기록 중이다. 투타 조화가 빛나는 가운데, 감독의 용병술도 적중하고 있다는 평가다.\n\n팬들 사이에서는 "올 시즌은 다르다"는 기대감이 높아지고 있으며, 라이벌 팀들도 경계심을 늦추지 못하고 있다.',
                views: Math.floor(1500 + Math.random() * 1000), comments: Math.floor(80 + Math.random() * 80),
            });
        }
    });

    // ── 2) 개인 성적 뉴스 (simStats 기반) ──
    var allBatters = [];
    var allPitchers = [];
    teamCodes.forEach(function(code) {
        var roster = state.teams[code].roster || [];
        roster.forEach(function(id) {
            var p = state.players[id];
            if (!p || !p.simStats) return;
            if (p.position === 'P') allPitchers.push(p);
            else allBatters.push(p);
        });
    });

    // 타율왕 후보
    var avgLeader = allBatters.filter(function(p){return (p.simStats.PA||0)>50;}).sort(function(a,b){return (b.simStats.AVG||0)-(a.simStats.AVG||0);})[0];
    if (avgLeader && (avgLeader.simStats.AVG||0) > 0.330) {
        newNews.push({
            cat: 'ranking', priority: '주요', team: avgLeader.team, gameDay: totalPlayed,
            title: avgLeader.name + ', 타율 ' + avgLeader.simStats.AVG.toFixed(3) + '으로 타격왕 선두!',
            date: date, tags: ['칼럼/분석','기사'],
            body: state.teams[avgLeader.team].name + '의 ' + avgLeader.name + '(' + avgLeader.position + ')이(가) 타율 ' + avgLeader.simStats.AVG.toFixed(3) + '으로 리그 타격왕 선두를 달리고 있다.\n\n' + totalPlayed + '경기 기준 ' + avgLeader.simStats.H + '안타, ' + avgLeader.simStats.HR + '홈런, ' + avgLeader.simStats.RBI + '타점을 기록 중이며, OPS ' + avgLeader.simStats.OPS.toFixed(3) + '으로 리그 최상위권 공격력을 과시하고 있다.\n\n스카우팅 리포트에 따르면 ' + avgLeader.name + '의 컨택 능력(contact ' + (avgLeader.ratings?.contact||'?') + ')과 선구안(eye ' + (avgLeader.ratings?.eye||'?') + ')이 올 시즌 폭발적으로 향상됐다는 분석이다.',
            views: Math.floor(1800 + Math.random() * 800), comments: Math.floor(60 + Math.random() * 60),
        });
    }

    // 홈런왕 후보
    var hrLeader = allBatters.sort(function(a,b){return (b.simStats.HR||0)-(a.simStats.HR||0);})[0];
    if (hrLeader && (hrLeader.simStats.HR||0) >= 5 && totalPlayed % 10 === 0) {
        newNews.push({
            cat: 'ranking', priority: '참고', team: hrLeader.team, gameDay: totalPlayed,
            title: hrLeader.name + ', ' + hrLeader.simStats.HR + '호 홈런! 홈런왕 경쟁 선두',
            date: date, tags: ['팀순위','기사'],
            body: state.teams[hrLeader.team].name + '의 ' + hrLeader.name + '이(가) 시즌 ' + hrLeader.simStats.HR + '호 홈런으로 홈런왕 경쟁 선두에 올랐다.\n\n파워 레이팅 ' + (hrLeader.ratings?.power||'?') + '의 장타력이 올 시즌 유감없이 발휘되고 있다. ' + hrLeader.simStats.RBI + '타점도 함께 기록하며 클린업 라인의 핵심 역할을 하고 있다.',
            views: Math.floor(1200 + Math.random() * 600), comments: Math.floor(40 + Math.random() * 50),
        });
    }

    // 다승왕 후보
    var winLeader = allPitchers.filter(function(p){return p.role==='선발';}).sort(function(a,b){return (b.simStats.W||0)-(a.simStats.W||0);})[0];
    if (winLeader && (winLeader.simStats.W||0) >= 3 && totalPlayed % 15 === 0) {
        newNews.push({
            cat: 'ranking', priority: '참고', team: winLeader.team, gameDay: totalPlayed,
            title: winLeader.name + ', ' + winLeader.simStats.W + '승 기록! 다승왕 향해 순항',
            date: date, tags: ['팀순위','기사'],
            body: state.teams[winLeader.team].name + '의 에이스 ' + winLeader.name + '이(가) 시즌 ' + winLeader.simStats.W + '승(' + winLeader.simStats.L + '패)을 기록하며 다승왕 경쟁을 이끌고 있다.\n\nERA ' + winLeader.simStats.ERA.toFixed(2) + ', ' + fmtIP(winLeader.simStats.IP) + '이닝 ' + winLeader.simStats.SO + '탈삼진으로 안정적인 투구를 보여주고 있다.\n\n' + (winLeader.simStats.ERA < 3.0 ? '"올 시즌 최고의 투수"라는 찬사가 이어지고 있다.' : '꾸준한 퀄리티 스타트로 팀의 버팀목 역할을 하고 있다.'),
            views: Math.floor(1000 + Math.random() * 500), comments: Math.floor(30 + Math.random() * 40),
        });
    }

    // ── 3) 루머/이적설 (랜덤) ──
    if (Math.random() < 0.15) {
        var rumorTeam = teamCodes[Math.floor(Math.random() * teamCodes.length)];
        var rumorBatters = (state.teams[rumorTeam].roster||[]).map(function(id){return state.players[id];}).filter(function(p){return p&&p.position!=='P'&&!p.isForeign;});
        var rumorTarget = rumorBatters[Math.floor(Math.random() * rumorBatters.length)];
        var rumorDest = teamCodes.filter(function(c){return c!==rumorTeam;})[Math.floor(Math.random() * 9)];
        if (rumorTarget) {
            newNews.push({
                cat: 'trade', priority: '참고', team: rumorTeam, gameDay: totalPlayed,
                title: '[루머] ' + state.teams[rumorTeam].name + ' ' + rumorTarget.name + ', ' + state.teams[rumorDest].name + ' 이적설 솔솔',
                date: date, tags: ['이적/트레이드','루머'],
                body: state.teams[rumorTeam].name + '의 ' + rumorTarget.name + '(' + rumorTarget.position + ', OVR ' + (rumorTarget.ovr||'?') + ')에 대한 ' + state.teams[rumorDest].name + '의 관심이 포착됐다는 루머가 돌고 있다.\n\n양 구단 모두 공식적으로는 부인하고 있지만, 복수의 관계자에 따르면 비공식적인 접촉이 있었던 것으로 전해진다.\n\n' + rumorTarget.name + '의 연봉은 ' + rumorTarget.salary + '억원으로, 트레이드가 성사될 경우 양 팀의 연봉 구조에도 영향을 미칠 전망이다.\n\n※ 본 기사는 확인되지 않은 루머에 기반합니다.',
                views: Math.floor(2000 + Math.random() * 1500), comments: Math.floor(100 + Math.random() * 150),
            });
        }
    }

    // ── 4) 팬 반응 (매 배치) ──
    if (Math.random() < 0.3) {
        var fanTeam = teamCodes[Math.floor(Math.random() * teamCodes.length)];
        var fanRecord = standings.find(function(s){return s.code===fanTeam;});
        var fanSentiment = fanRecord && fanRecord.rate > 0.55 ? '긍정적' : fanRecord && fanRecord.rate < 0.45 ? '불만족' : '엇갈린';
        var fanReactions = {
            '긍정적': ['"올해는 진짜 우승 가능할 것 같다!"', '"감독님 믿고 갑니다"', '"역대급 시즌이 될 수 있다"'],
            '불만족': ['"단장 나와라"', '"트레이드 좀 해라"', '"이게 프로야구 팀이냐"', '"투수 보강 시급하다"'],
            '엇갈린': ['"아직 갈 길이 멀다"', '"좋아지고는 있는데..."', '"후반기에 진가를 보여줘야 한다"'],
        };
        var reactions = fanReactions[fanSentiment] || fanReactions['엇갈린'];
        newNews.push({
            cat: 'fan', priority: '일반', team: fanTeam, gameDay: totalPlayed,
            title: state.teams[fanTeam].name + ' 팬 반응: ' + reactions[Math.floor(Math.random() * reactions.length)],
            date: date, tags: ['팬여론','커뮤니티'],
            body: state.teams[fanTeam].name + ' 커뮤니티가 뜨겁다.\n\n현재 시즌 성적 ' + (fanRecord?.wins||0) + '승 ' + (fanRecord?.losses||0) + '패(승률 ' + formatRate(fanRecord?.rate||0) + ')에 대해 팬들의 반응이 ' + fanSentiment + '이다.\n\n주요 의견:\n' + reactions.map(function(r){return '· ' + r;}).join('\n') + '\n\n' + (fanSentiment === '긍정적' ? '시즌 초반의 좋은 흐름을 이어가며 팬들의 기대감이 최고조에 달하고 있다.' : fanSentiment === '불만족' ? '팬들의 인내심이 한계에 달하고 있다. 구단의 결단이 필요한 시점이다.' : '팬들은 조심스러운 낙관론과 현실론 사이에서 고민하고 있다.'),
            views: Math.floor(800 + Math.random() * 1000), comments: Math.floor(50 + Math.random() * 100),
        });
    }

    // ── 5) 쿼터 종료 뉴스 ──
    if (totalPlayed === 36 || totalPlayed === 72 || totalPlayed === 108 || totalPlayed === 144) {
        newNews.push({
            cat: 'ranking', priority: '속보', team: null, gameDay: totalPlayed,
            title: q + 'Q 종료! ' + hotTeam.name + ' ' + hotTeam.wins + '승으로 선두, ' + coldTeam.name + ' ' + coldTeam.losses + '패로 최하위',
            date: date, tags: ['팀순위','기사'],
            body: totalPlayed + '경기(Q' + q + ')가 종료되었다.\n\n▶ 순위표\n' + standings.map(function(s, i) {
                return (i+1) + '위 ' + s.name + ' ' + s.wins + '승 ' + (s.draws||0) + '무 ' + s.losses + '패 (승률 ' + formatRate(s.rate) + ')';
            }).join('\n') + '\n\n' + hotTeam.name + '가 ' + hotTeam.wins + '승으로 선두를 달리고 있으며, ' + coldTeam.name + '는 ' + coldTeam.losses + '패로 가장 부진한 성적을 보이고 있다.',
            views: Math.floor(3000 + Math.random() * 2000), comments: Math.floor(200 + Math.random() * 200),
        });
    }

    // ── 6) 세이버메트릭스 칼럼 (시기별 주제) ──
    // 매 5경기마다 새 칼럼 1개 발행
    var weekIdx = Math.floor(totalPlayed / 5);
    var publishedCols = state._publishedColumns || [];
    if (!state._publishedColumns) state._publishedColumns = [];

    var COLUMNS = [
        {
            week: 1, title: '[칼럼] 출루율의 진짜 가치 — "타율보다 중요한 단 하나의 지표"',
            tags: ['칼럼/분석','세이버메트릭스'],
            body: '머니볼 혁명 이후 20년이 지난 지금, KBO에서도 출루율(OBP)의 가치가 재조명되고 있다.\n\n▶ 왜 출루율인가?\n득점은 아웃을 만들지 않는 것에서 시작된다. 27아웃을 피해야 9이닝 동안 득점 기회를 만들 수 있고, 그 출발점이 바로 출루다. 타율 .290 + 출루율 .330 타자보다, 타율 .265 + 출루율 .380 타자가 훨씬 더 가치 있다.\n\n▶ 데이터가 말하는 것\n2015~2024년 KBO 데이터를 분석하면, 팀 출루율과 팀 득점의 상관계수는 0.91로 타율(0.78)보다 훨씬 높다. 즉, 출루율이 득점을 더 잘 예측한다.\n\n▶ wOBA로 한 단계 더\n출루율의 한계는 모든 출루를 동등하게 본다는 점이다. 볼넷과 홈런이 같은 가치일 리 없다. 그래서 등장한 것이 wOBA(weighted On-Base Average)다. 각 사건의 득점 기여도에 가중치를 부여한 통합 지표다.\n\n▶ 단장의 시선\n비싼 홈런 타자보다, 저평가된 출루 머신을 발굴하는 것이 머니볼의 핵심이다. 빌리 빈이 30년 전 발견한 진리는 KBO에서도 유효하다.',
        },
        {
            week: 2, title: '[칼럼] 강한 2번 타자의 시대 — "테이블세터를 다시 정의하다"',
            tags: ['칼럼/분석','전술'],
            body: '"2번 타자는 컨택형, 4번은 거포" — 이 오래된 공식이 무너지고 있다.\n\n▶ 전통의 붕괴\n2번 타자에게 요구되던 덕목은 번트, 진루타, 컨택이었다. 그러나 메이저리그에서 무키 베츠, 아론 저지, 후안 소토 같은 슈퍼스타가 2번을 치는 시대가 왔다.\n\n▶ 왜 2번에 강타자를?\n2번 타자는 1번 타자보다 시즌당 약 18타석을 더 받는다. 18타석은 결코 적지 않은 숫자다. 당신 팀의 가장 좋은 타자가 가장 많은 타석을 받아야 한다는 것은 산수다.\n\n▶ 데이터가 말하는 것\n득점 기대값(Run Expectancy) 분석에 따르면, 1사 후 1루 상황에서 강한 2번 타자가 만드는 추가 득점은 평균 0.18점에 달한다. 144경기 시즌으로 환산하면 약 26점, WAR로는 약 2.6승의 가치다.\n\n▶ KBO에 적용하면?\n전통적인 KBO에서는 여전히 컨택형 2번이 많다. 그러나 데이터 야구가 정착하면서, 2026 시즌에는 클린업급 타자를 2번에 두는 팀이 늘어날 것으로 보인다.',
        },
        {
            week: 3, title: '[칼럼] VAA의 비밀 — "왜 평평한 패스트볼이 헛스윙을 만드는가"',
            tags: ['칼럼/분석','투구메커니즘'],
            body: '메이저리그 트랙맨 데이터가 밝혀낸 가장 중요한 발견 중 하나는 바로 VAA(Vertical Approach Angle)다.\n\n▶ VAA란 무엇인가?\nVAA는 공이 홈플레이트에 도달하는 순간 지면과 이루는 수직 각도다. 단위는 도(°), 모든 패스트볼은 음수(아래로 떨어짐)다.\n\n• VAA = -6.0° → 가파르게 떨어짐 (땅볼 유도형)\n• VAA = -4.0° → 거의 수평 (하이 패스트볼, 헛스윙 유도)\n\n▶ 왜 평평할수록 좋은가?\n타자의 뇌는 0.2초 만에 스윙 여부를 결정해야 한다. 이때 뇌는 공의 궤적을 "학습된 패턴"과 비교한다. 보통 패스트볼은 -5° 정도로 떨어지는데, VAA가 -4°로 더 평평하면 타자는 "공이 떠오른다"고 착각한다. 결과는 헛스윙.\n\n▶ 키 작은 투수의 무기\n사사키 로우키 같은 스타 투수가 평균 키보다 작은 이유는 무엇인가? 낮은 릴리스 포인트 → 더 평평한 진입각 → 헛스윙 유도. 신체적 한계가 오히려 장점이 된다.\n\n▶ KBO 적용\n2024 KBO에서 VAA가 가장 평평한 투수 TOP10의 평균 헛스윙률은 12.8%로, 리그 평균(9.2%)을 크게 상회했다. 데이터가 말한다.',
        },
        {
            week: 4, title: '[칼럼] IVB와 마그누스 효과 — "공이 떠오르는 과학"',
            tags: ['칼럼/분석','투구메커니즘'],
            body: '"공이 떠오른다"는 표현은 과학적으로 틀렸다. 그러나 타자의 눈에는 분명 떠오른다. 그 원인이 바로 IVB(Induced Vertical Break)다.\n\n▶ IVB의 정의\nIVB는 중력의 영향을 제외한, 순수하게 공의 회전이 만드는 수직 무브먼트다. 단위는 inch 또는 cm.\n\n• IVB 15 inch → 평균보다 4 inch 적게 떨어짐 → 떠오르는 듯한 착시\n• IVB 10 inch → KBO 평균\n\n▶ 마그누스 효과\n야구공의 백스핀(분당 2,200~2,500 회전)이 공기 흐름을 비대칭으로 만들어, 공이 진행 방향과 수직으로 양력을 받는다. 이것이 마그누스 효과다.\n\n공기역학 실험에 따르면, 회전수가 100 RPM 증가할 때마다 IVB는 약 0.5 inch 증가한다. 즉, 회전수가 곧 무기다.\n\n▶ 진짜 비밀: 회전축\n같은 2,400 RPM이라도 회전축이 12시 방향(완벽한 백스핀)에 가까울수록 IVB가 높다. 약간이라도 옆으로 기울면 회전이 측면 무브먼트로 분산된다. "Active Spin"이라 부르는 이 개념이 차세대 투수 개발의 핵심이다.\n\n▶ 결론\n구속이 빠른 것보다 회전수가 좋고, 회전수보다 회전축이 좋아야 한다. 단순한 시속 150km/h 패스트볼보다, IVB 18 inch의 145km/h 패스트볼이 더 위협적이다.',
        },
        {
            week: 5, title: '[칼럼] Statcast 시대 — "야구는 이제 측정의 스포츠다"',
            tags: ['칼럼/분석','세이버메트릭스'],
            body: '2015년 메이저리그가 모든 구장에 Statcast를 설치한 이후, 야구는 전혀 다른 스포츠가 되었다.\n\n▶ Statcast가 측정하는 것\n• 타구속도(Exit Velocity): 배트에 맞는 순간 공의 속도\n• 발사각(Launch Angle): 타구의 수직 각도\n• 타구거리(Hit Distance): 비거리\n• 주루속도(Sprint Speed): 최대 주루속도\n• 추격거리(Catch Probability): 외야수 수비 범위\n• 회전수, 회전축, 익스텐션, 릴리스 포인트 등\n\n▶ 배럴(Barrel)의 발견\nStatcast는 "배럴 타구"라는 개념을 만들었다. 발사각 26~30°, 타구속도 98mph 이상일 때, 타율 .500 이상, 장타율 1.500 이상의 결과가 나온다. 이 조합이 가장 가치 있는 타구다.\n\n▶ "운"의 분리\nBABIP가 높은 타자는 "운이 좋았다"고 평가받았다. 그러나 Statcast로 보면, 그가 실제로 강한 타구를 많이 만들었음을 알 수 있다. xBA(기대 타율), xSLG, xwOBA로 운과 실력을 분리할 수 있게 되었다.\n\n▶ KBO의 도전\nKBO도 트랙맨 시스템을 도입했지만, 데이터 공개와 활용 면에서는 메이저리그에 비해 뒤처져 있다. 그러나 분석 인프라에 투자하는 구단이 늘고 있으며, 2026 시즌에는 데이터 기반 의사결정이 더 보편화될 전망이다.\n\n▶ 단장의 무기\n이제 단장은 단순히 "이 선수는 좋아 보인다"가 아니라 "이 선수의 xwOBA는 .380, Barrel%는 12.5%로 리그 상위 5%에 해당한다"고 말해야 한다.',
        },
        {
            week: 6, title: '[칼럼] 클러치 히터의 신화 — "큰 경기에 강한 타자는 정말 존재하는가"',
            tags: ['칼럼/분석','세이버메트릭스'],
            body: '"위기에 강한 타자", "클러치 히터" — 야구계에는 이런 신화가 가득하다. 그런데 데이터는 무엇이라고 말할까?\n\n▶ 통계학자의 답: "거의 존재하지 않는다"\n빌 제임스, 톰 탱고 등 세이버메트릭스의 거장들이 수십 년간 분석한 결과, 클러치 상황(득점권, 9회, 동점)에서 평소보다 통계적으로 유의미하게 잘 치는 타자는 극소수다.\n\n▶ 그러나 뇌는 기억한다\n팬들이 클러치 히터로 기억하는 선수는 대개 "스타 타자"다. 우리는 그들의 결정타를 기억하고, 평범한 선수의 결정타는 잊는다. 확증편향의 결과다.\n\n▶ Win Probability Added (WPA)\nWPA는 각 타석이 팀의 승리 확률에 미친 영향을 측정한다. 9회말 동점 상황에서의 끝내기 안타(WPA +0.4)와 12-0으로 이긴 경기의 솔로홈런(WPA +0.01)은 다르다.\n\n▶ 결론\n클러치 히터는 환상에 가깝지만, WPA는 실제로 누가 큰 순간에 기여했는지 객관적으로 보여준다. 단장은 이를 활용해 연봉을 책정해야 한다.',
        },
        {
            week: 7, title: '[칼럼] 시프트의 시대 — "수비 위치는 이제 데이터가 결정한다"',
            tags: ['칼럼/분석','수비'],
            body: '메이저리그가 2023년 시프트를 제한했지만, 그 이전 10년간 시프트는 야구를 바꿨다.\n\n▶ 시프트의 원리\n좌타 강타자는 우측으로 90% 이상 타구를 보낸다. 그렇다면 3루수를 우측으로 옮기는 것이 합리적이다. 단순한 산수다.\n\n▶ 효과\n2015~2022년 데이터에 따르면, 시프트는 좌타자의 BABIP를 약 .020 낮췄다. 시즌 600타석 기준 12 안타가 줄어드는 효과다.\n\n▶ KBO의 시프트\nKBO에서도 일부 팀이 시프트를 적극 도입하고 있다. 그러나 공식 데이터 공개가 부족해 아직 효과 측정이 어렵다.\n\n▶ 단장의 결정\n시프트를 잘하는 팀은 단순히 "선수가 좋다"가 아니라 "데이터팀이 강하다"는 의미다. 분석 인프라에 투자하는 것이 곧 수비력 향상이다.',
        },
    ];

    // 다음 발행할 칼럼 찾기 (현재 weekIdx 이하의 미발행 칼럼 모두)
    COLUMNS.forEach(function(c) {
        if (c.week <= weekIdx && publishedCols.indexOf(c.week) < 0) {
            state._publishedColumns.push(c.week);
            newNews.push({
                cat: 'column', priority: '주요', team: null, gameDay: totalPlayed,
                title: c.title,
                date: date, tags: c.tags,
                body: c.body,
                views: Math.floor(2000 + Math.random() * 1500), comments: Math.floor(80 + Math.random() * 100),
            });
        }
    });

    // 새 뉴스 추가
    if (newNews.length > 0) {
        state.newsLog = state.newsLog.concat(newNews);
    }
}

/** 뉴스 뷰 렌더링 */
function renderNewsView() {
    var news = generateNews();
    var container = document.getElementById('newsListContainer');
    var catBtns = document.getElementById('newsCategoryBtns');

    // 카테고리 버튼
    var catCounts = {};
    news.forEach(function(n) { catCounts[n.cat] = (catCounts[n.cat] || 0) + 1; });
    catBtns.innerHTML = NEWS_CATEGORIES.map(function(c) {
        var count = c.id === 'all' ? news.length : (catCounts[c.id] || 0);
        var active = newsCategoryFilter === c.id ? ' active' : '';
        return '<button class="btn btn--sm' + active + '" data-newscat="' + c.id + '">' + c.label + ' (' + count + ')</button>';
    }).join('');

    catBtns.querySelectorAll('[data-newscat]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            newsCategoryFilter = btn.dataset.newscat;
            renderNewsView();
        });
    });

    // 우리 팀 필터
    var myTeamBtn = document.getElementById('newsMyTeamBtn');
    myTeamBtn.className = 'btn btn--sm' + (newsMyTeamOnly ? ' active' : '');
    myTeamBtn.onclick = function() { newsMyTeamOnly = !newsMyTeamOnly; renderNewsView(); };

    // 필터링
    var filtered = news;
    if (newsCategoryFilter !== 'all') {
        filtered = filtered.filter(function(n) { return n.cat === newsCategoryFilter; });
    }
    if (newsMyTeamOnly) {
        var myTeam = (typeof getMyTeam === 'function' && getMyTeam()) || document.getElementById('rosterTeamSelect')?.value;
        if (myTeam) filtered = filtered.filter(function(n) { return n.team === myTeam || n.team === null; });
    }

    // 렌더링
    var priorityColors = { '속보': '#ef4444', '주요': '#f59e0b', '참고': '#6366f1', '일반': '#64748b' };
    container.innerHTML = filtered.length === 0
        ? '<div style="text-align:center;color:var(--text-dim);padding:40px;">뉴스가 없습니다.</div>'
        : filtered.map(function(n, idx) {
            var borderColor = priorityColors[n.priority] || '#64748b';
            var teamLbl = n.team && state.teams[n.team] ? '<img src="' + teamLogo(n.team) + '" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;">' : '';
            return '<div class="news-item" style="border-left:3px solid ' + borderColor + ';padding:12px 16px;margin-bottom:8px;background:var(--card);border-radius:0 8px 8px 0;cursor:pointer;" onclick="showNewsDetail(' + idx + ')">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                    '<div>' +
                        '<span style="background:' + borderColor + ';color:#fff;font-size:10px;padding:2px 6px;border-radius:3px;margin-right:6px;">' + n.priority + '</span>' +
                        teamLbl +
                        '<strong style="font-size:14px;">' + n.title + '</strong>' +
                    '</div>' +
                    '<div style="font-size:11px;color:var(--text-dim);white-space:nowrap;margin-left:12px;">조회 ' + (n.views||0).toLocaleString() + ' · 댓글 ' + (n.comments||0) + '</div>' +
                '</div>' +
                '<div style="margin-top:4px;font-size:11px;color:var(--text-dim);">' +
                    n.date + '  ' + (n.tags || []).map(function(t) { return '<span style="background:var(--bg-hover);padding:1px 5px;border-radius:3px;margin-right:3px;">' + t + '</span>'; }).join('') +
                '</div>' +
            '</div>';
        }).join('');

    // 상세보기용 데이터 저장
    window._newsData = filtered;
}

function showNewsDetail(idx) {
    var n = window._newsData?.[idx];
    if (!n) return;
    document.getElementById('newsDetailTitle').textContent = n.title;
    var priorityColors = { '속보': '#ef4444', '주요': '#f59e0b', '참고': '#6366f1', '일반': '#64748b' };
    var teamLbl = n.team && state.teams[n.team] ? '<img src="' + teamLogo(n.team) + '" style="width:20px;height:20px;vertical-align:middle;margin-right:4px;"> ' + state.teams[n.team].name : '';
    document.getElementById('newsDetailBody').innerHTML =
        '<div style="margin-bottom:16px;font-size:12px;color:var(--text-dim);">' +
            '<span style="background:' + (priorityColors[n.priority]||'#64748b') + ';color:#fff;padding:2px 8px;border-radius:3px;margin-right:6px;">' + n.priority + '</span>' +
            teamLbl + '  ' + n.date + '  ' +
            (n.tags||[]).map(function(t) { return '<span style="background:var(--bg-hover);padding:1px 5px;border-radius:3px;margin-right:3px;">' + t + '</span>'; }).join('') +
        '</div>' +
        '<div style="margin-bottom:16px;font-size:12px;color:var(--text-dim);">조회 ' + (n.views||0).toLocaleString() + ' · 댓글 ' + (n.comments||0) + '</div>' +
        '<div style="white-space:pre-wrap;line-height:2.0;">' + (n.body || '') + '</div>';
    document.getElementById('newsDetailModal').style.display = 'flex';
}
window.showNewsDetail = showNewsDetail;

// ── 앱 시작 ──
// initApp은 auth.js의 onLoginSuccess()에서 호출됨
// document.addEventListener('DOMContentLoaded', initApp);
