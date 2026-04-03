// =============================================
// 로그인 / 권한 / 관리 패널
// =============================================

// ── 로그인 탭 전환 ──
function switchLoginTab(tab) {
    document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.login-tab-content').forEach(c => c.classList.remove('active'));

    if (tab === 'create') {
        document.querySelectorAll('.login-tab')[1].classList.add('active');
        document.getElementById('loginTabCreate').classList.add('active');
    } else {
        document.querySelectorAll('.login-tab')[0].classList.add('active');
        document.getElementById('loginTabJoin').classList.add('active');
    }
    document.getElementById('loginError').textContent = '';
}

// ── 접속 코드 로그인 ──
async function handleLogin() {
    const code = document.getElementById('loginCode').value.trim();
    if (!code) { showLoginError('코드를 입력해주세요.'); return; }

    showLoginLoading(true);
    showLoginError('');

    try {
        // 교사 코드인지 확인
        try {
            await joinAsAdmin(code);
            onLoginSuccess();
            return;
        } catch (e) {
            // 교사 코드가 아님 → 학생 코드 시도
        }

        // 학생 팀 코드 확인
        await joinAsStudent(code);
        onLoginSuccess();
    } catch (e) {
        showLoginError('올바르지 않은 코드입니다. 교사에게 확인해주세요.');
    } finally {
        showLoginLoading(false);
    }
}

// ── 교실 생성 ──
async function handleCreateClassroom() {
    const name = document.getElementById('createName').value.trim();
    const adminCode = document.getElementById('createAdminCode').value.trim();

    if (!name) { showLoginError('교실 이름을 입력해주세요.'); return; }
    if (!adminCode || adminCode.length < 4) { showLoginError('관리자 코드는 4자 이상이어야 합니다.'); return; }

    showLoginLoading(true);
    showLoginError('');

    try {
        const classroom = await createClassroom(name, adminCode);
        // 생성 후 바로 교사로 접속
        await joinAsAdmin(adminCode);
        // 초기 게임 데이터 세팅
        await initializeClassroomData();
        onLoginSuccess();
    } catch (e) {
        showLoginError('교실 생성 실패: ' + e.message);
    } finally {
        showLoginLoading(false);
    }
}

// ── 교실 초기 데이터 세팅 ──
async function initializeClassroomData() {
    // 현재 앱의 초기 state를 생성하여 각 팀별로 Supabase에 저장
    const initState = generateSampleData();

    for (const teamCode of Object.keys(initState.teams)) {
        const team = initState.teams[teamCode];
        const teamPlayers = {};
        const rosterIds = team.roster || [];

        // 이 팀 소속 선수 데이터 추출
        rosterIds.forEach(id => {
            if (initState.players[id]) {
                teamPlayers[id] = initState.players[id];
            }
        });

        await saveGameState(teamCode, {
            roster_json: rosterIds,
            players_json: teamPlayers,
            season_record: team.seasonRecord || { q1:{wins:0,losses:0}, q2:{wins:0,losses:0}, q3:{wins:0,losses:0}, q4:{wins:0,losses:0} },
            finance_json: team.finance || {},
            trade_history: [],
            lineup_json: {},
        });
    }
}

// ── 로그인 성공 후 처리 ──
function onLoginSuccess() {
    // 로그인 화면 숨기기
    document.getElementById('loginScreen').style.display = 'none';

    // 메인 UI 보이기
    document.querySelector('.top-bar').style.display = '';
    document.getElementById('teamSidebar').style.display = '';

    // 세션 배지 표시
    const badge = document.getElementById('sessionBadge');
    badge.style.display = 'inline-flex';
    document.getElementById('btnLogout').style.display = '';

    if (isAdmin()) {
        badge.textContent = '관리자';
        badge.className = 'session-badge session-badge--admin';
        document.getElementById('btnAdminPanel').style.display = '';
    } else {
        const teamName = KBO_TEAMS.find(t => t.code === getMyTeam())?.name || getMyTeam();
        badge.textContent = teamName;
        badge.className = 'session-badge session-badge--student';
    }

    // 권한에 따른 UI 제어
    applyPermissions();

    // 앱 초기화
    initApp();

    // Realtime 구독 시작
    subscribeRealtime({
        onGameStateChange: handleRealtimeGameState,
        onTeamSlotChange: handleRealtimeTeamSlot,
        onActivityLog: handleRealtimeActivity,
        onSimResult: handleRealtimeSimResult,
        onClassroomChange: handleRealtimeClassroom,
    });
}

