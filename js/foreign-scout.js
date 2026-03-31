// ===== 외국인 스카우트 & 미션 카드 시스템 (티어 시스템 적용) =====
// 2026 KBO 외국인 규정: 외국인 3명 + 아시아쿼터 1명 = 최대 4명

// ── 아시아쿼터 규정 상수 ──
const ASIA_QUOTA = {
    maxPlayers: 4,
    maxForeignClassic: 3,
    maxAsiaQuota: 1,
    newRecruitCap: 20,
    monthlyMax: 2,
    renewalIncrease: 10,
    eligibleRegions: ['일본', '대만', '호주', '중국', '필리핀', '태국', '인도네시아', '파키스탄', '홍콩'],
};

// ── 티어 시스템 (20-80 스카우팅 스케일) ──
const FOREIGN_TIERS = {
    T1: { label: 'T1', origin: 'MLB 출신', ovrRange: [55, 70], salaryRange: [100, 300], color: '#ff4444' },
    T2: { label: 'T2', origin: 'AAA/NPB/KBO복귀', ovrRange: [50, 60], salaryRange: [50, 100], color: '#ff8800' },
    T3: { label: 'T3', origin: 'CPBL/중남미', ovrRange: [45, 55], salaryRange: [20, 50], color: '#44bb44' },
    T4: { label: 'T4', origin: 'AA/쿠바', ovrRange: [40, 50], salaryRange: [10, 30], color: '#4488ff' },
    T5: { label: 'T5', origin: '독립리그/ABL', ovrRange: [35, 50], salaryRange: [10, 30], color: '#888888' },
};

// ── OVR 자동 계산 (20-80 스케일) ──
function calcForeignPitcherOVR(ratings) {
    return Math.round(
        ratings.stuff * 0.35 + ratings.command * 0.25 +
        ratings.stamina * 0.15 + ratings.effectiveness * 0.15 +
        ratings.consistency * 0.10
    );
}
function calcForeignBatterOVR(ratings) {
    return Math.round(
        ratings.contact * 0.30 + ratings.power * 0.25 +
        ratings.eye * 0.20 + ratings.speed * 0.10 +
        ratings.defense * 0.15
    );
}

