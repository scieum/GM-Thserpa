// ===== 2025 KBO 개막전 등록 명단 기반 데이터 =====
// 재정 데이터: 2025년 감사보고서 참고

const KBO_SALARY_CAP = 144; // 2026년 기준 (137.1억 × 1.05)
const KBO_SALARY_FLOOR = 61; // 하한선

// ─── 외국인 선수 티어 시스템 ───
// 출신 리그에 따라 5개 티어로 분류, 티어별 능력치 범위·연봉대가 다름
// ovrRange: 내부 20-80 스케일 기준
// salaryRange: 억원 (KRW) 기준 — $1M ≈ 12억원
const FOREIGN_TIERS = {
    T1: {
        label: 'T1', name: 'MLB 출신',
        desc: 'MLB 로스터 경험자 — 검증된 최상위 전력',
        origins: ['MLB'],
        avgOvr: 67, ovrRange: [60, 80],
        salaryRange: [12.0, 25.0],   // $1M+
        color: '#FFD700',            // gold
    },
    T2: {
        label: 'T2', name: 'AAA/NPB/KBO 복귀',
        desc: 'AAA 주전급, NPB 경험자, 또는 KBO 재입국 — 준엘리트',
        origins: ['AAA', 'NPB', 'KBO복귀'],
        avgOvr: 55, ovrRange: [48, 68],
        salaryRange: [6.0, 12.0],    // $0.5M ~ 1M
        color: '#C0C0C0',            // silver
    },
    T3: {
        label: 'T3', name: 'CPBL/중남미',
        desc: 'CPBL(대만), 중남미 리그 출신 — 성장 가능성 있는 중간급',
        origins: ['CPBL', '중남미', '멕시코'],
        avgOvr: 48, ovrRange: [42, 58],
        salaryRange: [2.4, 6.0],     // $0.2M ~ 0.5M
        color: '#CD7F32',            // bronze
    },
    T4: {
        label: 'T4', name: 'AA/쿠바',
        desc: 'AA급 마이너리거 또는 쿠바 출신 — 원석형',
        origins: ['AA', '쿠바'],
        avgOvr: 42, ovrRange: [35, 50],
        salaryRange: [1.2, 3.6],     // $0.1M ~ 0.3M
        color: '#8B6914',            // dark gold
    },
    T5: {
        label: 'T5', name: '독립리그/ABL',
        desc: '독립리그, 호주리그(ABL) 출신 — 저예산 도박형',
        origins: ['독립리그', 'ABL'],
        avgOvr: 35, ovrRange: [30, 42],
        salaryRange: [1.2, 3.6],     // $0.1M ~ 0.3M
        color: '#696969',            // gray
    },
};