// ── 외국인 스카우트 탭 잠금 (학생: 1Q 완료 후 해제) ──
function applyForeignScoutLock() {
    if (typeof isAdmin === 'function' && isAdmin()) return; // 교사는 항상 열림

    const fsNav = document.getElementById('navForeignScout');
    if (!fsNav) return;

    // 1Q(36경기) 완료 여부 확인
    const totalPlayed = (typeof getTotalGamesPlayed === 'function' && state)
        ? getTotalGamesPlayed(state) : 0;
    const q1Done = totalPlayed >= 36;

    if (!q1Done) {
        fsNav.classList.add('nav-btn--locked');
        fsNav.innerHTML = '<span style="margin-right:4px;">&#x1F512;</span>외국인 스카우트';
        fsNav.dataset.locked = 'true';
        fsNav.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showToast('1Q 시뮬레이션이 완료된 후 외국인 스카우트가 열립니다.');
        };
    } else {
        fsNav.classList.remove('nav-btn--locked');
        fsNav.textContent = '외국인 스카우트';
        fsNav.dataset.locked = 'false';
        fsNav.onclick = null;
    }
}

// ── 팀 조작 권한 체크 (학생은 자기 팀만) ──
function guardTeamAction(teamCode, actionName) {
    if (!isStudent()) return true; // 교사는 항상 허용
    if (session.teamCode === teamCode) return true;
    showToast(`다른 팀의 ${actionName}은(는) 변경할 수 없습니다.`);
    return false;
}

// ── 팀 드롭다운 제한 (학생: 자기 팀 고정) ──
function lockTeamSelectors() {
    if (!isStudent()) return;
    const myTeam = getMyTeam();

    // 로스터 팀 선택
    const rosterSel = document.getElementById('rosterTeamSelect');
    if (rosterSel) { rosterSel.value = myTeam; rosterSel.disabled = true; }

    // 뎁스차트 팀 선택
    const dcSel = document.getElementById('dcTeamSelect');
    if (dcSel) { dcSel.value = myTeam; dcSel.disabled = true; }

    // 트레이드: 보내는 팀 고정
    const tradeSel = document.getElementById('tradeSendTeam');
    if (tradeSel) { tradeSel.value = myTeam; tradeSel.disabled = true; }
}

// ── 권한에 따른 UI 제어 ──
function applyPermissions() {
    if (isStudent()) {
        // 학생: 시뮬레이션 실행 버튼 비활성화
        const simBtn = document.getElementById('btnSimulate');
        if (simBtn) {
            simBtn.disabled = true;
            simBtn.title = '시뮬레이션은 교사만 실행할 수 있습니다';
            simBtn.style.opacity = '0.4';
            simBtn.style.cursor = 'not-allowed';
        }

        // 학생: 사이드바에서 자기 팀만 선택 가능
        // (다른 팀은 볼 수는 있지만 수정 불가 - trade.js, foreign-scout.js에서 체크)

        // 학생: 외국인 스카우트 탭 - 1Q 완료 전까지 잠금
        applyForeignScoutLock();

        // 학생: 관리 버튼 숨김
        document.getElementById('btnAdminPanel').style.display = 'none';

        // 학생: 초기화 버튼 숨김
        document.getElementById('btnReset').style.display = 'none';

        // 학생: 팀 드롭다운 자기 팀 고정 (여러 타이밍에 실행)
        setTimeout(lockTeamSelectors, 300);
        setTimeout(lockTeamSelectors, 1000);
        setTimeout(lockTeamSelectors, 2000);

        // MutationObserver로 드롭다운 재생성 시에도 잠금 유지
        const observer = new MutationObserver(() => lockTeamSelectors());
        observer.observe(document.body, { childList: true, subtree: true });
        // 5초 후 observer 해제 (초기 렌더 완료)
        setTimeout(() => observer.disconnect(), 5000);
    }

    if (isAdmin()) {
        // 교사: 모든 기능 활성화 (기본값)
    }
}