// ── 외국인 투수 후보 풀 (티어별 실제 기반 데이터) ──
const FOREIGN_PITCHER_POOL = [
    // === T1: MLB 출신 (OVR 55~70, $1M+) ===
    { name: 'Ryan Yarbrough', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 120, age: 33, throwBat: '좌투좌타', height: 196, weight: 93,
      stats: { ERA: 4.56, FIP: 4.20, xFIP: 4.10, BABIP: 0.305, IVB: 28, VAA: -5.8, 'CSW%': 27, IP: 148, SO: 108, BB: 32, HR: 22 },
      ratings: { stuff: 52, command: 72, stamina: 70, effectiveness: 65, consistency: 62 },
      scouting: '전 TB/KC 좌완 이닝이터. 구속은 낮지만 뛰어난 제구력과 체인지업. KBO에서 이닝 소화 기대' },

    { name: 'Drew Smyly', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 150, age: 37, throwBat: '좌투좌타', height: 191, weight: 86,
      stats: { ERA: 4.85, FIP: 4.50, xFIP: 4.35, BABIP: 0.310, IVB: 32, VAA: -5.2, 'CSW%': 28, IP: 135, SO: 125, BB: 45, HR: 24 },
      ratings: { stuff: 55, command: 65, stamina: 58, effectiveness: 60, consistency: 58 },
      scouting: '전 CHC 베테랑 좌완. 커브볼 스핀레이트 높고 MLB 통산 56승. 노장 리스크 존재' },

    { name: 'Michael Lorenzen', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 130, age: 34, throwBat: '우투우타', height: 185, weight: 98,
      stats: { ERA: 5.20, FIP: 4.60, xFIP: 4.45, BABIP: 0.330, IVB: 38, VAA: -4.5, 'CSW%': 26, IP: 120, SO: 105, BB: 48, HR: 18 },
      ratings: { stuff: 62, command: 55, stamina: 52, effectiveness: 55, consistency: 50 },
      scouting: '전 PHI/DET. 노히트 경험자. MLB에서 부진했으나 구위는 살아있음. 불펜 전환도 가능' },

    { name: 'Zach Davies', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 110, age: 33, throwBat: '우투우타', height: 183, weight: 81,
      stats: { ERA: 5.05, FIP: 4.80, xFIP: 4.65, BABIP: 0.315, IVB: 30, VAA: -5.5, 'CSW%': 24, IP: 140, SO: 95, BB: 38, HR: 25 },
      ratings: { stuff: 45, command: 68, stamina: 65, effectiveness: 58, consistency: 60 },
      scouting: '전 MIL/SD/CHC. 연식 투수 전형. 구속 낮지만 제구력과 이닝 소화 탁월. KBO 적응 빠를 듯' },

    { name: 'Wily Peralta', tier: 'T1', nationality: '도미니카', type: '기존외국인', origin: 'MLB', role: '중계',
      salary: 100, age: 36, throwBat: '우투우타', height: 185, weight: 108,
      stats: { ERA: 3.90, FIP: 3.70, xFIP: 3.85, BABIP: 0.295, IVB: 40, VAA: -4.2, 'CSW%': 29, IP: 68, SO: 55, BB: 25, HR: 8 },
      ratings: { stuff: 58, command: 58, stamina: 40, effectiveness: 58, consistency: 55 },
      scouting: '전 MIL/DET/BOS. 싱커 위주 그라운드볼 투수. 불펜에서 안정적 이닝 소화 가능' },

    // === T2: AAA/NPB/KBO복귀 (OVR 110~150, $0.5M~1M) ===
    { name: 'Tobias Myers', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 70, age: 28, throwBat: '우투우타', height: 190, weight: 91,
      stats: { ERA: 4.10, FIP: 3.85, xFIP: 3.90, BABIP: 0.300, IVB: 36, VAA: -4.5, 'CSW%': 29, IP: 145, SO: 130, BB: 40, HR: 18 },
      ratings: { stuff: 55, command: 58, stamina: 60, effectiveness: 55, consistency: 55 },
      scouting: 'AAA에서 안정적 성적. 패스트볼/슬라이더 조합 좋고 이닝 소화력 우수' },

    { name: 'Adrian Martinez', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 65, age: 27, throwBat: '우투우타', height: 196, weight: 100,
      stats: { ERA: 4.35, FIP: 4.00, xFIP: 3.95, BABIP: 0.315, IVB: 34, VAA: -4.8, 'CSW%': 27, IP: 155, SO: 120, BB: 48, HR: 20 },
      ratings: { stuff: 52, command: 52, stamina: 62, effectiveness: 52, consistency: 52 },
      scouting: '전 OAK 40인 로스터. AAA 이닝이터. 체구 좋고 체력 우수하나 탈삼진 부족' },

    { name: '다나카 유키', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '선발',
      salary: 18, age: 30, throwBat: '우투우타', height: 182, weight: 83,
      stats: { ERA: 3.45, FIP: 3.50, xFIP: 3.55, BABIP: 0.290, IVB: 36, VAA: -4.3, 'CSW%': 31, IP: 158, SO: 142, BB: 38, HR: 15 },
      ratings: { stuff: 55, command: 62, stamina: 62, effectiveness: 58, consistency: 62 },
      scouting: 'NPB 2군 통산 40승급. 1군 등판 기회 부족. 제구력과 이닝 소화력 우수' },

    { name: '사토 켄타', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '선발',
      salary: 20, age: 31, throwBat: '우투우타', height: 185, weight: 88,
      stats: { ERA: 3.65, FIP: 3.50, xFIP: 3.45, BABIP: 0.300, IVB: 38, VAA: -4.0, 'CSW%': 30, IP: 145, SO: 135, BB: 40, HR: 16 },
      ratings: { stuff: 55, command: 58, stamina: 58, effectiveness: 56, consistency: 58 },
      scouting: 'NPB 퍼시픽리그 2군 에이스급. 다구종 투수, 변화구 제구 뛰어남. 1군 벽 못 넘음' },

    { name: 'Nick Margevicius', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '중계',
      salary: 55, age: 28, throwBat: '좌투좌타', height: 193, weight: 95,
      stats: { ERA: 3.80, FIP: 3.60, xFIP: 3.70, BABIP: 0.300, IVB: 30, VAA: -5.0, 'CSW%': 26, IP: 70, SO: 62, BB: 22, HR: 8 },
      ratings: { stuff: 48, command: 58, stamina: 42, effectiveness: 52, consistency: 55 },
      scouting: '전 SD/CLE. 좌완 롱릴리프 가능. 구속은 낮지만 좌타자 상대 강점' },

    { name: 'Brandon Pfaadt', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 80, age: 27, throwBat: '우투우타', height: 193, weight: 98,
      stats: { ERA: 4.75, FIP: 4.20, xFIP: 4.00, BABIP: 0.325, IVB: 42, VAA: -3.8, 'CSW%': 30, IP: 160, SO: 155, BB: 50, HR: 22 },
      ratings: { stuff: 62, command: 52, stamina: 58, effectiveness: 55, consistency: 50 },
      scouting: '전 ARI 유망주. MLB에서 피홈런 많았으나 구위 상급. KBO에서 에이스급 기대' },

    // === T3: CPBL/중남미 (OVR 100~130, $0.2M~0.5M) ===
    { name: '린청룽', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '중계',
      salary: 25, age: 26, throwBat: '좌투좌타', height: 180, weight: 78,
      stats: { ERA: 2.90, FIP: 3.10, xFIP: 3.20, BABIP: 0.285, IVB: 34, VAA: -4.1, 'CSW%': 29, IP: 62, SO: 68, BB: 18, HR: 5 },
      ratings: { stuff: 52, command: 58, stamina: 35, effectiveness: 55, consistency: 58 },
      scouting: 'CPBL 최우수 중계. 좌완 사이드암, 좌타자 상대 피안타율 .190' },

    { name: '왕웨이', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '마무리',
      salary: 30, age: 27, throwBat: '우투우타', height: 183, weight: 85,
      stats: { ERA: 2.50, FIP: 2.70, xFIP: 2.90, BABIP: 0.270, IVB: 40, VAA: -3.6, 'CSW%': 33, IP: 52, SO: 65, BB: 15, HR: 3 },
      ratings: { stuff: 58, command: 58, stamina: 30, effectiveness: 60, consistency: 55 },
      scouting: 'CPBL 세이브왕. 155km 직구와 날카로운 슬라이더 보유' },

    { name: 'Jose Castillo', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 35, age: 25, throwBat: '좌투좌타', height: 185, weight: 88,
      stats: { ERA: 3.70, FIP: 3.50, xFIP: 3.60, BABIP: 0.305, IVB: 36, VAA: -4.5, 'CSW%': 28, IP: 130, SO: 115, BB: 42, HR: 14 },
      ratings: { stuff: 55, command: 50, stamina: 52, effectiveness: 50, consistency: 48 },
      scouting: '베네수엘라 윈터리그 MVP. 좌완 150km대 직구. 제구 불안하나 구위 잠재력 큼' },

    { name: 'Miguel Diaz', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '중계',
      salary: 28, age: 28, throwBat: '우투우타', height: 188, weight: 95,
      stats: { ERA: 3.40, FIP: 3.20, xFIP: 3.35, BABIP: 0.290, IVB: 42, VAA: -3.8, 'CSW%': 31, IP: 58, SO: 65, BB: 22, HR: 5 },
      ratings: { stuff: 60, command: 48, stamina: 32, effectiveness: 52, consistency: 45 },
      scouting: '전 SD 마이너 출신. 도미니카 윈터리그 활약. 155km 싱커 보유, 제구 불안' },

    // === T4: AA/쿠바 (OVR 85~110, $0.1M~0.3M) ===
    { name: 'Yoendrys Gomez', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', role: '선발',
      salary: 20, age: 24, throwBat: '우투우타', height: 185, weight: 88,
      stats: { ERA: 4.20, FIP: 3.80, xFIP: 3.90, BABIP: 0.310, IVB: 38, VAA: -4.2, 'CSW%': 28, IP: 110, SO: 105, BB: 45, HR: 12 },
      ratings: { stuff: 58, command: 42, stamina: 48, effectiveness: 45, consistency: 42 },
      scouting: '쿠바 탈출 유망주. AA급 구위. 포심 152km, 슬라이더 날카로우나 이닝 소화 미지수' },

    { name: 'Elvis Alvarado', tier: 'T4', nationality: '베네수엘라', type: '기존외국인', origin: 'AA', role: '중계',
      salary: 15, age: 23, throwBat: '좌투좌타', height: 183, weight: 82,
      stats: { ERA: 3.90, FIP: 3.60, xFIP: 3.75, BABIP: 0.300, IVB: 32, VAA: -4.6, 'CSW%': 26, IP: 55, SO: 52, BB: 25, HR: 6 },
      ratings: { stuff: 50, command: 42, stamina: 35, effectiveness: 42, consistency: 40 },
      scouting: 'AA 좌완 유망주. 체인지업 좋으나 전체적 구위 부족. 저렴한 불펜 옵션' },

    { name: 'Daysbel Hernandez', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', role: '마무리',
      salary: 22, age: 26, throwBat: '우투우타', height: 190, weight: 95,
      stats: { ERA: 3.50, FIP: 3.30, xFIP: 3.50, BABIP: 0.285, IVB: 44, VAA: -3.5, 'CSW%': 32, IP: 48, SO: 58, BB: 22, HR: 4 },
      ratings: { stuff: 62, command: 40, stamina: 28, effectiveness: 48, consistency: 38 },
      scouting: '쿠바 국대 출신. 156km 직구와 파워 슬라이더. 제구 불안하나 마무리 잠재력' },

    // === T5: 독립리그/ABL (OVR 80~95, $0.1M~0.3M) ===
    { name: 'Jack Murray', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '선발',
      salary: 15, age: 27, throwBat: '좌투좌타', height: 190, weight: 92,
      stats: { ERA: 3.80, FIP: 3.55, xFIP: 3.50, BABIP: 0.310, IVB: 36, VAA: -4.4, 'CSW%': 28, IP: 120, SO: 108, BB: 35, HR: 12 },
      ratings: { stuff: 48, command: 50, stamina: 52, effectiveness: 48, consistency: 48 },
      scouting: 'ABL MVP 출신 좌완. WBC 호주 대표, 가성비형. 구위 평범하나 안정적' },

    { name: 'Ty Tice', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '중계',
      salary: 12, age: 27, throwBat: '우투우타', height: 183, weight: 88,
      stats: { ERA: 3.50, FIP: 3.40, xFIP: 3.55, BABIP: 0.295, IVB: 34, VAA: -4.3, 'CSW%': 27, IP: 60, SO: 55, BB: 18, HR: 6 },
      ratings: { stuff: 45, command: 48, stamina: 38, effectiveness: 45, consistency: 48 },
      scouting: '독립리그 올스타. 전 TOR 마이너. 저비용 불펜 보강용, 리스크 낮음' },

    { name: 'Ryan Burr', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '마무리',
      salary: 15, age: 31, throwBat: '우투우타', height: 185, weight: 95,
      stats: { ERA: 3.20, FIP: 3.10, xFIP: 3.30, BABIP: 0.280, IVB: 38, VAA: -3.9, 'CSW%': 30, IP: 52, SO: 55, BB: 15, HR: 5 },
      ratings: { stuff: 50, command: 50, stamina: 30, effectiveness: 48, consistency: 45 },
      scouting: '전 ARI 마이너, 독립리그 세이브왕. 경험 많고 안정적이나 구위 한계 존재' },

    { name: 'Ben Holmes', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '중계',
      salary: 10, age: 25, throwBat: '우투우타', height: 188, weight: 90,
      stats: { ERA: 4.10, FIP: 3.90, xFIP: 4.00, BABIP: 0.305, IVB: 30, VAA: -4.7, 'CSW%': 24, IP: 48, SO: 40, BB: 18, HR: 6 },
      ratings: { stuff: 42, command: 42, stamina: 35, effectiveness: 40, consistency: 42 },
      scouting: 'ABL 호주 대표 후보. 최저비용 옵션. 성장 가능성에 베팅하는 영입' },

    // === 추가 투수 (T1~T5 균등 배분) ===
    // T1 추가
    { name: 'Taijuan Walker', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 140, age: 33, throwBat: '우투우타', height: 193, weight: 102,
      stats: { ERA: 4.80, FIP: 4.40, xFIP: 4.25, BABIP: 0.320, IVB: 36, VAA: -4.3, 'CSW%': 28, IP: 140, SO: 128, BB: 45, HR: 20 },
      ratings: { stuff: 58, command: 55, stamina: 58, effectiveness: 55, consistency: 52 },
      scouting: '전 NYM/PHI. 스플리터 위력적. MLB 통산 ERA 4.20, KBO에서 에이스급 기대' },

    { name: 'Jose Urquidy', tier: 'T1', nationality: '멕시코', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 115, age: 30, throwBat: '우투우타', height: 183, weight: 90,
      stats: { ERA: 5.00, FIP: 4.55, xFIP: 4.40, BABIP: 0.315, IVB: 32, VAA: -4.8, 'CSW%': 26, IP: 125, SO: 105, BB: 35, HR: 22 },
      ratings: { stuff: 52, command: 60, stamina: 55, effectiveness: 52, consistency: 55 },
      scouting: '전 HOU WS 우승 멤버. 제구력 우수하나 구위 하락 추세. 이닝 소화형' },

    { name: 'Matt Boyd', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 105, age: 34, throwBat: '좌투좌타', height: 185, weight: 95,
      stats: { ERA: 5.30, FIP: 4.70, xFIP: 4.50, BABIP: 0.325, IVB: 34, VAA: -5.0, 'CSW%': 27, IP: 115, SO: 110, BB: 38, HR: 24 },
      ratings: { stuff: 55, command: 52, stamina: 50, effectiveness: 50, consistency: 48 },
      scouting: '전 DET/CLE 좌완. 체인지업이 주무기. MLB에서 피홈런 많았으나 KBO 적응 기대' },

    { name: 'Trevor Williams', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 100, age: 33, throwBat: '우투우타', height: 191, weight: 100,
      stats: { ERA: 4.60, FIP: 4.35, xFIP: 4.20, BABIP: 0.300, IVB: 30, VAA: -5.2, 'CSW%': 25, IP: 150, SO: 115, BB: 40, HR: 18 },
      ratings: { stuff: 48, command: 62, stamina: 62, effectiveness: 55, consistency: 58 },
      scouting: '전 PIT/CHC/WSH. 이닝이터 전형. 구속 낮지만 제구력과 경험 풍부' },

    // T2 추가
    { name: 'Daniel Lynch', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 75, age: 28, throwBat: '좌투좌타', height: 198, weight: 98,
      stats: { ERA: 4.50, FIP: 4.10, xFIP: 4.00, BABIP: 0.320, IVB: 34, VAA: -4.6, 'CSW%': 28, IP: 135, SO: 125, BB: 50, HR: 16 },
      ratings: { stuff: 58, command: 48, stamina: 55, effectiveness: 52, consistency: 48 },
      scouting: '전 KC 유망주. 좌완 198cm 장신. 구위 좋으나 제구 불안정. 잠재력 높음' },

    { name: 'Konnor Pilkington', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 60, age: 28, throwBat: '좌투좌타', height: 191, weight: 95,
      stats: { ERA: 4.25, FIP: 4.00, xFIP: 3.95, BABIP: 0.305, IVB: 30, VAA: -5.0, 'CSW%': 27, IP: 140, SO: 118, BB: 42, HR: 18 },
      ratings: { stuff: 52, command: 55, stamina: 58, effectiveness: 52, consistency: 52 },
      scouting: '전 CLE AAA. 좌완 연식 투수. 체인지업 우수, 이닝 소화력 좋음' },

    { name: '스즈키 료', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '중계',
      salary: 16, age: 25, throwBat: '우투우타', height: 178, weight: 80,
      stats: { ERA: 3.30, FIP: 3.15, xFIP: 3.25, BABIP: 0.295, IVB: 42, VAA: -3.9, 'CSW%': 31, IP: 55, SO: 60, BB: 16, HR: 4 },
      ratings: { stuff: 58, command: 55, stamina: 35, effectiveness: 56, consistency: 52 },
      scouting: 'NPB 퓨처스 출신. IVB 높은 라이징 패스트볼, 성장 가능성 큼' },

    { name: '모리타 히로시', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '마무리',
      salary: 18, age: 27, throwBat: '우투우타', height: 180, weight: 82,
      stats: { ERA: 2.80, FIP: 2.90, xFIP: 3.10, BABIP: 0.275, IVB: 40, VAA: -3.6, 'CSW%': 33, IP: 50, SO: 58, BB: 18, HR: 4 },
      ratings: { stuff: 60, command: 55, stamina: 30, effectiveness: 58, consistency: 52 },
      scouting: 'NPB 2군 세이브왕. 152km 직구와 포크볼 조합. 마무리 적합' },

    { name: 'Cole Irvin', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 65, age: 31, throwBat: '좌투좌타', height: 193, weight: 95,
      stats: { ERA: 4.40, FIP: 4.20, xFIP: 4.15, BABIP: 0.300, IVB: 28, VAA: -5.5, 'CSW%': 25, IP: 155, SO: 110, BB: 35, HR: 22 },
      ratings: { stuff: 45, command: 62, stamina: 62, effectiveness: 55, consistency: 58 },
      scouting: '전 OAK/BAL 좌완. 이닝이터. 구속 낮지만 뛰어난 제구력. KBO 적응 빠를 듯' },

    // T3 추가
    { name: 'Pedro Fernandez', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 35, age: 24, throwBat: '우투우타', height: 190, weight: 92,
      stats: { ERA: 3.60, FIP: 3.40, xFIP: 3.50, BABIP: 0.300, IVB: 38, VAA: -4.2, 'CSW%': 29, IP: 120, SO: 110, BB: 40, HR: 12 },
      ratings: { stuff: 58, command: 48, stamina: 50, effectiveness: 48, consistency: 45 },
      scouting: '도미니카 윈터리그 신인왕. 153km 직구, 슬라이더 날카로움. 제구 불안' },

    { name: '황웨이한', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '선발',
      salary: 20, age: 28, throwBat: '좌투좌타', height: 183, weight: 85,
      stats: { ERA: 3.20, FIP: 3.30, xFIP: 3.40, BABIP: 0.290, IVB: 32, VAA: -4.8, 'CSW%': 28, IP: 140, SO: 120, BB: 35, HR: 14 },
      ratings: { stuff: 50, command: 58, stamina: 58, effectiveness: 55, consistency: 55 },
      scouting: 'CPBL 다승왕. 좌완 제구형. 이닝 소화력 우수하고 안정적' },

    { name: 'Luis Medina', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '중계',
      salary: 25, age: 25, throwBat: '우투우타', height: 185, weight: 88,
      stats: { ERA: 3.80, FIP: 3.50, xFIP: 3.60, BABIP: 0.305, IVB: 44, VAA: -3.5, 'CSW%': 30, IP: 55, SO: 62, BB: 28, HR: 5 },
      ratings: { stuff: 62, command: 42, stamina: 32, effectiveness: 48, consistency: 40 },
      scouting: '전 OAK 마이너. 156km 직구 보유. 삼진 능력 뛰어나나 볼넷 많음' },

    { name: 'Ricardo Sanchez', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 30, age: 26, throwBat: '좌투좌타', height: 178, weight: 82,
      stats: { ERA: 3.50, FIP: 3.40, xFIP: 3.50, BABIP: 0.295, IVB: 30, VAA: -4.9, 'CSW%': 27, IP: 130, SO: 108, BB: 38, HR: 14 },
      ratings: { stuff: 50, command: 52, stamina: 55, effectiveness: 50, consistency: 50 },
      scouting: '베네수엘라 리그 좌완. 커브+체인지업 조합. 무난한 이닝 소화형' },

    // T4 추가
    { name: 'Osiel Rodriguez', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', role: '선발',
      salary: 22, age: 23, throwBat: '우투우타', height: 188, weight: 90,
      stats: { ERA: 4.00, FIP: 3.70, xFIP: 3.80, BABIP: 0.310, IVB: 40, VAA: -4.0, 'CSW%': 29, IP: 100, SO: 98, BB: 42, HR: 10 },
      ratings: { stuff: 60, command: 42, stamina: 45, effectiveness: 45, consistency: 40 },
      scouting: '쿠바 세리에 유망주. 154km 직구+커브. 제구 미완성이나 구위 잠재력 높음' },

    { name: 'Junior Garcia', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', role: '중계',
      salary: 12, age: 24, throwBat: '좌투좌타', height: 180, weight: 78,
      stats: { ERA: 3.70, FIP: 3.50, xFIP: 3.60, BABIP: 0.300, IVB: 32, VAA: -4.5, 'CSW%': 27, IP: 50, SO: 48, BB: 20, HR: 5 },
      ratings: { stuff: 50, command: 45, stamina: 32, effectiveness: 44, consistency: 42 },
      scouting: 'AA 좌완 릴리버. 좌타자 상대 피안타율 .200. 원포인트 가치' },

    { name: 'Prelander Berroa', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 18, age: 25, throwBat: '우투우타', height: 185, weight: 85,
      stats: { ERA: 4.30, FIP: 3.90, xFIP: 4.00, BABIP: 0.315, IVB: 36, VAA: -4.3, 'CSW%': 28, IP: 105, SO: 100, BB: 48, HR: 12 },
      ratings: { stuff: 55, command: 40, stamina: 48, effectiveness: 42, consistency: 38 },
      scouting: '전 CHW 유망주. 구위 좋으나 제구 극도로 불안. 하이리스크 하이리턴' },

    // T5 추가
    { name: 'Matt Tabor', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '선발',
      salary: 12, age: 26, throwBat: '우투우타', height: 190, weight: 88,
      stats: { ERA: 3.90, FIP: 3.70, xFIP: 3.80, BABIP: 0.305, IVB: 34, VAA: -4.5, 'CSW%': 26, IP: 110, SO: 90, BB: 32, HR: 12 },
      ratings: { stuff: 48, command: 48, stamina: 50, effectiveness: 46, consistency: 45 },
      scouting: 'ABL 올스타. 전 ARI 마이너. 가성비 이닝이터, 리스크 낮음' },

    { name: 'Kevin Magee', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '중계',
      salary: 10, age: 28, throwBat: '우투우타', height: 183, weight: 85,
      stats: { ERA: 3.40, FIP: 3.20, xFIP: 3.40, BABIP: 0.290, IVB: 36, VAA: -4.2, 'CSW%': 28, IP: 55, SO: 50, BB: 15, HR: 5 },
      ratings: { stuff: 48, command: 50, stamina: 35, effectiveness: 46, consistency: 46 },
      scouting: '독립리그 최우수 중계. 제구 안정적. 저비용 불펜 보강 옵션' },

    { name: 'Dylan File', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '선발',
      salary: 12, age: 29, throwBat: '우투우타', height: 185, weight: 90,
      stats: { ERA: 3.70, FIP: 3.60, xFIP: 3.70, BABIP: 0.300, IVB: 30, VAA: -5.0, 'CSW%': 25, IP: 125, SO: 95, BB: 30, HR: 14 },
      ratings: { stuff: 45, command: 52, stamina: 52, effectiveness: 45, consistency: 48 },
      scouting: '전 MIL 마이너, 독립리그. 이닝 소화력 좋고 볼넷 적음. 가성비형' },

    { name: 'Emilio Vargas', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 28, age: 26, throwBat: '우투우타', height: 188, weight: 90,
      stats: { ERA: 3.45, FIP: 3.30, xFIP: 3.45, BABIP: 0.295, IVB: 36, VAA: -4.3, 'CSW%': 29, IP: 125, SO: 115, BB: 38, HR: 12 },
      ratings: { stuff: 55, command: 50, stamina: 52, effectiveness: 50, consistency: 48 },
      scouting: '전 OAK 마이너. 도미니카 윈터리그 활약. 직구+슬라이더 조합 좋음' },

    { name: 'Anderson Espinoza', tier: 'T4', nationality: '베네수엘라', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 18, age: 27, throwBat: '우투우타', height: 185, weight: 88,
      stats: { ERA: 4.10, FIP: 3.80, xFIP: 3.90, BABIP: 0.310, IVB: 38, VAA: -4.1, 'CSW%': 28, IP: 95, SO: 90, BB: 35, HR: 10 },
      ratings: { stuff: 55, command: 42, stamina: 42, effectiveness: 45, consistency: 40 },
      scouting: '전 SD 탑유망주. 부상 후 AA 복귀. 구위 살아있으나 체력/제구 불안' },

    { name: '가토 쇼고', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '선발',
      salary: 18, age: 29, throwBat: '좌투좌타', height: 180, weight: 78,
      stats: { ERA: 3.55, FIP: 3.40, xFIP: 3.45, BABIP: 0.295, IVB: 30, VAA: -5.0, 'CSW%': 28, IP: 140, SO: 115, BB: 35, HR: 14 },
      ratings: { stuff: 48, command: 60, stamina: 58, effectiveness: 55, consistency: 58 },
      scouting: 'NPB 2군 좌완 에이스. 제구력 우수, 이닝 소화 탁월. 구위 평범' },

    { name: 'Jason Alexander', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '선발',
      salary: 10, age: 30, throwBat: '우투우타', height: 180, weight: 88,
      stats: { ERA: 4.00, FIP: 3.80, xFIP: 3.90, BABIP: 0.305, IVB: 28, VAA: -5.2, 'CSW%': 24, IP: 130, SO: 85, BB: 28, HR: 16 },
      ratings: { stuff: 40, command: 52, stamina: 55, effectiveness: 45, consistency: 48 },
      scouting: '전 MIL. 독립리그 이닝왕. 구속 낮지만 볼넷 적고 이닝 소화력 좋음' },
];

