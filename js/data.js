// ===== 2025 KBO 개막전 등록 명단 기반 데이터 =====
// 재정 데이터: 2025년 감사보고서 참고

const KBO_SALARY_CAP = 144; // 2026년 기준 (137.1억 × 1.05)
const KBO_SALARY_FLOOR = 61; // 하한선

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
        IF: ['오지환','문보경','오스틴*','신민재','천성호','구본혁','이영빈','송찬의'],
        OF: ['박해민','최원영','홍창기','이재원','문성주'],
    },
    '두산': {
        manager: '김원형',
        P: ['박치국','타무라*','이병헌','양재훈','잭로그*','최지강','이용찬','곽빈','박신지','이영하','최준호','최원준','김택연','플렉센*'],
        C: ['양의지','김기연'],
        IF: ['안재석','오명진','강승호','박찬호','양석환','이유찬','박지훈','박준순'],
        OF: ['카메론*','정수빈','김인태','조수행','홍성호'],
    },
    '롯데': {
        manager: '김태형',
        P: ['한현희','김강현','박세웅','비슬리*','로드리게스*','김원중','박정민','이민석','쿄야마*','이준서','윤성빈','최준용','박준우','정철원'],
        C: ['유강남','손성빈','정보근'],
        IF: ['전민재','김민성','한동희','이호준','노진혁','박승욱','한태양','이서준'],
        OF: ['황성빈','레이예스*','신윤후','손호영','장두성','전준우','윤동희'],
    },
    'KIA': {
        manager: '이범호',
        P: ['조상우','올러*','최지민','네일*','황동하','이의리','김범수','전상현','김기훈','김시훈','정해영','성영탁','홍민규','양현종'],
        C: ['한준수','김태군'],
        IF: ['정현창','김규성','윤도현','박민','김선빈','데일*','김도영','오선우'],
        OF: ['박정우','박재현','카스트로*','김호령','나성범','이창진'],
    },
    'KT': {
        manager: '이강철',
        P: ['고영표','스기모토*','우규민','김민수','전용주','소형준','사우어*','한승혁','보쉴리*','주권','손동현','박영현','박지훈'],
        C: ['장성우','조대현','한승택'],
        IF: ['허경민','오윤석','권동진','이강민','김상수','류현인'],
        OF: ['김현수','힐리어드*','안현민','배정대','최원준','이정훈','장진혁','안치영'],
    },
    '한화': {
        manager: '김경문',
        P: ['류현진','문동주','에르난데스*','왕옌청*','화이트*','김서현','황준서','엄상백','윤산흠','강재민','김종수','조동욱','정우주','박준영'],
        C: ['최재훈','허인서'],
        IF: ['하주석','채은성','이도윤','강백호','심우준','노시환'],
        OF: ['이진영','김태연','페라자*','손아섭','최인호','문현빈','오재원'],
    },
    'NC': {
        manager: '이호준',
        P: ['토다*','라일리*','김영규','임지민','임정호','이준혁','류진욱','손주환','김진호','구창모','배재환','원종해','테일러*'],
        C: ['김형준','김정호'],
        IF: ['김한별','최정원','박민우','데이비슨*','오영수','허윤','김휘집','서호철','김주원','신재인'],
        OF: ['천재환','한석현','권희동','박건우','고준휘'],
    },
    'SSG': {
        manager: '이숭용',
        P: ['김민','조병현','전영준','노경은','김건우','타케다*','베니지아노*','문승원','김택형','화이트*','박시후','백승건','이로운'],
        C: ['조형우','이지영'],
        IF: ['안상현','최정','고명준','박성한','정준재','김성현','홍대인'],
        OF: ['채현우','에레디아*','김성욱','김재환','오태곤','최지훈','임근우'],
    },
    '키움': {
        manager: '설종진',
        P: ['김성진','김재웅','오석주','와일스*','박윤성','박진형','유토*','하영민','알칸타라*','배동현','전준표','박정훈','윤석원'],
        C: ['김건희','김재현'],
        IF: ['김태진','최재영','박한결','최주환','오선진','안치홍','어준서','서건창'],
        OF: ['이주형','브룩스*','임지열','이형종','박찬혁','박수종'],
    },
    '삼성': {
        manager: '박진만',
        P: ['최지광','미야지*','최원태','원태인','이승현','이승민','백정현','임기영','육선엽','배찬승','김재윤','오러클린*','후라도*'],
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
        // 홍창기: 2025 부상시즌(51G) → 커리어 2021-2024 가중평균 기반 보정
        // 타격: AVG .321, IsoP .114(비파워 컨택형), BB% 14.2%(상위권 선구안)
        // 수비: RF defense RAA/144 = +5.8(2022-2024 평균), 우익수 상위급
        // 주루: SB 6~7/시즌(평균), 스피드 낮음
        '홍창기': { pos:'RF', AVG:.321, OBP:.395, SLG:.435, OPS:.830, 'wRC+':149.0, WAR:5.23, oWAR:4.23, dWAR:1.00, H:155, '2B':26, '3B':2, HR:12, RBI:62, R:78, SB:7, CS:2, BB:62, SO:75, G:135, PA:565, AB:483, IsoP:.114, salary:5.2, defRAA:5.80, rangeRAA:0.30, errRAA:0.20, armRAA:0.80 },
        '최원영': { pos:'LF', AVG:.282, OBP:.330, SLG:.330, OPS:.660, 'wRC+':81.9, WAR:0.77, oWAR:0.15, dWAR:0.62, H:29, '2B':5, '3B':0, HR:0, RBI:2, R:37, SB:8, CS:4, BB:4, SO:20, G:119, PA:115, AB:103, IsoP:.048, salary:0.7, defRAA:2.55, rangeRAA:2.21, errRAA:0.19, armRAA:0.14 },
        '이주헌': { pos:'C',  AVG:.219, OBP:.351, SLG:.336, OPS:.687, 'wRC+':104.4, WAR:0.65, oWAR:1.03, dWAR:-0.39, H:28, '2B':3, '3B':0, HR:4, RBI:9, R:22, SB:0, CS:0, BB:18, SO:30, G:76, PA:156, AB:128, IsoP:.117, salary:0.5, defRAA:-3.87, rangeRAA:-0.65, errRAA:-0.32, csRAA:-0.24, frmRAA:3.84 },
        '송찬의': { pos:'RF', AVG:.211, OBP:.291, SLG:.347, OPS:.638, 'wRC+':74.1, WAR:0.03, oWAR:-0.06, dWAR:0.10, H:31, '2B':9, '3B':1, HR:3, RBI:20, R:18, SB:2, CS:2, BB:9, SO:49, G:66, PA:166, AB:147, IsoP:.136, salary:0.55, defRAA:-0.42, rangeRAA:-0.44, errRAA:0.27, armRAA:-0.25 },
        '이영빈': { pos:'2B', AVG:.208, OBP:.216, SLG:.375, OPS:.591, 'wRC+':42.3, WAR:-0.14, oWAR:-0.06, dWAR:-0.08, H:15, '2B':1, '3B':1, HR:3, RBI:9, R:12, SB:1, CS:0, BB:1, SO:35, G:44, PA:75, AB:72, IsoP:.167, salary:0.55, defRAA:-0.14, rangeRAA:-0.10, errRAA:-0.04 },
        '천성호': { pos:'2B', AVG:.255, OBP:.307, SLG:.340, OPS:.647, 'wRC+':76.5, WAR:-0.37, oWAR:0.03, dWAR:-0.39, H:27, '2B':4, '3B':1, HR:1, RBI:10, R:14, SB:3, CS:0, BB:7, SO:17, G:52, PA:118, AB:106, IsoP:.085, salary:0.8, defRAA:-0.37, rangeRAA:-0.16, errRAA:-0.09, dpRAA:-0.12 },
        // 이재원: 상무 전역. 외야수. 상무 시절 좋은 타격 기록 기반 _ratings.
        '이재원': { pos:'RF', _ratings:{ contact:50, power:45, eye:45, speed:50, defense:50 } },

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
        // 월스(웰스): 2025 키움 → LG 이적
        // 월스: 키움→LG 이적. LG에서 중계 기용. 선발 출신이라 체력 보정.
        '월스': { pos:'P', role:'중계', G:4, GS:4, W:1, L:1, S:0, HLD:0, IP:20.0, H:18, HR:0, BB:6, HBP:1, SO:16, ER:7, R:8, ERA:3.15, WHIP:1.20, FIP:3.04, WAR:0.38, BABIP:0.290, WPA:0.21,
            pitches:[{name:'포심',pct:53,velo:144.4},{name:'슬라이더',pct:27,velo:135.9},{name:'체인지업',pct:14,velo:133.9},{name:'커브',pct:6,velo:122.2}],
            _overrideStamina:55 },
    },
    '두산': {
        // ─── 2025 시즌 투수 성적 ───
        // 플렉센: KBO 2020 두산 21G ERA3.01 116.2IP 132K WHIP1.09 + MLB 통산 174G ERA4.83 691.1IP.
        // 오버핸드 정통파. 포심(avg 148 max 157)+커터+커브(최상위 회전수)+체인지업+슬라이더. 땅볼 유도형.
        // 약점: 우타자 약세(우상바), 제구 불안, 디셉션 부족, 도루 허용 多.
        '플렉센':    { pos:'P', role:'선발', G:21, GS:21, W:8, L:4, S:0, HLD:0, IP:116.2, H:97, HR:6, BB:32, HBP:4, SO:132, ER:39, R:42, ERA:3.01, WHIP:1.09, FIP:3.00, WAR:3.51, BABIP:0.300, WPA:2.00,
            pitches:[{name:'포심',pct:30,velo:148},{name:'커터',pct:25,velo:142},{name:'커브',pct:20,velo:125},{name:'체인지업',pct:15,velo:135},{name:'슬라이더',pct:10,velo:133}] },
        // 타무라: NPB 통산 9시즌 150G 182.2IP ERA3.40 WHIP1.28. 중계 전문.
        // 포심 avg145(max151)+스플리터(주무기)+슬라이더+체인지업+커터+너클커브.
        // 이용찬: 2025 NC → 두산 이적. NC 2025 1군 기록 없음. 통산 기반 베테랑 중계투수.
        '이용찬':    { pos:'P', role:'중계',
            pitches:[{name:'포심',pct:45,velo:143},{name:'슬라이더',pct:30,velo:130},{name:'커브',pct:15,velo:120},{name:'체인지업',pct:10,velo:128}] },
        '타무라':    { pos:'P', role:'중계', G:150, GS:0, W:4, L:2, S:2, HLD:8, IP:182.2, H:164, HR:20, BB:69, HBP:8, SO:127, ER:69, R:69, ERA:3.40, WHIP:1.28, FIP:4.00, WAR:0.00,
            pitches:[{name:'포심',pct:30,velo:145},{name:'스플리터',pct:30,velo:135},{name:'슬라이더',pct:20,velo:132},{name:'커터',pct:10,velo:140},{name:'체인지업',pct:10,velo:130}] },
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        '양의지': { pos:'C', AVG:.337, OBP:.406, SLG:.533, OPS:.939, 'wRC+':162.8, WAR:6.79, oWAR:6.60, dWAR:0.20, H:153, '2B':27, '3B':1, HR:20, RBI:89, R:56, SB:4, CS:2, BB:50, SO:63, G:130, PA:517, AB:454, IsoP:.196, BABIP:.353, wOBA:.417, 'GB%':38.2, 'LD%':19.3, 'FB%':42.5, salary:42.0, defRAA:1.50, rangeRAA:0.30, errRAA:0.00, csRAA:0.50, frmRAA:0.70 },
        // 박찬호: 2025 KIA → 두산 FA 이적
        '박찬호': { pos:'CF', AVG:.287, OBP:.363, SLG:.359, OPS:.722, 'wRC+':107.3, WAR:4.56, oWAR:4.25, dWAR:0.30, H:148, '2B':18, '3B':2, HR:5, RBI:42, R:75, SB:27, CS:6, BB:62, SO:69, G:134, PA:595, AB:516, IsoP:.072 },
        // 카메론: 2025 KBO 기록 없음 (외국인 신규 영입)
        // OVR 산출용 MiLB 통산 실제 기록: 816G AVG.256 OBP.344 SLG.430 OPS.774 93HR 185SB / MLB 435AB AVG.200
        '카메론': { pos:'RF', AVG:.256, OBP:.344, SLG:.430, OPS:.774, 'wRC+':100.0, WAR:0.72, oWAR:0.52, dWAR:0.20, H:778, '2B':173, '3B':38, HR:93, RBI:439, R:509, SB:185, CS:68, BB:361, SO:873, G:816, PA:3506, AB:3038, IsoP:.174, salary:7.0 },
        '정수빈': { pos:'CF', AVG:.258, OBP:.355, SLG:.348, OPS:.703, 'wRC+':104.8, WAR:2.83, oWAR:2.32, dWAR:0.51, H:119, '2B':16, '3B':4, HR:6, RBI:38, R:89, SB:26, CS:13, BB:61, SO:57, G:132, PA:546, AB:462, IsoP:.090, BABIP:.280, wOBA:.339, 'GB%':59.0, 'LD%':12.0, 'FB%':29.0, salary:6.0, defRAA:3.50, rangeRAA:2.80, errRAA:0.30, armRAA:0.40 },
        '오명진': { pos:'2B', AVG:.263, OBP:.321, SLG:.366, OPS:.687, 'wRC+':89.8, WAR:1.80, oWAR:1.15, dWAR:0.65, H:87, '2B':14, '3B':4, HR:4, RBI:41, R:38, SB:5, CS:3, BB:27, SO:94, G:107, PA:371, AB:331, IsoP:.103, BABIP:.352, wOBA:.319, 'GB%':56.3, 'LD%':20.6, 'FB%':23.1, salary:1.12, defRAA:6.80, rangeRAA:4.80, errRAA:0.70, dpRAA:1.30 },
        '안재석': { pos:'SS', AVG:.319, OBP:.370, SLG:.541, OPS:.911, 'wRC+':149.4, WAR:1.77, oWAR:1.41, dWAR:0.37, H:43, '2B':16, '3B':1, HR:4, RBI:20, R:25, SB:2, CS:1, BB:11, SO:27, G:35, PA:147, AB:135, IsoP:.222, BABIP:.375, wOBA:.403, 'GB%':42.5, 'LD%':20.4, 'FB%':37.2, salary:0.67, defRAA:7.00, rangeRAA:5.00, errRAA:1.00, dpRAA:1.00 },
        '강승호': { pos:'1B', AVG:.236, OBP:.302, SLG:.372, OPS:.674, 'wRC+':82.3, WAR:1.55, oWAR:0.90, dWAR:0.65, H:85, '2B':19, '3B':3, HR:8, RBI:37, R:51, SB:14, CS:3, BB:24, SO:113, G:115, PA:400, AB:360, IsoP:.136, BABIP:.318, wOBA:.309, 'GB%':44.6, 'LD%':16.3, 'FB%':39.0, salary:2.98, defRAA:4.40, rangeRAA:3.00, errRAA:0.60, dpRAA:0.80 },
        '양석환': { pos:'1B', AVG:.248, OBP:.320, SLG:.401, OPS:.721, 'wRC+':98.5, WAR:1.24, oWAR:0.68, dWAR:0.56, H:65, '2B':16, '3B':0, HR:8, RBI:31, R:32, SB:1, CS:0, BB:24, SO:82, G:72, PA:294, AB:262, IsoP:.153, BABIP:.326, wOBA:.330, 'GB%':72.5, 'LD%':15.9, 'FB%':27.5, salary:3.0, defRAA:-1.20, rangeRAA:-0.80, errRAA:-0.20 },
        '이유찬': { pos:'SS', AVG:.242, OBP:.328, SLG:.290, OPS:.618, 'wRC+':79.0, WAR:0.84, oWAR:-0.15, dWAR:0.99, H:65, '2B':8, '3B':1, HR:1, RBI:16, R:36, SB:12, CS:2, BB:33, SO:66, G:89, PA:311, AB:269, IsoP:.048, BABIP:.315, wOBA:.305, 'GB%':54.3, 'LD%':12.4, 'FB%':33.3, salary:1.12, defRAA:4.80, rangeRAA:3.40, errRAA:0.50, dpRAA:0.90 },
        '김기연': { pos:'C', AVG:.247, OBP:.307, SLG:.315, OPS:.622, 'wRC+':72.6, WAR:0.30, oWAR:0.54, dWAR:-0.24, H:54, '2B':9, '3B':0, HR:2, RBI:24, R:19, SB:1, CS:0, BB:19, SO:44, G:100, PA:245, AB:219, IsoP:.068, BABIP:.297, wOBA:.295, 'GB%':55.8, 'LD%':9.9, 'FB%':34.3, salary:0.95, defRAA:-1.80, rangeRAA:-0.50, errRAA:-0.80, csRAA:-0.20, frmRAA:-0.30 },
        '김인태': { pos:'LF', AVG:.213, OBP:.356, SLG:.328, OPS:.684, 'wRC+':107.2, WAR:0.80, oWAR:0.79, dWAR:0.02, H:39, '2B':10, '3B':1, HR:3, RBI:25, R:17, SB:0, CS:1, BB:36, SO:57, G:106, PA:225, AB:183, IsoP:.115, BABIP:.290, wOBA:.343, 'GB%':46.1, 'LD%':14.1, 'FB%':39.8, salary:0.87, defRAA:0.10, rangeRAA:0.05, errRAA:0.05 },
        '박준순': { pos:'3B', AVG:.284, OBP:.307, SLG:.379, OPS:.686, 'wRC+':82.2, WAR:-0.05, oWAR:-0.30, dWAR:0.25, H:80, '2B':11, '3B':2, HR:4, RBI:19, R:34, SB:10, CS:2, BB:10, SO:56, G:91, PA:298, AB:282, IsoP:.095, BABIP:.338, wOBA:.308, 'GB%':51.5, 'LD%':13.4, 'FB%':35.1, salary:0.69, defRAA:1.70, rangeRAA:1.20, errRAA:0.20, dpRAA:0.30 },
        '조수행': { pos:'LF', AVG:.244, OBP:.323, SLG:.277, OPS:.600, 'wRC+':74.0, WAR:-0.06, oWAR:-0.36, dWAR:0.30, H:29, '2B':4, '3B':0, HR:0, RBI:9, R:30, SB:30, CS:7, BB:14, SO:29, G:108, PA:140, AB:119, IsoP:.033, BABIP:.322, wOBA:.297, 'GB%':64.9, 'LD%':13.4, 'FB%':21.6, salary:2.0, defRAA:2.00, rangeRAA:1.50, errRAA:0.30, armRAA:0.20 },
        '박계범': { pos:'2B', AVG:.263, OBP:.319, SLG:.354, OPS:.673, 'wRC+':88.1, WAR:-0.07, oWAR:-0.22, dWAR:0.15, H:46, '2B':9, '3B':2, HR:1, RBI:27, R:23, SB:3, CS:1, BB:14, SO:45, G:94, PA:198, AB:175, IsoP:.091, BABIP:.346, wOBA:.316, 'GB%':60.1, 'LD%':12.3, 'FB%':27.5, salary:0.31, defRAA:0.80, rangeRAA:0.50, errRAA:0.15, dpRAA:0.15 },
        // ── 준레귤러 / 벤치 (20-99 PA) ──
        '임종성': { pos:'3B', AVG:.277, OBP:.307, SLG:.398, OPS:.705, 'wRC+':86.8, WAR:0.65, oWAR:0.38, dWAR:0.27, H:23, '2B':4, '3B':0, HR:2, RBI:11, R:7, SB:1, CS:0, BB:3, SO:26, G:33, PA:89, AB:83, IsoP:.121, BABIP:.375, wOBA:.316, 'GB%':45.8, 'LD%':16.9, 'FB%':37.3, salary:0.45, defRAA:1.50, rangeRAA:1.10, errRAA:0.20 },
        '박지훈': { pos:'3B', AVG:.417, OBP:.481, SLG:.563, OPS:1.044, 'wRC+':203.7, WAR:0.82, oWAR:0.55, dWAR:0.27, H:20, '2B':4, '3B':0, HR:1, RBI:8, R:11, SB:1, CS:0, BB:5, SO:12, G:37, PA:55, AB:48, IsoP:.146, BABIP:.543, wOBA:.475, 'GB%':56.8, 'LD%':10.8, 'FB%':32.4, salary:0.52, defRAA:1.50, rangeRAA:1.00, errRAA:0.30, dpRAA:0.20 },
        '김민석': { pos:'LF', AVG:.228, OBP:.269, SLG:.298, OPS:.567, 'wRC+':49.1, WAR:-1.31, oWAR:-0.87, dWAR:-0.44, H:52, '2B':7, '3B':3, HR:1, RBI:21, R:21, SB:3, CS:2, BB:12, SO:62, G:95, PA:247, AB:228, IsoP:.070, BABIP:.304, wOBA:.266, 'GB%':47.4, 'LD%':21.1, 'FB%':31.6, salary:0.81, defRAA:-3.00, rangeRAA:-2.00, errRAA:-0.60, armRAA:-0.40 },
        '박찬호': { pos:'SS', AVG:.252, OBP:.318, SLG:.368, OPS:.686, 'wRC+':79.0, WAR:0.30, oWAR:0.54, dWAR:-0.24, H:23, '2B':5, '3B':0, HR:1, RBI:10, R:9, SB:0, CS:0, BB:6, SO:21, G:27, PA:100, AB:87, IsoP:.116, salary:8.0, defRAA:-2.00, rangeRAA:-1.50, errRAA:0.00 },
        '김동준': { pos:'DH', AVG:.237, OBP:.283, SLG:.333, OPS:.616, 'wRC+':62.4, WAR:-0.65, oWAR:-0.55, dWAR:-0.10, H:22, '2B':3, '3B':0, HR:2, RBI:10, R:8, SB:1, CS:1, BB:5, SO:30, G:36, PA:100, AB:93, IsoP:.096, BABIP:.328, wOBA:.285, 'GB%':48.4, 'LD%':14.1, 'FB%':37.5, salary:0.31 },
        '홍성호': { pos:'1B', AVG:.346, OBP:.370, SLG:.615, OPS:.985, 'wRC+':150.7, WAR:0.23, oWAR:0.09, dWAR:0.14, H:9, '2B':1, '3B':0, HR:2, RBI:3, R:3, SB:0, CS:0, BB:1, SO:8, G:9, PA:27, AB:26, IsoP:.269, BABIP:.438, wOBA:.409, salary:0.35, defRAA:0.90, rangeRAA:0.60, errRAA:0.15 },
        '김대한': { pos:'LF', AVG:.194, OBP:.216, SLG:.278, OPS:.494, 'wRC+':20.6, WAR:-0.32, oWAR:-0.30, dWAR:-0.02, H:7, '2B':0, '3B':0, HR:1, RBI:5, R:1, SB:0, CS:0, BB:1, SO:6, G:16, PA:37, AB:36, IsoP:.084, salary:0.36 },
        '박준영': { pos:'SS', AVG:.225, OBP:.304, SLG:.324, OPS:.628, 'wRC+':74.8, WAR:0.07, oWAR:-0.31, dWAR:0.38, H:25, '2B':8, '3B':0, HR:1, RBI:10, R:9, SB:3, CS:0, BB:10, SO:32, G:41, PA:126, AB:111, IsoP:.099, BABIP:.304, wOBA:.299, salary:0.31, defRAA:3.00, rangeRAA:2.30, errRAA:0.40 },
        '김민혁': { pos:'1B', AVG:.118, OBP:.286, SLG:.294, OPS:.580, 'wRC+':73.7, WAR:0.14, oWAR:-0.06, dWAR:0.20, H:2, '2B':0, '3B':0, HR:1, RBI:1, R:2, SB:0, CS:0, BB:4, SO:6, G:10, PA:21, AB:17, IsoP:.176, salary:0.33 },
        '류현준': { pos:'C', AVG:.136, OBP:.136, SLG:.136, OPS:.272, 'wRC+':-53.5, WAR:-0.32, oWAR:-0.30, dWAR:-0.02, H:3, '2B':0, '3B':0, HR:0, RBI:1, R:2, SB:0, CS:0, BB:0, SO:6, G:17, PA:22, AB:22, IsoP:.000, salary:0.32 },
        '여동건': { pos:'2B', AVG:.105, OBP:.190, SLG:.105, OPS:.295, 'wRC+':-23.9, WAR:0.03, oWAR:-0.15, dWAR:0.18, H:2, '2B':0, '3B':0, HR:0, RBI:2, R:6, SB:0, CS:1, BB:2, SO:2, G:19, PA:21, AB:19, IsoP:.000, salary:0.30, defRAA:1.20, rangeRAA:0.80, errRAA:0.20 },
        '김준상': { pos:'2B', AVG:.200, OBP:.250, SLG:.267, OPS:.517, 'wRC+':32.9, WAR:-0.14, oWAR:-0.10, dWAR:-0.04, H:3, '2B':1, '3B':0, HR:0, RBI:0, R:1, SB:0, CS:0, BB:0, SO:8, G:9, PA:17, AB:15, IsoP:.067, salary:0.30 },
        '전다민': { pos:'LF', AVG:.083, OBP:.083, SLG:.083, OPS:.166, 'wRC+':-88.6, WAR:-0.31, oWAR:-0.25, dWAR:-0.06, H:1, '2B':0, '3B':0, HR:0, RBI:0, R:5, SB:3, CS:0, BB:0, SO:0, G:22, PA:12, AB:12, IsoP:.000, salary:0.34 },
        '이선우': { pos:'2B', AVG:.182, OBP:.182, SLG:.273, OPS:.455, 'wRC+':0.9, WAR:-0.12, oWAR:-0.08, dWAR:-0.04, H:2, '2B':1, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:2, G:10, PA:11, AB:11, IsoP:.091, salary:0.30 },
        // ── 극소표본 (< 10 PA) → pos+salary만 유지, 랜덤 OVR ──
        '박성재': { pos:'1B', AVG:.000, OBP:.000, SLG:.000, OPS:.000, 'wRC+':-143.3, WAR:-0.09, oWAR:-0.08, dWAR:-0.01, H:0, '2B':0, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:5, G:6, PA:7, AB:7, IsoP:.000, salary:0.77 },
        '장승철': { pos:'C', salary:0.30 },
        '박민준': { pos:'C', salary:0.31 },
        '김재호': { pos:'SS', salary:0.30 },
        '김성재': { pos:'C', salary:0.30 },
        '전현재': { pos:'CF', salary:0.30 },
        '신우열': { pos:'RF', salary:0.30 },
        // ── 2025 시즌 투수 성적 (Statiz 종합) ──
        '잭로그':  { pos:'P', role:'선발',  G:30, GS:29, W:10, L:8,  S:0,  HLD:1,  IP:176.0, H:146, HR:8,  BB:39, HBP:17, SO:156, ER:55, R:66,  ERA:2.81, WHIP:1.05, FIP:3.26, WAR:5.34, BABIP:.281, salary:9.6,
            pitches:[{name:'포심',pct:33,velo:145.4},{name:'투심',pct:22,velo:142.6},{name:'슬라이더',pct:21,velo:123.1},{name:'커터',pct:12,velo:138.8},{name:'체인지업',pct:12,velo:132.9}] },
        '콜어빈':  { pos:'P', role:'선발',  G:28, GS:28, W:8,  L:12, S:0,  HLD:0,  IP:144.2, H:142, HR:9,  BB:79, HBP:18, SO:128, ER:72, R:80,  ERA:4.48, WHIP:1.53, FIP:4.59, WAR:2.57, BABIP:.332, salary:11.2,
            pitches:[{name:'포심',pct:34,velo:147.2},{name:'투심',pct:19,velo:145.5},{name:'커브',pct:18,velo:125.5},{name:'체인지업',pct:12,velo:134.3},{name:'슬라이더',pct:12,velo:132},{name:'커터',pct:6,velo:137.5}] },
        '곽빈':    { pos:'P', role:'선발',  G:19, GS:19, W:5,  L:7,  S:0,  HLD:0,  IP:109.1, H:96,  HR:9,  BB:41, HBP:2,  SO:107, ER:51, R:55,  ERA:4.20, WHIP:1.25, FIP:3.71, WAR:2.01, BABIP:.286, salary:3.05,
            pitches:[{name:'포심',pct:48,velo:151.4},{name:'슬라이더',pct:22,velo:137.7},{name:'체인지업',pct:14,velo:131},{name:'커브',pct:16,velo:121.4}] },
        '최승용':  { pos:'P', role:'선발',  G:23, GS:23, W:5,  L:7,  S:0,  HLD:0,  IP:116.1, H:121, HR:8,  BB:36, HBP:6,  SO:71,  ER:57, R:60,  ERA:4.41, WHIP:1.35, FIP:4.37, WAR:1.70, BABIP:.297, salary:1.55,
            pitches:[{name:'포심',pct:48,velo:143.7},{name:'슬라이더',pct:23,velo:132.4},{name:'커브',pct:16,velo:116.5},{name:'포크볼',pct:14,velo:129.5}] },
        '최민석':  { pos:'P', role:'선발',  G:17, GS:15, W:3,  L:3,  S:0,  HLD:0,  IP:77.2,  H:72,  HR:7,  BB:34, HBP:5,  SO:53,  ER:38, R:41,  ERA:4.40, WHIP:1.36, FIP:4.85, WAR:1.43, BABIP:.281, salary:0.63,
            pitches:[{name:'투심',pct:53,velo:143.6},{name:'슬라이더',pct:35,velo:131.2},{name:'포크볼',pct:12,velo:134.3}] },
        '김택연':  { pos:'P', role:'마무리', G:64, GS:0,  W:4,  L:5,  S:24, HLD:0,  IP:66.1,  H:47,  HR:6,  BB:31, HBP:5,  SO:79,  ER:26, R:29,  ERA:3.53, WHIP:1.18, FIP:3.71, WAR:1.32, BABIP:.263, salary:2.2,
            pitches:[{name:'포심',pct:73,velo:150.5},{name:'슬라이더',pct:24,velo:134.9},{name:'포크볼',pct:3,velo:137}] },
        '최원준':  { pos:'P', role:'선발',  G:47, GS:16, W:4,  L:7,  S:0,  HLD:9,  IP:107.0, H:105, HR:18, BB:38, HBP:4,  SO:62,  ER:56, R:63,  ERA:4.71, WHIP:1.34, FIP:5.70, WAR:0.95, BABIP:.264, salary:4.0,
            pitches:[{name:'포심',pct:46,velo:142.7},{name:'포크볼',pct:25,velo:132.1},{name:'슬라이더',pct:24,velo:133.3},{name:'커브',pct:5,velo:121.2}] },
        '이영하':  { pos:'P', role:'중계',  G:73, GS:0,  W:4,  L:4,  S:0,  HLD:14, IP:66.2,  H:63,  HR:4,  BB:39, HBP:6,  SO:72,  ER:30, R:33,  ERA:4.05, WHIP:1.53, FIP:4.09, WAR:0.90, BABIP:.341, salary:6.0,
            pitches:[{name:'포심',pct:49,velo:150.2},{name:'슬라이더',pct:42,velo:136.6},{name:'커브',pct:8,velo:121}] },
        '박신지':  { pos:'P', role:'중계',  G:54, GS:0,  W:2,  L:4,  S:0,  HLD:5,  IP:60.0,  H:55,  HR:3,  BB:29, HBP:5,  SO:36,  ER:19, R:21,  ERA:2.85, WHIP:1.40, FIP:4.56, WAR:0.47, BABIP:.275, salary:0.7,
            pitches:[{name:'포심',pct:48,velo:147.2},{name:'슬라이더',pct:26,velo:134.5},{name:'체인지업',pct:17,velo:126.6},{name:'커브',pct:9,velo:118.2}] },
        '양재훈':  { pos:'P', role:'중계',  G:19, GS:0,  W:0,  L:0,  S:1,  HLD:0,  IP:23.1,  H:19,  HR:3,  BB:8,  HBP:0,  SO:19,  ER:11, R:12,  ERA:4.24, WHIP:1.16, FIP:4.51, WAR:0.35, BABIP:.254, salary:0.47,
            pitches:[{name:'포심',pct:64,velo:145.8},{name:'슬라이더',pct:16,velo:132.7},{name:'커브',pct:16,velo:116.9},{name:'포크볼',pct:4,velo:128.1}] },
        '박정수':  { pos:'P', role:'중계',  G:29, GS:0,  W:1,  L:0,  S:0,  HLD:3,  IP:26.1,  H:31,  HR:1,  BB:8,  HBP:4,  SO:15,  ER:12, R:13,  ERA:4.10, WHIP:1.48, FIP:4.28, WAR:0.33, BABIP:.341, salary:0.64,
            pitches:[{name:'포심',pct:29,velo:141.1},{name:'슬라이더',pct:31,velo:133.3},{name:'커브',pct:20,velo:122.7},{name:'체인지업',pct:17,velo:126.9},{name:'투심',pct:3,velo:139}] },
        '박치국':  { pos:'P', role:'중계',  G:73, GS:0,  W:4,  L:4,  S:2,  HLD:16, IP:62.1,  H:58,  HR:4,  BB:21, HBP:7,  SO:57,  ER:26, R:35,  ERA:3.75, WHIP:1.27, FIP:3.78, WAR:0.22, BABIP:.305, salary:1.87,
            pitches:[{name:'포심',pct:46,velo:146.9},{name:'슬라이더',pct:27,velo:127.7},{name:'투심',pct:23,velo:145.1},{name:'체인지업',pct:3,velo:134}] },
        '이교훈':  { pos:'P', role:'중계',  G:10, GS:0,  W:1,  L:0,  S:0,  HLD:0,  IP:7.2,   H:4,   HR:0,  BB:4,  HBP:1,  SO:7,   ER:1,  R:2,   ERA:1.17, WHIP:1.04, FIP:3.72, WAR:0.17, BABIP:.250, salary:0.36,
            pitches:[{name:'포심',pct:57,velo:144},{name:'슬라이더',pct:31,velo:134.6},{name:'체인지업',pct:7,velo:135.7},{name:'커브',pct:4,velo:122.4}] },
        '제환유':  { pos:'P', role:'중계',  G:6,  GS:3,  W:0,  L:1,  S:0,  HLD:0,  IP:16.1,  H:17,  HR:2,  BB:12, HBP:1,  SO:8,   ER:9,  R:10,  ERA:4.96, WHIP:1.78, FIP:6.70, WAR:0.14, BABIP:.278, salary:0.3,
            pitches:[{name:'포심',pct:53,velo:145.5},{name:'슬라이더',pct:24,velo:132.3},{name:'커브',pct:17,velo:119.8},{name:'체인지업',pct:3,velo:128.9},{name:'포크볼',pct:3,velo:129.3}] },
        '김민규':  { pos:'P', role:'중계',  G:7,  GS:1,  W:1,  L:1,  S:0,  HLD:0,  IP:9.2,   H:9,   HR:1,  BB:6,  HBP:4,  SO:6,   ER:5,  R:5,   ERA:4.66, WHIP:1.55, FIP:6.91, WAR:0.06, BABIP:.267, salary:0.37,
            pitches:[{name:'포심',pct:46,velo:143.8},{name:'슬라이더',pct:39,velo:129},{name:'커브',pct:10,velo:115.9},{name:'포크볼',pct:6,velo:127.8}] },
        '홍민규':  { pos:'P', role:'중계',  G:20, GS:2,  W:2,  L:1,  S:1,  HLD:0,  IP:33.1,  H:37,  HR:4,  BB:15, HBP:1,  SO:17,  ER:17, R:19,  ERA:4.59, WHIP:1.56, FIP:5.61, WAR:0.03, BABIP:.290, salary:0.3,
            pitches:[{name:'포심',pct:50,velo:143.5},{name:'체인지업',pct:28,velo:126.9},{name:'슬라이더',pct:16,velo:132.2},{name:'커브',pct:6,velo:121.8}] },
        '김한중':  { pos:'P', role:'중계',  G:2,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:2.0,   H:1,   HR:0,  BB:0,  HBP:0,  SO:0,   ER:0,  R:1,   ERA:0.00, WHIP:0.50, FIP:3.92, WAR:0.02, BABIP:.125, salary:0.31,
            pitches:[{name:'포심',pct:84,velo:145.9},{name:'포크볼',pct:12,velo:131.3},{name:'슬라이더',pct:4,velo:127}] },
        '홍건희':  { pos:'P', role:'중계',  G:20, GS:0,  W:2,  L:1,  S:0,  HLD:0,  IP:16.0,  H:18,  HR:2,  BB:15, HBP:0,  SO:15,  ER:11, R:13,  ERA:6.19, WHIP:2.06, FIP:6.06, WAR:0.01, BABIP:.327, salary:0.3,
            pitches:[{name:'포심',pct:62,velo:145.1},{name:'슬라이더',pct:32,velo:135.2},{name:'커브',pct:6,velo:115.5}] },
        '최종인':  { pos:'P', role:'중계',  G:3,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:1.2,   H:1,   HR:0,  BB:3,  HBP:0,  SO:5,   ER:1,  R:1,   ERA:5.40, WHIP:2.40, FIP:2.18, WAR:0.00, BABIP:.500, salary:0.33,
            pitches:[{name:'포심',pct:46,velo:146.1},{name:'슬라이더',pct:33,velo:134.3},{name:'커브',pct:17,velo:118.1},{name:'포크볼',pct:4,velo:136.5}] },
        '김정우':  { pos:'P', role:'중계',  G:18, GS:0,  W:0,  L:0,  S:1,  HLD:1,  IP:21.0,  H:26,  HR:1,  BB:9,  HBP:3,  SO:13,  ER:9,  R:12,  ERA:3.86, WHIP:1.67, FIP:4.77, WAR:-0.02, BABIP:.338, salary:0.38,
            pitches:[{name:'포심',pct:59,velo:146.4},{name:'슬라이더',pct:21,velo:134},{name:'체인지업',pct:18,velo:129.5}] },
        '이병헌':  { pos:'P', role:'중계',  G:22, GS:0,  W:0,  L:0,  S:0,  HLD:4,  IP:13.0,  H:11,  HR:1,  BB:10, HBP:0,  SO:9,   ER:9,  R:9,   ERA:6.23, WHIP:1.62, FIP:5.07, WAR:-0.12, BABIP:.278, salary:1.0, _overrides:{effectiveness:42, stamina:45},
            pitches:[{name:'포심',pct:62,velo:145.1},{name:'슬라이더',pct:36,velo:134.6}] },
        '최준호':  { pos:'P', role:'중계',  G:9,  GS:3,  W:1,  L:2,  S:0,  HLD:0,  IP:16.0,  H:18,  HR:4,  BB:9,  HBP:2,  SO:11,  ER:15, R:15,  ERA:8.44, WHIP:1.69, FIP:7.37, WAR:-0.13, BABIP:.292, salary:0.45, _overrides:{effectiveness:38},
            pitches:[{name:'포심',pct:51,velo:145.3},{name:'슬라이더',pct:32,velo:134.6},{name:'포크볼',pct:10,velo:133},{name:'커브',pct:6,velo:117.3}] },
        '윤태호':  { pos:'P', role:'중계',  G:10, GS:1,  W:0,  L:1,  S:0,  HLD:1,  IP:17.1,  H:16,  HR:2,  BB:5,  HBP:0,  SO:16,  ER:13, R:14,  ERA:6.75, WHIP:1.21, FIP:3.91, WAR:-0.14, BABIP:.292, salary:0.35,
            pitches:[{name:'포심',pct:61,velo:149.4},{name:'슬라이더',pct:30,velo:136.9},{name:'커브',pct:8,velo:124.2}] },
        '김유성':  { pos:'P', role:'중계',  G:7,  GS:4,  W:0,  L:2,  S:0,  HLD:0,  IP:17.1,  H:17,  HR:3,  BB:14, HBP:4,  SO:22,  ER:17, R:17,  ERA:8.83, WHIP:1.79, FIP:6.13, WAR:-0.14, BABIP:.333, salary:0.41,
            pitches:[{name:'포심',pct:54,velo:149.1},{name:'슬라이더',pct:31,velo:134.4},{name:'커브',pct:9,velo:124.7},{name:'포크볼',pct:6,velo:137}] },
        '김명신':  { pos:'P', role:'중계',  G:8,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:8.1,   H:13,  HR:0,  BB:3,  HBP:1,  SO:6,   ER:5,  R:8,   ERA:5.40, WHIP:1.92, FIP:3.65, WAR:-0.20, BABIP:.394, salary:1.05,
            pitches:[{name:'포심',pct:54,velo:143.1},{name:'포크볼',pct:18,velo:129.8},{name:'커브',pct:14,velo:115.7},{name:'슬라이더',pct:14,velo:130.8}] },
        '김호준':  { pos:'P', role:'중계',  G:19, GS:0,  W:0,  L:1,  S:0,  HLD:1,  IP:10.2,  H:14,  HR:2,  BB:7,  HBP:0,  SO:7,   ER:8,  R:11,  ERA:6.75, WHIP:1.97, FIP:6.61, WAR:-0.24, BABIP:.316, salary:0.42,
            pitches:[{name:'투심',pct:52,velo:142.3},{name:'슬라이더',pct:25,velo:134.7},{name:'포심',pct:18,velo:143.6},{name:'체인지업',pct:3,velo:132.1}] },
        '최지강':  { pos:'P', role:'중계',  G:39, GS:0,  W:2,  L:5,  S:0,  HLD:5,  IP:32.2,  H:41,  HR:3,  BB:13, HBP:2,  SO:38,  ER:23, R:25,  ERA:6.34, WHIP:1.65, FIP:3.47, WAR:-0.56, BABIP:.422, salary:0.87,
            pitches:[{name:'투심',pct:58,velo:148.6},{name:'슬라이더',pct:31,velo:134.9},{name:'체인지업',pct:6,velo:133.3},{name:'커터',pct:4,velo:143.1}] },
        '고효준':  { pos:'P', role:'중계',  G:45, GS:0,  W:2,  L:1,  S:0,  HLD:9,  IP:21.0,  H:29,  HR:4,  BB:14, HBP:1,  SO:19,  ER:16, R:16,  ERA:6.86, WHIP:2.05, FIP:6.06, WAR:-1.17, BABIP:.391, salary:0.3,
            pitches:[{name:'포심',pct:52,velo:145.8},{name:'슬라이더',pct:39,velo:132.2},{name:'포크볼',pct:5,velo:130.7},{name:'커브',pct:4,velo:126.1}] },
        // 윤준호: 2025 퓨처스리그(상무) .361/.439/.563 11HR 87RBI 기반 KBO 환산 OVR
        '윤준호':  { pos:'C', salary:0.31, _ratings: { contact:60, power:50, eye:54, speed:22, defense:52 } },
        // 신인/육성 (2026 드래프트 — 기록 없음, 랜덤 OVR)
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
        '양현진':  { pos:'OF', salary:0.3 },
        '최우인':  { pos:'P', salary:0.3 },
        '김지윤':  { pos:'P', salary:0.3 },
        '장우진':  { pos:'P', salary:0.3 },
        '황희천':  { pos:'P', salary:0.3 },
        '김성재':  { pos:'C', salary:0.3 },
        '장규빈':  { pos:'C', salary:0.3 },
        '이희성':  { pos:'C', salary:0.3 },
        '신민철':  { pos:'SS', salary:0.3 },
        '지강혁':  { pos:'SS', salary:0.3 },
        '한다현':  { pos:'SS', salary:0.3 },
        '김준상':  { pos:'2B', salary:0.3 },
        '임현철':  { pos:'SS', salary:0.3 },
        '심건보':  { pos:'SS', salary:0.3 },
        '남태웅':  { pos:'SS', salary:0.3 },
        '김주오':  { pos:'RF', salary:0.3 },
        '천현재':  { pos:'CF', salary:0.3 },
        '김문수':  { pos:'CF', salary:0.3 },
        '주양준':  { pos:'RF', salary:0.3 },
        '엄지민':  { pos:'LF', salary:0.3 },
    },
    '키움': {
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // ── 선발 ──
        '하영민':    { pos:'P', role:'선발', G:28, GS:28, W:7,  L:14, S:0,  HLD:0,  IP:153.1, H:169, HR:13, BB:41, HBP:9,  SO:134, ER:85, R:90,  ERA:4.99, WHIP:1.37, FIP:3.79, WAR:1.41, BABIP:0.336, WPA:-0.26,
            pitches:[{name:'포심',pct:36,velo:144.0},{name:'포크',pct:24,velo:132.4},{name:'슬라이더',pct:17,velo:128.1},{name:'커터',pct:15,velo:135.5},{name:'커브',pct:8,velo:120.7}] },
        // 김성진: 2025 키움 부상 → 중계 전환
        '김성진':    { pos:'P', role:'중계',
            pitches:[{name:'포심',pct:45,velo:148},{name:'슬라이더',pct:25,velo:135},{name:'체인지업',pct:20,velo:130},{name:'커브',pct:10,velo:120}] },
        // 와일스: MLB 2025 ATL 1G. AAA 3G ERA0.64. 커터+체인지업(120대 급락) 전환 성공. MLB 출신 체력/안정 보정.
        '와일스':    { pos:'P', role:'선발', G:30, GS:30, W:0, L:0, S:0, HLD:0, IP:150.0, H:140, HR:12, BB:45, HBP:5, SO:130, ER:52, R:58, ERA:3.12, WHIP:1.23, FIP:3.50, WAR:0.00,
            pitches:[{name:'커터',pct:35,velo:142},{name:'체인지업',pct:30,velo:128},{name:'포심',pct:20,velo:148},{name:'슬라이더',pct:15,velo:133}] },
        // 유토: NPB 통산 6시즌 34G 87.2IP ERA4.31 WHIP1.41. 포심 avg146(max153)+슬라이더+포크. 직구 구위 좋으나 변화구 퀄리티 약점.
        '유토':      { pos:'P', role:'선발', G:34, GS:0, W:5, L:4, S:0, HLD:1, IP:87.2, H:90, HR:11, BB:34, HBP:5, SO:69, ER:42, R:42, ERA:4.31, WHIP:1.41, FIP:4.50, WAR:0.00,
            pitches:[{name:'포심',pct:60,velo:146},{name:'슬라이더',pct:20,velo:133},{name:'포크',pct:15,velo:135},{name:'체인지업',pct:5,velo:130}] },
        // ── 마무리 ──
        '윤석원':    { pos:'P', role:'마무리', G:37, GS:0,  W:1,  L:1,  S:0,  HLD:8,  IP:37.1,  H:41,  HR:3,  BB:12, HBP:2,  SO:27,  ER:23, R:23,  ERA:5.54, WHIP:1.42, FIP:4.18, WAR:-0.15, BABIP:0.330, WPA:0.01,
            pitches:[{name:'포심',pct:58,velo:143.0},{name:'슬라이더',pct:32,velo:128.8},{name:'커브',pct:8,velo:117.8},{name:'체인지업',pct:3,velo:129.6}] },
        // ── 중계 ──
        // 배동현: 한화→키움. 선발 전환. 좌완 유망주.
        '배동현':    { pos:'P', role:'선발',
            pitches:[{name:'포심',pct:50,velo:147},{name:'슬라이더',pct:25,velo:134},{name:'체인지업',pct:15,velo:130},{name:'커브',pct:10,velo:120}] },
        '알칸타라':  { pos:'P', role:'선발', G:19, GS:19, W:8,  L:4,  S:0,  HLD:0,  IP:121.0, H:125, HR:11, BB:10, HBP:4,  SO:92,  ER:44, R:50,  ERA:3.27, WHIP:1.12, FIP:3.47, WAR:3.00, BABIP:0.309, WPA:1.42,
            pitches:[{name:'포심',pct:56,velo:150.6},{name:'포크',pct:27,velo:134.3},{name:'슬라이더',pct:17,velo:135.2}] },
        '오석주':    { pos:'P', role:'중계', G:53, GS:0,  W:2,  L:1,  S:0,  HLD:7,  IP:58.1,  H:52,  HR:4,  BB:29, HBP:7,  SO:44,  ER:24, R:24,  ERA:3.70, WHIP:1.39, FIP:4.82, WAR:0.85, BABIP:0.291, WPA:-0.10,
            pitches:[{name:'포심',pct:47,velo:139.6},{name:'커브',pct:39,velo:110.6},{name:'슬라이더',pct:6,velo:129.8},{name:'포크',pct:5,velo:126.5},{name:'체인지업',pct:3,velo:126.3}] },
        '전준표':    { pos:'P', role:'중계', G:21, GS:1,  W:2,  L:2,  S:0,  HLD:1,  IP:20.1,  H:33,  HR:2,  BB:19, HBP:3,  SO:15,  ER:20, R:22,  ERA:8.85, WHIP:2.56, FIP:6.55, WAR:-1.18, BABIP:0.431, WPA:-0.59,
            pitches:[{name:'포심',pct:72,velo:148.3},{name:'커브',pct:17,velo:123.6},{name:'슬라이더',pct:6,velo:131.1},{name:'투심',pct:4,velo:148.9},{name:'포크',pct:2,velo:133.0}] },
        '박정훈':    { pos:'P', role:'중계', G:16, GS:3,  W:0,  L:1,  S:1,  HLD:0,  IP:23.0,  H:25,  HR:4,  BB:9,  HBP:3,  SO:22,  ER:19, R:20,  ERA:7.43, WHIP:1.48, FIP:5.53, WAR:-0.41, BABIP:0.277, WPA:-1.10,
            pitches:[{name:'투심',pct:40,velo:145.6},{name:'슬라이더',pct:30,velo:133.4},{name:'포심',pct:20,velo:147.3},{name:'체인지업',pct:9,velo:131.2}] },
        '박윤성':    { pos:'P', role:'중계', G:54, GS:0,  W:0,  L:5,  S:1,  HLD:6,  IP:51.2,  H:55,  HR:9,  BB:19, HBP:1,  SO:40,  ER:26, R:31,  ERA:4.53, WHIP:1.43, FIP:5.29, WAR:-0.73, BABIP:0.299, WPA:-1.67,
            pitches:[{name:'포심',pct:61,velo:141.6},{name:'커브',pct:20,velo:124.6},{name:'슬라이더',pct:15,velo:132.5},{name:'체인지업',pct:3,velo:134.0}] },
        // 박진형: 2025 롯데 → 키움 이적
        '박진형':    { pos:'P', role:'중계', G:7,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:5.1,   H:9,   HR:1,  BB:3,  HBP:0,  SO:5,   ER:5,  R:7,   ERA:8.44, WHIP:2.25, FIP:5.61, WAR:-0.10, BABIP:0.400, WPA:-0.19,
            pitches:[{name:'포심',pct:42,velo:142.8},{name:'슬라이더',pct:17,velo:128.3},{name:'포크',pct:40,velo:128.0}] },
        // 김재웅: 군 전역 (나중에 데이터 제공 예정)
        '김재웅':    { pos:'P', role:'중계' , salary:1.9 },
        // 웰스: 2025 키움 → LG 이적
        '웰스':      { pos:'P', role:'선발', G:4,  GS:4,  W:1,  L:1,  S:0,  HLD:0,  IP:20.0,  H:18,  HR:0,  BB:6,  HBP:1,  SO:16,  ER:7,  R:8,   ERA:3.15, WHIP:1.20, FIP:3.04, WAR:0.38, BABIP:0.290, WPA:0.21,
            pitches:[{name:'포심',pct:53,velo:144.4},{name:'슬라이더',pct:27,velo:135.9},{name:'체인지업',pct:14,velo:133.9},{name:'커브',pct:6,velo:122.2}] },
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        '이주형':   { pos:'CF', AVG:.240, OBP:.337, SLG:.368, OPS:.705, 'wRC+':103.8, WAR:2.93, oWAR:2.37, dWAR:0.56, H:107, '2B':22, '3B':1, HR:11, RBI:45, R:55, SB:15, CS:1, BB:37, SO:115, G:127, PA:514, AB:446, IsoP:.128, defRAA:5.58, rangeRAA:3.99, errRAA:1.06, armRAA:0.54 , salary:1.4 },
        '임지열':   { pos:'LF', AVG:.244, OBP:.322, SLG:.382, OPS:.704, 'wRC+':102.4, WAR:1.04, oWAR:0.71, dWAR:0.33, H:90, '2B':14, '3B':2, HR:11, RBI:50, R:51, SB:13, CS:6, BB:42, SO:111, G:102, PA:417, AB:369, IsoP:.138, defRAA:3.63, rangeRAA:4.61, errRAA:-0.47, armRAA:-0.51 , salary:1.1 },
        '최주환':   { pos:'1B', AVG:.275, OBP:.330, SLG:.425, OPS:.755, 'wRC+':111.4, WAR:0.56, oWAR:1.03, dWAR:-0.47, H:126, '2B':31, '3B':1, HR:12, RBI:74, R:45, SB:0, CS:0, BB:36, SO:66, G:120, PA:506, AB:459, IsoP:.150, defRAA:-4.70, rangeRAA:-3.20, errRAA:-0.80, dpRAA:-0.70 , salary:3 },
        '김건희':   { pos:'C', AVG:.242, OBP:.270, SLG:.345, OPS:.615, 'wRC+':63.0, WAR:0.30, oWAR:0.35, dWAR:-0.05, H:78, '2B':20, '3B':2, HR:3, RBI:25, R:24, SB:2, CS:1, BB:13, SO:102, G:105, PA:344, AB:322, IsoP:.103, defRAA:-0.54, rangeRAA:-0.43, errRAA:0.10, csRAA:2.12, frmRAA:0.00 , salary:0.6 },
        '박주홍':   { pos:'SS', AVG:.226, OBP:.310, SLG:.331, OPS:.641, 'wRC+':84.0, WAR:0.19, oWAR:0.27, dWAR:-0.08, H:56, '2B':11, '3B':3, HR:3, RBI:23, R:33, SB:11, CS:1, BB:30, SO:72, G:102, PA:283, AB:248, IsoP:.105, defRAA:-0.80, rangeRAA:-0.50, errRAA:0.20, dpRAA:-0.50 , salary:0.6 },
        '오선진':   { pos:'3B', AVG:.238, OBP:.308, SLG:.315, OPS:.623, 'wRC+':77.4, WAR:0.06, oWAR:0.19, dWAR:-0.13, H:34, '2B':8, '3B':0, HR:1, RBI:19, R:15, SB:0, CS:0, BB:12, SO:45, G:99, PA:163, AB:143, IsoP:.077, defRAA:3.49, rangeRAA:2.35, errRAA:0.44, dpRAA:0.70 , salary:0.8 },
        '어준서':   { pos:'SS', AVG:.238, OBP:.305, SLG:.327, OPS:.632, 'wRC+':78.4, WAR:-0.81, oWAR:0.88, dWAR:-1.69, H:77, '2B':9, '3B':1, HR:6, RBI:27, R:48, SB:1, CS:0, BB:30, SO:75, G:116, PA:360, AB:324, IsoP:.089, defRAA:-16.90, rangeRAA:-11.30, errRAA:-2.50, dpRAA:-3.10 , salary:0.5 },
        '김태진':   { pos:'2B', AVG:.233, OBP:.281, SLG:.341, OPS:.622, 'wRC+':67.8, WAR:-0.47, oWAR:0.06, dWAR:-0.53, H:65, '2B':11, '3B':2, HR:5, RBI:25, R:27, SB:1, CS:1, BB:20, SO:53, G:94, PA:304, AB:279, IsoP:.108, defRAA:-0.17, rangeRAA:-2.88, errRAA:0.77, dpRAA:1.95 , salary:1.1 },
        '김재현':   { pos:'C', AVG:.208, OBP:.234, SLG:.250, OPS:.484, 'wRC+':19.5, WAR:-0.56, oWAR:-0.32, dWAR:-0.24, H:25, '2B':5, '3B':0, HR:0, RBI:5, R:12, SB:1, CS:0, BB:1, SO:31, G:62, PA:128, AB:120, IsoP:.042, defRAA:-2.38, rangeRAA:-0.24, errRAA:-0.75, csRAA:0.15, frmRAA:0.00 , salary:1 },
        '임병욱':   { pos:'LF', AVG:.233, OBP:.259, SLG:.353, OPS:.612, 'wRC+':61.8, WAR:-0.66, oWAR:-0.25, dWAR:-0.41, H:31, '2B':4, '3B':3, HR:2, RBI:13, R:12, SB:1, CS:0, BB:5, SO:33, G:52, PA:140, AB:133, IsoP:.120 , salary:0.6 },
        // ── 준레귤러 / 벤치 ──
        '주성원':   { pos:'3B', AVG:.250, OBP:.322, SLG:.308, OPS:.630, 'wRC+':81.3, WAR:0.13, oWAR:0.05, dWAR:0.09, H:39, '2B':6, '3B':0, HR:1, RBI:12, R:21, SB:4, CS:0, BB:13, SO:45, G:58, PA:174, AB:156, IsoP:.058 , salary:0.5 },
        '이형종':   { pos:'RF', AVG:.200, OBP:.300, SLG:.329, OPS:.629, 'wRC+':83.5, WAR:0.19, oWAR:0.08, dWAR:0.12, H:14, '2B':3, '3B':0, HR:2, RBI:6, R:4, SB:1, CS:0, BB:9, SO:22, G:33, PA:82, AB:70, IsoP:.129, defRAA:2.59, rangeRAA:1.77, errRAA:0.11, armRAA:0.71 , salary:6 },
        '전태현':   { pos:'SS', AVG:.231, OBP:.304, SLG:.258, OPS:.562, 'wRC+':61.9, WAR:-0.23, oWAR:-0.13, dWAR:-0.10, H:42, '2B':5, '3B':0, HR:0, RBI:10, R:20, SB:4, CS:0, BB:20, SO:59, G:77, PA:207, AB:182, IsoP:.027 , salary:0.3 },
        '송지후':   { pos:'C', AVG:.175, OBP:.221, SLG:.250, OPS:.471, 'wRC+':18.2, WAR:-0.34, oWAR:-0.58, dWAR:0.24, H:14, '2B':3, '3B':0, HR:1, RBI:8, R:5, SB:0, CS:1, BB:3, SO:18, G:33, PA:86, AB:80, IsoP:.075 , salary:0.4 },
        '박수종':   { pos:'RF', AVG:.143, OBP:.200, SLG:.214, OPS:.414, 'wRC+':3.3, WAR:-0.12, oWAR:-0.28, dWAR:0.16, H:6, '2B':0, '3B':0, HR:1, RBI:2, R:6, SB:1, CS:0, BB:3, SO:12, G:38, PA:45, AB:42, IsoP:.071 , salary:0.4 },
        // 박찬혁: 군 전역. 통산 AVG.217 OBP.280 SLG.316 OPS.596 7HR → _ratings 기반 OVR
        '박찬혁':   { pos:'RF', _ratings:{ contact:35, power:35, eye:30, speed:40, defense:45 } , salary:0.4 },
        // ── 이적 선수 (2025 키움 기록, 2026 타팀) ──
        // 송성문: MLB 진출
        '송성문':   { pos:'3B', AVG:.315, OBP:.387, SLG:.530, OPS:.917, 'wRC+':164.1, WAR:8.58, oWAR:7.54, dWAR:1.04, H:181, '2B':37, '3B':4, HR:26, RBI:90, R:103, SB:25, CS:2, BB:68, SO:96, G:144, PA:646, AB:574, IsoP:.215 },
        // 안치홍: 2025 한화 → 키움 2차드래프트
        '안치홍':   { pos:'3B', AVG:.172, OBP:.245, SLG:.230, OPS:.475, 'wRC+':22.5, WAR:-1.34, oWAR:-1.37, dWAR:0.03, H:30, '2B':4, '3B':0, HR:2, RBI:18, R:9, SB:3, CS:0, BB:16, SO:39, G:66, PA:196, AB:174, IsoP:.058 , salary:2 },
        // 서건창: 자유계약 영입 (2025 KIA 기록)
        '서건창':   { pos:'2B', AVG:.136, OBP:.208, SLG:.318, OPS:.526, 'wRC+':34.6, WAR:-0.01, oWAR:-0.10, dWAR:0.09, H:3, '2B':1, '3B':0, HR:1, RBI:2, R:1, SB:1, CS:0, BB:2, SO:5, G:10, PA:26, AB:22, IsoP:.182 , salary:1.2 },
        // 브룩스: MLB 통산 2시즌 37G AVG.136 OBP.208 OPS.420. 에버리지형+선구안+수비 우수. ABS 경험.
        '브룩스':   { pos:'RF', _ratings:{ contact:55, power:40, eye:55, speed:45, defense:58 } , salary:9.8 },
        // 추재현: 기존 데이터 유지
        '추재현': { pos:'LF', AVG:.222, OBP:.259, SLG:.321, OPS:.580, 'wRC+':51.1, WAR:-0.53, oWAR:-0.43, dWAR:-0.10, H:18, '2B':3, '3B':1, HR:1, RBI:7, R:7, SB:0, CS:0, BB:3, SO:17, G:34, PA:87, AB:81, IsoP:.099, salary:0.30, defRAA:-0.50, rangeRAA:-0.30, errRAA:-0.10, armRAA:-0.10 },
        // 최재영: 신인
        '최재영':   { pos:'SS', _ratings:{ contact:35, power:28, eye:30, speed:50, defense:48 } , salary:0.3 },
        // 박한결: 신인
        '박한결':   { pos:'2B', _ratings:{ contact:32, power:30, eye:28, speed:45, defense:45 } , salary:0.3 },
    },
    'KT': {
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // ── 선발 ──
        '고영표':    { pos:'P', role:'선발', G:29, GS:26, W:11, L:8,  S:0,  HLD:0,  IP:161.0, H:170, HR:10, BB:30, HBP:15, SO:154, ER:59, R:70,  ERA:3.30, WHIP:1.24, FIP:3.14, WAR:4.17, BABIP:0.341, WPA:1.04,
            pitches:[{name:'체인지업',pct:49,velo:116.9},{name:'투심',pct:34,velo:134.8},{name:'커브',pct:8,velo:116.7},{name:'포심',pct:4,velo:134.9},{name:'커터',pct:4,velo:127.0},{name:'슬라이더',pct:1,velo:125.7}] },
        '소형준':    { pos:'P', role:'선발', G:26, GS:24, W:10, L:7,  S:1,  HLD:0,  IP:147.1, H:155, HR:6,  BB:29, HBP:3,  SO:123, ER:54, R:60,  ERA:3.30, WHIP:1.25, FIP:2.99, WAR:3.72, BABIP:0.331, WPA:1.81,
            pitches:[{name:'투심',pct:51,velo:145.1},{name:'커터',pct:28,velo:139.1},{name:'체인지업',pct:17,velo:131.8},{name:'커브',pct:4,velo:124.0}] },
        '전용주':    { pos:'P', role:'중계', G:21, GS:0,  W:0,  L:1,  S:0,  HLD:4,  IP:13.2,  H:18,  HR:0,  BB:7,  HBP:0,  SO:11,  ER:6,  R:8,   ERA:3.95, WHIP:1.83, FIP:3.55, WAR:0.17, BABIP:0.375, WPA:-0.02,
            pitches:[{name:'포심',pct:56,velo:147.9},{name:'슬라이더',pct:44,velo:134.9}] },
        // 스기모토: 일본 독립리그(SILP) 통산 3시즌 75G 120.1IP ERA3.89 108K. max154. 포심+슬라이더+포크.
        '스기모토':  { pos:'P', role:'선발', G:75, GS:0, W:9, L:9, S:0, HLD:11, IP:120.1, H:114, HR:4, BB:40, HBP:5, SO:108, ER:52, R:52, ERA:3.89, WHIP:1.28, FIP:3.50, WAR:0.00,
            pitches:[{name:'포심',pct:45,velo:150},{name:'슬라이더',pct:25,velo:135},{name:'포크',pct:20,velo:138},{name:'커브',pct:10,velo:125}] },
        // 사우어: MLB 통산 2시즌 24G 46IP ERA6.85 WHIP1.674. 포심 150중반+커터+싱커+슬라이더+스플리터.
        '사우어':    { pos:'P', role:'선발', G:24, GS:0, W:2, L:1, S:1, HLD:0, IP:46.0, H:58, HR:9, BB:19, HBP:3, SO:33, ER:35, R:35, ERA:6.85, WHIP:1.67, FIP:6.00, WAR:0.00,
            pitches:[{name:'포심',pct:30,velo:155},{name:'커터',pct:25,velo:148},{name:'싱커',pct:20,velo:153},{name:'슬라이더',pct:15,velo:138},{name:'스플리터',pct:10,velo:142}] },
        // 보쉴리: MLB 통산 3시즌 28G 49.2IP ERA5.80 WHIP1.591. 포심(92mph)+커터+싱커+커브+체인지업. 다양한 구종+경기운영.
        '보쉴리':    { pos:'P', role:'중계', G:28, GS:0, W:1, L:0, S:1, HLD:0, IP:49.2, H:61, HR:6, BB:18, HBP:2, SO:47, ER:32, R:32, ERA:5.80, WHIP:1.59, FIP:4.50, WAR:0.00,
            pitches:[{name:'포심',pct:30,velo:148},{name:'커터',pct:25,velo:142},{name:'싱커',pct:20,velo:146},{name:'커브',pct:15,velo:125},{name:'체인지업',pct:10,velo:135}] },
        // 박지훈: 신인
        '박지훈':    { pos:'P', role:'중계' , salary:0.3 },
        // ── 마무리 ──
        '박영현':    { pos:'P', role:'마무리', G:67, GS:0,  W:5,  L:6,  S:35, HLD:1,  IP:69.0,  H:68,  HR:9,  BB:34, HBP:2,  SO:77,  ER:26, R:31,  ERA:3.39, WHIP:1.48, FIP:3.99, WAR:0.95, BABIP:0.326, WPA:0.78,
            pitches:[{name:'포심',pct:66,velo:147.5},{name:'체인지업',pct:25,velo:129.0},{name:'슬라이더',pct:8,velo:136.3}] },
        // ── 중계 ──
        '우규민':    { pos:'P', role:'중계', G:53, GS:0,  W:1,  L:2,  S:0,  HLD:9,  IP:44.1,  H:45,  HR:2,  BB:3,  HBP:4,  SO:24,  ER:12, R:12,  ERA:2.44, WHIP:1.08, FIP:3.54, WAR:1.12, BABIP:0.291, WPA:-0.25,
            pitches:[{name:'포심',pct:39,velo:138.3},{name:'슬라이더',pct:28,velo:130.3},{name:'커브',pct:28,velo:117.3},{name:'체인지업',pct:5,velo:123.9}] },
        '이상동':    { pos:'P', role:'중계', G:41, GS:0,  W:3,  L:0,  S:0,  HLD:5,  IP:43.1,  H:31,  HR:4,  BB:9,  HBP:2,  SO:34,  ER:12, R:12,  ERA:2.49, WHIP:0.92, FIP:3.87, WAR:1.12, BABIP:0.231, WPA:0.41,
            pitches:[{name:'포심',pct:52,velo:145.7},{name:'포크',pct:37,velo:129.1},{name:'슬라이더',pct:11,velo:132.9}] },
        '손동현':    { pos:'P', role:'중계', G:58, GS:0,  W:5,  L:0,  S:1,  HLD:13, IP:58.2,  H:66,  HR:6,  BB:12, HBP:3,  SO:55,  ER:25, R:30,  ERA:3.84, WHIP:1.33, FIP:3.45, WAR:0.94, BABIP:0.339, WPA:1.58,
            pitches:[{name:'포심',pct:57,velo:144.3},{name:'포크',pct:40,velo:124.9},{name:'커브',pct:2,velo:120.4},{name:'슬라이더',pct:1,velo:127.4}] },
        '김민수':    { pos:'P', role:'중계', G:58, GS:0,  W:4,  L:3,  S:0,  HLD:11, IP:52.2,  H:63,  HR:5,  BB:15, HBP:1,  SO:36,  ER:29, R:31,  ERA:4.96, WHIP:1.48, FIP:4.25, WAR:0.43, BABIP:0.339, WPA:-0.28,
            pitches:[{name:'슬라이더',pct:45,velo:132.2},{name:'포심',pct:40,velo:143.4},{name:'체인지업',pct:10,velo:130.3},{name:'커터',pct:3,velo:139.4},{name:'커브',pct:1,velo:125.3}] },
        '주권':      { pos:'P', role:'중계', G:34, GS:0,  W:0,  L:1,  S:0,  HLD:0,  IP:40.2,  H:48,  HR:3,  BB:13, HBP:0,  SO:19,  ER:20, R:23,  ERA:4.43, WHIP:1.50, FIP:4.65, WAR:0.31, BABIP:0.326, WPA:-0.91,
            pitches:[{name:'체인지업',pct:39,velo:128.5},{name:'투심',pct:31,velo:142.0},{name:'포심',pct:22,velo:143.0},{name:'슬라이더',pct:7,velo:134.4},{name:'커브',pct:1,velo:119.0}] },
        '원상현':    { pos:'P', role:'중계', G:52, GS:0,  W:0,  L:3,  S:0,  HLD:14, IP:57.0,  H:56,  HR:8,  BB:35, HBP:1,  SO:45,  ER:33, R:35,  ERA:5.21, WHIP:1.60, FIP:5.52, WAR:0.19, BABIP:0.286, WPA:0.46,
            pitches:[{name:'포심',pct:48,velo:146.8},{name:'체인지업',pct:35,velo:129.2},{name:'커브',pct:15,velo:129.7},{name:'투심',pct:1,velo:145.0},{name:'슬라이더',pct:1,velo:132.3}] },
        // 한승혁: 2025 한화 → KT 보상선수 이적
        '한승혁':    { pos:'P', role:'중계', G:71, GS:0, W:3, L:3, S:3, HLD:16, IP:64.0, H:56, HR:4, BB:23, HBP:7, SO:53, ER:16, R:18, ERA:2.25, WHIP:1.23, FIP:4.09, WAR:2.54, BABIP:0.289, WPA:1.37,
            pitches:[{name:'포심',pct:37,velo:148.4},{name:'슬라이더',pct:28,velo:135.8},{name:'포크',pct:17,velo:135.8},{name:'커브',pct:10,velo:116.9},{name:'투심',pct:8,velo:148.2}] },
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        // 김현수: 2025 LG → KT 이적 (기존 데이터 유지)
        '김현수': { pos:'LF', AVG:.298, OBP:.384, SLG:.422, OPS:.806, 'wRC+':133.1, WAR:3.36, oWAR:3.61, dWAR:-0.24, H:144, '2B':24, '3B':0, HR:12, RBI:90, R:66, SB:4, CS:0, BB:64, SO:73, G:140, PA:552, AB:483, IsoP:.124, salary:5.0, defRAA:-1.35, rangeRAA:-0.14, errRAA:0.46 },
        '안현민': { pos:'CF', AVG:.334, OBP:.448, SLG:.570, OPS:1.018, 'wRC+':182.7, WAR:6.77, oWAR:6.63, dWAR:0.14, H:132, '2B':19, '3B':4, HR:22, RBI:80, R:72, SB:7, CS:1, BB:75, SO:72, G:112, PA:482, AB:395, IsoP:.236, _minSpeed:55, defRAA:0.86, rangeRAA:1.48, errRAA:-0.36, armRAA:-0.26 , salary:1.8 },
        '장성우': { pos:'C', AVG:.247, OBP:.333, SLG:.380, OPS:.713, 'wRC+':96.1, WAR:2.27, oWAR:2.24, dWAR:0.03, H:102, '2B':13, '3B':0, HR:14, RBI:58, R:44, SB:0, CS:1, BB:55, SO:96, G:129, PA:480, AB:413, IsoP:.133, defRAA:0.30, rangeRAA:-1.69, errRAA:1.49, csRAA:-1.08, frmRAA:0.00 , salary:3 },
        '허경민': { pos:'3B', AVG:.283, OBP:.362, SLG:.355, OPS:.717, 'wRC+':99.4, WAR:1.68, oWAR:1.69, dWAR:-0.01, H:119, '2B':18, '3B':0, HR:4, RBI:44, R:47, SB:4, CS:1, BB:39, SO:35, G:114, PA:481, AB:420, IsoP:.072, defRAA:-0.08, rangeRAA:-1.27, errRAA:0.96, dpRAA:-0.41 , salary:7 },
        // 강백호: 2025 KT 소속
        '강백호': { pos:'1B', AVG:.265, OBP:.358, SLG:.467, OPS:.825, 'wRC+':125.9, WAR:1.68, oWAR:1.74, dWAR:-0.06, H:85, '2B':18, '3B':1, HR:15, RBI:61, R:41, SB:2, CS:4, BB:44, SO:64, G:95, PA:369, AB:321, IsoP:.202, salary:9.0, defRAA:-0.22, rangeRAA:-0.24, errRAA:0.02 },
        '김상수': { pos:'2B', AVG:.254, OBP:.349, SLG:.335, OPS:.684, 'wRC+':93.3, WAR:1.17, oWAR:1.64, dWAR:-0.46, H:90, '2B':14, '3B':0, HR:5, RBI:47, R:42, SB:3, CS:1, BB:52, SO:57, G:113, PA:423, AB:355, IsoP:.081, defRAA:-2.22, rangeRAA:-1.61, errRAA:-0.32, dpRAA:-0.28 },
        '황재균': { pos:'3B', AVG:.275, OBP:.336, SLG:.379, OPS:.715, 'wRC+':95.2, WAR:0.48, oWAR:1.08, dWAR:-0.61, H:106, '2B':19, '3B':0, HR:7, RBI:48, R:50, SB:3, CS:1, BB:34, SO:84, G:112, PA:424, AB:385, IsoP:.104, defRAA:-6.10, rangeRAA:-4.50, errRAA:-0.80, dpRAA:-0.80 },
        '권동진': { pos:'SS', AVG:.225, OBP:.304, SLG:.303, OPS:.607, 'wRC+':68.4, WAR:0.40, oWAR:0.52, dWAR:-0.11, H:61, '2B':12, '3B':3, HR:1, RBI:25, R:34, SB:3, CS:1, BB:30, SO:91, G:123, PA:309, AB:271, IsoP:.078, defRAA:-0.99, rangeRAA:3.33, errRAA:-0.41, dpRAA:-3.91 , salary:0.7 },
        '김민혁': { pos:'LF', AVG:.287, OBP:.341, SLG:.329, OPS:.670, 'wRC+':84.2, WAR:-0.15, oWAR:0.26, dWAR:-0.42, H:109, '2B':12, '3B':2, HR:0, RBI:35, R:52, SB:11, CS:3, BB:25, SO:41, G:106, PA:417, AB:380, IsoP:.042, defRAA:-4.20, rangeRAA:-2.80, errRAA:-0.60, armRAA:-0.80 , salary:2.9 },
        '오윤석': { pos:'2B', AVG:.256, OBP:.335, SLG:.321, OPS:.656, 'wRC+':82.0, WAR:0.66, oWAR:0.29, dWAR:0.37, H:40, '2B':8, '3B':1, HR:0, RBI:19, R:30, SB:0, CS:0, BB:12, SO:41, G:77, PA:184, AB:156, IsoP:.065, defRAA:2.25, rangeRAA:2.19, errRAA:0.63, dpRAA:-0.57 , salary:1.4 },
        '배정대': { pos:'CF', AVG:.204, OBP:.279, SLG:.292, OPS:.571, 'wRC+':52.8, WAR:-0.03, oWAR:-0.57, dWAR:0.54, H:49, '2B':11, '3B':2, HR:2, RBI:28, R:25, SB:6, CS:3, BB:19, SO:65, G:99, PA:276, AB:240, IsoP:.088, defRAA:5.39, rangeRAA:3.20, errRAA:0.49, armRAA:1.70 , salary:2.6 },
        '장진혁': { pos:'LF', AVG:.209, OBP:.275, SLG:.331, OPS:.606, 'wRC+':60.9, WAR:-0.01, oWAR:-0.16, dWAR:0.15, H:29, '2B':3, '3B':1, HR:4, RBI:19, R:19, SB:1, CS:0, BB:13, SO:46, G:86, PA:157, AB:139, IsoP:.122, defRAA:2.96, rangeRAA:2.05, errRAA:0.21, armRAA:0.70 , salary:0.9 },
        // ── 준레귤러 / 벤치 ──
        '문상철': { pos:'RF', AVG:.265, OBP:.316, SLG:.398, OPS:.714, 'wRC+':89.3, WAR:0.25, oWAR:0.43, dWAR:-0.18, H:37, '2B':10, '3B':0, HR:3, RBI:23, R:22, SB:2, CS:0, BB:11, SO:45, G:79, PA:209, AB:173, IsoP:.133 , salary:1.4 },
        '이정훈': { pos:'LF', AVG:.258, OBP:.338, SLG:.379, OPS:.717, 'wRC+':96.3, WAR:-0.08, oWAR:0.32, dWAR:-0.40, H:34, '2B':4, '3B':0, HR:4, RBI:14, R:20, SB:0, CS:1, BB:13, SO:48, G:59, PA:148, AB:132, IsoP:.121 , salary:0.7 },
        '이호연': { pos:'DH', AVG:.343, OBP:.378, SLG:.486, OPS:.864, 'wRC+':129.9, WAR:0.21, oWAR:0.30, dWAR:-0.08, H:24, '2B':7, '3B':0, HR:1, RBI:8, R:8, SB:0, CS:0, BB:3, SO:14, G:32, PA:75, AB:70, IsoP:.143 , salary:0.5 },
        '조대현': { pos:'C', AVG:.187, OBP:.262, SLG:.240, OPS:.502, 'wRC+':28.2, WAR:-0.29, oWAR:-0.49, dWAR:0.20, H:14, '2B':4, '3B':0, HR:0, RBI:11, R:7, SB:0, CS:0, BB:7, SO:22, G:64, PA:90, AB:75, IsoP:.053, defRAA:2.00, rangeRAA:0.90, errRAA:0.30, csRAA:0.80, frmRAA:0.00 , salary:0.6 },
        '강현우': { pos:'RF', AVG:.188, OBP:.293, SLG:.250, OPS:.543, 'wRC+':55.5, WAR:-0.11, oWAR:0.05, dWAR:-0.16, H:12, '2B':1, '3B':0, HR:1, RBI:8, R:5, SB:0, CS:0, BB:10, SO:14, G:40, PA:78, AB:64, IsoP:.062 , salary:0.6 },
        '안치영': { pos:'RF', AVG:.227, OBP:.327, SLG:.318, OPS:.645, 'wRC+':78.7, WAR:0.09, oWAR:0.06, dWAR:0.03, H:10, '2B':1, '3B':0, HR:1, RBI:6, R:9, SB:0, CS:2, BB:4, SO:13, G:47, PA:56, AB:44, IsoP:.091 , salary:0.5 },
        // ── 이적 선수 (2025 KT 기록, 2026 타팀/방출) ──
        // 로하스: 방출
        '로하스': { pos:'DH', AVG:.239, OBP:.333, SLG:.426, OPS:.759, 'wRC+':107.0, WAR:1.21, oWAR:1.39, dWAR:-0.17, H:79, '2B':20, '3B':0, HR:14, RBI:43, R:48, SB:1, CS:1, BB:48, SO:71, G:95, PA:384, AB:331, IsoP:.187 },
        // 스티븐슨: 방출
        // 황재균: 2025 KT 기록 유지 (은퇴 등 여부 미정)
        // 한승택: 2025 KIA → KT 이적
        '한승택': { pos:'3B', AVG:.238, OBP:.304, SLG:.286, OPS:.590, 'wRC+':63.0, WAR:0.08, oWAR:0.02, dWAR:0.06, H:5, '2B':1, '3B':0, HR:0, RBI:0, R:3, SB:0, CS:0, BB:1, SO:7, G:15, PA:23, AB:21, IsoP:.048 , salary:1.5 },
        // 조이현: 상무 전역. 상무 18G 10W3L ERA3.60 80IP 40K
        '조이현':  { pos:'P', role:'선발', G:18, GS:18, W:10, L:3, S:0, HLD:0, IP:80.0, H:84, HR:9, BB:8, HBP:1, SO:40, ER:32, R:38, ERA:3.60, WHIP:1.15, FIP:3.80, WAR:0.00 , salary:0.6 },
        // 최원준: 2025 NC → KT 이적
        '최원준': { pos:'CF', AVG:.258, OBP:.297, SLG:.355, OPS:.652, 'wRC+':69.5, WAR:-0.58, oWAR:-0.03, dWAR:-0.54, H:48, '2B':6, '3B':3, HR:2, RBI:25, R:34, SB:17, CS:7, BB:8, SO:28, G:50, PA:204, AB:186, IsoP:.097 },
        // 힐리어드: MLB 통산 7시즌 332G AVG.218 OBP.298 SLG.437 OPS.735 44HR. 좌타 파워+선구안, 컨택 약점. 위즈덤 유형.
        '힐리어드': { pos:'RF', _ratings:{ contact:35, power:65, eye:50, speed:45, defense:48 } , salary:9.8 },
        // 이강민: 신인. 고졸 개막전 3안타, 5경기 .455. 장성호 이후 최초. 잠재력 반영.
        '이강민': { pos:'SS', _ratings:{ contact:50, power:35, eye:40, speed:55, defense:50 } , salary:0.3 },
        // 류현인: 상무 전역. 상무 98G AVG.412 OBP.503 SLG.572 9HR 80RBI 3SB
        '류현인': { pos:'SS', _ratings:{ contact:60, power:50, eye:55, speed:45, defense:48 } , salary:0.3 },
    },
    'KIA': {
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // ── 선발 ──
        '네일':      { pos:'P', role:'선발', G:27, GS:27, W:8,  L:4,  S:0,  HLD:0,  IP:164.1, H:135, HR:6,  BB:41, HBP:15, SO:152, ER:41, R:46,  ERA:2.25, WHIP:1.07, FIP:3.13, WAR:6.59, BABIP:0.291, WPA:3.81,
            pitches:[{name:'투심',pct:38,velo:148.3},{name:'슬라이더',pct:31,velo:134.6},{name:'체인지업',pct:20,velo:139.9},{name:'커터',pct:9,velo:142.7},{name:'포심',pct:2,velo:148.5}] },
        '올러':      { pos:'P', role:'선발', G:26, GS:26, W:11, L:7,  S:0,  HLD:0,  IP:149.0, H:125, HR:8,  BB:47, HBP:8,  SO:169, ER:60, R:64,  ERA:3.62, WHIP:1.15, FIP:2.90, WAR:3.61, BABIP:0.306, WPA:0.93,
            pitches:[{name:'포심',pct:44,velo:150.0},{name:'슬라이더',pct:31,velo:136.2},{name:'체인지업',pct:12,velo:139.8},{name:'커브',pct:8,velo:129.3},{name:'투심',pct:5,velo:149.1}] },
        '양현종':    { pos:'P', role:'선발', G:30, GS:30, W:7,  L:9,  S:0,  HLD:0,  IP:153.0, H:171, HR:12, BB:57, HBP:4,  SO:109, ER:86, R:101, ERA:5.06, WHIP:1.49, FIP:4.35, WAR:0.86, BABIP:0.327, WPA:-2.77,
            pitches:[{name:'포심',pct:48,velo:140.3},{name:'체인지업',pct:26,velo:128.5},{name:'슬라이더',pct:21,velo:128.7},{name:'커브',pct:5,velo:115.9}] },
        '김도현':    { pos:'P', role:'선발', G:24, GS:24, W:4,  L:7,  S:0,  HLD:0,  IP:125.1, H:149, HR:11, BB:33, HBP:10, SO:71,  ER:67, R:79,  ERA:4.81, WHIP:1.45, FIP:4.64, WAR:0.97, BABIP:0.322, WPA:-1.48,
            pitches:[{name:'포심',pct:27,velo:145.8},{name:'체인지업',pct:19,velo:133.0},{name:'투심',pct:19,velo:144.8},{name:'커브',pct:19,velo:127.8},{name:'슬라이더',pct:17,velo:137.2}] },
        // 이의리: 2025 부상 복귀(39.2IP ERA7.94). 통산 91G ERA4.32 435.1IP 467K. 좌투 선발 에이스 잠재력.
        '이의리':    { pos:'P', role:'선발', G:10, GS:10, W:1,  L:4,  S:0,  HLD:0,  IP:39.2,  H:41,  HR:6,  BB:31, HBP:3,  SO:42,  ER:35, R:37,  ERA:7.94, WHIP:1.82, FIP:5.81, WAR:-0.36, BABIP:0.324, WPA:-1.37,
            pitches:[{name:'포심',pct:47,velo:147.8},{name:'슬라이더',pct:23,velo:135.0},{name:'체인지업',pct:20,velo:133.1},{name:'커브',pct:9,velo:124.2}],
            _overrideStamina:55 },
        // ── 마무리 ──
        '정해영':    { pos:'P', role:'마무리', G:60, GS:0,  W:3,  L:7,  S:27, HLD:0,  IP:61.2,  H:75,  HR:4,  BB:18, HBP:3,  SO:72,  ER:26, R:30,  ERA:3.79, WHIP:1.51, FIP:2.86, WAR:0.70, BABIP:0.401, WPA:-0.11,
            pitches:[{name:'포심',pct:56,velo:147.7},{name:'슬라이더',pct:29,velo:135.5},{name:'포크',pct:15,velo:135.5}] },
        // ── 중계 ──
        '성영탁':    { pos:'P', role:'중계', G:45, GS:0,  W:3,  L:2,  S:0,  HLD:7,  IP:52.1,  H:38,  HR:2,  BB:13, HBP:0,  SO:30,  ER:9,  R:11,  ERA:1.55, WHIP:0.97, FIP:3.74, WAR:1.99, BABIP:0.238, WPA:1.71,
            pitches:[{name:'슬라이더',pct:43,velo:135.7},{name:'투심',pct:40,velo:143.1},{name:'커브',pct:17,velo:125.1}] },
        '전상현':    { pos:'P', role:'중계', G:74, GS:0,  W:7,  L:5,  S:1,  HLD:25, IP:70.0,  H:64,  HR:4,  BB:20, HBP:2,  SO:50,  ER:26, R:30,  ERA:3.34, WHIP:1.20, FIP:3.73, WAR:1.36, BABIP:0.282, WPA:1.06,
            pitches:[{name:'포심',pct:43,velo:143.8},{name:'슬라이더',pct:29,velo:135.7},{name:'포크',pct:22,velo:134.4},{name:'커브',pct:6,velo:125.2}] },
        '조상우':    { pos:'P', role:'중계', G:72, GS:0,  W:6,  L:6,  S:1,  HLD:28, IP:60.0,  H:64,  HR:5,  BB:27, HBP:6,  SO:55,  ER:26, R:29,  ERA:3.90, WHIP:1.52, FIP:4.27, WAR:1.03, BABIP:0.343, WPA:-0.53,
            pitches:[{name:'포심',pct:38,velo:145.5},{name:'슬라이더',pct:33,velo:129.5},{name:'투심',pct:20,velo:144.4},{name:'포크',pct:9,velo:137.1}] },
        '최지민':    { pos:'P', role:'중계', G:66, GS:0,  W:2,  L:4,  S:0,  HLD:9,  IP:53.1,  H:46,  HR:5,  BB:51, HBP:4,  SO:39,  ER:39, R:40,  ERA:6.58, WHIP:1.82, FIP:6.51, WAR:-0.15, BABIP:0.270, WPA:-0.25,
            pitches:[{name:'포심',pct:68,velo:145.8},{name:'슬라이더',pct:21,velo:134.3},{name:'체인지업',pct:10,velo:134.4}] },
        '김기훈':    { pos:'P', role:'중계', G:24, GS:0,  W:1,  L:1,  S:0,  HLD:0,  IP:27.2,  H:25,  HR:2,  BB:10, HBP:1,  SO:27,  ER:10, R:11,  ERA:3.25, WHIP:1.27, FIP:3.61, WAR:0.36, BABIP:0.303, WPA:-0.26,
            pitches:[{name:'포심',pct:50,velo:142.5},{name:'체인지업',pct:25,velo:124.2},{name:'슬라이더',pct:23,velo:130.4},{name:'커브',pct:1,velo:122.2}] },
        '김시훈':    { pos:'P', role:'중계', G:9,  GS:0,  W:1,  L:0,  S:0,  HLD:0,  IP:9.2,   H:11,  HR:3,  BB:4,  HBP:0,  SO:7,   ER:8,  R:10,  ERA:7.45, WHIP:1.55, FIP:7.13, WAR:-0.36, BABIP:0.276, WPA:-0.05,
            pitches:[{name:'포크',pct:36,velo:130.3},{name:'포심',pct:36,velo:140.3},{name:'커브',pct:23,velo:114.0},{name:'슬라이더',pct:4,velo:129.1}] },
        '황동하':    { pos:'P', role:'중계', G:18, GS:3,  W:1,  L:2,  S:0,  HLD:0,  IP:35.2,  H:38,  HR:4,  BB:10, HBP:3,  SO:31,  ER:21, R:21,  ERA:5.30, WHIP:1.35, FIP:4.25, WAR:0.06, BABIP:0.327, WPA:-0.56,
            pitches:[{name:'포심',pct:43,velo:144.2},{name:'슬라이더',pct:34,velo:131.4},{name:'포크',pct:14,velo:130.4},{name:'커브',pct:8,velo:117.3}] },
        // 홍민규: 2025 두산 → KIA 이적
        '홍민규':    { pos:'P', role:'중계', G:20, GS:2, W:2, L:1, S:1, HLD:0, IP:33.1, H:37, HR:4, BB:15, HBP:1, SO:17, ER:17, R:19, ERA:4.59, WHIP:1.56, FIP:5.61, WAR:0.03, BABIP:0.290,
            pitches:[{name:'포심',pct:50,velo:145},{name:'슬라이더',pct:30,velo:132},{name:'커브',pct:12,velo:120},{name:'체인지업',pct:8,velo:128}] },
        // 곽도규: 2025 부상(9G 4IP ERA13.50). 2024 71G ERA3.56 55.2IP 64K 좌완 셋업맨.
        '곽도규':    { pos:'P', role:'중계', G:9, GS:0, W:0, L:0, S:0, HLD:3, IP:4.0, H:3, HR:0, BB:6, HBP:2, SO:5, ER:6, R:6, ERA:13.50, WHIP:2.25, FIP:6.00, WAR:0.00, BABIP:0.375, WPA:-0.19,
            pitches:[{name:'포심',pct:69,velo:146},{name:'슬라이더',pct:25,velo:125},{name:'체인지업',pct:5,velo:127}],
            _overrideStamina:45 },
        // ── 이적 선수 (2025 KIA 기록, 2026 타팀) ──
        // 임기영 → 삼성 이적
        '임기영':    { pos:'P', role:'중계', G:10, GS:0,  W:1,  L:1,  S:0,  HLD:0,  IP:9.0,   H:23,  HR:2,  BB:4,  HBP:0,  SO:5,   ER:13, R:13,  ERA:13.00, WHIP:3.00, FIP:6.60, WAR:-0.48, BABIP:0.525, WPA:-0.45,
            pitches:[{name:'포심',pct:40,velo:137.9},{name:'체인지업',pct:32,velo:126.2},{name:'슬라이더',pct:24,velo:126.5},{name:'투심',pct:4,velo:135.1}] },
        // 김범수: 2025 한화 소속 → KIA 이적
        '김범수':    { pos:'P', role:'중계', G:73, GS:0, W:2, L:1, S:2, HLD:6, IP:48.0, H:30, HR:0, BB:22, HBP:4, SO:41, ER:12, R:17, ERA:2.25, WHIP:1.08, FIP:3.45, WAR:1.33, BABIP:0.238, WPA:1.02,
            pitches:[{name:'슬라이더',pct:38,velo:135.8},{name:'포심',pct:36,velo:147.3},{name:'포크',pct:14,velo:136.4},{name:'커브',pct:12,velo:117.1}] },
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        // 김도영: 2025 부상시즌(122PA) → 2024 몬스터 시즌 기반 OVR 유지, 2025 기록만 업데이트
        '김도영': { pos:'3B', AVG:.309, OBP:.361, SLG:.582, OPS:.943, 'wRC+':152.4, WAR:1.33, oWAR:1.11, dWAR:0.22, H:34, '2B':9, '3B':0, HR:7, RBI:27, R:20, SB:3, CS:0, BB:10, SO:23, G:30, PA:122, AB:110, IsoP:.273, salary:3.0, defRAA:2.22, rangeRAA:1.96, errRAA:-1.15, dpRAA:1.34,
            _ratings:{ contact:70, power:75, eye:65, speed:70, defense:45 } },
        '김호령': { pos:'CF', AVG:.283, OBP:.359, SLG:.434, OPS:.793, 'wRC+':123.2, WAR:2.82, oWAR:2.57, dWAR:0.24, H:94, '2B':26, '3B':3, HR:6, RBI:39, R:46, SB:12, CS:1, BB:34, SO:94, G:105, PA:381, AB:332, IsoP:.151, defRAA:2.43, rangeRAA:2.95, errRAA:-1.64, armRAA:1.11 , salary:2.5 },
        '김선빈': { pos:'2B', AVG:.321, OBP:.395, SLG:.428, OPS:.823, 'wRC+':136.6, WAR:2.11, oWAR:2.74, dWAR:-0.63, H:87, '2B':18, '3B':1, HR:3, RBI:46, R:31, SB:4, CS:0, BB:31, SO:35, G:84, PA:308, AB:271, IsoP:.107, defRAA:-6.31, rangeRAA:-4.86, errRAA:-0.02, dpRAA:-1.43 , salary:6 },
        '나성범': { pos:'LF', AVG:.268, OBP:.381, SLG:.444, OPS:.825, 'wRC+':136.6, WAR:1.91, oWAR:2.23, dWAR:-0.32, H:70, '2B':16, '3B':0, HR:10, RBI:36, R:30, SB:0, CS:0, BB:42, SO:79, G:82, PA:310, AB:261, IsoP:.176, defRAA:-3.20, rangeRAA:-2.10, errRAA:-0.50, armRAA:-0.60 , salary:8 },
        '김태군': { pos:'C', AVG:.258, OBP:.331, SLG:.373, OPS:.704, 'wRC+':92.3, WAR:1.77, oWAR:1.24, dWAR:0.53, H:61, '2B':10, '3B':1, HR:5, RBI:31, R:20, SB:0, CS:0, BB:17, SO:20, G:100, PA:274, AB:236, IsoP:.115, defRAA:5.25, rangeRAA:0.68, errRAA:-0.66, csRAA:0.30, frmRAA:0.00 , salary:6 },
        '한준수': { pos:'C', AVG:.225, OBP:.304, SLG:.369, OPS:.673, 'wRC+':85.3, WAR:0.66, oWAR:0.98, dWAR:-0.32, H:55, '2B':12, '3B':1, HR:7, RBI:26, R:33, SB:0, CS:0, BB:26, SO:48, G:103, PA:276, AB:244, IsoP:.144, defRAA:-3.20, rangeRAA:0.57, errRAA:0.37, csRAA:-0.43, frmRAA:0.00 , salary:1 },
        '김규성': { pos:'2B', AVG:.233, OBP:.313, SLG:.301, OPS:.614, 'wRC+':73.1, WAR:0.53, oWAR:0.40, dWAR:0.13, H:45, '2B':4, '3B':0, HR:3, RBI:16, R:30, SB:5, CS:2, BB:21, SO:49, G:133, PA:222, AB:193, IsoP:.068, defRAA:0.52, rangeRAA:-0.41, errRAA:0.89, dpRAA:0.04 , salary:0.9 },
        '오선우': { pos:'1B', AVG:.265, OBP:.323, SLG:.432, OPS:.755, 'wRC+':105.0, WAR:0.03, oWAR:0.95, dWAR:-0.92, H:116, '2B':17, '3B':1, HR:18, RBI:56, R:58, SB:0, CS:2, BB:34, SO:158, G:124, PA:474, AB:437, IsoP:.167, defRAA:-9.20, rangeRAA:-5.90, errRAA:-1.00, armRAA:-2.30 , salary:1.2 },
        '윤도현': { pos:'2B', AVG:.275, OBP:.325, SLG:.470, OPS:.795, 'wRC+':106.5, WAR:0.43, oWAR:1.26, dWAR:-0.83, H:41, '2B':11, '3B':0, HR:7, RBI:17, R:24, SB:0, CS:0, BB:9, SO:45, G:40, PA:160, AB:149, IsoP:.195, defRAA:-1.43, rangeRAA:-2.09, errRAA:-0.49, dpRAA:1.16 , salary:0.6 },
        '최원준': { pos:'RF', AVG:.229, OBP:.282, SLG:.313, OPS:.595, 'wRC+':59.9, WAR:-0.73, oWAR:-0.13, dWAR:-0.60, H:52, '2B':7, '3B':0, HR:4, RBI:19, R:28, SB:9, CS:1, BB:15, SO:43, G:76, PA:245, AB:227, IsoP:.084, defRAA:-2.04, rangeRAA:-2.97, errRAA:0.02, armRAA:0.91 },
        // ── 준레귤러 / 벤치 ──
        '이창진': { pos:'LF', AVG:.161, OBP:.295, SLG:.226, OPS:.521, 'wRC+':56.9, WAR:-0.10, oWAR:-0.37, dWAR:0.27, H:15, '2B':3, '3B':0, HR:1, RBI:9, R:11, SB:0, CS:2, BB:16, SO:22, G:37, PA:113, AB:93, IsoP:.065, defRAA:1.74, rangeRAA:1.33, errRAA:0.24, armRAA:0.18 , salary:0.9 },
        '박민': { pos:'3B', AVG:.202, OBP:.265, SLG:.287, OPS:.552, 'wRC+':47.0, WAR:-0.15, oWAR:-0.21, dWAR:0.06, H:19, '2B':5, '3B':0, HR:1, RBI:6, R:11, SB:1, CS:0, BB:5, SO:33, G:71, PA:105, AB:94, IsoP:.085, defRAA:-1.70, rangeRAA:-1.22, errRAA:0.23, dpRAA:-0.92 , salary:0.6 },
        '변우혁': { pos:'RF', AVG:.218, OBP:.275, SLG:.268, OPS:.543, 'wRC+':45.8, WAR:-0.11, oWAR:-0.49, dWAR:0.39, H:31, '2B':7, '3B':0, HR:0, RBI:17, R:11, SB:0, CS:0, BB:10, SO:47, G:47, PA:153, AB:142, IsoP:.050 , salary:0.7 },
        '이우성': { pos:'RF', AVG:.219, OBP:.307, SLG:.335, OPS:.642, 'wRC+':80.2, WAR:-0.52, oWAR:-0.05, dWAR:-0.47, H:34, '2B':10, '3B':1, HR:2, RBI:15, R:11, SB:0, CS:0, BB:18, SO:37, G:56, PA:176, AB:155, IsoP:.116 , salary:1.6 },
        '박재현': { pos:'CF', AVG:.161, OBP:.275, SLG:.177, OPS:.452, 'wRC+':33.1, WAR:-1.06, oWAR:-0.65, dWAR:-0.41, H:10, '2B':1, '3B':0, HR:0, RBI:3, R:1, SB:1, CS:2, BB:7, SO:22, G:58, PA:69, AB:62, IsoP:.016, defRAA:-3.02, rangeRAA:-2.09, errRAA:0.13, armRAA:-1.06 , salary:0.5 },
        // ── 소표본 ──
        '박정우': { pos:'CF', AVG:.274, OBP:.400, SLG:.306, OPS:.706, 'wRC+':117.1, WAR:0.45, oWAR:0.40, dWAR:0.04, H:17, '2B':2, '3B':0, HR:0, RBI:4, R:17, SB:2, CS:1, BB:10, SO:12, G:53, PA:75, AB:62, IsoP:.032 , salary:0.6 },
        '정현창': { pos:'SS', AVG:.385, OBP:.467, SLG:.385, OPS:.852, 'wRC+':160.1, WAR:0.23, oWAR:0.15, dWAR:0.08, H:5, '2B':0, '3B':0, HR:0, RBI:0, R:4, SB:0, CS:1, BB:2, SO:4, G:12, PA:15, AB:13, IsoP:.000 , salary:0.6 },
        '황대인': { pos:'1B', AVG:.189, OBP:.228, SLG:.302, OPS:.530, 'wRC+':32.6, WAR:-0.16, oWAR:-0.35, dWAR:0.19, H:10, '2B':3, '3B':0, HR:1, RBI:8, R:3, SB:0, CS:0, BB:3, SO:14, G:18, PA:57, AB:53, IsoP:.113 },
        // ── 이적 선수 (2025 KIA 기록, 2026 타팀) ──
        // 위즈덤: 방출
        // 박찬호 → 두산 이적
        '박찬호': { pos:'CF', AVG:.287, OBP:.363, SLG:.359, OPS:.722, 'wRC+':107.3, WAR:4.56, oWAR:4.25, dWAR:0.30, H:148, '2B':18, '3B':2, HR:5, RBI:42, R:75, SB:27, CS:6, BB:62, SO:69, G:134, PA:595, AB:516, IsoP:.072 },
        // 최형우 → 삼성 이적
        '최형우': { pos:'DH', AVG:.307, OBP:.399, SLG:.529, OPS:.928, 'wRC+':157.6, WAR:4.37, oWAR:4.37, dWAR:-0.01, H:144, '2B':30, '3B':1, HR:24, RBI:86, R:74, SB:1, CS:0, BB:67, SO:98, G:133, PA:549, AB:469, IsoP:.222 , salary:4 },
        // 한승택 → KT 이적
        '한승택': { pos:'3B', AVG:.238, OBP:.304, SLG:.286, OPS:.590, 'wRC+':63.0, WAR:0.08, oWAR:0.02, dWAR:0.06, H:5, '2B':1, '3B':0, HR:0, RBI:0, R:3, SB:0, CS:0, BB:1, SO:7, G:15, PA:23, AB:21, IsoP:.048 , salary:1.5 },
        // 카스트로: MLB 6시즌+AAA. 배드볼 히터+유틸리티. 2025 AAA .307 21HR 장타 급상승.
        '카스트로': { pos:'RF', _ratings:{ contact:62, power:55, eye:30, speed:40, defense:45 } , salary:9.8 },
        // 데일: NPB 2군 2025 41G .297/.357/.398. 호주 국대 주전 SS. 유틸리티.
        '데일':   { pos:'SS', _ratings:{ contact:45, power:30, eye:38, speed:50, defense:50 } , salary:1 },
    },
    '한화': {
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // ── 선발 ──
        '폰세':      { pos:'P', role:'선발', G:29, GS:29, W:17, L:1,  S:0,  HLD:0,  IP:180.2, H:128, HR:10, BB:41, HBP:6,  SO:252, ER:38, R:41,  ERA:1.89, WHIP:0.94, FIP:1.92, WAR:8.38, BABIP:0.307, WPA:5.36,
            pitches:[{name:'포심',pct:47,velo:153.6},{name:'체인지업',pct:18,velo:141.1},{name:'슬라이더',pct:18,velo:143.9},{name:'커브',pct:16,velo:130.8},{name:'투심',pct:1,velo:152.8}] },
        '와이스':    { pos:'P', role:'선발', G:30, GS:30, W:16, L:5,  S:0,  HLD:0,  IP:178.2, H:127, HR:13, BB:56, HBP:13, SO:207, ER:57, R:63,  ERA:2.87, WHIP:1.02, FIP:3.12, WAR:5.95, BABIP:0.264, WPA:2.67,
            pitches:[{name:'포심',pct:47,velo:151.7},{name:'슬라이더',pct:35,velo:134.8},{name:'커브',pct:12,velo:129.1},{name:'체인지업',pct:6,velo:139.7}] },
        '류현진':    { pos:'P', role:'선발', G:26, GS:26, W:9,  L:7,  S:0,  HLD:0,  IP:139.1, H:144, HR:12, BB:25, HBP:4,  SO:122, ER:50, R:54,  ERA:3.23, WHIP:1.21, FIP:3.37, WAR:4.03, BABIP:0.325, WPA:1.27, salary:21.0,
            pitches:[{name:'포심',pct:44,velo:143.8},{name:'체인지업',pct:25,velo:128.9},{name:'커터',pct:17,velo:136.1},{name:'커브',pct:14,velo:113.7}] },
        '문동주':    { pos:'P', role:'선발', G:24, GS:23, W:11, L:5,  S:0,  HLD:0,  IP:121.0, H:112, HR:7,  BB:31, HBP:3,  SO:135, ER:54, R:57,  ERA:4.02, WHIP:1.18, FIP:2.72, WAR:2.53, BABIP:0.326, WPA:0.76, salary:2.2,
            pitches:[{name:'포심',pct:48,velo:152.3},{name:'포크',pct:20,velo:137.7},{name:'슬라이더',pct:18,velo:137.3},{name:'커브',pct:14,velo:125.0}] },
        '황준서':    { pos:'P', role:'선발', G:23, GS:12, W:2,  L:8,  S:0,  HLD:0,  IP:56.0,  H:54,  HR:7,  BB:26, HBP:2,  SO:57,  ER:33, R:37,  ERA:5.30, WHIP:1.43, FIP:4.46, WAR:0.41, BABIP:0.313, WPA:-0.44, salary:0.62,
            pitches:[{name:'포심',pct:50,velo:143.7},{name:'포크',pct:40,velo:126.2},{name:'커브',pct:8,velo:110.9},{name:'슬라이더',pct:2,velo:128.5}] },
        '엄상백':    { pos:'P', role:'선발', G:28, GS:16, W:2,  L:7,  S:0,  HLD:1,  IP:80.2,  H:106, HR:13, BB:38, HBP:8,  SO:74,  ER:59, R:60,  ERA:6.58, WHIP:1.79, FIP:5.37, WAR:-0.19, BABIP:0.383, WPA:-1.55, salary:9.0,
            pitches:[{name:'포심',pct:43,velo:145.7},{name:'체인지업',pct:37,velo:131.8},{name:'슬라이더',pct:10,velo:128.5},{name:'커터',pct:6,velo:136.7},{name:'커브',pct:2,velo:123.8},{name:'투심',pct:2,velo:145.5}] },
        // 에르난데스: MLB/MiLB 경력 — 쓰리쿼터 파이어볼러. 평균 150+(최고 157). 변화구 제구 우수, 싱커 무브먼트 약점.
        // KBO 예상 스탯 기반 OVR 산출 (MLB AAA 기록 + 스카우팅 리포트 종합)
        '에르난데스': { pos:'P', role:'선발', G:30, GS:30, W:0, L:0, S:0, HLD:0, IP:160.0, H:145, HR:14, BB:45, HBP:5, SO:155, ER:60, R:65, ERA:3.38, WHIP:1.19, FIP:3.60, WAR:0.00, salary:9.1,
            pitches:[{name:'싱커',pct:40,velo:151},{name:'슬라이더',pct:30,velo:137},{name:'체인지업',pct:25,velo:140},{name:'포심',pct:5,velo:153}] },
        // 왕옌청: NPB 2025시즌 — 22경기 10승5패 ERA3.26 116이닝. 최고 154km/h. 100구 이후 구속 유지.
        // NPB 이스턴 통산: 343IP 248K 144BB 22HR → 비율 기반 추정
        '왕옌청':    { pos:'P', role:'선발', G:22, GS:22, W:10, L:5, S:0, HLD:0, IP:116.0, H:117, HR:7, BB:49, HBP:4, SO:84, ER:42, R:46, ERA:3.26, WHIP:1.43, FIP:3.50, WAR:0.00, salary:4.8,
            pitches:[{name:'포심',pct:35,velo:150},{name:'슬라이더',pct:25,velo:135},{name:'체인지업',pct:20,velo:138},{name:'스플리터',pct:12,velo:140},{name:'커브',pct:8,velo:125}] },
        // 화이트: MLB 통산 3시즌 소표본(14IP). 핵심 구종: HB 17인치 스위퍼(역대급 평가). 포심 148~150+커터 143.
        // MLB 소표본 부정확 → 스카우팅 기반 KBO 예상 스탯으로 OVR 산출
        '화이트':    { pos:'P', role:'선발', G:28, GS:28, W:0, L:0, S:0, HLD:0, IP:150.0, H:140, HR:12, BB:50, HBP:6, SO:145, ER:55, R:60, ERA:3.30, WHIP:1.27, FIP:3.45, WAR:0.00, salary:11.2,
            pitches:[{name:'포심',pct:30,velo:149},{name:'스위퍼',pct:28,velo:135},{name:'싱커',pct:18,velo:148},{name:'커터',pct:12,velo:143},{name:'체인지업',pct:7,velo:137},{name:'커브',pct:5,velo:125}] },
        // ── 마무리 ──
        '김서현':    { pos:'P', role:'마무리', G:69, GS:0,  W:2,  L:4,  S:33, HLD:2,  IP:66.0,  H:52,  HR:4,  BB:31, HBP:8,  SO:71,  ER:23, R:23,  ERA:3.14, WHIP:1.26, FIP:3.70, WAR:1.99, BABIP:0.298, WPA:2.52, salary:1.68,
            pitches:[{name:'포심',pct:62,velo:153.4},{name:'슬라이더',pct:31,velo:134.9},{name:'체인지업',pct:6,velo:142.0},{name:'커브',pct:1,velo:122.3}] },
        // ── 중계 ──
        '한승혁':    { pos:'P', role:'중계', G:71, GS:0,  W:3,  L:3,  S:3,  HLD:16, IP:64.0,  H:56,  HR:4,  BB:23, HBP:7,  SO:53,  ER:16, R:18,  ERA:2.25, WHIP:1.23, FIP:4.09, WAR:2.54, BABIP:0.289, WPA:1.37,
            pitches:[{name:'포심',pct:37,velo:148.4},{name:'슬라이더',pct:28,velo:135.8},{name:'포크',pct:17,velo:135.8},{name:'커브',pct:10,velo:116.9},{name:'투심',pct:8,velo:148.2}] },
        '김범수':    { pos:'P', role:'중계', G:73, GS:0,  W:2,  L:1,  S:2,  HLD:6,  IP:48.0,  H:30,  HR:0,  BB:22, HBP:4,  SO:41,  ER:12, R:17,  ERA:2.25, WHIP:1.08, FIP:3.45, WAR:1.33, BABIP:0.238, WPA:1.02,
            pitches:[{name:'슬라이더',pct:38,velo:135.8},{name:'포심',pct:36,velo:147.3},{name:'포크',pct:14,velo:136.4},{name:'커브',pct:12,velo:117.1}] },
        '조동욱':    { pos:'P', role:'중계', G:68, GS:2,  W:3,  L:3,  S:2,  HLD:5,  IP:60.0,  H:77,  HR:4,  BB:29, HBP:4,  SO:43,  ER:27, R:29,  ERA:4.05, WHIP:1.77, FIP:4.63, WAR:1.31, BABIP:0.363, WPA:0.08, salary:0.88,
            pitches:[{name:'포심',pct:47,velo:144.0},{name:'슬라이더',pct:39,velo:127.0},{name:'체인지업',pct:14,velo:128.6}] },
        '정우주':    { pos:'P', role:'중계', G:51, GS:2,  W:3,  L:0,  S:0,  HLD:3,  IP:53.2,  H:34,  HR:6,  BB:21, HBP:10, SO:82,  ER:17, R:18,  ERA:2.85, WHIP:1.02, FIP:3.28, WAR:1.23, BABIP:0.264, WPA:0.78, salary:0.7,
            pitches:[{name:'포심',pct:77,velo:151.2},{name:'슬라이더',pct:17,velo:134.2},{name:'커브',pct:5,velo:123.1},{name:'체인지업',pct:1,velo:132.1}] },
        '김종수':    { pos:'P', role:'중계', G:63, GS:0,  W:4,  L:5,  S:0,  HLD:5,  IP:63.2,  H:57,  HR:5,  BB:36, HBP:4,  SO:59,  ER:23, R:30,  ERA:3.25, WHIP:1.46, FIP:4.55, WAR:0.85, BABIP:0.299, WPA:-0.54, salary:1.17,
            pitches:[{name:'포심',pct:55,velo:145.6},{name:'슬라이더',pct:26,velo:134.1},{name:'커브',pct:16,velo:122.6},{name:'포크',pct:1,velo:135.1},{name:'체인지업',pct:1,velo:134.1}] },
        '박상원':    { pos:'P', role:'중계', G:74, GS:0,  W:4,  L:3,  S:0,  HLD:16, IP:66.2,  H:67,  HR:4,  BB:21, HBP:8,  SO:52,  ER:31, R:35,  ERA:4.19, WHIP:1.32, FIP:4.07, WAR:0.73, BABIP:0.307, WPA:0.06,
            pitches:[{name:'포심',pct:48,velo:147.2},{name:'포크',pct:27,velo:135.3},{name:'슬라이더',pct:25,velo:134.6}] },
        '윤산흠':    { pos:'P', role:'중계', G:12, GS:1,  W:0,  L:0,  S:0,  HLD:0,  IP:16.2,  H:16,  HR:1,  BB:5,  HBP:3,  SO:17,  ER:7,  R:7,   ERA:3.78, WHIP:1.26, FIP:3.62, WAR:0.36, BABIP:0.319, WPA:-0.39, salary:0.96,
            pitches:[{name:'포심',pct:53,velo:149.0},{name:'커브',pct:26,velo:127.9},{name:'슬라이더',pct:22,velo:136.4}] },
        '주현상':    { pos:'P', role:'중계', G:48, GS:0,  W:5,  L:2,  S:1,  HLD:3,  IP:41.2,  H:59,  HR:8,  BB:10, HBP:3,  SO:37,  ER:24, R:25,  ERA:5.18, WHIP:1.66, FIP:4.98, WAR:-0.12, BABIP:0.384, WPA:-1.11,
            pitches:[{name:'포심',pct:49,velo:145.2},{name:'슬라이더',pct:23,velo:134.5},{name:'체인지업',pct:18,velo:130.5},{name:'커브',pct:10,velo:123.5}] },
        '강재민':    { pos:'P', role:'중계', G:4,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:4.0,   H:6,   HR:1,  BB:2,  HBP:1,  SO:5,   ER:4,  R:4,   ERA:9.00, WHIP:2.00, FIP:6.17, WAR:-0.07, BABIP:0.455, WPA:-0.03, salary:1.45,
            pitches:[{name:'슬라이더',pct:49,velo:126.6},{name:'포심',pct:48,velo:143.6},{name:'체인지업',pct:2,velo:136.5}] },
        '박준영':    { pos:'P', role:'중계', G:1,  GS:1,  W:0,  L:0,  S:0,  HLD:0,  IP:5.0,   H:3,   HR:0,  BB:6,  HBP:0,  SO:3,   ER:2,  R:2,   ERA:3.60, WHIP:1.80, FIP:6.26, WAR:0.15, BABIP:0.200, WPA:0.05, salary:0.64,
            pitches:[{name:'포심',pct:59,velo:146.2},{name:'슬라이더',pct:34,velo:133.3},{name:'커브',pct:7,velo:122.3}] },
        // ── 극소표본 ──
        '김기중':    { pos:'P', role:'중계', G:5,  GS:2,  W:0,  L:1,  S:0,  HLD:0,  IP:14.2,  H:16,  HR:0,  BB:6,  HBP:1,  SO:8,   ER:5,  R:5,   ERA:3.07, WHIP:1.50, FIP:4.08, WAR:0.30, BABIP:0.314, WPA:-0.13,
            pitches:[{name:'포심',pct:44,velo:143.2},{name:'슬라이더',pct:24,velo:125.2},{name:'커브',pct:15,velo:116.9},{name:'포크',pct:9,velo:130.1},{name:'체인지업',pct:8,velo:130.1}] },
        '이태양':    { pos:'P', role:'중계', G:14, GS:0,  W:0,  L:1,  S:0,  HLD:0,  IP:11.1,  H:14,  HR:0,  BB:5,  HBP:1,  SO:8,   ER:5,  R:5,   ERA:3.97, WHIP:1.68, FIP:3.85, WAR:0.19, BABIP:0.389, WPA:-0.42,
            pitches:[{name:'포크',pct:40,velo:126.6},{name:'포심',pct:40,velo:142.1},{name:'슬라이더',pct:15,velo:131.8},{name:'커브',pct:5,velo:116.7}] },
        '권민규':    { pos:'P', role:'중계', G:5,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:5.1,   H:5,   HR:1,  BB:7,  HBP:0,  SO:4,   ER:5,  R:5,   ERA:8.44, WHIP:2.25, FIP:8.47, WAR:-0.03, BABIP:0.250, WPA:0.10,
            pitches:[{name:'포심',pct:61,velo:141.0},{name:'슬라이더',pct:37,velo:128.8},{name:'포크',pct:2,velo:125.5}] },
        '김승일':    { pos:'P', role:'중계', G:5,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:2.2,   H:3,   HR:1,  BB:3,  HBP:3,  SO:3,   ER:7,  R:7,   ERA:23.63, WHIP:2.25, FIP:12.77, WAR:-0.18, BABIP:0.286, WPA:-0.01,
            pitches:[{name:'포심',pct:72,velo:145.1},{name:'커브',pct:13,velo:127.1},{name:'체인지업',pct:15,velo:132.2}] },
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        '노시환': { pos:'3B', AVG:.260, OBP:.354, SLG:.497, OPS:.851, 'wRC+':129.7, WAR:4.88, oWAR:4.47, dWAR:0.41, H:140, '2B':28, '3B':2, HR:32, RBI:101, R:97, SB:14, CS:5, BB:70, SO:125, G:144, PA:624, AB:539, IsoP:.237, salary:10.0, defRAA:4.14, rangeRAA:1.97, errRAA:1.84, dpRAA:0.00 },
        '최재훈': { pos:'C', AVG:.286, OBP:.414, SLG:.353, OPS:.767, 'wRC+':129.7, WAR:3.23, oWAR:3.45, dWAR:-0.22, H:77, '2B':15, '3B':0, HR:1, RBI:35, R:28, SB:1, CS:1, BB:46, SO:48, G:121, PA:348, AB:269, IsoP:.067, salary:1.33, defRAA:-2.18, rangeRAA:0.54, errRAA:0.90, csRAA:-0.59, frmRAA:0.00 },
        '문현빈': { pos:'LF', AVG:.320, OBP:.370, SLG:.453, OPS:.823, 'wRC+':124.2, WAR:2.42, oWAR:3.10, dWAR:-0.69, H:169, '2B':30, '3B':2, HR:12, RBI:80, R:71, SB:17, CS:6, BB:38, SO:82, G:141, PA:592, AB:528, IsoP:.133, salary:2.3, defRAA:-4.97, rangeRAA:-4.03, errRAA:-0.37, armRAA:-0.58 },
        '하주석': { pos:'SS', AVG:.297, OBP:.337, SLG:.391, OPS:.728, 'wRC+':96.8, WAR:2.08, oWAR:1.38, dWAR:0.71, H:82, '2B':14, '3B':0, HR:4, RBI:28, R:34, SB:2, CS:1, BB:12, SO:66, G:95, PA:305, AB:276, IsoP:.094, salary:2.0, defRAA:5.84, rangeRAA:2.27, errRAA:1.48, dpRAA:2.08 },
        '이진영': { pos:'RF', AVG:.274, OBP:.350, SLG:.417, OPS:.767, 'wRC+':113.4, WAR:1.99, oWAR:1.42, dWAR:0.57, H:88, '2B':13, '3B':0, HR:11, RBI:43, R:49, SB:1, CS:4, BB:38, SO:93, G:115, PA:366, AB:321, IsoP:.143, salary:1.1, defRAA:2.78, rangeRAA:1.58, errRAA:0.63, armRAA:0.57 },
        '채은성': { pos:'1B', AVG:.288, OBP:.347, SLG:.467, OPS:.814, 'wRC+':118.4, WAR:1.37, oWAR:1.95, dWAR:-0.57, H:138, '2B':27, '3B':1, HR:19, RBI:88, R:54, SB:1, CS:2, BB:31, SO:96, G:132, PA:527, AB:480, IsoP:.179, salary:4.0, defRAA:-5.74, rangeRAA:-5.50, errRAA:-0.04 },
        '심우준': { pos:'SS', AVG:.231, OBP:.287, SLG:.300, OPS:.587, 'wRC+':58.0, WAR:0.80, oWAR:0.42, dWAR:0.38, H:57, '2B':9, '3B':1, HR:2, RBI:22, R:39, SB:11, CS:1, BB:17, SO:49, G:94, PA:275, AB:247, IsoP:.069, salary:4.0, defRAA:3.84, rangeRAA:2.33, errRAA:1.83, dpRAA:-0.33 },
        '이도윤': { pos:'2B', AVG:.260, OBP:.296, SLG:.340, OPS:.636, 'wRC+':66.5, WAR:0.53, oWAR:0.32, dWAR:0.21, H:65, '2B':11, '3B':3, HR:1, RBI:36, R:37, SB:1, CS:0, BB:11, SO:52, G:113, PA:277, AB:250, IsoP:.080, salary:1.21, defRAA:-0.02, rangeRAA:-1.34, errRAA:0.12, dpRAA:1.20 },
        '김태연': { pos:'RF', AVG:.261, OBP:.329, SLG:.340, OPS:.669, 'wRC+':85.6, WAR:0.49, oWAR:0.07, dWAR:0.43, H:79, '2B':15, '3B':0, HR:3, RBI:20, R:40, SB:5, CS:3, BB:23, SO:62, G:120, PA:340, AB:303, IsoP:.079, salary:4.0, defRAA:4.29, rangeRAA:3.57, errRAA:-0.15, armRAA:0.87 },
        '이원석': { pos:'CF', AVG:.203, OBP:.290, SLG:.292, OPS:.582, 'wRC+':62.4, WAR:0.58, oWAR:-0.08, dWAR:0.66, H:43, '2B':7, '3B':0, HR:4, RBI:24, R:60, SB:22, CS:3, BB:23, SO:51, G:129, PA:248, AB:212, IsoP:.089, defRAA:2.93, rangeRAA:2.63, errRAA:-0.05, armRAA:0.35 },
        '황영묵': { pos:'2B', AVG:.273, OBP:.329, SLG:.358, OPS:.687, 'wRC+':87.8, WAR:0.42, oWAR:0.86, dWAR:-0.44, H:71, '2B':17, '3B':1, HR:1, RBI:22, R:40, SB:1, CS:3, BB:20, SO:37, G:117, PA:286, AB:260, IsoP:.085, defRAA:-4.37, rangeRAA:-3.17, errRAA:-0.16, dpRAA:-1.04 },
        '최인호': { pos:'RF', AVG:.259, OBP:.342, SLG:.367, OPS:.709, 'wRC+':96.9, WAR:0.05, oWAR:0.15, dWAR:-0.10, H:36, '2B':9, '3B':0, HR:2, RBI:19, R:7, SB:1, CS:0, BB:13, SO:29, G:78, PA:159, AB:139, IsoP:.108, salary:0.64, defRAA:-0.49, rangeRAA:-0.38, errRAA:0.03, armRAA:-0.14 },
        '이재원': { pos:'C', AVG:.200, OBP:.280, SLG:.256, OPS:.536, 'wRC+':48.5, WAR:0.23, oWAR:-0.05, dWAR:0.27, H:25, '2B':2, '3B':1, HR:1, RBI:12, R:4, SB:1, CS:1, BB:14, SO:23, G:98, PA:151, AB:125, IsoP:.056, defRAA:2.71, rangeRAA:1.26, errRAA:-1.04, csRAA:-0.77, frmRAA:0.00 },
        // ── 준레귤러 / 벤치 (20–99 PA) ──
        // 리베라토: 시즌 중 영입 외국인 (2025 떠남)
        '리베라토': { pos:'DH', AVG:.313, OBP:.366, SLG:.524, OPS:.890, 'wRC+':143.1, WAR:2.00, oWAR:2.46, dWAR:-0.47, H:77, '2B':18, '3B':2, HR:10, RBI:39, R:41, SB:1, CS:0, BB:23, SO:47, G:62, PA:273, AB:246, IsoP:.211, defRAA:-4.67, rangeRAA:-4.02, errRAA:-0.73, armRAA:0.08 },
        // 플로리얼: 시즌 중 영입 외국인 (2025 떠남)
        '플로리얼': { pos:'CF', AVG:.271, OBP:.333, SLG:.450, OPS:.783, 'wRC+':111.5, WAR:1.78, oWAR:1.68, dWAR:0.10, H:70, '2B':18, '3B':2, HR:8, RBI:29, R:36, SB:13, CS:3, BB:24, SO:65, G:65, PA:285, AB:258, IsoP:.179, defRAA:0.71, rangeRAA:2.28, errRAA:-1.64, armRAA:0.08 },
        '손아섭': { pos:'LF', AVG:.265, OBP:.333, SLG:.356, OPS:.689, 'wRC+':91.0, WAR:-0.05, oWAR:0.00, dWAR:-0.05, H:35, '2B':9, '3B':0, HR:1, RBI:17, R:18, SB:0, CS:1, BB:13, SO:26, G:35, PA:149, AB:132, IsoP:.091, salary:1.0, defRAA:-0.54, rangeRAA:-1.25, errRAA:0.05, armRAA:0.66 },
        '안치홍': { pos:'3B', AVG:.172, OBP:.245, SLG:.230, OPS:.475, 'wRC+':22.5, WAR:-1.34, oWAR:-1.37, dWAR:0.03, H:30, '2B':4, '3B':0, HR:2, RBI:18, R:9, SB:3, CS:0, BB:16, SO:39, G:66, PA:196, AB:174, IsoP:.058, defRAA:-0.28, rangeRAA:-0.29, errRAA:0.24, dpRAA:-0.23 , salary:2 },
        '허인서': { pos:'C', AVG:.172, OBP:.200, SLG:.207, OPS:.407, 'wRC+':-6.1, WAR:-0.11, oWAR:-0.23, dWAR:0.12, H:5, '2B':1, '3B':0, HR:0, RBI:2, R:2, SB:0, CS:0, BB:0, SO:12, G:20, PA:30, AB:29, IsoP:.035, salary:0.5, defRAA:1.19, rangeRAA:0.40, errRAA:-0.27, csRAA:1.36, frmRAA:0.00 },
        '이상혁': { pos:'CF', AVG:.200, OBP:.273, SLG:.300, OPS:.573, 'wRC+':51.3, WAR:-0.30, oWAR:-0.10, dWAR:-0.20, H:2, '2B':1, '3B':0, HR:0, RBI:2, R:14, SB:3, CS:4, BB:0, SO:3, G:39, PA:12, AB:10, IsoP:.100 },
        '유로결': { pos:'RF', AVG:.154, OBP:.214, SLG:.154, OPS:.368, 'wRC+':-9.5, WAR:-0.37, oWAR:-0.14, dWAR:-0.23, H:2, '2B':0, '3B':0, HR:0, RBI:0, R:1, SB:1, CS:0, BB:0, SO:4, G:20, PA:16, AB:13, IsoP:.000 },
        '권광민': { pos:'RF', AVG:.167, OBP:.167, SLG:.222, OPS:.389, 'wRC+':-17.8, WAR:-0.28, oWAR:-0.23, dWAR:-0.05, H:3, '2B':1, '3B':0, HR:0, RBI:0, R:2, SB:0, CS:0, BB:0, SO:5, G:15, PA:18, AB:18, IsoP:.055 },
        // ── 소표본 ──
        '임종찬': { pos:'RF', AVG:.167, OBP:.286, SLG:.300, OPS:.586, 'wRC+':66.0, WAR:-0.14, oWAR:-0.12, dWAR:-0.02, H:5, '2B':1, '3B':0, HR:1, RBI:2, R:2, SB:2, CS:0, BB:5, SO:13, G:17, PA:35, AB:30, IsoP:.133, defRAA:-0.21, rangeRAA:-0.81, errRAA:-0.35, armRAA:0.95 },
        '김인환': { pos:'SS', AVG:.080, OBP:.115, SLG:.200, OPS:.315, 'wRC+':-39.4, WAR:-0.36, oWAR:-0.30, dWAR:-0.06, H:2, '2B':0, '3B':0, HR:1, RBI:3, R:2, SB:0, CS:0, BB:1, SO:9, G:10, PA:26, AB:25, IsoP:.120, defRAA:-0.60, rangeRAA:0.33, errRAA:-0.93 },
        // 페라자: KBO 2024 한화 122G AVG.275 OPS.850 24HR 70RBI 63도루 wRC+116.7. 스위치히터.
        // 파워+스피드+적극성. 컨택 기복+수비 불안+BQ 부족. 풀스윙 히터.
        '페라자': { pos:'RF', AVG:.275, OBP:.364, SLG:.486, OPS:.850, 'wRC+':116.7, WAR:2.13, oWAR:2.13, dWAR:0.00, H:125, '2B':24, '3B':0, HR:24, RBI:70, R:75, SB:63, CS:7, BB:0, SO:129, G:122, PA:522, AB:522, IsoP:.211, salary:9.8, _overrides:{eye:42} },
        // 강백호: 2025 KT → 한화 복귀
        '강백호': { pos:'1B', AVG:.265, OBP:.358, SLG:.467, OPS:.825, 'wRC+':125.9, WAR:1.68, oWAR:1.74, dWAR:-0.06, H:85, '2B':18, '3B':1, HR:15, RBI:61, R:41, SB:2, CS:4, BB:44, SO:64, G:95, PA:369, AB:321, IsoP:.202, salary:9.0, _minSpeed:38, defRAA:-0.22, rangeRAA:-0.24, errRAA:0.02 },
        // 오재원: 2026 신인 선수 — 수동 레이팅 설정
        '오재원': { pos:'CF', _ratings:{ contact:35, power:30, eye:30, speed:55, defense:50 } },
    },
    'SSG': {
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        // 김재환: 2025 두산 기록 (시즌 후 SSG 이적)
        '김재환': { pos:'LF', AVG:.241, OBP:.354, SLG:.404, OPS:.758, WAR:1.20, oWAR:1.00, dWAR:0.20, H:83, '2B':13, '3B':2, HR:13, RBI:50, R:42, SB:7, CS:2, BB:57, SO:96, G:103, PA:407, AB:344, IsoP:.163 , salary:5 },
        '박성한': { pos:'SS', AVG:.274, OBP:.384, SLG:.381, OPS:.765, 'wRC+':120.8, WAR:5.28, oWAR:4.74, dWAR:0.55, H:124, '2B':23, '3B':2, HR:7, RBI:48, R:73, SB:5, CS:6, BB:79, SO:93, G:127, PA:538, AB:452, IsoP:.107, _minSpeed:42, defRAA:5.50, rangeRAA:3.80, errRAA:0.80, dpRAA:0.90 , salary:4.2 },
        '에레디아': { pos:'LF', AVG:.339, OBP:.398, SLG:.491, OPS:.889, 'wRC+':141.0, WAR:3.54, oWAR:2.95, dWAR:0.59, H:127, '2B':18, '3B':0, HR:13, RBI:54, R:46, SB:1, CS:2, BB:31, SO:62, G:96, PA:415, AB:375, IsoP:.152, defRAA:5.90, rangeRAA:4.20, errRAA:0.80, armRAA:0.90 , salary:11.2 },
        '최지훈': { pos:'CF', AVG:.284, OBP:.342, SLG:.371, OPS:.713, 'wRC+':93.8, WAR:2.30, oWAR:2.25, dWAR:0.05, H:147, '2B':16, '3B':4, HR:7, RBI:45, R:66, SB:28, CS:7, BB:43, SO:87, G:140, PA:574, AB:517, IsoP:.087, defRAA:0.50, rangeRAA:0.30, errRAA:0.10, armRAA:0.10 , salary:3.7 },
        '정준재': { pos:'2B', AVG:.245, OBP:.340, SLG:.288, OPS:.628, 'wRC+':81.7, WAR:1.84, oWAR:1.67, dWAR:0.17, H:91, '2B':10, '3B':3, HR:0, RBI:25, R:58, SB:37, CS:8, BB:51, SO:93, G:132, PA:442, AB:371, IsoP:.043, defRAA:1.70, rangeRAA:1.20, errRAA:0.20, dpRAA:0.30 , salary:1.3 },
        '한유섬': { pos:'RF', AVG:.273, OBP:.347, SLG:.424, OPS:.771, 'wRC+':108.4, WAR:1.82, oWAR:1.90, dWAR:-0.08, H:124, '2B':24, '3B':0, HR:15, RBI:71, R:50, SB:1, CS:0, BB:46, SO:120, G:128, PA:511, AB:455, IsoP:.151, defRAA:-0.80, rangeRAA:-0.40, errRAA:-0.20, armRAA:-0.20 , salary:9 },
        '최정': { pos:'3B', AVG:.244, OBP:.360, SLG:.482, OPS:.842, 'wRC+':126.5, WAR:1.41, oWAR:1.91, dWAR:-0.50, H:83, '2B':12, '3B':0, HR:23, RBI:63, R:54, SB:1, CS:0, BB:51, SO:94, G:95, PA:406, AB:340, IsoP:.238 , salary:22 },
        '고명준': { pos:'1B', AVG:.278, OBP:.306, SLG:.433, OPS:.739, 'wRC+':90.8, WAR:0.79, oWAR:0.07, dWAR:0.72, H:131, '2B':20, '3B':1, HR:17, RBI:64, R:46, SB:2, CS:0, BB:20, SO:99, G:130, PA:500, AB:471, IsoP:.155, defRAA:7.20, rangeRAA:5.00, errRAA:1.20, dpRAA:1.00 , salary:1.6 },
        '조형우': { pos:'C', AVG:.238, OBP:.294, SLG:.312, OPS:.606, 'wRC+':61.5, WAR:0.59, oWAR:0.44, dWAR:0.14, H:64, '2B':8, '3B':0, HR:4, RBI:29, R:23, SB:0, CS:0, BB:19, SO:64, G:102, PA:294, AB:269, IsoP:.074, defRAA:1.40, rangeRAA:0.30, errRAA:0.00, csRAA:0.50, frmRAA:0.60 , salary:1.3 },
        '안상현': { pos:'3B', AVG:.264, OBP:.314, SLG:.380, OPS:.694, 'wRC+':85.0, WAR:0.45, oWAR:0.71, dWAR:-0.27, H:68, '2B':8, '3B':2, HR:6, RBI:15, R:38, SB:17, CS:6, BB:18, SO:85, G:102, PA:289, AB:258, IsoP:.116, defRAA:-2.70, rangeRAA:-1.80, errRAA:-0.50, dpRAA:-0.40 , salary:0.7 },
        '이지영': { pos:'C', AVG:.239, OBP:.283, SLG:.325, OPS:.608, 'wRC+':58.6, WAR:-0.06, oWAR:0.07, dWAR:-0.13, H:47, '2B':6, '3B':1, HR:3, RBI:18, R:13, SB:2, CS:1, BB:11, SO:22, G:76, PA:216, AB:197, IsoP:.086, defRAA:-1.30, rangeRAA:-0.30, errRAA:-0.50, csRAA:-0.20, frmRAA:-0.30 , salary:2 },
        '최준우': { pos:'LF', AVG:.191, OBP:.328, SLG:.250, OPS:.578, 'wRC+':73.3, WAR:-0.29, oWAR:-0.12, dWAR:-0.17, H:29, '2B':0, '3B':0, HR:3, RBI:22, R:17, SB:2, CS:0, BB:30, SO:47, G:78, PA:192, AB:152, IsoP:.059, defRAA:-1.70, rangeRAA:-1.10, errRAA:-0.30, armRAA:-0.30 , salary:0.7 },
        '오태곤': { pos:'1B', AVG:.201, OBP:.310, SLG:.309, OPS:.619, 'wRC+':74.8, WAR:-0.36, oWAR:-0.26, dWAR:-0.10, H:39, '2B':6, '3B':0, HR:5, RBI:26, R:31, SB:25, CS:8, BB:30, SO:59, G:122, PA:229, AB:194, IsoP:.108, defRAA:-1.00, rangeRAA:-0.60, errRAA:-0.20, dpRAA:-0.20 , salary:5 },
        '김성현': { pos:'3B', AVG:.217, OBP:.316, SLG:.270, OPS:.586, 'wRC+':66.2, WAR:-0.05, oWAR:0.09, dWAR:-0.15, H:25, '2B':3, '3B':0, HR:1, RBI:11, R:15, SB:1, CS:1, BB:16, SO:20, G:59, PA:137, AB:115, IsoP:.053, defRAA:-1.50, rangeRAA:-1.00, errRAA:-0.30, dpRAA:-0.20 , salary:2.5 },
        '김성욱': { pos:'RF', AVG:.209, OBP:.263, SLG:.318, OPS:.581, 'wRC+':51.9, WAR:-0.26, oWAR:-0.32, dWAR:0.07, H:23, '2B':6, '3B':0, HR:2, RBI:13, R:10, SB:1, CS:1, BB:7, SO:29, G:47, PA:119, AB:110, IsoP:.109, defRAA:0.70, rangeRAA:0.40, errRAA:0.15, armRAA:0.15 , salary:1 },
        // ── 준레귤러 / 벤치 (20–99 PA) ──
        '류효승': { pos:'DH', AVG:.287, OBP:.350, SLG:.532, OPS:.882, 'wRC+':132.6, WAR:0.37, oWAR:0.43, dWAR:-0.06, H:27, '2B':5, '3B':0, HR:6, RBI:16, R:18, SB:0, CS:1, BB:7, SO:28, G:27, PA:103, AB:94, IsoP:.245 },
        '맥브룸': { pos:'RF', AVG:.203, OBP:.263, SLG:.405, OPS:.668, 'wRC+':62.8, WAR:-0.17, oWAR:-0.26, dWAR:0.10, H:15, '2B':3, '3B':0, HR:4, RBI:11, R:8, SB:0, CS:0, BB:5, SO:28, G:22, PA:80, AB:74, IsoP:.202, defRAA:1.00, rangeRAA:0.60, errRAA:0.20, armRAA:0.20 },
        '김찬형': { pos:'3B', AVG:.178, OBP:.221, SLG:.205, OPS:.426, 'wRC+':5.5, WAR:-0.39, oWAR:-0.56, dWAR:0.17, H:13, '2B':2, '3B':0, HR:0, RBI:5, R:4, SB:0, CS:0, BB:3, SO:13, G:44, PA:78, AB:73, IsoP:.027, defRAA:1.70, rangeRAA:1.20, errRAA:0.30, dpRAA:0.20 },
        '박지환': { pos:'3B', AVG:.150, OBP:.200, SLG:.150, OPS:.350, 'wRC+':-14.2, WAR:-0.95, oWAR:-0.64, dWAR:-0.31, H:9, '2B':0, '3B':0, HR:0, RBI:4, R:3, SB:0, CS:1, BB:4, SO:19, G:31, PA:68, AB:60, IsoP:.000, defRAA:-3.10, rangeRAA:-2.00, errRAA:-0.60, dpRAA:-0.50 },
        '하재훈': { pos:'RF', AVG:.143, OBP:.197, SLG:.304, OPS:.501, 'wRC+':21.9, WAR:-0.48, oWAR:-0.44, dWAR:-0.03, H:8, '2B':0, '3B':0, HR:3, RBI:8, R:6, SB:1, CS:2, BB:4, SO:21, G:18, PA:61, AB:56, IsoP:.161, defRAA:-0.30, rangeRAA:-0.15, errRAA:-0.10, armRAA:-0.05 },
        '현원회': { pos:'DH', AVG:.305, OBP:.339, SLG:.373, OPS:.712, 'wRC+':89.2, WAR:0.17, oWAR:-0.04, dWAR:0.21, H:18, '2B':1, '3B':0, HR:1, RBI:6, R:6, SB:0, CS:0, BB:3, SO:16, G:21, PA:62, AB:59, IsoP:.068 },
        '석정우': { pos:'3B', AVG:.265, OBP:.333, SLG:.408, OPS:.741, 'wRC+':100.0, WAR:-0.18, oWAR:0.29, dWAR:-0.47, H:13, '2B':1, '3B':0, HR:2, RBI:4, R:3, SB:0, CS:0, BB:4, SO:18, G:27, PA:54, AB:49, IsoP:.143, defRAA:-4.70, rangeRAA:-3.00, errRAA:-0.90, dpRAA:-0.80 },
        '채현우': { pos:'LF', AVG:.188, OBP:.231, SLG:.313, OPS:.544, 'wRC+':37.4, WAR:0.11, oWAR:-0.14, dWAR:0.25, H:9, '2B':1, '3B':1, HR:1, RBI:9, R:8, SB:2, CS:0, BB:3, SO:13, G:41, PA:52, AB:48, IsoP:.125, defRAA:2.50, rangeRAA:1.80, errRAA:0.40, armRAA:0.30 },
        '신범수': { pos:'C', AVG:.182, OBP:.308, SLG:.303, OPS:.611, 'wRC+':74.9, WAR:0.11, oWAR:0.05, dWAR:0.06, H:6, '2B':1, '3B':0, HR:1, RBI:3, R:1, SB:0, CS:0, BB:5, SO:7, G:29, PA:39, AB:33, IsoP:.121, defRAA:0.60, rangeRAA:0.10, errRAA:0.00, csRAA:0.20, frmRAA:0.30 },
        '최상민': { pos:'RF', AVG:.143, OBP:.333, SLG:.143, OPS:.476, 'wRC+':57.5, WAR:-0.14, oWAR:-0.02, dWAR:-0.12, H:1, '2B':0, '3B':0, HR:0, RBI:1, R:5, SB:1, CS:1, BB:1, SO:5, G:23, PA:9, AB:7, IsoP:.000 },
        // ── 소표본 (10–19 PA) ──
        '이율예': { pos:'C', AVG:.231, OBP:.231, SLG:.923, OPS:1.154, 'wRC+':185.0, WAR:0.08, oWAR:0.13, dWAR:-0.05, H:3, '2B':0, '3B':0, HR:3, RBI:7, R:3, SB:0, CS:0, BB:0, SO:6, G:8, PA:13, AB:13, IsoP:.692 },
        '김수윤': { pos:'3B', AVG:.091, OBP:.167, SLG:.091, OPS:.258, 'wRC+':-43.2, WAR:-0.16, oWAR:-0.16, dWAR:-0.01, H:1, '2B':0, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:4, G:7, PA:12, AB:11, IsoP:.000 },
        '홍대인': { pos:'2B', AVG:.200, OBP:.200, SLG:.200, OPS:.400, 'wRC+':-11.7, WAR:-0.24, oWAR:-0.08, dWAR:-0.16, H:1, '2B':0, '3B':0, HR:0, RBI:0, R:3, SB:1, CS:1, BB:0, SO:2, G:14, PA:5, AB:5, IsoP:.000, _ratings:{contact:30, power:25, eye:28, speed:50, defense:42} , salary:0.3 },
        // ── 극소표본 (< 10 PA) ──
        '김태윤': { pos:'3B', AVG:.500, OBP:.750, SLG:.500, OPS:1.250, 'wRC+':352.0, WAR:0.11, oWAR:0.08, dWAR:0.03, H:1, '2B':0, '3B':0, HR:0, RBI:0, R:0, SB:1, CS:1, BB:2, SO:0, G:8, PA:4, AB:2, IsoP:.000 },
        '정현승': { pos:'RF', AVG:.500, OBP:.500, SLG:1.000, OPS:1.500, 'wRC+':376.0, WAR:0.01, oWAR:0.08, dWAR:-0.06, H:1, '2B':1, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:0, G:3, PA:2, AB:2, IsoP:.500 },
        '임근우': { pos:'RF', AVG:.000, OBP:.000, SLG:.000, OPS:.000, 'wRC+':-139.0, WAR:-0.03, oWAR:-0.13, dWAR:0.10, H:0, '2B':0, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:1, G:3, PA:5, AB:5, IsoP:.000 },
        '이승민': { pos:'DH', AVG:.200, OBP:.200, SLG:.200, OPS:.400, 'wRC+':-11.4, WAR:-0.06, oWAR:-0.06, dWAR:0.00, H:1, '2B':0, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:2, G:2, PA:5, AB:5, IsoP:.000 , salary:1.1 },
        '이정범': { pos:'1B', AVG:.000, OBP:.000, SLG:.000, OPS:.000, 'wRC+':-133.5, WAR:-0.07, oWAR:-0.07, dWAR:0.00, H:0, '2B':0, '3B':0, HR:0, RBI:0, R:0, SB:0, CS:0, BB:0, SO:2, G:3, PA:3, AB:3, IsoP:.000 },
        '김창평': { pos:'RF', WAR:0.01, oWAR:0.00, dWAR:0.01, G:4, PA:0, AB:0, R:1 },
        '김강민': { pos:'CF' },
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // 앤더슨: MLB 진출로 제외
        // ── 선발 ──
        '화이트':   { pos:'P', role:'선발', G:24, GS:24, W:11, L:4,  S:0,  HLD:0,  IP:134.2, H:111, HR:9,  BB:44, HBP:8,  SO:137, ER:43, R:51,  ERA:2.87, WHIP:1.15, FIP:3.38, WAR:4.24,
            pitches:[{name:'포심',pct:50,velo:151.8},{name:'커브',pct:20,velo:127},{name:'커터',pct:18,velo:143.6},{name:'슬라이더',pct:6,velo:135.2},{name:'투심',pct:5,velo:149.3}] },
        '김광현':   { pos:'P', role:'선발', G:28, GS:28, W:10, L:10, S:0,  HLD:0,  IP:144.0, H:164, HR:13, BB:50, HBP:4,  SO:138, ER:80, R:86,  ERA:5.00, WHIP:1.49, FIP:3.77, WAR:1.62,
            pitches:[{name:'슬라이더',pct:40,velo:134.9},{name:'포심',pct:30,velo:144.2},{name:'커브',pct:16,velo:114.4},{name:'포크',pct:13,velo:130}] },
        '문승원':   { pos:'P', role:'선발', G:23, GS:21, W:4,  L:7,  S:0,  HLD:0,  IP:105.1, H:109, HR:16, BB:38, HBP:5,  SO:61,  ER:60, R:61,  ERA:5.13, WHIP:1.40, FIP:5.58, WAR:1.51,
            pitches:[{name:'포심',pct:47,velo:145.1},{name:'슬라이더',pct:22,velo:135.1},{name:'커브',pct:15,velo:114.4},{name:'체인지업',pct:10,velo:127.1},{name:'포크',pct:3,velo:127.1}] },
        '송영진':   { pos:'P', role:'선발', G:21, GS:8,  W:2,  L:5,  S:0,  HLD:0,  IP:63.1,  H:77,  HR:10, BB:31, HBP:3,  SO:40,  ER:41, R:45,  ERA:5.83, WHIP:1.71, FIP:5.89, WAR:0.17,
            pitches:[{name:'포심',pct:52,velo:143.5},{name:'커브',pct:22,velo:116.2},{name:'슬라이더',pct:22,velo:134.3},{name:'포크',pct:4,velo:132.2}] },
        '박종훈':   { pos:'P', role:'선발', G:5,  GS:5,  W:0,  L:2,  S:0,  HLD:0,  IP:19.0,  H:15,  HR:4,  BB:18, HBP:5,  SO:10,  ER:15, R:17,  ERA:7.11, WHIP:1.74, FIP:8.98, WAR:-0.06,
            pitches:[{name:'투심',pct:53,velo:133},{name:'커브',pct:30,velo:120},{name:'포심',pct:12,velo:132.8},{name:'체인지업',pct:5,velo:123.2}] },
        // 타케다: NPB 통산 기록 (OVR 산출용, 2025 누적 X)
        // 하이리스크 하이리턴 우완 정통파. 평균 145km/h(최고 154) 패스트볼 + 커브(결정구) + 슬라이더 주력. 토미존 이후 변화구 위주 피네스 전환.
        '타케다':   { pos:'P', role:'선발', G:154, GS:154, W:66, L:48, S:2,  HLD:11, IP:1006.0, H:899, HR:75, BB:427, HBP:34, SO:858, ER:373, R:413, ERA:3.34, WHIP:1.32, FIP:3.50, WAR:0.00,
            pitches:[{name:'커브',pct:28,velo:125},{name:'슬라이더',pct:25,velo:135},{name:'패스트볼',pct:25,velo:145},{name:'포크볼',pct:12,velo:135},{name:'체인지업',pct:10,velo:130}] },
        // 베니지아노: MLB 통산 기록 (OVR 산출용, 2025 누적 X)
        // 좌완 파이어볼러. 평균 150km/h(최고 157.2) 포심 + 스위퍼(좌타 결정구) + 슬라이더(우타 결정구). 체인지업 구속 빨라 직구와 조화 부족.
        '베니지아노': { pos:'P', role:'선발', G:40, GS:0, W:1, L:0, S:0, HLD:5, IP:40.2, H:46, HR:5, BB:16, HBP:3, SO:40, ER:18, R:20, ERA:3.98, WHIP:1.525, FIP:4.50, WAR:0.20,
            pitches:[{name:'포심',pct:30,velo:150},{name:'스위퍼',pct:27,velo:135},{name:'슬라이더',pct:24,velo:138},{name:'싱커',pct:12,velo:148},{name:'체인지업',pct:7,velo:140}] },
        // ── 마무리 ──
        '조병현':   { pos:'P', role:'마무리', G:69, GS:0,  W:5,  L:4,  S:30, HLD:0,  IP:67.1,  H:42,  HR:5,  BB:18, HBP:0,  SO:79,  ER:12, R:13,  ERA:1.60, WHIP:0.89, FIP:2.63, WAR:3.37,
            pitches:[{name:'포심',pct:73,velo:147.5},{name:'포크',pct:21,velo:132.8},{name:'커브',pct:5,velo:124.8}] },
        // ── 중계 ──
        '노경은':   { pos:'P', role:'중계', G:77, GS:0,  W:3,  L:6,  S:3,  HLD:35, IP:80.0,  H:60,  HR:2,  BB:25, HBP:3,  SO:68,  ER:19, R:22,  ERA:2.14, WHIP:1.06, FIP:3.05, WAR:3.13,
            pitches:[{name:'포심',pct:33,velo:146.2},{name:'포크',pct:27,velo:134.8},{name:'슬라이더',pct:20,velo:137.6},{name:'투심',pct:9,velo:144.8},{name:'커브',pct:9,velo:114.9}] },
        '이로운':   { pos:'P', role:'중계', G:75, GS:0,  W:6,  L:5,  S:1,  HLD:33, IP:77.0,  H:56,  HR:7,  BB:26, HBP:0,  SO:66,  ER:17, R:19,  ERA:1.99, WHIP:1.06, FIP:3.77, WAR:2.85,
            pitches:[{name:'포심',pct:46,velo:147.7},{name:'체인지업',pct:25,velo:126.1},{name:'슬라이더',pct:20,velo:136.6},{name:'커브',pct:8,velo:124.3}] },
        '김민':     { pos:'P', role:'중계', G:70, GS:0,  W:5,  L:2,  S:1,  HLD:22, IP:63.2,  H:60,  HR:7,  BB:17, HBP:6,  SO:65,  ER:21, R:23,  ERA:2.97, WHIP:1.21, FIP:3.83, WAR:1.99,
            pitches:[{name:'투심',pct:55,velo:147.2},{name:'슬라이더',pct:41,velo:134},{name:'체인지업',pct:2,velo:138}] },
        '김건우':   { pos:'P', role:'선발', G:35, GS:13, W:5,  L:4,  S:0,  HLD:2,  IP:66.0,  H:53,  HR:2,  BB:49, HBP:7,  SO:68,  ER:28, R:31,  ERA:3.82, WHIP:1.55, FIP:4.37, WAR:1.35, _overrides:{command:35, salary:0.7 },
            pitches:[{name:'포심',pct:64,velo:145.8},{name:'체인지업',pct:18,velo:130.9},{name:'슬라이더',pct:14,velo:134.4},{name:'커브',pct:4,velo:122.4}] },
        '최민준':   { pos:'P', role:'중계', G:40, GS:8,  W:2,  L:2,  S:0,  HLD:1,  IP:65.2,  H:72,  HR:6,  BB:24, HBP:3,  SO:44,  ER:29, R:34,  ERA:3.97, WHIP:1.46, FIP:4.65, WAR:0.99,
            pitches:[{name:'포심',pct:43,velo:143},{name:'커브',pct:22,velo:122.5},{name:'슬라이더',pct:16,velo:134.3},{name:'포크',pct:11,velo:134.8},{name:'커터',pct:6,velo:139}] },
        '전영준':   { pos:'P', role:'중계', G:34, GS:5,  W:1,  L:5,  S:0,  HLD:0,  IP:52.2,  H:48,  HR:5,  BB:26, HBP:5,  SO:55,  ER:27, R:28,  ERA:4.61, WHIP:1.41, FIP:4.26, WAR:0.75,
            pitches:[{name:'포심',pct:65,velo:143.8},{name:'슬라이더',pct:15,velo:129.3},{name:'포크',pct:12,velo:128.4},{name:'커브',pct:7,velo:115.5}] },
        '김택형':   { pos:'P', role:'중계', G:25, GS:0,  W:0,  L:0,  S:0,  HLD:1,  IP:22.2,  H:19,  HR:0,  BB:10, HBP:3,  SO:14,  ER:7,  R:7,   ERA:2.78, WHIP:1.28, FIP:4.21, WAR:0.56,
            pitches:[{name:'포심',pct:46,velo:141.6},{name:'슬라이더',pct:36,velo:128.6},{name:'포크',pct:12,velo:129.5},{name:'투심',pct:7,velo:141}] },
        '박시후':   { pos:'P', role:'중계', G:52, GS:1,  W:6,  L:2,  S:0,  HLD:3,  IP:52.1,  H:45,  HR:5,  BB:29, HBP:5,  SO:34,  ER:19, R:24,  ERA:3.27, WHIP:1.41, FIP:5.45, WAR:0.38,
            pitches:[{name:'투심',pct:47,velo:143},{name:'슬라이더',pct:46,velo:131.3},{name:'커브',pct:4,velo:119.6},{name:'체인지업',pct:2,velo:133.1}] },
        '한두솔':   { pos:'P', role:'중계', G:44, GS:0,  W:2,  L:0,  S:1,  HLD:3,  IP:36.1,  H:46,  HR:1,  BB:19, HBP:1,  SO:27,  ER:20, R:22,  ERA:4.95, WHIP:1.79, FIP:4.06, WAR:0.36,
            pitches:[{name:'슬라이더',pct:50,velo:131.3},{name:'포심',pct:47,velo:144.9}] },
        '박기호':   { pos:'P', role:'중계', G:18, GS:1,  W:0,  L:0,  S:0,  HLD:2,  IP:24.0,  H:23,  HR:3,  BB:12, HBP:8,  SO:13,  ER:8,  R:10,  ERA:3.00, WHIP:1.46, FIP:6.59, WAR:0.32,
            pitches:[{name:'포심',pct:56,velo:138.9},{name:'체인지업',pct:27,velo:123.3},{name:'커브',pct:15,velo:120}] },
        '최현석':   { pos:'P', role:'중계', G:13, GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:17.1,  H:21,  HR:5,  BB:6,  HBP:2,  SO:11,  ER:12, R:13,  ERA:6.23, WHIP:1.56, FIP:7.24, WAR:0.02,
            pitches:[{name:'포심',pct:48,velo:144.6},{name:'슬라이더',pct:32,velo:132.6},{name:'커브',pct:16,velo:117.4},{name:'포크',pct:2,velo:131.9}] },
        '서진용':   { pos:'P', role:'중계', G:2,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:1.1,   H:1,   HR:0,  BB:3,  HBP:0,  SO:0,   ER:1,  R:1,   ERA:6.75, WHIP:3.00, FIP:11.12, WAR:-0.02,
            pitches:[{name:'포심',pct:52,velo:138.7},{name:'포크',pct:48,velo:124.5}] },
        '정동윤':   { pos:'P', role:'중계', G:12, GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:17.1,  H:21,  HR:2,  BB:12, HBP:0,  SO:17,  ER:16, R:16,  ERA:8.31, WHIP:1.90, FIP:5.06, WAR:-0.26,
            pitches:[{name:'투심',pct:49,velo:143.6},{name:'커브',pct:26,velo:121.1},{name:'포크',pct:9,velo:134.6},{name:'슬라이더',pct:9,velo:131.5},{name:'포심',pct:6,velo:143.9}] },
        // ── 극소표본 / 1군 기록 없음 ──
        '신지환':   { pos:'P', role:'중계', G:1, GS:0, W:0, L:0, S:0, HLD:0, IP:1.0, H:0, HR:0, BB:0, HBP:1, SO:1, ER:0, R:0, ERA:0.00, WHIP:0.00, FIP:4.62, WAR:0.04,
            pitches:[{name:'포심',pct:83,velo:140.8},{name:'슬라이더',pct:17,velo:125.7}] },
        '김성민':   { pos:'P', role:'중계', G:2, GS:0, W:1, L:0, S:0, HLD:0, IP:0.2, H:0, HR:0, BB:2, HBP:0, SO:0, ER:0, R:0, ERA:0.00, WHIP:3.00, FIP:13.52, WAR:0.02,
            pitches:[{name:'포심',pct:96,velo:149.5},{name:'슬라이더',pct:4,velo:128}] },
        '이기순':   { pos:'P', role:'중계' },
        '백승건':   { pos:'P', role:'중계', _overrides:{stuff:45, stamina:45} , salary:0.3 },
    },
    '롯데': {
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        '레이예스': { pos:'LF', AVG:.326, OBP:.386, SLG:.475, OPS:.861, 'wRC+':124.8, WAR:3.21, oWAR:3.63, dWAR:-0.42, H:187, '2B':44, '3B':1, HR:13, RBI:107, R:75, SB:7, CS:1, BB:58, SO:66, G:144, PA:643, AB:573, IsoP:.149, defRAA:-4.20, rangeRAA:-2.80, errRAA:-0.60, armRAA:-0.80 , salary:11.2 },
        '윤동희': { pos:'CF', AVG:.282, OBP:.386, SLG:.433, OPS:.819, 'wRC+':128.9, WAR:3.14, oWAR:2.57, dWAR:0.56, H:93, '2B':21, '3B':1, HR:9, RBI:53, R:54, SB:4, CS:2, BB:49, SO:65, G:97, PA:399, AB:330, IsoP:.151, defRAA:5.55, rangeRAA:6.85, errRAA:-0.36, armRAA:-0.94 , salary:1.8 },
        '유강남': { pos:'C', AVG:.274, OBP:.352, SLG:.383, OPS:.735, 'wRC+':101.4, WAR:2.09, oWAR:1.90, dWAR:0.18, H:83, '2B':18, '3B':0, HR:5, RBI:38, R:35, SB:0, CS:0, BB:26, SO:66, G:110, PA:350, AB:303, IsoP:.109, defRAA:1.83, rangeRAA:0.71, errRAA:1.29, csRAA:-1.25, frmRAA:1.83 , salary:7 },
        '고승민': { pos:'SS', AVG:.271, OBP:.350, SLG:.350, OPS:.700, 'wRC+':94.3, WAR:2.05, oWAR:1.66, dWAR:0.39, H:127, '2B':21, '3B':2, HR:4, RBI:45, R:71, SB:5, CS:1, BB:56, SO:83, G:121, PA:538, AB:469, IsoP:.079, defRAA:3.83, rangeRAA:2.12, errRAA:0.95, dpRAA:0.68 },
        '전준우': { pos:'RF', AVG:.293, OBP:.369, SLG:.420, OPS:.789, 'wRC+':115.1, WAR:1.39, oWAR:1.84, dWAR:-0.45, H:120, '2B':26, '3B':1, HR:8, RBI:70, R:50, SB:2, CS:1, BB:44, SO:71, G:114, PA:472, AB:410, IsoP:.127, defRAA:-4.50, rangeRAA:-3.20, errRAA:-0.50, armRAA:-0.80 , salary:7 },
        '한태양': { pos:'3B', AVG:.274, OBP:.367, SLG:.378, OPS:.745, 'wRC+':113.3, WAR:1.52, oWAR:1.68, dWAR:-0.15, H:63, '2B':14, '3B':2, HR:2, RBI:22, R:42, SB:3, CS:2, BB:32, SO:69, G:108, PA:267, AB:230, IsoP:.104, defRAA:0.26, rangeRAA:0.89, errRAA:-0.53, dpRAA:-0.09 , salary:0.7 },
        '전민재': { pos:'2B', AVG:.287, OBP:.337, SLG:.378, OPS:.715, 'wRC+':90.6, WAR:1.13, oWAR:1.75, dWAR:-0.62, H:95, '2B':15, '3B':0, HR:5, RBI:34, R:39, SB:3, CS:3, BB:22, SO:63, G:101, PA:369, AB:331, IsoP:.091, defRAA:-3.95, rangeRAA:-3.40, errRAA:-0.47, dpRAA:-0.07 , salary:1.1 },
        '장두성': { pos:'CF', AVG:.262, OBP:.332, SLG:.298, OPS:.630, 'wRC+':75.0, WAR:0.71, oWAR:0.20, dWAR:0.51, H:65, '2B':3, '3B':3, HR:0, RBI:25, R:51, SB:17, CS:5, BB:24, SO:64, G:118, PA:284, AB:248, IsoP:.036, defRAA:3.12, rangeRAA:3.23, errRAA:-0.25, armRAA:0.14 , salary:0.8 },
        '이호준': { pos:'1B', AVG:.242, OBP:.327, SLG:.424, OPS:.751, 'wRC+':105.1, WAR:0.80, oWAR:1.01, dWAR:-0.21, H:32, '2B':7, '3B':4, HR:3, RBI:23, R:20, SB:1, CS:0, BB:14, SO:33, G:99, PA:153, AB:132, IsoP:.182, defRAA:-1.23, rangeRAA:-2.01, errRAA:-1.35, dpRAA:2.13 , salary:0.6 },
        '손호영': { pos:'LF', AVG:.250, OBP:.313, SLG:.323, OPS:.636, 'wRC+':71.3, WAR:0.20, oWAR:0.24, dWAR:-0.04, H:82, '2B':12, '3B':0, HR:4, RBI:41, R:39, SB:7, CS:0, BB:22, SO:66, G:97, PA:375, AB:328, IsoP:.073, defRAA:-1.32, rangeRAA:-2.87, errRAA:1.10, dpRAA:0.39 , salary:0.9 },
        '김민성': { pos:'3B', AVG:.243, OBP:.353, SLG:.346, OPS:.699, 'wRC+':96.0, WAR:0.15, oWAR:0.75, dWAR:-0.59, H:52, '2B':13, '3B':0, HR:3, RBI:35, R:25, SB:0, CS:1, BB:33, SO:48, G:96, PA:254, AB:214, IsoP:.103, defRAA:0.53, rangeRAA:0.70, errRAA:0.24, dpRAA:-0.41 , salary:1.5 },
        '황성빈': { pos:'CF', AVG:.256, OBP:.315, SLG:.317, OPS:.632, 'wRC+':72.2, WAR:0.14, oWAR:0.41, dWAR:-0.27, H:63, '2B':4, '3B':4, HR:1, RBI:22, R:43, SB:25, CS:4, BB:18, SO:46, G:79, PA:273, AB:246, IsoP:.061, defRAA:-2.70, rangeRAA:-1.80, errRAA:-0.50, armRAA:-0.40 , salary:1.1 },
        '김동혁': { pos:'SS', AVG:.225, OBP:.373, SLG:.292, OPS:.665, 'wRC+':100.7, WAR:0.83, oWAR:0.32, dWAR:0.50, H:20, '2B':4, '3B':1, HR:0, RBI:6, R:19, SB:13, CS:4, BB:18, SO:26, G:93, PA:114, AB:89, IsoP:.067, defRAA:5.05, rangeRAA:4.12, errRAA:0.47, armRAA:0.46 , salary:0.5 },
        '정보근': { pos:'C', AVG:.186, OBP:.291, SLG:.256, OPS:.547, 'wRC+':52.8, WAR:0.02, oWAR:0.02, dWAR:0.00, H:24, '2B':4, '3B':1, HR:1, RBI:15, R:4, SB:0, CS:0, BB:18, SO:39, G:93, PA:152, AB:129, IsoP:.070, defRAA:0.00, rangeRAA:-0.69, errRAA:0.92, csRAA:-0.31, frmRAA:0.00 , salary:0.7 },
        // ── 준레귤러 / 벤치 (20–99 PA) ──
        '박찬형': { pos:'DH', AVG:.341, OBP:.419, SLG:.504, OPS:.923, 'wRC+':152.1, WAR:1.19, oWAR:1.42, dWAR:-0.23, H:44, '2B':8, '3B':2, HR:3, RBI:19, R:21, SB:1, CS:1, BB:11, SO:26, G:48, PA:148, AB:129, IsoP:.163 },
        '정훈': { pos:'DH', AVG:.216, OBP:.268, SLG:.308, OPS:.576, 'wRC+':47.0, WAR:-0.65, oWAR:-0.97, dWAR:0.31, H:40, '2B':11, '3B':0, HR:2, RBI:11, R:14, SB:0, CS:0, BB:10, SO:40, G:77, PA:200, AB:185, IsoP:.092 },
        '나승엽': { pos:'1B', AVG:.229, OBP:.347, SLG:.360, OPS:.707, 'wRC+':99.8, WAR:-0.07, oWAR:0.66, dWAR:-0.73, H:75, '2B':12, '3B':2, HR:9, RBI:44, R:40, SB:0, CS:0, BB:55, SO:65, G:105, PA:392, AB:328, IsoP:.131 , salary:0.9 },
        '박승욱': { pos:'SS', AVG:.190, OBP:.244, SLG:.226, OPS:.470, 'wRC+':22.3, WAR:-0.31, oWAR:-0.35, dWAR:0.04, H:16, '2B':3, '3B':0, HR:0, RBI:5, R:10, SB:1, CS:1, BB:5, SO:30, G:54, PA:92, AB:84, IsoP:.036, defRAA:-2.01, rangeRAA:-2.66, errRAA:0.85, dpRAA:-0.19 , salary:1 },
        '노진혁': { pos:'3B', AVG:.270, OBP:.333, SLG:.397, OPS:.730, 'wRC+':98.6, WAR:-0.16, oWAR:0.23, dWAR:-0.39, H:17, '2B':1, '3B':2, HR:1, RBI:5, R:11, SB:0, CS:0, BB:5, SO:20, G:28, PA:69, AB:63, IsoP:.127, defRAA:-0.88, rangeRAA:-0.92, errRAA:0.04 },
        '손성빈': { pos:'C', AVG:.145, OBP:.209, SLG:.194, OPS:.403, 'wRC+':1.7, WAR:-0.20, oWAR:-0.42, dWAR:0.22, H:9, '2B':0, '3B':0, HR:1, RBI:3, R:6, SB:0, CS:0, BB:4, SO:20, G:51, PA:69, AB:62, IsoP:.049, defRAA:2.20, rangeRAA:1.19, errRAA:0.18, csRAA:1.22, frmRAA:0.00 , salary:0.6 },
        // ── 소표본 / 극소표본 ──
        '박재엽': { pos:'DH', AVG:.286, OBP:.375, SLG:.571, OPS:.946, 'wRC+':148.3, WAR:0.22, oWAR:0.28, dWAR:-0.05, H:4, '2B':1, '3B':0, HR:1, RBI:3, R:2, SB:0, CS:0, BB:2, SO:5, G:9, PA:16, AB:14, IsoP:.285 },
        // 신윤후: 13PA 소표본 → _ratings 수동 (육성 중인 젊은 외야수)
        '신윤후': { pos:'RF', AVG:.167, OBP:.167, SLG:.167, OPS:.334, 'wRC+':-31.0, WAR:-0.21, oWAR:-0.19, dWAR:-0.02, H:2, '2B':0, '3B':0, HR:0, RBI:0, R:1, SB:1, CS:0, BB:0, SO:3, G:12, PA:13, AB:12, IsoP:.000, _ratings:{contact:32, power:28, eye:25, speed:45, defense:40} , salary:0.4 },
        '한승현': { pos:'SS', AVG:.059, OBP:.105, SLG:.059, OPS:.164, 'wRC+':-71.1, WAR:-0.18, oWAR:-0.34, dWAR:0.16, H:1, '2B':0, '3B':0, HR:0, RBI:1, R:1, SB:1, CS:1, BB:1, SO:6, G:19, PA:19, AB:17, IsoP:.000 },
        // 한동희: 상무 전역. 상무 100G AVG.400 OBP.480 SLG.675 27HR 115RBI. 3루수.
        '한동희': { pos:'3B', _ratings:{ contact:65, power:65, eye:55, speed:35, defense:42 } , salary:1.6 },
        // 이서준: 신인
        '이서준': { pos:'SS', _ratings:{ contact:30, power:25, eye:28, speed:48, defense:45 } },
        // 박정민/이준서: 신인 → REAL_SEASON_STATS 미등록 → 랜덤 OVR
        // 비슬리: MLB+NPB. NPB 통산 40G 147IP ERA2.82 143K WHIP1.17. 1선발급이나 부상 이력.
        '비슬리':     { pos:'P', role:'선발', G:40, GS:40, W:10, L:8, S:0, HLD:0, IP:147.0, H:123, HR:7, BB:49, HBP:9, SO:143, ER:46, R:51, ERA:2.82, WHIP:1.17, FIP:3.20, WAR:0.00,
            pitches:[{name:'포심',pct:35,velo:151},{name:'슬라이더',pct:30,velo:135},{name:'커터',pct:20,velo:144},{name:'스플리터',pct:15,velo:140}] },
        // 로드리게스: MLB+NPB. NPB 통산 39G 78IP ERA2.77 67K WHIP1.26. 포심 ivb 18.4인치 엘리트.
        '로드리게스': { pos:'P', role:'선발', G:39, GS:0, W:2, L:6, S:1, HLD:8, IP:78.0, H:73, HR:6, BB:25, HBP:2, SO:67, ER:24, R:33, ERA:2.77, WHIP:1.26, FIP:3.50, WAR:0.00,
            pitches:[{name:'포심',pct:40,velo:152},{name:'슬라이더',pct:25,velo:137},{name:'체인지업',pct:15,velo:140},{name:'커터',pct:12,velo:145},{name:'커브',pct:8,velo:128}] },
        // 쿄야마: NPB 통산 6시즌 84G 277.1IP ERA4.60 222K WHIP1.68. 와일드씽 파이어볼러. 제구 나쁨.
        '쿄야마':     { pos:'P', role:'중계', G:84, GS:49, W:14, L:23, S:0, HLD:5, IP:277.1, H:306, HR:30, BB:160, HBP:9, SO:222, ER:142, R:157, ERA:4.60, WHIP:1.68, FIP:4.80, WAR:0.00,
            pitches:[{name:'포심',pct:40,velo:148},{name:'포크',pct:25,velo:136},{name:'슬라이더',pct:15,velo:132},{name:'커브',pct:10,velo:122},{name:'커터',pct:10,velo:140}] },
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // ── 선발 ──
        '데이비슨':  { pos:'P', role:'선발', G:22, GS:22, W:10, L:5,  S:0,  HLD:0,  IP:123.1, H:123, HR:10, BB:48, HBP:5,  SO:119, ER:50, R:53,  ERA:3.65, WHIP:1.39, FIP:3.85, WAR:3.38, BABIP:0.329, WPA:1.25,
            pitches:[{name:'포심',pct:40,velo:146.6},{name:'슬라이더',pct:26,velo:134.5},{name:'커터',pct:20,velo:139.9},{name:'포크',pct:8,velo:131.6},{name:'커브',pct:5,velo:121.6}] },
        '나균안':    { pos:'P', role:'선발', G:28, GS:26, W:3,  L:7,  S:0,  HLD:0,  IP:137.1, H:143, HR:13, BB:50, HBP:5,  SO:116, ER:59, R:67,  ERA:3.87, WHIP:1.41, FIP:4.22, WAR:3.01, BABIP:0.317, WPA:-0.18,
            pitches:[{name:'포심',pct:42,velo:145.1},{name:'포크',pct:38,velo:131.8},{name:'커터',pct:12,velo:137.9},{name:'커브',pct:7,velo:119.6}] },
        '감보아':    { pos:'P', role:'선발', G:19, GS:19, W:7,  L:8,  S:0,  HLD:0,  IP:108.0, H:97,  HR:6,  BB:49, HBP:4,  SO:117, ER:43, R:54,  ERA:3.58, WHIP:1.35, FIP:3.44, WAR:2.35, BABIP:0.311, WPA:0.10,
            pitches:[{name:'포심',pct:57,velo:152.6},{name:'슬라이더',pct:26,velo:138.7},{name:'체인지업',pct:9,velo:136.0},{name:'커브',pct:9,velo:128.7}] },
        '박세웅':    { pos:'P', role:'선발', G:29, GS:28, W:11, L:13, S:0,  HLD:0,  IP:160.2, H:183, HR:15, BB:54, HBP:8,  SO:156, ER:88, R:99,  ERA:4.93, WHIP:1.48, FIP:3.84, WAR:1.95, BABIP:0.349, WPA:-1.83,
            pitches:[{name:'포심',pct:40,velo:147.0},{name:'슬라이더',pct:31,velo:135.6},{name:'포크',pct:15,velo:133.6},{name:'커브',pct:14,velo:122.0}] },
        '이민석':    { pos:'P', role:'선발', G:20, GS:17, W:2,  L:5,  S:0,  HLD:0,  IP:87.1,  H:104, HR:10, BB:56, HBP:2,  SO:61,  ER:51, R:56,  ERA:5.26, WHIP:1.83, FIP:5.66, WAR:0.95, BABIP:0.330, WPA:-0.74,
            pitches:[{name:'포심',pct:54,velo:150.2},{name:'슬라이더',pct:34,velo:138.5},{name:'체인지업',pct:9,velo:139.9},{name:'커브',pct:3,velo:123.6}] },
        '반즈':      { pos:'P', role:'선발', G:8,  GS:8,  W:3,  L:4,  S:0,  HLD:0,  IP:45.2,  H:47,  HR:4,  BB:17, HBP:2,  SO:38,  ER:27, R:31,  ERA:5.32, WHIP:1.40, FIP:4.21, WAR:0.30, BABIP:0.305, WPA:-0.49,
            pitches:[{name:'포심',pct:34,velo:143.4},{name:'슬라이더',pct:33,velo:130.7},{name:'체인지업',pct:19,velo:129.8},{name:'투심',pct:13,velo:142.2}] },
        // 비슬리: 신규 외국인 (나중에 OVR 산출 예정)
        '비슬리':    { pos:'P', role:'선발' , salary:9.1 },
        // 로드리게스: 신규 외국인 (나중에 OVR 산출 예정)
        '로드리게스': { pos:'P', role:'선발' , salary:9.1 },
        // 쿄야마: 신규 외국인 (나중에 OVR 산출 예정)
        '쿄야마':    { pos:'P', role:'선발' },
        // ── 마무리 ──
        '김원중':    { pos:'P', role:'마무리', G:53, GS:0,  W:4,  L:3,  S:32, HLD:0,  IP:60.2,  H:58,  HR:4,  BB:33, HBP:2,  SO:69,  ER:18, R:21,  ERA:2.67, WHIP:1.50, FIP:3.55, WAR:1.61, BABIP:0.338, WPA:1.19,
            pitches:[{name:'포크',pct:53,velo:134.6},{name:'포심',pct:41,velo:146.5},{name:'슬라이더',pct:4,velo:135.8},{name:'커브',pct:2,velo:118.1}] },
        // ── 중계 ──
        '정철원':    { pos:'P', role:'중계', G:75, GS:0,  W:8,  L:3,  S:0,  HLD:21, IP:70.0,  H:72,  HR:4,  BB:28, HBP:7,  SO:55,  ER:33, R:34,  ERA:4.24, WHIP:1.43, FIP:4.19, WAR:1.03, BABIP:0.316, WPA:-0.06,
            pitches:[{name:'포심',pct:48,velo:147.6},{name:'슬라이더',pct:42,velo:131.7},{name:'포크',pct:10,velo:132.3}] },
        '정현수':    { pos:'P', role:'중계', G:82, GS:0,  W:2,  L:0,  S:0,  HLD:12, IP:47.2,  H:34,  HR:4,  BB:26, HBP:2,  SO:47,  ER:21, R:23,  ERA:3.97, WHIP:1.26, FIP:4.33, WAR:1.03, BABIP:0.248, WPA:0.44,
            pitches:[{name:'슬라이더',pct:50,velo:128.0},{name:'포심',pct:39,velo:141.4},{name:'커브',pct:9,velo:119.9},{name:'체인지업',pct:1,velo:127.3}] },
        '홍민기':    { pos:'P', role:'중계', G:25, GS:2,  W:0,  L:2,  S:0,  HLD:3,  IP:32.0,  H:24,  HR:0,  BB:11, HBP:2,  SO:39,  ER:11, R:13,  ERA:3.09, WHIP:1.09, FIP:2.17, WAR:1.06, BABIP:0.312, WPA:0.25,
            pitches:[{name:'포심',pct:66,velo:150.1},{name:'슬라이더',pct:34,velo:132.6}] },
        '김강현':    { pos:'P', role:'중계', G:67, GS:0,  W:2,  L:2,  S:0,  HLD:4,  IP:72.0,  H:69,  HR:9,  BB:21, HBP:7,  SO:36,  ER:32, R:37,  ERA:4.00, WHIP:1.25, FIP:5.40, WAR:0.93, BABIP:0.260, WPA:-0.40,
            pitches:[{name:'슬라이더',pct:58,velo:128.7},{name:'포심',pct:41,velo:144.8},{name:'체인지업',pct:1,velo:130.9}] },
        '최준용':    { pos:'P', role:'중계', G:49, GS:0,  W:4,  L:4,  S:1,  HLD:17, IP:54.1,  H:50,  HR:5,  BB:16, HBP:6,  SO:62,  ER:32, R:35,  ERA:5.30, WHIP:1.21, FIP:3.46, WAR:0.33, BABIP:0.319, WPA:-0.16,
            pitches:[{name:'포심',pct:60,velo:150.3},{name:'슬라이더',pct:22,velo:139.0},{name:'커브',pct:10,velo:120.3},{name:'체인지업',pct:8,velo:136.8}] },
        '송재영':    { pos:'P', role:'중계', G:46, GS:0,  W:1,  L:0,  S:0,  HLD:3,  IP:27.0,  H:19,  HR:3,  BB:24, HBP:0,  SO:28,  ER:12, R:13,  ERA:4.00, WHIP:1.59, FIP:5.49, WAR:0.13, BABIP:0.246, WPA:-0.17,
            pitches:[{name:'포심',pct:52,velo:141.0},{name:'슬라이더',pct:46,velo:129.1},{name:'커브',pct:2,velo:117.5}] },
        '박진':      { pos:'P', role:'중계', G:51, GS:5,  W:3,  L:3,  S:1,  HLD:3,  IP:69.1,  H:76,  HR:10, BB:22, HBP:1,  SO:50,  ER:41, R:42,  ERA:5.32, WHIP:1.41, FIP:4.89, WAR:0.03, BABIP:0.303, WPA:-0.41,
            pitches:[{name:'포심',pct:42,velo:144.5},{name:'슬라이더',pct:45,velo:130.4},{name:'포크',pct:9,velo:130.7},{name:'커브',pct:4,velo:115.6}] },
        '한현희':    { pos:'P', role:'중계', G:3,  GS:2,  W:0,  L:0,  S:0,  HLD:1,  IP:8.2,   H:13,  HR:2,  BB:2,  HBP:1,  SO:8,   ER:6,  R:6,   ERA:6.23, WHIP:1.73, FIP:5.46, WAR:0.02, BABIP:0.393, WPA:-0.14,
            pitches:[{name:'슬라이더',pct:48,velo:126.5},{name:'포심',pct:44,velo:143.5},{name:'체인지업',pct:3,velo:127.0},{name:'투심',pct:2,velo:136.0},{name:'포크',pct:2,velo:134.7},{name:'커브',pct:1,velo:123.0}] },
        '윤성빈':    { pos:'P', role:'중계', G:31, GS:1,  W:1,  L:2,  S:0,  HLD:0,  IP:27.0,  H:26,  HR:3,  BB:20, HBP:4,  SO:44,  ER:23, R:23,  ERA:7.67, WHIP:1.70, FIP:3.89, WAR:0.00, BABIP:0.390, WPA:-0.81,
            pitches:[{name:'포심',pct:70,velo:155.0},{name:'포크',pct:25,velo:142.0},{name:'커브',pct:1,velo:124.0}] },
        '박준우':    { pos:'P', role:'중계', G:11, GS:1,  W:1,  L:2,  S:0,  HLD:1,  IP:12.1,  H:21,  HR:0,  BB:6,  HBP:1,  SO:11,  ER:11, R:11,  ERA:8.03, WHIP:2.19, FIP:3.51, WAR:-0.21, BABIP:0.457, WPA:-0.74,
            pitches:[{name:'슬라이더',pct:44,velo:133.3},{name:'포심',pct:44,velo:145.1},{name:'포크',pct:8,velo:131.6},{name:'커브',pct:3,velo:123.7}] },
        '김상수':    { pos:'P', role:'중계', G:45, GS:0,  W:0,  L:1,  S:2,  HLD:3,  IP:36.2,  H:48,  HR:4,  BB:18, HBP:3,  SO:27,  ER:26, R:26,  ERA:6.38, WHIP:1.80, FIP:5.03, WAR:-0.52, BABIP:0.349, WPA:-0.82,
            pitches:[{name:'포심',pct:44,velo:143.7},{name:'포크',pct:29,velo:129.4},{name:'슬라이더',pct:23,velo:132.5},{name:'커브',pct:2,velo:121.4},{name:'체인지업',pct:1,velo:129.8}] },
        // ── 극소표본 / 1군 기록 없음 ──
        '심재민':    { pos:'P', role:'중계', G:4,  GS:0,  W:1,  L:0,  S:0,  HLD:0,  IP:3.0,   H:5,   HR:0,  BB:1,  HBP:0,  SO:2,   ER:1,  R:2,   ERA:3.00, WHIP:2.00, FIP:3.32, WAR:-0.04, BABIP:0.417, WPA:0.14,
            pitches:[{name:'슬라이더',pct:40,velo:131.2},{name:'포심',pct:33,velo:141.4},{name:'체인지업',pct:19,velo:131.7},{name:'커브',pct:8,velo:117.5}] },
        '구승민':    { pos:'P', role:'중계', G:11, GS:0,  W:0,  L:1,  S:0,  HLD:1,  IP:9.0,   H:9,   HR:1,  BB:7,  HBP:1,  SO:10,  ER:7,  R:10,  ERA:7.00, WHIP:1.78, FIP:5.31, WAR:-0.22, BABIP:0.308, WPA:-0.17,
            pitches:[{name:'포크',pct:54,velo:132.3},{name:'포심',pct:35,velo:144.8},{name:'슬라이더',pct:11,velo:133.8}] },
        '벨라스케즈': { pos:'P', role:'선발', G:11, GS:7,  W:1,  L:4,  S:0,  HLD:0,  IP:35.0,  H:47,  HR:7,  BB:18, HBP:3,  SO:28,  ER:32, R:32,  ERA:8.23, WHIP:1.86, FIP:6.22, WAR:-0.31, BABIP:0.364, WPA:-0.98,
            pitches:[{name:'포심',pct:41,velo:148.9},{name:'슬라이더',pct:24,velo:135.6},{name:'체인지업',pct:15,velo:139.4},{name:'커브',pct:14,velo:128.4},{name:'투심',pct:6,velo:145.7}] },
        '김진욱':    { pos:'P', role:'선발', G:14, GS:6,  W:1,  L:3,  S:0,  HLD:0,  IP:27.0,  H:42,  HR:10, BB:16, HBP:2,  SO:24,  ER:30, R:32,  ERA:10.00, WHIP:2.15, FIP:8.24, WAR:-0.73, BABIP:0.390, WPA:-1.52,
            pitches:[{name:'슬라이더',pct:40,velo:129.0},{name:'포심',pct:43,velo:143.8},{name:'커브',pct:10,velo:121.2},{name:'체인지업',pct:7,velo:126.9}] },
        '정우준':    { pos:'P', role:'중계', G:3,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:3.1,   H:6,   HR:0,  BB:0,  HBP:1,  SO:3,   ER:2,  R:2,   ERA:5.40, WHIP:1.80, FIP:2.63, WAR:0.03, BABIP:0.500, WPA:-0.01,
            pitches:[{name:'포심',pct:55,velo:144.7},{name:'슬라이더',pct:36,velo:128.0},{name:'포크',pct:5,velo:133.0},{name:'체인지업',pct:3,velo:134.0}] },
        '정성종':    { pos:'P', role:'중계', G:2,  GS:0,  W:0,  L:0,  S:0,  HLD:0,  IP:2.1,   H:3,   HR:1,  BB:0,  HBP:0,  SO:0,   ER:1,  R:1,   ERA:3.86, WHIP:1.29, FIP:9.02, WAR:0.01, BABIP:0.222, WPA:0.00,
            pitches:[{name:'포심',pct:73,velo:144.6},{name:'슬라이더',pct:16,velo:122.7},{name:'체인지업',pct:11,velo:127.3}] },
        '박시영':    { pos:'P', role:'중계', G:11, GS:0,  W:1,  L:0,  S:0,  HLD:0,  IP:7.1,   H:9,   HR:0,  BB:9,  HBP:2,  SO:10,  ER:9,  R:9,   ERA:11.05, WHIP:2.45, FIP:5.31, WAR:-0.54, BABIP:0.429, WPA:-0.31,
            pitches:[{name:'슬라이더',pct:55,velo:129.5},{name:'포심',pct:34,velo:144.1},{name:'포크',pct:8,velo:134.6},{name:'커브',pct:3,velo:122.0}] },
    },
    '삼성': {
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // ── 선발 ──
        '후라도':    { pos:'P', role:'선발', G:30, GS:30, W:15, L:8,  S:0,  HLD:0,  IP:197.1, H:177, HR:17, BB:36, HBP:4,  SO:142, ER:57, R:65,  ERA:2.60, WHIP:1.08, FIP:3.79, WAR:7.57, BABIP:0.275, WPA:3.23,
            pitches:[{name:'포심',pct:34,velo:146.9},{name:'체인지업',pct:23,velo:135.7},{name:'투심',pct:16,velo:145.7},{name:'커터',pct:15,velo:138.2},{name:'커브',pct:11,velo:129.4}] },
        '원태인':    { pos:'P', role:'선발', G:27, GS:27, W:12, L:4,  S:0,  HLD:0,  IP:166.2, H:157, HR:20, BB:27, HBP:6,  SO:108, ER:60, R:66,  ERA:3.24, WHIP:1.10, FIP:4.36, WAR:4.91, BABIP:0.275, WPA:1.90,
            pitches:[{name:'포심',pct:42,velo:146.3},{name:'슬라이더',pct:24,velo:134.6},{name:'체인지업',pct:22,velo:126.4},{name:'커터',pct:6,velo:138.7},{name:'커브',pct:6,velo:122.4}] },
        '최원태':    { pos:'P', role:'선발', G:27, GS:24, W:8,  L:7,  S:0,  HLD:0,  IP:124.1, H:128, HR:13, BB:51, HBP:12, SO:109, ER:68, R:72,  ERA:4.92, WHIP:1.44, FIP:4.59, WAR:1.73, BABIP:0.322, WPA:-0.98,
            pitches:[{name:'포심',pct:46,velo:147.0},{name:'슬라이더',pct:21,velo:139.2},{name:'체인지업',pct:15,velo:130.3},{name:'커브',pct:9,velo:123.6},{name:'투심',pct:5,velo:145.6},{name:'커터',pct:4,velo:140.5}] },
        '이승현':    { pos:'P', role:'선발', G:25, GS:23, W:4,  L:9,  S:0,  HLD:0,  IP:101.1, H:121, HR:10, BB:46, HBP:9,  SO:74,  ER:61, R:64,  ERA:5.42, WHIP:1.65, FIP:5.00, WAR:1.39, BABIP:0.342, WPA:-0.75,
            pitches:[{name:'포심',pct:54,velo:143.2},{name:'슬라이더',pct:25,velo:132.8},{name:'체인지업',pct:20,velo:122.9},{name:'커브',pct:1,velo:120.0}] },
        // 최지광: 2025 부상 시즌 — 통산 성적 기반 OVR (G:277 ERA 약4.5 수준)
        // 통산 277G 251IP ERA~4.5 WHIP~1.5 → 스탯 기반 OVR 산출용
        '최지광':    { pos:'P', role:'선발', G:277, GS:0, W:13, L:14, S:0, HLD:47, IP:251.0, H:242, HR:18, BB:173, HBP:16, SO:250, ER:126, R:136, ERA:4.52, WHIP:1.65, FIP:4.50, WAR:0.00,
            pitches:[{name:'포심',pct:45,velo:148},{name:'슬라이더',pct:30,velo:135},{name:'커브',pct:15,velo:122},{name:'체인지업',pct:10,velo:130}] },
        // 미야지: NPB 2군 — 극단적 파워피처. 최고 158km/h 포심+스플리터(결정구). 제구 나쁨.
        // 2025 NPB 2군: 24G 25IP ERA2.88 0W2L 4SV 31K 11BB 3HBP WHIP1.40
        '미야지':    { pos:'P', role:'중계', G:24, GS:0, W:0, L:2, S:4, HLD:0, IP:25.0, H:24, HR:1, BB:11, HBP:3, SO:31, ER:8, R:9, ERA:2.88, WHIP:1.40, FIP:2.80, WAR:0.00,
            pitches:[{name:'포심',pct:45,velo:154},{name:'스플리터',pct:30,velo:142},{name:'커터',pct:15,velo:145},{name:'슬라이더',pct:10,velo:138}] },
        // 오러클린: MLB 2024 OAK — 4G 9.2IP ERA4.66 WHIP1.862. 좌완 쓰리쿼터. 포심+슬라이더 주력+체인지업+커브.
        '오러클린':  { pos:'P', role:'선발', G:4, GS:0, W:0, L:0, S:0, HLD:1, IP:9.2, H:13, HR:1, BB:5, HBP:0, SO:6, ER:5, R:5, ERA:4.66, WHIP:1.86, FIP:5.00, WAR:0.00,
            pitches:[{name:'포심',pct:40,velo:148},{name:'슬라이더',pct:35,velo:133},{name:'체인지업',pct:15,velo:137},{name:'커브',pct:10,velo:122}] },
        // 임기영: 2025 KIA → 삼성 이적
        '임기영':    { pos:'P', role:'중계', G:10, GS:0, W:1, L:1, S:0, HLD:0, IP:9.0, H:23, HR:2, BB:4, HBP:0, SO:5, ER:13, R:13, ERA:13.00, WHIP:3.00, FIP:6.60, WAR:-0.48, BABIP:0.525, WPA:-0.45,
            pitches:[{name:'포심',pct:40,velo:137.9},{name:'체인지업',pct:32,velo:126.2},{name:'슬라이더',pct:24,velo:126.5},{name:'투심',pct:4,velo:135.1}] },
        // ── 마무리 ──
        '김재윤':    { pos:'P', role:'마무리', G:63, GS:0,  W:4,  L:7,  S:13, HLD:3,  IP:57.2,  H:57,  HR:10, BB:13, HBP:1,  SO:43,  ER:32, R:34,  ERA:4.99, WHIP:1.21, FIP:4.84, WAR:0.47, BABIP:0.272, WPA:-0.63,
            pitches:[{name:'포심',pct:54,velo:144.7},{name:'슬라이더',pct:26,velo:130.5},{name:'포크',pct:19,velo:133.9},{name:'커브',pct:1,velo:115.8}] },
        // ── 중계 ──
        '백정현':    { pos:'P', role:'중계', G:29, GS:1,  W:2,  L:0,  S:1,  HLD:3,  IP:32.1,  H:19,  HR:1,  BB:7,  HBP:2,  SO:31,  ER:7,  R:7,   ERA:1.95, WHIP:0.80, FIP:2.78, WAR:1.30, BABIP:0.212, WPA:0.38,
            pitches:[{name:'포심',pct:49,velo:140.1},{name:'포크',pct:21,velo:130.4},{name:'슬라이더',pct:20,velo:129.7},{name:'커브',pct:9,velo:114.3}] },
        '김태훈':    { pos:'P', role:'중계', G:73, GS:0,  W:2,  L:6,  S:2,  HLD:19, IP:66.1,  H:66,  HR:8,  BB:26, HBP:2,  SO:74,  ER:33, R:34,  ERA:4.48, WHIP:1.39, FIP:3.87, WAR:1.27, BABIP:0.330, WPA:-1.19,
            pitches:[{name:'포심',pct:47,velo:144.2},{name:'포크',pct:32,velo:131.8},{name:'커브',pct:17,velo:123.4},{name:'슬라이더',pct:4,velo:132.0}] },
        '양창섭':    { pos:'P', role:'중계', G:33, GS:6,  W:3,  L:3,  S:0,  HLD:2,  IP:63.0,  H:67,  HR:3,  BB:19, HBP:9,  SO:45,  ER:24, R:29,  ERA:3.43, WHIP:1.37, FIP:4.12, WAR:1.04, BABIP:0.325, WPA:-0.33,
            pitches:[{name:'포심',pct:39,velo:146.3},{name:'슬라이더',pct:33,velo:134.8},{name:'투심',pct:11,velo:145.2},{name:'커브',pct:10,velo:121.5},{name:'체인지업',pct:5,velo:131.3},{name:'포크',pct:3,velo:134.1}] },
        '배찬승':    { pos:'P', role:'중계', G:65, GS:0,  W:2,  L:3,  S:0,  HLD:19, IP:50.2,  H:50,  HR:3,  BB:34, HBP:2,  SO:57,  ER:22, R:25,  ERA:3.91, WHIP:1.66, FIP:4.02, WAR:0.59, BABIP:0.353, WPA:-0.97,
            pitches:[{name:'포심',pct:61,velo:151.7},{name:'슬라이더',pct:37,velo:136.9},{name:'체인지업',pct:2,velo:139.5}] },
        '이승민':    { pos:'P', role:'중계', G:62, GS:1,  W:3,  L:2,  S:0,  HLD:8,  IP:64.1,  H:61,  HR:5,  BB:26, HBP:3,  SO:53,  ER:27, R:37,  ERA:3.78, WHIP:1.35, FIP:4.18, WAR:0.36, BABIP:0.298, WPA:-0.38,
            pitches:[{name:'포심',pct:50,velo:142.5},{name:'슬라이더',pct:31,velo:129.0},{name:'체인지업',pct:12,velo:126.8},{name:'커브',pct:7,velo:121.6}] },
        '이호성':    { pos:'P', role:'중계', G:58, GS:0,  W:7,  L:4,  S:9,  HLD:3,  IP:55.1,  H:54,  HR:7,  BB:29, HBP:2,  SO:69,  ER:39, R:44,  ERA:6.34, WHIP:1.50, FIP:4.10, WAR:-0.03, BABIP:0.331, WPA:-0.78,
            pitches:[{name:'포심',pct:55,velo:148.1},{name:'슬라이더',pct:30,velo:137.4},{name:'커브',pct:15,velo:125.9}] },
        '육선엽':    { pos:'P', role:'중계', G:27, GS:1,  W:0,  L:1,  S:0,  HLD:1,  IP:28.2,  H:23,  HR:4,  BB:24, HBP:0,  SO:19,  ER:17, R:21,  ERA:5.34, WHIP:1.64, FIP:6.60, WAR:0.00, BABIP:0.229, WPA:-0.26,
            pitches:[{name:'포심',pct:45,velo:145.8},{name:'슬라이더',pct:28,velo:135.5},{name:'체인지업',pct:19,velo:133.3},{name:'커브',pct:7,velo:128.8}] },
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        '디아즈':   { pos:'1B', AVG:.314, OBP:.381, SLG:.644, OPS:1.025, 'wRC+':159.7, WAR:5.80, oWAR:4.81, dWAR:0.99, H:173, '2B':32, '3B':0, HR:50, RBI:158, R:93, SB:1, CS:0, BB:60, SO:100, G:144, PA:628, AB:551, IsoP:.330, defRAA:9.86, rangeRAA:7.33, errRAA:2.30 , salary:18.2 },
        '김성윤':   { pos:'RF', AVG:.331, OBP:.419, SLG:.474, OPS:.893, 'wRC+':146.2, WAR:5.50, oWAR:5.12, dWAR:0.38, H:151, '2B':29, '3B':9, HR:6, RBI:61, R:92, SB:26, CS:7, BB:65, SO:54, G:127, PA:538, AB:456, IsoP:.143, defRAA:3.08, rangeRAA:2.68, errRAA:0.44, armRAA:-0.05 , salary:2 },
        '이재현':   { pos:'SS', AVG:.254, OBP:.360, SLG:.427, OPS:.787, 'wRC+':113.9, WAR:5.13, oWAR:4.49, dWAR:0.63, H:116, '2B':29, '3B':1, HR:16, RBI:67, R:82, SB:6, CS:1, BB:69, SO:119, G:139, PA:555, AB:457, IsoP:.173, _minSpeed:45, defRAA:6.32, rangeRAA:7.05, errRAA:-0.58, dpRAA:-0.16 , salary:2.9 },
        '구자욱':   { pos:'LF', AVG:.319, OBP:.402, SLG:.516, OPS:.918, 'wRC+':143.6, WAR:4.48, oWAR:5.11, dWAR:-0.63, H:169, '2B':43, '3B':2, HR:19, RBI:96, R:106, SB:4, CS:1, BB:73, SO:91, G:142, PA:616, AB:529, IsoP:.197, _minSpeed:42, defRAA:-6.30, rangeRAA:-3.80, errRAA:-0.80, armRAA:-1.70 , salary:5 },
        '김영웅':   { pos:'3B', AVG:.249, OBP:.323, SLG:.455, OPS:.778, 'wRC+':102.8, WAR:2.82, oWAR:2.03, dWAR:0.79, H:111, '2B':22, '3B':2, HR:22, RBI:72, R:66, SB:6, CS:2, BB:48, SO:143, G:125, PA:499, AB:446, IsoP:.206, _minSpeed:43, defRAA:7.87, rangeRAA:5.85, errRAA:1.58, dpRAA:0.23 , salary:2.2 },
        '강민호':   { pos:'C', AVG:.269, OBP:.336, SLG:.417, OPS:.753, 'wRC+':96.4, WAR:2.59, oWAR:2.33, dWAR:0.26, H:111, '2B':23, '3B':1, HR:12, RBI:71, R:37, SB:2, CS:2, BB:38, SO:69, G:127, PA:465, AB:412, IsoP:.148, defRAA:2.61, rangeRAA:0.45, errRAA:2.13, csRAA:-1.13, frmRAA:0.00 , salary:3 },
        '류지혁':   { pos:'2B', AVG:.280, OBP:.351, SLG:.323, OPS:.674, 'wRC+':84.1, WAR:1.51, oWAR:1.12, dWAR:0.39, H:112, '2B':14, '3B':0, HR:1, RBI:37, R:54, SB:11, CS:6, BB:33, SO:73, G:129, PA:464, AB:400, IsoP:.043, defRAA:2.88, rangeRAA:1.51, errRAA:1.89, dpRAA:-0.52 , salary:7 },
        '양도근':   { pos:'2B', AVG:.259, OBP:.337, SLG:.289, OPS:.626, 'wRC+':74.2, WAR:1.32, oWAR:0.56, dWAR:0.76, H:43, '2B':5, '3B':0, HR:0, RBI:16, R:23, SB:5, CS:1, BB:18, SO:41, G:116, PA:198, AB:166, IsoP:.030, defRAA:3.72, rangeRAA:2.86, errRAA:0.34, dpRAA:0.52 , salary:0.6 },
        '김지찬':   { pos:'CF', AVG:.281, OBP:.364, SLG:.322, OPS:.686, 'wRC+':93.1, WAR:0.94, oWAR:1.41, dWAR:-0.48, H:89, '2B':9, '3B':2, HR:0, RBI:23, R:59, SB:22, CS:3, BB:38, SO:44, G:90, PA:373, AB:317, IsoP:.041, defRAA:-4.80, rangeRAA:-3.20, errRAA:-0.50, armRAA:-1.10 , salary:2.3 },
        '이성규':   { pos:'RF', AVG:.198, OBP:.327, SLG:.397, OPS:.724, 'wRC+':96.5, WAR:1.23, oWAR:0.33, dWAR:0.90, H:25, '2B':5, '3B':1, HR:6, RBI:21, R:17, SB:2, CS:2, BB:15, SO:52, G:68, PA:154, AB:126, IsoP:.199, defRAA:2.79, rangeRAA:4.00, errRAA:-0.64, armRAA:-0.58 , salary:1.1 },
        '김헌곤':   { pos:'LF', AVG:.225, OBP:.286, SLG:.295, OPS:.581, 'wRC+':51.9, WAR:-0.98, oWAR:-0.60, dWAR:-0.38, H:39, '2B':6, '3B':0, HR:2, RBI:11, R:21, SB:2, CS:1, BB:11, SO:29, G:77, PA:191, AB:173, IsoP:.070, defRAA:-0.70, rangeRAA:-1.53, errRAA:0.26, armRAA:0.57 , salary:1 },
        // ── 준레귤러 / 벤치 (20–99 PA) ──
        '박승규':   { pos:'CF', AVG:.287, OBP:.377, SLG:.420, OPS:.797, 'wRC+':118.9, WAR:1.33, oWAR:1.23, dWAR:0.10, H:50, '2B':5, '3B':0, HR:6, RBI:14, R:39, SB:5, CS:4, BB:21, SO:43, G:64, PA:200, AB:174, IsoP:.133, defRAA:1.41, rangeRAA:0.70, errRAA:0.29, armRAA:0.43 , salary:0.8 },
        '전병우':   { pos:'3B', AVG:.273, OBP:.423, SLG:.338, OPS:.761, 'wRC+':125.9, WAR:0.55, oWAR:0.62, dWAR:-0.07, H:21, '2B':2, '3B':0, HR:1, RBI:13, R:11, SB:1, CS:0, BB:19, SO:27, G:59, PA:97, AB:77, IsoP:.065, defRAA:0.09, rangeRAA:-0.82, errRAA:0.60, dpRAA:0.20 , salary:0.9 },
        '박병호':   { pos:'DH', AVG:.199, OBP:.315, SLG:.454, OPS:.769, 'wRC+':102.9, WAR:0.36, oWAR:0.16, dWAR:0.20, H:39, '2B':5, '3B':0, HR:15, RBI:33, R:26, SB:0, CS:0, BB:27, SO:70, G:77, PA:232, AB:196, IsoP:.255 },
        // 박세혁: 2025 NC → 삼성 이적
        '박세혁':   { pos:'C', AVG:.163, OBP:.215, SLG:.267, OPS:.482, 'wRC+':19.5, WAR:-0.66, oWAR:-0.32, dWAR:-0.34, H:14, '2B':3, '3B':0, HR:2, RBI:10, R:8, SB:1, CS:0, BB:5, SO:28, G:48, PA:93, AB:86, IsoP:.104 , salary:4 },
        // 이해승: 2025시즌 삼성 8G 5타석 1안타 AVG.200 OBP.200 OPS.400 wRC+ -10.8 (군 복무 후 복귀)
        '이해승':   { pos:'SS', AVG:.200, OBP:.200, SLG:.200, OPS:.400, 'wRC+':-10.8, WAR:-0.36, oWAR:0.00, dWAR:-0.36, H:1, '2B':0, '3B':0, HR:0, RBI:1, R:0, SB:0, CS:0, BB:0, SO:2, G:8, PA:5, AB:5, IsoP:.000, defRAA:-1.59, rangeRAA:-0.93, errRAA:-0.45, dpRAA:-0.21 , salary:0.4 },
        '심재훈':   { pos:'DH', AVG:.184, OBP:.262, SLG:.184, OPS:.446, 'wRC+':22.7, WAR:-0.15, oWAR:-0.16, dWAR:0.01, H:7, '2B':0, '3B':0, HR:0, RBI:2, R:8, SB:3, CS:1, BB:4, SO:13, G:31, PA:43, AB:38, IsoP:.000 , salary:0.3 },
        '홍현빈':   { pos:'CF', AVG:.125, OBP:.222, SLG:.188, OPS:.410, 'wRC+':10.1, WAR:-0.06, oWAR:-0.23, dWAR:0.17, H:4, '2B':2, '3B':0, HR:0, RBI:0, R:8, SB:0, CS:0, BB:3, SO:8, G:32, PA:38, AB:32, IsoP:.063, defRAA:0.98, rangeRAA:1.34, errRAA:0.07, armRAA:-0.43 , salary:0.5 },
        '이병헌':   { pos:'C', AVG:.200, OBP:.254, SLG:.309, OPS:.563, 'wRC+':43.2, WAR:-0.10, oWAR:-0.14, dWAR:0.04, H:11, '2B':3, '3B':0, HR:1, RBI:7, R:5, SB:0, CS:0, BB:3, SO:13, G:55, PA:59, AB:55, IsoP:.109, defRAA:0.35, rangeRAA:0.15, errRAA:-0.35, csRAA:-0.06, frmRAA:0.00 , salary:0.6 },
        // ── 소표본 ──
        '함수호':   { pos:'RF', AVG:.214, OBP:.214, SLG:.214, OPS:.428, 'wRC+':-2.2, WAR:-0.07, oWAR:-0.14, dWAR:0.07, H:3, '2B':0, '3B':0, HR:0, RBI:1, R:1, SB:0, CS:0, BB:0, SO:6, G:6, PA:14, AB:14, IsoP:.000 , salary:0.3 },
        '김재성':   { pos:'SS', AVG:.127, OBP:.222, SLG:.159, OPS:.381, 'wRC+':3.3, WAR:-0.37, oWAR:-0.38, dWAR:0.00, H:8, '2B':2, '3B':0, HR:0, RBI:4, R:3, SB:0, CS:0, BB:6, SO:23, G:43, PA:73, AB:63, IsoP:.032 },
        // 최형우: 2025 KIA → 삼성 FA 이적
        '최형우':   { pos:'DH', AVG:.307, OBP:.399, SLG:.529, OPS:.928, 'wRC+':157.6, WAR:4.37, oWAR:4.37, dWAR:-0.01, H:144, '2B':30, '3B':1, HR:24, RBI:86, R:74, SB:1, CS:0, BB:67, SO:98, G:133, PA:549, AB:469, IsoP:.222 , salary:4 },
    },
    'NC': {
        // ─── 2025 시즌 투수 성적 (Statiz 종합) ───
        // ── 선발 ──
        '라일리':    { pos:'P', role:'선발', G:30, GS:30, W:17, L:7,  S:0,  HLD:0,  IP:172.0, H:136, HR:18, BB:56, HBP:3,  SO:216, ER:66, R:76,  ERA:3.45, WHIP:1.12, FIP:3.12, WAR:4.34, BABIP:0.286, WPA:1.64,
            pitches:[{name:'포심',pct:47,velo:149.9},{name:'슬라이더',pct:23,velo:137.1},{name:'커브',pct:18,velo:131.6},{name:'포크',pct:12,velo:134.6}] },
        '신민혁':    { pos:'P', role:'선발', G:28, GS:28, W:6,  L:3,  S:0,  HLD:0,  IP:132.0, H:148, HR:23, BB:26, HBP:6,  SO:84,  ER:70, R:76,  ERA:4.77, WHIP:1.32, FIP:5.18, WAR:1.93, BABIP:0.294, WPA:-1.18,
            pitches:[{name:'커터',pct:31,velo:132.7},{name:'포심',pct:19,velo:138.1},{name:'체인지업',pct:43,velo:122.0},{name:'포크',pct:6,velo:124.0},{name:'커브',pct:2,velo:106.0}] },
        // 구창모: 2025 부상 시즌(14.1IP) — 에이스급이나 부상 빈도 높음. 통산 선발 기반 체력 보정.
        '구창모':    { pos:'P', role:'선발', G:4,  GS:3,  W:1,  L:0,  S:0,  HLD:0,  IP:14.1,  H:14,  HR:1,  BB:3,  HBP:0,  SO:18,  ER:4,  R:4,   ERA:2.51, WHIP:1.19, FIP:2.28, WAR:0.67, BABIP:0.351, WPA:0.23,
            pitches:[{name:'포심',pct:48,velo:142.2},{name:'슬라이더',pct:25,velo:130.9},{name:'포크',pct:24,velo:130.9},{name:'커브',pct:3,velo:115.1}],
            _overrideStamina:50 },
        // 토다: 신규 외국인 (나중에 데이터 제공 예정)
        '토다':      { pos:'P', role:'선발' , salary:1.4 },
        // 테일러: 신규 외국인 (나중에 데이터 제공 예정)
        '테일러':    { pos:'P', role:'선발' , salary:5.9 },
        // ── 마무리 ──
        '류진욱':    { pos:'P', role:'마무리', G:62, GS:0,  W:4,  L:3,  S:29, HLD:0,  IP:66.0,  H:50,  HR:6,  BB:28, HBP:6,  SO:57,  ER:24, R:27,  ERA:3.27, WHIP:1.18, FIP:4.44, WAR:1.74, BABIP:0.250, WPA:1.70,
            pitches:[{name:'포심',pct:58,velo:147.5},{name:'포크',pct:28,velo:137.2},{name:'슬라이더',pct:14,velo:138.4}] },
        // ── 중계 ──
        '김진호':    { pos:'P', role:'중계', G:76, GS:0,  W:4,  L:3,  S:6,  HLD:20, IP:72.1,  H:53,  HR:5,  BB:45, HBP:9,  SO:70,  ER:27, R:30,  ERA:3.36, WHIP:1.35, FIP:4.67, WAR:1.38, BABIP:0.260, WPA:0.80,
            pitches:[{name:'포심',pct:55,velo:146.6},{name:'체인지업',pct:40,velo:128.2},{name:'슬라이더',pct:5,velo:129.2}] },
        '김영규':    { pos:'P', role:'중계', G:45, GS:0,  W:4,  L:3,  S:0,  HLD:21, IP:44.0,  H:40,  HR:3,  BB:18, HBP:3,  SO:35,  ER:14, R:17,  ERA:2.86, WHIP:1.32, FIP:4.05, WAR:1.21, BABIP:0.296, WPA:1.00,
            pitches:[{name:'포심',pct:46,velo:144.3},{name:'슬라이더',pct:38,velo:134.0},{name:'포크',pct:16,velo:131.9}] },
        '배재환':    { pos:'P', role:'중계', G:70, GS:0,  W:2,  L:4,  S:2,  HLD:24, IP:60.1,  H:48,  HR:3,  BB:37, HBP:11, SO:51,  ER:30, R:36,  ERA:4.48, WHIP:1.41, FIP:4.84, WAR:0.89, BABIP:0.276, WPA:-0.26,
            pitches:[{name:'포심',pct:50,velo:146.7},{name:'슬라이더',pct:23,velo:132.7},{name:'포크',pct:26,velo:141.1}] },
        '전사민':    { pos:'P', role:'중계', G:74, GS:0,  W:7,  L:7,  S:2,  HLD:13, IP:82.1,  H:86,  HR:3,  BB:33, HBP:11, SO:62,  ER:39, R:45,  ERA:4.26, WHIP:1.45, FIP:4.02, WAR:0.83, BABIP:0.328, WPA:-1.24,
            pitches:[{name:'투심',pct:60,velo:148.0},{name:'포크',pct:16,velo:133.1},{name:'슬라이더',pct:16,velo:127.9},{name:'포심',pct:7,velo:148.5},{name:'커브',pct:1,velo:122.8}] },
        '손주환':    { pos:'P', role:'중계', G:52, GS:0,  W:6,  L:1,  S:0,  HLD:7,  IP:51.2,  H:53,  HR:5,  BB:19, HBP:1,  SO:37,  ER:25, R:29,  ERA:4.35, WHIP:1.39, FIP:4.52, WAR:0.67, BABIP:0.298, WPA:0.29,
            pitches:[{name:'슬라이더',pct:46,velo:135.8},{name:'포심',pct:44,velo:147.3},{name:'포크',pct:10,velo:136.0}] },
        '원종해':    { pos:'P', role:'중계' },
        '이준혁':    { pos:'P', role:'중계', G:25, GS:3,  W:1,  L:3,  S:0,  HLD:0,  IP:37.0,  H:43,  HR:8,  BB:20, HBP:6,  SO:30,  ER:30, R:33,  ERA:7.30, WHIP:1.70, FIP:6.54, WAR:-0.50, BABIP:0.337, WPA:-1.72,
            pitches:[{name:'슬라이더',pct:46,velo:132.1},{name:'포심',pct:37,velo:145.0},{name:'커브',pct:11,velo:123.0},{name:'체인지업',pct:5,velo:132.1}] },
        '임정호':    { pos:'P', role:'중계', G:31, GS:0,  W:1,  L:1,  S:0,  HLD:4,  IP:18.2,  H:18,  HR:3,  BB:9,  HBP:4,  SO:15,  ER:10, R:13,  ERA:4.82, WHIP:1.45, FIP:5.88, WAR:-0.87, BABIP:0.278, WPA:-1.69,
            pitches:[{name:'슬라이더',pct:54,velo:127.6},{name:'투심',pct:31,velo:135.0},{name:'커브',pct:9,velo:118.2},{name:'체인지업',pct:7,velo:126.7}] },
        // ─── 2025 시즌 타자 성적 (Statiz 종합) ───
        // ── 주전 (100+ PA) ──
        '김주원':   { pos:'SS', AVG:.289, OBP:.379, SLG:.451, OPS:.830, 'wRC+':131.1, WAR:6.33, oWAR:6.27, dWAR:0.06, H:156, '2B':26, '3B':8, HR:15, RBI:65, R:98, SB:44, CS:11, BB:63, SO:111, G:144, PA:624, AB:539, IsoP:.162, defRAA:0.58, rangeRAA:3.88, errRAA:-2.85, dpRAA:-0.45 , salary:3.5 },
        '박민우':   { pos:'2B', AVG:.302, OBP:.384, SLG:.426, OPS:.810, 'wRC+':123.3, WAR:4.38, oWAR:3.72, dWAR:0.66, H:122, '2B':25, '3B':8, HR:3, RBI:67, R:64, SB:28, CS:8, BB:44, SO:64, G:117, PA:468, AB:404, IsoP:.124, defRAA:5.81, rangeRAA:5.35, errRAA:-0.25, dpRAA:0.71 , salary:8 },
        '김형준':   { pos:'C', AVG:.232, OBP:.320, SLG:.414, OPS:.734, 'wRC+':100.9, WAR:3.27, oWAR:2.59, dWAR:0.69, H:84, '2B':10, '3B':1, HR:18, RBI:55, R:51, SB:3, CS:0, BB:45, SO:126, G:127, PA:415, AB:362, IsoP:.182, defRAA:6.86, rangeRAA:0.66, errRAA:1.23, csRAA:1.63, frmRAA:0.00 , salary:2 },
        '김휘집':   { pos:'3B', AVG:.249, OBP:.349, SLG:.420, OPS:.769, 'wRC+':112.3, WAR:2.87, oWAR:2.78, dWAR:0.09, H:107, '2B':18, '3B':2, HR:17, RBI:56, R:64, SB:10, CS:2, BB:40, SO:89, G:142, PA:500, AB:429, IsoP:.171, defRAA:1.63, rangeRAA:4.03, errRAA:-1.76, dpRAA:-0.60 , salary:2.4 },
        '권희동':   { pos:'LF', AVG:.246, OBP:.393, SLG:.363, OPS:.756, 'wRC+':124.8, WAR:2.76, oWAR:2.62, dWAR:0.13, H:88, '2B':24, '3B':0, HR:6, RBI:39, R:56, SB:5, CS:5, BB:77, SO:80, G:136, PA:456, AB:358, IsoP:.117, defRAA:2.20, rangeRAA:2.87, errRAA:0.37, armRAA:-1.04 , salary:2.5 },
        '데이비슨': { pos:'1B', AVG:.293, OBP:.346, SLG:.619, OPS:.965, 'wRC+':149.0, WAR:2.72, oWAR:3.10, dWAR:-0.38, H:113, '2B':18, '3B':0, HR:36, RBI:97, R:63, SB:1, CS:0, BB:31, SO:118, G:112, PA:439, AB:386, IsoP:.326, defRAA:-3.80, rangeRAA:-2.50, errRAA:-0.80, armRAA:-0.50 , salary:13.7 },
        '박건우':   { pos:'RF', AVG:.289, OBP:.370, SLG:.427, OPS:.797, 'wRC+':119.4, WAR:1.85, oWAR:2.19, dWAR:-0.33, H:111, '2B':24, '3B':1, HR:9, RBI:67, R:43, SB:6, CS:4, BB:47, SO:63, G:124, PA:442, AB:384, IsoP:.138, defRAA:-3.30, rangeRAA:-1.80, errRAA:-0.50, armRAA:-1.00 , salary:6 },
        '천재환':   { pos:'LF', AVG:.238, OBP:.292, SLG:.368, OPS:.660, 'wRC+':74.0, WAR:0.06, oWAR:0.14, dWAR:-0.08, H:62, '2B':10, '3B':3, HR:6, RBI:31, R:47, SB:15, CS:5, BB:17, SO:58, G:129, PA:294, AB:261, IsoP:.130, defRAA:2.14, rangeRAA:2.29, errRAA:-0.28, armRAA:0.12 , salary:1 },
        '오영수':   { pos:'1B', AVG:.232, OBP:.335, SLG:.323, OPS:.658, 'wRC+':87.4, WAR:0.05, oWAR:0.09, dWAR:-0.04, H:36, '2B':5, '3B':0, HR:3, RBI:23, R:14, SB:3, CS:2, BB:22, SO:47, G:67, PA:179, AB:155, IsoP:.091, defRAA:-0.41, rangeRAA:-0.55, errRAA:0.14 , salary:0.6 },
        '서호철':   { pos:'3B', AVG:.266, OBP:.301, SLG:.335, OPS:.636, 'wRC+':65.5, WAR:-0.82, oWAR:-0.34, dWAR:-0.48, H:70, '2B':7, '3B':1, HR:3, RBI:30, R:25, SB:7, CS:3, BB:8, SO:51, G:103, PA:292, AB:263, IsoP:.069, defRAA:3.43, rangeRAA:2.94, errRAA:-0.30, dpRAA:0.89 , salary:1.5 },
        '한석현':   { pos:'CF', AVG:.195, OBP:.306, SLG:.319, OPS:.625, 'wRC+':73.3, WAR:0.26, oWAR:0.02, dWAR:0.23, H:22, '2B':5, '3B':0, HR:3, RBI:21, R:18, SB:1, CS:1, BB:12, SO:27, G:61, PA:138, AB:113, IsoP:.124, defRAA:0.44, rangeRAA:1.09, errRAA:-0.20, armRAA:-0.45 , salary:0.5 },
        '이우성':   { pos:'LF', AVG:.283, OBP:.338, SLG:.386, OPS:.724, 'wRC+':95.3, WAR:0.17, oWAR:0.27, dWAR:-0.10, H:41, '2B':12, '3B':0, HR:1, RBI:18, R:17, SB:2, CS:1, BB:13, SO:29, G:49, PA:161, AB:145, IsoP:.103 , salary:1.6 },
        // ── 준레귤러 / 벤치 ──
        '최정원':   { pos:'CF', AVG:.275, OBP:.417, SLG:.300, OPS:.717, 'wRC+':117.3, WAR:1.31, oWAR:1.21, dWAR:0.10, H:33, '2B':3, '3B':0, HR:0, RBI:11, R:40, SB:30, CS:6, BB:18, SO:22, G:91, PA:155, AB:120, IsoP:.025 , salary:0.9 },
        '김한별':   { pos:'3B', AVG:.313, OBP:.371, SLG:.344, OPS:.715, 'wRC+':99.1, WAR:0.50, oWAR:0.43, dWAR:0.07, H:20, '2B':2, '3B':0, HR:0, RBI:5, R:14, SB:1, CS:0, BB:3, SO:5, G:76, PA:72, AB:64, IsoP:.031 , salary:0.5 },
        '도태훈':   { pos:'C', AVG:.182, OBP:.315, SLG:.299, OPS:.614, 'wRC+':74.9, WAR:0.28, oWAR:0.09, dWAR:0.20, H:14, '2B':4, '3B':1, HR:1, RBI:8, R:9, SB:3, CS:0, BB:7, SO:16, G:61, PA:98, AB:77, IsoP:.117 , salary:0.7 },
        '안중열':   { pos:'C', AVG:.143, OBP:.288, SLG:.204, OPS:.492, 'wRC+':47.5, WAR:-0.39, oWAR:0.01, dWAR:-0.40, H:7, '2B':3, '3B':0, HR:0, RBI:6, R:2, SB:0, CS:0, BB:8, SO:15, G:33, PA:60, AB:49, IsoP:.061 },
        '박시원':   { pos:'RF', AVG:.204, OBP:.271, SLG:.296, OPS:.567, 'wRC+':50.7, WAR:-0.41, oWAR:-0.13, dWAR:-0.28, H:11, '2B':2, '3B':0, HR:1, RBI:4, R:12, SB:1, CS:0, BB:5, SO:18, G:52, PA:60, AB:54, IsoP:.092 },
        // ── 이적 선수 (2025 NC 기록, 2026 타팀) ──
        // 손아섭: 한화 이적 (이미 한화에 데이터 있음)
        // 최원준 → KT 이적
        '최원준':   { pos:'CF', AVG:.258, OBP:.297, SLG:.355, OPS:.652, 'wRC+':69.5, WAR:-0.58, oWAR:-0.03, dWAR:-0.54, H:48, '2B':6, '3B':3, HR:2, RBI:25, R:34, SB:17, CS:7, BB:8, SO:28, G:50, PA:204, AB:186, IsoP:.097 },
        // 박세혁 → 삼성 이적
        '박세혁':   { pos:'C', AVG:.163, OBP:.215, SLG:.267, OPS:.482, 'wRC+':19.5, WAR:-0.66, oWAR:-0.32, dWAR:-0.34, H:14, '2B':3, '3B':0, HR:2, RBI:10, R:8, SB:1, CS:0, BB:5, SO:28, G:48, PA:93, AB:86, IsoP:.104 , salary:4 },
        // ── 2군 선수 (1군 기록 있음) ──
        '신재인':   { pos:'SS' },
        '고준휘':   { pos:'CF' },
        '한재환':   { pos:'3B', AVG:.185, OBP:.290, SLG:.185, OPS:.475, 'wRC+':36.6, WAR:-0.03, oWAR:-0.16, dWAR:0.13, H:5, '2B':0, '3B':0, HR:0, RBI:4, R:2, SB:0, CS:0, BB:2, SO:14, G:16, PA:31, AB:27, IsoP:.000 },
        '송승환':   { pos:'SS', AVG:.200, OBP:.200, SLG:.267, OPS:.467, 'wRC+':5.9, WAR:-0.24, oWAR:-0.12, dWAR:-0.12, H:3, '2B':1, '3B':0, HR:0, RBI:2, R:0, SB:0, CS:0, BB:0, SO:6, G:13, PA:15, AB:15, IsoP:.067 },
        '홍종표':   { pos:'CF', AVG:.095, OBP:.095, SLG:.095, OPS:.190, 'wRC+':-76.3, WAR:-0.77, oWAR:-0.34, dWAR:-0.43, H:2, '2B':0, '3B':0, HR:0, RBI:2, R:6, SB:0, CS:1, BB:0, SO:9, G:18, PA:21, AB:21, IsoP:.000 },
        '김정호':   { pos:'C', AVG:.444, OBP:.500, SLG:.444, OPS:.944, 'wRC+':161.4, WAR:0.26, oWAR:0.19, dWAR:0.06, H:4, '2B':0, '3B':0, HR:0, RBI:0, R:3, SB:0, CS:0, BB:0, SO:4, G:8, PA:11, AB:9, IsoP:.000, defRAA:0.65, rangeRAA:-0.09, errRAA:0.11, csRAA:-0.34, frmRAA:0.00 , salary:0.3 },
    },
};

// ─── 2군(퓨처스리그) 말소 명단 ───
// 팀 코드가 없으면 해당 팀은 2군 선수 없이 시작 (나중에 추가 가능)
const FUTURES_ROSTERS = {
    '한화': {
        P: ['김도빈','원종혁','이상규','이민우','정이황','배민서','김민우','박상원','양경모','하동준','장유호','박재규','김범준','양수호','권민규','주현상','한서구','강건우','엄요셉','김승일','여현승','황희성','박준영09','이기창','양선률','이동영','박부성','김관우','김겸재','엄상현','최주원'],
        C: ['장규현','박상언','정우성'],
        IF: ['최유빈','황영묵','정민규','최원준','김준수','한경빈','한지윤','박정현','배승수','이지성'],
        OF: ['이도훈','임종찬','권광민','유로결','유민','최윤호'],
    },
    'LG': {
        P: ['이우찬','백승현','배재준','우강훈','박시원','박명근','성동현','정우영','김유영','김대현','김동현','김진수','조건희','권우준','진우영','김종운','안시후','허준혁','김주온','이민호','최지명','박성진','장시환','조원태','우명현','박준성','양우진','이상영','이믿음','윤형민','성준서','하현규','김지용','허용주','임정균','원상훈','양진혁','이종준'],
        C: ['김민수','이한림','김준태','강민기','박준기','전경원'],
        IF: ['김정율','손용준','추세현','김성진','문정빈','주정환','이태훈','송대현','이지백','강민규','엄태경','김주성','우정안','곽민호','김유민'],
        OF: ['함창건','서영준','박현우','이준서','박관우','김현종','최명경','권동혁'],
    },
    'SSG': {
        P: ['김성민','윤태현','장지훈','신지환','최수호','천범석','이건욱','서진용','이기순','최민준','한두솔','김민준40','박종훈','정동윤','송영진','조요한','박기호','김도현','최용준','한지헌','이도우','김준영','박상후','김현재','윤성보','변건우','류현곤','조재우','신상연','김태현','김재훈','이준기','이주형','김준모'],
        C: ['이율예','김민식','신범수','김규민','김민범'],
        IF: ['박명현','김민준','석정우','문상준','최윤석','안재연','김수윤','현원회','김태윤','김요셉','박지환','장현진'],
        OF: ['김정민','이승민','한유섬','류효승','박정빈','이원준','최준우','하재훈','이정범','장재율','김창평','박세직','이승빈','오시후'],
    },
    '키움': {
        P: ['박주성','김성민','이강준','정현우','박준현','김윤하','조영건','박지성','이준우','정다훈45','원종현','이승호','김선기','양지율','김서준','손현기','정세영','이태양66','김인범','김연주','임진묵','이명종','백진수','윤현','김동규','손힘찬','오혜성','정동준','이태준','한민우','최현우','김태언','박준건','김유빈','이승재118','김준형'],
        C: ['김동헌','박성빈','김지성','박준형','김리안','김주영'],
        IF: ['이재상','김웅빈','김병휘','김지석','염승원','양현종','송지후','여동욱','전태현','권혁빈','서유신','심휘윤','유정택'],
        OF: ['이용규','임병욱','주성원','원성준','박주홍','이주형58','박채울','추재현'],
    },
    '두산': {
        P: ['최주형','김정우','박정수','김민규','최승용','이주호','이교훈','최종인','서준오','이주엽','김명신','김유성','김호준','박웅','윤태호','최민석','제환유','김한중','최우인','김지윤','장우진','황희천','임종훈','정성헌','안치호','안민겸','이기석'],
        C: ['김성재','박민준','윤준호','장규빈','류현준','이희성'],
        IF: ['임종성','박성재','김민혁','박계범','김동준','신민철','지강혁','이선우','한다현','김준상','심건보','남태웅'],
        OF: ['김민석','전다민','김대한','신우열','천현재','김주오','양현진','김문수','주양준','엄지민','임현철'],
    },
    'KT': {
        P: ['한차현','임준형','권성준','최동환','이채호','문용익','배제성','김태오','이정현','이상동','지명성','김동현KT','김재원','박건우KT','오원석','이상우','이현민','조이현','김정운','원상현','이원재','고준혁','정정우','한지웅','이준명','김건웅','강건','장민호','박준혁KT','윤상인','정현우','이민준KT','김휘연','김규한','권효준','이승언'],
        C: ['김민석','강현우','이승현KT','이정환','김유빈KT','박치성'],
        IF: ['강민성','문상철','오서진','안인산','손민석','장준원','임상우','김건휘','이재원KT','이용현','박성준'],
        OF: ['최성민','김민혁KT','신범준','유준규','최동희','박민석','정영웅','김경환'],
    },
    'NC': {
        P: ['김녹원','정구범','신민혁','목지훈','김재열','최성영','하준영','조민석','신영우','이재학','박지한','전사민','김태경','최우석','최요한','이세민','김태훈69','강태경','소이현','전루건','김준원','홍재문','김태현','노재원','박동수','김태우','최윤혁','정주영','김요엘','정튼튼','윤성환','윤서현','손민서','서동욱'],
        C: ['안중열','이희성','신민우','박성재','김동현NC'],
        IF: ['오태양','도태훈','윤준혁','한재환','김건','홍종표','박인우','박주찬','신성호','이한','장창훈','유재현','조효원','김명규'],
        OF: ['박시원','이우성','고승완','오장한','배상호','김범준','박영빈','양가온솔','조창연','안지원'],
    },
    '롯데': {
        P: ['김진욱','현도훈','정성종','구승민','김태혁','김영준','홍민기','이영재','박세진','나균안','박진','이진하','최이준','신동건','송재영','최충연','박시영','정현수','이승헌','정우준','조영우','이병준','김주완','김태균','정선우','박로건','하혜성','이태연','김기준','조경민','김태현','장세진','김창훈','석상호','박세현','김화중','남해담','김한결','김현수141','손준이'],
        C: ['박재엽','정문혁','김현도','강승구','박건우','이건희','하준서','엄장윤','서하은'],
        IF: ['최항','박찬형','이태경','박지훈','김호범','이정민','이지훈','홍서연','배인혁','이로화'],
        // 고승민, 김세민, 나승엽: 도박 징계 72경기 출장정지 → INJURED_ROSTERS로 이동
        OF: ['조세진','김동현','김한홀','김대현','이인한','윤수녕','박건129','조민영'],
        // 김동혁: 도박 징계 72경기 출장정지 → INJURED_ROSTERS로 이동
    },
    '삼성': {
        P: ['장찬희','이호성','이재희','양현','김태훈','최하늘','양창섭','김대호','이재익','김무신','정민성','서현원','홍원표','박용재','허윤동','김백산','김유현','김동현','홍승원','황정현','신정환','김시온','박주혁','김성경'],
        C: ['김재성','박진우','이병헌','김도환','장승현','차동영','이서준','안민성'],
        IF: ['김재상','차승준','이창용','양우현','박장민','김상준','조민성','임주찬','이한민'],
        OF: ['이성규','김재혁','김태훈','윤정빈','박승규','류승민','강준서','김상민','이진용','강민성','조세익'],
    },
    'KIA': {
        P: ['곽도규','유지성','김태형','윤영철','김현수17','윤중현','이준영','김사윤','이형범','장재혁','김건국','이태양','정찬화','김정엽','홍건희','한재승','이성원','김도현60','이호민','김현수64','이도현','김대유','강이준','장민기','이승재','조건호','김세일','김경묵','김상범','오규석','이호진','정다훈','최건희','나연우','지현','김양수','최유찬','유승철'],
        C: ['주효상','권다결','김선우','이도훈','신명승'],
        IF: ['정해원','최정용','변우혁','황대인','이호연','박상준','장시현','오정환','김재현','이준범','한준희','송호정','황석민','엄준현','박종혁','차상현'],
        OF: ['한승연','김석환','김민규','고종욱','김민수104','이영재','박헌','천정민','곽동효'],
    },
};

// ─── 2군 선수 상세 정보 ───
const FUTURES_DETAILS = {
    '한화': {
        '김도빈':  { no: 46,  tb: '우투우타', birth: '2001-01-05', h: 190, w: 91 },
        '원종혁':  { no: 48,  tb: '우투우타', birth: '2005-08-27', h: 185, w: 86 },
        '장유호':  { no: 28,  tb: '우투우타', birth: '2000-05-25', h: 179, w: 83 },
        '박재규':  { no: 39,  tb: '우투우타', birth: '2003-07-03', h: 181, w: 83 },
        '김범준':  { no: 40,  tb: '우투우타', birth: '2000-09-30', h: 175, w: 82 },
        '양수호':  { no: 47,  tb: '우투우타', birth: '2006-09-09', h: 187, w: 83 },
        '권민규':  { no: 64,  tb: '좌투좌타', birth: '2006-05-13', h: 189, w: 89 },
        '주현상':  { no: 66,  tb: '우투우타', birth: '1992-08-10', h: 177, w: 84 },
        '한서구':  { no: 102, tb: '좌투좌타', birth: '2003-12-04', h: 191, w: 98 },
        '강건우':  { no: 69,  tb: '좌투좌타', birth: '2007-07-19', h: 191, w: 90 },
        '엄요셉':  { no: 108, tb: '우사우타', birth: '2006-05-29', h: 190, w: 92 },
        // 추가 2군 투수
        '이상규':  { no: 18,  tb: '우투우타', birth: '1996-10-20', h: 185, w: 77 },
        '이민우':  { no: 27,  tb: '우투우타', birth: '1993-02-09', h: 185, w: 95 },
        '정이황':  { no: 34,  tb: '우투우타', birth: '2000-03-07', h: 193, w: 93 },
        '배민서':  { no: 45,  tb: '우사우타', birth: '1999-11-18', h: 184, w: 90 },
        '김민우':  { no: 53,  tb: '우투우타', birth: '1995-07-25', h: 191, w: 105 },
        '박상원':  { no: 58,  tb: '우투우타', birth: '1994-09-09', h: 189, w: 88 },
        '양경모':  { no: 103, tb: '우투우타', birth: '2003-03-24', h: 186, w: 88 },
        '하동준':  { no: 2,   tb: '좌투좌타', birth: '2007-06-11', h: 189, w: 80 },
        // 육성 투수
        '김승일':  { no: 14,  tb: '우사우타', birth: '2001-07-07', h: 183, w: 88 },
        '여현승':  { no: 3,   tb: '우투우타', birth: '2006-02-20', h: 185, w: 96 },
        '황희성':  { no: 7,   tb: '우투우타', birth: '2007-02-15', h: 180, w: 78 },
        '박준영09':{ no: 9,   tb: '우사우타', birth: '2002-06-03', h: 183, w: 85 },
        '이기창':  { no: 100, tb: '우투우타', birth: '2005-04-21', h: 186, w: 87 },
        '양선률':  { no: 101, tb: '우투우타', birth: '1997-04-15', h: 186, w: 90 },
        '이동영':  { no: 104, tb: '좌투좌타', birth: '2006-04-09', h: 186, w: 83 },
        '박부성':  { no: 111, tb: '우언우타', birth: '2000-01-17', h: 186, w: 85 },
        '김관우':  { no: 112, tb: '우사우타', birth: '2003-09-07', h: 182, w: 96 },
        '김겸재':  { no: 116, tb: '우사우타', birth: '1998-12-10', h: 187, w: 86 },
        '엄상현':  { no: 120, tb: '우투우타', birth: '2004-07-06', h: 175, w: 72 },
        '최주원':  { no: 121, tb: '우투우타', birth: '2006-01-11', h: 186, w: 85 },
        '장규현':  { no: 32,  tb: '우투좌타', birth: '2002-06-28', h: 185, w: 90 },
        '박상언':  { no: 42,  tb: '우투우타', birth: '1997-03-03', h: 185, w: 75 },
        '정우성':  { no: 115, tb: '우투우타', birth: '2002-04-11', h: 184, w: 89 },
        '최유빈':  { no: 93,  tb: '우투좌타', birth: '2002-05-27', h: 175, w: 70 },
        '황영묵':  { no: 95,  tb: '우투좌타', birth: '1999-10-16', h: 180, w: 83 },
        '정민규':  { no: 2,   tb: '우투우타', birth: '2003-01-10', h: 183, w: 88 },
        '최원준':  { no: 3,   tb: '우투좌타', birth: '2004-05-01', h: 188, w: 84 },
        '김준수':  { no: 4,   tb: '우투좌타', birth: '2007-03-27', h: 184, w: 77 },
        '한경빈':  { no: 6,   tb: '우투좌타', birth: '1998-12-11', h: 178, w: 69 },
        '한지윤':  { no: 36,  tb: '우투우타', birth: '2006-04-10', h: 188, w: 98 },
        '박정현':  { no: 63,  tb: '우투우타', birth: '2001-07-27', h: 183, w: 80 },
        '배승수':  { no: 98,  tb: '우투우타', birth: '2006-05-15', h: 184, w: 73 },
        '이지성':  { no: 106, tb: '우투우타', birth: '2005-11-29', h: 180, w: 78 },
        '이도훈':  { no: 8,   tb: '우투우타', birth: '2003-08-27', h: 174, w: 75 },
        '임종찬':  { no: 9,   tb: '우투좌타', birth: '2001-09-28', h: 184, w: 85 },
        '권광민':  { no: 17,  tb: '좌투좌타', birth: '1997-12-12', h: 189, w: 91 },
        '유로결':  { no: 33,  tb: '우투우타', birth: '2000-05-30', h: 186, w: 86 },
        '유민':    { no: 65,  tb: '우투우타', birth: '2003-01-20', h: 186, w: 86 },
        '최윤호':  { no: 114, tb: '우투좌타', birth: '2000-03-06', h: 176, w: 77 },
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
        // 투수
        '김성민':  { no: 11,  tb: '우투우타', birth: '2001-04-30', h: 184, w: 88 },
        '윤태현':  { no: 12,  tb: '우언우타', birth: '2003-10-10', h: 189, w: 93 },
        '장지훈':  { no: 21,  tb: '우사우타', birth: '1998-12-06', h: 177, w: 82 },
        '신지환':  { no: 60,  tb: '좌투좌타', birth: '2006-04-17', h: 181, w: 80 },
        '최수호':  { no: 62,  tb: '우투우타', birth: '2000-07-19', h: 185, w: 83 },
        '천범석':  { no: 68,  tb: '우투우타', birth: '2006-03-06', h: 182, w: 85 },
        '이건욱':  { no: 16,  tb: '우투우타', birth: '1995-02-13', h: 182, w: 85 },
        '서진용':  { no: 22,  tb: '우투우타', birth: '1992-10-02', h: 184, w: 88 },
        '타케다':  { no: 23,  tb: '우투우타', birth: '1993-04-03', h: 187, w: 90 },
        '김광현':  { no: 29,  tb: '좌투좌타', birth: '1988-07-22', h: 188, w: 88 },
        '최민준':  { no: 30,  tb: '우투우타', birth: '1999-06-11', h: 178, w: 83 },
        '한두솔':  { no: 34,  tb: '좌투좌타', birth: '1997-01-15', h: 179, w: 85 },
        '김민준40':{ no: 40,  tb: '우투우타', birth: '2006-04-08', h: 185, w: 97 },
        '박종훈':  { no: 50,  tb: '우언우타', birth: '1991-08-13', h: 186, w: 90 },
        '정동윤':  { no: 51,  tb: '우투좌타', birth: '1997-10-22', h: 193, w: 103 },
        '송영진':  { no: 90,  tb: '우투우타', birth: '2004-05-28', h: 185, w: 90 },
        '조요한':  { no: 98,  tb: '우투우타', birth: '2000-01-06', h: 191, w: 101 },
        '박기호':  { no: 66,  tb: '우언우타', birth: '2005-07-26', h: 184, w: 80 },
        '김도현':  { no: 61,  tb: '우투우타', birth: '2003-05-24', h: 179, w: 89 },
        '최용준':  { no: 67,  tb: '우투우타', birth: '2001-12-19', h: 192, w: 105 },
        '한지헌':  { no: 1,   tb: '우투우타', birth: '2004-08-14', h: 185, w: 85 },
        '이도우':  { no: 2,   tb: '우투우타', birth: '2006-05-13', h: 193, w: 96 },
        '김준영':  { no: 3,   tb: '우투우타', birth: '2003-11-18', h: 178, w: 83 },
        '박상후':  { no: 6,   tb: '좌투좌타', birth: '2003-08-05', h: 187, w: 87 },
        '김현재':  { no: 9,   tb: '좌투좌타', birth: '2006-07-03', h: 177, w: 78 },
        '윤성보':  { no: 102, tb: '우투우타', birth: '2002-09-12', h: 180, w: 85 },
        '변건우':  { no: 103, tb: '우투우타', birth: '2005-07-15', h: 181, w: 80 },
        '류현곤':  { no: 104, tb: '우사우타', birth: '2004-11-10', h: 178, w: 78 },
        '조재우':  { no: 105, tb: '우투우타', birth: '2004-03-09', h: 190, w: 99 },
        '신상연':  { no: 108, tb: '우사우타', birth: '2007-02-03', h: 181, w: 74 },
        '김태현':  { no: 109, tb: '좌투좌타', birth: '2007-01-03', h: 184, w: 87 },
        '김재훈':  { no: 110, tb: '우투우타', birth: '2007-03-12', h: 198, w: 108 },
        '이준기':  { no: 112, tb: '우투우타', birth: '2002-05-19', h: 183, w: 84 },
        '이주형':  { no: 113, tb: '우사우타', birth: '2002-12-20', h: 195, w: 104 },
        '김준모':  { no: 114, tb: '우투우타', birth: '2003-08-11', h: 183, w: 85 },
        // 포수
        '이율예':  { no: 0,   tb: '우투우타', birth: '2006-11-21', h: 183, w: 95 },
        '김민식':  { no: 24,  tb: '우투좌타', birth: '1989-06-28', h: 180, w: 80 },
        '신범수':  { no: 25,  tb: '우투좌타', birth: '1998-01-25', h: 177, w: 83 },
        '김규민':  { no: 44,  tb: '우투좌타', birth: '2002-08-23', h: 180, w: 94 },
        '김민범':  { no: 115, tb: '우투우타', birth: '2003-11-04', h: 184, w: 95 },
        // 내야수
        '박명현':  { no: 7,   tb: '우사우타', birth: '2001-06-16', h: 185, w: 80 },
        '김민준':  { no: 47,  tb: '우투우타', birth: '2004-03-20', h: 181, w: 78 },
        '석정우':  { no: 52,  tb: '우투우타', birth: '1999-01-20', h: 180, w: 82 },
        '문상준':  { no: 53,  tb: '우투우타', birth: '2001-03-14', h: 183, w: 80 },
        '최윤석':  { no: 65,  tb: '우투우타', birth: '2006-04-25', h: 188, w: 90 },
        '안재연':  { no: 111, tb: '우투좌타', birth: '2003-04-10', h: 177, w: 80 },
        '김수윤':  { no: 5,   tb: '우투우타', birth: '1998-07-16', h: 180, w: 83 },
        '현원회':  { no: 8,   tb: '우투우타', birth: '2001-07-08', h: 180, w: 90 },
        '김태윤':  { no: 36,  tb: '우투좌타', birth: '2003-02-28', h: 170, w: 65 },
        '김요셉':  { no: 46,  tb: '우투좌타', birth: '2007-05-03', h: 189, w: 80 },
        '박지환':  { no: 93,  tb: '우투우타', birth: '2005-07-12', h: 183, w: 75 },
        '장현진':  { no: 5,   tb: '우투좌타', birth: '2004-05-18', h: 180, w: 84 },
        // 외야수
        '김정민':  { no: 4,   tb: '좌투좌타', birth: '2004-03-07', h: 180, w: 75 },
        '이승민':  { no: 9,   tb: '좌투좌타', birth: '2005-01-06', h: 187, w: 90 },
        '한유섬':  { no: 35,  tb: '우투좌타', birth: '1989-08-09', h: 190, w: 105 },
        '류효승':  { no: 45,  tb: '우투우타', birth: '1996-07-16', h: 190, w: 100 },
        '박정빈':  { no: 58,  tb: '우투우타', birth: '2002-06-14', h: 184, w: 80 },
        '이원준':  { no: 100, tb: '좌투우타', birth: '2006-03-15', h: 181, w: 95 },
        '최준우':  { no: 7,   tb: '우투좌타', birth: '1999-03-25', h: 176, w: 78 },
        '하재훈':  { no: 13,  tb: '우투우타', birth: '1990-10-29', h: 183, w: 87 },
        '이정범':  { no: 33,  tb: '좌투좌타', birth: '1998-04-10', h: 178, w: 88 },
        '장재율':  { no: 49,  tb: '우투우타', birth: '2007-09-12', h: 188, w: 89 },
        '김창평':  { no: 64,  tb: '우투좌타', birth: '2000-06-14', h: 185, w: 85 },
        '박세직':  { no: 101, tb: '좌투좌타', birth: '2004-07-30', h: 182, w: 77 },
        '이승빈':  { no: 106, tb: '우투우타', birth: '2006-11-24', h: 180, w: 75 },
        '오시후':  { no: 107, tb: '좌투좌타', birth: '2007-10-20', h: 185, w: 85 },
    },
    '키움': {
        // ─── 2군 투수 ───
        '박주성':  { no: 0,   tb: '우투우타' },
        '김성민':  { no: 8,   tb: '좌투좌타' },
        '이강준':  { no: 11,  tb: '우투우타' },
        '정현우':  { no: 13,  tb: '좌투좌타' },
        '박준현':  { no: 18,  tb: '우투우타' },
        '김윤하':  { no: 19,  tb: '우투우타' },
        '조영건':  { no: 20,  tb: '우투우타' },
        '박지성':  { no: 37,  tb: '우투우타' },
        '안우진':  { no: 41,  tb: '우투우타' },
        '이준우':  { no: 42,  tb: '우투우타' },
        '정다훈45':{ no: 45,  tb: '우투우타' },
        '원종현':  { no: 46,  tb: '우언우타' },
        '이승호':  { no: 47,  tb: '좌투좌타' },
        '김선기':  { no: 49,  tb: '우투우타' },
        '양지율':  { no: 55,  tb: '우투우타' },
        '김서준':  { no: 59,  tb: '우투좌타' },
        '손현기':  { no: 63,  tb: '좌투좌타' },
        '정세영':  { no: 64,  tb: '좌투좌타' },
        '이태양66':{ no: 66,  tb: '우투우타' },
        '김인범':  { no: 67,  tb: '우투우타' },
        '김연주':  { no: 68,  tb: '우투우타' },
        '임진묵':  { no: 69,  tb: '우투우타' },
        '이명종':  { no: 85,  tb: '우투우타' },
        '백진수':  { no: 91,  tb: '우투우타' },
        '윤현':    { no: 96,  tb: '우투우타' },
        '김동규':  { no: 99,  tb: '우투우타' },
        // ─── 육성 투수 ───
        '손힘찬':  { no: 100, tb: '우투우타' },
        '오혜성':  { no: 106, tb: '우투우타' },
        '정동준':  { no: 107, tb: '우투우타' },
        '이태준':  { no: 109, tb: '우사우타' },
        '한민우':  { no: 110, tb: '좌투좌타' },
        '최현우':  { no: 112, tb: '우투우타' },
        '김태언':  { no: 113, tb: '우투우타' },
        '박준건':  { no: 114, tb: '좌투좌타' },
        '김유빈':  { no: 117, tb: '우투우타' },
        '이승재118':{ no: 118, tb: '우사우타' },
        '김준형':  { no: 119, tb: '우투우타' },
        // ─── 2군 포수 ───
        '김동헌':  { no: 44,  tb: '우투우타' },
        '박성빈':  { no: 56,  tb: '우투우타' },
        '김지성':  { no: 65,  tb: '우투우타' },
        // ─── 육성 포수 ───
        '박준형':  { no: 102, tb: '우투우타' },
        '김리안':  { no: 103, tb: '우투우타' },
        '김주영':  { no: 116, tb: '우투우타' },
        // ─── 2군 내야수 ───
        '이재상':  { no: 5,   tb: '우투우타' },
        '김웅빈':  { no: 10,  tb: '우투좌타' },
        '김병휘':  { no: 23,  tb: '우투우타' },
        '김지석':  { no: 26,  tb: '우투좌타' },
        '염승원':  { no: 39,  tb: '우투좌타' },
        '양현종':  { no: 60,  tb: '우투우타' },
        '송지후':  { no: 86,  tb: '우투우타' },
        '여동욱':  { no: 93,  tb: '우투우타' },
        '전태현':  { no: 97,  tb: '우투좌타' },
        // ─── 육성 내야수 ───
        '권혁빈':  { no: 101, tb: '우투우타' },
        '서유신':  { no: 104, tb: '우투우타' },
        '심휘윤':  { no: 111, tb: '우투우타' },
        '유정택':  { no: 115, tb: '우투좌타' },
        // ─── 2군 외야수 ───
        '이용규':  { no: 15,  tb: '좌투좌타' },
        '임병욱':  { no: 17,  tb: '우투좌타' },
        '주성원':  { no: 25,  tb: '우투우타' },
        '원성준':  { no: 33,  tb: '우투좌타' },
        '박주홍':  { no: 57,  tb: '좌투좌타' },
        '이주형58':{ no: 58,  tb: '좌투좌타' },
        // ─── 육성 외야수 ───
        '박채울':  { no: 108, tb: '우투우타' },
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
        // 투수
        '한차현':  { no: 2,   tb: '우투우타', birth: '2002-04-10', h: 183, w: 85 },
        '임준형':  { no: 14,  tb: '좌투좌타', birth: '2000-11-16', h: 180, w: 82 },
        '권성준':  { no: 15,  tb: '좌투좌타', birth: '2003-08-15', h: 183, w: 82 },
        '최동환':  { no: 16,  tb: '우투우타', birth: '1989-09-19', h: 184, w: 83 },
        '이채호':  { no: 17,  tb: '우언우타', birth: '1998-11-23', h: 185, w: 85 },
        '문용익':  { no: 18,  tb: '우투우타', birth: '1995-02-04', h: 178, w: 93 },
        '배제성':  { no: 19,  tb: '우투좌타', birth: '1996-05-20', h: 185, w: 88 },
        '김태오':  { no: 20,  tb: '좌투좌타', birth: '1997-07-29', h: 183, w: 84 },
        '이정현':  { no: 21,  tb: '우투우타', birth: '1998-06-15', h: 183, w: 85 },
        '이상동':  { no: 37,  tb: '우투우타', birth: '2000-08-20', h: 185, w: 88 },
        '지명성':  { no: 39,  tb: '우투우타', birth: '2002-05-15', h: 183, w: 82 },
        '김동현KT':{ no: 40,  tb: '우투우타', birth: '2006-07-10', h: 185, w: 88 },
        '김재원':  { no: 43,  tb: '우투좌타', birth: '2006-09-20', h: 183, w: 82 },
        '박건우KT':{ no: 46,  tb: '우투우타', birth: '2006-11-28', h: 182, w: 95 },
        '오원석':  { no: 47,  tb: '좌투좌타', birth: '2001-04-15', h: 183, w: 85 },
        '이상우':  { no: 48,  tb: '우투우타', birth: '2003-06-20', h: 185, w: 88 },
        '이현민':  { no: 49,  tb: '우투우타', birth: '2005-09-10', h: 183, w: 82 },
        '조이현':  { no: 54,  tb: '우투좌타', birth: '1995-03-25', h: 183, w: 88 },
        '김정운':  { no: 61,  tb: '우언우타', birth: '2004-04-21', h: 184, w: 84 },
        '원상현':  { no: 63,  tb: '우투우타', birth: '2004-10-16', h: 183, w: 83 },
        '이원재':  { no: 64,  tb: '좌투좌타', birth: '2003-05-07', h: 187, w: 98 },
        '고준혁':  { no: 68,  tb: '좌투좌타', birth: '2007-08-15', h: 183, w: 82 },
        '정정우':  { no: 92,  tb: '우투양타', birth: '2003-10-20', h: 183, w: 85 },
        '한지웅':  { no: 93,  tb: '좌투좌타', birth: '2003-07-07', h: 189, w: 82 },
        '이준명':  { no: 95,  tb: '우투우타', birth: '2004-03-15', h: 185, w: 88 },
        '김건웅':  { no: 98,  tb: '좌투우타', birth: '2004-07-20', h: 183, w: 82 },
        '강건':    { no: 99,  tb: '우투우타', birth: '2004-11-10', h: 185, w: 88 },
        '장민호':  { no: 100, tb: '우투우타', birth: '2006-04-15', h: 183, w: 82 },
        '박준혁KT':{ no: 102, tb: '우투우타', birth: '2006-07-20', h: 185, w: 85 },
        '윤상인':  { no: 107, tb: '우투우타', birth: '2006-10-25', h: 183, w: 82 },
        '정현우':  { no: 111, tb: '우투좌타', birth: '2007-03-15', h: 185, w: 85 },
        '이민준KT':{ no: 112, tb: '좌투좌타', birth: '2007-06-20', h: 183, w: 82 },
        '김휘연':  { no: 113, tb: '우투좌타', birth: '2007-09-10', h: 183, w: 80 },
        '김규한':  { no: 116, tb: '우투우타', birth: '2007-05-15', h: 185, w: 85 },
        '권효준':  { no: 117, tb: '우투우타', birth: '2007-08-20', h: 183, w: 82 },
        '이승언':  { no: 130, tb: '우투우타', birth: '2005-11-15', h: 185, w: 88 },
        // 포수
        '김민석':  { no: 44,  tb: '우투우타', birth: '2005-07-22', h: 181, w: 93 },
        '강현우':  { no: 55,  tb: '우투우타', birth: '2001-03-10', h: 183, w: 85 },
        '이승현KT':{ no: 96,  tb: '우투좌타', birth: '2005-04-15', h: 183, w: 82 },
        '이정환':  { no: 103, tb: '우투우타', birth: '2006-06-20', h: 185, w: 85 },
        '김유빈KT':{ no: 114, tb: '우투우타', birth: '2007-03-10', h: 183, w: 82 },
        '박치성':  { no: 115, tb: '우투우타', birth: '2003-04-26', h: 178, w: 88 },
        // 내야수
        '강민성':  { no: 5,   tb: '우투우타', birth: '1999-12-08', h: 180, w: 85 },
        '문상철':  { no: 24,  tb: '우투우타', birth: '1991-04-06', h: 184, w: 85 },
        '오서진':  { no: 25,  tb: '우투우타', birth: '2005-06-22', h: 188, w: 80 },
        '안인산':  { no: 50,  tb: '우투우타', birth: '2001-02-27', h: 181, w: 95 },
        '손민석':  { no: 57,  tb: '우투좌타', birth: '2004-06-21', h: 177, w: 70 },
        '장준원':  { no: 56,  tb: '우투우타', birth: '1995-08-15', h: 183, w: 85 },
        '임상우':  { no: 94,  tb: '우투좌타', birth: '2003-01-03', h: 180, w: 75 },
        '김건휘':  { no: 97,  tb: '우투우타', birth: '2007-09-11', h: 180, w: 96 },
        '이재원KT':{ no: 105, tb: '우투좌타', birth: '2007-04-10', h: 183, w: 82 },
        '이용현':  { no: 106, tb: '우투좌타', birth: '2006-01-06', h: 188, w: 85 },
        '박성준':  { no: 120, tb: '우투좌타', birth: '2003-07-28', h: 168, w: 71 },
        // 외야수
        '최성민':  { no: 31,  tb: '좌투좌타', birth: '2002-08-15', h: 183, w: 82 },
        '김민혁KT':{ no: 53,  tb: '우투좌타', birth: '1995-05-10', h: 183, w: 85 },
        '신범준':  { no: 62,  tb: '우투좌타', birth: '2002-06-01', h: 189, w: 78 },
        '유준규':  { no: 67,  tb: '우투좌타', birth: '2002-08-16', h: 176, w: 69 },
        '최동희':  { no: 69,  tb: '우투우타', birth: '2003-07-26', h: 184, w: 80 },
        '박민석':  { no: 104, tb: '우투우타', birth: '2006-07-27', h: 178, w: 83 },
        '정영웅':  { no: 108, tb: '좌투좌타', birth: '2006-05-15', h: 183, w: 82 },
        '김경환':  { no: 109, tb: '우투좌타', birth: '2007-01-04', h: 181, w: 78 },
    },
    'NC': {
        // 투수
        '김녹원':  { no: 1,   tb: '우투우타', birth: '2003-01-15', h: 185, w: 85 },
        '정구범':  { no: 8,   tb: '좌투좌타', birth: '2000-06-16', h: 183, w: 73 },
        '신민혁':  { no: 18,  tb: '우투우타', birth: '1999-08-20', h: 185, w: 88 },
        '목지훈':  { no: 20,  tb: '우투우타', birth: '2004-03-15', h: 183, w: 85 },
        '김재열':  { no: 21,  tb: '우투우타', birth: '1996-01-02', h: 183, w: 97 },
        '최성영':  { no: 26,  tb: '좌투좌타', birth: '1997-04-28', h: 180, w: 85 },
        '하준영':  { no: 29,  tb: '좌투좌타', birth: '1999-09-06', h: 182, w: 79 },
        '조민석':  { no: 47,  tb: '우투좌타', birth: '1998-12-21', h: 180, w: 81 },
        '신영우':  { no: 43,  tb: '우투우타', birth: '2004-06-10', h: 185, w: 88 },
        '이재학':  { no: 51,  tb: '우사우타', birth: '1991-09-15', h: 184, w: 90 },
        '박지한':  { no: 56,  tb: '좌투좌타', birth: '2000-10-21', h: 185, w: 90 },
        '전사민':  { no: 57,  tb: '우투우타', birth: '1999-07-06', h: 194, w: 85 },
        '김태경':  { no: 60,  tb: '우투우타', birth: '2001-05-20', h: 183, w: 85 },
        '최우석':  { no: 64,  tb: '우투우타', birth: '2005-03-31', h: 190, w: 90 },
        '최요한':  { no: 67,  tb: '좌투좌타', birth: '2007-06-15', h: 183, w: 80 },
        '이세민':  { no: 68,  tb: '우투우타', birth: '2005-08-08', h: 187, w: 100 },
        '김태훈69':{ no: 69,  tb: '우투우타', birth: '2006-03-10', h: 183, w: 85 },
        '강태경':  { no: 100, tb: '우투우타', birth: '2001-07-26', h: 188, w: 95 },
        '소이현':  { no: 101, tb: '우투우타', birth: '1998-10-15', h: 183, w: 85 },
        '전루건':  { no: 104, tb: '우투우타', birth: '2000-05-20', h: 185, w: 88 },
        '김준원':  { no: 106, tb: '우투우타', birth: '2005-08-20', h: 183, w: 85 },
        '홍재문':  { no: 107, tb: '우투우타', birth: '2006-04-15', h: 185, w: 88 },
        '김태현':  { no: 109, tb: '좌투좌타', birth: '1998-03-21', h: 188, w: 95 },
        '노재원':  { no: 110, tb: '우투우타', birth: '2004-07-20', h: 183, w: 85 },
        '박동수':  { no: 111, tb: '우투우타', birth: '2003-05-10', h: 185, w: 88 },
        '김태우':  { no: 114, tb: '우투우타', birth: '1999-12-15', h: 183, w: 85 },
        '최윤혁':  { no: 131, tb: '좌투좌타', birth: '2006-08-20', h: 183, w: 82 },
        '정주영':  { no: 133, tb: '좌투좌타', birth: '2004-11-05', h: 183, w: 80 },
        '김요엘':  { no: 136, tb: '우사우타', birth: '2007-05-20', h: 183, w: 82 },
        '정튼튼':  { no: 140, tb: '좌투좌타', birth: '2007-09-10', h: 183, w: 80 },
        '윤성환':  { no: 143, tb: '우투우타', birth: '2007-03-15', h: 185, w: 85 },
        '윤서현':  { no: 145, tb: '우투우타', birth: '2007-06-20', h: 183, w: 82 },
        '손민서':  { no: 146, tb: '우투우타', birth: '2007-04-10', h: 185, w: 85 },
        '서동욱':  { no: 150, tb: '우투우타', birth: '2004-09-15', h: 183, w: 85 },
        // 포수
        '안중열':  { no: 22,  tb: '우투우타', birth: '1995-09-01', h: 176, w: 87 },
        '이희성':  { no: 32,  tb: '우투우타', birth: '2007-04-01', h: 185, w: 95 },
        '신민우':  { no: 62,  tb: '우투우타', birth: '2006-05-15', h: 183, w: 85 },
        '박성재':  { no: 102, tb: '우투우타', birth: '2003-08-20', h: 183, w: 88 },
        '김동현NC':{ no: 103, tb: '우투우타', birth: '2006-04-10', h: 185, w: 85 },
        // 내야수
        '오태양':  { no: 6,   tb: '우투우타', birth: '2002-04-25', h: 180, w: 78 },
        '도태훈':  { no: 16,  tb: '우투좌타', birth: '1993-03-18', h: 184, w: 85 },
        '윤준혁':  { no: 31,  tb: '우투우타', birth: '2001-07-26', h: 186, w: 86 },
        '한재환':  { no: 35,  tb: '우투우타', birth: '2001-10-19', h: 177, w: 89 },
        '김건':    { no: 52,  tb: '우투좌타', birth: '2007-05-23', h: 180, w: 81 },
        '홍종표':  { no: 10,  tb: '우투좌타', birth: '2001-06-15', h: 183, w: 82 },
        '박인우':  { no: 112, tb: '우투우타', birth: '2001-12-14', h: 177, w: 80 },
        '박주찬':  { no: 113, tb: '우투우타', birth: '2000-08-20', h: 183, w: 85 },
        '신성호':  { no: 118, tb: '우투우타', birth: '2003-09-28', h: 178, w: 76 },
        '이한':    { no: 122, tb: '우투좌타', birth: '2003-08-25', h: 181, w: 83 },
        '장창훈':  { no: 123, tb: '우투좌타', birth: '2006-05-10', h: 183, w: 80 },
        '유재현':  { no: 125, tb: '우투우타', birth: '2006-08-15', h: 185, w: 82 },
        '조효원':  { no: 129, tb: '우투우타', birth: '2003-11-20', h: 183, w: 85 },
        '김명규':  { no: 144, tb: '우투우타', birth: '2007-07-10', h: 185, w: 82 },
        // 외야수
        '박시원':  { no: 53,  tb: '우투좌타', birth: '2001-05-30', h: 185, w: 85 },
        '이우성':  { no: 55,  tb: '우투우타', birth: '1994-07-17', h: 182, w: 95 },
        '고승완':  { no: 58,  tb: '우투좌타', birth: '2001-03-15', h: 178, w: 81 },
        '오장한':  { no: 65,  tb: '우투좌타', birth: '2002-03-10', h: 183, w: 85 },
        '배상호':  { no: 105, tb: '좌투좌타', birth: '2004-09-15', h: 183, w: 82 },
        '김범준':  { no: 115, tb: '우투우타', birth: '2000-04-20', h: 183, w: 90 },
        '박영빈':  { no: 119, tb: '우투좌타', birth: '2001-06-20', h: 183, w: 82 },
        '양가온솔':{ no: 120, tb: '우투우타', birth: '2006-05-15', h: 185, w: 85 },
        '조창연':  { no: 127, tb: '우투우타', birth: '2006-08-10', h: 183, w: 82 },
        '안지원':  { no: 141, tb: '우투우타', birth: '2007-04-20', h: 185, w: 85 },
    },
    '롯데': {
        // ─── 2군 투수 ───
        '김진욱':  { no: 15,  tb: '좌투좌타', birth: '2002-07-05' },
        '현도훈':  { no: 17,  tb: '우투좌타', birth: '1993-01-13' },
        '정성종':  { no: 18,  tb: '우투좌타', birth: '1995-11-16' },
        '구승민':  { no: 22,  tb: '우투우타', birth: '1990-06-12' },
        '김태혁':  { no: 24,  tb: '우투우타', birth: '1987-12-30' },
        '김영준':  { no: 35,  tb: '우투우타', birth: '1999-01-02' },
        '홍민기':  { no: 38,  tb: '좌투좌타', birth: '2001-07-20' },
        '이영재':  { no: 40,  tb: '좌투좌타', birth: '2006-10-20' },
        '박세진':  { no: 41,  tb: '좌투좌타', birth: '1997-06-27' },
        '나균안':  { no: 43,  tb: '우투우타', birth: '1998-03-16' },
        '박진':    { no: 44,  tb: '우투우타', birth: '1999-04-02' },
        '이진하':  { no: 45,  tb: '우투우타', birth: '2004-06-02' },
        '최이준':  { no: 49,  tb: '우투우타', birth: '1999-04-10' },
        '신동건':  { no: 67,  tb: '우투우타', birth: '2007-10-05' },
        '송재영':  { no: 59,  tb: '좌투좌타', birth: '2002-06-20' },
        '최충연':  { no: 61,  tb: '우투우타', birth: '1997-03-05' },
        '박시영':  { no: 62,  tb: '우투우타', birth: '1989-03-10' },
        '정현수':  { no: 57,  tb: '좌투좌타', birth: '2001-05-10' },
        // ─── 육성 투수 ───
        '이승헌':  { no: 101, tb: '우투우타', birth: '1998-12-19' },
        '정우준':  { no: 103, tb: '우투우타', birth: '2000-03-17' },
        '조영우':  { no: 104, tb: '우투우타', birth: '2006-05-15' },
        '이병준':  { no: 105, tb: '우투우타', birth: '2002-05-28' },
        '김주완':  { no: 106, tb: '좌투좌타', birth: '2003-08-27' },
        '김태균':  { no: 107, tb: '우투우타', birth: '2006-07-31' },
        '정선우':  { no: 115, tb: '좌투좌타', birth: '2002-06-12' },
        '박로건':  { no: 117, tb: '좌투좌타', birth: '2001-08-27' },
        '하혜성':  { no: 118, tb: '우투우타', birth: '2003-06-09' },
        '이태연':  { no: 121, tb: '좌투좌타', birth: '2004-02-21' },
        '김기준':  { no: 125, tb: '우투우타', birth: '2004-04-16' },
        '조경민':  { no: 128, tb: '우사우타', birth: '2004-09-17' },
        '김태현':  { no: 130, tb: '좌투좌타', birth: '2005-11-26' },
        '장세진':  { no: 131, tb: '좌투좌타', birth: '2004-12-30' },
        '김창훈':  { no: 132, tb: '우투우타', birth: '2001-11-09' },
        '석상호':  { no: 133, tb: '우투우타', birth: '2000-04-14' },
        '박세현':  { no: 135, tb: '우투우타', birth: '2006-01-21' },
        '김화중':  { no: 137, tb: '좌투좌타', birth: '2006-02-27' },
        '남해담':  { no: 139, tb: '좌투좌타', birth: '2007-06-05' },
        '김한결':  { no: 140, tb: '우투우타', birth: '2006-07-24' },
        '김현수141':{ no: 141, tb: '우투우타', birth: '2007-09-19' },
        '손준이':  { no: 143, tb: '우투우타', birth: '2004-01-07' },
        // ─── 2군 포수 ───
        '박재엽':  { no: 26,  tb: '우투우타', birth: '2006-01-23' },
        '정문혁':  { no: 32,  tb: '우투우타', birth: '2007-02-24' },
        // ─── 육성 포수 ───
        '김현도':  { no: 109, tb: '우투우타', birth: '2002-04-26' },
        '강승구':  { no: 110, tb: '우투우타', birth: '2003-10-19' },
        '박건우':  { no: 111, tb: '우투우타', birth: '2003-02-01' },
        '이건희':  { no: 120, tb: '우투우타', birth: '2003-03-31' },
        '하준서':  { no: 122, tb: '우투우타', birth: '2004-01-31' },
        '엄장윤':  { no: 123, tb: '우투우타', birth: '2003-10-07' },
        '서하은':  { no: 124, tb: '우투우타', birth: '2004-10-15' },
        // ─── 2군 내야수 ───
        '고승민':  { no: 2,   tb: '우투좌타', birth: '2000-08-11' },
        '김세민':  { no: 5,   tb: '우투우타', birth: '2003-06-14' },
        '최항':    { no: 14,  tb: '우투좌타', birth: '1994-01-03' },
        '나승엽':  { no: 51,  tb: '우투좌타', birth: '2002-02-15' },
        '박찬형':  { no: 60,  tb: '우투좌타', birth: '2002-10-17' },
        '이태경':  { no: 69,  tb: '우투우타', birth: '2002-11-24' },
        // ─── 육성 내야수 ───
        '박지훈':  { no: 108, tb: '우투우타', birth: '2002-05-14' },
        '김호범':  { no: 112, tb: '우투좌타', birth: '2003-08-16' },
        '이정민':  { no: 113, tb: '우투우타', birth: '2003-11-20' },
        '이지훈':  { no: 114, tb: '우투우타', birth: '2003-01-13' },
        '홍서연':  { no: 119, tb: '우투우타', birth: '2003-10-12' },
        '배인혁':  { no: 127, tb: '우투좌타', birth: '2004-01-29' },
        '이로화':  { no: 138, tb: '우투우타', birth: '2006-07-31' },
        // ─── 2군 외야수 ───
        '조세진':  { no: 12,  tb: '우투우타', birth: '2003-11-21' },
        '김동혁':  { no: 50,  tb: '좌투좌타', birth: '2000-09-15' },
        '김동현':  { no: 64,  tb: '우투좌타', birth: '2004-12-30' },
        '김한홀':  { no: 95,  tb: '우투좌타', birth: '2006-12-12' },
        // ─── 육성 외야수 ───
        '김대현':  { no: 100, tb: '우투우타', birth: '2003-11-15' },
        '이인한':  { no: 102, tb: '우투우타', birth: '1998-12-24' },
        '윤수녕':  { no: 126, tb: '우투좌타', birth: '2000-03-01' },
        '박건129': { no: 129, tb: '우투우타', birth: '2002-04-25' },
        '조민영':  { no: 134, tb: '우투우타', birth: '2005-03-24' },
    },
    '삼성': {
        // 투수
        '장찬희':  { no: 60,  tb: '우투우타', birth: '2007-10-05', h: 186, w: 80 },
        '이호성':  { no: 1,   tb: '우투우타', birth: '2004-08-14', h: 184, w: 87 },
        '이재희':  { no: 17,  tb: '우투좌타', birth: '2001-10-11', h: 187, w: 100 },
        '양현':    { no: 19,  tb: '우언우타', birth: '1992-08-23', h: 189, w: 104 },
        '김태훈27':{ no: 27,  tb: '우투우타', birth: '1992-03-02', h: 187, w: 101 },
        '최하늘':  { no: 37,  tb: '우투우타', birth: '1999-03-26', h: 190, w: 99 },
        '양창섭':  { no: 42,  tb: '우투우타', birth: '1999-09-22', h: 182, w: 85 },
        '김대호':  { no: 44,  tb: '우투우타', birth: '2001-10-15', h: 185, w: 100 },
        '이재익':  { no: 45,  tb: '좌투좌타', birth: '1994-03-18', h: 180, w: 76 },
        '김무신':  { no: 48,  tb: '우투우타', birth: '1999-12-08', h: 185, w: 95 },
        '정민성':  { no: 49,  tb: '우투우타', birth: '2005-05-09', h: 184, w: 98 },
        '서현원':  { no: 54,  tb: '우투우타', birth: '2002-02-28', h: 187, w: 93 },
        '홍원표':  { no: 65,  tb: '우투우타', birth: '2001-03-27', h: 183, w: 86 },
        '박용재':  { no: 68,  tb: '우투우타', birth: '2007-03-24', h: 195, w: 105 },
        '허윤동':  { no: 108, tb: '좌투좌타', birth: '2001-06-19', h: 180, w: 90 },
        '김백산':  { no: 113, tb: '우투우타', birth: '2003-10-13', h: 183, w: 86 },
        '김유현':  { no: 119, tb: '우투우타', birth: '2004-02-07', h: 184, w: 93 },
        '김동현':  { no: 123, tb: '우투우타', birth: '2001-05-25', h: 186, w: 95 },
        '홍승원':  { no: 131, tb: '우투우타', birth: '2001-12-06', h: 185, w: 93 },
        '황정현':  { no: 137, tb: '우투우타', birth: '2006-04-28', h: 187, w: 90 },
        '신정환':  { no: 140, tb: '우투우타', birth: '2003-04-28', h: 188, w: 83 },
        '김시온':  { no: 100, tb: '좌투좌타', birth: '2003-10-30', h: 189, w: 89 },
        '박주혁':  { no: 101, tb: '우투우타', birth: '2001-05-18', h: 183, w: 89 },
        '김성경':  { no: 122, tb: '우투우타', birth: '1999-10-01', h: 181, w: 84 },
        // 포수
        '김재성':  { no: 2,   tb: '우투좌타', birth: '1996-10-30', h: 185, w: 85 },
        '박진우':  { no: 12,  tb: '우투우타', birth: '2003-10-14', h: 176, w: 87 },
        '이병헌':  { no: 23,  tb: '우투우타', birth: '1999-10-26', h: 180, w: 87 },
        '김도환':  { no: 24,  tb: '우투우타', birth: '2000-04-14', h: 178, w: 90 },
        '장승현':  { no: 46,  tb: '우투우타', birth: '1994-03-07', h: 184, w: 86 },
        '차동영':  { no: 106, tb: '우투우타', birth: '2002-11-01', h: 181, w: 82 },
        '이서준':  { no: 134, tb: '우투우타', birth: '2007-06-25', h: 185, w: 95 },
        '안민성':  { no: 142, tb: '우투우타', birth: '2003-03-20', h: 184, w: 92 },
        // 내야수
        '김재상':  { no: 14,  tb: '우투좌타', birth: '2004-07-26', h: 180, w: 81 },
        '차승준':  { no: 35,  tb: '우투좌타', birth: '2006-11-20', h: 181, w: 88 },
        '이창용':  { no: 50,  tb: '우투우타', birth: '1999-06-03', h: 184, w: 89 },
        '양우현':  { no: 53,  tb: '우투좌타', birth: '2000-04-13', h: 175, w: 82 },
        '박장민':  { no: 116, tb: '우투우타', birth: '2003-09-02', h: 179, w: 80 },
        '김상준':  { no: 125, tb: '우투좌타', birth: '2002-12-30', h: 176, w: 75 },
        '조민성':  { no: 132, tb: '우투우타', birth: '2003-10-22', h: 180, w: 90 },
        '임주찬':  { no: 135, tb: '우투우타', birth: '2003-10-07', h: 183, w: 83 },
        '이한민':  { no: 143, tb: '우투우타', birth: '2002-06-04', h: 185, w: 87 },
        // 외야수
        '이성규':  { no: 13,  tb: '우투우타', birth: '1993-08-03', h: 178, w: 82 },
        '김재혁':  { no: 8,   tb: '우투우타', birth: '1999-12-26', h: 182, w: 85 },
        '김태훈':  { no: 25,  tb: '우투좌타', birth: '1996-03-31', h: 177, w: 78 },
        '윤정빈':  { no: 31,  tb: '우투좌타', birth: '1999-06-24', h: 182, w: 93 },
        '박승규':  { no: 66,  tb: '우투우타', birth: '2000-09-02', h: 176, w: 80 },
        '류승민':  { no: 43,  tb: '좌투좌타', birth: '2004-10-11', h: 185, w: 90 },
        '강준서':  { no: 105, tb: '우투우타', birth: '2000-10-13', h: 183, w: 85 },
        '김상민':  { no: 107, tb: '우투좌타', birth: '2003-12-06', h: 183, w: 83 },
        '이진용':  { no: 117, tb: '우투좌타', birth: '2006-06-30', h: 183, w: 80 },
        '강민성':  { no: 127, tb: '우투우타', birth: '2006-02-22', h: 183, w: 85 },
        '조세익':  { no: 144, tb: '좌투좌타', birth: '2005-01-07', h: 184, w: 83 },
    },
    'KIA': {
        // ─── 2군 투수 ───
        '곽도규':  { no: 0,   tb: '좌투좌타' },
        '유지성':  { no: 4,   tb: '좌투좌타' },
        '김태형':  { no: 10,  tb: '우투우타' },
        '윤영철':  { no: 13,  tb: '좌투좌타' },
        '김현수17':{ no: 17,  tb: '우투우타' },
        '윤중현':  { no: 19,  tb: '우사우타' },
        '이준영':  { no: 20,  tb: '좌투좌타' },
        '김사윤':  { no: 21,  tb: '좌투좌타' },
        '이형범':  { no: 28,  tb: '우투우타' },
        '장재혁':  { no: 38,  tb: '우투우타' },
        '김건국':  { no: 43,  tb: '우투우타' },
        '이태양':  { no: 44,  tb: '우투우타' },
        '정찬화':  { no: 45,  tb: '우투우타' },
        '김정엽':  { no: 46,  tb: '우투우타' },
        '홍건희':  { no: 52,  tb: '우투우타' },
        '한재승':  { no: 55,  tb: '우투우타' },
        '이성원':  { no: 58,  tb: '우투우타' },
        '김도현60':{ no: 60,  tb: '우투우타' },
        '이호민':  { no: 63,  tb: '우투우타' },
        '김현수64':{ no: 64,  tb: '우투우타' },
        '이도현':  { no: 66,  tb: '우투우타' },
        '김대유':  { no: 69,  tb: '좌투좌타' },
        // ─── 육성 투수 ───
        '강이준':  { no: 102, tb: '우투우타' },
        '장민기':  { no: 106, tb: '좌투좌타' },
        '이승재':  { no: 108, tb: '우투우타' },
        '조건호':  { no: 112, tb: '우투우타' },
        '김세일':  { no: 117, tb: '좌투좌타' },
        '김경묵':  { no: 118, tb: '우투우타' },
        '김상범':  { no: 121, tb: '우투우타' },
        '오규석':  { no: 122, tb: '우투우타' },
        '이호진':  { no: 124, tb: '좌투좌타' },
        '정다훈':  { no: 126, tb: '우투우타' },
        '최건희':  { no: 128, tb: '우투우타' },
        '나연우':  { no: 129, tb: '우투우타' },
        '지현':    { no: 132, tb: '우투우타' },
        '김양수':  { no: 145, tb: '우투우타' },
        '최유찬':  { no: 147, tb: '좌투좌타' },
        '유승철':  { no: 148, tb: '우투양타' },
        // ─── 2군 포수 ───
        '주효상':  { no: 22,  tb: '우투좌타' },
        // ─── 육성 포수 ───
        '권다결':  { no: 103, tb: '우투우타' },
        '김선우':  { no: 116, tb: '우투우타' },
        '이도훈':  { no: 135, tb: '우투우타' },
        '신명승':  { no: 142, tb: '우투우타' },
        // ─── 2군 내야수 ───
        '정해원':  { no: 9,   tb: '우투우타' },
        '최정용':  { no: 23,  tb: '우투좌타' },
        '변우혁':  { no: 29,  tb: '우투우타' },
        '황대인':  { no: 34,  tb: '우투우타' },
        '이호연':  { no: 36,  tb: '우투좌타' },
        '박상준':  { no: 50,  tb: '좌투좌타' },
        // ─── 육성 내야수 ───
        '장시현':  { no: 101, tb: '우투우타' },
        '오정환':  { no: 107, tb: '우투좌타' },
        '김재현':  { no: 110, tb: '우투좌타' },
        '이준범':  { no: 111, tb: '우투우타' },
        '한준희':  { no: 119, tb: '우투우타' },
        '송호정':  { no: 120, tb: '우투우타' },
        '황석민':  { no: 127, tb: '우투우타' },
        '엄준현':  { no: 131, tb: '우투우타' },
        '박종혁':  { no: 133, tb: '우투우타' },
        '차상현':  { no: 134, tb: '우투우타' },
        // ─── 2군 외야수 ───
        '한승연':  { no: 31,  tb: '우투우타' },
        '김석환':  { no: 35,  tb: '좌투좌타' },
        '김민규':  { no: 37,  tb: '우투우타' },
        '고종욱':  { no: 57,  tb: '우투좌타' },
        // ─── 육성 외야수 ───
        '김민수104':{ no: 104, tb: '우투좌타' },
        '이영재':  { no: 109, tb: '우투우타' },
        '박헌':    { no: 113, tb: '좌투좌타' },
        '천정민':  { no: 136, tb: '좌투좌타' },
        '곽동효':  { no: 138, tb: '우투우타' },
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
        ],
    },
    'NC': {
        P: [
            { name: '이용준', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            { name: '송명기', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            { name: '이준호', no: null, tb: '우투우타', discharge: '2026-07-16', type: '사회복무요원' },
            { name: '홍유원', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '김민균', no: null, tb: '좌투좌타', discharge: null, type: '현역' },
            { name: '김휘건', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '김민규', no: null, tb: '우사우타', discharge: '2027-06-14', type: '상무' },
            { name: '임상현', no: null, tb: '우투우타', discharge: null, type: '현역' },
        ],
        C: [
            { name: '신용석', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '김재민', no: null, tb: '우투우타', discharge: null, type: '현역' },
        ],
        IF: [
            { name: '조현진', no: null, tb: '우투좌타', discharge: null, type: '현역' },
            { name: '조현민', no: null, tb: '우투좌타', discharge: null, type: '현역' },
            { name: '서준교', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '김세훈', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
        ],
        OF: [
            { name: '박한결', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
        ],
    },
    'KT': {
        P: [
            { name: '정진호', no: null, tb: '우언우타', discharge: null, type: '현역' },
            { name: '김민성', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '한승주', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            { name: '최윤서', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '이근혁', no: null, tb: '우투좌타', discharge: null, type: '현역' },
            { name: '육청명', no: null, tb: '우투우타', discharge: '2027-05-06', type: '사회복무요원' },
        ],
        C: [
            { name: '이준희', no: null, tb: '우투우타', discharge: null, type: '현역' },
        ],
        IF: [
            { name: '박태완', no: null, tb: '우투우타', discharge: '2026-12-29', type: '현역' },
        ],
        OF: [
            { name: '정준영', no: null, tb: '좌투좌타', discharge: '2026-06-01', type: '상무' },
            { name: '황의준', no: null, tb: '우투좌타', discharge: null, type: '현역' },
            { name: '신호준', no: null, tb: '우투우타', discharge: '2026-11-11', type: '현역' },
            { name: '김병준', no: null, tb: '우투좌타', discharge: '2027-06-14', type: '상무' },
        ],
    },
    '한화': {
        P: [
            { name: '남지민', no: null, tb: '우투우타', discharge: '2026-06-29', type: '사회복무요원' },
            { name: '성지훈', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '김규연', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '승지환', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '박상현', no: null, tb: '우투우타', discharge: '2026-12-08', type: '현역' },
            { name: '김기중', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
        ],
        C: [
            { name: '이승현', no: null, tb: '우투우타', discharge: null, type: '현역' },
        ],
        IF: [
            { name: '이민준', no: null, tb: '우투우타', discharge: '2026-05-17', type: '현역' },
            { name: '정은원', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
        ],
        OF: [
            { name: '권현', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '정안석', no: null, tb: '우투우타', discharge: '2026-11-26', type: '현역' },
            { name: '최준서', no: null, tb: '우투우타', discharge: '2027-04-27', type: '현역' },
        ],
    },
    '삼성': {
        P: [
            { name: '박권후', no: null, tb: '우투우타', discharge: '2026-05-25', type: '현역' },
            { name: '홍무원', no: null, tb: '우투우타', discharge: '2026-05-25', type: '현역' },
            { name: '박시원', no: null, tb: '우투우타', discharge: '2026-05-25', type: '현역' },
            { name: '유병선', no: null, tb: '우투우타', discharge: '2027-01-21', type: '현역' },
            { name: '신경민', no: null, tb: '우투우타', discharge: '2027-06-03', type: '현역' },
            { name: '박준용', no: null, tb: '우투우타', discharge: '2027-05-23', type: '현역' },
            { name: '황동재', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
        ],
        C: [],
        IF: [
            { name: '김호진', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '이현준', no: null, tb: '우투우타', discharge: '2026-12-31', type: '현역' },
            { name: '양도근', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
        ],
        OF: [
            { name: '김현준', no: null, tb: '좌투좌타', discharge: '2026-06-01', type: '상무' },
        ],
    },
    'SSG': {
        P: [
            { name: '신헌민', no: null, tb: '우투우타', discharge: '2026-11-11', type: '현역' },
            { name: '안현서', no: null, tb: '좌투좌타', discharge: '2027-04-12', type: '현역' },
            { name: '최현석', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
            { name: '박성빈', no: null, tb: '우투우타', discharge: null, type: '현역' },
            { name: '이승훈', no: null, tb: '우투우타', discharge: null, type: '현역' },
        ],
        C: [],
        IF: [
            { name: '전의산', no: null, tb: '우투좌타', discharge: '2026-06-01', type: '상무' },
            { name: '허진', no: null, tb: '우투좌타', discharge: '2027-01-27', type: '현역' },
        ],
        OF: [
            { name: '정현승', no: null, tb: '좌투좌타', discharge: null, type: '현역' },
            { name: '백준서', no: null, tb: '우투우타', discharge: '2026-12-22', type: '현역' },
        ],
    },
    '롯데': {
        P: [
            { name: '전하원', no: null, tb: '우투좌타', discharge: '2026-05-17', type: '현역' },
            { name: '박성준', no: null, tb: '좌투좌타', discharge: '2026-06-01', type: '현역' },
            { name: '전미르', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '진승현', no: null, tb: '우투좌타', discharge: '2026-11-11', type: '상무' },
            { name: '김현우', no: null, tb: '우투우타', discharge: '2027-04-27', type: '현역' },
        ],
        C: [
            { name: '서동욱', no: null, tb: '우투우타', discharge: '2026-12-22', type: '현역' },
        ],
        IF: [
            { name: '정대선', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            // 안우진: 군보류 아님 → 부상(INJURED_ROSTERS)으로 이동
            { name: '강성우', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '최민규', no: null, tb: '우투우타', discharge: '2027-01-27', type: '현역' },
        ],
        OF: [
            { name: '유제모', no: null, tb: '우투좌타', discharge: '2026-04-03', type: '사회복무요원' },
            { name: '소한빈', no: null, tb: '우투우타', discharge: '2026-06-22', type: '현역' },
            { name: '이선우', no: null, tb: '우투우타', discharge: '2026-07-20', type: '현역' },
            { name: '한승현', no: null, tb: '우투우타', discharge: '2027-08-22', type: '현역' },
        ],
    },
    'KIA': {
        P: [
            { name: '이송찬', no: null, tb: '우투우타', discharge: '2026-05-03', type: '현역' },
            { name: '김태윤', no: null, tb: '우투우타', discharge: '2026-05-10', type: '현역' },
            { name: '최지웅', no: null, tb: '우투우타', discharge: '2026-05-24', type: '현역' },
            { name: '강효종', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            { name: '김찬민', no: null, tb: '우언우타', discharge: '2026-06-02', type: '현역' },
            { name: '김민재', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '조대현', no: null, tb: '우투우타', discharge: '2027-03-15', type: '현역' },
            { name: '강동훈', no: null, tb: '우투우타', discharge: '2027-04-19', type: '현역' },
            { name: '임다온', no: null, tb: '우투우타', discharge: '2027-06-22', type: '현역' },
            { name: '김민주', no: null, tb: '우사우타', discharge: '2027-06-29', type: '현역' },
        ],
        C: [
            { name: '이상준', no: null, tb: '우투우타', discharge: '2027-03-15', type: '현역' },
        ],
        IF: [
            { name: '김두현', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '강민제', no: null, tb: '우투우타', discharge: '2027-05-03', type: '현역' },
        ],
        OF: [],
    },
    '키움': {
        P: [
            { name: '주승빈', no: null, tb: '좌투좌타', discharge: '2026-05-03', type: '현역' },
            { name: '김동욱', no: null, tb: '우투우타', discharge: '2026-04-27', type: '현역' },
            { name: '김동혁', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            { name: '이종민', no: null, tb: '좌투좌타', discharge: '2026-11-11', type: '상무' },
            { name: '박범준', no: null, tb: '우투좌타', discharge: '2027-03-14', type: '현역' },
            { name: '주승우', no: null, tb: '우투우타', discharge: '2027-05-02', type: '현역' },
        ],
        C: [
            { name: '김시앙', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
        ],
        IF: [
            { name: '이승원', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '장재영', no: null, tb: '우투우타', discharge: '2026-11-11', type: '상무' },
            { name: '고영우', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
        ],
        OF: [],
    },
    '두산': {
        P: [
            { name: '백승우', no: null, tb: '좌투좌타', discharge: '2026-05-06', type: '사회복무요원' },
            { name: '김동주', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            { name: '김영현', no: null, tb: '우투우타', discharge: '2026-06-01', type: '상무' },
            { name: '김무빈', no: null, tb: '좌투좌타', discharge: '2027-01-20', type: '현역' },
            { name: '김태완', no: null, tb: '우투우타', discharge: '2027-03-14', type: '현역' },
            { name: '박지호', no: null, tb: '좌투좌타', discharge: '2027-06-14', type: '상무' },
        ],
        C: [],
        IF: [
            { name: '임서준', no: null, tb: '우투좌타', discharge: '2026-05-24', type: '현역' },
            { name: '여동건', no: null, tb: '우투우타', discharge: '2027-06-14', type: '상무' },
        ],
        OF: [
            { name: '강태완', no: null, tb: '좌투좌타', discharge: '2026-05-24', type: '현역' },
            { name: '손율기', no: null, tb: '우투좌타', discharge: '2027-03-14', type: '현역' },
            { name: '이상혁', no: null, tb: '우투좌타', discharge: '2027-06-14', type: '상무' },
        ],
    },
};

// ─── 부상 선수 (시즌 중 등록 불가) ───
const INJURED_ROSTERS = {
    'SSG': {
        P: [
            { name: '김광현', no: 29, tb: '좌투좌타', injury: '어깨 수술', recovery: '2027 시즌', birth: '1988-07-22', h: 188, w: 88 },
        ],
        C: [], IF: [], OF: [],
    },
    '키움': {
        P: [
            { name: '안우진', no: 41, tb: '우투우타', injury: '어깨 부상', recovery: '2026-04-30', birth: '1999-09-26', h: 185, w: 88, salary: 4.8,
              pitches: [{name:'포심',pct:30,velo:154},{name:'슬라이더',pct:25,velo:139},{name:'커터',pct:20,velo:141},{name:'체인지업',pct:15,velo:135},{name:'커브',pct:10,velo:127}] },
        ],
        C: [], IF: [], OF: [],
    },
    '롯데': {
        P: [], C: [],
        IF: [
            { name: '고승민', no: 2, tb: '우투좌타', injury: '도박 징계 72경기', recovery: '시즌 중반', birth: '2000-08-11' },
            { name: '김세민', no: 5, tb: '우투우타', injury: '도박 징계 72경기', recovery: '시즌 중반', birth: '2003-06-14' },
            { name: '나승엽', no: 51, tb: '우투좌타', injury: '도박 징계 72경기', recovery: '시즌 중반', birth: '2002-02-15' },
        ],
        OF: [
            { name: '김동혁', no: 50, tb: '좌투좌타', injury: '도박 징계 72경기', recovery: '시즌 중반', birth: '2000-09-15' },
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
        '카메론':  { no: 24, tb: '우투우타', birth: '1997-01-15', h: 183, w: 83 },
        '김동준':  { no: 11, tb: '좌투좌타', birth: '2002-09-03', h: 193, w: 100 },
        '정수빈':  { no: 31, tb: '좌투좌타', birth: '1990-10-07', h: 178, w: 72 },
        '김인태':  { no: 33, tb: '좌투좌타', birth: '1994-07-03', h: 178, w: 78 },
        '홍성호':  { no: 34, tb: '우투좌타', birth: '1997-07-15', h: 183, w: 95 },
        '조수행':  { no: 51, tb: '우투좌타', birth: '1993-08-30', h: 178, w: 73 },
    },
    '롯데': {
        // 투수
        '한현희':    { no: 1,  tb: '우사우타', birth: '1993-06-25', h: 183, w: 86 },
        '김강현':    { no: 19, tb: '우투좌타', birth: '1995-02-27', h: 177, w: 84 },
        '박세웅':    { no: 21, tb: '우투우타', birth: '1995-11-30', h: 182, w: 85 },
        '비슬리':    { no: 23, tb: '우투우타', birth: '1995-11-20', h: 188, w: 106 },
        '로드리게스': { no: 31, tb: '우투우타', birth: '1998-03-31', h: 193, w: 97 },
        '김원중':    { no: 34, tb: '우투좌타', birth: '1993-06-14', h: 192, w: 96 },
        '박정민':    { no: 36, tb: '우투우타', birth: '2003-09-26', h: 188, w: 95 },
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
        '정보근':    { no: 42, tb: '우투우타', birth: '1999-08-31', h: 184, w: 88 },
        // 내야수
        '전민재':    { no: 13, tb: '우투우타', birth: '1999-06-30', h: 181, w: 73 },
        '김민성':    { no: 16, tb: '우투우타', birth: '1988-12-17', h: 181, w: 94 },
        '한동희':    { no: 25, tb: '우투우타', birth: '1999-06-01', h: 185, w: 90 },
        '이호준':    { no: 30, tb: '우투좌타', birth: '2004-03-20', h: 172, w: 72 },
        '노진혁':    { no: 52, tb: '우투좌타', birth: '1989-07-15', h: 184, w: 80 },
        '박승욱':    { no: 53, tb: '우투좌타', birth: '1992-12-04', h: 184, w: 83 },
        '한태양':    { no: 6,  tb: '우투우타', birth: '2003-09-05', h: 181, w: 76 },
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
        '미야지':    { no: 15, tb: '우투좌타', birth: '1999-08-02', h: 186, w: 90 },
        '최원태':    { no: 20, tb: '우투우타', birth: '1997-01-07', h: 184, w: 104 },
        '원태인':    { no: 18, tb: '우투좌타', birth: '2000-04-06', h: 183, w: 92 },
        '이승현':    { no: 26, tb: '우투우타', birth: '1991-11-20', h: 181, w: 92 },
        '이승민':    { no: 28, tb: '좌투좌타', birth: '2000-08-26', h: 174, w: 79 },
        '백정현':    { no: 29, tb: '좌투좌타', birth: '1987-07-13', h: 184, w: 80 },
        '임기영':    { no: 38, tb: '우사우타', birth: '1993-04-16', h: 184, w: 86 },
        '육선엽':    { no: 4,  tb: '우투우타', birth: '2005-07-13', h: 190, w: 90 },
        '배찬승':    { no: 55, tb: '좌투좌타', birth: '2006-01-01', h: 180, w: 85 },
        '김재윤':    { no: 62, tb: '우투우타', birth: '1990-09-16', h: 185, w: 91 },
        '오러클린':  { no: 64, tb: '좌투좌타', birth: '2000-03-14', h: 196, w: 101 },
        '후라도':    { no: 75, tb: '우투우타', birth: '1996-01-30', h: 187, w: 109 },
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
        '최형우':    { no: 34, tb: '우투좌타', birth: '1984-01-18', h: 180, w: 106 },
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
        '서건창':    { no: 14, tb: '우투좌타', birth: '1989-08-22', h: 180, w: 78 },
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
        '류현진':    { no: 99, tb: '좌투우타', birth: '1987-03-25', h: 191, w: 113 },
        '문동주':    { no: 1,  tb: '우투우타', birth: '2003-12-23', h: 188, w: 92 },
        '에르난데스':{ no: 12, tb: '우투우타', birth: '1999-04-13', h: 190, w: 88 },
        '왕옌청':    { no: 19, tb: '좌투좌타', birth: '2001-02-14', h: 180, w: 82 },
        '화이트':    { no: 24, tb: '우투우타', birth: '1999-08-09', h: 190, w: 90 },
        '김서현':    { no: 44, tb: '우투우타', birth: '2004-05-31', h: 188, w: 91 },
        '황준서':    { no: 29, tb: '좌투좌타', birth: '2005-08-22', h: 187, w: 71 },
        '엄상백':    { no: 11, tb: '우사좌타', birth: '1996-10-04', h: 191, w: 89 },
        '윤산흠':    { no: 49, tb: '우투우타', birth: '1999-05-15', h: 178, w: 74 },
        '강재민':    { no: 55, tb: '우사우타', birth: '1998-04-03', h: 180, w: 89 },
        '김종수':    { no: 38, tb: '우투우타', birth: '1994-06-03', h: 180, w: 80 },
        '조동욱':    { no: 57, tb: '좌투좌타', birth: '2004-11-02', h: 194, w: 91 },
        '정우주':    { no: 61, tb: '우투우타', birth: '2006-11-07', h: 185, w: 88 },
        '박준영':    { no: 96, tb: '우투우타', birth: '2003-03-02', h: 190, w: 103 },
        // 포수
        '최재훈':    { no: 13, tb: '우투우타', birth: '1989-08-27', h: 178, w: 80 },
        '허인서':    { no: 59, tb: '우투우타', birth: '2003-07-11', h: 184, w: 90 },
        // 내야수
        '하주석':    { no: 16, tb: '우투좌타', birth: '1994-02-25', h: 184, w: 81 },
        '채은성':    { no: 22, tb: '우투우타', birth: '1990-01-06', h: 186, w: 92 },
        '이도윤':    { no: 5,  tb: '우투좌타', birth: '1996-10-07', h: 173, w: 71 },
        '강백호':    { no: 50, tb: '우투좌타', birth: '1998-07-29', h: 180, w: 98 },
        '심우준':    { no: 7,  tb: '우투우타', birth: '1995-04-28', h: 183, w: 74 },
        '노시환':    { no: 8,  tb: '우투우타', birth: '2000-12-03', h: 185, w: 96 },
        // 외야수
        '이진영':    { no: 10, tb: '우투우타', birth: '1997-07-21', h: 183, w: 82 },
        '김태연':    { no: 25, tb: '우투우타', birth: '1997-06-10', h: 178, w: 100 },
        '페라자':    { no: 30, tb: '우투우타', birth: '1998-11-10', h: 175, w: 88 },
        '손아섭':    { no: 31, tb: '우투좌타', birth: '1988-03-18', h: 174, w: 84 },
        '최인호':    { no: 41, tb: '우투좌타', birth: '2000-01-30', h: 178, w: 88 },
        '문현빈':    { no: 51, tb: '우투좌타', birth: '2004-04-20', h: 173, w: 77 },
        '오재원':    { no: 54, tb: '우투좌타', birth: '2007-01-21', h: 177, w: 76 },
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
        '홍민규':    { no: 67, tb: '우투우타', birth: '2006-09-11', h: 183, w: 87 },
        '양현종':    { no: 54, tb: '좌투좌타', birth: '1988-03-01', h: 183, w: 90 },
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
        '고영표':    { no: 1,  tb: '우언우타', birth: '1991-11-29', h: 185, w: 90 },
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
        '라일리':    { no: 3,  tb: '우투우타', birth: '1997-01-15', h: 190, w: 95 },
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
        '베니지아노':{ no: 41, tb: '좌투좌타', birth: '1997-09-01', h: 196, w: 92 },
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
        '김재환':    { no: 32, tb: '우투좌타', birth: '1988-09-22', h: 183, w: 98 },
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

// ─── 멀티포지션 데이터 (위키 기반) ───
// 선수명 → 소화 가능 포지션 배열 (첫 번째가 주포지션)
const MULTI_POSITIONS = {
    // 두산 내야
    '임종성': ['3B','2B','1B'],
    '박성재': ['1B'],
    '오명진': ['2B','SS','3B','1B'],
    '박찬호': ['SS'],
    '김민혁': ['1B','3B'],
    '김동준': ['1B','LF'],
    '이유찬': ['SS','2B','3B','LF','CF','RF'],
    '박계범': ['2B','3B','SS','1B'],
    '강승호': ['2B','3B','1B'],
    '박지훈': ['1B','SS','3B','2B','LF','CF','RF'],
    '박준순': ['2B','3B'],
    '양석환': ['1B'],
    '안재석': ['SS','3B','2B','1B'],
    '신민철': ['SS'],
    '지강혁': ['SS'],
    '이선우': ['SS'],
    '한다현': ['SS'],
    '김준상': ['2B'],
    '심건보': ['SS'],
    '남태웅': ['SS'],
    '임현철': ['SS'],
    // 두산 외야
    '김민석': ['LF','1B','CF'],
    '전다민': ['LF','CF'],
    '카메론': ['RF'],
    '정수빈': ['CF'],
    '김대한': ['RF','CF'],
    '김인태': ['LF','RF'],
    '홍성호': ['RF','1B'],
    '신우열': ['RF'],
    '조수행': ['CF','RF','LF'],
    '천현재': ['CF'],
    '김주오': ['RF'],
    '주양준': ['RF'],
    '엄지민': ['LF'],
    // LG 내야 (위키 참고)
    '문보경': ['3B','1B'],
    '신민재': ['2B','CF'],
    '김주성': ['SS','3B'],
    '구본혁': ['2B','3B','SS'],
    '이영빈': ['SS'],
    '오지환': ['SS'],
    '오스틴': ['1B'],
    '천성호': ['2B'],
    '송찬의': ['2B','1B'],
    // LG 외야
    '최원영': ['LF','CF','RF'],
    '문성주': ['LF','DH'],
    '박해민': ['CF'],
    '홍창기': ['RF'],
    '이재원': ['LF','1B'],
    // SSG 내야
    '안상현': ['2B','SS','3B'],
    '최정':   ['3B','1B'],
    '고명준': ['1B','3B'],
    '박성한': ['SS','2B'],
    '정준재': ['2B','SS'],
    '김성현': ['2B','SS','3B'],
    '홍대인': ['2B','SS'],
    // SSG 외야
    '채현우': ['LF','RF'],
    '에레디아':['LF'],
    '김성욱': ['LF','CF','RF'],
    '김재환': ['LF','DH'],
    '오태곤': ['LF','CF','RF','1B'],
    '최지훈': ['CF','RF','LF'],
    '임근우': ['LF','RF'],
    // 한화 내야
    '하주석': ['1B','3B'],
    '채은성': ['1B','3B','2B'],
    '이도윤': ['3B','SS','2B'],
    '강백호': ['1B','DH'],
    '심우준': ['1B','3B'],
    '노시환': ['3B','1B'],
    // 한화 외야
    '이진영': ['LF','CF','RF'],
    '김태연': ['CF','RF'],
    '페라자': ['RF','LF'],
    '손아섭': ['LF','DH'],
    '최인호': ['CF','RF','LF'],
    '문현빈': ['CF','RF','LF'],
    '오재원': ['CF','RF','LF'],
    // KT 내야
    '허경민': ['1B','2B','3B'],
    '오윤석': ['SS','2B','3B'],
    '권동진': ['SS','2B'],
    '이강민': ['SS','2B'],
    '김상수': ['SS','2B'],
    '류현인': ['SS','2B','3B'],
    // KT 외야
    '힐리어드':['LF','CF','RF'],
    '김현수': ['LF','DH'],
    '안현민': ['CF','RF'],
    '배정대': ['CF','RF','LF'],
    '최원준': ['CF','LF','RF'],
    '이정훈': ['LF','RF'],
    '장진혁': ['RF','LF'],
    '안치영': ['LF','CF','RF'],
    '김민혁KT':['CF','LF','RF'],
    // NC 내야
    '김한별': ['SS','2B'],
    '최정원': ['2B','CF'],
    '박민우': ['2B'],
    '데이비슨':['1B'],
    '오영수': ['1B'],
    '허윤':   ['SS','2B'],
    '김휘집': ['SS','3B'],
    '서호철': ['2B','3B'],
    '김주원': ['SS','2B'],
    '신재인': ['SS','2B'],
    // NC 외야
    '천재환': ['3B','CF','LF','RF'],
    '권희동': ['LF','CF','RF'],
    '박건우': ['CF','RF'],
    // 삼성 내야
    '디아즈': ['1B'],
    '류지혁': ['2B','1B','3B'],
    '이해승': ['SS','2B','3B'],
    '김영웅': ['SS','2B','3B'],
    '심재훈': ['2B'],
    '전병우': ['3B','1B','2B'],
    '이재현': ['SS'],
    // 삼성 외야
    '김헌곤': ['CF','LF','RF'],
    '최형우': ['LF'],
    '김성윤': ['RF','LF','CF'],
    '함수호': ['LF','RF'],
    '구자욱': ['LF','RF'],
    '홍현빈': ['CF','LF','RF'],
    '김지찬': ['CF'],
};

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
        speed:   clamp2080(32 + sbSeason * 1.0),
        defense: clamp2080(50 + dwarSeason * 10),
    };
}

function calcBatterOVR(r) {
    return Math.round(r.contact * 0.20 + r.power * 0.25 + r.eye * 0.20 + r.speed * 0.15 + r.defense * 0.20);
}

// 투수 20-80 스케일 변환 (엄격 기준: 80=역대급, 70=올스타, 60=평균 이상)
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

    // 구위 (Stuff): K/9 기반, KBO 평균 6.8, SD 2.0 (더 넓은 분포)
    const stuff = clamp2080(50 + (K9 - 6.8) / 2.0 * 10);

    // 제구 (Command): BB/9 역방향, KBO 평균 3.3, SD 1.0
    const command = clamp2080(50 + (3.3 - BB9) / 1.0 * 10);

    // 체력 (Stamina): IP 기반 (선발 200이닝=80, 불펜 80이닝=80)
    let stamina;
    if (isStarter) {
        stamina = clamp2080(20 + IP / 200 * 60);
    } else {
        stamina = clamp2080(20 + IP / 80 * 60);
    }

    // 효율 (Effectiveness): ERA 역방향, KBO 평균 4.30, SD 1.20 (더 엄격)
    const effectiveness = clamp2080(50 + (4.30 - ERA) / 1.20 * 10);

    // 안정 (Consistency): WHIP 역방향, KBO 평균 1.38, SD 0.25 (더 엄격)
    const consistency = clamp2080(50 + (1.38 - WHIP) / 0.25 * 10);

    return { stuff, command, stamina, effectiveness, consistency };
}

function calcPitcherOVR(r) {
    return Math.round(r.stuff * 0.20 + r.command * 0.20 + r.stamina * 0.10 + r.effectiveness * 0.35 + r.consistency * 0.15);
}

// 2군 선수 랜덤 레이팅 생성 (실제 기록 없는 경우)
// 나이/등번호/포지션에 따라 차등 적용
// isDev: 육성선수 여부 (등번호 100+), age: 나이
function genFuturesBatterRatings(rng, age, isDev) {
    // 육성선수는 캡 55, 일반 2군은 65
    const cap = isDev ? 55 : 65;
    // 나이에 따른 기본 능력치 보정 (젊을수록 편차 크고, 나이 많으면 안정)
    const ageBonus = age ? Math.max(-5, Math.min(5, 27 - age)) : 0;
    const baseMean = isDev ? 30 : 38;
    const sd = isDev ? 10 : 9;
    return {
        contact: clamp2080(Math.min(cap, gaussianRandom(rng, baseMean + ageBonus, sd))),
        power:   clamp2080(Math.min(cap, gaussianRandom(rng, baseMean - 3 + ageBonus, sd))),
        eye:     clamp2080(Math.min(cap, gaussianRandom(rng, baseMean - 4 + ageBonus * 0.5, sd))),
        speed:   clamp2080(Math.min(cap, gaussianRandom(rng, baseMean + ageBonus * 1.5, sd + 3))),
        defense: clamp2080(Math.min(cap, gaussianRandom(rng, baseMean + 2, sd))),
    };
}
function genFuturesPitcherRatings(rng, age, isDev) {
    const cap = isDev ? 55 : 65;
    const ageBonus = age ? Math.max(-5, Math.min(5, 27 - age)) : 0;
    const baseMean = isDev ? 28 : 35;
    const sd = isDev ? 10 : 9;
    return {
        stuff:         clamp2080(Math.min(cap, gaussianRandom(rng, baseMean + ageBonus, sd))),
        command:       clamp2080(Math.min(cap, gaussianRandom(rng, baseMean + ageBonus * 0.5, sd))),
        stamina:       clamp2080(Math.min(cap, gaussianRandom(rng, baseMean - 2, sd))),
        effectiveness: clamp2080(Math.min(cap, gaussianRandom(rng, baseMean - 2 + ageBonus, sd))),
        consistency:   clamp2080(Math.min(cap, gaussianRandom(rng, baseMean - 3 + ageBonus * 0.5, sd))),
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
                subPositions: MULTI_POSITIONS[name] || ['C'],
            };
            teamRoster.push(id);
        }

        // ── 내야수 ──
        for (let i = 0; i < roster.IF.length; i++) {
            const raw = roster.IF[i];
            const isForeign = raw.endsWith('*');
            const name = isForeign ? raw.slice(0, -1) : raw;
            const id = `b_${String(playerId++).padStart(3, '0')}`;
            const multiPos = MULTI_POSITIONS[name];
            const pos = multiPos ? multiPos[0] : IF_POSITIONS[i % IF_POSITIONS.length];
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
                subPositions: multiPos || [pos],
            };
            teamRoster.push(id);
        }

        // ── 외야수 ──
        for (let i = 0; i < roster.OF.length; i++) {
            const raw = roster.OF[i];
            const isForeign = raw.endsWith('*');
            const name = isForeign ? raw.slice(0, -1) : raw;
            const id = `b_${String(playerId++).padStart(3, '0')}`;
            const multiPos = MULTI_POSITIONS[name];
            const pos = multiPos ? multiPos[0] : OF_POSITIONS[i % OF_POSITIONS.length];
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
                subPositions: multiPos || [pos],
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
                    // _overrideStamina: 부상 시즌 등 체력 수동 보정
                    if (real._overrideStamina) p.ratings.stamina = real._overrideStamina;
                    // _overrides: 개별 레이팅 수동 보정 (투수/타자 공통)
                    if (real._overrides) {
                        for (const [k, v] of Object.entries(real._overrides)) {
                            if (p.ratings[k] != null) p.ratings[k] = Math.max(p.ratings[k], v);
                        }
                    }
                    p.ovr = calcPitcherOVR(p.ratings);
                } else if (real && p.position !== 'P') {
                    // 타자 실제 스탯 적용
                    p.realStats = { ...real };
                    if (real.pos) p.position = real.pos;
                    p.stats['wRC+'] = real['wRC+'];
                    p.stats.OPS = real.OPS;
                    p.stats.WAR = real.WAR;
                    if (real.salary) p.salary = real.salary;
                    // _ratings 명시: 신인/특수 선수 수동 산정
                    if (real._ratings) {
                        p.ratings = { ...real._ratings };
                        p.ovr = calcBatterOVR(p.ratings);
                        continue;
                    }
                    // 표본 크기 보정: PA < 400이면 리그 평균(50)으로 회귀
                    p.ratings = calcBatterRatings(real);
                    const pa = real.PA || 400;
                    const sampleWeight = Math.min(pa / 400, 1.0);
                    if (sampleWeight < 1.0) {
                        for (const key of Object.keys(p.ratings)) {
                            p.ratings[key] = Math.round(p.ratings[key] * sampleWeight + 50 * (1 - sampleWeight));
                        }
                    }
                    // _minSpeed: 스피드 하한 보정 (도루 적지만 실제 주력 있는 선수)
                    if (real._minSpeed && p.ratings.speed < real._minSpeed) {
                        p.ratings.speed = real._minSpeed;
                    }
                    // _overrides: 개별 레이팅 수동 보정
                    if (real._overrides) {
                        for (const [k, v] of Object.entries(real._overrides)) {
                            if (p.ratings[k] != null) p.ratings[k] = Math.max(p.ratings[k], v);
                        }
                    }
                    p.ovr = calcBatterOVR(p.ratings);
                }
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
                // 2군: 가짜 전통 스탯 생성하지 않음 (OVR만 랜덤 부여)
                const detail = getPlayerDetail(code, name);
                const salary = detail ? futuresSalary(rng, 0, detail.birth) : ROOKIE_MIN_SALARY;
                players[id] = {
                    id, name, team: code, position: 'P', role,
                    salary, isForeign, isFranchiseStar: false,
                    stats: null, powerScore: null,
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
                const detail = getPlayerDetail(code, name);
                const salary = detail ? futuresSalary(rng, 0, detail.birth) : ROOKIE_MIN_SALARY;
                players[id] = {
                    id, name, team: code, position: 'C', role: null,
                    salary, isForeign, isFranchiseStar: false,
                    stats: null, powerScore: null,
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
                const detail = getPlayerDetail(code, name);
                const salary = detail ? futuresSalary(rng, 0, detail.birth) : ROOKIE_MIN_SALARY;
                players[id] = {
                    id, name, team: code, position: pos, role: null,
                    salary, isForeign, isFranchiseStar: false,
                    stats: null, powerScore: null,
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
                const detail = getPlayerDetail(code, name);
                const salary = detail ? futuresSalary(rng, 0, detail.birth) : ROOKIE_MIN_SALARY;
                players[id] = {
                    id, name, team: code, position: pos, role: null,
                    salary, isForeign, isFranchiseStar: false,
                    stats: null, powerScore: null,
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
                    p.stats = { ...real };
                    if (real.role) p.role = real.role;
                    if (real.salary) p.salary = real.salary;
                    p.ratings = calcPitcherRatings(real);
                    if ((real.IP || 0) < 20) {
                        for (const k of Object.keys(p.ratings)) p.ratings[k] = Math.min(65, p.ratings[k]);
                    }
                    p.ovr = calcPitcherOVR(p.ratings);
                } else if (real && p.position !== 'P') {
                    if (real.pos) p.position = real.pos;
                    if (real.salary) p.salary = real.salary;
                    // _ratings 명시: 퓨처스 기반 수동 산정
                    if (real._ratings) {
                        p.ratings = { ...real._ratings };
                        p.ovr = calcBatterOVR(p.ratings);
                    // 실제 타격 기록이 있는 경우만 스탯 기반 산정 (PA >= 10)
                    } else if ((real.PA || 0) >= 30) {
                        p.realStats = { ...real };
                        p.stats = { ...real };
                        p.ratings = calcBatterRatings(real);
                        if ((real.PA || 0) < 50) {
                            for (const k of Object.keys(p.ratings)) p.ratings[k] = Math.min(65, p.ratings[k]);
                        }
                        p.ovr = calcBatterOVR(p.ratings);
                    }
                    // PA < 10 or no stats → ratings 미설정 → 2군 랜덤 생성으로
                }
            }
        }

        // ── 2군: 명시적 ratings가 있으면 우선 적용, 없으면 랜덤 ──
        for (const fid of futuresRoster) {
            const p = players[fid];
            // 명시적 _ratings가 데이터에 있으면 사용 (퓨처스리그 기반 수동 산정)
            const fReal = REAL_SEASON_STATS[code] && REAL_SEASON_STATS[code][p.name];
            if (!p.ratings && fReal && fReal._ratings) {
                p.ratings = { ...fReal._ratings };
                p.ovr = p.position === 'P' ? calcPitcherOVR(p.ratings) : calcBatterOVR(p.ratings);
            }
            if (!p.ratings) {
                const isDev = (p.number || 0) >= 100;
                const age = p.age || null;
                if (p.position === 'P') {
                    p.ratings = genFuturesPitcherRatings(rng, age, isDev);
                    p.ovr = calcPitcherOVR(p.ratings);
                } else {
                    p.ratings = genFuturesBatterRatings(rng, age, isDev);
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
                        players[id].ratings = genFuturesPitcherRatings(rng, null, false);
                        players[id].ovr = calcPitcherOVR(players[id].ratings);
                    } else {
                        players[id].ratings = genFuturesBatterRatings(rng, null, false);
                        players[id].ovr = calcBatterOVR(players[id].ratings);
                    }
                    militaryRoster.push(id);
                }
            }
        }

        // ── 부상 선수 생성 ──
        const injuredRoster = [];
        const injData = INJURED_ROSTERS[code];
        if (injData) {
            for (const posKey of ['P', 'C', 'IF', 'OF']) {
                for (const ip of (injData[posKey] || [])) {
                    const id = `inj_${String(playerId++).padStart(3, '0')}`;
                    const isPitcher = posKey === 'P';
                    const pos = isPitcher ? 'P' : (posKey === 'C' ? 'C' : posKey === 'IF' ? '2B' : 'LF');
                    const stats = isPitcher
                        ? genPitcherStats(rng, weakness.pitchMod)
                        : genBatterStats(rng, weakness.batMod, code);
                    players[id] = {
                        id, name: ip.name, team: code,
                        position: pos,
                        role: isPitcher ? '선발' : null,
                        salary: ip.salary || 0.5, isForeign: false, isFranchiseStar: false,
                        stats, powerScore: null,
                        number: ip.no,
                        throwBat: ip.tb,
                        birth: ip.birth || null,
                        age: ip.birth ? calcAge(ip.birth) : null,
                        height: ip.h || null,
                        weight: ip.w || null,
                        isFutures: true, isInjured: true,
                        injuryType: ip.injury,
                        injuryRecovery: ip.recovery,
                    };
                    if (ip.pitches) players[id].pitches = ip.pitches;
                    // 부상/징계 선수도 REAL_SEASON_STATS에서 기록 적용
                    const injReal = teamRealStats && teamRealStats[ip.name];
                    if (injReal && injReal.pos === 'P') {
                        players[id].realStats = { ...injReal };
                        if (injReal.role) players[id].role = injReal.role;
                        if (injReal.salary) players[id].salary = injReal.salary;
                        players[id].ratings = calcPitcherRatings(injReal);
                        if (injReal._overrideStamina) players[id].ratings.stamina = injReal._overrideStamina;
                        if (injReal._overrides) {
                            for (const [k, v] of Object.entries(injReal._overrides)) {
                                if (players[id].ratings[k] != null) players[id].ratings[k] = Math.max(players[id].ratings[k], v);
                            }
                        }
                        players[id].ovr = calcPitcherOVR(players[id].ratings);
                    } else if (injReal && !isPitcher) {
                        players[id].realStats = { ...injReal };
                        if (injReal.pos) players[id].position = injReal.pos;
                        if (injReal.salary) players[id].salary = injReal.salary;
                        if (injReal._ratings) {
                            players[id].ratings = { ...injReal._ratings };
                        } else {
                            players[id].ratings = calcBatterRatings(injReal);
                            const pa = injReal.PA || 400;
                            const sw = Math.min(pa / 400, 1.0);
                            if (sw < 1.0) {
                                for (const key of Object.keys(players[id].ratings)) {
                                    players[id].ratings[key] = Math.round(players[id].ratings[key] * sw + 50 * (1 - sw));
                                }
                            }
                        }
                        if (injReal._minSpeed && players[id].ratings.speed < injReal._minSpeed) {
                            players[id].ratings.speed = injReal._minSpeed;
                        }
                        if (injReal._overrides) {
                            for (const [k, v] of Object.entries(injReal._overrides)) {
                                if (players[id].ratings[k] != null) players[id].ratings[k] = Math.max(players[id].ratings[k], v);
                            }
                        }
                        players[id].ovr = calcBatterOVR(players[id].ratings);
                    } else {
                        const injAge = ip.birth ? calcAge(ip.birth) : null;
                        if (isPitcher) {
                            players[id].ratings = genFuturesPitcherRatings(rng, injAge, false);
                            players[id].ovr = calcPitcherOVR(players[id].ratings);
                        } else {
                            players[id].ratings = genFuturesBatterRatings(rng, injAge, false);
                            players[id].ovr = calcBatterOVR(players[id].ratings);
                        }
                    }
                    injuredRoster.push(id);
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
            injuredRoster,
            seasonRecord: {
                q1: { wins: 0, losses: 0 },
                q2: { wins: 0, losses: 0 },
                q3: { wins: 0, losses: 0 },
                q4: { wins: 0, losses: 0 },
            },
            tradeHistory: [],
        };
    }

    // ── 특수 선수 OVR/레이팅 오버라이드 (군보류/부상으로 데이터 부족한 스타급) ──
    const PLAYER_OVERRIDES = {
        // 안우진 (키움, 군보류): 2022-2023 초에이스 시즌 기반
        // 2022: 196IP, ERA 2.11, FIP 2.09, WAR 7.77 / 2023: 150.2IP, ERA 2.39, FIP 2.91, WAR 5.94
        // 통산 ERA 3.17, K/9 9.65, CSW% 29.5, 포심 153km+
        '안우진': {
            ratings: { stuff: 72, command: 62, stamina: 68, effectiveness: 70, consistency: 65 },
            role: '선발',
        },
    };
    for (const [pName, override] of Object.entries(PLAYER_OVERRIDES)) {
        const p = Object.values(players).find(pl => pl.name === pName);
        if (p) {
            if (override.ratings) {
                p.ratings = override.ratings;
                if (p.position === 'P') p.ovr = calcPitcherOVR(p.ratings);
                else p.ovr = calcBatterOVR(p.ratings);
            }
            if (override.role) p.role = override.role;
        }
    }

    return { teams, players, tradeHistory: [], news: [] };
}

window.KBO_TEAMS = KBO_TEAMS;
window.KBO_SALARY_CAP = KBO_SALARY_CAP;
window.KBO_SALARY_FLOOR = KBO_SALARY_FLOOR;
window.REAL_ROSTERS = REAL_ROSTERS;
window.MILITARY_ROSTERS = MILITARY_ROSTERS;
window.INJURED_ROSTERS = INJURED_ROSTERS;
window.generateSampleData = generateSampleData;

// ─── 2026 KBO 정규시즌 경기 일정 ───
const KBO_SCHEDULE_2026 = [
    {d:'2026-03-28',g:[{h:'KT',a:'LG',t:'14:00',s:'잠실'},{h:'KIA',a:'SSG',t:'14:00',s:'문학'},{h:'롯데',a:'삼성',t:'14:00',s:'대구'},{h:'두산',a:'NC',t:'14:00',s:'창원'},{h:'키움',a:'한화',t:'14:00',s:'대전'}]},
    {d:'2026-03-29',g:[{h:'KT',a:'LG',t:'14:00',s:'잠실'},{h:'KIA',a:'SSG',t:'14:00',s:'문학'},{h:'롯데',a:'삼성',t:'14:00',s:'대구'},{h:'두산',a:'NC',t:'14:00',s:'창원'},{h:'키움',a:'한화',t:'14:00',s:'대전'}]},
    {d:'2026-03-31',g:[{h:'KIA',a:'LG',t:'18:30',s:'잠실'},{h:'키움',a:'SSG',t:'18:30',s:'문학'},{h:'두산',a:'삼성',t:'18:30',s:'대구'},{h:'롯데',a:'NC',t:'18:30',s:'창원'},{h:'KT',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-01',g:[{h:'KIA',a:'LG',t:'18:30',s:'잠실'},{h:'키움',a:'SSG',t:'18:30',s:'문학'},{h:'두산',a:'삼성',t:'18:30',s:'대구'},{h:'롯데',a:'NC',t:'18:30',s:'창원'},{h:'KT',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-02',g:[{h:'KIA',a:'LG',t:'18:30',s:'잠실'},{h:'키움',a:'SSG',t:'18:30',s:'문학'},{h:'두산',a:'삼성',t:'18:30',s:'대구'},{h:'롯데',a:'NC',t:'18:30',s:'창원'},{h:'KT',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-03',g:[{h:'한화',a:'두산',t:'18:30',s:'잠실'},{h:'SSG',a:'롯데',t:'18:30',s:'사직'},{h:'삼성',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-04-04',g:[{h:'한화',a:'두산',t:'14:00',s:'잠실'},{h:'SSG',a:'롯데',t:'17:00',s:'사직'},{h:'삼성',a:'KT',t:'17:00',s:'수원'},{h:'NC',a:'KIA',t:'17:00',s:'광주'},{h:'LG',a:'키움',t:'17:00',s:'고척'}]},
    {d:'2026-04-05',g:[{h:'한화',a:'두산',t:'14:00',s:'잠실'},{h:'SSG',a:'롯데',t:'14:00',s:'사직'},{h:'삼성',a:'KT',t:'14:00',s:'수원'},{h:'NC',a:'KIA',t:'14:00',s:'광주'},{h:'LG',a:'키움',t:'14:00',s:'고척'}]},
    {d:'2026-04-07',g:[{h:'키움',a:'두산',t:'18:30',s:'잠실'},{h:'한화',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'NC',t:'18:30',s:'창원'},{h:'삼성',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-04-08',g:[{h:'키움',a:'두산',t:'18:30',s:'잠실'},{h:'한화',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'NC',t:'18:30',s:'창원'},{h:'삼성',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-04-09',g:[{h:'키움',a:'두산',t:'18:30',s:'잠실'},{h:'한화',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'NC',t:'18:30',s:'창원'},{h:'삼성',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-04-10',g:[{h:'SSG',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'삼성',t:'18:30',s:'대구'},{h:'두산',a:'KT',t:'18:30',s:'수원'},{h:'롯데',a:'키움',t:'18:30',s:'고척'},{h:'KIA',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-11',g:[{h:'KIA',a:'한화',t:'14:00',s:'대전'},{h:'SSG',a:'LG',t:'17:00',s:'잠실'},{h:'NC',a:'삼성',t:'17:00',s:'대구'},{h:'두산',a:'KT',t:'17:00',s:'수원'},{h:'롯데',a:'키움',t:'17:00',s:'고척'}]},
    {d:'2026-04-12',g:[{h:'SSG',a:'LG',t:'14:00',s:'잠실'},{h:'NC',a:'삼성',t:'14:00',s:'대구'},{h:'두산',a:'KT',t:'14:00',s:'수원'},{h:'롯데',a:'키움',t:'14:00',s:'고척'},{h:'KIA',a:'한화',t:'14:00',s:'대전'}]},
    {d:'2026-04-14',g:[{h:'롯데',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'키움',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-15',g:[{h:'롯데',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'키움',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-16',g:[{h:'롯데',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'키움',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-17',g:[{h:'KIA',a:'두산',t:'18:30',s:'잠실'},{h:'한화',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'삼성',t:'18:30',s:'대구'},{h:'SSG',a:'NC',t:'18:30',s:'창원'},{h:'키움',a:'KT',t:'18:30',s:'수원'}]},
    {d:'2026-04-18',g:[{h:'LG',a:'삼성',t:'14:00',s:'대구'},{h:'KIA',a:'두산',t:'17:00',s:'잠실'},{h:'한화',a:'롯데',t:'17:00',s:'사직'},{h:'SSG',a:'NC',t:'17:00',s:'창원'},{h:'키움',a:'KT',t:'17:00',s:'수원'}]},
    {d:'2026-04-19',g:[{h:'KIA',a:'두산',t:'14:00',s:'잠실'},{h:'한화',a:'롯데',t:'14:00',s:'사직'},{h:'LG',a:'삼성',t:'14:00',s:'대구'},{h:'SSG',a:'NC',t:'14:00',s:'창원'},{h:'키움',a:'KT',t:'14:00',s:'수원'}]},
    {d:'2026-04-21',g:[{h:'한화',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'삼성',t:'18:30',s:'대구'},{h:'KIA',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-04-22',g:[{h:'한화',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'삼성',t:'18:30',s:'대구'},{h:'KIA',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-04-23',g:[{h:'한화',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'삼성',t:'18:30',s:'대구'},{h:'KIA',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-04-24',g:[{h:'LG',a:'두산',t:'18:30',s:'잠실'},{h:'KT',a:'SSG',t:'18:30',s:'문학'},{h:'롯데',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'키움',t:'18:30',s:'고척'},{h:'NC',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-25',g:[{h:'LG',a:'두산',t:'17:00',s:'잠실'},{h:'KT',a:'SSG',t:'17:00',s:'문학'},{h:'롯데',a:'KIA',t:'17:00',s:'광주'},{h:'삼성',a:'키움',t:'17:00',s:'고척'},{h:'NC',a:'한화',t:'17:00',s:'대전'}]},
    {d:'2026-04-26',g:[{h:'LG',a:'두산',t:'14:00',s:'잠실'},{h:'KT',a:'SSG',t:'14:00',s:'문학'},{h:'롯데',a:'KIA',t:'14:00',s:'광주'},{h:'삼성',a:'키움',t:'14:00',s:'고척'},{h:'NC',a:'한화',t:'14:00',s:'대전'}]},
    {d:'2026-04-28',g:[{h:'삼성',a:'두산',t:'18:30',s:'잠실'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'KIA',a:'NC',t:'18:30',s:'창원'},{h:'LG',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-29',g:[{h:'삼성',a:'두산',t:'18:30',s:'잠실'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'KIA',a:'NC',t:'18:30',s:'창원'},{h:'LG',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-04-30',g:[{h:'삼성',a:'두산',t:'18:30',s:'잠실'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'KIA',a:'NC',t:'18:30',s:'창원'},{h:'LG',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-05-01',g:[{h:'NC',a:'LG',t:'18:30',s:'잠실'},{h:'롯데',a:'SSG',t:'18:30',s:'문학'},{h:'한화',a:'삼성',t:'18:30',s:'대구'},{h:'KT',a:'KIA',t:'18:30',s:'광주'},{h:'두산',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-05-02',g:[{h:'NC',a:'LG',t:'17:00',s:'잠실'},{h:'롯데',a:'SSG',t:'17:00',s:'문학'},{h:'한화',a:'삼성',t:'17:00',s:'대구'},{h:'KT',a:'KIA',t:'17:00',s:'광주'},{h:'두산',a:'키움',t:'17:00',s:'고척'}]},
    {d:'2026-05-03',g:[{h:'NC',a:'LG',t:'14:00',s:'잠실'},{h:'롯데',a:'SSG',t:'14:00',s:'문학'},{h:'한화',a:'삼성',t:'14:00',s:'대구'},{h:'KT',a:'KIA',t:'14:00',s:'광주'},{h:'두산',a:'키움',t:'14:00',s:'고척'}]},
    {d:'2026-05-05',g:[{h:'두산',a:'LG',t:'14:00',s:'잠실'},{h:'NC',a:'SSG',t:'14:00',s:'문학'},{h:'키움',a:'삼성',t:'14:00',s:'대구'},{h:'롯데',a:'KT',t:'14:00',s:'수원'},{h:'한화',a:'KIA',t:'14:00',s:'광주'}]},
    {d:'2026-05-06',g:[{h:'두산',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'삼성',t:'18:30',s:'대구'},{h:'롯데',a:'KT',t:'18:30',s:'수원'},{h:'한화',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-05-07',g:[{h:'두산',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'삼성',t:'18:30',s:'대구'},{h:'롯데',a:'KT',t:'18:30',s:'수원'},{h:'한화',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-05-08',g:[{h:'SSG',a:'두산',t:'18:30',s:'잠실'},{h:'KIA',a:'롯데',t:'18:30',s:'사직'},{h:'삼성',a:'NC',t:'18:30',s:'창원'},{h:'KT',a:'키움',t:'18:30',s:'고척'},{h:'LG',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-05-09',g:[{h:'SSG',a:'두산',t:'17:00',s:'잠실'},{h:'KIA',a:'롯데',t:'17:00',s:'사직'},{h:'삼성',a:'NC',t:'17:00',s:'창원'},{h:'KT',a:'키움',t:'17:00',s:'고척'},{h:'LG',a:'한화',t:'17:00',s:'대전'}]},
    {d:'2026-05-10',g:[{h:'SSG',a:'두산',t:'14:00',s:'잠실'},{h:'KIA',a:'롯데',t:'14:00',s:'사직'},{h:'삼성',a:'NC',t:'14:00',s:'창원'},{h:'KT',a:'키움',t:'14:00',s:'고척'},{h:'LG',a:'한화',t:'14:00',s:'대전'}]},
    {d:'2026-05-12',g:[{h:'삼성',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'KT',t:'18:30',s:'수원'},{h:'두산',a:'KIA',t:'18:30',s:'광주'},{h:'한화',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-05-13',g:[{h:'삼성',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'KT',t:'18:30',s:'수원'},{h:'두산',a:'KIA',t:'18:30',s:'광주'},{h:'한화',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-05-14',g:[{h:'삼성',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'KT',t:'18:30',s:'수원'},{h:'두산',a:'KIA',t:'18:30',s:'광주'},{h:'한화',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-05-15',g:[{h:'롯데',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'SSG',t:'18:30',s:'문학'},{h:'KIA',a:'삼성',t:'18:30',s:'대구'},{h:'키움',a:'NC',t:'18:30',s:'창원'},{h:'한화',a:'KT',t:'18:30',s:'수원'}]},
    {d:'2026-05-16',g:[{h:'롯데',a:'두산',t:'17:00',s:'잠실'},{h:'LG',a:'SSG',t:'17:00',s:'문학'},{h:'KIA',a:'삼성',t:'17:00',s:'대구'},{h:'키움',a:'NC',t:'17:00',s:'창원'},{h:'한화',a:'KT',t:'17:00',s:'수원'}]},
    {d:'2026-05-17',g:[{h:'롯데',a:'두산',t:'14:00',s:'잠실'},{h:'LG',a:'SSG',t:'14:00',s:'문학'},{h:'KIA',a:'삼성',t:'14:00',s:'대구'},{h:'키움',a:'NC',t:'14:00',s:'창원'},{h:'한화',a:'KT',t:'14:00',s:'수원'}]},
    {d:'2026-05-19',g:[{h:'NC',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'KIA',t:'18:30',s:'광주'},{h:'SSG',a:'키움',t:'18:30',s:'고척'},{h:'롯데',a:'한화',t:'18:30',s:'대전'},{h:'KT',a:'삼성',t:'18:30',s:'포항'}]},
    {d:'2026-05-20',g:[{h:'NC',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'KIA',t:'18:30',s:'광주'},{h:'SSG',a:'키움',t:'18:30',s:'고척'},{h:'롯데',a:'한화',t:'18:30',s:'대전'},{h:'KT',a:'삼성',t:'18:30',s:'포항'}]},
    {d:'2026-05-21',g:[{h:'NC',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'KIA',t:'18:30',s:'광주'},{h:'SSG',a:'키움',t:'18:30',s:'고척'},{h:'롯데',a:'한화',t:'18:30',s:'대전'},{h:'KT',a:'삼성',t:'18:30',s:'포항'}]},
    {d:'2026-05-22',g:[{h:'키움',a:'LG',t:'18:30',s:'잠실'},{h:'삼성',a:'롯데',t:'18:30',s:'사직'},{h:'NC',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'KIA',t:'18:30',s:'광주'},{h:'두산',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-05-23',g:[{h:'키움',a:'LG',t:'17:00',s:'잠실'},{h:'삼성',a:'롯데',t:'17:00',s:'사직'},{h:'NC',a:'KT',t:'17:00',s:'수원'},{h:'SSG',a:'KIA',t:'17:00',s:'광주'},{h:'두산',a:'한화',t:'17:00',s:'대전'}]},
    {d:'2026-05-24',g:[{h:'키움',a:'LG',t:'14:00',s:'잠실'},{h:'삼성',a:'롯데',t:'14:00',s:'사직'},{h:'NC',a:'KT',t:'14:00',s:'수원'},{h:'SSG',a:'KIA',t:'14:00',s:'광주'},{h:'두산',a:'한화',t:'14:00',s:'대전'}]},
    {d:'2026-05-26',g:[{h:'KT',a:'두산',t:'18:30',s:'잠실'},{h:'삼성',a:'SSG',t:'18:30',s:'문학'},{h:'LG',a:'롯데',t:'18:30',s:'사직'},{h:'한화',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-05-27',g:[{h:'KT',a:'두산',t:'18:30',s:'잠실'},{h:'삼성',a:'SSG',t:'18:30',s:'문학'},{h:'LG',a:'롯데',t:'18:30',s:'사직'},{h:'한화',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-05-28',g:[{h:'KT',a:'두산',t:'18:30',s:'잠실'},{h:'삼성',a:'SSG',t:'18:30',s:'문학'},{h:'LG',a:'롯데',t:'18:30',s:'사직'},{h:'한화',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-05-29',g:[{h:'KIA',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'삼성',t:'18:30',s:'대구'},{h:'롯데',a:'NC',t:'18:30',s:'창원'},{h:'KT',a:'키움',t:'18:30',s:'고척'},{h:'SSG',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-05-30',g:[{h:'KIA',a:'LG',t:'17:00',s:'잠실'},{h:'두산',a:'삼성',t:'17:00',s:'대구'},{h:'롯데',a:'NC',t:'17:00',s:'창원'},{h:'KT',a:'키움',t:'17:00',s:'고척'},{h:'SSG',a:'한화',t:'17:00',s:'대전'}]},
    {d:'2026-05-31',g:[{h:'KIA',a:'LG',t:'14:00',s:'잠실'},{h:'두산',a:'삼성',t:'14:00',s:'대구'},{h:'롯데',a:'NC',t:'14:00',s:'창원'},{h:'KT',a:'키움',t:'14:00',s:'고척'},{h:'SSG',a:'한화',t:'14:00',s:'대전'}]},
    {d:'2026-06-02',g:[{h:'한화',a:'두산',t:'18:30',s:'잠실'},{h:'키움',a:'SSG',t:'18:30',s:'문학'},{h:'NC',a:'삼성',t:'18:30',s:'대구'},{h:'LG',a:'KT',t:'18:30',s:'수원'},{h:'롯데',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-06-03',g:[{h:'한화',a:'두산',t:'17:00',s:'잠실'},{h:'키움',a:'SSG',t:'17:00',s:'문학'},{h:'NC',a:'삼성',t:'17:00',s:'대구'},{h:'LG',a:'KT',t:'17:00',s:'수원'},{h:'롯데',a:'KIA',t:'17:00',s:'광주'}]},
    {d:'2026-06-04',g:[{h:'한화',a:'두산',t:'18:30',s:'잠실'},{h:'키움',a:'SSG',t:'18:30',s:'문학'},{h:'NC',a:'삼성',t:'18:30',s:'대구'},{h:'LG',a:'KT',t:'18:30',s:'수원'},{h:'롯데',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-06-05',g:[{h:'키움',a:'두산',t:'18:30',s:'잠실'},{h:'KT',a:'SSG',t:'18:30',s:'문학'},{h:'한화',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'NC',t:'18:30',s:'창원'},{h:'삼성',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-06-06',g:[{h:'키움',a:'두산',t:'17:00',s:'잠실'},{h:'KT',a:'SSG',t:'17:00',s:'문학'},{h:'한화',a:'롯데',t:'17:00',s:'사직'},{h:'LG',a:'NC',t:'17:00',s:'창원'},{h:'삼성',a:'KIA',t:'17:00',s:'광주'}]},
    {d:'2026-06-07',g:[{h:'키움',a:'두산',t:'17:00',s:'잠실'},{h:'KT',a:'SSG',t:'17:00',s:'문학'},{h:'한화',a:'롯데',t:'17:00',s:'사직'},{h:'LG',a:'NC',t:'17:00',s:'창원'},{h:'삼성',a:'KIA',t:'17:00',s:'광주'}]},
    {d:'2026-06-09',g:[{h:'SSG',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'롯데',t:'18:30',s:'사직'},{h:'삼성',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'키움',t:'18:30',s:'고척'},{h:'KIA',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-06-10',g:[{h:'SSG',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'롯데',t:'18:30',s:'사직'},{h:'삼성',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'키움',t:'18:30',s:'고척'},{h:'KIA',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-06-11',g:[{h:'SSG',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'롯데',t:'18:30',s:'사직'},{h:'삼성',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'키움',t:'18:30',s:'고척'},{h:'KIA',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-06-12',g:[{h:'롯데',a:'LG',t:'18:30',s:'잠실'},{h:'SSG',a:'삼성',t:'18:30',s:'대구'},{h:'NC',a:'KT',t:'18:30',s:'수원'},{h:'두산',a:'KIA',t:'18:30',s:'광주'},{h:'한화',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-06-13',g:[{h:'롯데',a:'LG',t:'17:00',s:'잠실'},{h:'SSG',a:'삼성',t:'17:00',s:'대구'},{h:'NC',a:'KT',t:'17:00',s:'수원'},{h:'두산',a:'KIA',t:'17:00',s:'광주'},{h:'한화',a:'키움',t:'17:00',s:'고척'}]},
    {d:'2026-06-14',g:[{h:'한화',a:'키움',t:'14:00',s:'고척'},{h:'롯데',a:'LG',t:'17:00',s:'잠실'},{h:'SSG',a:'삼성',t:'17:00',s:'대구'},{h:'NC',a:'KT',t:'17:00',s:'수원'},{h:'두산',a:'KIA',t:'17:00',s:'광주'}]},
    {d:'2026-06-16',g:[{h:'KT',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'삼성',t:'18:30',s:'대구'},{h:'한화',a:'NC',t:'18:30',s:'창원'},{h:'LG',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-06-17',g:[{h:'KT',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'삼성',t:'18:30',s:'대구'},{h:'한화',a:'NC',t:'18:30',s:'창원'},{h:'LG',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-06-18',g:[{h:'KT',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'삼성',t:'18:30',s:'대구'},{h:'한화',a:'NC',t:'18:30',s:'창원'},{h:'LG',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-06-19',g:[{h:'두산',a:'LG',t:'18:30',s:'잠실'},{h:'SSG',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'KT',t:'18:30',s:'수원'},{h:'롯데',a:'키움',t:'18:30',s:'고척'},{h:'삼성',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-06-20',g:[{h:'두산',a:'LG',t:'17:00',s:'잠실'},{h:'SSG',a:'NC',t:'17:00',s:'창원'},{h:'KIA',a:'KT',t:'17:00',s:'수원'},{h:'롯데',a:'키움',t:'17:00',s:'고척'},{h:'삼성',a:'한화',t:'17:00',s:'대전'}]},
    {d:'2026-06-21',g:[{h:'롯데',a:'키움',t:'14:00',s:'고척'},{h:'두산',a:'LG',t:'17:00',s:'잠실'},{h:'SSG',a:'NC',t:'17:00',s:'창원'},{h:'KIA',a:'KT',t:'17:00',s:'수원'},{h:'삼성',a:'한화',t:'17:00',s:'대전'}]},
    {d:'2026-06-23',g:[{h:'삼성',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'KT',t:'18:30',s:'수원'},{h:'KIA',a:'키움',t:'18:30',s:'고척'},{h:'두산',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-06-24',g:[{h:'삼성',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'KT',t:'18:30',s:'수원'},{h:'KIA',a:'키움',t:'18:30',s:'고척'},{h:'두산',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-06-25',g:[{h:'삼성',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'KT',t:'18:30',s:'수원'},{h:'KIA',a:'키움',t:'18:30',s:'고척'},{h:'두산',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-06-26',g:[{h:'KIA',a:'두산',t:'18:30',s:'잠실'},{h:'한화',a:'SSG',t:'18:30',s:'문학'},{h:'LG',a:'롯데',t:'18:30',s:'사직'},{h:'KT',a:'삼성',t:'18:30',s:'대구'},{h:'키움',a:'NC',t:'18:30',s:'창원'}]},
    {d:'2026-06-27',g:[{h:'KIA',a:'두산',t:'17:00',s:'잠실'},{h:'한화',a:'SSG',t:'17:00',s:'문학'},{h:'LG',a:'롯데',t:'17:00',s:'사직'},{h:'KT',a:'삼성',t:'17:00',s:'대구'},{h:'키움',a:'NC',t:'17:00',s:'창원'}]},
    {d:'2026-06-28',g:[{h:'KIA',a:'두산',t:'17:00',s:'잠실'},{h:'한화',a:'SSG',t:'17:00',s:'문학'},{h:'LG',a:'롯데',t:'17:00',s:'사직'},{h:'KT',a:'삼성',t:'17:00',s:'대구'},{h:'키움',a:'NC',t:'17:00',s:'창원'}]},
    {d:'2026-06-30',g:[{h:'롯데',a:'두산',t:'18:30',s:'잠실'},{h:'삼성',a:'NC',t:'18:30',s:'창원'},{h:'SSG',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'키움',t:'18:30',s:'고척'},{h:'KT',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-01',g:[{h:'롯데',a:'두산',t:'18:30',s:'잠실'},{h:'삼성',a:'NC',t:'18:30',s:'창원'},{h:'SSG',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'키움',t:'18:30',s:'고척'},{h:'KT',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-02',g:[{h:'롯데',a:'두산',t:'18:30',s:'잠실'},{h:'삼성',a:'NC',t:'18:30',s:'창원'},{h:'SSG',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'키움',t:'18:30',s:'고척'},{h:'KT',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-03',g:[{h:'한화',a:'LG',t:'18:30',s:'잠실'},{h:'삼성',a:'SSG',t:'18:30',s:'문학'},{h:'롯데',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'KIA',t:'18:30',s:'광주'},{h:'두산',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-07-04',g:[{h:'한화',a:'LG',t:'18:00',s:'잠실'},{h:'삼성',a:'SSG',t:'18:00',s:'문학'},{h:'롯데',a:'KT',t:'18:00',s:'수원'},{h:'NC',a:'KIA',t:'18:00',s:'광주'},{h:'두산',a:'키움',t:'18:00',s:'고척'}]},
    {d:'2026-07-05',g:[{h:'두산',a:'키움',t:'14:00',s:'고척'},{h:'한화',a:'LG',t:'18:00',s:'잠실'},{h:'삼성',a:'SSG',t:'18:00',s:'문학'},{h:'롯데',a:'KT',t:'18:00',s:'수원'},{h:'NC',a:'KIA',t:'18:00',s:'광주'}]},
    {d:'2026-07-07',g:[{h:'SSG',a:'두산',t:'18:30',s:'잠실'},{h:'KIA',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'삼성',t:'18:30',s:'대구'},{h:'키움',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-08',g:[{h:'SSG',a:'두산',t:'18:30',s:'잠실'},{h:'KIA',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'삼성',t:'18:30',s:'대구'},{h:'키움',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-09',g:[{h:'SSG',a:'두산',t:'18:30',s:'잠실'},{h:'KIA',a:'롯데',t:'18:30',s:'사직'},{h:'LG',a:'삼성',t:'18:30',s:'대구'},{h:'키움',a:'KT',t:'18:30',s:'수원'},{h:'NC',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-16',g:[{h:'KT',a:'LG',t:'18:30',s:'잠실'},{h:'KIA',a:'SSG',t:'18:30',s:'문학'},{h:'롯데',a:'삼성',t:'18:30',s:'대구'},{h:'두산',a:'NC',t:'18:30',s:'창원'},{h:'키움',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-17',g:[{h:'KT',a:'LG',t:'18:30',s:'잠실'},{h:'KIA',a:'SSG',t:'18:30',s:'문학'},{h:'롯데',a:'삼성',t:'18:30',s:'대구'},{h:'두산',a:'NC',t:'18:30',s:'창원'},{h:'키움',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-18',g:[{h:'KT',a:'LG',t:'18:00',s:'잠실'},{h:'KIA',a:'SSG',t:'18:00',s:'문학'},{h:'롯데',a:'삼성',t:'18:00',s:'대구'},{h:'두산',a:'NC',t:'18:00',s:'창원'},{h:'키움',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-07-19',g:[{h:'KT',a:'LG',t:'18:00',s:'잠실'},{h:'KIA',a:'SSG',t:'18:00',s:'문학'},{h:'롯데',a:'삼성',t:'18:00',s:'대구'},{h:'두산',a:'NC',t:'18:00',s:'창원'},{h:'키움',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-07-21',g:[{h:'NC',a:'LG',t:'18:30',s:'잠실'},{h:'SSG',a:'롯데',t:'18:30',s:'사직'},{h:'두산',a:'KT',t:'18:30',s:'수원'},{h:'한화',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-07-22',g:[{h:'NC',a:'LG',t:'18:30',s:'잠실'},{h:'SSG',a:'롯데',t:'18:30',s:'사직'},{h:'두산',a:'KT',t:'18:30',s:'수원'},{h:'한화',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-07-23',g:[{h:'NC',a:'LG',t:'18:30',s:'잠실'},{h:'SSG',a:'롯데',t:'18:30',s:'사직'},{h:'두산',a:'KT',t:'18:30',s:'수원'},{h:'한화',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-07-24',g:[{h:'삼성',a:'두산',t:'18:30',s:'잠실'},{h:'NC',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'롯데',t:'18:30',s:'사직'},{h:'키움',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-25',g:[{h:'삼성',a:'두산',t:'18:00',s:'잠실'},{h:'NC',a:'SSG',t:'18:00',s:'문학'},{h:'KT',a:'롯데',t:'18:00',s:'사직'},{h:'키움',a:'KIA',t:'18:00',s:'광주'},{h:'LG',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-07-26',g:[{h:'삼성',a:'두산',t:'18:00',s:'잠실'},{h:'NC',a:'SSG',t:'18:00',s:'문학'},{h:'KT',a:'롯데',t:'18:00',s:'사직'},{h:'키움',a:'KIA',t:'18:00',s:'광주'},{h:'LG',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-07-28',g:[{h:'키움',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'SSG',t:'18:30',s:'문학'},{h:'KIA',a:'삼성',t:'18:30',s:'대구'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'롯데',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-29',g:[{h:'키움',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'SSG',t:'18:30',s:'문학'},{h:'KIA',a:'삼성',t:'18:30',s:'대구'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'롯데',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-30',g:[{h:'키움',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'SSG',t:'18:30',s:'문학'},{h:'KIA',a:'삼성',t:'18:30',s:'대구'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'롯데',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-07-31',g:[{h:'LG',a:'두산',t:'18:30',s:'잠실'},{h:'삼성',a:'롯데',t:'18:30',s:'사직'},{h:'KIA',a:'NC',t:'18:30',s:'창원'},{h:'한화',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-08-01',g:[{h:'LG',a:'두산',t:'18:00',s:'잠실'},{h:'삼성',a:'롯데',t:'18:00',s:'사직'},{h:'KIA',a:'NC',t:'18:00',s:'창원'},{h:'한화',a:'KT',t:'18:00',s:'수원'},{h:'SSG',a:'키움',t:'18:00',s:'고척'}]},
    {d:'2026-08-02',g:[{h:'SSG',a:'키움',t:'14:00',s:'고척'},{h:'LG',a:'두산',t:'18:00',s:'잠실'},{h:'삼성',a:'롯데',t:'18:00',s:'사직'},{h:'KIA',a:'NC',t:'18:00',s:'창원'},{h:'한화',a:'KT',t:'18:00',s:'수원'}]},
    {d:'2026-08-04',g:[{h:'NC',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'한화',a:'삼성',t:'18:30',s:'대구'},{h:'KT',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-08-05',g:[{h:'NC',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'한화',a:'삼성',t:'18:30',s:'대구'},{h:'KT',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-08-06',g:[{h:'NC',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'SSG',t:'18:30',s:'문학'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'한화',a:'삼성',t:'18:30',s:'대구'},{h:'KT',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-08-07',g:[{h:'KIA',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'삼성',t:'18:30',s:'대구'},{h:'SSG',a:'NC',t:'18:30',s:'창원'},{h:'롯데',a:'KT',t:'18:30',s:'수원'},{h:'키움',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-08-08',g:[{h:'KIA',a:'LG',t:'18:00',s:'잠실'},{h:'두산',a:'삼성',t:'18:00',s:'대구'},{h:'SSG',a:'NC',t:'18:00',s:'창원'},{h:'롯데',a:'KT',t:'18:00',s:'수원'},{h:'키움',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-08-09',g:[{h:'KIA',a:'LG',t:'18:00',s:'잠실'},{h:'두산',a:'삼성',t:'18:00',s:'대구'},{h:'SSG',a:'NC',t:'18:00',s:'창원'},{h:'롯데',a:'KT',t:'18:00',s:'수원'},{h:'키움',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-08-11',g:[{h:'한화',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'삼성',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-08-12',g:[{h:'한화',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'삼성',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-08-13',g:[{h:'한화',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'SSG',t:'18:30',s:'문학'},{h:'KT',a:'NC',t:'18:30',s:'창원'},{h:'삼성',a:'KIA',t:'18:30',s:'광주'},{h:'LG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-08-14',g:[{h:'SSG',a:'LG',t:'18:30',s:'잠실'},{h:'NC',a:'롯데',t:'18:30',s:'사직'},{h:'한화',a:'삼성',t:'18:30',s:'대구'},{h:'키움',a:'KT',t:'18:30',s:'수원'},{h:'두산',a:'KIA',t:'18:30',s:'광주'}]},
    {d:'2026-08-15',g:[{h:'SSG',a:'LG',t:'18:00',s:'잠실'},{h:'NC',a:'롯데',t:'18:00',s:'사직'},{h:'한화',a:'삼성',t:'18:00',s:'대구'},{h:'키움',a:'KT',t:'18:00',s:'수원'},{h:'두산',a:'KIA',t:'18:00',s:'광주'}]},
    {d:'2026-08-16',g:[{h:'SSG',a:'LG',t:'18:00',s:'잠실'},{h:'NC',a:'롯데',t:'18:00',s:'사직'},{h:'한화',a:'삼성',t:'18:00',s:'대구'},{h:'키움',a:'KT',t:'18:00',s:'수원'},{h:'두산',a:'KIA',t:'18:00',s:'광주'}]},
    {d:'2026-08-18',g:[{h:'KT',a:'LG',t:'18:30',s:'잠실'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'삼성',t:'18:30',s:'대구'},{h:'두산',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-08-19',g:[{h:'KT',a:'LG',t:'18:30',s:'잠실'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'삼성',t:'18:30',s:'대구'},{h:'두산',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-08-20',g:[{h:'KT',a:'LG',t:'18:30',s:'잠실'},{h:'키움',a:'롯데',t:'18:30',s:'사직'},{h:'SSG',a:'삼성',t:'18:30',s:'대구'},{h:'두산',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-08-21',g:[{h:'롯데',a:'두산',t:'18:30',s:'잠실'},{h:'KT',a:'SSG',t:'18:30',s:'문학'},{h:'삼성',a:'NC',t:'18:30',s:'창원'},{h:'KIA',a:'키움',t:'18:30',s:'고척'},{h:'LG',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-08-22',g:[{h:'롯데',a:'두산',t:'18:00',s:'잠실'},{h:'KT',a:'SSG',t:'18:00',s:'문학'},{h:'삼성',a:'NC',t:'18:00',s:'창원'},{h:'KIA',a:'키움',t:'18:00',s:'고척'},{h:'LG',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-08-23',g:[{h:'KIA',a:'키움',t:'14:00',s:'고척'},{h:'롯데',a:'두산',t:'18:00',s:'잠실'},{h:'KT',a:'SSG',t:'18:00',s:'문학'},{h:'삼성',a:'NC',t:'18:00',s:'창원'},{h:'LG',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-08-25',g:[{h:'NC',a:'LG',t:'18:30',s:'잠실'},{h:'한화',a:'SSG',t:'18:30',s:'문학'},{h:'두산',a:'KT',t:'18:30',s:'수원'},{h:'롯데',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-08-26',g:[{h:'NC',a:'LG',t:'18:30',s:'잠실'},{h:'한화',a:'SSG',t:'18:30',s:'문학'},{h:'두산',a:'KT',t:'18:30',s:'수원'},{h:'롯데',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-08-27',g:[{h:'NC',a:'LG',t:'18:30',s:'잠실'},{h:'한화',a:'SSG',t:'18:30',s:'문학'},{h:'두산',a:'KT',t:'18:30',s:'수원'},{h:'롯데',a:'KIA',t:'18:30',s:'광주'},{h:'삼성',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-08-28',g:[{h:'키움',a:'두산',t:'18:30',s:'잠실'},{h:'LG',a:'롯데',t:'18:30',s:'사직'},{h:'KT',a:'삼성',t:'18:30',s:'대구'},{h:'SSG',a:'KIA',t:'18:30',s:'광주'},{h:'NC',a:'한화',t:'18:30',s:'대전'}]},
    {d:'2026-08-29',g:[{h:'키움',a:'두산',t:'18:00',s:'잠실'},{h:'LG',a:'롯데',t:'18:00',s:'사직'},{h:'KT',a:'삼성',t:'18:00',s:'대구'},{h:'SSG',a:'KIA',t:'18:00',s:'광주'},{h:'NC',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-08-30',g:[{h:'키움',a:'두산',t:'18:00',s:'잠실'},{h:'LG',a:'롯데',t:'18:00',s:'사직'},{h:'KT',a:'삼성',t:'18:00',s:'대구'},{h:'SSG',a:'KIA',t:'18:00',s:'광주'},{h:'NC',a:'한화',t:'18:00',s:'대전'}]},
    {d:'2026-09-01',g:[{h:'LG',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'삼성',t:'18:30',s:'대구'},{h:'KIA',a:'NC',t:'18:30',s:'창원'},{h:'한화',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-09-02',g:[{h:'LG',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'삼성',t:'18:30',s:'대구'},{h:'KIA',a:'NC',t:'18:30',s:'창원'},{h:'한화',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-09-03',g:[{h:'LG',a:'두산',t:'18:30',s:'잠실'},{h:'롯데',a:'삼성',t:'18:30',s:'대구'},{h:'KIA',a:'NC',t:'18:30',s:'창원'},{h:'한화',a:'KT',t:'18:30',s:'수원'},{h:'SSG',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-09-04',g:[{h:'삼성',a:'LG',t:'18:30',s:'잠실'},{h:'두산',a:'SSG',t:'18:30',s:'문학'},{h:'한화',a:'롯데',t:'18:30',s:'사직'},{h:'KT',a:'KIA',t:'18:30',s:'광주'},{h:'NC',a:'키움',t:'18:30',s:'고척'}]},
    {d:'2026-09-05',g:[{h:'삼성',a:'LG',t:'17:00',s:'잠실'},{h:'두산',a:'SSG',t:'17:00',s:'문학'},{h:'한화',a:'롯데',t:'17:00',s:'사직'},{h:'KT',a:'KIA',t:'17:00',s:'광주'},{h:'NC',a:'키움',t:'17:00',s:'고척'}]},
    {d:'2026-09-06',g:[{h:'삼성',a:'LG',t:'17:00',s:'잠실'},{h:'두산',a:'SSG',t:'17:00',s:'문학'},{h:'한화',a:'롯데',t:'17:00',s:'사직'},{h:'KT',a:'KIA',t:'17:00',s:'광주'},{h:'NC',a:'키움',t:'17:00',s:'고척'}]},
];
window.KBO_SCHEDULE_2026 = KBO_SCHEDULE_2026;
