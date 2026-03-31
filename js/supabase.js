// =============================================
// GM-TSHERPA Supabase 클라이언트 모듈
// =============================================

const SUPABASE_URL = 'https://xfkujfnemjxtrvvpftyr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gPNlymSMXkfvv20b-rr_ew_9yrnvanu';

// Supabase 클라이언트 초기화
// UMD 빌드가 window.supabase를 점유하므로 별도 변수명 사용
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── 현재 세션 정보 ──
const session = {
    classroomId: null,
    teamCode: null,        // null이면 교사(전체), 'LG' 등이면 학생
    role: null,            // 'admin' | 'student'
    displayName: '',
    isAI: false,
};

// =============================================
// 1. 교실 관리
// =============================================

/** 새 교실 생성 (교사 전용) */
async function createClassroom(name, adminCode) {
    const { data, error } = await db
        .from('classrooms')
        .insert({ name, admin_code: adminCode })
        .select()
        .single();

    if (error) throw new Error('교실 생성 실패: ' + error.message);

    // 10개 팀 슬롯 자동 생성
    const teamCodes = ['LG', '두산', '롯데', 'KIA', 'KT', '한화', 'NC', 'SSG', '키움', '삼성'];
    const slots = teamCodes.map(code => ({
        classroom_id: data.id,
        team_code: code,
        access_code: code + adminCode.replace(/[^0-9]/g, '').slice(-4),  // 예: LG2026
        is_ai: true,
        display_name: '',
    }));

    const { error: slotError } = await db.from('team_slots').insert(slots);
    if (slotError) throw new Error('팀 슬롯 생성 실패: ' + slotError.message);

    // 10개 팀 game_state 초기 생성
    const gameStates = teamCodes.map(code => ({
        classroom_id: data.id,
        team_code: code,
        roster_json: [],
        players_json: {},
        season_record: { q1:{wins:0,losses:0}, q2:{wins:0,losses:0}, q3:{wins:0,losses:0}, q4:{wins:0,losses:0} },
        finance_json: {},
        trade_history: [],
        lineup_json: {},
    }));
    await db.from('game_state').insert(gameStates);

    // 10개 팀 foreign_scout_state 초기 생성
    const scoutStates = teamCodes.map(code => ({
        classroom_id: data.id,
        team_code: code,
        recruited: [],
    }));
    await db.from('foreign_scout_state').insert(scoutStates);

    return data;
}

/** 교사 코드로 교실 접속 */
async function joinAsAdmin(adminCode) {
    const { data, error } = await db
        .from('classrooms')
        .select('*')
        .eq('admin_code', adminCode)
        .single();

    if (error || !data) throw new Error('교사 코드가 올바르지 않습니다.');

    session.classroomId = data.id;
    session.role = 'admin';
    session.teamCode = null;
    session.displayName = '관리자';

    // 세션 저장
    localStorage.setItem('kbo-session', JSON.stringify(session));

    await logActivity(null, 'login', { role: 'admin' });
    return data;
}

/** 학생 팀 코드로 교실 접속 */
async function joinAsStudent(accessCode) {
    const { data, error } = await db
        .from('team_slots')
        .select('*, classrooms(*)')
        .eq('access_code', accessCode)
        .single();

    if (error || !data) throw new Error('팀 코드가 올바르지 않습니다.');

    session.classroomId = data.classroom_id;
    session.teamCode = data.team_code;
    session.role = 'student';
    session.displayName = data.display_name || data.team_code;

    // 이 팀은 더 이상 AI가 아님
    await db
        .from('team_slots')
        .update({ is_ai: false })
        .eq('id', data.id);

    // 세션 저장
    localStorage.setItem('kbo-session', JSON.stringify(session));

    await logActivity(data.team_code, 'login', { role: 'student', team: data.team_code });
    return data;
}

/** 저장된 세션 복원 */
async function restoreSession() {
    const saved = localStorage.getItem('kbo-session');
    if (!saved) return null;

    try {
        const parsed = JSON.parse(saved);
        Object.assign(session, parsed);

        // 교실이 아직 유효한지 확인
        const { data } = await db
            .from('classrooms')
            .select('id')
            .eq('id', session.classroomId)
            .single();

        if (!data) {
            localStorage.removeItem('kbo-session');
            return null;
        }
        return session;
    } catch (e) {
        localStorage.removeItem('kbo-session');
        return null;
    }
}

/** 로그아웃 */
function logout() {
    localStorage.removeItem('kbo-session');
    session.classroomId = null;
    session.teamCode = null;
    session.role = null;
    window.location.reload();
}