// ── 외국인 타자 후보 풀 (티어별 실제 기반 데이터) ──
const FOREIGN_BATTER_POOL = [
    // === T1: MLB 출신 ===
    { name: 'Joc Pederson', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: 'LF',
      salary: 140, age: 34, throwBat: '좌투좌타', height: 185, weight: 100,
      stats: { AVG: 0.238, OBP: 0.340, SLG: 0.470, OPS: 0.810, 'wRC+': 125, 'Barrel%': 15.5, HR: 25, BB: 60, SB: 2, PA: 520 },
      ratings: { contact: 48, power: 72, eye: 62, speed: 30, defense: 35 },
      scouting: '전 LAD/ATL/SF. WS 챔피언 경험. 좌타 파워 최상급이나 수비/주루 약점' },

    { name: 'Andrew Benintendi', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: 'LF',
      salary: 130, age: 31, throwBat: '좌투좌타', height: 178, weight: 82,
      stats: { AVG: 0.255, OBP: 0.340, SLG: 0.385, OPS: 0.725, 'wRC+': 108, 'Barrel%': 7.5, HR: 12, BB: 55, SB: 8, PA: 540 },
      ratings: { contact: 62, power: 45, eye: 60, speed: 48, defense: 55 },
      scouting: '전 BOS/NYY/CHW. WS 우승 멤버. 컨택형 외야수. MLB에서 파워 감소 추세' },

    { name: 'Franmil Reyes', tier: 'T1', nationality: '도미니카', type: '기존외국인', origin: 'MLB', position: 'DH',
      salary: 110, age: 30, throwBat: '우투우타', height: 196, weight: 118,
      stats: { AVG: 0.230, OBP: 0.300, SLG: 0.450, OPS: 0.750, 'wRC+': 110, 'Barrel%': 16.0, HR: 28, BB: 35, SB: 0, PA: 500 },
      ratings: { contact: 42, power: 75, eye: 45, speed: 20, defense: 25 },
      scouting: '전 CLE/CHC. 순수 파워형 DH. Barrel% 최상급이나 삼진 매우 많고 수비 불가' },

    { name: 'Leury Garcia', tier: 'T1', nationality: '도미니카', type: '기존외국인', origin: 'MLB', position: '2B',
      salary: 100, age: 34, throwBat: '양투우타', height: 178, weight: 77,
      stats: { AVG: 0.250, OBP: 0.290, SLG: 0.360, OPS: 0.650, 'wRC+': 82, 'Barrel%': 4.5, HR: 8, BB: 25, SB: 15, PA: 480 },
      ratings: { contact: 55, power: 35, eye: 38, speed: 62, defense: 65 },
      scouting: '전 CHW 유틸리티. 다포지션 수비 가능(2B/SS/OF). 타격 약하나 수비/주루 가치' },

    // === T2: AAA/NPB/KBO복귀 ===
    { name: '야마모토 쇼타', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', position: '2B',
      salary: 18, age: 28, throwBat: '우투좌타', height: 175, weight: 75,
      stats: { AVG: 0.295, OBP: 0.360, SLG: 0.410, OPS: 0.770, 'wRC+': 112, 'Barrel%': 6.0, HR: 7, BB: 45, SB: 22, PA: 520 },
      ratings: { contact: 62, power: 35, eye: 55, speed: 60, defense: 58 },
      scouting: 'NPB 2군 타격왕. 1군 벽 못 넘은 컨택형 2루수. 주루/수비 밸런스' },

    { name: '다카하시 렌', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', position: 'CF',
      salary: 20, age: 26, throwBat: '좌투좌타', height: 180, weight: 80,
      stats: { AVG: 0.288, OBP: 0.355, SLG: 0.435, OPS: 0.790, 'wRC+': 118, 'Barrel%': 7.5, HR: 10, BB: 42, SB: 28, PA: 530 },
      ratings: { contact: 60, power: 42, eye: 52, speed: 65, defense: 62 },
      scouting: 'NPB 퓨처스리그 도루왕. 스피드와 수비 최상급, 리드오프 적합' },

    { name: 'Jake Bauers', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', position: '1B',
      salary: 60, age: 29, throwBat: '좌투좌타', height: 185, weight: 93,
      stats: { AVG: 0.270, OBP: 0.355, SLG: 0.450, OPS: 0.805, 'wRC+': 120, 'Barrel%': 10.5, HR: 18, BB: 55, SB: 5, PA: 510 },
      ratings: { contact: 52, power: 58, eye: 58, speed: 38, defense: 42 },
      scouting: '전 TB/CLE. AAA에서 .270+20HR급. MLB 적응 실패했으나 KBO급 타격 기대' },

    { name: 'Tyler Naquin', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', position: 'RF',
      salary: 70, age: 34, throwBat: '좌투좌타', height: 185, weight: 86,
      stats: { AVG: 0.260, OBP: 0.325, SLG: 0.445, OPS: 0.770, 'wRC+': 112, 'Barrel%': 11.0, HR: 16, BB: 38, SB: 6, PA: 490 },
      ratings: { contact: 55, power: 55, eye: 48, speed: 45, defense: 48 },
      scouting: '전 CLE/CIN/NYM. MLB 통산 .254. 안정적 중거리 타격과 외야 수비 가능' },

    // === T3: CPBL/중남미 ===
    { name: '천웨이룬', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', position: 'SS',
      salary: 25, age: 25, throwBat: '우투우타', height: 178, weight: 78,
      stats: { AVG: 0.280, OBP: 0.335, SLG: 0.395, OPS: 0.730, 'wRC+': 105, 'Barrel%': 5.2, HR: 5, BB: 32, SB: 18, PA: 470 },
      ratings: { contact: 58, power: 32, eye: 48, speed: 55, defense: 62 },
      scouting: 'CPBL 골든글러브 유격수. 수비 범위 넓고 송구 정확. 타격은 평범' },

    { name: 'Carlos Vargas', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', position: '3B',
      salary: 30, age: 26, throwBat: '우투우타', height: 188, weight: 95,
      stats: { AVG: 0.275, OBP: 0.340, SLG: 0.470, OPS: 0.810, 'wRC+': 122, 'Barrel%': 12.0, HR: 18, BB: 38, SB: 4, PA: 490 },
      ratings: { contact: 52, power: 58, eye: 48, speed: 32, defense: 48 },
      scouting: '베네수엘라 윈터리그 홈런왕. 파워 잠재력 높으나 삼진 다소 많음' },

    { name: 'Ramon Laureano', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', position: 'RF',
      salary: 40, age: 30, throwBat: '우투우타', height: 178, weight: 84,
      stats: { AVG: 0.250, OBP: 0.320, SLG: 0.420, OPS: 0.740, 'wRC+': 108, 'Barrel%': 10.0, HR: 14, BB: 35, SB: 12, PA: 480 },
      ratings: { contact: 50, power: 52, eye: 45, speed: 55, defense: 58 },
      scouting: '도미니카 리그 출신. 외야 강견 보유, 밸런스형. 타격 꾸준함이 강점' },

    // === T4: AA/쿠바 ===
    { name: 'Yoelkis Cespedes', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', position: 'CF',
      salary: 20, age: 27, throwBat: '우투우타', height: 178, weight: 82,
      stats: { AVG: 0.265, OBP: 0.325, SLG: 0.400, OPS: 0.725, 'wRC+': 102, 'Barrel%': 7.5, HR: 10, BB: 30, SB: 20, PA: 450 },
      ratings: { contact: 50, power: 45, eye: 42, speed: 60, defense: 52 },
      scouting: '전 CHW 마이너. 쿠바 세리에 출신. 스피드와 도루 능력 좋으나 파워 부족' },

    { name: 'Luis Campusano', tier: 'T4', nationality: '미국', type: '기존외국인', origin: 'AA', position: 'C',
      salary: 18, age: 27, throwBat: '우투우타', height: 180, weight: 100,
      stats: { AVG: 0.255, OBP: 0.320, SLG: 0.410, OPS: 0.730, 'wRC+': 105, 'Barrel%': 9.0, HR: 12, BB: 28, SB: 1, PA: 420 },
      ratings: { contact: 50, power: 48, eye: 42, speed: 25, defense: 48 },
      scouting: 'AA 포수. 타격형 포수로 중거리 파워 보유. 수비는 평범' },

    { name: 'Yunior Severino', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', position: '2B',
      salary: 15, age: 24, throwBat: '양투양타', height: 178, weight: 80,
      stats: { AVG: 0.260, OBP: 0.310, SLG: 0.380, OPS: 0.690, 'wRC+': 95, 'Barrel%': 5.5, HR: 6, BB: 22, SB: 15, PA: 440 },
      ratings: { contact: 48, power: 35, eye: 38, speed: 55, defense: 50 },
      scouting: 'AA 유틸리티. 양타 가능하고 주루 능력 좋으나 전체적 타격 부족' },

    // === T5: 독립리그/ABL ===
    { name: 'Sam Taylor', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', position: '1B',
      salary: 12, age: 29, throwBat: '좌투좌타', height: 192, weight: 100,
      stats: { AVG: 0.255, OBP: 0.330, SLG: 0.460, OPS: 0.790, 'wRC+': 115, 'Barrel%': 11.5, HR: 18, BB: 38, SB: 1, PA: 480 },
      ratings: { contact: 48, power: 58, eye: 48, speed: 22, defense: 32 },
      scouting: 'ABL 홈런왕. 파워 가성비 뛰어나나 수비/주루 약점. 저비용 파워 옵션' },

    { name: 'Dustin Harris', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', position: 'LF',
      salary: 12, age: 26, throwBat: '좌투좌타', height: 183, weight: 88,
      stats: { AVG: 0.280, OBP: 0.345, SLG: 0.420, OPS: 0.765, 'wRC+': 110, 'Barrel%': 8.0, HR: 10, BB: 40, SB: 10, PA: 460 },
      ratings: { contact: 55, power: 42, eye: 50, speed: 48, defense: 42 },
      scouting: '전 TEX 마이너, 독립리그 타격왕. 컨택 좋고 출루 능력 우수. 저비용 보강' },

    { name: 'Josh Fuentes', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', position: '3B',
      salary: 15, age: 33, throwBat: '우투우타', height: 188, weight: 95,
      stats: { AVG: 0.260, OBP: 0.300, SLG: 0.400, OPS: 0.700, 'wRC+': 95, 'Barrel%': 7.5, HR: 10, BB: 18, SB: 2, PA: 430 },
      ratings: { contact: 52, power: 45, eye: 35, speed: 30, defense: 48 },
      scouting: '전 COL. 3루 수비 안정적. 타격 하한선 보장되나 상한선 낮음. 저비용 3루 옵션' },

    // === 추가 타자 (T1~T5 균등 배분) ===
    // T1 추가
    { name: 'Jorge Soler', tier: 'T1', nationality: '쿠바', type: '기존외국인', origin: 'MLB', position: 'DH',
      salary: 120, age: 33, throwBat: '우투우타', height: 191, weight: 107,
      stats: { AVG: 0.230, OBP: 0.320, SLG: 0.470, OPS: 0.790, 'wRC+': 118, 'Barrel%': 15.0, HR: 26, BB: 50, SB: 0, PA: 510 },
      ratings: { contact: 42, power: 72, eye: 52, speed: 20, defense: 22 },
      scouting: '전 ATL/MIA WS MVP. 순수 파워형 DH. 삼진 많으나 홈런 생산력 최상급' },

    { name: 'Kole Calhoun', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: 'RF',
      salary: 100, age: 37, throwBat: '좌투좌타', height: 178, weight: 93,
      stats: { AVG: 0.240, OBP: 0.310, SLG: 0.410, OPS: 0.720, 'wRC+': 102, 'Barrel%': 10.0, HR: 15, BB: 42, SB: 3, PA: 490 },
      ratings: { contact: 50, power: 52, eye: 50, speed: 35, defense: 55 },
      scouting: '전 LAA/ARI/TEX. 수비형 외야수. 타격 하락세이나 수비와 경험 가치' },

    { name: 'Harrison Bader', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: 'CF',
      salary: 110, age: 31, throwBat: '우투우타', height: 183, weight: 95,
      stats: { AVG: 0.245, OBP: 0.310, SLG: 0.400, OPS: 0.710, 'wRC+': 100, 'Barrel%': 8.5, HR: 14, BB: 35, SB: 18, PA: 480 },
      ratings: { contact: 48, power: 48, eye: 42, speed: 62, defense: 68 },
      scouting: '전 STL/NYY. 중견수 수비 골드글러브급. 타격 평범하나 스피드+수비 가치' },

    { name: 'Garrett Cooper', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: '1B',
      salary: 105, age: 34, throwBat: '우투우타', height: 196, weight: 107,
      stats: { AVG: 0.265, OBP: 0.340, SLG: 0.440, OPS: 0.780, 'wRC+': 115, 'Barrel%': 11.0, HR: 16, BB: 42, SB: 1, PA: 490 },
      ratings: { contact: 58, power: 55, eye: 52, speed: 22, defense: 35 },
      scouting: '전 MIA/SD. 컨택+파워 밸런스형 1루수. MLB 통산 .268, KBO에서 3할 기대' },

    // T2 추가
    { name: '나카무라 타이치', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', position: 'SS',
      salary: 18, age: 26, throwBat: '우투우타', height: 176, weight: 74,
      stats: { AVG: 0.275, OBP: 0.330, SLG: 0.380, OPS: 0.710, 'wRC+': 100, 'Barrel%': 4.5, HR: 5, BB: 30, SB: 25, PA: 500 },
      ratings: { contact: 58, power: 32, eye: 48, speed: 62, defense: 65 },
      scouting: 'NPB 2군 유격수. 수비 범위 넓고 주루 능력 탁월. 파워 부족이 단점' },

    { name: 'Bobby Dalbec', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', position: '1B',
      salary: 55, age: 30, throwBat: '우투우타', height: 193, weight: 102,
      stats: { AVG: 0.240, OBP: 0.310, SLG: 0.460, OPS: 0.770, 'wRC+': 112, 'Barrel%': 13.5, HR: 22, BB: 35, SB: 2, PA: 480 },
      ratings: { contact: 42, power: 65, eye: 42, speed: 28, defense: 40 },
      scouting: '전 BOS. AAA에서 파워 건재. MLB 적응 실패했으나 KBO급 장거리포 기대' },

    { name: 'Vidal Brujan', tier: 'T2', nationality: '도미니카', type: '기존외국인', origin: 'AAA', position: '2B',
      salary: 50, age: 27, throwBat: '양투양타', height: 175, weight: 73,
      stats: { AVG: 0.265, OBP: 0.335, SLG: 0.400, OPS: 0.735, 'wRC+': 105, 'Barrel%': 6.0, HR: 8, BB: 38, SB: 30, PA: 500 },
      ratings: { contact: 52, power: 38, eye: 48, speed: 68, defense: 52 },
      scouting: '전 TB 유망주. 스피드 최상급(30도루). MLB 적응 실패했으나 주루+수비 가치' },

    { name: '이토 유스케', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', position: 'LF',
      salary: 20, age: 29, throwBat: '좌투좌타', height: 182, weight: 85,
      stats: { AVG: 0.285, OBP: 0.355, SLG: 0.445, OPS: 0.800, 'wRC+': 118, 'Barrel%': 9.0, HR: 14, BB: 45, SB: 8, PA: 520 },
      ratings: { contact: 60, power: 48, eye: 55, speed: 42, defense: 45 },
      scouting: 'NPB 2군 타격 3위. 좌타 컨택형. 선구안 좋고 출루율 높음' },

    // T3 추가
    { name: 'Andres Gimenez Jr', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', position: 'SS',
      salary: 35, age: 24, throwBat: '좌투양타', height: 178, weight: 77,
      stats: { AVG: 0.270, OBP: 0.325, SLG: 0.400, OPS: 0.725, 'wRC+': 105, 'Barrel%': 6.5, HR: 8, BB: 30, SB: 20, PA: 470 },
      ratings: { contact: 55, power: 38, eye: 45, speed: 58, defense: 60 },
      scouting: '베네수엘라 리그 유격수. 수비 범위 넓고 도루 능력 좋음. 타격 성장 중' },

    { name: '린하오웨이', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', position: 'CF',
      salary: 18, age: 25, throwBat: '우투좌타', height: 178, weight: 76,
      stats: { AVG: 0.295, OBP: 0.350, SLG: 0.410, OPS: 0.760, 'wRC+': 110, 'Barrel%': 5.5, HR: 6, BB: 35, SB: 22, PA: 480 },
      ratings: { contact: 60, power: 32, eye: 52, speed: 62, defense: 58 },
      scouting: 'CPBL 도루왕. 리드오프 적합. 컨택+스피드형. 파워 부족' },

    { name: 'Manuel Margot', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', position: 'RF',
      salary: 40, age: 31, throwBat: '우투우타', height: 178, weight: 82,
      stats: { AVG: 0.260, OBP: 0.310, SLG: 0.390, OPS: 0.700, 'wRC+': 95, 'Barrel%': 7.0, HR: 10, BB: 25, SB: 12, PA: 470 },
      ratings: { contact: 52, power: 42, eye: 40, speed: 55, defense: 58 },
      scouting: '도미니카 리그 외야수. 수비+주루 밸런스형. 안정적이나 파워 부족' },

    { name: 'Daniel Vogelbach', tier: 'T3', nationality: '미국', type: '기존외국인', origin: '중남미', position: 'DH',
      salary: 35, age: 32, throwBat: '좌투좌타', height: 183, weight: 116,
      stats: { AVG: 0.235, OBP: 0.350, SLG: 0.430, OPS: 0.780, 'wRC+': 115, 'Barrel%': 12.0, HR: 18, BB: 55, SB: 0, PA: 470 },
      ratings: { contact: 42, power: 60, eye: 62, speed: 18, defense: 20 },
      scouting: '전 NYM/PIT. 선구안 최상급 DH. 파워+출루 우수하나 수비/주루 불가' },

    // T4 추가
    { name: 'Romy Gonzalez', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', position: '3B',
      salary: 18, age: 27, throwBat: '우투우타', height: 183, weight: 88,
      stats: { AVG: 0.255, OBP: 0.310, SLG: 0.420, OPS: 0.730, 'wRC+': 102, 'Barrel%': 9.0, HR: 14, BB: 25, SB: 5, PA: 440 },
      ratings: { contact: 48, power: 50, eye: 40, speed: 38, defense: 48 },
      scouting: '쿠바 국대 출신. 중거리 파워와 3루 수비 겸비. 타격 일관성 부족' },

    { name: 'Pedro Leon', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', position: 'CF',
      salary: 20, age: 27, throwBat: '우투우타', height: 183, weight: 85,
      stats: { AVG: 0.248, OBP: 0.310, SLG: 0.400, OPS: 0.710, 'wRC+': 98, 'Barrel%': 8.0, HR: 12, BB: 28, SB: 18, PA: 460 },
      ratings: { contact: 45, power: 48, eye: 40, speed: 58, defense: 52 },
      scouting: '전 HOU 마이너. 쿠바 세리에 출신. 스피드+파워 도구 좋으나 삼진 많음' },

    { name: 'Jhonkensy Noel', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', position: '1B',
      salary: 15, age: 24, throwBat: '우투우타', height: 185, weight: 100,
      stats: { AVG: 0.245, OBP: 0.305, SLG: 0.475, OPS: 0.780, 'wRC+': 115, 'Barrel%': 14.0, HR: 22, BB: 25, SB: 1, PA: 450 },
      ratings: { contact: 40, power: 65, eye: 38, speed: 22, defense: 30 },
      scouting: 'AA 홈런왕. 순수 파워형 1루수. Barrel% 높으나 삼진 극히 많음' },

    // T5 추가
    { name: 'Luke Williams', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', position: '2B',
      salary: 12, age: 28, throwBat: '우투우타', height: 180, weight: 82,
      stats: { AVG: 0.270, OBP: 0.330, SLG: 0.390, OPS: 0.720, 'wRC+': 100, 'Barrel%': 6.0, HR: 8, BB: 30, SB: 12, PA: 460 },
      ratings: { contact: 52, power: 38, eye: 45, speed: 50, defense: 52 },
      scouting: 'ABL 올스타. 다포지션(2B/3B/OF) 가능. 밸런스형, 저비용 유틸리티' },

    { name: 'Nick Allen', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', position: 'SS',
      salary: 12, age: 27, throwBat: '우투우타', height: 170, weight: 70,
      stats: { AVG: 0.245, OBP: 0.300, SLG: 0.340, OPS: 0.640, 'wRC+': 80, 'Barrel%': 3.5, HR: 3, BB: 22, SB: 15, PA: 440 },
      ratings: { contact: 50, power: 25, eye: 40, speed: 58, defense: 70 },
      scouting: '전 OAK. 수비 전문 유격수. 타격 약하나 수비 범위와 송구 최상급' },

    { name: 'Cody Thomas', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', position: 'LF',
      salary: 10, age: 30, throwBat: '좌투좌타', height: 196, weight: 105,
      stats: { AVG: 0.255, OBP: 0.320, SLG: 0.440, OPS: 0.760, 'wRC+': 108, 'Barrel%': 10.0, HR: 16, BB: 30, SB: 3, PA: 450 },
      ratings: { contact: 45, power: 55, eye: 42, speed: 32, defense: 38 },
      scouting: '전 OAK/LAD. 장신 좌타 외야수. 파워 잠재력 좋고 가성비 우수' },
];

