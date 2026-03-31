-- =============================================
-- GM-TSHERPA Supabase Schema
-- Supabase SQL Editor에서 이 파일 전체를 실행하세요
-- =============================================

-- 1. classrooms: 교실 세션 (반별 독립 운영)
CREATE TABLE classrooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                          -- "3학년 2반"
  admin_code TEXT NOT NULL UNIQUE,             -- 교사 접속 코드
  current_quarter INT DEFAULT 0,               -- 0=시작전, 1~4=분기
  season_phase TEXT DEFAULT 'pre',             -- pre/q1/q2/q3/q4/postseason/finished
  is_simulating BOOLEAN DEFAULT FALSE,         -- 시뮬레이션 진행 중 잠금
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. team_slots: 팀 배정 (교실당 10팀)
CREATE TABLE team_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  team_code TEXT NOT NULL,                     -- 'LG', '두산', ...
  access_code TEXT NOT NULL,                   -- 학생 접속 코드 'LG2026'
  display_name TEXT DEFAULT '',                -- '1조', '우리조' 등
  is_ai BOOLEAN DEFAULT TRUE,                 -- AI 자동운영 여부
  is_locked BOOLEAN DEFAULT FALSE,            -- 수정 잠금
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classroom_id, team_code),
  UNIQUE(access_code)
);

-- 3. game_state: 팀별 게임 상태 (핵심 데이터)
CREATE TABLE game_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  team_code TEXT NOT NULL,
  roster_json JSONB NOT NULL DEFAULT '[]',     -- 선수 명단 전체
  players_json JSONB NOT NULL DEFAULT '{}',    -- 선수 상세 데이터
  season_record JSONB NOT NULL DEFAULT '{"q1":{"wins":0,"losses":0},"q2":{"wins":0,"losses":0},"q3":{"wins":0,"losses":0},"q4":{"wins":0,"losses":0}}',
  finance_json JSONB NOT NULL DEFAULT '{}',
  trade_history JSONB NOT NULL DEFAULT '[]',
  lineup_json JSONB NOT NULL DEFAULT '{}',     -- 타선/수비 라인업
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classroom_id, team_code)
);

-- 4. foreign_scout_state: 외국인 스카우트 상태
CREATE TABLE foreign_scout_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  team_code TEXT NOT NULL,
  recruited JSONB NOT NULL DEFAULT '[]',       -- 영입한 외국인 선수 이름 목록
  detailed_report TEXT DEFAULT NULL,           -- 상세리포트 사용한 선수
  mission_choice TEXT DEFAULT NULL,            -- 미션 선택 (A/B)
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classroom_id, team_code)
);

-- 5. activity_log: 활동 로그 (뉴스피드 + 모니터링)
CREATE TABLE activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  team_code TEXT NOT NULL,
  action_type TEXT NOT NULL,                   -- 'trade','recruit','lineup','sim','login','chat'
  detail JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. sim_results: 시뮬레이션 결과 기록 (분기별)
CREATE TABLE sim_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  quarter INT NOT NULL,                        -- 1~4
  standings JSONB NOT NULL DEFAULT '[]',       -- [{team_code, wins, losses, rank}]
  detail_json JSONB NOT NULL DEFAULT '{}',     -- 상세 경기 결과
  simulated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(classroom_id, quarter)
);

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX idx_team_slots_classroom ON team_slots(classroom_id);
CREATE INDEX idx_team_slots_access ON team_slots(access_code);
CREATE INDEX idx_game_state_classroom ON game_state(classroom_id);
CREATE INDEX idx_game_state_team ON game_state(classroom_id, team_code);
CREATE INDEX idx_activity_log_classroom ON activity_log(classroom_id);
CREATE INDEX idx_activity_log_time ON activity_log(created_at DESC);

-- =============================================
-- Row Level Security (RLS) 정책
-- anon 키로 접근하므로 RLS를 열어둠 (교실 코드가 인증 역할)
-- =============================================
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreign_scout_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sim_results ENABLE ROW LEVEL SECURITY;

-- anon 사용자에게 전체 접근 허용 (코드 기반 인증은 앱 레벨에서 처리)
CREATE POLICY "allow_all_classrooms" ON classrooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_team_slots" ON team_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_game_state" ON game_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_foreign_scout" ON foreign_scout_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_activity_log" ON activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_sim_results" ON sim_results FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Realtime 활성화
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE team_slots;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE sim_results;
ALTER PUBLICATION supabase_realtime ADD TABLE classrooms;
ALTER PUBLICATION supabase_realtime ADD TABLE foreign_scout_state;

-- =============================================
-- updated_at 자동 갱신 트리거
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_game_state_updated
  BEFORE UPDATE ON game_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_foreign_scout_updated
  BEFORE UPDATE ON foreign_scout_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