// =============================================
// 2. 게임 상태 읽기/쓰기
// =============================================

/** 전체 팀 game_state 조회 */
async function loadAllGameStates() {
    const { data, error } = await db
        .from('game_state')
        .select('*')
        .eq('classroom_id', session.classroomId);

    if (error) throw new Error('게임 상태 로드 실패: ' + error.message);
    return data;
}

/** 특정 팀 game_state 조회 */
async function loadGameState(teamCode) {
    const { data, error } = await db
        .from('game_state')
        .select('*')
        .eq('classroom_id', session.classroomId)
        .eq('team_code', teamCode)
        .single();

    if (error) throw new Error(`${teamCode} 상태 로드 실패: ` + error.message);
    return data;
}

/** 팀 game_state 업데이트 */
async function saveGameState(teamCode, updates) {
    // 권한 체크: 학생은 자기 팀만
    if (session.role === 'student' && session.teamCode !== teamCode) {
        throw new Error('다른 팀의 데이터를 수정할 수 없습니다.');
    }

    const { data, error } = await db
        .from('game_state')
        .update(updates)
        .eq('classroom_id', session.classroomId)
        .eq('team_code', teamCode)
        .select()
        .single();

    if (error) throw new Error(`${teamCode} 저장 실패: ` + error.message);
    return data;
}

/** 전체 팀 game_state 일괄 업데이트 (교사 전용 - 시뮬레이션 결과 등) */
async function saveAllGameStates(statesMap) {
    if (session.role !== 'admin') throw new Error('관리자만 전체 업데이트 가능합니다.');

    const promises = Object.entries(statesMap).map(([teamCode, updates]) =>
        db
            .from('game_state')
            .update(updates)
            .eq('classroom_id', session.classroomId)
            .eq('team_code', teamCode)
    );

    await Promise.all(promises);
}

// =============================================
// 3. 팀 슬롯 관리
// =============================================

/** 전체 팀 슬롯 조회 */
async function loadTeamSlots() {
    const { data, error } = await db
        .from('team_slots')
        .select('*')
        .eq('classroom_id', session.classroomId)
        .order('team_code');

    if (error) throw new Error('팀 슬롯 로드 실패: ' + error.message);
    return data;
}

/** 팀 슬롯 업데이트 (교사: AI 전환, 이름 변경 등) */
async function updateTeamSlot(teamCode, updates) {
    if (session.role !== 'admin') throw new Error('관리자만 팀 설정을 변경할 수 있습니다.');

    const { data, error } = await db
        .from('team_slots')
        .update(updates)
        .eq('classroom_id', session.classroomId)
        .eq('team_code', teamCode)
        .select()
        .single();

    if (error) throw new Error('팀 슬롯 업데이트 실패: ' + error.message);
    return data;
}

// =============================================
// 4. 외국인 스카우트 상태
// =============================================

/** 외국인 스카우트 상태 조회 */
async function loadForeignScoutStateDB(teamCode) {
    const { data, error } = await db
        .from('foreign_scout_state')
        .select('*')
        .eq('classroom_id', session.classroomId)
        .eq('team_code', teamCode)
        .single();

    if (error) return null;
    return data;
}

/** 외국인 스카우트 상태 업데이트 */
async function saveForeignScoutStateDB(teamCode, updates) {
    if (session.role === 'student' && session.teamCode !== teamCode) {
        throw new Error('다른 팀의 스카우트 데이터를 수정할 수 없습니다.');
    }

    const { data, error } = await db
        .from('foreign_scout_state')
        .update(updates)
        .eq('classroom_id', session.classroomId)
        .eq('team_code', teamCode)
        .select()
        .single();

    if (error) throw new Error('스카우트 상태 저장 실패: ' + error.message);
    return data;
}

// =============================================
// 5. 시뮬레이션 결과
// =============================================

/** 시뮬레이션 결과 저장 (교사 전용) */
async function saveSimResult(quarter, standings, detail) {
    if (session.role !== 'admin') throw new Error('관리자만 시뮬레이션을 실행할 수 있습니다.');

    const { data, error } = await db
        .from('sim_results')
        .upsert({
            classroom_id: session.classroomId,
            quarter,
            standings,
            detail_json: detail || {},
        }, { onConflict: 'classroom_id,quarter' })
        .select()
        .single();

    if (error) throw new Error('시뮬레이션 결과 저장 실패: ' + error.message);
    return data;
}