// ── 미션 상태 관리 ──
let foreignScoutState = {
    unlocked: true,           // 기본 활성화
    batterUnlocked: true,     // 기본 활성화
    missionShown: false,
    missionChoice: null,
    recruited: [],
};

// localStorage에서 복원
function loadForeignScoutState() {
    const saved = localStorage.getItem('kbo-foreign-scout-state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(foreignScoutState, parsed);
            // 강제 활성화 (구버전 호환)
            foreignScoutState.unlocked = true;
            foreignScoutState.batterUnlocked = true;
        } catch (e) {}
    }
}

function saveForeignScoutState() {
    localStorage.setItem('kbo-foreign-scout-state', JSON.stringify(foreignScoutState));
}

// ── 탭 잠금/해제 (하위 호환) ──
function unlockForeignScoutTab(animate = true) {
    const navBtn = document.getElementById('navForeignScout');
    if (!navBtn) return;
    navBtn.classList.remove('nav-btn--locked');
    navBtn.textContent = '외국인 스카우트';
    foreignScoutState.unlocked = true;
}

function unlockBatterTab(animate = true) {
    const tab = document.getElementById('fsTabBatter');
    if (!tab) return;
    tab.classList.remove('fs-sub-tab--locked');
    tab.textContent = '타자 후보';
    foreignScoutState.batterUnlocked = true;
}

