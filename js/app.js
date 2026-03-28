// ===== 메인 앱 컨트롤러 =====

let state = null;
let tradeSelection = { send: [], recv: [] };

// ── 초기화 ──
function initApp() {
    state = loadState();
    updateAllPowerScores();
    setupNav();
    setupTopBarActions();
    renderDashboard();
    setupRosterView();
    setupTradeView();
    setupSimulatorView();
    setupPostseasonView();
    updateQuarterBadge();
    showView('dashboard');
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
    state = generateSampleData();
    updateAllPowerScores();
    renderDashboard();
    renderRoster();
    renderSimulator();
    renderPostseason();
    updateQuarterBadge();
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

    // Refresh view data
    if (actualView === 'dashboard') renderDashboard();
    if (actualView === 'roster') renderRoster();
    if (viewName === 'trade') renderTradeView();
    if (viewName === 'simulator') renderSimulator();
    if (viewName === 'postseason') renderPostseason();
}

function updateQuarterBadge() {
    const badge = document.getElementById('quarterBadge');
    const q = getCurrentQuarter(state);
    if (q > 4) {
        badge.textContent = '시즌 종료';
        badge.style.background = '#22c55e';
    } else if (q === 1 && getCompletedQuarters(state) === 0) {
        badge.textContent = '시즌 시작 전';
    } else {
        badge.textContent = `현재: ${q}Q`;
    }
}

