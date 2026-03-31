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
            if (parsed.teams && parsed.players) return parsed;
        }
    } catch (e) { /* ignore */ }
    return generateSampleData();
}

function saveState() {
    localStorage.setItem('kbo-sim-state', JSON.stringify(state));
    showToast('저장 완료!', 'success');
}

function resetState() {
    if (!confirm('모든 데이터를 초기 상태로 되돌립니다. 계속하시겠습니까?')) return;
    localStorage.removeItem('kbo-sim-state');
    localStorage.removeItem('kbo-foreign-scout-state');
    state = generateSampleData();
    updateAllPowerScores();
    renderDashboard();
    renderRoster();
    renderDepthChart();
    renderSimulator();
    renderPostseason();
    updateQuarterBadge();
    // 외국인 스카우트 초기화
    foreignScoutState.unlocked = false;
    foreignScoutState.batterUnlocked = false;
    foreignScoutState.missionShown = false;
    foreignScoutState.missionChoice = null;
    foreignScoutState.recruited = [];
    const navFs = document.getElementById('navForeignScout');
    if (navFs) { navFs.classList.add('nav-btn--locked'); navFs.classList.remove('nav-btn--unlocked'); navFs.textContent = '🔒 외국인 스카우트'; }
    const fsTabBatter = document.getElementById('fsTabBatter');
    if (fsTabBatter) { fsTabBatter.classList.add('fs-sub-tab--locked'); fsTabBatter.textContent = '🔒 타자 후보'; }
    showToast('초기화 완료!', 'info');
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

    // Refresh view data
    if (actualView === 'dashboard') renderDashboard();
    if (actualView === 'roster') renderRoster();
    if (viewName === 'depthchart') renderDepthChart();
    if (viewName === 'trade') renderTradeView();
    if (viewName === 'scout') setupScoutView();
    if (viewName === 'foreign-scout') renderForeignScout();
    if (viewName === 'simulator') renderSimulator();
    if (viewName === 'postseason') renderPostseason();
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
                    <span class="search-result__info">#${p.number || '-'} ${p.pos} ${p.salary ? p.salary.toFixed(1) + '억' : ''}</span>
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
            results.push({ id, name: p.name, team: p.team, pos: p.position || p.pos || '', number: p.number, salary: p.salary });
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
            <td>${p.name}${p.isForeign ? ' <span style="color:var(--kbo-gold);font-size:10px;">외</span>' : ''}${p.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}</td>
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
            <td>${b.name}${b.isForeign ? ' <span style="color:var(--kbo-gold);font-size:10px;">외</span>' : ''}${b.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}</td>
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
            subTabInj.textContent = `부상 (${injPlayers.length}명)`;
            if (futuresTier === '부상') subTabInj.classList.add('active');
        }
        const displayPlayers = futuresTier === '부상' ? injPlayers : (futuresTier === '군보류' ? milPlayers : (futuresTier === '육성' ? devFutPlayers : regFutPlayers));
        const tierLabel = futuresTier === '부상' ? '부상' : (futuresTier === '군보류' ? '군보류' : (futuresTier === '육성' ? '육성선수' : '퓨처스리그'));
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
            ? (p.isMilitary ? `<td><span style="color:#4A6741;font-size:11px;">복무중</span></td>` : (p.isInjured ? `<td><span style="color:#D97706;font-size:11px;">${p.injuryType || '부상'}<br>${p.injuryRecovery || ''} 복귀</span></td>` : `<td><button class="promote-btn" data-id="${p.id}" data-team="${code}">↑ 등록</button></td>`))
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
            <td>${p.name}${p.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}${p.isForeign ? ' <span style="color:#B3A177;font-size:10px;">외</span>' : ''}${p.isInjured ? ' <span class="injured-badge">부상</span>' : (p.isMilitary ? ' <span class="mil-badge">군보류</span>' : (p.isFutures ? (p.number >= 100 ? ' <span class="dev-badge">육성</span>' : ' <span class="futures-badge">2군</span>') : ''))}</td>
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
            ? (b.isMilitary ? `<td><span style="color:#4A6741;font-size:11px;">복무중</span></td>` : (b.isInjured ? `<td><span style="color:#D97706;font-size:11px;">부상중</span></td>` : `<td><button class="promote-btn" data-id="${b.id}" data-team="${code}">↑ 등록</button></td>`))
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
    document.querySelectorAll('.role-select').forEach(sel => {
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
        if (player.isInjured) return `부상 선수 — ${player.injuryType || '부상'} (복귀: ${player.injuryRecovery || '미정'})`;
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

    // 시즌 성적 (3탭)
    const statsEl = document.getElementById('playerModalStats');
    const rs = p.realStats;

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
            <div class="pm-stats-title">2025 시즌 성적</div>
            <div class="pm-no-data">
                ${p.isForeign ? '외국인 선수 — KBO 이전 시즌 기록 없음' :
                  p.isFutures ? '2군 선수 — 1군 시즌 기록 없음' :
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
        { label: '이닝', value: rs.IP },
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
        { label: 'BABIP', value: rs.BABIP.toFixed(3) },
        { label: 'WPA', value: rs.WPA.toFixed(2) },
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
    const players = getTeamPlayers(state, teamCode);

    container.innerHTML = players.map(p => {
        const power = calcPlayerPower(p);
        return `<div class="trade-player-item" data-id="${p.id}" data-side="${side}">
            <div class="trade-player-item__info">
                <span style="color:${powerColor(power)};">●</span>
                <span>${p.name}</span>
                <span style="color:#8899aa; font-size:11px;">${p.position === 'P' ? p.role : p.position}</span>
                <span style="font-size:11px;">(${power.toFixed(1)})</span>
            </div>
            <span class="trade-player-item__salary">${p.salary}억</span>
        </div>`;
    }).join('');

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
        const batch = Math.min(5, remaining);
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
            lockMsg.style.display = 'none';
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

function renderStandings() {
    const standings = getStandings(state);
    const tbody = document.querySelector('#standingsTable tbody');

    tbody.innerHTML = standings.map(s => {
        const rankClass = s.rank <= 3 ? `rank-${s.rank}` : '';
        return `<tr class="${rankClass}">
            <td>${s.rank}</td>
            <td><div class="team-name-cell">
                <img class="team-logo-sm" src="${teamLogo(s.code)}" alt="${s.name}">
                ${s.name}
            </div></td>
            <td>${s.wins}</td>
            <td>${s.losses}</td>
            <td>${formatRate(s.rate)}</td>
            <td>${s.gb}</td>
            <td>${s.pitchPower.toFixed(1)}</td>
            <td>${s.batPower.toFixed(1)}</td>
        </tr>`;
    }).join('');
}

async function runSimulation() {
    const totalPlayed = getTotalGamesPlayed(state);
    const remaining = 144 - totalPlayed;
    if (remaining <= 0 || simRunning) return;

    const batch = Math.min(5, remaining);
    simRunning = true;
    const btn = document.getElementById('btnSimulate');
    btn.disabled = true;
    btn.classList.remove('pulse');
    btn.textContent = '시뮬레이션 중...';

    const progress = document.getElementById('simProgress');
    progress.style.display = 'flex';

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

    // Auto-save
    localStorage.setItem('kbo-sim-state', JSON.stringify(state));

    // 외국인 스카우트 미션 체크 (1Q/2Q 완료 시)
    checkForeignMissionTrigger();
}

// ══════════════════════════════════════════
// ██ RECORDS (기록실)
// ══════════════════════════════════════════

function getAllBattersWithStats() {
    return Object.values(state.players).filter(p => p.position !== 'P' && p.realStats && p.realStats.PA >= 100);
}
function getAllPitchersWithStats() {
    return Object.values(state.players).filter(p => p.position === 'P' && p.realStats && p.realStats.IP >= 30);
}

function renderRecordCard(title, players, valueFn, formatFn, moreCallback) {
    const top5 = [...players].sort((a, b) => valueFn(b) - valueFn(a)).slice(0, 5);
    return `<div class="record-card">
        <div class="record-card__title">${title}<button class="record-card__more" onclick="${moreCallback}">자세히 &gt;</button></div>
        <ul class="record-card__list">${top5.map((p, i) => `
            <li class="record-card__item">
                <span class="record-card__rank ${i < 3 ? 'rank-' + (i + 1) : ''}">${i + 1}</span>
                <img class="record-card__team-logo" src="${teamLogo(p.team)}" alt="">
                <span class="record-card__name">${p.name}</span>
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
                <span class="record-card__name">${p.name}</span>
                <span class="record-card__value">${formatFn(valueFn(p))}</span>
            </li>
        `).join('')}</ul>
    </div>`;
}

const fmt3 = v => v.toFixed(3);
const fmt2 = v => v.toFixed(2);
const fmt1 = v => v.toFixed(1);
const fmtInt = v => Math.round(v);

function renderBatterRecords() {
    const batters = getAllBattersWithStats();
    const grid = document.getElementById('batterTop5Grid');
    if (!batters.length) { grid.innerHTML = '<div class="pm-no-data">규정타석(100PA) 이상 타자가 없습니다.</div>'; return; }

    grid.innerHTML = [
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

function renderPitcherRecords() {
    const pitchers = getAllPitchersWithStats();
    const grid = document.getElementById('pitcherTop5Grid');
    if (!pitchers.length) { grid.innerHTML = '<div class="pm-no-data">규정이닝(30IP) 이상 투수가 없습니다.</div>'; return; }

    grid.innerHTML = [
        renderRecordCardAsc('평균자책 (ERA)', pitchers, p => p.realStats.ERA, fmt2, "showFullPitcherRecord('ERA')"),
        renderRecordCard('승리 (W)', pitchers, p => p.realStats.W, fmtInt, "showFullPitcherRecord('W')"),
        renderRecordCard('삼진 (SO)', pitchers, p => p.realStats.SO, fmtInt, "showFullPitcherRecord('SO')"),
        renderRecordCard('세이브 (S)', pitchers, p => p.realStats.S, fmtInt, "showFullPitcherRecord('S')"),
        renderRecordCard('홀드 (HLD)', pitchers, p => p.realStats.HLD, fmtInt, "showFullPitcherRecord('HLD')"),
        renderRecordCardAsc('WHIP', pitchers, p => p.realStats.WHIP, fmt2, "showFullPitcherRecord('WHIP')"),
        renderRecordCardAsc('FIP', pitchers, p => p.realStats.FIP, fmt2, "showFullPitcherRecord('FIP')"),
        renderRecordCard('WAR', pitchers, p => p.realStats.WAR, fmt2, "showFullPitcherRecord('WAR')"),
        renderRecordCard('이닝 (IP)', pitchers, p => p.realStats.IP, fmt1, "showFullPitcherRecord('IP')"),
        renderRecordCard('WPA', pitchers, p => p.realStats.WPA, fmt2, "showFullPitcherRecord('WPA')"),
    ].join('');
}

function showFullBatterRecord(stat) {
    const batters = getAllBattersWithStats();
    const asc = false;
    const sorted = [...batters].sort((a, b) => asc ? (a.realStats[stat] - b.realStats[stat]) : (b.realStats[stat] - a.realStats[stat]));
    const container = document.getElementById('batterFullRecords');
    const formatVal = v => typeof v === 'number' ? (v < 1 && v > -1 && stat !== 'WAR' && stat !== 'wRC+' ? v.toFixed(3) : Number.isInteger(v) ? v : v.toFixed(2)) : v;

    container.innerHTML = `
        <h3 style="margin-bottom:8px;">${stat} 순위</h3>
        <button class="btn btn--sm" onclick="document.getElementById('batterFullRecords').style.display='none'" style="margin-bottom:12px;">닫기</button>
        <table class="player-table records-full-table">
            <thead><tr><th>순위</th><th>팀</th><th>이름</th><th>포지션</th><th>${stat}</th><th>G</th><th>PA</th><th>AVG</th><th>HR</th><th>OPS</th></tr></thead>
            <tbody>${sorted.map((p, i) => {
                const rs = p.realStats;
                return `<tr><td>${i + 1}</td><td><img src="${teamLogo(p.team)}" style="width:18px;height:18px;vertical-align:middle"></td><td style="font-weight:600">${p.name}</td><td>${p.position}</td><td style="font-weight:700;color:var(--accent)">${formatVal(rs[stat])}</td><td>${rs.G}</td><td>${rs.PA}</td><td>${rs.AVG.toFixed(3)}</td><td>${rs.HR}</td><td>${rs.OPS.toFixed(3)}</td></tr>`;
            }).join('')}</tbody>
        </table>`;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showFullPitcherRecord(stat) {
    const pitchers = getAllPitchersWithStats();
    const asc = ['ERA', 'WHIP', 'FIP'].includes(stat);
    const sorted = [...pitchers].sort((a, b) => asc ? (a.realStats[stat] - b.realStats[stat]) : (b.realStats[stat] - a.realStats[stat]));
    const container = document.getElementById('pitcherFullRecords');
    const formatVal = v => typeof v === 'number' ? (Number.isInteger(v) ? v : v.toFixed(2)) : v;

    container.innerHTML = `
        <h3 style="margin-bottom:8px;">${stat} 순위</h3>
        <button class="btn btn--sm" onclick="document.getElementById('pitcherFullRecords').style.display='none'" style="margin-bottom:12px;">닫기</button>
        <table class="player-table records-full-table">
            <thead><tr><th>순위</th><th>팀</th><th>이름</th><th>역할</th><th>${stat}</th><th>G</th><th>IP</th><th>ERA</th><th>SO</th><th>WHIP</th></tr></thead>
            <tbody>${sorted.map((p, i) => {
                const rs = p.realStats;
                return `<tr><td>${i + 1}</td><td><img src="${teamLogo(p.team)}" style="width:18px;height:18px;vertical-align:middle"></td><td style="font-weight:600">${p.name}</td><td>${p.role || '-'}</td><td style="font-weight:700;color:var(--accent)">${formatVal(rs[stat])}</td><td>${rs.G}</td><td>${rs.IP}</td><td>${rs.ERA.toFixed(2)}</td><td>${rs.SO}</td><td>${rs.WHIP.toFixed(2)}</td></tr>`;
            }).join('')}</tbody>
        </table>`;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function renderTeamRecords() {
    const standings = getStandings(state);
    const container = document.getElementById('teamRecordsContent');
    // 팀 공격/수비 기록
    const teamStats = standings.map(s => {
        const batters = Object.values(state.players).filter(p => p.team === s.code && p.position !== 'P' && p.realStats);
        const pitchers = Object.values(state.players).filter(p => p.team === s.code && p.position === 'P' && p.realStats);
        const avgAVG = batters.length ? batters.reduce((sum, b) => sum + (b.realStats.AVG || 0), 0) / batters.length : 0;
        const totalHR = batters.reduce((sum, b) => sum + (b.realStats.HR || 0), 0);
        const totalSB = batters.reduce((sum, b) => sum + (b.realStats.SB || 0), 0);
        const avgOPS = batters.length ? batters.reduce((sum, b) => sum + (b.realStats.OPS || 0), 0) / batters.length : 0;
        const avgERA = pitchers.filter(p => p.realStats.IP > 0).length ? pitchers.filter(p => p.realStats.IP > 0).reduce((sum, p) => sum + p.realStats.ERA, 0) / pitchers.filter(p => p.realStats.IP > 0).length : 0;
        return { ...s, avgAVG, totalHR, totalSB, avgOPS, avgERA };
    });

    container.innerHTML = `
        <h3 style="margin-bottom:12px;">공격 기록</h3>
        <table class="player-table"><thead><tr><th>순위</th><th>팀</th><th>타율</th><th>홈런</th><th>도루</th><th>OPS</th></tr></thead>
        <tbody>${[...teamStats].sort((a, b) => b.avgAVG - a.avgAVG).map((s, i) => `
            <tr><td>${i + 1}</td><td><div class="team-name-cell"><img class="team-logo-sm" src="${teamLogo(s.code)}" alt="">${s.name}</div></td><td>${s.avgAVG.toFixed(3)}</td><td>${s.totalHR}</td><td>${s.totalSB}</td><td>${s.avgOPS.toFixed(3)}</td></tr>
        `).join('')}</tbody></table>
        <h3 style="margin:20px 0 12px;">수비 기록</h3>
        <table class="player-table"><thead><tr><th>순위</th><th>팀</th><th>평균자책</th><th>승</th><th>패</th><th>승률</th></tr></thead>
        <tbody>${[...teamStats].sort((a, b) => a.avgERA - b.avgERA).map((s, i) => `
            <tr><td>${i + 1}</td><td><div class="team-name-cell"><img class="team-logo-sm" src="${teamLogo(s.code)}" alt="">${s.name}</div></td><td>${s.avgERA.toFixed(2)}</td><td>${s.wins}</td><td>${s.losses}</td><td>${formatRate(s.rate)}</td></tr>
        `).join('')}</tbody></table>
    `;
}

// ══════════════════════════════════════════
// ██ POSTSEASON VIEW
// ══════════════════════════════════════════

let postseasonState = { po1: null, po2: null, ks: null };

function setupPostseasonView() {
    document.getElementById('btnPO1').addEventListener('click', () => runPO(1));
    document.getElementById('btnPO2').addEventListener('click', () => runPO(2));
    document.getElementById('btnKS').addEventListener('click', runKS);
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

async function runPO(matchNum) {
    const seeds = getPostseasonTeams(state);
    let teamA, teamB;

    if (matchNum === 1) {
        teamA = seeds.seed1.code;
        teamB = seeds.seed4.code;
    } else {
        teamA = seeds.seed2.code;
        teamB = seeds.seed3.code;
    }

    const resultEl = document.getElementById(`po${matchNum}Result`);
    const btn = document.getElementById(`btnPO${matchNum}`);
    btn.disabled = true;

    const result = await playoffSeries(state, teamA, teamB, 3, (game) => {
        resultEl.textContent = `${state.teams[teamA].name} ${game.scoreA} - ${game.scoreB} ${state.teams[teamB].name}`;
    });

    resultEl.innerHTML = `<strong>${state.teams[result.winner].name} 승리!</strong> (${result.winsA} - ${result.winsB})`;
    btn.textContent = '완료';

    if (matchNum === 1) postseasonState.po1 = result;
    else postseasonState.po2 = result;

    // Apply fatigue to PO winner
    applyFatigue(state, result.winner);

    // Check if both PO done
    if (postseasonState.po1 && postseasonState.po2) {
        document.getElementById('btnKS').disabled = false;
        document.getElementById('ksTeamA').textContent = state.teams[postseasonState.po1.winner].name;
        document.getElementById('ksTeamB').textContent = state.teams[postseasonState.po2.winner].name;
    }

    showToast(`플레이오프 ${matchNum}: ${state.teams[result.winner].name} 승리!`, 'success');
}

async function runKS() {
    const teamA = postseasonState.po1.winner;
    const teamB = postseasonState.po2.winner;
    const resultEl = document.getElementById('ksResult');
    const btn = document.getElementById('btnKS');
    btn.disabled = true;

    const result = await playoffSeries(state, teamA, teamB, 5, (game) => {
        resultEl.textContent = `${state.teams[teamA].name} ${game.scoreA} - ${game.scoreB} ${state.teams[teamB].name}`;
    });

    postseasonState.ks = result;
    resultEl.innerHTML = `<strong>${state.teams[result.winner].name} 우승!</strong> (${result.winsA} - ${result.winsB})`;
    btn.textContent = '완료';

    // Remove fatigue
    removeFatigue(state, teamA);
    removeFatigue(state, teamB);

    // Champion!
    const championEl = document.getElementById('champion');
    championEl.style.display = 'block';
    document.getElementById('championName').textContent = `🏆 ${state.teams[result.winner].name}`;
    createConfetti();

    // Awards
    const awardsEl = document.getElementById('postseasonAwards');
    awardsEl.style.display = 'block';
    const awards = computeAwards(state);
    awards.unshift({ icon: '🥇', title: '올해의 단장상', team: state.teams[result.winner].name, desc: '한국시리즈 우승' });

    document.getElementById('awardsContent').innerHTML = awards.map(a =>
        `<div class="award-item">
            <span class="award-item__icon">${a.icon}</span>
            <span class="award-item__title">${a.title}</span>
            <span class="award-item__team">${a.team}</span>
            <span style="color:#8899aa; font-size:12px;">${a.desc}</span>
        </div>`
    ).join('');

    showToast(`🏆 ${state.teams[result.winner].name} 한국시리즈 우승!`, 'success');

    // Auto-save
    localStorage.setItem('kbo-sim-state', JSON.stringify(state));
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
            if (p.realStats && p.realStats.pitches) {
                const pitches = p.realStats.pitches;
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

    // 우측: 시즌 성적
    const rs = p.realStats;
    if (rs && p.position !== 'P') {
        statsEl.innerHTML = `
            <div class="pm-ratings-title">2025 시즌 성적</div>
            ${renderClassicStats(rs)}
            <div class="pm-ratings-title" style="margin-top:12px;">세이버메트릭스</div>
            ${renderSaberStats(rs)}
            ${rs.defRAA != null ? `<div class="pm-ratings-title" style="margin-top:12px;">수비</div>${renderDefenseStats(rs, p)}` : ''}
        `;
    } else if (rs && p.position === 'P') {
        statsEl.innerHTML = `
            <div class="pm-ratings-title">2025 시즌 성적</div>
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

// ── 앱 시작 ──
document.addEventListener('DOMContentLoaded', initApp);