// ── 미션 카드 표시 ──
function showMissionCard() {
    if (foreignScoutState.missionShown) return;

    const modal = document.getElementById('missionModal');
    if (!modal) return;

    const userTeamCode = document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    const foreignPitchers = getTeamPitchers(state, userTeamCode).filter(p => p.isForeign);

    let targetPitcher = foreignPitchers[0];
    const dataEl = document.getElementById('missionData');

    if (targetPitcher) {
        dataEl.innerHTML = `
            <div style="margin-bottom:8px;font-weight:700;color:var(--text-primary);">
                <span style="font-size:16px;">📊</span> ${targetPitcher.name} — 최근 성적 분석
            </div>
            <table>
                <tr><th>지표</th><th>현재</th><th>리그 평균</th><th>판단</th></tr>
                <tr><td>ERA</td><td class="stat-bad">6.50</td><td>4.20</td><td class="stat-bad">부진</td></tr>
                <tr><td>FIP</td><td class="stat-warn">4.80</td><td>4.10</td><td class="stat-warn">평균 이하</td></tr>
                <tr><td>xFIP</td><td class="stat-ok">3.90</td><td>4.10</td><td class="stat-ok">양호</td></tr>
                <tr><td>BABIP</td><td class="stat-bad">.350</td><td>.300</td><td class="stat-warn">불운?</td></tr>
                <tr><td>IVB</td><td class="stat-ok">42cm</td><td>38cm</td><td class="stat-ok">구위 유지</td></tr>
            </table>
            <div style="margin-top:10px;font-size:12px;color:var(--text-muted);">
                ERA는 높지만, xFIP와 BABIP를 보면 <strong>불운</strong>일 가능성도 있습니다.
                구위(IVB)는 여전히 살아있습니다. 어떻게 판단하시겠습니까?
            </div>`;
    } else {
        dataEl.innerHTML = `
            <div style="margin-bottom:8px;font-weight:700;color:var(--text-primary);">
                <span style="font-size:16px;">📊</span> 외국인 에이스 — 최근 성적 분석
            </div>
            <table>
                <tr><th>지표</th><th>현재</th><th>리그 평균</th><th>판단</th></tr>
                <tr><td>ERA</td><td class="stat-bad">6.50</td><td>4.20</td><td class="stat-bad">부진</td></tr>
                <tr><td>FIP</td><td class="stat-warn">4.80</td><td>4.10</td><td class="stat-warn">평균 이하</td></tr>
                <tr><td>xFIP</td><td class="stat-ok">3.90</td><td>4.10</td><td class="stat-ok">양호</td></tr>
                <tr><td>BABIP</td><td class="stat-bad">.350</td><td>.300</td><td class="stat-warn">불운?</td></tr>
                <tr><td>IVB</td><td class="stat-ok">42cm</td><td>38cm</td><td class="stat-ok">구위 유지</td></tr>
            </table>
            <div style="margin-top:10px;font-size:12px;color:var(--text-muted);">
                ERA는 높지만, xFIP와 BABIP를 보면 <strong>불운</strong>일 가능성도 있습니다.
                구위(IVB)는 여전히 살아있습니다. 어떻게 판단하시겠습니까?
            </div>`;
    }

    modal.style.display = 'flex';
    foreignScoutState.missionShown = true;
    saveForeignScoutState();
}