// ── 상단 액션 ──
function setupTopBarActions() {
    document.getElementById('btnSave').addEventListener('click', saveState);
    document.getElementById('btnReset').addEventListener('click', resetState);
    document.getElementById('btnImportCSV').addEventListener('click', () => {
        openCSVModal();
    });

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

// ── CSV 모달 ──
function openCSVModal() {
    const modal = document.getElementById('csvModal');
    modal.style.display = 'flex';
    populateTeamSelect(document.getElementById('csvTeam'), state.teams);
    document.getElementById('csvPreview').textContent = '';
    document.getElementById('btnCsvImport').disabled = true;

    const fileInput = document.getElementById('csvFileInput');
    fileInput.value = '';

    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = parseCSV(text);
            document.getElementById('csvPreview').textContent =
                `${rows.length}행 감지\n\n컬럼: ${rows.length > 0 ? Object.keys(rows[0]).join(', ') : '없음'}\n\n` +
                rows.slice(0, 3).map(r => JSON.stringify(r)).join('\n') + (rows.length > 3 ? '\n...' : '');
            document.getElementById('btnCsvImport').disabled = false;
            fileInput._csvText = text;
        };
        reader.readAsText(file, 'UTF-8');
    };

    document.getElementById('btnCsvCancel').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('btnCsvImport').onclick = () => {
        const text = fileInput._csvText;
        const type = document.getElementById('csvType').value;
        const team = document.getElementById('csvTeam').value;
        const result = importCSVToTeam(text, type, team, state);
        if (result.success) {
            updateAllPowerScores();
            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }
        modal.style.display = 'none';
    };
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
        const [name, num] = c.split('#');
        return `<span class="staff-tag">#${num} ${name}</span>`;
    }).join('') : '';

    // 투수 목록
    const pRows = pitchers.map(p => {
        const pw = (typeof p.power === 'number') ? p.power.toFixed(1) : '-';
        return `<tr>
            <td style="color:var(--text-dim);">${p.number != null ? p.number : '-'}</td>
            <td>${p.name}${p.isForeign ? ' <span style="color:var(--kbo-gold);font-size:10px;">외</span>' : ''}${p.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}</td>
            <td>${p.role || '-'}</td>
            <td style="color:${powerColor(p.power)};">${pw}</td>
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
                <strong>감독</strong> ${staff ? staff.manager : team.manager}
            </div>
            <div class="staff-coaches">${coachList}</div>
        </div>
        <div class="detail-roster-tables">
            <div class="detail-roster-col">
                <h4>투수진 <span class="detail-count">${pitchers.length}명</span></h4>
                <table class="detail-roster-table">
                    <thead><tr><th>#</th><th>이름</th><th>역할</th><th>파워</th><th>연봉</th></tr></thead>
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

function setupRosterView() {
    const select = document.getElementById('rosterTeamSelect');
    populateTeamSelect(select, state.teams);
    select.addEventListener('change', renderRoster);

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
    document.getElementById('tabFirstTeam').textContent = `1군 (${team.roster.length}명)`;
    document.getElementById('tabFutures').textContent = `2군 (${(team.futuresRoster || []).length}명)`;

    // 1군/2군 영역 토글
    const firstSection = document.getElementById('firstTeamSection');
    const futuresSection = document.getElementById('futuresSection');
    if (rosterTier === '2군') {
        firstSection.style.display = 'none';
        futuresSection.style.display = 'block';
        const futPlayers = getTeamFuturesPlayers(state, code);
        document.getElementById('futuresInfo').innerHTML = futPlayers.length > 0
            ? `퓨처스리그 등록 선수 <strong>${futPlayers.length}명</strong> (투수 ${futPlayers.filter(p=>p.position==='P').length}명 / 야수 ${futPlayers.filter(p=>p.position!=='P').length}명)`
            : '<em>2군 등록 선수가 없습니다. 나중에 추가할 수 있습니다.</em>';
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
        allPlayers = getTeamFuturesPlayers(state, code);
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
            ? `<td><button class="promote-btn" data-id="${p.id}" data-team="${code}">↑ 등록</button></td>`
            : `<td><button class="demote-btn" data-id="${p.id}" data-team="${code}">↓ 말소</button></td>`;
        const roleSelect = `<select class="role-select" data-id="${p.id}">
            <option value="선발" ${p.role==='선발'?'selected':''}>선발</option>
            <option value="중계" ${p.role==='중계'?'selected':''}>중계</option>
            <option value="마무리" ${p.role==='마무리'?'selected':''}>마무리</option>
        </select>`;
        return `<tr data-player-id="${p.id}">
            <td style="color:var(--text-dim);">${p.number != null ? p.number : '-'}</td>
            <td>${p.name}${p.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}${p.isForeign ? ' <span style="color:#B3A177;font-size:10px;">외</span>' : ''}${p.isFutures ? ' <span class="futures-badge">2군</span>' : ''}</td>
            <td>${roleSelect}</td>
            <td style="font-size:11px;color:#8899aa;">${p.throwBat || '-'}</td>
            <td style="font-size:11px;">${p.age != null ? p.age + '세' : '-'}</td>
            <td>${p.stats.IVB}</td>
            <td>${p.stats.VAA}</td>
            <td>${p.stats['CSW%']}</td>
            <td>${p.stats.FIP}</td>
            <td>${p.stats.ERA}</td>
            <td><div class="power-cell">
                <div class="power-mini-bar"><div class="power-mini-bar__fill" style="width:${p.power}%; background:${powerColor(p.power)};"></div></div>
                <span>${p.power.toFixed(1)}</span>
            </div></td>
            <td>${p.salary}억</td>
            ${actionBtn}
        </tr>`;
    }).join('');

    const bTbody = document.querySelector('#batterTable tbody');
    bTbody.innerHTML = batters.map(b => {
        const actionBtn = rosterTier === '2군'
            ? `<td><button class="promote-btn" data-id="${b.id}" data-team="${code}">↑ 등록</button></td>`
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
            <td>${b.name}${b.isFranchiseStar ? ' <span class="franchise-star-badge">★</span>' : ''}${b.isForeign ? ' <span style="color:#B3A177;font-size:10px;">외</span>' : ''}${b.isFutures ? ' <span class="futures-badge">2군</span>' : ''}</td>
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
        desc.textContent = `${player.name}을(를) 1군에 등록합니다. 1군에서 말소할 선수를 선택하세요.`;
        swapModalEl.style.borderTop = '3px solid #00AEEF';
    } else {
        title.textContent = `1군 말소: ${player.name}`;
        desc.textContent = `${player.name}을(를) 말소합니다. 퓨처스에서 등록할 선수를 선택하세요.`;
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
    const { mode, teamCode, tab } = swapModalState;
    const listEl = document.getElementById('swapList');

    let candidates;
    if (mode === 'promote') {
        // 1군 선수 목록에서 고르기 (말소 대상)
        candidates = getTeamPlayers(state, teamCode);
    } else {
        // 2군 선수 목록에서 고르기 (등록 대상)
        candidates = getTeamFuturesPlayers(state, teamCode);
    }

    // 탭 필터
    if (tab === 'pitcher') {
        candidates = candidates.filter(p => p.position === 'P');
    } else {
        candidates = candidates.filter(p => p.position !== 'P');
    }

    if (candidates.length === 0) {
        listEl.innerHTML = '<div class="swap-empty">해당 포지션 선수가 없습니다.</div>';
        return;
    }

    const header = `<div class="swap-player-row swap-header">
        <span class="sp-no">번호</span>
        <span class="sp-name">이름</span>
        <span class="sp-pos">포지션</span>
        <span class="sp-tb">투타</span>
        <span class="sp-ovr">OVR</span>
        <span class="sp-salary">연봉</span>
    </div>`;
    listEl.innerHTML = header + candidates.map(p => {
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
    document.getElementById('playerModalHeader').innerHTML = `
        <img class="pm-team-logo" src="${teamLogo(p.team)}" alt="${teamName}">
        <div class="pm-number" style="color:${teamColor};">${p.number != null ? '#' + p.number : ''}</div>
        <div class="pm-info">
            <div class="pm-name">${p.name}</div>
            <div class="pm-meta">
                <span>${teamName}</span>
                <span>${p.position === 'P' ? '투수 (' + (p.role || '') + ')' : p.position}</span>
                ${p.throwBat ? `<span>${p.throwBat}</span>` : ''}
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
            <div class="pm-ovr-row">
                <span class="pm-ovr-label">OVR</span>
                <span class="pm-ovr-value" style="color:${ratingColor(p.ovr)};">${p.ovr}</span>
            </div>
        `;
    } else if (p.position === 'P') {
        const pw = calcPlayerPower(p);
        ratingsEl.innerHTML = `
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
        ratingsEl.innerHTML = '';
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
        statsEl.innerHTML = `<div class="pm-stats-title">2025 시즌 성적</div><div class="pm-no-data">투수 시즌 성적은 추후 업데이트됩니다.</div>`;
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
        { label: '타율', value: rs.AVG.toFixed(3) },
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
        if (label === 'wRC+') return val >= 130 ? '#22c55e' : val >= 100 ? '#00AEEF' : val >= 80 ? '#B3A177' : '#ED1C24';
        if (label === 'WAR') return val >= 4 ? '#22c55e' : val >= 2 ? '#4ade80' : val >= 1 ? '#00AEEF' : val >= 0 ? '#B3A177' : '#ED1C24';
        if (label === 'OPS') return val >= .900 ? '#22c55e' : val >= .750 ? '#00AEEF' : val >= .650 ? '#B3A177' : '#ED1C24';
        return '#e8edf2';
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
}

function renderSimulator() {
    const currentQ = getCurrentQuarter(state);
    const completedQ = getCompletedQuarters(state);

    // Quarter buttons
    document.querySelectorAll('.quarter-btn').forEach(btn => {
        const q = parseInt(btn.dataset.q);
        btn.classList.remove('current', 'completed');
        if (q < currentQ && completedQ >= q) btn.classList.add('completed');
        if (q === currentQ && currentQ <= 4) btn.classList.add('current');
    });

    // Sim button
    const btn = document.getElementById('btnSimulate');
    const lockMsg = document.getElementById('simLockMsg');

    if (currentQ > 4) {
        btn.disabled = true;
        btn.textContent = '시즌 종료';
        btn.classList.remove('pulse');
        lockMsg.style.display = 'none';
    } else {
        const canSim = canSimulateAll(state);
        btn.disabled = !canSim.valid || simRunning;
        btn.textContent = simRunning ? '시뮬레이션 중...' : `${currentQ}Q 시뮬레이션 실행`;

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
    const currentQ = getCurrentQuarter(state);
    if (currentQ > 4 || simRunning) return;

    simRunning = true;
    const btn = document.getElementById('btnSimulate');
    btn.disabled = true;
    btn.classList.remove('pulse');
    btn.textContent = '시뮬레이션 중...';

    const progress = document.getElementById('simProgress');
    progress.style.display = 'flex';

    await simulateQuarter(state, currentQ, (game, total) => {
        const pct = (game / total) * 100;
        document.getElementById('simFill').style.width = pct + '%';
        document.getElementById('simText').textContent = `${game} / ${total} 경기`;
        renderStandings();
    });

    simRunning = false;
    progress.style.display = 'none';
    updateQuarterBadge();
    renderSimulator();
    showToast(`${currentQ}Q 시뮬레이션 완료! (${currentQ * 36}경기 누적)`, 'success');

    // Auto-save
    localStorage.setItem('kbo-sim-state', JSON.stringify(state));
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

// ── 앱 시작 ──
document.addEventListener('DOMContentLoaded', initApp);