// ── 관리 패널 렌더링 ──
async function renderAdminPanel() {
    if (!isAdmin()) return;

    // 교실 정보
    try {
        const classroom = await loadClassroom();
        const infoGrid = document.getElementById('adminClassroomInfo');
        infoGrid.innerHTML = `
            <div class="admin-info-item"><label>교실 이름</label><span>${classroom.name}</span></div>
            <div class="admin-info-item"><label>관리자 코드</label><span>${classroom.admin_code}</span></div>
            <div class="admin-info-item"><label>현재 분기</label><span>${classroom.season_phase === 'pre' ? '시작 전' : classroom.season_phase.toUpperCase()}</span></div>
            <div class="admin-info-item"><label>생성일</label><span>${new Date(classroom.created_at).toLocaleDateString('ko-KR')}</span></div>
        `;
    } catch (e) { console.error(e); }

    // 팀 배정 현황
    try {
        const slots = await loadTeamSlots();
        const tbody = document.querySelector('#adminTeamTable tbody');
        tbody.innerHTML = slots.map(slot => {
            const teamInfo = KBO_TEAMS.find(t => t.code === slot.team_code);
            const teamName = teamInfo ? teamInfo.name : slot.team_code;
            return `<tr>
                <td><strong>${teamName}</strong></td>
                <td><input type="text" class="admin-code-input" value="${slot.access_code}" onchange="handleSlotCodeChange('${slot.team_code}', this.value)" style="width:110px;font-family:monospace;"></td>
                <td><input type="text" value="${slot.display_name || ''}" onchange="handleSlotNameChange('${slot.team_code}', this.value)" placeholder="미지정"></td>
                <td><span class="badge-ai badge-ai--${slot.is_ai}">${slot.is_ai ? 'AI' : '학생'}</span></td>
                <td><button class="toggle-btn" onclick="handleSlotLockToggle('${slot.team_code}', ${!slot.is_locked})">${slot.is_locked ? '잠금' : '열림'}</button></td>
            </tr>`;
        }).join('');
    } catch (e) { console.error(e); }

    // 활동 로그
    try {
        const logs = await loadActivityLog(30);
        const logDiv = document.getElementById('adminActivityLog');
        if (logs.length === 0) {
            logDiv.innerHTML = '<p style="color:var(--text-muted);font-size:12px;">아직 활동이 없습니다.</p>';
        } else {
            logDiv.innerHTML = logs.map(log => {
                const time = new Date(log.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                const actionLabels = {
                    login: '접속', trade: '트레이드', recruit: '영입',
                    lineup: '라인업', sim: '시뮬레이션', chat: '채팅'
                };
                const label = actionLabels[log.action_type] || log.action_type;
                const detail = log.detail?.role ? `(${log.detail.role})` : '';
                return `<div class="admin-log-item">
                    <span class="log-time">${time}</span>
                    <span class="log-team">${log.team_code}</span>
                    <span class="log-msg">${label} ${detail}</span>
                </div>`;
            }).join('');
        }
    } catch (e) { console.error(e); }
}

// ── 관리 패널 액션 ──
async function handleSlotCodeChange(teamCode, newCode) {
    const trimmed = newCode.trim();
    if (!trimmed || trimmed.length < 2) { alert('코드는 2자 이상이어야 합니다.'); renderAdminPanel(); return; }
    try {
        await updateTeamSlot(teamCode, { access_code: trimmed });
        showToast(`${teamCode} 팀 코드가 "${trimmed}"로 변경되었습니다.`);
    } catch (e) { alert('코드 변경 실패: ' + e.message); renderAdminPanel(); }
}

async function handleSlotNameChange(teamCode, newName) {
    try {
        await updateTeamSlot(teamCode, { display_name: newName });
    } catch (e) { alert(e.message); }
}

async function handleSlotLockToggle(teamCode, locked) {
    try {
        await updateTeamSlot(teamCode, { is_locked: locked });
        renderAdminPanel();
    } catch (e) { alert(e.message); }
}

// ── Realtime 이벤트 핸들러 ──
function handleRealtimeGameState(payload) {
    // 다른 팀의 데이터 변경 시 로컬 state + UI 갱신
    if (payload.new) {
        const teamCode = payload.new.team_code;
        // 시즌 기록 동기화 (시뮬레이션 결과 반영)
        if (payload.new.season_record && typeof state !== 'undefined' && state.teams && state.teams[teamCode]) {
            state.teams[teamCode].seasonRecord = payload.new.season_record;
        }
        // 대시보드, 순위표 등 갱신
        if (typeof renderDashboard === 'function') renderDashboard();
        if (typeof renderStandings === 'function') renderStandings();
    }
}

function handleRealtimeTeamSlot(payload) {
    // 팀 슬롯 변경 시 관리 패널 갱신
    if (isAdmin()) renderAdminPanel();
}

function handleRealtimeActivity(payload) {
    // 새 활동 로그 → 관리 패널 갱신
    if (isAdmin()) renderAdminPanel();

    // 뉴스 피드에도 표시 가능
    if (payload.new && payload.new.action_type === 'trade') {
        showToast(`${payload.new.team_code} 트레이드 완료!`);
    }
}

function handleRealtimeSimResult(payload) {
    // 시뮬레이션 결과 → 순위표 갱신
    const quarter = payload.new?.quarter;
    showToast(`시뮬레이션 결과가 업데이트되었습니다!${quarter ? ` (Q${quarter})` : ''}`);
    if (typeof renderDashboard === 'function') renderDashboard();
    if (typeof renderStandings === 'function') renderStandings();
    if (typeof renderSimulator === 'function') renderSimulator();
    if (typeof updateQuarterBadge === 'function') updateQuarterBadge();
    // 1Q 완료 시 외국인 스카우트 잠금 해제 체크
    applyForeignScoutLock();
}

function handleRealtimeClassroom(payload) {
    // 교실 상태 변경 (시뮬레이션 잠금 등)
    if (payload.new && payload.new.is_simulating) {
        showToast('시뮬레이션 진행 중... 잠시 기다려주세요.');
    }
}

// ── 토스트 메시지 ──
function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ── UI 헬퍼 ──
function showLoginError(msg) {
    document.getElementById('loginError').textContent = msg;
}

function showLoginLoading(show) {
    document.getElementById('loginLoading').style.display = show ? 'block' : 'none';
}

// ── 앱 시작점 ──
// 기존 DOMContentLoaded에서 initApp()을 바로 호출하던 것을
// 세션 복원 → 로그인 화면 분기로 변경
document.addEventListener('DOMContentLoaded', async () => {
    // 테마 먼저 적용 (로그인 화면에도 적용)
    const savedTheme = localStorage.getItem('kbo-sim-theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 저장된 세션 복원 시도
    const restored = await restoreSession();
    if (restored) {
        onLoginSuccess();
    } else {
        // 로그인 화면 표시
        document.getElementById('loginScreen').style.display = 'flex';
    }

    // Enter키로 로그인
    document.getElementById('loginCode')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
});