function closeMissionCard(choice) {
    const modal = document.getElementById('missionModal');
    if (modal) modal.style.display = 'none';

    foreignScoutState.missionChoice = choice;
    saveForeignScoutState();

    if (choice === 'replace') {
        showToast('외국인 스카우트에서 새 투수를 찾아보세요.', 'success');
        setTimeout(() => showView('foreign-scout'), 500);
    } else {
        showToast('기존 투수를 유지합니다. 외국인 스카우트에서 데이터를 비교해보세요.', 'info');
        setTimeout(() => showView('foreign-scout'), 500);
    }

    renderForeignScout();
}

// ── 1Q 종료 체크 ──
function checkForeignMissionTrigger() {
    const totalPlayed = getTotalGamesPlayed(state);
    if (totalPlayed >= 36 && !foreignScoutState.missionShown) {
        setTimeout(() => showMissionCard(), 800);
    }
}

// ── 국기 이미지 (flagcdn.com SVG, Windows 호환) ──
const NATIONALITY_CODES = {
    '미국': 'us', '도미니카': 'do', '베네수엘라': 've', '쿠바': 'cu',
    '푸에르토리코': 'pr', '일본': 'jp', '대만': 'tw', '호주': 'au',
    '중국': 'cn', '필리핀': 'ph', '태국': 'th', '인도네시아': 'id',
    '파키스탄': 'pk', '홍콩': 'hk', '한국': 'kr', '캐나다': 'ca',
    '멕시코': 'mx', '콜롬비아': 'co', '파나마': 'pa', '니카라과': 'ni',
};

function getFlagImg(nationality, size = 24) {
    const code = NATIONALITY_CODES[nationality];
    if (!code) return '';
    return `<img src="https://flagcdn.com/w40/${code}.png" alt="${nationality}" style="width:${size}px;height:auto;vertical-align:middle;border-radius:2px;">`;
}

// ── 외국인 스카우트 렌더링 ──
let currentFsMode = 'pitcher';

function renderForeignScout() {
    document.getElementById('fsEmpty').style.display = 'none';
    document.getElementById('fsResultTable').style.display = 'table';

    const userTeamCode = document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    const foreignInfo = calcForeignSalary(state, userTeamCode);
    const budgetEl = document.getElementById('fsTeamBudget');
    budgetEl.innerHTML = `현재 외국인: ${foreignInfo.count}명 / 최대 ${ASIA_QUOTA.maxPlayers}명`;

    if (currentFsMode === 'pitcher') {
        renderFsPitchers();
    } else {
        renderFsBatters();
    }
}

// ── 지표 설명 (툴팁) ──
const STAT_TOOLTIPS = {
    // 투수
    'ERA': '평균자책점. 투수가 9이닝당 허용하는 자책점. 낮을수록 좋음 (리그평균 ~4.00)',
    'FIP': '수비무관 평균자책점. 삼진/볼넷/홈런만으로 계산. ERA보다 투수 실력을 정확히 반영',
    'IVB': 'Induced Vertical Break. 직구의 수직 무브먼트(cm). 높을수록 타자가 헛스윙하기 쉬움',
    'CSW%': 'Called Strike + Whiff %. 스트라이크+헛스윙 비율. 높을수록 투수가 유리 (평균 ~28%)',
    'IP': '투구이닝. 시즌 동안 소화한 이닝 수. 선발은 150+ 이 우수',
    'SO': '탈삼진 수. 시즌 총 삼진 개수. 많을수록 지배적인 투수',
    // 타자
    'AVG': '타율. 안타/타수. 높을수록 좋음 (리그평균 ~.260)',
    'OPS': '출루율+장타율. 타자의 종합 생산성. .800 이상이면 우수',
    'wRC+': '조정 득점 생산력. 리그 평균=100, 120이면 평균보다 20% 우수',
    'Barrel%': '배럴 비율. 최적 타구각+속도 비율. 높을수록 장타 능력 우수 (10%+ 우수)',
    'HR': '홈런 수. 시즌 총 홈런 개수',
    'SB': '도루 수. 시즌 총 도루 개수. 주루 능력 지표',
    // 공통
    '출신': '선수의 최근 소속 리그 (MLB/AAA/NPB/CPBL 등)',
    '역할': '투수 역할 (선발/중계/마무리)',
    '연봉(만$)': '연봉 (만 달러 단위). 예: 100 = $1,000,000',
    '나이': '선수 나이 (세)',
    '포지션': '수비 포지션',
};

function thWithTip(label) {
    const tip = STAT_TOOLTIPS[label];
    if (tip) {
        return `<th class="fs-th-tip" data-tip="${tip}">${label}</th>`;
    }
    return `<th>${label}</th>`;
}

function renderFsPitchers() {
    const pool = filterForeignPitchers();
    document.getElementById('fsResultCount').textContent = `투수 후보 ${pool.length}명`;
    const cnt = document.getElementById('fsCountP');
    if (cnt) cnt.textContent = pool.length + '명';

    const thead = document.querySelector('#fsResultTable thead tr');
    thead.innerHTML =
        `<th style="width:30px;"></th><th>이름</th>` +
        thWithTip('출신') + thWithTip('역할') +
        thWithTip('연봉(만$)') + thWithTip('나이') +
        thWithTip('ERA') + thWithTip('FIP') +
        thWithTip('IVB') + thWithTip('CSW%') +
        thWithTip('IP') + thWithTip('SO') +
        `<th></th>`;

    const tbody = document.querySelector('#fsResultTable tbody');
    tbody.innerHTML = pool.map(p => {
        return `<tr onclick="showFsPlayerDetail('pitcher', '${p.name}')">
            <td onclick="event.stopPropagation()"><input type="checkbox" class="fs-compare-chk" data-name="${p.name}" data-type="pitcher" onchange="updateFsCompareBtn()"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.origin}</td>
            <td>${p.role}</td>
            <td>${p.salary}</td>
            <td>${p.age}</td>
            <td>${p.stats.ERA.toFixed(2)}</td>
            <td>${p.stats.FIP.toFixed(2)}</td>
            <td>${p.stats.IVB}</td>
            <td>${p.stats['CSW%']}</td>
            <td>${p.stats.IP}</td>
            <td>${p.stats.SO}</td>
            <td><button class="fs-recruit-btn" onclick="event.stopPropagation(); recruitForeignPlayer('pitcher','${p.name}')">영입</button></td>
        </tr>`;
    }).join('');
}

function renderFsBatters() {
    const pool = filterForeignBatters();
    document.getElementById('fsResultCount').textContent = `타자 후보 ${pool.length}명`;
    const cnt = document.getElementById('fsCountB');
    if (cnt) cnt.textContent = pool.length + '명';

    const thead = document.querySelector('#fsResultTable thead tr');
    thead.innerHTML =
        `<th style="width:30px;"></th><th>이름</th>` +
        thWithTip('출신') + thWithTip('포지션') +
        thWithTip('연봉(만$)') + thWithTip('나이') +
        thWithTip('AVG') + thWithTip('OPS') +
        thWithTip('wRC+') + thWithTip('Barrel%') +
        thWithTip('HR') + thWithTip('SB') +
        `<th></th>`;

    const tbody = document.querySelector('#fsResultTable tbody');
    tbody.innerHTML = pool.map(p => {
        return `<tr onclick="showFsPlayerDetail('batter', '${p.name}')">
            <td onclick="event.stopPropagation()"><input type="checkbox" class="fs-compare-chk" data-name="${p.name}" data-type="batter" onchange="updateFsCompareBtn()"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.origin}</td>
            <td>${p.position}</td>
            <td>${p.salary}</td>
            <td>${p.age}</td>
            <td>${p.stats.AVG.toFixed(3)}</td>
            <td>${p.stats.OPS.toFixed(3)}</td>
            <td>${p.stats['wRC+']}</td>
            <td>${p.stats['Barrel%']}</td>
            <td>${p.stats.HR}</td>
            <td>${p.stats.SB}</td>
            <td><button class="fs-recruit-btn" onclick="event.stopPropagation(); recruitForeignPlayer('batter','${p.name}')">영입</button></td>
        </tr>`;
    }).join('');
}

// ── 필터 로직 ──
function getFilterValues() {
    const vals = {};
    document.querySelectorAll('.fs-f').forEach(el => {
        const key = el.dataset.fs;
        if (el.type === 'checkbox') {
            if (!vals[key]) vals[key] = [];
            if (el.checked) vals[key].push(el.value);
        } else {
            vals[key] = el.value;
        }
    });
    return vals;
}

function filterForeignPitchers() {
    const f = getFilterValues();
    return FOREIGN_PITCHER_POOL.filter(p => {
        if (foreignScoutState.recruited.includes(p.name)) return false;
        if (f.type && f.type.length > 0 && !f.type.includes(p.type)) return false;
        if (f.tier && f.tier.length > 0 && !f.tier.includes(p.tier)) return false;
        if (f.role && f.role.length > 0 && !f.role.includes(p.role)) return false;
        if (f.salMin && p.salary < Number(f.salMin)) return false;
        if (f.salMax && p.salary > Number(f.salMax)) return false;
        if (f.stuffMin && p.ratings.stuff < Number(f.stuffMin)) return false;
        if (f.stuffMax && p.ratings.stuff > Number(f.stuffMax)) return false;
        if (f.commandMin && p.ratings.command < Number(f.commandMin)) return false;
        if (f.commandMax && p.ratings.command > Number(f.commandMax)) return false;
        const ovr = calcForeignPitcherOVR(p.ratings);
        if (f.ovrMin && ovr < Number(f.ovrMin)) return false;
        if (f.ovrMax && ovr > Number(f.ovrMax)) return false;
        return true;
    });
}

function getBatterFilterValues() {
    const vals = {};
    document.querySelectorAll('.fs-fb').forEach(el => {
        const key = el.dataset.fs;
        if (el.type === 'checkbox') {
            if (!vals[key]) vals[key] = [];
            if (el.checked) vals[key].push(el.value);
        } else {
            vals[key] = el.value;
        }
    });
    return vals;
}