// 실제 외국인 선수별 티어·출신 매핑
const FOREIGN_PLAYER_PROFILES = {
    // ── LG ──
    '치리노스':  { tier: 'T1', origin: 'MLB',   note: 'MLB 탬파베이 레이스 출신 선발' },
    '톨허스트':  { tier: 'T2', origin: 'AAA',   note: 'AAA 경험 선발 투수' },
    '오스틴':    { tier: 'T1', origin: 'MLB',   note: 'MLB 경력 파워 타자' },
    '월스':      { tier: 'T2', origin: 'AAA',   note: 'AAA 좌완 불펜' },
    // ── 두산 ──
    '타무라':    { tier: 'T2', origin: 'NPB',   note: 'NPB 출신 중계 투수' },
    '잭로그':    { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '카메론':    { tier: 'T2', origin: 'AAA',   note: 'AAA 외야수' },
    '플렉센':    { tier: 'T1', origin: 'MLB',   note: 'MLB 시애틀 매리너스 출신 선발' },
    // ── 롯데 ──
    '비슬리':    { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '로드리게스': { tier: 'T3', origin: '중남미', note: '도미니카 출신 투수' },
    '쿄야마':    { tier: 'T2', origin: 'NPB',   note: 'NPB 출신 투수' },
    '레이예스':  { tier: 'T3', origin: '중남미', note: '도미니카 출신 외야수' },
    // ── KIA ──
    '올러':      { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '네일':      { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '데일':      { tier: 'T3', origin: '중남미', note: '중남미 출신 내야수' },
    '카스트로':  { tier: 'T3', origin: '중남미', note: '쿠바계 외야수' },
    // ── KT ──
    '스기모토':  { tier: 'T2', origin: 'NPB',   note: 'NPB 출신 투수' },
    '사우어':    { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '보쉴리':    { tier: 'T2', origin: 'AAA',   note: 'AAA 불펜 투수' },
    '힐리어드':  { tier: 'T1', origin: 'MLB',   note: 'MLB 콜로라도 로키스 출신' },
    // ── 한화 ──
    '에르난데스': { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '왕옌청':    { tier: 'T3', origin: 'CPBL',  note: 'CPBL(대만) 출신 좌완 투수' },
    '페라자':    { tier: 'T3', origin: '중남미', note: '베네수엘라 출신 내야수' },
    // ── NC ──
    '토다':      { tier: 'T2', origin: 'NPB',   note: 'NPB 출신 투수' },
    '데이비슨':  { tier: 'T2', origin: 'AAA',   note: 'AAA 내야수' },
    '테일러':    { tier: 'T2', origin: 'AAA',   note: 'AAA 투수' },
    // ── SSG ──
    '베니지아노': { tier: 'T2', origin: 'AAA',   note: 'AAA 좌완 투수' },
    '에레디아':  { tier: 'T3', origin: '중남미', note: '쿠바 출신 외야수' },
    // ── 키움 ──
    '와일스':    { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '유토':      { tier: 'T2', origin: 'NPB',   note: 'NPB 출신 투수' },
    '알칸타라':  { tier: 'T1', origin: 'MLB',   note: 'MLB 경력 투수' },
    '브룩스':    { tier: 'T2', origin: 'AAA',   note: 'AAA 좌타 외야수' },
    // ── 삼성 ──
    '미야지':    { tier: 'T2', origin: 'NPB',   note: 'NPB 출신 투수' },
    '오러클린':  { tier: 'T2', origin: 'AAA',   note: 'AAA 좌완 투수' },
    '후라도':    { tier: 'T2', origin: 'AAA',   note: 'AAA 선발 투수' },
    '디아즈':    { tier: 'T1', origin: 'MLB',   note: 'MLB 경력 내야수' },
};

// 화이트 — 팀별로 다른 선수이므로 팀 코드 기반 조회 필요
const FOREIGN_PLAYER_PROFILES_BY_TEAM = {
    '한화': { '화이트': { tier: 'T2', origin: 'AAA', note: 'AAA 투수' } },
    'SSG':  { '화이트': { tier: 'T2', origin: 'AAA', note: 'AAA 투수' } },
};

// 외국인 선수 프로필 조회 (동명이인 처리 포함)
function getForeignProfile(name, teamCode) {
    // 팀별 동명이인 먼저 체크
    const byTeam = FOREIGN_PLAYER_PROFILES_BY_TEAM[teamCode];
    if (byTeam && byTeam[name]) return byTeam[name];
    // 일반 조회
    return FOREIGN_PLAYER_PROFILES[name] || null;
}

// 티어 정보 반환
function getForeignTierInfo(tierKey) {
    return FOREIGN_TIERS[tierKey] || null;
}

// 티어 기반 외국인 선수 OVR 생성 (실제 기록 없는 경우)
function genForeignOvrByTier(rng, tierKey) {
    const tier = FOREIGN_TIERS[tierKey];
    if (!tier) return 50;
    const [lo, hi] = tier.ovrRange;
    const avg = tier.avgOvr;
    const sd = (hi - lo) / 4; // ±2σ가 범위를 커버
    let ovr = gaussianRandom(rng, avg, sd);
    return Math.round(Math.max(lo, Math.min(hi, ovr)));
}

// 티어 기반 외국인 선수 연봉 생성 (억원)
function genForeignSalaryByTier(rng, tierKey) {
    const tier = FOREIGN_TIERS[tierKey];
    if (!tier) return 3.0;
    const [lo, hi] = tier.salaryRange;
    const mid = (lo + hi) / 2;
    const sd = (hi - lo) / 4;
    let sal = gaussianRandom(rng, mid, sd);
    return Math.round(Math.max(lo, Math.min(hi, sal)) * 10) / 10;
}

// 티어 기반 타자 레이팅 생성 (20-80 스케일)
function genForeignBatterRatingsByTier(rng, tierKey) {
    const tier = FOREIGN_TIERS[tierKey];
    if (!tier) return genForeignBatterRatingsByTier(rng, 'T3');
    const avg = tier.avgOvr;
    const sd = 6;
    return {
        contact: clamp2080(gaussianRandom(rng, avg, sd)),
        power:   clamp2080(gaussianRandom(rng, avg + 3, sd)),  // 외국인 타자는 파워 약간 우위
        eye:     clamp2080(gaussianRandom(rng, avg - 2, sd)),
        speed:   clamp2080(gaussianRandom(rng, avg - 5, sd)),  // 스피드는 상대적으로 낮음
        defense: clamp2080(gaussianRandom(rng, avg - 3, sd)),
    };
}

// 티어 기반 투수 레이팅 생성 (20-80 스케일)
function genForeignPitcherRatingsByTier(rng, tierKey) {
    const tier = FOREIGN_TIERS[tierKey];
    if (!tier) return genForeignPitcherRatingsByTier(rng, 'T3');
    const avg = tier.avgOvr;
    const sd = 6;
    return {
        stuff:         clamp2080(gaussianRandom(rng, avg + 2, sd)),  // 구위 약간 우위
        command:       clamp2080(gaussianRandom(rng, avg - 1, sd)),
        stamina:       clamp2080(gaussianRandom(rng, avg - 2, sd)),
        effectiveness: clamp2080(gaussianRandom(rng, avg + 1, sd)),
        consistency:   clamp2080(gaussianRandom(rng, avg - 2, sd)),
    };
}

// ─── 볼파크 팩터 (10개 KBO 구장) ───
// 1.00 = 리그 평균. >1 = 해당 이벤트 증가, <1 = 감소
// HR: 홈런, H: 안타, 2B: 2루타, 3B: 3루타, E: 실책, FO: 뜬공
// lighting: 조명 유형 (LED/STD/OLD → 야간 경기 수비 영향)
const BALLPARK_FACTORS = {
    '잠실':  { team: 'LG',   teamAlt: '두산', name: '잠실야구장',       HR: 1.18, H: 1.04, '2B': 1.06, '3B': 0.93, E: 1.02, FO: 0.93, lighting: 'LED' },
    '사직':  { team: '롯데', teamAlt: null,    name: '사직야구장',       HR: 1.12, H: 1.02, '2B': 0.99, '3B': 0.95, E: 1.01, FO: 0.97, lighting: 'LED' },
    '울산':  { team: '롯데', teamAlt: null,    name: '울산문수야구장',   HR: 1.08, H: 1.02, '2B': 1.02, '3B': 0.95, E: 1.05, FO: 0.97, lighting: 'OLD' },
    '광주':  { team: 'KIA',  teamAlt: null,    name: '광주-기아 챔피언스필드', HR: 1.05, H: 1.02, '2B': 1.01, '3B': 0.97, E: 1.00, FO: 0.98, lighting: 'LED' },
    '서울':  { team: '키움', teamAlt: null,    name: '고척스카이돔',     HR: 1.05, H: 1.01, '2B': 1.01, '3B': 1.03, E: 0.96, FO: 0.98, lighting: 'LED' },
    '고척':  { team: '키움', teamAlt: null,    name: '고척스카이돔',     HR: 1.02, H: 1.01, '2B': 1.01, '3B': 1.03, E: 0.96, FO: 0.98, lighting: 'LED' },
    '수원':  { team: 'KT',   teamAlt: null,    name: '수원KT위즈파크',   HR: 1.00, H: 1.01, '2B': 1.00, '3B': 1.00, E: 0.97, FO: 1.00, lighting: 'LED' },
    '대구':  { team: '삼성', teamAlt: null,    name: '대구삼성라이온즈파크', HR: 0.95, H: 0.99, '2B': 1.04, '3B': 1.08, E: 0.96, FO: 1.05, lighting: 'LED' },
    '인천':  { team: 'SSG',  teamAlt: null,    name: '인천SSG랜더스필드', HR: 0.93, H: 0.98, '2B': 1.00, '3B': 1.08, E: 1.00, FO: 1.03, lighting: 'STD' },
    '창원':  { team: 'NC',   teamAlt: null,    name: '창원NC파크',       HR: 0.90, H: 0.97, '2B': 0.98, '3B': 1.05, E: 0.93, FO: 1.08, lighting: 'LED' },
};

// 팀 코드 → 홈구장 매핑
const TEAM_HOME_STADIUM = {
    'LG':   '잠실',
    '두산': '잠실',
    '롯데': '사직',
    'KIA':  '광주',
    'KT':   '수원',
    '한화': '대전',   // 대전은 팩터 미등록 → 리그 평균(1.00) 사용
    'NC':   '창원',
    'SSG':  '인천',
    '키움': '고척',
    '삼성': '대구',
};

// 구장 팩터 조회 (미등록 구장은 모두 1.00)
const NEUTRAL_PARK = { HR: 1.00, H: 1.00, '2B': 1.00, '3B': 1.00, E: 1.00, FO: 1.00, lighting: 'LED', name: '기본 구장' };

function getBallparkFactor(teamCode) {
    const stadiumName = TEAM_HOME_STADIUM[teamCode];
    if (!stadiumName) return NEUTRAL_PARK;
    return BALLPARK_FACTORS[stadiumName] || NEUTRAL_PARK;
}

// 조명 유형에 따른 야간 수비 보정 계수
// LED: 0 (보정 없음), STD: -1 (약간 불리), OLD: -2 (불리)
function getLightingDefPenalty(teamCode) {
    const park = getBallparkFactor(teamCode);
    if (park.lighting === 'OLD') return -2;
    if (park.lighting === 'STD') return -1;
    return 0;
}

// 볼파크 팩터 기반 종합 타자 파워 보정
// HR 팩터가 높으면 파워 타자에게 유리, H 팩터는 컨택 타자에게 유리
function applyParkFactorToBatPower(batPower, parkFactor) {
    // 타자 파워에 HR/H 팩터 가중 반영 (HR 60%, H 40%)
    const factor = parkFactor.HR * 0.6 + parkFactor.H * 0.4;
    return batPower * factor;
}

// 볼파크 팩터 기반 종합 투수 파워 보정
// FO(뜬공) 팩터가 높으면 플라이볼 투수에게 유리 (뜬공이 잡힘)
// HR 팩터가 높으면 투수에게 불리
function applyParkFactorToPitchPower(pitchPower, parkFactor) {
    // HR 역보정 (HR↑ → 투수 불리), FO 정보정 (FO↑ → 투수 유리)
    const factor = (2.0 - parkFactor.HR) * 0.5 + parkFactor.FO * 0.5;
    return pitchPower * factor;
}

// 볼파크 팩터 기반 수비 보정
// E(실책) 팩터 + 조명 패널티
function applyParkFactorToDefense(defRating, teamCode) {
    const park = getBallparkFactor(teamCode);
    const lightPenalty = getLightingDefPenalty(teamCode);
    // E 팩터 역보정: 실책 많은 구장 → 수비 효율 하락
    const eFactor = 2.0 - park.E;  // E=1.05 → 0.95, E=0.93 → 1.07
    return Math.round(defRating * eFactor) + lightPenalty;
}

// wRC+ 볼파크 보정 (구장 효과 제거)
// wRC+는 이미 리그 평균 보정이 되어 있지만, 추가 구장 효과 반영
function adjustWrcPlusByPark(wrcPlus, teamCode) {
    const park = getBallparkFactor(teamCode);
    // 종합 타자 구장 팩터 (HR 40%, H 30%, 2B 20%, 3B 10%)
    const parkRun = park.HR * 0.40 + park.H * 0.30 + park['2B'] * 0.20 + park['3B'] * 0.10;
    // 구장 효과 제거: 타자 유리 구장에서의 성적 하향 보정
    return Math.round(wrcPlus / parkRun);
}

// 팀 코드 → 이미지 파일명 매핑
const TEAM_IMG = {
    'LG': 'lg', '두산': 'doosan', '롯데': 'lotte', 'KIA': 'kia',
    'KT': 'kt', '한화': 'hanwha', 'NC': 'nc', 'SSG': 'ssg',
    '키움': 'heroes', '삼성': 'samsung',
};
function teamLogo(code) { return `image/logo/${TEAM_IMG[code]}.svg`; }
function teamEmblem(code) { return `image/emblem/${TEAM_IMG[code]}.svg`; }
function teamWordmark(code) {
    const ext = code === '한화' ? 'png' : 'svg';
    return `image/wordmark/${TEAM_IMG[code]}.${ext}`;
}

// 코칭스태프 (감독 + 코치)
// 1군 코칭스태프 (KBO 2025 시즌 공식 발표 기준)
const COACHING_STAFF = {
    'LG': { manager: '염경엽', coaches: ['김정준 수석','경헌호 투수','하기룡 불펜','김용달 배터리','이종욱 타격','모창민 타격','오윤 수비','임재철 작전·주루'] },
    '두산': { manager: '김원형', coaches: ['고토 수석','조성환 QC','박정배 투수','김지용 투수','박석민 타격','이영수 타격','임재현 작전','김동한 수비·주루','조인성 배터리'] },
    '롯데': { manager: '김태형', coaches: ['조원우 수석','김민재 벤치','주형광 투수','이재율 투수','정상호 배터리','임훈 타격','이성곤 타격','김민호 내야수비','유재신 외야수비','고영민 작전·주루'] },
    'KIA': { manager: '이범호', coaches: ['손승락 수석','이동걸 투수','김지용 투수','김주찬 타격','조승범 타격','박기남 수비','고영민 작전·주루','김연훈 외야·주루','이해창 배터리'] },
    'KT': { manager: '이강철', coaches: ['김태한 수석','제춘모 투수','전병두 불펜','장재중 배터리','유한준 타격','김강 타격보조','최만호 3루·작전','이종범 1루·외야','박기혁 수비','박경수 QC'] },
    '한화': { manager: '김경문', coaches: ['양승관 수석','양상문 투수','윤규진 불펜','김정민 배터리','김민호 타격','정현석 타격','김우석 수비','김재걸 작전·주루','추승우 1루·외야'] },
    'NC': { manager: '이호준', coaches: ['허삼영 수석','이호성 투수','홍상삼 불펜','김영수 배터리','이원석 타격','황동재 타격','여건욱 수비','최우성 작전·주루'] },
    'SSG': { manager: '이숭용', coaches: ['송신영 수석','경헌호 투수','이승호 불펜','강병식 타격','오준혁# 타격','세리자와 배터리','손시헌 수비','조동화 작전','윤재국 주루'] },
    '키움': { manager: '설종진', coaches: ['김창현 수석','이승호 투수','노병오 불펜','오윤 타격','김태완 타격','박도현 배터리','문찬종 수비','박정음 작전·주루','김준완 1루'] },
    '삼성': { manager: '박진만', coaches: ['최일언 수석·투수','채상병 야수총괄','박석진 불펜','무라카미 타격','박한이 타격','이흥련 배터리','손주인 수비','이종욱 작전·외야','정병곤 주루'] },
};

const KBO_TEAMS = [
    { code: 'LG', name: 'LG 트윈스', color: '#C30452',
      finance: { totalAssets: 1038, cash: 95, playerSalary: 141, operatingCost: 443, availableBudget: 85, debt: 0 } },
    { code: '두산', name: '두산 베어스', color: '#1A1748',
      finance: { totalAssets: 720, cash: 85, playerSalary: 145, operatingCost: 410, availableBudget: 75, debt: 45 } },
    { code: '롯데', name: '롯데 자이언츠', color: '#041E42',
      finance: { totalAssets: 680, cash: 70, playerSalary: 120, operatingCost: 360, availableBudget: 60, debt: 55 } },
    { code: 'KIA', name: 'KIA 타이거즈', color: '#EA0029',
      finance: { totalAssets: 610, cash: 80, playerSalary: 130, operatingCost: 400, availableBudget: 70, debt: 30 } },
    { code: 'KT', name: 'KT 위즈', color: '#000000',
      finance: { totalAssets: 590, cash: 75, playerSalary: 128, operatingCost: 390, availableBudget: 65, debt: 35 } },
    { code: '한화', name: '한화 이글스', color: '#FC4E00',
      finance: { totalAssets: 568, cash: 65, playerSalary: 120, operatingCost: 380, availableBudget: 60, debt: 30 } },
    { code: 'NC', name: 'NC 다이노스', color: '#315288',
      finance: { totalAssets: 520, cash: 55, playerSalary: 125, operatingCost: 350, availableBudget: 50, debt: 40 } },
    { code: 'SSG', name: 'SSG 랜더스', color: '#CE0E2D',
      finance: { totalAssets: 460, cash: 75, playerSalary: 161, operatingCost: 250, availableBudget: 65, debt: 100 } },
    { code: '키움', name: '키움 히어로즈', color: '#570514',
      finance: { totalAssets: 440, cash: 50, playerSalary: 95, operatingCost: 300, availableBudget: 40, debt: 80 } },
    { code: '삼성', name: '삼성 라이온즈', color: '#074CA1',
      finance: { totalAssets: 814, cash: 90, playerSalary: 135, operatingCost: 420, availableBudget: 80, debt: 50 } },
];

// ─── 2026 개막전 실제 등록 명단 ───
// 이름 뒤 *는 외국인 선수 (캡 계산 제외)
const REAL_ROSTERS = {
    'LG': {
        manager: '염경엽',
        P: ['임찬규','손주영','송승기','치리노스*','톨허스트*','장현식','김진성','함덕주','이정용','김강률','유영찬','이지강','김영우','월스*'],
        C: ['박동원','이주헌'],
        IF: ['오지환','문보경','오스틴*','신민재','천성호','구본혁','이영빈'],
        OF: ['박해민','최원영','홍창기','이재원','송찬의','문성주'],
    },
    '두산': {
        manager: '김원형',
        P: ['박치국','타무라*','이병헌','양재훈','잭로그*','최지강','이용찬','곽빈','박신지','이영하','최준호','최원준','김택연','플렉센*'],
        C: ['양의지','김기연'],
        IF: ['안재석','오명진','강승호','박찬호','양석환','이유찬','박지훈','박준순','임종성','홍성호','김동준'],
        OF: ['카메론*','정수빈','김인태','조수행'],
    },
    '롯데': {
        manager: '김태형',
        P: ['김강현','박세웅','비슬리*','로드리게스*','김원중','박정민','이민석','쿄야마*','이준서','윤성빈','최준용','박준우','정철원'],
        C: ['유강남','손성빈'],
        IF: ['전민재','김민성','이호준','노진혁','박승욱','한태양','이서준'],
        OF: ['황성빈','레이예스*','신윤후','손호영','장두성','전준우','윤동희'],
    },
    'KIA': {
        manager: '이범호',
        P: ['조상우','올러*','최지민','네일*','황동하','이의리','김범수','전상현','김기훈','김시훈','정해영','성영탁','홍민규'],
        C: ['한준수','김태군'],
        IF: ['정현창','김규성','윤도현','박민','김선빈','데일*','김도영','오선우'],
        OF: ['박정우','박재현','카스트로*','김호령','나성범','이창진'],
    },
    'KT': {
        manager: '이강철',
        P: ['스기모토*','우규민','김민수','전용주','소형준','사우어*','한승혁','보쉴리*','주권','손동현','박영현','박지훈'],
        C: ['장성우','조대현','한승택'],
        IF: ['허경민','힐리어드*','오윤석','권동진','이강민','김상수','류현인'],
        OF: ['김현수','안현민','배정대','최원준','이정훈','장진혁','안치영'],
    },
    '한화': {
        manager: '김경문',
        P: ['에르난데스*','왕옌청*','화이트*','김서현','김도빈','원종혁','윤산흠','강재민','조동욱','정우주','박준영'],
        C: ['최재훈','장규현','허인서'],
        IF: ['하주석','채은성','이도윤','강백호','심우준','노시환','최유빈','황영묵'],
        OF: ['이진영','김태연','페라자*','손아섭','최인호','문현빈','오재원'],
    },
    'NC': {
        manager: '이호준',
        P: ['토다*','김영규','임지민','임정호','이준혁','류진욱','손주환','김진호','구창모','배재환','원종해','테일러*'],
        C: ['김형준','김정호'],
        IF: ['김한별','최정원','박민우','데이비슨*','오영수','허윤','김휘집','서호철','김주원','신재인'],
        OF: ['천재환','한석현','권희동','박건우','고준휘'],
    },
    'SSG': {
        manager: '이숭용',
        P: ['김민','조병현','전영준','노경은','김건우','이기순','베니지아노*','문승원','김택형','화이트*','박시후','백승건','이로운'],
        C: ['조형우','이지영'],
        IF: ['안상현','최정','고명준','박성한','정준재','김성현','홍대인'],
        OF: ['채현우','에레디아*','김성욱','김재환','오태곤','최지훈','임근우'],
    },
    '키움': {
        manager: '설종진',
        P: ['김성진','김재웅','오석주','와일스*','박윤성','박진형','유토*','하영민','알칸타라*','배동현','전준표','박정훈','윤석원'],
        C: ['김건희','김재현'],
        IF: ['김태진','최재영','박한결','최주환','오선진','안치홍','어준서'],
        OF: ['이주형','브룩스*','추재현','임지열','이형종','박찬혁','박수종'],
    },
    '삼성': {
        manager: '박진만',
        P: ['최지광','미야지*','최원태','이승현','이승민','백정현','임기영','육선엽','배찬승','장찬희','김재윤','오러클린*','후라도*'],
        C: ['강민호','박세혁'],
        IF: ['디아즈*','류지혁','이해승','김영웅','심재훈','전병우','이재현'],
        OF: ['김헌곤','최형우','김성윤','함수호','구자욱','홍현빈','김지찬'],
    },
};

// ─── 실제 시즌 성적 (Statiz 기반, 팀별로 추가) ───
// 타자: { AVG, OBP, SLG, OPS, 'wRC+', WAR, oWAR, dWAR, HR, SB, CS, BB, SO, G, PA, AB, RBI }
// 투수: pos:'P', role, G, GS, W, L, S, HLD, IP, H, HR, BB, HBP, SO, ER, R, ERA, WHIP, FIP, WAR, BABIP, WPA, salary, pitches
const REAL_SEASON_STATS = {
    'LG': {
        // 2025 시즌 타자 성적 (Statiz 종합)
        // 클래식: AVG,H,2B,3B,HR,RBI,R,SB,CS,BB,SO,G,PA,AB
        // 세이버: OBP,SLG,OPS,wRC+,WAR,oWAR,dWAR,IsoP,BABIP,wOBA
        // 수비: defRAA(수비 종합 RAA/144), rangeRAA, errRAA, frmRAA(포수), BBO%(수비율)
        '박동원': { pos:'C',  AVG:.253, OBP:.342, SLG:.455, OPS:.797, 'wRC+':121.0, WAR:5.12, oWAR:4.80, dWAR:0.32, H:114, '2B':25, '3B':0, HR:22, RBI:76, R:57, SB:4, CS:0, BB:62, SO:124, G:139, PA:523, AB:451, IsoP:.202, salary:5.0, defRAA:3.20, rangeRAA:0.42, errRAA:-0.16, csRAA:0.24, frmRAA:4.01, BBO:70.0 },
        '오스틴': { pos:'1B', AVG:.313, OBP:.393, SLG:.595, OPS:.988, 'wRC+':171.6, WAR:4.86, oWAR:5.11, dWAR:-0.25, H:133, '2B':25, '3B':1, HR:31, RBI:95, R:82, SB:3, CS:0, BB:61, SO:62, G:116, PA:499, AB:425, IsoP:.282, salary:15.4, defRAA:-2.50, rangeRAA:-0.33, errRAA:0.20 },
        '박해민': { pos:'CF', AVG:.276, OBP:.379, SLG:.346, OPS:.725, 'wRC+':115.7, WAR:4.55, oWAR:3.36, dWAR:1.19, H:122, '2B':18, '3B':2, HR:3, RBI:43, R:80, SB:49, CS:14, BB:68, SO:94, G:144, PA:544, AB:442, IsoP:.070, salary:8.0, defRAA:11.90, rangeRAA:9.22, errRAA:1.28, armRAA:1.40 },
        '문보경': { pos:'3B', AVG:.276, OBP:.371, SLG:.460, OPS:.831, 'wRC+':135.5, WAR:4.18, oWAR:4.72, dWAR:-0.53, H:142, '2B':21, '3B':1, HR:24, RBI:108, R:91, SB:3, CS:1, BB:79, SO:108, G:141, PA:607, AB:515, IsoP:.184, salary:4.8, defRAA:-6.29, rangeRAA:-0.82, errRAA:-2.27, dpRAA:-0.01 },
        '구본혁': { pos:'3B', AVG:.286, OBP:.364, SLG:.353, OPS:.717, 'wRC+':106.0, WAR:3.59, oWAR:2.25, dWAR:1.33, H:98, '2B':16, '3B':2, HR:1, RBI:38, R:41, SB:10, CS:5, BB:36, SO:44, G:131, PA:397, AB:343, IsoP:.067, salary:2.3, defRAA:6.54, rangeRAA:4.54, errRAA:0.39, dpRAA:0.16 },
        '신민재': { pos:'2B', AVG:.313, OBP:.395, SLG:.382, OPS:.777, 'wRC+':128.8, WAR:3.49, oWAR:4.18, dWAR:-0.69, H:145, '2B':15, '3B':7, HR:1, RBI:61, R:87, SB:15, CS:9, BB:62, SO:57, G:135, PA:538, AB:463, IsoP:.069, salary:3.8, defRAA:-6.34, rangeRAA:-4.75, errRAA:5.05, dpRAA:-1.29 },
        '오지환': { pos:'SS', AVG:.253, OBP:.314, SLG:.430, OPS:.744, 'wRC+':101.9, WAR:2.89, oWAR:2.65, dWAR:0.24, H:106, '2B':24, '3B':1, HR:16, RBI:62, R:57, SB:9, CS:7, BB:37, SO:115, G:127, PA:472, AB:419, IsoP:.177, salary:14.0, defRAA:2.41, rangeRAA:3.07, errRAA:0.92 },
        '문성주': { pos:'RF', AVG:.305, OBP:.375, SLG:.375, OPS:.750, 'wRC+':115.1, WAR:2.61, oWAR:2.31, dWAR:0.31, H:145, '2B':20, '3B':2, HR:3, RBI:70, R:57, SB:4, CS:3, BB:54, SO:59, G:135, PA:542, AB:475, IsoP:.070, salary:3.8, defRAA:2.40, rangeRAA:2.10, errRAA:0.00, armRAA:0.29 },
        '홍창기': { pos:'RF', AVG:.287, OBP:.399, SLG:.328, OPS:.727, 'wRC+':119.4, WAR:0.99, oWAR:1.09, dWAR:-0.10, H:50, '2B':4, '3B':0, HR:1, RBI:16, R:32, SB:3, CS:0, BB:29, SO:40, G:51, PA:215, AB:174, IsoP:.041, salary:5.2, defRAA:-1.00, rangeRAA:-1.88, errRAA:0.30, armRAA:0.58 },
        '최원영': { pos:'LF', AVG:.282, OBP:.330, SLG:.330, OPS:.660, 'wRC+':81.9, WAR:0.77, oWAR:0.15, dWAR:0.62, H:29, '2B':5, '3B':0, HR:0, RBI:2, R:37, SB:8, CS:4, BB:4, SO:20, G:119, PA:115, AB:103, IsoP:.048, salary:0.7, defRAA:2.55, rangeRAA:2.21, errRAA:0.19, armRAA:0.14 },
        '이주헌': { pos:'C',  AVG:.219, OBP:.351, SLG:.336, OPS:.687, 'wRC+':104.4, WAR:0.65, oWAR:1.03, dWAR:-0.39, H:28, '2B':3, '3B':0, HR:4, RBI:9, R:22, SB:0, CS:0, BB:18, SO:30, G:76, PA:156, AB:128, IsoP:.117, salary:0.5, defRAA:-3.87, rangeRAA:-0.65, errRAA:-0.32, csRAA:-0.24, frmRAA:3.84 },
        '송찬의': { pos:'RF', AVG:.211, OBP:.291, SLG:.347, OPS:.638, 'wRC+':74.1, WAR:0.03, oWAR:-0.06, dWAR:0.10, H:31, '2B':9, '3B':1, HR:3, RBI:20, R:18, SB:2, CS:2, BB:9, SO:49, G:66, PA:166, AB:147, IsoP:.136, salary:0.55, defRAA:-0.42, rangeRAA:-0.44, errRAA:0.27, armRAA:-0.25 },
        '이영빈': { pos:'2B', AVG:.208, OBP:.216, SLG:.375, OPS:.591, 'wRC+':42.3, WAR:-0.14, oWAR:-0.06, dWAR:-0.08, H:15, '2B':1, '3B':1, HR:3, RBI:9, R:12, SB:1, CS:0, BB:1, SO:35, G:44, PA:75, AB:72, IsoP:.167, salary:0.55, defRAA:-0.14, rangeRAA:-0.10, errRAA:-0.04 },
        '천성호': { pos:'2B', AVG:.255, OBP:.307, SLG:.340, OPS:.647, 'wRC+':76.5, WAR:-0.37, oWAR:0.03, dWAR:-0.39, H:27, '2B':4, '3B':1, HR:1, RBI:10, R:14, SB:3, CS:0, BB:7, SO:17, G:52, PA:118, AB:106, IsoP:.085, salary:0.8, defRAA:-0.37, rangeRAA:-0.16, errRAA:-0.09, dpRAA:-0.12 },
        // 이재원: 2025 군복무 → 기록 없음

        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        '치리노스': { pos:'P', role:'선발', G:30, GS:30, W:13, L:6, S:0, HLD:0, IP:177.0, H:173, HR:5, BB:36, HBP:9, SO:137, ER:65, R:71, ERA:3.31, WHIP:1.18, FIP:3.13, WAR:5.21, BABIP:0.310, WPA:1.99, salary:12.6,
            pitches:[{name:'포심',pct:40,velo:147},{name:'투심',pct:20,velo:145},{name:'슬라이더',pct:25,velo:137},{name:'체인지업',pct:10,velo:134},{name:'커브',pct:5,velo:127}] },
        '임찬규': { pos:'P', role:'선발', G:27, GS:27, W:11, L:7, S:0, HLD:0, IP:160.1, H:163, HR:9, BB:40, HBP:6, SO:107, ER:54, R:61, ERA:3.03, WHIP:1.27, FIP:3.82, WAR:4.90, BABIP:0.306, WPA:1.78, salary:2.0,
            pitches:[{name:'포심',pct:45,velo:145},{name:'슬라이더',pct:25,velo:133},{name:'체인지업',pct:15,velo:136},{name:'커브',pct:15,velo:126}] },
        '톨허스트': { pos:'P', role:'선발', G:8, GS:8, W:6, L:2, S:0, HLD:0, IP:44.0, H:39, HR:2, BB:16, HBP:1, SO:45, ER:14, R:15, ERA:2.86, WHIP:1.25, FIP:3.21, WAR:1.31, BABIP:0.314, WPA:0.60, salary:11.2,
            pitches:[{name:'포심',pct:40,velo:149},{name:'슬라이더',pct:30,velo:137},{name:'커브',pct:20,velo:129},{name:'체인지업',pct:10,velo:134}] },
        '김영우': { pos:'P', role:'중계', G:66, GS:0, W:3, L:2, S:1, HLD:7, IP:60.0, H:49, HR:2, BB:30, HBP:0, SO:56, ER:16, R:17, ERA:2.40, WHIP:1.32, FIP:3.64, WAR:1.50, BABIP:0.296, WPA:-0.38, salary:0.85,
            pitches:[{name:'포심',pct:55,velo:148},{name:'슬라이더',pct:35,velo:137},{name:'체인지업',pct:10,velo:134}] },
        '유영찬': { pos:'P', role:'마무리', G:39, GS:0, W:2, L:2, S:21, HLD:1, IP:41.0, H:31, HR:2, BB:23, HBP:3, SO:52, ER:12, R:14, ERA:2.63, WHIP:1.32, FIP:3.20, WAR:0.92, BABIP:0.302, WPA:3.00, salary:2.4,
            pitches:[{name:'포심',pct:55,velo:146},{name:'슬라이더',pct:30,velo:135},{name:'체인지업',pct:15,velo:133}] },
        '장현식': { pos:'P', role:'중계', G:56, GS:0, W:3, L:3, S:10, HLD:5, IP:49.2, H:65, HR:4, BB:21, HBP:5, SO:38, ER:24, R:27, ERA:4.35, WHIP:1.73, FIP:4.58, WAR:0.73, BABIP:0.374, WPA:-1.02, salary:15.0,
            pitches:[{name:'포심',pct:45,velo:143},{name:'슬라이더',pct:30,velo:131},{name:'포크볼',pct:15,velo:134},{name:'커브',pct:10,velo:126}] },
        '이정용': { pos:'P', role:'중계', G:39, GS:0, W:6, L:1, S:1, HLD:7, IP:34.0, H:32, HR:3, BB:12, HBP:2, SO:26, ER:19, R:19, ERA:5.03, WHIP:1.29, FIP:4.37, WAR:0.57, BABIP:0.305, WPA:0.52, salary:2.7,
            pitches:[{name:'포심',pct:55,velo:145},{name:'슬라이더',pct:30,velo:134},{name:'커브',pct:15,velo:128}] },
        '김진성': { pos:'P', role:'중계', G:78, GS:0, W:6, L:4, S:1, HLD:33, IP:70.2, H:61, HR:6, BB:24, HBP:0, SO:63, ER:27, R:28, ERA:3.44, WHIP:1.20, FIP:3.91, WAR:0.54, BABIP:0.277, WPA:0.24, salary:4.5,
            pitches:[{name:'포심',pct:40,velo:139},{name:'슬라이더',pct:30,velo:128},{name:'체인지업',pct:15,velo:130},{name:'커브',pct:15,velo:124}] },
        '이우찬': { pos:'P', role:'중계', G:23, GS:0, W:1, L:0, S:1, HLD:0, IP:19.0, H:13, HR:0, BB:14, HBP:1, SO:20, ER:4, R:6, ERA:1.89, WHIP:1.42, FIP:3.81, WAR:0.46, BABIP:0.260, WPA:-0.25, salary:0.8,
            pitches:[{name:'포심',pct:45,velo:143},{name:'슬라이더',pct:30,velo:132},{name:'체인지업',pct:25,velo:131}] },
        '백승현': { pos:'P', role:'중계', G:33, GS:0, W:1, L:0, S:1, HLD:2, IP:30.0, H:28, HR:2, BB:28, HBP:1, SO:27, ER:13, R:13, ERA:3.90, WHIP:1.87, FIP:5.45, WAR:0.16, BABIP:0.302, WPA:-0.58, salary:0.7,
            pitches:[{name:'포심',pct:50,velo:145},{name:'슬라이더',pct:30,velo:134},{name:'커브',pct:20,velo:128}] },
        '배재준': { pos:'P', role:'중계', G:14, GS:0, W:0, L:0, S:1, HLD:0, IP:13.0, H:9, HR:1, BB:7, HBP:1, SO:14, ER:8, R:7, ERA:5.54, WHIP:1.23, FIP:4.11, WAR:0.14, BABIP:0.242, WPA:0.13, salary:0.56,
            pitches:[{name:'포심',pct:50,velo:146},{name:'슬라이더',pct:30,velo:135},{name:'체인지업',pct:20,velo:133}] },
        '함덕주': { pos:'P', role:'중계', G:31, GS:0, W:2, L:3, S:0, HLD:3, IP:27.0, H:14, HR:1, BB:18, HBP:0, SO:26, ER:18, R:17, ERA:6.00, WHIP:1.19, FIP:4.09, WAR:-0.07, BABIP:0.203, WPA:-0.24, salary:8.0,
            pitches:[{name:'포심',pct:45,velo:144},{name:'슬라이더',pct:30,velo:133},{name:'체인지업',pct:25,velo:132}] },
        '우강훈': { pos:'P', role:'중계', G:11, GS:0, W:0, L:0, S:0, HLD:0, IP:9.2, H:12, HR:0, BB:6, HBP:2, SO:5, ER:5, R:5, ERA:4.66, WHIP:1.86, FIP:5.27, WAR:0.06, BABIP:0.364, WPA:-0.04, salary:0.4,
            pitches:[{name:'포심',pct:50,velo:143},{name:'슬라이더',pct:35,velo:131},{name:'커브',pct:15,velo:125}] },
        '박시원': { pos:'P', role:'중계', G:2, GS:0, W:0, L:0, S:0, HLD:0, IP:1.1, H:0, HR:0, BB:5, HBP:0, SO:0, ER:2, R:1, ERA:13.50, WHIP:3.75, FIP:15.92, WAR:-0.01, BABIP:0.000, WPA:0.00, salary:0.32,
            pitches:[{name:'포심',pct:60,velo:147},{name:'슬라이더',pct:25,velo:136},{name:'커브',pct:15,velo:128}] },
        // ─── 시즌 중 기여 투수 (1군 로스터 외) ───
        '손주영': { pos:'P', role:'선발', G:30, GS:27, W:11, L:6, S:0, HLD:0, IP:153.0, H:153, HR:8, BB:49, HBP:4, SO:132, ER:58, R:67, ERA:3.41, WHIP:1.32, FIP:3.49, WAR:3.82, BABIP:0.325, WPA:1.10, salary:2.9,
            pitches:[{name:'포심',pct:45,velo:146},{name:'슬라이더',pct:25,velo:135},{name:'체인지업',pct:20,velo:133},{name:'커브',pct:10,velo:125}] },
        '송승기': { pos:'P', role:'선발', G:28, GS:27, W:11, L:6, S:0, HLD:0, IP:144.0, H:149, HR:14, BB:49, HBP:0, SO:125, ER:56, R:61, ERA:3.50, WHIP:1.38, FIP:4.10, WAR:3.55, BABIP:0.309, WPA:0.53, salary:1.36,
            pitches:[{name:'포심',pct:50,velo:145},{name:'슬라이더',pct:30,velo:134},{name:'체인지업',pct:20,velo:132}] },
        '박명근': { pos:'P', role:'중계', G:44, GS:0, W:3, L:4, S:4, HLD:10, IP:38.2, H:36, HR:5, BB:16, HBP:5, SO:30, ER:21, R:21, ERA:4.89, WHIP:1.34, FIP:5.09, WAR:0.62, BABIP:0.282, WPA:0.32, salary:0.9,
            pitches:[{name:'포심',pct:55,velo:144},{name:'슬라이더',pct:30,velo:133},{name:'커브',pct:15,velo:126}] },
        '이지강': { pos:'P', role:'중계', G:43, GS:1, W:1, L:2, S:3, HLD:4, IP:47.1, H:50, HR:4, BB:24, HBP:1, SO:39, ER:28, R:29, ERA:5.32, WHIP:1.56, FIP:4.55, WAR:-0.04, BABIP:0.322, WPA:-0.62, salary:1.1,
            pitches:[{name:'포심',pct:50,velo:144},{name:'슬라이더',pct:30,velo:133},{name:'체인지업',pct:20,velo:131}] },
        '김강률': { pos:'P', role:'중계', G:12, GS:0, W:1, L:0, S:1, HLD:4, IP:12.1, H:7, HR:0, BB:8, HBP:1, SO:10, ER:2, R:2, ERA:1.46, WHIP:1.22, FIP:4.43, WAR:0.40, BABIP:0.212, WPA:0.52, salary:2.5,
            pitches:[{name:'포심',pct:55,velo:146},{name:'슬라이더',pct:30,velo:135},{name:'체인지업',pct:15,velo:133}] },
        '성동현': { pos:'P', role:'중계', G:12, GS:0, W:0, L:0, S:0, HLD:0, IP:9.0, H:10, HR:2, BB:9, HBP:0, SO:6, ER:9, R:9, ERA:9.00, WHIP:2.11, FIP:8.10, WAR:-0.28, BABIP:0.296, WPA:-0.08, salary:0.42,
            pitches:[{name:'포심',pct:55,velo:143},{name:'슬라이더',pct:30,velo:132},{name:'커브',pct:15,velo:125}] },
        '정우영': { pos:'P', role:'중계', G:4, GS:0, W:0, L:0, S:0, HLD:0, IP:2.2, H:1, HR:1, BB:4, HBP:0, SO:3, ER:6, R:3, ERA:20.25, WHIP:1.88, FIP:11.57, WAR:-0.11, BABIP:0.000, WPA:0.11, salary:1.0,
            pitches:[{name:'포심',pct:55,velo:145},{name:'슬라이더',pct:30,velo:134},{name:'커브',pct:15,velo:127}] },
        '최재홍': { pos:'P', role:'중계', G:13, GS:0, W:0, L:1, S:0, HLD:2, IP:29.0, H:35, HR:3, BB:14, HBP:1, SO:21, ER:17, R:17, ERA:5.28, WHIP:1.69, FIP:4.99, WAR:0.17, BABIP:0.344, WPA:-0.40, salary:0.7,
            pitches:[{name:'포심',pct:50,velo:144},{name:'슬라이더',pct:30,velo:133},{name:'체인지업',pct:20,velo:131}] },
        // ─── 2군 투수 1군 출전 기록 ───
        '김유영': { pos:'P', role:'중계', G:6, GS:0, W:0, L:0, S:0, HLD:0, IP:4.1, H:8, HR:4, BB:1, HBP:0, SO:5, ER:6, R:7, ERA:12.46, WHIP:2.08, FIP:14.89, WAR:-0.23, BABIP:0.533, WPA:-0.05, salary:0.8,
            pitches:[{name:'포심',pct:50,velo:142},{name:'슬라이더',pct:30,velo:131},{name:'커브',pct:20,velo:124}] },
        '김진수': { pos:'P', role:'중계', G:4, GS:0, W:0, L:0, S:0, HLD:0, IP:5.0, H:11, HR:0, BB:1, HBP:0, SO:6, ER:5, R:5, ERA:9.00, WHIP:2.40, FIP:6.32, WAR:-0.07, BABIP:0.500, WPA:-0.01, salary:0.4,
            pitches:[{name:'포심',pct:55,velo:141},{name:'슬라이더',pct:30,velo:130},{name:'커브',pct:15,velo:124}] },
        '김종운': { pos:'P', role:'중계', G:2, GS:0, W:0, L:0, S:0, HLD:0, IP:1.2, H:2, HR:0, BB:0, HBP:0, SO:2, ER:1, R:3, ERA:5.40, WHIP:1.20, FIP:15.20, WAR:-0.08, BABIP:0.000, WPA:0.01, salary:0.3,
            pitches:[{name:'포심',pct:55,velo:143},{name:'슬라이더',pct:30,velo:132},{name:'커브',pct:15,velo:126}] },
        // ─── 2군 타자 1군 출전 기록 ───
        '문정빈': { pos:'3B', AVG:.167, OBP:.242, SLG:.367, OPS:.609, 'wRC+':57.2, WAR:0.11, oWAR:-0.05, dWAR:0.16, H:5, '2B':0, '3B':0, HR:2, RBI:2, R:4, SB:0, CS:0, BB:1, SO:11, G:21, PA:33, AB:30, IsoP:.200, salary:0.35, defRAA:1.34, rangeRAA:1.11, errRAA:0.12, dpRAA:0.11 },
        '김주성': { pos:'1B', AVG:.200, OBP:.294, SLG:.333, OPS:.627, 'wRC+':87.0, WAR:0.01, oWAR:0.01, dWAR:0.00, H:3, '2B':1, '3B':0, HR:0, RBI:1, R:1, SB:0, CS:0, BB:2, SO:2, G:16, PA:17, AB:15, IsoP:.133, salary:0.4, defRAA:1.56, rangeRAA:1.51, errRAA:0.04 },
        '김민수': { pos:'C',  AVG:.182, OBP:.231, SLG:.182, OPS:.413, 'wRC+':4.6, WAR:-0.01, oWAR:-0.01, dWAR:0.00, H:2, '2B':0, '3B':0, HR:0, RBI:1, R:0, SB:0, CS:0, BB:1, SO:4, G:13, PA:13, AB:11, IsoP:.000, salary:0.46, defRAA:-0.09, rangeRAA:0.00, errRAA:0.03, csRAA:-0.17, frmRAA:0.00 },
        '손용준': { pos:'DH', AVG:.111, OBP:.125, SLG:.111, OPS:.236, 'wRC+':15.6, WAR:-0.13, oWAR:-0.13, dWAR:0.00, H:1, '2B':0, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:5, G:9, PA:16, AB:9, IsoP:.000, salary:0.34 },
    },
    '두산': {
        // 2025 시즌 타자 성적 (Statiz 기반) — BB는 OBP에서 역산
        '양의지': { pos:'C',  AVG:.337, OBP:.406, SLG:.533, OPS:.939, 'wRC+':162.8, WAR:6.79, oWAR:6.60, dWAR:0.20, H:153, '2B':25, '3B':0, HR:22, RBI:76, R:57, SB:2, CS:0, BB:50, SO:63, G:130, PA:517, AB:454, IsoP:.196, salary:42.0 },
        '김기연': { pos:'C',  AVG:.247, OBP:.307, SLG:.315, OPS:.622, 'wRC+':72.6, WAR:0.30, oWAR:-0.21, dWAR:0.51, H:56, '2B':8, '3B':0, HR:2, RBI:19, R:14, SB:0, CS:0, BB:14, SO:44, G:100, PA:245, AB:225, IsoP:.068, salary:0.95 },
        '안재석': { pos:'SS', AVG:.319, OBP:.370, SLG:.541, OPS:.911, 'wRC+':149.4, WAR:1.77, oWAR:1.77, dWAR:0.00, H:43, '2B':7, '3B':1, HR:6, RBI:27, R:20, SB:1, CS:0, BB:10, SO:27, G:35, PA:147, AB:135, IsoP:.222, salary:0.67 },
        '오명진': { pos:'2B', AVG:.263, OBP:.321, SLG:.366, OPS:.687, 'wRC+':89.8, WAR:1.80, oWAR:1.15, dWAR:0.65, H:95, '2B':18, '3B':1, HR:7, RBI:45, R:40, SB:5, CS:1, BB:21, SO:94, G:107, PA:371, AB:363, IsoP:.103, salary:1.12 },
        '강승호': { pos:'1B', AVG:.236, OBP:.302, SLG:.372, OPS:.674, 'wRC+':82.3, WAR:1.55, oWAR:0.96, dWAR:0.59, H:85, '2B':15, '3B':1, HR:10, RBI:51, R:40, SB:24, CS:11, BB:32, SO:113, G:134, PA:400, AB:360, IsoP:.136, salary:2.98 },
        '양석환': { pos:'1B', AVG:.248, OBP:.320, SLG:.401, OPS:.721, 'wRC+':98.5, WAR:1.24, oWAR:0.77, dWAR:0.47, H:64, '2B':12, '3B':1, HR:8, RBI:38, R:24, SB:1, CS:0, BB:26, SO:82, G:72, PA:294, AB:260, IsoP:.153, salary:3.0 },
        '이유찬': { pos:'SS', AVG:.242, OBP:.328, SLG:.290, OPS:.618, 'wRC+':79.0, WAR:0.84, oWAR:0.24, dWAR:0.60, H:70, '2B':10, '3B':2, HR:1, RBI:25, R:33, SB:4, CS:6, BB:28, SO:66, G:89, PA:311, AB:290, IsoP:.048, salary:1.12 },
        '박지훈': { pos:'3B', AVG:.417, OBP:.563, SLG:1.028, OPS:1.591, 'wRC+':203.7, WAR:0.82, oWAR:0.82, dWAR:0.00, H:15, '2B':5, '3B':0, HR:5, RBI:12, R:10, SB:0, CS:0, BB:13, SO:6, G:37, PA:55, AB:36, IsoP:.611, salary:0.52 },
        '박준순': { pos:'3B', AVG:.277, OBP:.307, SLG:.398, OPS:.705, 'wRC+':82.2, WAR:0.65, oWAR:0.27, dWAR:0.38, H:23, '2B':4, '3B':0, HR:3, RBI:14, R:8, SB:0, CS:0, BB:3, SO:23, G:33, PA:89, AB:83, IsoP:.121, salary:0.69 },
        '홍성호': { pos:'RF', AVG:.346, OBP:.370, SLG:.615, OPS:.985, 'wRC+':150.7, WAR:0.23, oWAR:0.23, dWAR:0.00, H:9, '2B':2, '3B':0, HR:2, RBI:6, R:4, SB:0, CS:0, BB:1, SO:4, G:9, PA:28, AB:26, IsoP:.269, salary:0.35 },
        '카메론': { pos:'RF', AVG:.280, OBP:.340, SLG:.440, OPS:.780, 'wRC+':115.0, WAR:1.50, oWAR:1.30, dWAR:0.20, H:60, '2B':12, '3B':1, HR:8, RBI:35, R:28, SB:3, CS:1, BB:18, SO:50, G:55, PA:200, AB:178, IsoP:.160, salary:7.0 },
        '정수빈': { pos:'CF', AVG:.256, OBP:.355, SLG:.348, OPS:.703, 'wRC+':104.8, WAR:2.83, oWAR:1.32, dWAR:1.51, H:124, '2B':20, '3B':2, HR:5, RBI:45, R:60, SB:14, CS:4, BB:64, SO:88, G:132, PA:546, AB:483, IsoP:.092, salary:6.0 },
        '김인태': { pos:'LF', AVG:.290, OBP:.346, SLG:.391, OPS:.737, 'wRC+':107.2, WAR:0.80, oWAR:0.63, dWAR:0.17, H:59, '2B':10, '3B':1, HR:4, RBI:25, R:20, SB:6, CS:2, BB:16, SO:36, G:106, PA:225, AB:202, IsoP:.101, salary:0.87 },
        '조수행': { pos:'LF', AVG:.236, OBP:.302, SLG:.308, OPS:.610, 'wRC+':74.0, WAR:0.65, oWAR:-0.06, dWAR:0.71, H:30, '2B':5, '3B':1, HR:1, RBI:12, R:15, SB:3, CS:1, BB:10, SO:28, G:85, PA:140, AB:127, IsoP:.072, salary:2.0 },
        // FA 영입 (KIA → 두산, 2025 성적 없음 — KIA 기준 추정)
        '박찬호': { pos:'SS', AVG:.270, OBP:.340, SLG:.380, OPS:.720, 'wRC+':105.0, WAR:2.0, oWAR:1.50, dWAR:0.50, H:100, '2B':18, '3B':2, HR:5, RBI:40, R:45, SB:8, CS:3, BB:35, SO:65, G:120, PA:430, AB:380, IsoP:.110, salary:8.0 },
        '김동준': { pos:'1B', AVG:.237, OBP:.283, SLG:.333, OPS:.616, 'wRC+':62.4, WAR:-0.65, oWAR:-0.26, dWAR:-0.39, H:22, '2B':3, '3B':0, HR:2, RBI:10, R:8, SB:1, CS:1, BB:5, SO:30, G:36, PA:100, AB:93, IsoP:.096, salary:0.31 },
        // ─── 투수 연봉 (Statiz 2026 기준) ───
        '잭로그':  { pos:'P', role:'선발', salary:9.6 },
        '플렉센':  { pos:'P', role:'선발', salary:9.1 },
        '이영하':  { pos:'P', role:'중계', salary:6.0 },
        '최원준':  { pos:'P', role:'선발', salary:4.0 },
        '곽빈':    { pos:'P', role:'선발', salary:3.05 },
        '타무라':  { pos:'P', role:'중계', salary:2.65 },
        '김택연':  { pos:'P', role:'마무리', salary:2.2 },
        '박치국':  { pos:'P', role:'중계', salary:1.87 },
        '최승용':  { pos:'P', role:'선발', salary:1.55 },
        '김명신':  { pos:'P', role:'중계', salary:1.05 },
        '이병헌':  { pos:'P', role:'중계', salary:1.0 },
        '이용찬':  { pos:'P', role:'중계', salary:0.94 },
        '최지강':  { pos:'P', role:'중계', salary:0.87 },
        '김민석':  { pos:'LF', salary:0.81 },
        '박성재':  { pos:'1B', salary:0.77 },
        '박신지':  { pos:'P', role:'중계', salary:0.7 },
        '박정수':  { pos:'P', role:'중계', salary:0.64 },
        '최민석':  { pos:'P', role:'선발', salary:0.63 },
        '양재훈':  { pos:'P', role:'중계', salary:0.47 },
        '임종성':  { pos:'3B', salary:0.45 },
        '최준호':  { pos:'P', role:'선발', salary:0.45 },
        '김호준':  { pos:'P', role:'중계', salary:0.42 },
        '김유성':  { pos:'P', role:'선발', salary:0.41 },
        '김정우':  { pos:'P', role:'중계', salary:0.38 },
        '김민규':  { pos:'P', role:'선발', salary:0.37 },
        '이교훈':  { pos:'P', role:'중계', salary:0.36 },
        '김대한':  { pos:'RF', salary:0.36 },
        '윤태호':  { pos:'P', role:'중계', salary:0.35 },
        '전다민':  { pos:'LF', salary:0.34 },
        '김민혁':  { pos:'1B', salary:0.33 },
        '최종인':  { pos:'P', role:'중계', salary:0.33 },
        '류현준':  { pos:'C', salary:0.32 },
        '김한중':  { pos:'P', role:'중계', salary:0.31 },
        '박민준':  { pos:'C', salary:0.31 },
        '윤준호':  { pos:'C', salary:0.31 },
        '박계범':  { pos:'2B', salary:0.31 },
        // ─── 신인/육성 (0.3억) ───
        '최주형':  { pos:'P', salary:0.3 },
        '이주호':  { pos:'P', salary:0.3 },
        '서준오':  { pos:'P', salary:0.3 },
        '이주엽':  { pos:'P', salary:0.3 },
        '정성헌':  { pos:'P', salary:0.3 },
        '안민겸':  { pos:'P', salary:0.3 },
        '임종훈':  { pos:'P', salary:0.3 },
        '안치호':  { pos:'P', salary:0.3 },
        '이기석':  { pos:'P', salary:0.3 },
        '박웅':    { pos:'P', salary:0.3 },
        '제환유':  { pos:'P', salary:0.3 },
        '양현진':  { pos:'P', salary:0.3 },
        '최우인':  { pos:'P', salary:0.3 },
        '김지윤':  { pos:'P', salary:0.3 },
        '장우진':  { pos:'P', salary:0.3 },
        '황희천':  { pos:'P', salary:0.3 },
        '김성재':  { pos:'C', salary:0.3 },
        '장규빈':  { pos:'C', salary:0.3 },
        '이희성':  { pos:'C', salary:0.3 },
        '신민철':  { pos:'SS', salary:0.3 },
        '지강혁':  { pos:'SS', salary:0.3 },
        '이선우':  { pos:'SS', salary:0.3 },
        '한다현':  { pos:'SS', salary:0.3 },
        '김준상':  { pos:'2B', salary:0.3 },
        '임현철':  { pos:'SS', salary:0.3 },
        '심건보':  { pos:'SS', salary:0.3 },
        '남태웅':  { pos:'SS', salary:0.3 },
        '신우열':  { pos:'RF', salary:0.3 },
        '김주오':  { pos:'RF', salary:0.3 },
        '천현재':  { pos:'CF', salary:0.3 },
        '김문수':  { pos:'CF', salary:0.3 },
        '주양준':  { pos:'RF', salary:0.3 },
        '엄지민':  { pos:'LF', salary:0.3 },
    },
    'KT': {
        '김현수': { pos:'LF', AVG:.298, OBP:.384, SLG:.422, OPS:.806, 'wRC+':133.1, WAR:3.36, oWAR:3.61, dWAR:-0.24, H:144, '2B':24, '3B':0, HR:12, RBI:90, R:66, SB:4, CS:0, BB:64, SO:73, G:140, PA:552, AB:483, IsoP:.124, salary:5.0, defRAA:-1.35, rangeRAA:-0.14, errRAA:0.46 },
    },
};

// ─── 2군(퓨처스리그) 말소 명단 ───
// 팀 코드가 없으면 해당 팀은 2군 선수 없이 시작 (나중에 추가 가능)
const FUTURES_ROSTERS = {
    '한화': {
        P: ['문동주','장유호','박재규','김범준','양수호','권민규','주현상','한서구','강건우','엄요셉'],
        C: ['박상언','정우성'],
        IF: ['정민규','최원준','김준수','한경빈','한지윤','박정현','배승수','이지성'],
        OF: ['이도훈','임종찬','권광민','유로결','유민','최윤호'],
    },
    'LG': {
        P: ['이우찬','백승현','배재준','우강훈','박시원','박명근','성동현','정우영','김유영','김대현','김동현','김진수','조건희','권우준','진우영','김종운','안시후','허준혁','김주온','이민호','최지명','박성진','장시환','조원태','우명현','박준성','양우진','이상영','이믿음','윤형민','성준서','하현규','김지용','허용주','임정균','원상훈','양진혁','이종준'],
        C: ['김민수','이한림','김준태','강민기','박준기','전경원'],
        IF: ['김정율','손용준','추세현','김성진','문정빈','주정환','이태훈','송대현','이지백','강민규','엄태경','김주성','우정안','곽민호','김유민'],
        OF: ['함창건','서영준','박현우','이준서','박관우','김현종','최명경','권동혁'],
    },
    'SSG': {
        P: ['김성민','윤태현','장지훈','신지환','최수호','천범석'],
        C: ['이율예','김민식','신범수'],
        IF: ['박명현','김민준','석정우','문상준','최윤석','안재연'],
        OF: ['김정민','이승민','한유섬','류효승','박정빈','이원준'],
    },
    '키움': {
        P: ['양지율','김서준','이태양','김연주','임진묵','백진수','이태준','한민우','최현우','김태언','김유빈'],
        C: ['김동헌','김주영'],
        IF: ['김웅빈','김지석','염승원','양현종','전태현','권혁빈','서유신','유정택'],
        OF: ['임병욱','주성원','원성준','박주홍','박채울'],
    },
    '두산': {
        P: ['최주형','김정우','박정수','김민규','최승용','이주호','이교훈','최종인','서준오','이주엽','김명신','김유성','김호준','박웅','윤태호','최민석','제환유','김한중','양현진','최우인','김지윤','장우진','황희천','임종훈','정성헌','안치호','안민겸','이기석'],
        C: ['김성재','박민준','윤준호','장규빈','류현준','이희성'],
        IF: ['박성재','김민혁','박계범','신민철','지강혁','이선우','한다현','김준상','임현철','심건보','남태웅'],
        OF: ['김민석','전다민','김대한','신우열','천현재','김주오','김문수','주양준','엄지민'],
    },
    'KT': {
        P: ['임준형','최동환','이채호','문용익','김태오','박건우','김정운','원상현','이원재','한지웅'],
        C: ['김민석','박치성'],
        IF: ['강민성','문상철','오서진','안인산','손민석','임상우','김건휘','이용현','박성준'],
        OF: ['신범준','유준규','최동희','박민석','김경환'],
    },
    'NC': {
        P: ['정구범','김재열','최성영','하준영','조민석','박지한','전사민','최우석','이세민','강태경','김태현'],
        C: ['안중열','이희성'],
        IF: ['오태양','도태훈','윤준혁','한재환','김건','박인우','신성호','이한'],
        OF: ['박시원','이우성','고승완','김범준'],
    },
    '롯데': {
        P: ['구승민','송재영','최충연','김태균','하혜성','조경민','장세진','김창훈'],
        C: ['김현도','박건우','이건희'],
        IF: ['최항','이태경','박지훈','김호범','이정민','이지훈'],
        OF: ['조세진','김동현','김한홀','이인한','윤수녕','조민영'],
    },
    '삼성': {
        P: ['최하늘','박용재','허윤동','김백산','김유현','김동현','홍승원','황정현','신정환'],
        C: ['이병헌','김도환','이서준'],
        IF: ['이창용','양우현','박장민','김상준','이한민'],
        OF: ['김재혁','김태훈','윤정빈','류승민','강준서','김상민'],
    },
    'KIA': {
        P: ['김현수','윤중현','이형범','김건국','이태양','정찬화','한재승','이호민','조건호','김경묵'],
        C: ['권다결','김선우','신명승'],
        IF: ['최정용','박상준','김재현','한준희','송호정','엄준현','박종혁'],
        OF: ['정해원','한승연','김석환','김민규','고종욱','이영재'],
    },
};

// ─── 2군 선수 상세 정보 ───
const FUTURES_DETAILS = {
    '한화': {
        '문동주':  { no: 1,   tb: '우투우타', birth: '2003-12-23', h: 188, w: 97 },
        '장유호':  { no: 28,  tb: '우투우타', birth: '2000-05-25', h: 179, w: 80 },
        '박재규':  { no: 39,  tb: '우투우타', birth: '2003-07-03', h: 181, w: 83 },
        '김범준':  { no: 40,  tb: '우투우타', birth: '2000-09-30', h: 175, w: 79 },
        '양수호':  { no: 47,  tb: '우투우타', birth: '2006-09-09', h: 187, w: 82 },
        '권민규':  { no: 64,  tb: '좌투좌타', birth: '2006-05-13', h: 188, w: 90 },
        '주현상':  { no: 66,  tb: '우투우타', birth: '1992-08-10', h: 177, w: 92 },
        '한서구':  { no: 67,  tb: '좌투좌타', birth: '2003-12-04', h: 191, w: 98 },
        '강건우':  { no: 69,  tb: '좌투좌타', birth: '2007-07-19', h: 188, w: 89 },
        '엄요셉':  { no: 108, tb: '우투우타', birth: '2006-05-29', h: 190, w: 94 },
        '박상언':  { no: 42,  tb: '우투우타', birth: '1997-03-03', h: 185, w: 90 },
        '정우성':  { no: 115, tb: '우투우타', birth: '2002-04-11', h: 183, w: 88 },
        '정민규':  { no: 2,   tb: '우투우타', birth: '2003-01-10', h: 183, w: 101 },
        '최원준':  { no: 3,   tb: '우투좌타', birth: '2004-05-01', h: 188, w: 84 },
        '김준수':  { no: 4,   tb: '우투좌타', birth: '2007-03-27', h: 184, w: 77 },
        '한경빈':  { no: 6,   tb: '우투좌타', birth: '1998-12-11', h: 178, w: 69 },
        '한지윤':  { no: 36,  tb: '우투우타', birth: '2006-04-10', h: 188, w: 98 },
        '박정현':  { no: 63,  tb: '우투우타', birth: '2001-07-27', h: 183, w: 80 },
        '배승수':  { no: 98,  tb: '우투우타', birth: '2006-05-15', h: 184, w: 73 },
        '이지성':  { no: 106, tb: '우투우타', birth: '2005-11-29', h: 180, w: 78 },
        '이도훈':  { no: 8,   tb: '우투우타', birth: '2003-08-27', h: 172, w: 74 },
        '임종찬':  { no: 9,   tb: '우투좌타', birth: '2001-09-28', h: 184, w: 85 },
        '권광민':  { no: 17,  tb: '좌투좌타', birth: '1997-12-12', h: 189, w: 102 },
        '유로결':  { no: 33,  tb: '우투우타', birth: '2000-05-30', h: 186, w: 83 },
        '유민':    { no: 65,  tb: '우투우타', birth: '2003-01-20', h: 187, w: 92 },
        '최윤호':  { no: 114, tb: '우투좌타', birth: '2000-03-06', h: 175, w: 76 },
    },
    'LG': {
        '김유영':  { no: 0,   tb: '좌투좌타', birth: '1994-05-02', h: 180, w: 83 },
        '김대현':  { no: 12,  tb: '우투우타', birth: '1997-03-08', h: 188, w: 100 },
        '김동현':  { no: 43,  tb: '우투우타', birth: '2005-03-03', h: 192, w: 95 },
        '김진수':  { no: 45,  tb: '우투우타', birth: '1998-08-31', h: 179, w: 82 },
        '조건희':  { no: 48,  tb: '좌투좌타', birth: '2002-03-26', h: 184, w: 84 },
        '권우준':  { no: 49,  tb: '우투우타', birth: '2007-01-08', h: 187, w: 92 },
        '진우영':  { no: 101, tb: '우투우타', birth: '2001-02-05', h: 188, w: 97 },
        '김종운':  { no: 103, tb: '우투우타', birth: '2006-09-11', h: 186, w: 85 },
        '안시후':  { no: 109, tb: '우투우타', birth: '2006-05-02', h: 190, w: 84 },
        '허준혁':  { no: 129, tb: '우투우타', birth: '1999-07-02', h: 180, w: 85 },
        '김민수':  { no: 62,  tb: '우투우타', birth: '1991-03-02', h: 177, w: 80 },
        '이한림':  { no: 106, tb: '우투우타', birth: '2006-11-18', h: 182, w: 92 },
        '김정율':  { no: 14,  tb: '우투우타', birth: '1998-03-18', h: 184, w: 97 },
        '손용준':  { no: 15,  tb: '우투우타', birth: '2000-02-15', h: 178, w: 85 },
        '추세현':  { no: 35,  tb: '우투우타', birth: '2006-04-19', h: 187, w: 90 },
        '김성진':  { no: 36,  tb: '우투우타', birth: '2000-03-17', h: 183, w: 100 },
        '문정빈':  { no: 56,  tb: '우투우타', birth: '2003-08-15', h: 186, w: 90 },
        '주정환':  { no: 107, tb: '우투좌타', birth: '2004-05-27', h: 180, w: 70 },
        '이태훈':  { no: 130, tb: '우투좌타', birth: '2006-08-21', h: 183, w: 83 },
        '송대현':  { no: 131, tb: '우투우타', birth: '2000-02-03', h: 180, w: 82 },
        '김주성':  { no: 5,   tb: '우투우타', birth: '1998-01-30', h: 180, w: 81 },
        '함창건':  { no: 24,  tb: '좌투좌타', birth: '2001-08-18', h: 176, w: 83 },
        '서영준':  { no: 60,  tb: '우투우타', birth: '2006-03-18', h: 186, w: 90 },
        '엄태경':  { no: 104, tb: '우투좌타', birth: '2003-05-03', h: 184, w: 83 },
        '박현우':  { no: 108, tb: '우투우타', birth: '2005-02-20', h: 184, w: 88 },
        '이준서':  { no: 133, tb: '좌투좌타', birth: '2004-11-18', h: 187, w: 85 },
        // ─ 2026 추가 등록 선수 ─
        '김주온':  { no: 57,  tb: '우투우타', birth: '2003-05-15', h: 183, w: 82 },
        '이민호':  { no: 26,  tb: '우투우타', birth: '2002-08-20', h: 185, w: 85 },
        '최지명':  { no: 16,  tb: '좌투좌타', birth: '2001-11-03', h: 184, w: 82 },
        '장시환':  { no: 28,  tb: '우투우타', birth: '2002-03-25', h: 182, w: 85 },
        '조원태':  { no: 38,  tb: '우투우타', birth: '2004-06-12', h: 180, w: 78 },
        '김준태':  { no: 44,  tb: '우투우타', birth: '2003-09-08', h: 183, w: 80 },
        '박준성':  { no: 59,  tb: '좌투좌타', birth: '2005-01-22', h: 184, w: 83 },
        '박관우':  { no: 64,  tb: '우투좌타', birth: '2003-04-17', h: 180, w: 78 },
        '양우진':  { no: 65,  tb: '우투우타', birth: '2006-07-30', h: 190, w: 98 },
        '김현종':  { no: 66,  tb: '우투우타', birth: '2006-02-14', h: 182, w: 78 },
        '우명현':  { no: 69,  tb: '우투우타', birth: '2005-05-09', h: 192, w: 103 },
        '강민기':  { no: 102, tb: '우투우타', birth: '2006-10-20', h: 184, w: 95 },
        '이지백':  { no: 111, tb: '우투우타', birth: '2006-06-28', h: 183, w: 87 },
        '박준기':  { no: 112, tb: '우투우타', birth: '2006-08-11', h: 184, w: 80 },
        '윤형민':  { no: 113, tb: '우투우타', birth: '2006-01-05', h: 185, w: 88 },
        '박성진':  { no: 114, tb: '좌투좌타', birth: '2005-12-18', h: 193, w: 95 },
        '강민규':  { no: 117, tb: '우투우타', birth: '2006-04-22', h: 185, w: 82 },
        '전경원':  { no: 128, tb: '우투우타', birth: '2006-09-03', h: 186, w: 84 },
        // ─ 2026 신규 등록 선수 ─
        '이상영':  { no: 100, tb: '좌투좌타', birth: '2000-07-15', h: 183, w: 80 },
        '이믿음':  { no: 105, tb: '우투우타', birth: '2002-04-10', h: 185, w: 82 },
        '성준서':  { no: 118, tb: '우투우타', birth: '2006-09-20', h: 186, w: 84 },
        '하현규':  { no: 119, tb: '우투우타', birth: '2001-11-05', h: 184, w: 80 },
        '김지용':  { no: 120, tb: '좌투좌타', birth: '2002-06-18', h: 181, w: 78 },
        '허용주':  { no: 121, tb: '우투우타', birth: '2004-03-22', h: 183, w: 80 },
        '임정균':  { no: 125, tb: '우투우타', birth: '2004-08-14', h: 185, w: 82 },
        '원상훈':  { no: 126, tb: '좌투좌타', birth: '2004-01-30', h: 182, w: 78 },
        '양진혁':  { no: 127, tb: '우투우타', birth: '2003-10-08', h: 184, w: 80 },
        '이종준':  { no: 134, tb: '우투우타', birth: '2001-05-25', h: 186, w: 85 },
        '우정안':  { no: 110, tb: '우투좌타', birth: '2006-02-14', h: 180, w: 76 },
        '곽민호':  { no: 124, tb: '우투우타', birth: '2004-07-19', h: 183, w: 80 },
        '김유민':  { no: null, tb: '우투우타', birth: '2002-09-12', h: 182, w: 78 },
        '최명경':  { no: 116, tb: '우투좌타', birth: '2005-05-30', h: 181, w: 76 },
        '권동혁':  { no: 132, tb: '우투우타', birth: '2004-11-15', h: 184, w: 80 },
    },
    'SSG': {
        '김성민':  { no: 11,  tb: '우투우타', birth: '2001-04-30', h: 185, w: 97 },
        '윤태현':  { no: 12,  tb: '우언우타', birth: '2003-10-10', h: 189, w: 93 },
        '장지훈':  { no: 21,  tb: '우투우타', birth: '1998-12-06', h: 177, w: 78 },
        '신지환':  { no: 60,  tb: '좌투좌타', birth: '2006-04-17', h: 180, w: 81 },
        '최수호':  { no: 62,  tb: '우투우타', birth: '2000-07-19', h: 183, w: 78 },
        '천범석':  { no: 68,  tb: '우투우타', birth: '2006-03-06', h: 183, w: 86 },
        '이율예':  { no: 0,   tb: '우투우타', birth: '2006-11-21', h: 183, w: 90 },
        '김민식':  { no: 24,  tb: '우투좌타', birth: '1989-06-28', h: 180, w: 80 },
        '신범수':  { no: 25,  tb: '우투좌타', birth: '1998-01-25', h: 177, w: 83 },
        '박명현':  { no: 7,   tb: '우투우타', birth: '2001-06-16', h: 185, w: 80 },
        '김민준':  { no: 47,  tb: '우투우타', birth: '2004-03-20', h: 181, w: 78 },
        '석정우':  { no: 52,  tb: '우투우타', birth: '1999-01-20', h: 180, w: 82 },
        '문상준':  { no: 53,  tb: '우투우타', birth: '2001-03-14', h: 183, w: 80 },
        '최윤석':  { no: 65,  tb: '우투우타', birth: '2006-04-25', h: 187, w: 93 },
        '안재연':  { no: 111, tb: '우투좌타', birth: '2003-04-10', h: 177, w: 83 },
        '김정민':  { no: 4,   tb: '좌투좌타', birth: '2004-03-07', h: 180, w: 75 },
        '이승민':  { no: 9,   tb: '좌투좌타', birth: '2005-01-06', h: 187, w: 90 },
        '한유섬':  { no: 35,  tb: '우투좌타', birth: '1989-08-09', h: 190, w: 105 },
        '류효승':  { no: 45,  tb: '우투우타', birth: '1996-07-16', h: 190, w: 100 },
        '박정빈':  { no: 58,  tb: '우투우타', birth: '2002-06-14', h: 182, w: 80 },
        '이원준':  { no: 100, tb: '좌투우타', birth: '2006-03-15', h: 181, w: 95 },
    },
    '키움': {
        '양지율':  { no: 55,  tb: '우투우타', birth: '1998-12-16', h: 185, w: 103 },
        '김서준':  { no: 59,  tb: '우투좌타', birth: '2006-12-22', h: 187, w: 83 },
        '이태양':  { no: 66,  tb: '우투우타', birth: '2007-03-03', h: 180, w: 80 },
        '김연주':  { no: 68,  tb: '우투우타', birth: '2004-02-27', h: 175, w: 75 },
        '임진묵':  { no: 69,  tb: '우투우타', birth: '2006-04-23', h: 181, w: 85 },
        '백진수':  { no: 91,  tb: '우투우타', birth: '2003-02-15', h: 191, w: 97 },
        '이태준':  { no: 109, tb: '우투우타', birth: '2005-11-27', h: 183, w: 80 },
        '한민우':  { no: 110, tb: '좌투좌타', birth: '1999-04-27', h: 178, w: 82 },
        '최현우':  { no: 112, tb: '우투우타', birth: '2007-07-19', h: 190, w: 90 },
        '김태언':  { no: 113, tb: '우투우타', birth: '2006-07-25', h: 183, w: 84 },
        '김유빈':  { no: 117, tb: '우투우타', birth: '2007-03-09', h: 189, w: 75 },
        '김동헌':  { no: 44,  tb: '우투우타', birth: '2004-07-15', h: 182, w: 91 },
        '김주영':  { no: 116, tb: '우투좌타', birth: '2007-02-05', h: 181, w: 85 },
        '김웅빈':  { no: 10,  tb: '우투좌타', birth: '1996-02-09', h: 182, w: 97 },
        '김지석':  { no: 26,  tb: '우투좌타', birth: '2007-02-19', h: 185, w: 83 },
        '염승원':  { no: 39,  tb: '우투좌타', birth: '2006-03-20', h: 180, w: 78 },
        '양현종':  { no: 60,  tb: '우투우타', birth: '2006-08-15', h: 177, w: 84 },
        '전태현':  { no: 97,  tb: '우투좌타', birth: '2006-03-02', h: 180, w: 82 },
        '권혁빈':  { no: 101, tb: '우투우타', birth: '2005-11-04', h: 185, w: 75 },
        '서유신':  { no: 104, tb: '우투우타', birth: '2000-08-17', h: 176, w: 76 },
        '유정택':  { no: 115, tb: '우투좌타', birth: '2003-11-20', h: 170, w: 70 },
        '임병욱':  { no: 17,  tb: '우투좌타', birth: '1995-09-30', h: 187, w: 94 },
        '주성원':  { no: 25,  tb: '우투우타', birth: '2000-08-30', h: 182, w: 95 },
        '원성준':  { no: 33,  tb: '우투좌타', birth: '2000-03-31', h: 181, w: 80 },
        '박주홍':  { no: 57,  tb: '좌투좌타', birth: '2001-04-16', h: 187, w: 87 },
        '박채울':  { no: 108, tb: '우투우타', birth: '2004-11-20', h: 185, w: 86 },
    },
    '두산': {
        // ─── 투수 ───
        '최주형':  { no: 15,  tb: '좌투좌타', birth: '2006-08-19', h: 174, w: 70 },
        '김정우':  { no: 16,  tb: '우투우타', birth: '1999-05-15', h: 183, w: 87 },
        '박정수':  { no: 17,  tb: '우언좌타', birth: '1996-01-29', h: 178, w: 74 },
        '김민규':  { no: 19,  tb: '우투좌타', birth: '1999-05-07', h: 183, w: 90 },
        '최승용':  { no: 28,  tb: '좌투좌타', birth: '2001-05-11', h: 183, w: 82 },
        '이주호':  { no: 35,  tb: '좌투좌타', birth: '2006-11-21', h: 180, w: 78 },
        '이교훈':  { no: 36,  tb: '좌투좌타', birth: '2000-05-29', h: 181, w: 83 },
        '최종인':  { no: 40,  tb: '우투우타', birth: '2001-05-01', h: 183, w: 82 },
        '서준오':  { no: 41,  tb: '우투우타', birth: '2005-03-05', h: 185, w: 85 },
        '이주엽':  { no: 43,  tb: '우투우타', birth: '2001-03-26', h: 183, w: 82 },
        '김명신':  { no: 46,  tb: '우투우타', birth: '1993-11-29', h: 178, w: 90 },
        '김유성':  { no: 55,  tb: '우투우타', birth: '2002-01-01', h: 183, w: 82 },
        '김호준':  { no: 56,  tb: '좌투좌타', birth: '1998-05-17', h: 180, w: 82 },
        '박웅':    { no: 57,  tb: '우투우타', birth: '1997-11-12', h: 183, w: 82 },
        '윤태호':  { no: 65,  tb: '우투우타', birth: '2003-10-10', h: 190, w: 88 },
        '최민석':  { no: 68,  tb: '우투우타', birth: '2006-07-02', h: 185, w: 82 },
        '제환유':  { no: 93,  tb: '우투좌타', birth: '2000-09-30', h: 183, w: 82 },
        '김한중':  { no: 95,  tb: '우투우타', birth: '2004-11-03', h: 183, w: 89 },
        '양현진':  { no: 100, tb: '우투우타', birth: '2002-01-03', h: 183, w: 82 },
        '최우인':  { no: 101, tb: '우투우타', birth: '2002-08-09', h: 183, w: 82 },
        '김지윤':  { no: 104, tb: '우투우타', birth: '2004-01-13', h: 183, w: 82 },
        '장우진':  { no: 106, tb: '우투우타', birth: '2004-03-20', h: 183, w: 82 },
        '황희천':  { no: 107, tb: '좌투좌타', birth: '2006-11-06', h: 190, w: 93 },
        '임종훈':  { no: 115, tb: '우투좌타', birth: '2007-05-07', h: 183, w: 80 },
        '정성헌':  { no: 119, tb: '우투우타', birth: '2006-09-11', h: 185, w: 82 },
        '안치호':  { no: 120, tb: '좌투좌타', birth: '2004-11-30', h: 183, w: 80 },
        '안민겸':  { no: 122, tb: '우투우타', birth: '2004-05-17', h: 183, w: 80 },
        '이기석':  { no: 123, tb: '좌투좌타', birth: '2002-06-07', h: 183, w: 80 },
        // ─── 포수 ───
        '김성재':  { no: 20,  tb: '우투우타', birth: '2006-05-16', h: 182, w: 98 },
        '박민준':  { no: 26,  tb: '우투우타', birth: '2002-10-21', h: 183, w: 95 },
        '윤준호':  { no: 27,  tb: '우투우타', birth: '2000-11-14', h: 180, w: 82 },
        '장규빈':  { no: 44,  tb: '우투우타', birth: '2001-04-21', h: 183, w: 82 },
        '류현준':  { no: 67,  tb: '우투우타', birth: '2005-03-25', h: 182, w: 92 },
        '이희성':  { no: 121, tb: '우투우타', birth: '2004-02-02', h: 180, w: 85 },
        // ─── 내야수 ───
        '박성재':  { no: 5,   tb: '우투우타', birth: '2002-11-18', h: 186, w: 98 },
        '김민혁':  { no: 10,  tb: '우투우타', birth: '1996-05-03', h: 188, w: 100 },
        '박계범':  { no: 14,  tb: '우투우타', birth: '1996-01-11', h: 183, w: 80 },
        '신민철':  { no: 103, tb: '우투우타', birth: '2003-01-13', h: 183, w: 80 },
        '지강혁':  { no: 105, tb: '우투좌타', birth: '2000-08-14', h: 181, w: 83 },
        '이선우':  { no: 108, tb: '우투좌타', birth: '2006-04-04', h: 182, w: 80 },
        '한다현':  { no: 109, tb: '우투좌타', birth: '2006-08-25', h: 181, w: 85 },
        '김준상':  { no: 110, tb: '우투좌타', birth: '2004-08-02', h: 180, w: 78 },
        '임현철':  { no: 116, tb: '우투좌타', birth: '2007-10-21', h: 180, w: 78 },
        '심건보':  { no: 117, tb: '우투좌타', birth: '2003-11-17', h: 182, w: 82 },
        '남태웅':  { no: 118, tb: '우투우타', birth: '2007-01-08', h: 175, w: 78 },
        // ─── 외야수 ───
        '김민석':  { no: 2,   tb: '우투좌타', birth: '2004-05-09', h: 183, w: 80 },
        '전다민':  { no: 9,   tb: '우투좌타', birth: '2001-08-21', h: 177, w: 75 },
        '김대한':  { no: 32,  tb: '우투우타', birth: '2000-12-06', h: 185, w: 83 },
        '신우열':  { no: 38,  tb: '우투우타', birth: '2001-12-30', h: 183, w: 82 },
        '천현재':  { no: 58,  tb: '우투좌타', birth: '1999-07-05', h: 183, w: 90 },
        '김주오':  { no: 66,  tb: '우투우타', birth: '2007-09-14', h: 178, w: 95 },
        '김문수':  { no: 102, tb: '우투좌타', birth: '2004-03-29', h: 188, w: 94 },
        '주양준':  { no: 111, tb: '우투우타', birth: '2006-04-09', h: 183, w: 82 },
        '엄지민':  { no: 114, tb: '우투좌타', birth: '2005-11-22', h: 182, w: 80 },
    },
    'KT': {
        '임준형':  { no: 14,  tb: '좌투좌타', birth: '2000-11-16', h: 180, w: 82 },
        '최동환':  { no: 16,  tb: '우투우타', birth: '1989-09-19', h: 184, w: 83 },
        '이채호':  { no: 17,  tb: '우언우타', birth: '1998-11-23', h: 185, w: 85 },
        '문용익':  { no: 18,  tb: '우투우타', birth: '1995-02-04', h: 178, w: 93 },
        '김태오':  { no: 20,  tb: '좌투좌타', birth: '1997-07-29', h: 183, w: 84 },
        '박건우':  { no: 46,  tb: '우투우타', birth: '2006-11-28', h: 182, w: 95 },
        '김정운':  { no: 61,  tb: '우언우타', birth: '2004-04-21', h: 184, w: 84 },
        '원상현':  { no: 63,  tb: '우투우타', birth: '2004-10-16', h: 183, w: 83 },
        '이원재':  { no: 64,  tb: '좌투좌타', birth: '2003-05-07', h: 187, w: 98 },
        '한지웅':  { no: 93,  tb: '좌투좌타', birth: '2003-07-07', h: 189, w: 82 },
        '김민석':  { no: 44,  tb: '우투우타', birth: '2005-07-22', h: 181, w: 93 },
        '박치성':  { no: 115, tb: '우투우타', birth: '2003-04-26', h: 178, w: 88 },
        '강민성':  { no: 5,   tb: '우투우타', birth: '1999-12-08', h: 180, w: 85 },
        '문상철':  { no: 24,  tb: '우투우타', birth: '1991-04-06', h: 184, w: 85 },
        '오서진':  { no: 25,  tb: '우투우타', birth: '2005-06-22', h: 188, w: 80 },
        '안인산':  { no: 50,  tb: '우투우타', birth: '2001-02-27', h: 181, w: 95 },
        '손민석':  { no: 57,  tb: '우투좌타', birth: '2004-06-21', h: 177, w: 70 },
        '임상우':  { no: 94,  tb: '우투좌타', birth: '2003-01-03', h: 180, w: 75 },
        '김건휘':  { no: 97,  tb: '우투우타', birth: '2007-09-11', h: 180, w: 96 },
        '이용현':  { no: 106, tb: '우투좌타', birth: '2006-01-06', h: 188, w: 85 },
        '박성준':  { no: 120, tb: '우투좌타', birth: '2003-07-28', h: 168, w: 71 },
        '신범준':  { no: 62,  tb: '우투좌타', birth: '2002-06-01', h: 189, w: 78 },
        '유준규':  { no: 67,  tb: '우투좌타', birth: '2002-08-16', h: 176, w: 69 },
        '최동희':  { no: 69,  tb: '우투우타', birth: '2003-07-26', h: 184, w: 80 },
        '박민석':  { no: 104, tb: '우투우타', birth: '2006-07-27', h: 178, w: 83 },
        '김경환':  { no: 109, tb: '우투좌타', birth: '2007-01-04', h: 181, w: 78 },
    },
    'NC': {
        '정구범':  { no: 8,   tb: '좌투좌타', birth: '2000-06-16', h: 183, w: 73 },
        '김재열':  { no: 21,  tb: '우투우타', birth: '1996-01-02', h: 183, w: 97 },
        '최성영':  { no: 26,  tb: '좌투좌타', birth: '1997-04-28', h: 180, w: 85 },
        '하준영':  { no: 29,  tb: '좌투좌타', birth: '1999-09-06', h: 182, w: 79 },
        '조민석':  { no: 47,  tb: '우투좌타', birth: '1998-12-21', h: 180, w: 81 },
        '박지한':  { no: 56,  tb: '좌투좌타', birth: '2000-10-21', h: 185, w: 90 },
        '전사민':  { no: 57,  tb: '우투우타', birth: '1999-07-06', h: 194, w: 85 },
        '최우석':  { no: 64,  tb: '우투우타', birth: '2005-03-31', h: 190, w: 90 },
        '이세민':  { no: 68,  tb: '우투우타', birth: '2005-08-08', h: 187, w: 100 },
        '강태경':  { no: 100, tb: '우투좌타', birth: '2001-07-26', h: 188, w: 95 },
        '김태현':  { no: 109, tb: '좌투좌타', birth: '1998-03-21', h: 188, w: 95 },
        '안중열':  { no: 22,  tb: '우투우타', birth: '1995-09-01', h: 176, w: 87 },
        '이희성':  { no: 32,  tb: '우투우타', birth: '2007-04-01', h: 185, w: 95 },
        '오태양':  { no: 6,   tb: '우투우타', birth: '2002-04-25', h: 180, w: 78 },
        '도태훈':  { no: 16,  tb: '우투좌타', birth: '1993-03-18', h: 184, w: 85 },
        '윤준혁':  { no: 31,  tb: '우투우타', birth: '2001-07-26', h: 186, w: 86 },
        '한재환':  { no: 35,  tb: '우투우타', birth: '2001-10-19', h: 177, w: 89 },
        '김건':    { no: 52,  tb: '우투좌타', birth: '2007-05-23', h: 180, w: 81 },
        '박인우':  { no: 112, tb: '우투우타', birth: '2001-12-14', h: 177, w: 80 },
        '신성호':  { no: 118, tb: '우투우타', birth: '2003-09-28', h: 178, w: 76 },
        '이한':    { no: 122, tb: '우투좌타', birth: '2003-08-25', h: 181, w: 83 },
        '박시원':  { no: 53,  tb: '우투좌타', birth: '2001-05-30', h: 185, w: 85 },
        '이우성':  { no: 55,  tb: '우투우타', birth: '1994-07-17', h: 182, w: 95 },
        '고승완':  { no: 58,  tb: '우투좌타', birth: '2001-03-15', h: 178, w: 81 },
        '김범준':  { no: 115, tb: '우투우타', birth: '2000-04-20', h: 183, w: 90 },
    },
    '롯데': {
        '구승민':  { no: 22,  tb: '우투우타', birth: '1990-06-12', h: 182, w: 86 },
        '송재영':  { no: 59,  tb: '좌투좌타', birth: '2002-06-20', h: 181, w: 84 },
        '최충연':  { no: 61,  tb: '우투우타', birth: '1997-03-05', h: 190, w: 85 },
        '김태균':  { no: 107, tb: '우투우타', birth: '2006-07-31', h: 191, w: 97 },
        '하혜성':  { no: 118, tb: '우투우타', birth: '2003-06-09', h: 191, w: 85 },
        '조경민':  { no: 128, tb: '우언우타', birth: '2004-09-17', h: 179, w: 78 },
        '장세진':  { no: 131, tb: '좌투좌타', birth: '2004-12-30', h: 179, w: 80 },
        '김창훈':  { no: 132, tb: '우투우타', birth: '2001-11-09', h: 185, w: 98 },
        '김현도':  { no: 109, tb: '우투우타', birth: '2002-04-26', h: 173, w: 88 },
        '박건우':  { no: 111, tb: '우투우타', birth: '2003-02-01', h: 183, w: 92 },
        '이건희':  { no: 120, tb: '우투우타', birth: '2003-03-31', h: 177, w: 90 },
        '최항':    { no: 14,  tb: '우투좌타', birth: '1994-01-03', h: 183, w: 88 },
        '이태경':  { no: 69,  tb: '우투우타', birth: '2002-11-24', h: 176, w: 77 },
        '박지훈':  { no: 108, tb: '우투우타', birth: '2002-05-14', h: 176, w: 75 },
        '김호범':  { no: 112, tb: '우투우타', birth: '2003-08-16', h: 186, w: 88 },
        '이정민':  { no: 113, tb: '우투우타', birth: '2003-11-20', h: 176, w: 80 },
        '이지훈':  { no: 114, tb: '우투우타', birth: '2003-01-13', h: 171, w: 66 },
        '조세진':  { no: 12,  tb: '우투우타', birth: '2003-11-21', h: 181, w: 86 },
        '김동현':  { no: 64,  tb: '우투좌타', birth: '2004-12-30', h: 185, w: 100 },
        '김한홀':  { no: 95,  tb: '우투좌타', birth: '2006-12-12', h: 189, w: 83 },
        '이인한':  { no: 102, tb: '우투우타', birth: '1998-12-24', h: 183, w: 95 },
        '윤수녕':  { no: 126, tb: '우투좌타', birth: '2000-03-01', h: 173, w: 73 },
        '조민영':  { no: 134, tb: '우투우타', birth: '2005-03-24', h: 186, w: 92 },
    },
    '삼성': {
        '최하늘':  { no: 37,  tb: '우언우타', birth: '1999-03-26', h: 190, w: 99 },
        '박용재':  { no: 68,  tb: '우투우타', birth: '2007-03-24', h: 195, w: 105 },
        '허윤동':  { no: 108, tb: '좌투좌타', birth: '2001-06-19', h: 181, w: 90 },
        '김백산':  { no: 113, tb: '우투우타', birth: '2003-10-13', h: 183, w: 86 },
        '김유현':  { no: 119, tb: '우투우타', birth: '2004-02-07', h: 184, w: 93 },
        '김동현':  { no: 123, tb: '우투우타', birth: '2001-05-25', h: 186, w: 95 },
        '홍승원':  { no: 131, tb: '우투우타', birth: '2001-12-06', h: 185, w: 95 },
        '황정현':  { no: 137, tb: '우투우타', birth: '2006-04-28', h: 187, w: 90 },
        '신정환':  { no: 140, tb: '우투우타', birth: '2003-04-28', h: 188, w: 83 },
        '이병헌':  { no: 23,  tb: '우투우타', birth: '1999-10-26', h: 180, w: 87 },
        '김도환':  { no: 24,  tb: '우투우타', birth: '2000-04-14', h: 178, w: 90 },
        '이서준':  { no: 134, tb: '우투우타', birth: '2007-06-25', h: 185, w: 95 },
        '이창용':  { no: 50,  tb: '우투우타', birth: '1999-06-03', h: 184, w: 89 },
        '양우현':  { no: 53,  tb: '우투좌타', birth: '2000-04-13', h: 175, w: 82 },
        '박장민':  { no: 116, tb: '우투우타', birth: '2003-09-02', h: 179, w: 80 },
        '김상준':  { no: 125, tb: '우투좌타', birth: '2002-12-30', h: 176, w: 75 },
        '이한민':  { no: 143, tb: '우투우타', birth: '2002-06-04', h: 185, w: 87 },
        '김재혁':  { no: 8,   tb: '우투우타', birth: '1999-12-26', h: 182, w: 85 },
        '김태훈':  { no: 25,  tb: '우투좌타', birth: '1996-03-31', h: 177, w: 78 },
        '윤정빈':  { no: 31,  tb: '우투좌타', birth: '1999-06-24', h: 182, w: 93 },
        '류승민':  { no: 43,  tb: '좌투좌타', birth: '2004-10-11', h: 185, w: 90 },
        '강준서':  { no: 105, tb: '우투우타', birth: '2000-10-13', h: 183, w: 85 },
        '김상민':  { no: 107, tb: '우투좌타', birth: '2003-12-06', h: 183, w: 83 },
    },
    'KIA': {
        '김현수':  { no: 17,  tb: '우투우타', birth: '2000-07-10', h: 185, w: 90 },
        '윤중현':  { no: 19,  tb: '우언우타', birth: '1995-04-25', h: 180, w: 84 },
        '이형범':  { no: 28,  tb: '우투우타', birth: '1994-02-27', h: 181, w: 80 },
        '김건국':  { no: 43,  tb: '우투우타', birth: '1988-02-02', h: 183, w: 86 },
        '이태양':  { no: 44,  tb: '우투좌타', birth: '1990-07-03', h: 192, w: 97 },
        '정찬화':  { no: 45,  tb: '우투우타', birth: '2006-06-10', h: 183, w: 90 },
        '한재승':  { no: 55,  tb: '우투우타', birth: '2001-11-21', h: 180, w: 90 },
        '이호민':  { no: 63,  tb: '우투우타', birth: '2006-08-26', h: 182, w: 85 },
        '조건호':  { no: 112, tb: '우투우타', birth: '2002-05-09', h: 182, w: 87 },
        '김경묵':  { no: 118, tb: '우투우타', birth: '1999-05-07', h: 183, w: 88 },
        '권다결':  { no: 103, tb: '우투우타', birth: '2002-01-23', h: 187, w: 94 },
        '김선우':  { no: 116, tb: '우투우타', birth: '2001-01-18', h: 178, w: 90 },
        '신명승':  { no: 142, tb: '우투우타', birth: '2002-11-02', h: 183, w: 94 },
        '최정용':  { no: 23,  tb: '우투좌타', birth: '1996-10-24', h: 179, w: 84 },
        '박상준':  { no: 50,  tb: '좌투좌타', birth: '2001-08-21', h: 178, w: 104 },
        '김재현':  { no: 110, tb: '우투좌타', birth: '2000-12-02', h: 176, w: 81 },
        '한준희':  { no: 119, tb: '우투우타', birth: '2007-07-01', h: 183, w: 80 },
        '송호정':  { no: 120, tb: '우투좌타', birth: '2002-03-10', h: 185, w: 78 },
        '엄준현':  { no: 131, tb: '우투우타', birth: '2006-04-20', h: 174, w: 75 },
        '박종혁':  { no: 133, tb: '우투우타', birth: '2007-10-05', h: 190, w: 88 },
        '정해원':  { no: 9,   tb: '우투우타', birth: '2004-05-21', h: 185, w: 87 },
        '한승연':  { no: 31,  tb: '우투우타', birth: '2003-06-09', h: 183, w: 92 },
        '김석환':  { no: 35,  tb: '좌투좌타', birth: '1999-02-28', h: 187, w: 97 },
        '김민규':  { no: 37,  tb: '우투우타', birth: '2007-01-26', h: 180, w: 73 },
        '고종욱':  { no: 57,  tb: '우투좌타', birth: '1989-01-11', h: 184, w: 83 },
        '이영재':  { no: 109, tb: '우투우타', birth: '2002-01-11', h: 185, w: 95 },
    },
};

// ─── 군보류 선수 ───
// 군 복무 중인 선수 (시즌 중 등록 불가)
const MILITARY_ROSTERS = {
    'LG': {
        P: [
            { name: '김윤식', no: null, tb: '좌투좌타', discharge: '2026-04-21', type: '사회복무요원' },
            { name: '김종우', no: null, tb: '우투우타', discharge: '2026-06-01', type: '현역' },
            { name: '강석현', no: null, tb: '좌투좌타', discharge: '2026-07-20', type: '현역' },
            { name: '오승윤', no: null, tb: '좌투좌타', discharge: '2026', type: '현역' },
            { name: '정지헌', no: null, tb: '우언우타', discharge: '2026-11-11', type: '상무' },
            { name: '김웅',   no: null, tb: '우투우타', discharge: '2027-06-15', type: '현역' },
            { name: '고영웅', no: null, tb: '좌투좌타', discharge: '2027', type: '현역' },
            { name: '허용주', no: null, tb: '우투우타', discharge: '2027', type: '현역' },
            { name: '박명근', no: null, tb: '우사우타', discharge: '2027-10-26', type: '상무' },
            { name: '김종운', no: null, tb: '우투우타', discharge: '2027-10-26', type: '상무' },
        ],
        C: [
            { name: '배강',   no: null, tb: '우투우타', discharge: '2026', type: '현역' },
            { name: '김성우', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
        ],
        IF: [
            { name: '김대원', no: null, tb: '우투우타', discharge: '2026-05-25', type: '현역' },
            { name: '김도윤', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '김범석', no: null, tb: '우투우타', discharge: null, type: '현역' },
        ],
        OF: [
            { name: '심규빈', no: null, tb: '우투좌타', discharge: '2027-01-27', type: '현역' },
            { name: '박관우', no: null, tb: '좌투좌타', discharge: '2027-10-26', type: '상무' },
        ],
    },
};

// ─── 선수 상세 정보 (팀별로 추가) ───
// { 이름: { no: 등번호, tb: '투타유형', birth: '생년월일', h: 키cm, w: 몸무게kg } }
const PLAYER_DETAILS = {
    '두산': {
        // 투수
        '박치국':  { no: 1,  tb: '우언우타', birth: '1998-03-10', h: 177, w: 78 },
        '타무라':  { no: 18, tb: '우투좌타', birth: '1994-09-19', h: 173, w: 79 },
        '이병헌':  { no: 29, tb: '좌투좌타', birth: '2003-06-04', h: 183, w: 95 },
        '양재훈':  { no: 30, tb: '우투우타', birth: '2003-05-01', h: 186, w: 89 },
        '잭로그':  { no: 39, tb: '좌투좌타', birth: '1996-04-23', h: 183, w: 84 },
        '최지강':  { no: 42, tb: '우투좌타', birth: '2001-07-23', h: 180, w: 88 },
        '이용찬':  { no: 45, tb: '우투우타', birth: '1989-01-02', h: 185, w: 85 },
        '곽빈':    { no: 47, tb: '우투우타', birth: '1999-05-28', h: 187, w: 95 },
        '박신지':  { no: 49, tb: '우투우타', birth: '1999-07-16', h: 185, w: 75 },
        '이영하':  { no: 50, tb: '우투우타', birth: '1997-11-01', h: 183, w: 82 },
        '최준호':  { no: 59, tb: '우투우타', birth: '2004-06-03', h: 188, w: 90 },
        '최원준':  { no: 61, tb: '우언우타', birth: '1994-12-21', h: 182, w: 91 },
        '김택연':  { no: 63, tb: '우투우타', birth: '2005-06-03', h: 181, w: 88 },
        '플렉센':  { no: 77, tb: '우투우타', birth: '1994-07-01', h: 190, w: 99 },
        // 포수
        '양의지':  { no: 25, tb: '우투우타', birth: '1987-06-05', h: 180, w: 95 },
        '김기연':  { no: 22, tb: '우투우타', birth: '1997-09-07', h: 178, w: 106 },
        // 내야수
        '임종성':  { no: 3,  tb: '우투우타', birth: '2005-03-03', h: 183, w: 90 },
        '오명진':  { no: 6,  tb: '우투좌타', birth: '2001-09-04', h: 179, w: 79 },
        '박찬호':  { no: 7,  tb: '우투우타', birth: '1995-06-05', h: 178, w: 72 },
        '이유찬':  { no: 13, tb: '우투우타', birth: '1998-08-05', h: 175, w: 68 },
        '강승호':  { no: 23, tb: '우투우타', birth: '1994-02-09', h: 178, w: 88 },
        '박지훈':  { no: 37, tb: '우투우타', birth: '2000-09-07', h: 183, w: 80 },
        '박준순':  { no: 52, tb: '우투우타', birth: '2006-07-13', h: 180, w: 80 },
        '양석환':  { no: 53, tb: '우투우타', birth: '1991-07-15', h: 185, w: 90 },
        '안재석':  { no: 62, tb: '우투좌타', birth: '2002-02-15', h: 185, w: 75 },
        // 외야수
        '김동준':  { no: 11, tb: '좌투좌타', birth: '2002-09-03', h: 193, w: 100 },
        '카메론':  { no: 24, tb: '우투우타', birth: '1997-01-15', h: 183, w: 83 },
        '정수빈':  { no: 31, tb: '좌투좌타', birth: '1990-10-07', h: 178, w: 72 },
        '김인태':  { no: 33, tb: '좌투좌타', birth: '1994-07-03', h: 178, w: 78 },
        '홍성호':  { no: 34, tb: '우투좌타', birth: '1997-07-15', h: 183, w: 95 },
        '조수행':  { no: 51, tb: '우투좌타', birth: '1993-08-30', h: 178, w: 73 },
    },
    '롯데': {
        // 투수
        '김강현':    { no: 19, tb: '우투좌타', birth: '1995-02-27', h: 177, w: 84 },
        '박세웅':    { no: 21, tb: '우투우타', birth: '1995-11-30', h: 182, w: 85 },
        '비슬리':    { no: 23, tb: '우투우타', birth: '1995-11-20', h: 188, w: 106 },
        '로드리게스': { no: 31, tb: '우투우타', birth: '1998-03-31', h: 193, w: 97 },
        '김원중':    { no: 34, tb: '우투좌타', birth: '1993-06-14', h: 192, w: 96 },
        '박정민':    { no: 36, tb: '우투좌타', birth: '2003-09-26', h: 188, w: 95 },
        '이민석':    { no: 37, tb: '우투우타', birth: '2003-12-10', h: 189, w: 95 },
        '쿄야마':    { no: 48, tb: '우투우타', birth: '1998-07-04', h: 183, w: 80 },
        '이준서':    { no: 54, tb: '우투우타', birth: '2006-08-05', h: 177, w: 77 },
        '윤성빈':    { no: 55, tb: '우투우타', birth: '1999-02-26', h: 197, w: 90 },
        '최준용':    { no: 56, tb: '우투우타', birth: '2001-10-10', h: 185, w: 85 },
        '박준우':    { no: 58, tb: '우투우타', birth: '2005-05-27', h: 190, w: 94 },
        '정철원':    { no: 65, tb: '우투우타', birth: '1999-03-27', h: 192, w: 95 },
        // 포수
        '유강남':    { no: 27, tb: '우투우타', birth: '1992-07-15', h: 182, w: 88 },
        '손성빈':    { no: 28, tb: '우투우타', birth: '2002-01-14', h: 186, w: 92 },
        // 내야수
        '전민재':    { no: 13, tb: '우투우타', birth: '1999-06-30', h: 181, w: 73 },
        '김민성':    { no: 16, tb: '우투우타', birth: '1988-12-17', h: 181, w: 94 },
        '이호준':    { no: 30, tb: '우투좌타', birth: '2004-03-20', h: 172, w: 72 },
        '노진혁':    { no: 52, tb: '우투좌타', birth: '1989-07-15', h: 184, w: 80 },
        '박승욱':    { no: 53, tb: '우투좌타', birth: '1992-12-04', h: 184, w: 83 },
        '한태양':    { no: 6,  tb: '우투우타', birth: '2003-09-15', h: 181, w: 76 },
        '이서준':    { no: 63, tb: '우투우타', birth: '2007-10-10', h: 183, w: 83 },
        // 외야수
        '황성빈':    { no: 0,  tb: '우투좌타', birth: '1997-12-19', h: 172, w: 76 },
        '레이예스':  { no: 29, tb: '우투양타', birth: '1994-10-05', h: 196, w: 87 },
        '신윤후':    { no: 3,  tb: '우투우타', birth: '1996-01-05', h: 177, w: 77 },
        '손호영':    { no: 33, tb: '우투우타', birth: '1994-08-23', h: 182, w: 88 },
        '장두성':    { no: 7,  tb: '우투좌타', birth: '1999-09-16', h: 176, w: 75 },
        '전준우':    { no: 8,  tb: '우투우타', birth: '1986-02-25', h: 184, w: 98 },
        '윤동희':    { no: 91, tb: '우투우타', birth: '2003-09-18', h: 187, w: 85 },
    },
    '삼성': {
        // 투수
        '최지광':    { no: 11, tb: '우투우타', birth: '1998-03-13', h: 173, w: 85 },
        '미야지':    { no: 15, tb: '우투우타', birth: '1999-08-02', h: 186, w: 90 },
        '최원태':    { no: 20, tb: '우투우타', birth: '1997-01-07', h: 184, w: 104 },
        '이승현':    { no: 26, tb: '우투우타', birth: '1991-11-20', h: 181, w: 92 },
        '이승민':    { no: 28, tb: '좌투좌타', birth: '2000-08-26', h: 174, w: 79 },
        '백정현':    { no: 29, tb: '좌투좌타', birth: '1987-07-13', h: 184, w: 80 },
        '임기영':    { no: 38, tb: '우언우타', birth: '1993-04-16', h: 184, w: 86 },
        '육선엽':    { no: 4,  tb: '우투우타', birth: '2005-07-13', h: 190, w: 90 },
        '배찬승':    { no: 55, tb: '좌투좌타', birth: '2006-01-01', h: 180, w: 85 },
        '장찬희':    { no: 60, tb: '우투우타', birth: '2007-10-05', h: 186, w: 80 },
        '김재윤':    { no: 62, tb: '우투우타', birth: '1990-09-16', h: 185, w: 91 },
        '오러클린':  { no: 64, tb: '좌투좌타', birth: '2000-03-14', h: 196, w: 101 },
        '후라도':    { no: 75, tb: '우투우타', birth: '1996-01-30', h: 188, w: 109 },
        // 포수
        '강민호':    { no: 47, tb: '우투우타', birth: '1985-08-18', h: 185, w: 100 },
        '박세혁':    { no: 52, tb: '우투좌타', birth: '1990-01-09', h: 181, w: 86 },
        // 내야수
        '디아즈':    { no: 0,  tb: '좌투좌타', birth: '1996-11-19', h: 188, w: 105 },
        '류지혁':    { no: 16, tb: '우투좌타', birth: '1994-01-13', h: 181, w: 75 },
        '이해승':    { no: 3,  tb: '우투우타', birth: '2000-08-01', h: 180, w: 86 },
        '김영웅':    { no: 30, tb: '우투좌타', birth: '2003-08-24', h: 183, w: 81 },
        '심재훈':    { no: 6,  tb: '우투우타', birth: '2006-03-03', h: 180, w: 80 },
        '전병우':    { no: 61, tb: '우투우타', birth: '1992-10-24', h: 182, w: 93 },
        '이재현':    { no: 7,  tb: '우투우타', birth: '2003-02-04', h: 180, w: 82 },
        // 외야수
        '김헌곤':    { no: 32, tb: '우투우타', birth: '1988-11-09', h: 174, w: 81 },
        '최형우':    { no: 34, tb: '우투좌타', birth: '1983-12-16', h: 180, w: 106 },
        '김성윤':    { no: 39, tb: '좌투좌타', birth: '1999-02-02', h: 163, w: 62 },
        '함수호':    { no: 40, tb: '좌투좌타', birth: '2006-03-10', h: 181, w: 88 },
        '구자욱':    { no: 5,  tb: '우투좌타', birth: '1993-02-12', h: 189, w: 75 },
        '홍현빈':    { no: 51, tb: '우투좌타', birth: '1997-08-29', h: 174, w: 70 },
        '김지찬':    { no: 58, tb: '우투좌타', birth: '2001-03-08', h: 163, w: 64 },
    },
    '키움': {
        // 투수
        '김성진':    { no: 21, tb: '우투좌타', birth: '1997-11-14', h: 183, w: 77 },
        '김재웅':    { no: 28, tb: '좌투좌타', birth: '1998-10-22', h: 171, w: 86 },
        '오석주':    { no: 31, tb: '우투우타', birth: '1998-04-14', h: 180, w: 74 },
        '와일스':    { no: 34, tb: '우투우타', birth: '1998-07-02', h: 193, w: 103 },
        '박윤성':    { no: 35, tb: '우투우타', birth: '2004-02-08', h: 183, w: 96 },
        '박진형':    { no: 40, tb: '우투우타', birth: '1994-06-10', h: 181, w: 77 },
        '유토':      { no: 48, tb: '우투좌타', birth: '1999-11-04', h: 185, w: 87 },
        '하영민':    { no: 50, tb: '우투우타', birth: '1995-05-07', h: 183, w: 74 },
        '알칸타라':  { no: 54, tb: '우투우타', birth: '1992-12-04', h: 193, w: 100 },
        '배동현':    { no: 61, tb: '우투좌타', birth: '1998-03-16', h: 183, w: 85 },
        '전준표':    { no: 62, tb: '우투우타', birth: '2005-05-07', h: 186, w: 90 },
        '박정훈':    { no: 94, tb: '좌투좌타', birth: '2006-03-23', h: 192, w: 103 },
        '윤석원':    { no: 95, tb: '좌투좌타', birth: '2003-07-04', h: 185, w: 81 },
        // 포수
        '김건희':    { no: 12, tb: '우투우타', birth: '2004-11-07', h: 186, w: 96 },
        '김재현':    { no: 32, tb: '우투우타', birth: '1993-03-18', h: 178, w: 90 },
        // 내야수
        '김태진':    { no: 1,  tb: '우투좌타', birth: '1995-10-07', h: 169, w: 73 },
        '최재영':    { no: 38, tb: '우투우타', birth: '2007-01-08', h: 183, w: 85 },
        '박한결':    { no: 4,  tb: '우투좌타', birth: '2007-12-05', h: 180, w: 79 },
        '최주환':    { no: 53, tb: '우투좌타', birth: '1988-02-28', h: 177, w: 73 },
        '오선진':    { no: 6,  tb: '우투우타', birth: '1989-07-07', h: 178, w: 80 },
        '안치홍':    { no: 9,  tb: '우투우타', birth: '1990-07-02', h: 178, w: 97 },
        '어준서':    { no: 92, tb: '우투좌타', birth: '2006-11-27', h: 183, w: 87 },
        // 외야수
        '이주형':    { no: 2,  tb: '우투좌타', birth: '2001-04-02', h: 181, w: 80 },
        '브룩스':    { no: 22, tb: '좌투좌타', birth: '1995-07-03', h: 180, w: 88 },
        '추재현':    { no: 27, tb: '좌투좌타', birth: '1999-02-22', h: 178, w: 85 },
        '임지열':    { no: 29, tb: '우투우타', birth: '1995-08-22', h: 180, w: 94 },
        '이형종':    { no: 36, tb: '우투우타', birth: '1989-06-07', h: 183, w: 87 },
        '박찬혁':    { no: 43, tb: '우투우타', birth: '2003-04-25', h: 181, w: 87 },
        '박수종':    { no: 87, tb: '우투우타', birth: '1999-02-25', h: 178, w: 82 },
    },
    '한화': {
        // 투수
        '에르난데스':{ no: 12, tb: '우투우타', birth: '1999-04-13', h: 190, w: 88 },
        '왕옌청':    { no: 19, tb: '좌투좌타', birth: '2001-02-14', h: 180, w: 82 },
        '화이트':    { no: 24, tb: '우투우타', birth: '1999-08-09', h: 190, w: 90 },
        '김서현':    { no: 44, tb: '우투우타', birth: '2004-05-31', h: 188, w: 86 },
        '김도빈':    { no: 46, tb: '우투우타', birth: '2001-01-05', h: 190, w: 95 },
        '원종혁':    { no: 48, tb: '우투우타', birth: '2005-08-27', h: 184, w: 92 },
        '윤산흠':    { no: 49, tb: '우투우타', birth: '1999-05-15', h: 178, w: 74 },
        '강재민':    { no: 55, tb: '우언우타', birth: '1997-04-03', h: 180, w: 89 },
        '조동욱':    { no: 57, tb: '좌투좌타', birth: '2004-11-02', h: 190, w: 82 },
        '정우주':    { no: 61, tb: '우투우타', birth: '2006-11-07', h: 184, w: 88 },
        '박준영':    { no: 96, tb: '우투우타', birth: '2003-03-02', h: 190, w: 103 },
        // 포수
        '최재훈':    { no: 13, tb: '우투우타', birth: '1989-08-27', h: 178, w: 94 },
        '장규현':    { no: 32, tb: '우투좌타', birth: '2002-06-28', h: 183, w: 96 },
        '허인서':    { no: 59, tb: '우투우타', birth: '2003-07-11', h: 182, w: 93 },
        // 내야수
        '하주석':    { no: 16, tb: '우투좌타', birth: '1994-02-25', h: 185, w: 92 },
        '채은성':    { no: 22, tb: '우투우타', birth: '1990-02-06', h: 186, w: 92 },
        '이도윤':    { no: 5,  tb: '우투좌타', birth: '1996-10-07', h: 175, w: 79 },
        '강백호':    { no: 50, tb: '우투좌타', birth: '1999-07-29', h: 184, w: 98 },
        '심우준':    { no: 7,  tb: '우투우타', birth: '1995-04-28', h: 183, w: 75 },
        '노시환':    { no: 8,  tb: '우투우타', birth: '2000-12-03', h: 185, w: 105 },
        '최유빈':    { no: 93, tb: '우투좌타', birth: '2002-05-27', h: 173, w: 73 },
        '황영묵':    { no: 95, tb: '우투좌타', birth: '1999-10-16', h: 177, w: 80 },
        // 외야수
        '이진영':    { no: 10, tb: '우투우타', birth: '1997-07-21', h: 183, w: 89 },
        '김태연':    { no: 25, tb: '우투우타', birth: '1997-06-10', h: 178, w: 96 },
        '페라자':    { no: 30, tb: '우투양타', birth: '1998-11-10', h: 175, w: 88 },
        '손아섭':    { no: 31, tb: '우투좌타', birth: '1988-03-18', h: 174, w: 84 },
        '최인호':    { no: 41, tb: '우투좌타', birth: '2000-01-30', h: 178, w: 82 },
        '문현빈':    { no: 51, tb: '우투좌타', birth: '2004-04-20', h: 174, w: 82 },
        '오재원':    { no: 54, tb: '우투좌타', birth: '2007-01-21', h: 176, w: 75 },
    },
    'KIA': {
        // 투수
        '조상우':    { no: 11, tb: '우투우타', birth: '1994-09-04', h: 186, w: 97 },
        '올러':      { no: 33, tb: '우투우타', birth: '1994-10-17', h: 193, w: 102 },
        '최지민':    { no: 39, tb: '좌투좌타', birth: '2003-09-10', h: 185, w: 100 },
        '네일':      { no: 40, tb: '우투우타', birth: '1993-02-08', h: 193, w: 83 },
        '황동하':    { no: 41, tb: '우투우타', birth: '2002-07-30', h: 183, w: 96 },
        '이의리':    { no: 48, tb: '좌투좌타', birth: '2002-06-16', h: 185, w: 90 },
        '김범수':    { no: 49, tb: '좌투좌타', birth: '1995-10-03', h: 181, w: 92 },
        '전상현':    { no: 51, tb: '우투우타', birth: '1996-04-18', h: 180, w: 88 },
        '김기훈':    { no: 53, tb: '좌투좌타', birth: '2000-01-03', h: 184, w: 93 },
        '김시훈':    { no: 61, tb: '우투우타', birth: '1999-02-24', h: 188, w: 95 },
        '정해영':    { no: 62, tb: '우투우타', birth: '2001-08-23', h: 189, w: 98 },
        '성영탁':    { no: 65, tb: '우투우타', birth: '2004-07-28', h: 180, w: 89 },
        '홍민규':    { no: 67, tb: '우투좌타', birth: '2006-09-11', h: 183, w: 87 },
        // 포수
        '한준수':    { no: 25, tb: '우투좌타', birth: '1999-02-13', h: 184, w: 95 },
        '김태군':    { no: 42, tb: '우투우타', birth: '1989-12-30', h: 182, w: 92 },
        // 내야수
        '정현창':    { no: 12, tb: '우투좌타', birth: '2006-07-14', h: 177, w: 70 },
        '김규성':    { no: 14, tb: '우투좌타', birth: '1997-03-08', h: 185, w: 88 },
        '윤도현':    { no: 16, tb: '우투우타', birth: '2003-05-07', h: 181, w: 84 },
        '박민':      { no: 2,  tb: '우투우타', birth: '2001-06-05', h: 184, w: 84 },
        '김선빈':    { no: 3,  tb: '우투우타', birth: '1989-12-18', h: 165, w: 77 },
        '데일':      { no: 32, tb: '우투우타', birth: '2000-09-11', h: 188, w: 90 },
        '김도영':    { no: 5,  tb: '우투우타', birth: '2003-10-02', h: 183, w: 85 },
        '오선우':    { no: 56, tb: '좌투좌타', birth: '1996-12-13', h: 186, w: 95 },
        // 외야수
        '박정우':    { no: 1,  tb: '좌투좌타', birth: '1998-02-01', h: 175, w: 68 },
        '박재현':    { no: 15, tb: '우투좌타', birth: '2006-12-08', h: 180, w: 73 },
        '카스트로':  { no: 26, tb: '우투좌타', birth: '1993-11-30', h: 183, w: 88 },
        '김호령':    { no: 27, tb: '우투우타', birth: '1992-04-30', h: 178, w: 85 },
        '나성범':    { no: 47, tb: '좌투좌타', birth: '1989-10-03', h: 183, w: 100 },
        '이창진':    { no: 8,  tb: '우투우타', birth: '1991-03-04', h: 173, w: 85 },
    },
    'KT': {
        // 투수
        '스기모토':  { no: 11, tb: '우투우타', birth: '2000-05-19', h: 182, w: 90 },
        '우규민':    { no: 12, tb: '우언우타', birth: '1985-01-21', h: 184, w: 75 },
        '김민수':    { no: 26, tb: '우투우타', birth: '1992-07-24', h: 188, w: 80 },
        '전용주':    { no: 29, tb: '좌투좌타', birth: '2000-02-12', h: 188, w: 87 },
        '소형준':    { no: 30, tb: '우투우타', birth: '2001-09-16', h: 189, w: 92 },
        '사우어':    { no: 32, tb: '우투우타', birth: '1999-01-21', h: 193, w: 104 },
        '한승혁':    { no: 35, tb: '우투좌타', birth: '1993-01-03', h: 185, w: 100 },
        '보쉴리':    { no: 36, tb: '우투우타', birth: '1993-10-01', h: 190, w: 86 },
        '주권':      { no: 38, tb: '우투우타', birth: '1995-05-31', h: 181, w: 82 },
        '손동현':    { no: 41, tb: '우투우타', birth: '2001-01-23', h: 183, w: 88 },
        '박영현':    { no: 60, tb: '우투우타', birth: '2003-10-11', h: 183, w: 91 },
        '박지훈':    { no: 66, tb: '우투우타', birth: '2007-01-19', h: 188, w: 90 },
        // 포수
        '장성우':    { no: 22, tb: '우투우타', birth: '1990-01-17', h: 187, w: 100 },
        '조대현':    { no: 42, tb: '우투우타', birth: '1999-08-06', h: 183, w: 81 },
        '한승택':    { no: 45, tb: '우투우타', birth: '1994-06-21', h: 174, w: 83 },
        // 내야수
        '허경민':    { no: 13, tb: '우투우타', birth: '1990-08-26', h: 176, w: 69 },
        '힐리어드':  { no: 34, tb: '좌투좌타', birth: '1994-02-21', h: 196, w: 107 },
        '오윤석':    { no: 4,  tb: '우투우타', birth: '1992-02-24', h: 180, w: 87 },
        '권동진':    { no: 52, tb: '우투좌타', birth: '1998-09-12', h: 178, w: 83 },
        '이강민':    { no: 6,  tb: '우투우타', birth: '2007-01-27', h: 181, w: 82 },
        '김상수':    { no: 7,  tb: '우투우타', birth: '1990-03-23', h: 175, w: 68 },
        '류현인':    { no: 9,  tb: '우투좌타', birth: '2000-11-08', h: 174, w: 80 },
        // 외야수
        '김현수':    { no: 10, tb: '우투좌타', birth: '1988-01-12', h: 188, w: 105 },
        '안현민':    { no: 23, tb: '우투우타', birth: '2003-08-22', h: 183, w: 90 },
        '배정대':    { no: 27, tb: '우투우타', birth: '1995-06-12', h: 185, w: 80 },
        '최원준':    { no: 3,  tb: '우투좌타', birth: '1997-03-23', h: 178, w: 85 },
        '이정훈':    { no: 33, tb: '우투좌타', birth: '1994-12-07', h: 185, w: 90 },
        '장진혁':    { no: 51, tb: '우투좌타', birth: '1993-09-30', h: 184, w: 90 },
        '안치영':    { no: 8,  tb: '우투좌타', birth: '1998-05-29', h: 176, w: 72 },
    },
    'LG': {
        // 투수
        '임찬규':    { no: 1,  tb: '우투우타', birth: '1992-11-20', h: 185, w: 80 },
        '함덕주':    { no: 11, tb: '좌투좌타', birth: '1995-01-13', h: 181, w: 78 },
        '우강훈':    { no: 20, tb: '우언우타', birth: '2002-10-03', h: 183, w: 88 },
        '이우찬':    { no: 21, tb: '좌투좌타', birth: '1992-08-04', h: 185, w: 97 },
        '배재준':    { no: 25, tb: '우투우타', birth: '1994-11-24', h: 188, w: 85 },
        '톨허스트':  { no: 30, tb: '우투우타', birth: '1999-09-13', h: 193, w: 86 },
        '이정용':    { no: 31, tb: '우투우타', birth: '1996-03-26', h: 186, w: 85 },
        '김진성':    { no: 42, tb: '우투우타', birth: '1985-03-07', h: 186, w: 90 },
        '치리노스':  { no: 46, tb: '우투우타', birth: '1993-12-26', h: 188, w: 102 },
        '장현식':    { no: 49, tb: '우투우타', birth: '1995-02-24', h: 181, w: 91 },
        '유영찬':    { no: 54, tb: '우투좌타', birth: '1997-03-07', h: 185, w: 90 },
        '박시원':    { no: 58, tb: '우투우타', birth: '2006-04-12', h: 193, w: 93 },
        '백승현':    { no: 61, tb: '우투우타', birth: '1995-05-26', h: 183, w: 90 },
        '김영우':    { no: 67, tb: '우투우타', birth: '2005-01-14', h: 185, w: 90 },
        '손주영':    { no: 29, tb: '좌투좌타', birth: '2002-06-10', h: 185, w: 88 },
        '송승기':    { no: 13, tb: '좌투좌타', birth: '2003-10-15', h: 186, w: 85 },
        '김강률':    { no: 36, tb: '우투우타', birth: '2000-05-12', h: 182, w: 80 },
        '이지강':    { no: 32, tb: '우투우타', birth: '2000-08-25', h: 184, w: 85 },
        '박명근':    { no: 39, tb: '우투우타', birth: '2001-03-18', h: 186, w: 90 },
        '성동현':    { no: 34, tb: '우투우타', birth: '2003-11-05', h: 188, w: 92 },
        '정우영':    { no: 18, tb: '우투우타', birth: '1991-12-15', h: 183, w: 88 },
        '최재홍':    { no: 38, tb: '우투우타', birth: '2002-04-20', h: 185, w: 85 },
        '월스':      { no: 68, tb: '좌투좌타', birth: '1996-07-28', h: 191, w: 95 },
        // 포수
        '박동원':    { no: 27, tb: '우투우타', birth: '1990-04-07', h: 178, w: 92 },
        '이주헌':    { no: 63, tb: '우투우타', birth: '2003-03-04', h: 185, w: 92 },
        // 내야수
        '오지환':    { no: 10, tb: '우투좌타', birth: '1990-03-12', h: 185, w: 80 },
        '문보경':    { no: 2,  tb: '우투좌타', birth: '2000-07-19', h: 182, w: 88 },
        '오스틴':    { no: 23, tb: '우투우타', birth: '1993-10-14', h: 183, w: 97 },
        '신민재':    { no: 4,  tb: '우투좌타', birth: '1996-01-21', h: 171, w: 67 },
        '천성호':    { no: 53, tb: '우투좌타', birth: '1997-10-30', h: 183, w: 85 },
        '구본혁':    { no: 6,  tb: '우투우타', birth: '1997-01-11', h: 177, w: 75 },
        '이영빈':    { no: 7,  tb: '우투좌타', birth: '2002-06-17', h: 182, w: 82 },
        // 외야수
        '박해민':    { no: 17, tb: '우투좌타', birth: '1990-02-24', h: 180, w: 75 },
        '최원영':    { no: 3,  tb: '우투우타', birth: '2003-07-18', h: 174, w: 76 },
        '홍창기':    { no: 51, tb: '우투좌타', birth: '1993-11-21', h: 189, w: 94 },
        '이재원':    { no: 52, tb: '우투우타', birth: '1999-07-17', h: 192, w: 105 },
        '송찬의':    { no: 55, tb: '우투우타', birth: '1999-02-20', h: 182, w: 80 },
        '문성주':    { no: 8,  tb: '좌투좌타', birth: '1997-02-20', h: 175, w: 78 },
    },
    'NC': {
        // 투수
        '토다':      { no: 11, tb: '우투우타', birth: '2000-07-22', h: 170, w: 80 },
        '김영규':    { no: 17, tb: '좌투좌타', birth: '2000-02-10', h: 188, w: 86 },
        '임지민':    { no: 19, tb: '우투우타', birth: '2003-10-11', h: 185, w: 82 },
        '임정호':    { no: 30, tb: '좌투좌타', birth: '1990-04-16', h: 188, w: 90 },
        '이준혁':    { no: 40, tb: '우투우타', birth: '2003-06-30', h: 184, w: 87 },
        '류진욱':    { no: 41, tb: '우투우타', birth: '1996-10-10', h: 189, w: 88 },
        '손주환':    { no: 46, tb: '우투우타', birth: '2002-01-05', h: 177, w: 85 },
        '김진호':    { no: 54, tb: '우투우타', birth: '1998-06-07', h: 183, w: 90 },
        '구창모':    { no: 59, tb: '좌투좌타', birth: '1997-02-17', h: 183, w: 85 },
        '배재환':    { no: 61, tb: '우투우타', birth: '1995-02-24', h: 186, w: 95 },
        '원종해':    { no: 63, tb: '우투우타', birth: '2005-04-09', h: 183, w: 83 },
        '테일러':    { no: 66, tb: '우투우타', birth: '1995-07-25', h: 198, w: 106 },
        // 포수
        '김형준':    { no: 25, tb: '우투우타', birth: '1999-11-02', h: 187, w: 98 },
        '김정호':    { no: 42, tb: '우투우타', birth: '1998-07-13', h: 172, w: 84 },
        // 내야수
        '김한별':    { no: 13, tb: '우투우타', birth: '2001-01-18', h: 177, w: 85 },
        '최정원':    { no: 14, tb: '우투좌타', birth: '2000-06-24', h: 176, w: 70 },
        '박민우':    { no: 2,  tb: '우투좌타', birth: '1993-02-06', h: 185, w: 80 },
        '데이비슨':  { no: 24, tb: '우투우타', birth: '1991-03-26', h: 190, w: 104 },
        '오영수':    { no: 34, tb: '우투좌타', birth: '2000-01-30', h: 178, w: 93 },
        '허윤':      { no: 4,  tb: '우투좌타', birth: '2007-03-29', h: 177, w: 73 },
        '김휘집':    { no: 44, tb: '우투우타', birth: '2002-01-01', h: 180, w: 92 },
        '서호철':    { no: 5,  tb: '우투우타', birth: '1996-10-16', h: 179, w: 85 },
        '김주원':    { no: 7,  tb: '우투양타', birth: '2002-07-30', h: 185, w: 83 },
        '신재인':    { no: 9,  tb: '우투우타', birth: '2007-06-28', h: 185, w: 83 },
        // 외야수
        '천재환':    { no: 23, tb: '우투우타', birth: '1994-04-01', h: 181, w: 83 },
        '한석현':    { no: 33, tb: '좌투좌타', birth: '1994-05-17', h: 181, w: 73 },
        '권희동':    { no: 36, tb: '우투우타', birth: '1990-12-30', h: 177, w: 85 },
        '박건우':    { no: 37, tb: '우투우타', birth: '1990-09-08', h: 184, w: 80 },
        '고준휘':    { no: 49, tb: '좌투좌타', birth: '2007-08-12', h: 181, w: 85 },
    },
    'SSG': {
        // 투수
        '김민':      { no: 1,  tb: '우투우타', birth: '1999-04-14', h: 185, w: 88 },
        '조병현':    { no: 19, tb: '우투우타', birth: '2002-05-08', h: 182, w: 90 },
        '전영준':    { no: 28, tb: '우투우타', birth: '2002-04-16', h: 190, w: 100 },
        '노경은':    { no: 38, tb: '우투우타', birth: '1984-03-11', h: 187, w: 100 },
        '김건우':    { no: 39, tb: '좌투좌타', birth: '2002-07-12', h: 186, w: 88 },
        '이기순':    { no: 4,  tb: '좌투좌타', birth: '2003-05-14', h: 174, w: 74 },
        '베니지아노':{ no: 41, tb: '좌투좌타', birth: '1997-09-01', h: 198, w: 102 },
        '문승원':    { no: 42, tb: '우투우타', birth: '1989-11-28', h: 180, w: 88 },
        '김택형':    { no: 43, tb: '좌투좌타', birth: '1996-10-10', h: 185, w: 90 },
        '화이트':    { no: 55, tb: '우투우타', birth: '1994-12-28', h: 190, w: 95 },
        '박시후':    { no: 57, tb: '좌투좌타', birth: '2001-05-10', h: 182, w: 88 },
        '백승건':    { no: 59, tb: '좌투좌타', birth: '2000-10-29', h: 183, w: 85 },
        '이로운':    { no: 92, tb: '우투우타', birth: '2004-09-11', h: 185, w: 105 },
        // 포수
        '조형우':    { no: 20, tb: '우투우타', birth: '2002-04-04', h: 187, w: 95 },
        '이지영':    { no: 56, tb: '우투우타', birth: '1986-02-27', h: 177, w: 88 },
        // 내야수
        '안상현':    { no: 10, tb: '우투우타', birth: '1997-01-27', h: 178, w: 74 },
        '최정':      { no: 14, tb: '우투우타', birth: '1987-02-28', h: 180, w: 90 },
        '고명준':    { no: 18, tb: '우투우타', birth: '2002-07-08', h: 185, w: 94 },
        '박성한':    { no: 2,  tb: '우투좌타', birth: '1998-03-30', h: 180, w: 77 },
        '정준재':    { no: 3,  tb: '우투좌타', birth: '2003-01-03', h: 165, w: 68 },
        '김성현':    { no: 6,  tb: '우투우타', birth: '1987-03-09', h: 172, w: 72 },
        '홍대인':    { no: 97, tb: '우투좌타', birth: '2001-11-23', h: 174, w: 76 },
        // 외야수
        '채현우':    { no: 15, tb: '우투우타', birth: '1995-11-21', h: 182, w: 80 },
        '에레디아':  { no: 27, tb: '좌투우타', birth: '1991-01-31', h: 178, w: 88 },
        '김성욱':    { no: 31, tb: '우투우타', birth: '1993-05-01', h: 181, w: 83 },
        '김재환':    { no: 32, tb: '우투좌타', birth: '1988-09-22', h: 184, w: 98 },
        '오태곤':    { no: 37, tb: '우투우타', birth: '1991-11-18', h: 186, w: 88 },
        '최지훈':    { no: 54, tb: '우투좌타', birth: '1997-07-23', h: 178, w: 82 },
        '임근우':    { no: 63, tb: '우투우타', birth: '1999-07-22', h: 180, w: 88 },
        // 등록 명단 외 (최준우#7은 REAL_ROSTERS OF 목록 7명에 미포함)
        '최준우':    { no: 7,  tb: '우투좌타', birth: '1999-03-25', h: 175, w: 78 },
    },
};

// ─── 유틸리티 ───

function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function gaussianRandom(rng, mean, std) {
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * std;
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function roundTo(val, decimals) { const f = Math.pow(10, decimals); return Math.round(val * f) / f; }

// ─── 팀별 전력 특성 (수업설계서 반영) ───
const TEAM_WEAKNESS = {
    'LG':   { pitchMod: 0.05, batMod: -0.05 },
    '두산': { pitchMod: 0, batMod: 0 },
    '롯데': { pitchMod: -0.08, batMod: -0.05 },
    'KIA':  { pitchMod: 0.1, batMod: 0.1 },
    'KT':   { pitchMod: -0.1, batMod: 0 },
    '한화': { pitchMod: 0.05, batMod: -0.15 },
    'NC':   { pitchMod: -0.05, batMod: 0.05 },
    'SSG':  { pitchMod: 0, batMod: 0 },
    '키움': { pitchMod: -0.03, batMod: -0.03 },
    '삼성': { pitchMod: 0, batMod: -0.1 },
};

// ─── 포지션 매핑 ───
const IF_POSITIONS = ['1B','2B','3B','SS','1B','2B','3B','SS','DH','DH'];
const OF_POSITIONS = ['RF','CF','LF','RF','CF','LF','DH','DH'];

// ─── 스탯 생성 ───

function genPitcherStats(rng, mod) {
    const ivb = roundTo(clamp(gaussianRandom(rng, 38 + mod * 12, 6), 20, 55), 1);
    const vaa = roundTo(clamp(gaussianRandom(rng, -5.0 + mod * 0.5, 0.8), -7.5, -2.5), 1);
    const csw = roundTo(clamp(gaussianRandom(rng, 29 + mod * 5, 4), 18, 40), 1);
    const fip = roundTo(clamp(gaussianRandom(rng, 4.0 - mod * 1.2, 0.8), 2.0, 7.0), 2);
    const babip = roundTo(clamp(gaussianRandom(rng, 0.300, 0.020), 0.250, 0.370), 3);
    const putaway = roundTo(clamp(gaussianRandom(rng, 16 + mod * 4, 4), 6, 30), 1);
    const eraLuck = (babip - 0.300) * 8;
    const era = roundTo(clamp(fip + eraLuck + gaussianRandom(rng, 0, 0.3), 1.5, 8.0), 2);
    return { IVB: ivb, VAA: vaa, 'CSW%': csw, FIP: fip, BABIP: babip, 'Putaway%': putaway, ERA: era };
}

function genBatterStats(rng, mod, teamCode) {
    const exitVelo = roundTo(clamp(gaussianRandom(rng, 88 + mod * 6, 4), 78, 100), 1);
    let launchAngle = roundTo(clamp(gaussianRandom(rng, 12 + mod * 3, 5), -2, 30), 1);
    if (teamCode === '삼성') {
        launchAngle = roundTo(clamp(gaussianRandom(rng, 6, 4), -5, 15), 1);
    }
    const barrel = roundTo(clamp(gaussianRandom(rng, 8 + mod * 6, 4), 1, 22), 1);
    const wrc = Math.round(clamp(gaussianRandom(rng, 100 + mod * 30, 25), 40, 180));
    const war = roundTo(clamp(gaussianRandom(rng, 1.5 + mod * 2, 1.5), -1.0, 8.0), 1);
    const ops = roundTo(clamp(gaussianRandom(rng, 0.740 + mod * 0.08, 0.090), 0.450, 1.150), 3);
    return { 'Exit Velocity': exitVelo, 'Launch Angle': launchAngle, 'Barrel%': barrel, 'wRC+': wrc, WAR: war, OPS: ops };
}

function tempPitcherPower(stats) {
    return Math.min(stats.IVB / 50, 1) * 40 + Math.max(0, (5 - Math.abs(stats.VAA)) / 5) * 30
         + Math.min(stats['CSW%'] / 40, 1) * 20 + Math.max(0, (6 - stats.FIP) / 6) * 10;
}

function tempBatterPower(stats) {
    return Math.min(stats['wRC+'] / 160, 1) * 50 + Math.min(stats['Barrel%'] / 20, 1) * 30
         + Math.min(stats.OPS / 1.0, 1) * 20;
}

function genSalary(rng, power) {
    return roundTo(clamp(power * 0.10 + gaussianRandom(rng, 0.5, 1.0), 0.5, 20), 1);
}

// 20-80 스케일 변환 (data.js 내에서도 사용)
function clamp2080(val) { return Math.round(Math.max(20, Math.min(80, val))); }

function calcBatterRatings(stats) {
    const AVG = stats.AVG || 0, SLG = stats.SLG || 0;
    const G = stats.G || 1, PA = stats.PA || 1;
    const BB = stats.BB || 0, SB = stats.SB || 0, dWAR = stats.dWAR || 0;
    const ISO = stats.IsoP || (SLG - AVG); // IsoP 우선, 없으면 SLG-AVG
    const bbPct = BB / PA;
    const sbSeason = SB / Math.max(G, 20) * 144;
    const dwarSeason = dWAR / Math.max(G, 20) * 144;
    return {
        contact: clamp2080(50 + (AVG - 0.265) / 0.020 * 10),
        power:   clamp2080(50 + (ISO - 0.145) / 0.042 * 10),
        eye:     clamp2080(50 + (bbPct - 0.085) / 0.025 * 10),
        speed:   clamp2080(20 + sbSeason * 1.2),
        defense: clamp2080(50 + dwarSeason * 10),
    };
}

function calcBatterOVR(r) {
    return Math.round(r.contact * 0.20 + r.power * 0.25 + r.eye * 0.20 + r.speed * 0.15 + r.defense * 0.20);
}

// 투수 20-80 스케일 변환
function calcPitcherRatings(stats) {
    const IP = stats.IP || 1;
    const G = stats.G || 1;
    const GS = stats.GS || 0;
    const SO = stats.SO || 0;
    const BB = stats.BB || 0;
    const ERA = stats.ERA != null ? stats.ERA : 5.0;
    const WHIP = stats.WHIP != null ? stats.WHIP : 1.50;

    const K9 = SO / IP * 9;
    const BB9 = BB / IP * 9;
    const isStarter = GS >= G * 0.5;

    // 구위 (Stuff): K/9 기반, KBO 평균 6.8, SD 1.5
    const stuff = clamp2080(50 + (K9 - 6.8) / 1.5 * 10);

    // 제구 (Command): BB/9 역방향, KBO 평균 3.3, SD 0.8
    const command = clamp2080(50 + (3.3 - BB9) / 0.8 * 10);

    // 체력 (Stamina): IP 기반 (선발 180이닝=80, 불펜 70이닝=80)
    let stamina;
    if (isStarter) {
        stamina = clamp2080(20 + IP / 180 * 60);
    } else {
        stamina = clamp2080(20 + IP / 70 * 60);
    }

    // 효율 (Effectiveness): ERA 역방향, KBO 평균 4.30, SD 0.90
    const effectiveness = clamp2080(50 + (4.30 - ERA) / 0.90 * 10);

    // 안정 (Consistency): WHIP 역방향, KBO 평균 1.38, SD 0.18
    const consistency = clamp2080(50 + (1.38 - WHIP) / 0.18 * 10);

    return { stuff, command, stamina, effectiveness, consistency };
}

function calcPitcherOVR(r) {
    return Math.round(r.stuff * 0.20 + r.command * 0.20 + r.stamina * 0.10 + r.effectiveness * 0.35 + r.consistency * 0.15);
}

// 2군 선수 랜덤 레이팅 생성 (실제 기록 없는 경우)
// 평균 35-38, SD 8, 최대 65로 캡 → 대부분 20-55 범위
function genFuturesBatterRatings(rng) {
    const cap = 65;
    return {
        contact: clamp2080(Math.min(cap, gaussianRandom(rng, 38, 8))),
        power:   clamp2080(Math.min(cap, gaussianRandom(rng, 33, 8))),
        eye:     clamp2080(Math.min(cap, gaussianRandom(rng, 33, 8))),
        speed:   clamp2080(Math.min(cap, gaussianRandom(rng, 35, 10))),
        defense: clamp2080(Math.min(cap, gaussianRandom(rng, 38, 8))),
    };
}
function genFuturesPitcherRatings(rng) {
    const cap = 65;
    return {
        stuff:         clamp2080(Math.min(cap, gaussianRandom(rng, 35, 8))),
        command:       clamp2080(Math.min(cap, gaussianRandom(rng, 35, 8))),
        stamina:       clamp2080(Math.min(cap, gaussianRandom(rng, 33, 8))),
        effectiveness: clamp2080(Math.min(cap, gaussianRandom(rng, 33, 8))),
        consistency:   clamp2080(Math.min(cap, gaussianRandom(rng, 33, 8))),
    };
}

// 선수 상세 정보 조회 (1군 + 2군 통합)
function getPlayerDetail(teamCode, playerName) {
    const d1 = PLAYER_DETAILS[teamCode];
    if (d1 && d1[playerName]) return d1[playerName];
    const d2 = FUTURES_DETAILS[teamCode];
    if (d2 && d2[playerName]) return d2[playerName];
    return null;
}

// 나이 계산 — 한국 나이 (2026 기준: 2026 - 출생년도 + 1)
function calcAge(birthStr) {
    if (!birthStr) return null;
    const birthYear = new Date(birthStr).getFullYear();
    return 2026 - birthYear + 1;
}

// 신인 판별 (고졸 신인 = 2006년생 이후) → 최저연봉 0.3억
const ROOKIE_MIN_SALARY = 0.3;
function isRookie(birthStr) {
    if (!birthStr) return false;
    return new Date(birthStr).getFullYear() >= 2006;
}

// 2군 선수 연봉 결정 (신인이면 최저연봉)
function futuresSalary(rng, power, birthStr) {
    if (isRookie(birthStr)) return ROOKIE_MIN_SALARY;
    return roundTo(clamp(genSalary(rng, power) * 0.4, 0.3, 5), 1);
}

// 팀 연봉 스케일링
function scaleTeamSalaries(players, roster, targetTotal) {
    const rawTotal = roster.reduce((sum, id) => sum + players[id].salary, 0);
    if (rawTotal <= 0) return;
    const scale = targetTotal / rawTotal;
    roster.forEach(id => {
        players[id].salary = roundTo(clamp(players[id].salary * scale, 0.5, 25), 1);
    });
    const newTotal = roster.reduce((sum, id) => sum + players[id].salary, 0);
    const diff = targetTotal - newTotal;
    if (Math.abs(diff) > 0.05) {
        const sorted = [...roster].sort((a, b) => players[b].salary - players[a].salary);
        players[sorted[0]].salary = roundTo(players[sorted[0]].salary + diff, 1);
    }
}

// ─── 메인 데이터 생성 ───

function generateSampleData() {
    const rng = seededRandom(20250401);
    const players = {};
    const teams = {};
    let playerId = 1;

    for (const teamDef of KBO_TEAMS) {
        const code = teamDef.code;
        const roster = REAL_ROSTERS[code];
        const weakness = TEAM_WEAKNESS[code];
        const teamRoster = [];

        // ── 투수 ──
        const pitcherNames = roster.P;
        const numP = pitcherNames.length;
        const numStarters = Math.min(5, numP);
        const numClosers = Math.min(1, numP - numStarters);

        for (let i = 0; i < numP; i++) {
            const raw = pitcherNames[i];
            const isForeign = raw.endsWith('*');
            const name = isForeign ? raw.slice(0, -1) : raw;
            let role;
            if (i < numStarters) role = '선발';
            else if (i >= numP - numClosers) role = '마무리';
            else role = '중계';

            const id = `p_${String(playerId++).padStart(3, '0')}`;
            const stats = genPitcherStats(rng, weakness.pitchMod);
            const salary = genSalary(rng, tempPitcherPower(stats));

            const detail = getPlayerDetail(code, name);
            players[id] = {
                id, name, team: code, position: 'P', role,
                salary, isForeign, isFranchiseStar: false,
                stats, powerScore: null,
                number: detail ? detail.no : null,
                throwBat: detail ? detail.tb : null,
                birth: detail ? detail.birth : null,
                age: detail ? calcAge(detail.birth) : null,
                height: detail ? detail.h : null,
                weight: detail ? detail.w : null,
            };
            teamRoster.push(id);
        }

        // ── 포수 ──
        for (let i = 0; i < roster.C.length; i++) {
            const raw = roster.C[i];
            const isForeign = raw.endsWith('*');
            const name = isForeign ? raw.slice(0, -1) : raw;
            const id = `b_${String(playerId++).padStart(3, '0')}`;
            const stats = genBatterStats(rng, weakness.batMod, code);
            const salary = genSalary(rng, tempBatterPower(stats));
            const detail = getPlayerDetail(code, name);

            players[id] = {
                id, name, team: code, position: 'C', role: null,
                salary, isForeign, isFranchiseStar: false,
                stats, powerScore: null,
                number: detail ? detail.no : null,
                throwBat: detail ? detail.tb : null,
                birth: detail ? detail.birth : null,
                age: detail ? calcAge(detail.birth) : null,
                height: detail ? detail.h : null,
                weight: detail ? detail.w : null,
            };
            teamRoster.push(id);
        }

        // ── 내야수 ──
        for (let i = 0; i < roster.IF.length; i++) {
            const raw = roster.IF[i];
            const isForeign = raw.endsWith('*');
            const name = isForeign ? raw.slice(0, -1) : raw;
            const id = `b_${String(playerId++).padStart(3, '0')}`;
            const pos = IF_POSITIONS[i % IF_POSITIONS.length];
            const stats = genBatterStats(rng, weakness.batMod, code);
            const salary = genSalary(rng, tempBatterPower(stats));
            const detail = getPlayerDetail(code, name);

            players[id] = {
                id, name, team: code, position: pos, role: null,
                salary, isForeign, isFranchiseStar: false,
                stats, powerScore: null,
                number: detail ? detail.no : null,
                throwBat: detail ? detail.tb : null,
                birth: detail ? detail.birth : null,
                age: detail ? calcAge(detail.birth) : null,
                height: detail ? detail.h : null,
                weight: detail ? detail.w : null,
            };
            teamRoster.push(id);
        }

        // ── 외야수 ──
        for (let i = 0; i < roster.OF.length; i++) {
            const raw = roster.OF[i];
            const isForeign = raw.endsWith('*');
            const name = isForeign ? raw.slice(0, -1) : raw;
            const id = `b_${String(playerId++).padStart(3, '0')}`;
            const pos = OF_POSITIONS[i % OF_POSITIONS.length];
            const stats = genBatterStats(rng, weakness.batMod, code);
            const salary = genSalary(rng, tempBatterPower(stats));
            const detail = getPlayerDetail(code, name);

            players[id] = {
                id, name, team: code, position: pos, role: null,
                salary, isForeign, isFranchiseStar: false,
                stats, powerScore: null,
                number: detail ? detail.no : null,
                throwBat: detail ? detail.tb : null,
                birth: detail ? detail.birth : null,
                age: detail ? calcAge(detail.birth) : null,
                height: detail ? detail.h : null,
                weight: detail ? detail.w : null,
            };
            teamRoster.push(id);
        }

        // ── 지명타자 (DH) ──
        if (roster.DH) {
            for (let i = 0; i < roster.DH.length; i++) {
                const raw = roster.DH[i];
                const isForeign = raw.endsWith('*');
                const name = isForeign ? raw.slice(0, -1) : raw;
                const id = `b_${String(playerId++).padStart(3, '0')}`;
                const stats = genBatterStats(rng, weakness.batMod, code);
                const salary = genSalary(rng, tempBatterPower(stats));
                const detail = getPlayerDetail(code, name);

                players[id] = {
                    id, name, team: code, position: 'DH', role: null,
                    salary, isForeign, isFranchiseStar: false,
                    stats, powerScore: null,
                    number: detail ? detail.no : null,
                    throwBat: detail ? detail.tb : null,
                    birth: detail ? detail.birth : null,
                    age: detail ? calcAge(detail.birth) : null,
                    height: detail ? detail.h : null,
                    weight: detail ? detail.w : null,
                };
                teamRoster.push(id);
            }
        }

        // 연봉 스케일링 (감사보고서 기준)
        scaleTeamSalaries(players, teamRoster, teamDef.finance.playerSalary);

        // 프랜차이즈 스타: 구단별 지정 선수
        const FRANCHISE_STARS = {
            'KIA': '양현종', '삼성': '구자욱', '두산': '양의지',
            'LG': '오지환', '한화': '류현진', 'KT': '고영표',
            'SSG': '최정', '롯데': '박세웅', 'NC': '구창모',
        };
        const starName = FRANCHISE_STARS[code];
        if (starName) {
            const starId = teamRoster.find(id => players[id].name === starName);
            if (starId) players[starId].isFranchiseStar = true;
        }

        // ── 실제 시즌 성적 적용 (있는 팀만) ──
        const teamRealStats = REAL_SEASON_STATS[code];
        if (teamRealStats) {
            for (const pid of teamRoster) {
                const p = players[pid];
                const real = teamRealStats[p.name];
                if (real && real.pos === 'P') {
                    // 투수 실제 스탯 적용
                    p.realStats = { ...real };
                    if (real.role) p.role = real.role;
                    if (real.salary) p.salary = real.salary;
                    // 기존 stats 호환성 업데이트
                    if (real.FIP) p.stats.FIP = real.FIP;
                    if (real.ERA) p.stats.ERA = real.ERA;
                    // 20-80 레이팅 계산
                    p.ratings = calcPitcherRatings(real);
                    p.ovr = calcPitcherOVR(p.ratings);
                } else if (real && p.position !== 'P') {
                    // 타자 실제 스탯 적용
                    p.realStats = { ...real };
                    if (real.pos) p.position = real.pos;
                    p.stats['wRC+'] = real['wRC+'];
                    p.stats.OPS = real.OPS;
                    p.stats.WAR = real.WAR;
                    if (real.salary) p.salary = real.salary;
                    // 표본 크기 보정: PA < 400이면 리그 평균(50)으로 회귀
                    p.ratings = calcBatterRatings(real);
                    const pa = real.PA || 400;
                    const sampleWeight = Math.min(pa / 400, 1.0);
                    if (sampleWeight < 1.0) {
                        for (const key of Object.keys(p.ratings)) {
                            p.ratings[key] = Math.round(p.ratings[key] * sampleWeight + 50 * (1 - sampleWeight));
                        }
                    }
                    p.ovr = calcBatterOVR(p.ratings);
                }
            }
        }

        // ── 외국인 선수 티어 적용 ──
        for (const pid of teamRoster) {
            const p = players[pid];
            if (!p.isForeign) continue;
            const profile = getForeignProfile(p.name, code);
            if (profile) {
                p.foreignTier = profile.tier;
                p.foreignOrigin = profile.origin;
                p.foreignNote = profile.note;
            } else {
                // 프로필 미등록 외국인 → 기본 T3
                p.foreignTier = 'T3';
                p.foreignOrigin = '미상';
                p.foreignNote = '';
            }
            // 실제 시즌 성적이 없는 외국인 → 티어 기반 레이팅·연봉 생성
            if (!p.realStats) {
                const tierKey = p.foreignTier;
                if (p.position === 'P') {
                    p.ratings = genForeignPitcherRatingsByTier(rng, tierKey);
                    p.ovr = calcPitcherOVR(p.ratings);
                } else {
                    p.ratings = genForeignBatterRatingsByTier(rng, tierKey);
                    p.ovr = calcBatterOVR(p.ratings);
                }
                p.salary = genForeignSalaryByTier(rng, tierKey);
            }
        }

        // ── 2군(퓨처스) 선수 생성 ──
        const futuresRoster = [];
        const futData = FUTURES_ROSTERS[code];
        if (futData) {
            // 2군 투수
            const fPNames = futData.P || [];
            const fNumP = fPNames.length;
            const fStarters = Math.min(5, fNumP);
            const fClosers = Math.min(1, fNumP - fStarters);
            for (let i = 0; i < fNumP; i++) {
                const raw = fPNames[i];
                const isForeign = raw.endsWith('*');
                const name = isForeign ? raw.slice(0, -1) : raw;
                let role = i < fStarters ? '선발' : (i >= fNumP - fClosers ? '마무리' : '중계');
                const id = `f_p_${String(playerId++).padStart(3, '0')}`;
                // 2군은 1군 대비 스탯이 낮음 (mod -0.15 추가)
                const stats = genPitcherStats(rng, weakness.pitchMod - 0.15);
                const detail = getPlayerDetail(code, name);
                const salary = futuresSalary(rng, tempPitcherPower(stats), detail ? detail.birth : null);
                players[id] = {
                    id, name, team: code, position: 'P', role,
                    salary, isForeign, isFranchiseStar: false,
                    stats, powerScore: null,
                    number: detail ? detail.no : null,
                    throwBat: detail ? detail.tb : null,
                    birth: detail ? detail.birth : null,
                    age: detail ? calcAge(detail.birth) : null,
                    height: detail ? detail.h : null,
                    weight: detail ? detail.w : null,
                    isFutures: true,
                };
                // 육성선수(배번 100+)는 연봉 3천만원 고정
                if (players[id].number >= 100) players[id].salary = 0.3;
                futuresRoster.push(id);
            }
            // 2군 포수
            for (const raw of (futData.C || [])) {
                const isForeign = raw.endsWith('*');
                const name = isForeign ? raw.slice(0, -1) : raw;
                const id = `f_b_${String(playerId++).padStart(3, '0')}`;
                const stats = genBatterStats(rng, weakness.batMod - 0.15, code);
                const detail = getPlayerDetail(code, name);
                const salary = futuresSalary(rng, tempBatterPower(stats), detail ? detail.birth : null);
                players[id] = {
                    id, name, team: code, position: 'C', role: null,
                    salary, isForeign, isFranchiseStar: false,
                    stats, powerScore: null,
                    number: detail ? detail.no : null,
                    throwBat: detail ? detail.tb : null,
                    birth: detail ? detail.birth : null,
                    age: detail ? calcAge(detail.birth) : null,
                    height: detail ? detail.h : null,
                    weight: detail ? detail.w : null,
                    isFutures: true,
                };
                // 육성선수(배번 100+)는 연봉 3천만원 고정
                if (players[id].number >= 100) players[id].salary = 0.3;
                futuresRoster.push(id);
            }
            // 2군 내야수
            for (let i = 0; i < (futData.IF || []).length; i++) {
                const raw = futData.IF[i];
                const isForeign = raw.endsWith('*');
                const name = isForeign ? raw.slice(0, -1) : raw;
                const id = `f_b_${String(playerId++).padStart(3, '0')}`;
                const pos = IF_POSITIONS[i % IF_POSITIONS.length];
                const stats = genBatterStats(rng, weakness.batMod - 0.15, code);
                const detail = getPlayerDetail(code, name);
                const salary = futuresSalary(rng, tempBatterPower(stats), detail ? detail.birth : null);
                players[id] = {
                    id, name, team: code, position: pos, role: null,
                    salary, isForeign, isFranchiseStar: false,
                    stats, powerScore: null,
                    number: detail ? detail.no : null,
                    throwBat: detail ? detail.tb : null,
                    birth: detail ? detail.birth : null,
                    age: detail ? calcAge(detail.birth) : null,
                    height: detail ? detail.h : null,
                    weight: detail ? detail.w : null,
                    isFutures: true,
                };
                // 육성선수(배번 100+)는 연봉 3천만원 고정
                if (players[id].number >= 100) players[id].salary = 0.3;
                futuresRoster.push(id);
            }
            // 2군 외야수
            for (let i = 0; i < (futData.OF || []).length; i++) {
                const raw = futData.OF[i];
                const isForeign = raw.endsWith('*');
                const name = isForeign ? raw.slice(0, -1) : raw;
                const id = `f_b_${String(playerId++).padStart(3, '0')}`;
                const pos = OF_POSITIONS[i % OF_POSITIONS.length];
                const stats = genBatterStats(rng, weakness.batMod - 0.15, code);
                const detail = getPlayerDetail(code, name);
                const salary = futuresSalary(rng, tempBatterPower(stats), detail ? detail.birth : null);
                players[id] = {
                    id, name, team: code, position: pos, role: null,
                    salary, isForeign, isFranchiseStar: false,
                    stats, powerScore: null,
                    number: detail ? detail.no : null,
                    throwBat: detail ? detail.tb : null,
                    birth: detail ? detail.birth : null,
                    age: detail ? calcAge(detail.birth) : null,
                    height: detail ? detail.h : null,
                    weight: detail ? detail.w : null,
                    isFutures: true,
                };
                // 육성선수(배번 100+)는 연봉 3천만원 고정
                if (players[id].number >= 100) players[id].salary = 0.3;
                futuresRoster.push(id);
            }
        }

        // ── 2군 선수에도 실제 시즌 성적 적용 ──
        // 소표본(투수 20IP 미만, 타자 50PA 미만)은 레이팅 캡 65 적용
        if (teamRealStats) {
            for (const fid of futuresRoster) {
                const p = players[fid];
                const real = teamRealStats[p.name];
                if (real && real.pos === 'P') {
                    p.realStats = { ...real };
                    if (real.role) p.role = real.role;
                    if (real.salary) p.salary = real.salary;
                    if (real.FIP) p.stats.FIP = real.FIP;
                    if (real.ERA) p.stats.ERA = real.ERA;
                    p.ratings = calcPitcherRatings(real);
                    // 소표본 캡: IP < 20이면 각 레이팅 최대 65
                    if ((real.IP || 0) < 20) {
                        for (const k of Object.keys(p.ratings)) p.ratings[k] = Math.min(65, p.ratings[k]);
                    }
                    p.ovr = calcPitcherOVR(p.ratings);
                } else if (real && p.position !== 'P') {
                    p.realStats = { ...real };
                    if (real.pos) p.position = real.pos;
                    p.stats['wRC+'] = real['wRC+'];
                    p.stats.OPS = real.OPS;
                    p.stats.WAR = real.WAR;
                    if (real.salary) p.salary = real.salary;
                    p.ratings = calcBatterRatings(real);
                    // 소표본 캡: PA < 50이면 각 레이팅 최대 65
                    if ((real.PA || 0) < 50) {
                        for (const k of Object.keys(p.ratings)) p.ratings[k] = Math.min(65, p.ratings[k]);
                    }
                    p.ovr = calcBatterOVR(p.ratings);
                }
            }
        }

        // ── 2군: 실제 기록 없는 선수에 랜덤 레이팅 부여 (최대 65) ──
        for (const fid of futuresRoster) {
            const p = players[fid];
            if (!p.ratings) {
                if (p.position === 'P') {
                    p.ratings = genFuturesPitcherRatings(rng);
                    p.ovr = calcPitcherOVR(p.ratings);
                } else {
                    p.ratings = genFuturesBatterRatings(rng);
                    p.ovr = calcBatterOVR(p.ratings);
                }
                p.noRealStats = true;
            }
        }

        // ── 군보류 선수 생성 ──
        const militaryRoster = [];
        const milData = MILITARY_ROSTERS[code];
        if (milData) {
            for (const posKey of ['P', 'C', 'IF', 'OF']) {
                for (const mp of (milData[posKey] || [])) {
                    const id = `mil_${String(playerId++).padStart(3, '0')}`;
                    const isPitcher = posKey === 'P';
                    const pos = isPitcher ? 'P' : (posKey === 'C' ? 'C' : posKey === 'IF' ? '2B' : 'LF');
                    const stats = isPitcher
                        ? genPitcherStats(rng, weakness.pitchMod - 0.25)
                        : genBatterStats(rng, weakness.batMod - 0.25, code);
                    players[id] = {
                        id, name: mp.name, team: code,
                        position: pos,
                        role: isPitcher ? '중계' : null,
                        salary: 0.3, isForeign: false, isFranchiseStar: false,
                        stats, powerScore: null,
                        number: mp.no,
                        throwBat: mp.tb,
                        birth: null, age: null, height: null, weight: null,
                        isFutures: true, isMilitary: true,
                        militaryDischarge: mp.discharge,
                        militaryType: mp.type,
                    };
                    if (isPitcher) {
                        players[id].ratings = genFuturesPitcherRatings(rng);
                        players[id].ovr = calcPitcherOVR(players[id].ratings);
                    } else {
                        players[id].ratings = genFuturesBatterRatings(rng);
                        players[id].ovr = calcBatterOVR(players[id].ratings);
                    }
                    militaryRoster.push(id);
                }
            }
        }

        teams[code] = {
            code,
            name: teamDef.name,
            color: teamDef.color,
            manager: roster.manager,
            finance: { ...teamDef.finance },
            capViolations: 0,
            roster: teamRoster,
            futuresRoster,
            militaryRoster,
            seasonRecord: {
                q1: { wins: 0, losses: 0 },
                q2: { wins: 0, losses: 0 },
                q3: { wins: 0, losses: 0 },
                q4: { wins: 0, losses: 0 },
            },
            tradeHistory: [],
        };
    }

    return { teams, players, tradeHistory: [] };
}

window.KBO_TEAMS = KBO_TEAMS;
window.KBO_SALARY_CAP = KBO_SALARY_CAP;
window.KBO_SALARY_FLOOR = KBO_SALARY_FLOOR;
window.REAL_ROSTERS = REAL_ROSTERS;
window.MILITARY_ROSTERS = MILITARY_ROSTERS;
window.generateSampleData = generateSampleData;
window.BALLPARK_FACTORS = BALLPARK_FACTORS;
window.TEAM_HOME_STADIUM = TEAM_HOME_STADIUM;
window.getBallparkFactor = getBallparkFactor;
window.getLightingDefPenalty = getLightingDefPenalty;
window.applyParkFactorToBatPower = applyParkFactorToBatPower;
window.applyParkFactorToPitchPower = applyParkFactorToPitchPower;
window.applyParkFactorToDefense = applyParkFactorToDefense;
window.adjustWrcPlusByPark = adjustWrcPlusByPark;
window.FOREIGN_TIERS = FOREIGN_TIERS;
window.FOREIGN_PLAYER_PROFILES = FOREIGN_PLAYER_PROFILES;
window.getForeignProfile = getForeignProfile;
window.getForeignTierInfo = getForeignTierInfo;
window.genForeignOvrByTier = genForeignOvrByTier;
window.genForeignSalaryByTier = genForeignSalaryByTier;
window.genForeignBatterRatingsByTier = genForeignBatterRatingsByTier;
window.genForeignPitcherRatingsByTier = genForeignPitcherRatingsByTier;