/** 시뮬레이션 결과 조회 */
async function loadSimResults() {
    const { data, error } = await db
        .from('sim_results')
        .select('*')
        .eq('classroom_id', session.classroomId)
        .order('quarter');

    if (error) return [];
    return data;
}

// =============================================
// 6. 활동 로그
// =============================================

/** 활동 로그 기록 */
async function logActivity(teamCode, actionType, detail) {
    await db.from('activity_log').insert({
        classroom_id: session.classroomId,
        team_code: teamCode || 'SYSTEM',
        action_type: actionType,
        detail: detail || {},
    });
}

/** 활동 로그 조회 (최근 N개) */
async function loadActivityLog(limit = 50) {
    const { data, error } = await db
        .from('activity_log')
        .select('*')
        .eq('classroom_id', session.classroomId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return data;
}

// =============================================
// 7. Realtime 구독
// =============================================

const realtimeCallbacks = {
    onGameStateChange: null,
    onTeamSlotChange: null,
    onActivityLog: null,
    onSimResult: null,
    onClassroomChange: null,
    onForeignScoutChange: null,
};

let realtimeChannel = null;

/** Realtime 구독 시작 */
function subscribeRealtime(callbacks = {}) {
    Object.assign(realtimeCallbacks, callbacks);

    if (realtimeChannel) {
        db.removeChannel(realtimeChannel);
    }

    realtimeChannel = db
        .channel('classroom_' + session.classroomId)

        // game_state 변경 감지
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'game_state', filter: `classroom_id=eq.${session.classroomId}` },
            (payload) => {
                if (realtimeCallbacks.onGameStateChange) {
                    realtimeCallbacks.onGameStateChange(payload);
                }
            }
        )

        // team_slots 변경 감지
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'team_slots', filter: `classroom_id=eq.${session.classroomId}` },
            (payload) => {
                if (realtimeCallbacks.onTeamSlotChange) {
                    realtimeCallbacks.onTeamSlotChange(payload);
                }
            }
        )

        // activity_log 새 항목 감지
        .on('postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'activity_log', filter: `classroom_id=eq.${session.classroomId}` },
            (payload) => {
                if (realtimeCallbacks.onActivityLog) {
                    realtimeCallbacks.onActivityLog(payload);
                }
            }
        )

        // sim_results 변경 감지
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'sim_results', filter: `classroom_id=eq.${session.classroomId}` },
            (payload) => {
                if (realtimeCallbacks.onSimResult) {
                    realtimeCallbacks.onSimResult(payload);
                }
            }
        )

        // classroom 상태 변경 감지 (시뮬레이션 잠금 등)
        .on('postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'classrooms', filter: `id=eq.${session.classroomId}` },
            (payload) => {
                if (realtimeCallbacks.onClassroomChange) {
                    realtimeCallbacks.onClassroomChange(payload);
                }
            }
        )

        // foreign_scout_state 변경 감지
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'foreign_scout_state', filter: `classroom_id=eq.${session.classroomId}` },
            (payload) => {
                if (realtimeCallbacks.onForeignScoutChange) {
                    realtimeCallbacks.onForeignScoutChange(payload);
                }
            }
        )

        .subscribe();
}

/** Realtime 구독 해제 */
function unsubscribeRealtime() {
    if (realtimeChannel) {
        db.removeChannel(realtimeChannel);
        realtimeChannel = null;
    }
}

// =============================================
// 8. 유틸리티
// =============================================

/** 권한 체크 헬퍼 */
function isAdmin() { return session.role === 'admin'; }
function isStudent() { return session.role === 'student'; }
function getMyTeam() { return session.teamCode; }
function getClassroomId() { return session.classroomId; }

/** 특정 팀 수정 권한 체크 */
function canEditTeam(teamCode) {
    if (session.role === 'admin') return true;
    if (session.role === 'student' && session.teamCode === teamCode) return true;
    return false;
}

/** 교실 설정 업데이트 (교사 전용) */
async function updateClassroom(updates) {
    if (session.role !== 'admin') throw new Error('관리자만 교실 설정을 변경할 수 있습니다.');

    const { data, error } = await db
        .from('classrooms')
        .update(updates)
        .eq('id', session.classroomId)
        .select()
        .single();

    if (error) throw new Error('교실 설정 변경 실패: ' + error.message);
    return data;
}

/** 교실 정보 조회 */
async function loadClassroom() {
    const { data, error } = await db
        .from('classrooms')
        .select('*')
        .eq('id', session.classroomId)
        .single();

    if (error) throw new Error('교실 정보 로드 실패: ' + error.message);
    return data;
}