function filterForeignBatters() {
    const f = getBatterFilterValues();
    return FOREIGN_BATTER_POOL.filter(p => {
        if (foreignScoutState.recruited.includes(p.name)) return false;
        if (f.type && f.type.length > 0 && !f.type.includes(p.type)) return false;
        if (f.pos && f.pos.length > 0 && !f.pos.includes(p.position)) return false;
        if (f.salMin && p.salary < Number(f.salMin)) return false;
        if (f.salMax && p.salary > Number(f.salMax)) return false;
        if (f.contactMin && p.ratings.contact < Number(f.contactMin)) return false;
        if (f.contactMax && p.ratings.contact > Number(f.contactMax)) return false;
        if (f.powerMin && p.ratings.power < Number(f.powerMin)) return false;
        if (f.powerMax && p.ratings.power > Number(f.powerMax)) return false;
        return true;
    });
}

// ── 선수 상세 (클릭) ──
function showFsPlayerDetail(type, name) {
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const p = pool.find(x => x.name === name);
    if (!p) return;

    const isAsia = p.type === '아시아쿼터';
    const tierInfo = FOREIGN_TIERS[p.tier];
    const salaryNote = isAsia
        ? `아시아쿼터 적용 (최대 ${ASIA_QUOTA.newRecruitCap}만$, 재계약 시 연 ${ASIA_QUOTA.renewalIncrease}만$ 인상)`
        : '외국인 계약';

    let statsHtml;
    if (type === 'pitcher') {
        statsHtml = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0;">
                <div class="fs-stat-box"><div class="fs-stat-label">ERA</div><div class="fs-stat-val">${p.stats.ERA.toFixed(2)}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">FIP</div><div class="fs-stat-val">${p.stats.FIP.toFixed(2)}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">xFIP</div><div class="fs-stat-val">${p.stats.xFIP.toFixed(2)}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">IVB</div><div class="fs-stat-val">${p.stats.IVB}cm</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">VAA</div><div class="fs-stat-val">${p.stats.VAA.toFixed(1)}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">CSW%</div><div class="fs-stat-val">${p.stats['CSW%']}%</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">IP</div><div class="fs-stat-val">${p.stats.IP}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">SO</div><div class="fs-stat-val">${p.stats.SO}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">BB</div><div class="fs-stat-val">${p.stats.BB}</div></div>
            </div>`;
    } else {
        statsHtml = `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0;">
                <div class="fs-stat-box"><div class="fs-stat-label">AVG</div><div class="fs-stat-val">${p.stats.AVG.toFixed(3)}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">OPS</div><div class="fs-stat-val">${p.stats.OPS.toFixed(3)}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">wRC+</div><div class="fs-stat-val">${p.stats['wRC+']}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">Barrel%</div><div class="fs-stat-val">${p.stats['Barrel%']}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">HR</div><div class="fs-stat-val">${p.stats.HR}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">BB</div><div class="fs-stat-val">${p.stats.BB}</div></div>
            </div>`;
    }

    const modal = document.getElementById('playerModal');
    const header = document.getElementById('playerModalHeader');
    const ratings = document.getElementById('playerModalRatings');
    const statsEl = document.getElementById('playerModalStats');

    header.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
            <div style="line-height:1;">${getFlagImg(p.nationality, 32)}</div>
            <div>
                <h3 style="margin:0;font-size:18px;">${p.name} <span style="font-size:12px;color:var(--text-muted);font-weight:400;margin-left:4px;">${p.origin}</span></h3>
                <div style="font-size:13px;color:var(--text-muted);">
                    ${p.nationality} · ${type === 'pitcher' ? p.role : p.position} · ${p.throwBat} · ${p.age}세
                    · ${p.height}cm/${p.weight}kg
                </div>
                <div style="margin-top:4px;font-size:13px;color:#fbbf24;">
                    연봉: ${p.salary}만$ ${isAsia ? '(아시아쿼터)' : ''}
                </div>
            </div>
        </div>`;

    ratings.innerHTML = statsHtml;

    statsEl.innerHTML = `
        <div style="background:rgba(251,191,36,0.08);border-radius:8px;padding:12px;margin-top:8px;">
            <div style="font-size:12px;font-weight:700;color:#fbbf24;margin-bottom:4px;">스카우팅 리포트</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${p.scouting}</div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">${salaryNote}</div>`;

    modal.style.display = 'flex';

    // X 버튼 + 오버레이 클릭 닫기
    const closeBtn = document.getElementById('playerModalClose');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// ── 영입 기능 ──
function recruitForeignPlayer(type, name) {
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const p = pool.find(x => x.name === name);
    if (!p) return;

    const userTeamCode = document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    const foreignInfo = calcForeignSalary(state, userTeamCode);

    if (p.type === '아시아쿼터') {
        const currentAsia = getTeamPlayers(state, userTeamCode).filter(pl => pl.isAsiaQuota).length;
        if (currentAsia >= ASIA_QUOTA.maxAsiaQuota) {
            showToast('아시아쿼터 선수는 최대 1명까지만 영입 가능합니다.', 'error');
            return;
        }
        if (p.salary > ASIA_QUOTA.newRecruitCap) {
            showToast(`아시아쿼터 신규 영입은 최대 ${ASIA_QUOTA.newRecruitCap}만$입니다.`, 'error');
            return;
        }
    } else {
        const currentClassic = getTeamPlayers(state, userTeamCode).filter(pl => pl.isForeign && !pl.isAsiaQuota).length;
        if (currentClassic >= ASIA_QUOTA.maxForeignClassic) {
            showToast('외국인 선수는 최대 3명까지만 보유 가능합니다.', 'error');
            return;
        }
    }

    if (foreignInfo.count >= ASIA_QUOTA.maxPlayers) {
        showToast('외국인 선수 총 4명 초과! 외국인을 방출해야 영입 가능합니다.', 'error');
        return;
    }

    const team = state.teams[userTeamCode];
    if (team.roster.length >= 29) {
        showToast('1군 29명 초과! 먼저 선수를 방출하거나 2군으로 내려보내세요.', 'error');
        return;
    }

    const newId = `fs_${Date.now()}`;
    const salaryInBillions = p.salary * 0.015;

    const newPlayer = {
        id: newId,
        name: p.name,
        team: userTeamCode,
        position: type === 'pitcher' ? 'P' : (p.position || 'RF'),
        role: type === 'pitcher' ? p.role : null,
        salary: Math.round(salaryInBillions * 10) / 10,
        isForeign: true,
        isAsiaQuota: p.type === '아시아쿼터',
        isFranchiseStar: false,
        stats: p.stats,
        powerScore: null,
        number: null,
        throwBat: p.throwBat,
        birth: null,
        age: p.age,
        height: p.height,
        weight: p.weight,
        nationality: p.nationality,
        tier: p.tier,
        origin: p.origin,
        ratings: p.ratings,
    };

    if (type === 'pitcher') {
        newPlayer.ovr = calcForeignPitcherOVR(p.ratings);
    } else {
        newPlayer.ovr = calcForeignBatterOVR(p.ratings);
    }

    state.players[newId] = newPlayer;
    team.roster.push(newId);

    foreignScoutState.recruited.push(p.name);
    saveForeignScoutState();

    localStorage.setItem('kbo-sim-state', JSON.stringify(state));

    showToast(`${p.name} 영입 완료! (${FOREIGN_TIERS[p.tier].label} / ${p.type === '아시아쿼터' ? '아시아쿼터' : '외국인'})`, 'success');
    renderForeignScout();
}

// ── 초기화 ──
function initForeignScout() {
    loadForeignScoutState();

    // 네비게이션 버튼 활성화
    const navBtn = document.getElementById('navForeignScout');
    if (navBtn) {
        navBtn.classList.remove('nav-btn--locked');
        navBtn.textContent = '외국인 스카우트';
        navBtn.addEventListener('click', () => {
            showView('foreign-scout');
        });
    }

    // 서브탭 전환 + 필터 토글
    function toggleFsFilters(mode) {
        const pf = document.getElementById('fsPitcherFilters');
        const bf = document.getElementById('fsBatterFilters');
        if (pf) pf.style.display = mode === 'pitcher' ? '' : 'none';
        if (bf) bf.style.display = mode === 'batter' ? '' : 'none';
    }

    document.querySelectorAll('#fsMainContainer .scout-mode-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#fsMainContainer .scout-mode-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFsMode = tab.dataset.fsTab;
            toggleFsFilters(currentFsMode);
            renderForeignScout();
        });
    });

    // 검색/초기화 버튼 (투수)
    document.getElementById('btnFsSearch')?.addEventListener('click', renderForeignScout);
    document.getElementById('btnFsReset')?.addEventListener('click', () => {
        document.querySelectorAll('.fs-f').forEach(el => {
            if (el.type === 'checkbox') el.checked = el.defaultChecked;
            else el.value = '';
        });
        renderForeignScout();
    });

    // 검색/초기화 버튼 (타자)
    document.getElementById('btnFsSearchB')?.addEventListener('click', renderForeignScout);
    document.getElementById('btnFsResetB')?.addEventListener('click', () => {
        document.querySelectorAll('.fs-fb').forEach(el => {
            if (el.type === 'checkbox') el.checked = el.defaultChecked;
            else el.value = '';
        });
        renderForeignScout();
    });

    // 비교 버튼
    document.getElementById('btnFsCompare')?.addEventListener('click', openFsCompare);
    document.getElementById('fsCompareBack')?.addEventListener('click', closeFsCompare);
    document.getElementById('btnFsAddKbo')?.addEventListener('click', addKboToCompare);

    // 미션 카드 선택 버튼
    document.getElementById('missionReplace')?.addEventListener('click', () => closeMissionCard('replace'));
    document.getElementById('missionKeep')?.addEventListener('click', () => closeMissionCard('keep'));

    // ── JS 툴팁 (헤더 호버 시 설명 표시) ──
    let tooltipEl = document.createElement('div');
    tooltipEl.className = 'fs-tooltip';
    document.body.appendChild(tooltipEl);

    document.addEventListener('mouseover', (e) => {
        const th = e.target.closest('.fs-th-tip');
        if (th && th.dataset.tip) {
            const rect = th.getBoundingClientRect();
            tooltipEl.textContent = th.dataset.tip;
            tooltipEl.style.opacity = '1';
            // 헤더 아래에 표시
            tooltipEl.style.top = (rect.bottom + 8) + 'px';
            tooltipEl.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 280)) + 'px';
        }
    });
    document.addEventListener('mouseout', (e) => {
        const th = e.target.closest('.fs-th-tip');
        if (th) tooltipEl.style.opacity = '0';
    });

    // ── ESC 키로 모달 닫기 ──
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const playerModal = document.getElementById('playerModal');
            if (playerModal && playerModal.style.display === 'flex') {
                playerModal.style.display = 'none';
                return;
            }
            const missionModal = document.getElementById('missionModal');
            if (missionModal && missionModal.style.display === 'flex') {
                missionModal.style.display = 'none';
                return;
            }
        }
    });
}

// ── 비교 기능 ──
let fsCompareKboPlayers = []; // 비교에 추가된 KBO 선수 목록

function updateFsCompareBtn() {
    const checked = document.querySelectorAll('.fs-compare-chk:checked');
    const btn = document.getElementById('btnFsCompare');
    const cnt = document.getElementById('fsCompareCount');
    if (btn) {
        btn.disabled = checked.length < 2;
        btn.style.opacity = checked.length < 2 ? '0.5' : '1';
        if (cnt) cnt.textContent = checked.length;
    }
}

function openFsCompare() {
    const checks = [...document.querySelectorAll('.fs-compare-chk:checked')];
    if (checks.length < 2) return;

    const type = currentFsMode; // 'pitcher' or 'batter'
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const selected = checks.map(cb => pool.find(p => p.name === cb.dataset.name)).filter(Boolean).slice(0, 5);

    fsCompareKboPlayers = [];

    // 페이지 전환
    document.getElementById('fsResultsArea').style.display = 'none';
    document.getElementById('fsLeftPanel').style.display = 'none';
    const page = document.getElementById('fsComparePage');
    page.style.display = '';

    // KBO 선수 드롭다운 채우기
    populateKboDropdown(type);

    renderFsCompare(selected, type);
}

function closeFsCompare() {
    document.getElementById('fsComparePage').style.display = 'none';
    document.getElementById('fsResultsArea').style.display = '';
    document.getElementById('fsLeftPanel').style.display = '';
    // 현재 모드에 맞는 필터 복원
    document.getElementById('fsPitcherFilters').style.display = currentFsMode === 'pitcher' ? '' : 'none';
    document.getElementById('fsBatterFilters').style.display = currentFsMode === 'batter' ? '' : 'none';
}

function populateKboDropdown(type) {
    const select = document.getElementById('fsKboPlayerSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- KBO 선수 선택 --</option>';

    const players = Object.values(state.players).filter(p => {
        if (type === 'pitcher') return p.position === 'P' || p.pos === 'P';
        return p.position !== 'P' && p.pos !== 'P';
    }).sort((a, b) => (b.ovr || 0) - (a.ovr || 0));

    players.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id || p.name;
        opt.textContent = `${p.name} (${p.team})`;
        select.appendChild(opt);
    });
}

function addKboToCompare() {
    const select = document.getElementById('fsKboPlayerSelect');
    if (!select || !select.value) return;

    const player = state.players[select.value];
    if (!player) return;
    if (fsCompareKboPlayers.find(p => (p.id || p.name) === select.value)) return;

    fsCompareKboPlayers.push(player);
    select.value = '';

    // 다시 렌더링
    const type = currentFsMode;
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const checks = [...document.querySelectorAll('.fs-compare-chk:checked')];
    const selected = checks.map(cb => pool.find(p => p.name === cb.dataset.name)).filter(Boolean).slice(0, 5);

    renderFsCompare(selected, type);
}

function renderFsCompare(foreignPlayers, type) {
    const container = document.getElementById('fsCompareContent');
    const isPitcher = type === 'pitcher';
    const colors = ['#2563eb', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];
    const kboColor = '#888888';

    const axes = isPitcher
        ? [{key:'stuff',label:'구위'},{key:'command',label:'제구'},{key:'stamina',label:'체력'},{key:'effectiveness',label:'효율'},{key:'consistency',label:'안정'}]
        : [{key:'contact',label:'컨택'},{key:'power',label:'파워'},{key:'eye',label:'선구안'},{key:'speed',label:'스피드'},{key:'defense',label:'수비'}];

    // 외국인 + KBO 합침
    const allPlayers = [...foreignPlayers];
    const allColors = foreignPlayers.map((_, i) => colors[i % colors.length]);
    const allLabels = foreignPlayers.map(p => `${getFlagImg(p.nationality, 16)} ${p.name}`);
    const allSublabels = foreignPlayers.map(p => p.origin);

    fsCompareKboPlayers.forEach((kp, ki) => {
        allPlayers.push(kp);
        allColors.push(kboColor);
        allLabels.push(`<span style="font-size:11px;color:#aaa;">KBO</span> ${kp.name}`);
        allSublabels.push(kp.team || '');
    });

    // 레이더 차트
    const cx = 160, cy = 150, radius = 110;
    const n = axes.length;
    const angleStep = (Math.PI * 2) / n;
    const startAngle = -Math.PI / 2;

    let gridLines = '';
    for (const level of [20, 40, 60, 80]) {
        const frac = (level - 20) / 60;
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = startAngle + i * angleStep;
            pts.push(`${cx + Math.cos(a) * radius * frac},${cy + Math.sin(a) * radius * frac}`);
        }
        gridLines += `<polygon points="${pts.join(' ')}" fill="none" stroke="var(--border)" stroke-width="0.5" opacity="0.5"/>`;
        // 눈금 라벨
        const labelA = startAngle;
        gridLines += `<text x="${cx + Math.cos(labelA) * radius * frac - 12}" y="${cy + Math.sin(labelA) * radius * frac}" font-size="9" fill="var(--text-muted)">${level}</text>`;
    }

    let axisLines = '';
    for (let i = 0; i < n; i++) {
        const a = startAngle + i * angleStep;
        axisLines += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * radius}" y2="${cy + Math.sin(a) * radius}" stroke="var(--border)" stroke-width="0.5" opacity="0.4"/>`;
    }

    let polygons = '';
    allPlayers.forEach((p, pi) => {
        const r = p.ratings || {};
        const pts = [];
        for (let i = 0; i < n; i++) {
            const a = startAngle + i * angleStep;
            const val = r[axes[i].key] || 20;
            const frac = Math.max(0, (val - 20) / 60);
            pts.push(`${cx + Math.cos(a) * radius * frac},${cy + Math.sin(a) * radius * frac}`);
        }
        polygons += `<polygon points="${pts.join(' ')}" fill="${allColors[pi]}" fill-opacity="0.12" stroke="${allColors[pi]}" stroke-width="2.5"/>`;
    });

    let labels = '';
    for (let i = 0; i < n; i++) {
        const a = startAngle + i * angleStep;
        const lx = cx + Math.cos(a) * (radius + 28);
        const ly = cy + Math.sin(a) * (radius + 28);
        labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="700" fill="var(--text-muted)">${axes[i].label}</text>`;
    }

    const radarSvg = `<svg viewBox="0 0 320 320" width="380" height="380" style="max-width:100%;display:block;margin:0 auto;">
        ${gridLines}${axisLines}${polygons}${labels}
    </svg>`;

    // 범례
    const legend = `<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:12px 0 24px;">
        ${allPlayers.map((p, i) => `<div style="display:flex;align-items:center;gap:6px;">
            <div style="width:14px;height:14px;border-radius:3px;background:${allColors[i]};"></div>
            <span style="font-size:13px;font-weight:600;">${allLabels[i]}</span>
            <span style="font-size:11px;color:var(--text-muted);">${allSublabels[i]}</span>
        </div>`).join('')}
    </div>`;

    // 스탯 비교 테이블
    let tableHeader = `<tr><th style="text-align:left;">항목</th>`;
    allPlayers.forEach((p, i) => {
        tableHeader += `<th style="color:${allColors[i]};font-size:12px;">${p.name}</th>`;
    });
    tableHeader += '</tr>';

    const ratingRows = axes.map(t => {
        const vals = allPlayers.map(p => (p.ratings || {})[t.key] || 0);
        const maxVal = Math.max(...vals);
        return `<tr><td style="font-weight:600;">${t.label}</td>${allPlayers.map((p, i) => {
            const v = (p.ratings || {})[t.key] || 0;
            const isBest = v === maxVal && maxVal > 0;
            return `<td style="text-align:center;${isBest ? 'font-weight:900;color:' + allColors[i] : ''}">${v}</td>`;
        }).join('')}</tr>`;
    });

    // 주요 스탯 비교
    const statDefs = isPitcher
        ? [{key:'ERA',fmt:v=>v.toFixed(2),best:'min'},{key:'FIP',fmt:v=>v.toFixed(2),best:'min'},{key:'CSW%',best:'max'},{key:'IP',best:'max'},{key:'SO',best:'max'}]
        : [{key:'AVG',fmt:v=>v.toFixed(3),best:'max'},{key:'OPS',fmt:v=>v.toFixed(3),best:'max'},{key:'wRC+',best:'max'},{key:'HR',best:'max'},{key:'Barrel%',best:'max'}];

    const statRows = statDefs.map(sd => {
        const vals = allPlayers.map(p => {
            const s = p.stats || {};
            return s[sd.key] != null ? s[sd.key] : '-';
        });
        const numVals = vals.filter(v => typeof v === 'number');
        const bestVal = sd.best === 'max' ? Math.max(...numVals) : Math.min(...numVals);
        return `<tr><td style="font-weight:600;">${sd.key}</td>${allPlayers.map((p, i) => {
            const v = (p.stats || {})[sd.key];
            if (v == null) return '<td style="text-align:center;color:var(--text-muted);">-</td>';
            const display = sd.fmt ? sd.fmt(v) : v;
            const isBest = v === bestVal;
            return `<td style="text-align:center;${isBest ? 'font-weight:900;color:' + allColors[i] : ''}">${display}</td>`;
        }).join('')}</tr>`;
    });

    // 연봉/나이
    const metaRows = [
        {label:'연봉',fn:p=>p.salary||0,best:'min',fmt:v=>v+'만$'},
        {label:'나이',fn:p=>p.age||0,best:'min'},
    ].map(er => {
        const vals = allPlayers.map(er.fn);
        const bestVal = er.best === 'min' ? Math.min(...vals.filter(v=>v>0)) : Math.max(...vals);
        return `<tr style="border-top:1px solid var(--border);"><td style="font-weight:600;">${er.label}</td>${allPlayers.map((p, i) => {
            const v = er.fn(p);
            const isBest = v === bestVal && v > 0;
            return `<td style="text-align:center;${isBest ? 'font-weight:900;color:' + allColors[i] : ''}">${er.fmt ? er.fmt(v) : v}</td>`;
        }).join('')}</tr>`;
    }).join('');

    container.innerHTML = `
        ${legend}
        <table class="player-table" style="max-width:800px;margin:0 auto;">
            <thead>${tableHeader}</thead>
            <tbody>
                <tr><td colspan="${allPlayers.length+1}" style="font-weight:700;background:rgba(0,174,239,0.05);padding:6px 10px;">주요 기록</td></tr>
                ${statRows.join('')}
                ${metaRows}
            </tbody>
        </table>
    `;
}

// 전역 노출
window.ASIA_QUOTA = ASIA_QUOTA;
window.FOREIGN_TIERS = FOREIGN_TIERS;
window.FOREIGN_PITCHER_POOL = FOREIGN_PITCHER_POOL;
window.FOREIGN_BATTER_POOL = FOREIGN_BATTER_POOL;
window.foreignScoutState = foreignScoutState;
window.initForeignScout = initForeignScout;
window.checkForeignMissionTrigger = checkForeignMissionTrigger;
window.renderForeignScout = renderForeignScout;
window.showFsPlayerDetail = showFsPlayerDetail;
window.recruitForeignPlayer = recruitForeignPlayer;
window.showMissionCard = showMissionCard;
window.unlockForeignScoutTab = unlockForeignScoutTab;
window.unlockBatterTab = unlockBatterTab;
window.updateFsCompareBtn = updateFsCompareBtn;
window.openFsCompare = openFsCompare;
window.closeFsCompare = closeFsCompare;
window.addKboToCompare = addKboToCompare;
