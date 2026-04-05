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
      stats: { ERA: 4.56, FIP: 4.20, xFIP: 4.10, BABIP: 0.305, IVB: 28, VAA: -5.8, 'CSW%': 27, IP: 148, SO: 108, BB: 32, HR: 22, 'K/9': 6.6, 'Putaway%': 21.3 },
      ratings: { stuff: 52, command: 72, stamina: 70, effectiveness: 65, consistency: 62 },
      scouting: '전 TB/KC 좌완 이닝이터. 구속은 낮지만 뛰어난 제구력과 체인지업. KBO에서 이닝 소화 기대' },

    { name: 'Drew Smyly', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 150, age: 37, throwBat: '좌투좌타', height: 191, weight: 86,
      stats: { ERA: 4.85, FIP: 4.50, xFIP: 4.35, BABIP: 0.310, IVB: 32, VAA: -5.2, 'CSW%': 28, IP: 135, SO: 125, BB: 45, HR: 24, 'K/9': 8.3, 'Putaway%': 24.9 },
      ratings: { stuff: 55, command: 65, stamina: 58, effectiveness: 60, consistency: 58 },
      scouting: '전 CHC 베테랑 좌완. 커브볼 스핀레이트 높고 MLB 통산 56승. 노장 리스크 존재' },

    { name: 'Michael Lorenzen', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 130, age: 34, throwBat: '우투우타', height: 185, weight: 98,
      stats: { ERA: 5.20, FIP: 4.60, xFIP: 4.45, BABIP: 0.330, IVB: 38, VAA: -4.5, 'CSW%': 26, IP: 120, SO: 105, BB: 48, HR: 18, 'K/9': 7.9, 'Putaway%': 23.9 },
      ratings: { stuff: 62, command: 55, stamina: 52, effectiveness: 55, consistency: 50 },
      scouting: '전 PHI/DET. 노히트 경험자. MLB에서 부진했으나 구위는 살아있음. 불펜 전환도 가능' },

    { name: 'Zach Davies', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 110, age: 33, throwBat: '우투우타', height: 183, weight: 81,
      stats: { ERA: 5.05, FIP: 4.80, xFIP: 4.65, BABIP: 0.315, IVB: 30, VAA: -5.5, 'CSW%': 24, IP: 140, SO: 95, BB: 38, HR: 25, 'K/9': 6.1, 'Putaway%': 19.8 },
      ratings: { stuff: 45, command: 68, stamina: 65, effectiveness: 58, consistency: 60 },
      scouting: '전 MIL/SD/CHC. 연식 투수 전형. 구속 낮지만 제구력과 이닝 소화 탁월. KBO 적응 빠를 듯' },

    { name: 'Wily Peralta', tier: 'T1', nationality: '도미니카', type: '기존외국인', origin: 'MLB', role: '중계',
      salary: 100, age: 36, throwBat: '우투우타', height: 185, weight: 108,
      stats: { ERA: 3.90, FIP: 3.70, xFIP: 3.85, BABIP: 0.295, IVB: 40, VAA: -4.2, 'CSW%': 29, IP: 68, SO: 55, BB: 25, HR: 8, 'K/9': 7.3, 'Putaway%': 24.3 },
      ratings: { stuff: 58, command: 58, stamina: 40, effectiveness: 58, consistency: 55 },
      scouting: '전 MIL/DET/BOS. 싱커 위주 그라운드볼 투수. 불펜에서 안정적 이닝 소화 가능' },

    // === T2: AAA/NPB/KBO복귀 (OVR 110~150, $0.5M~1M) ===
    { name: 'Tobias Myers', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 70, age: 28, throwBat: '우투우타', height: 190, weight: 91,
      stats: { ERA: 4.10, FIP: 3.85, xFIP: 3.90, BABIP: 0.300, IVB: 36, VAA: -4.5, 'CSW%': 29, IP: 145, SO: 130, BB: 40, HR: 18, 'K/9': 8.1, 'Putaway%': 24.4 },
      ratings: { stuff: 55, command: 58, stamina: 60, effectiveness: 55, consistency: 55 },
      scouting: 'AAA에서 안정적 성적. 패스트볼/슬라이더 조합 좋고 이닝 소화력 우수' },

    { name: 'Adrian Martinez', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 65, age: 27, throwBat: '우투우타', height: 196, weight: 100,
      stats: { ERA: 4.35, FIP: 4.00, xFIP: 3.95, BABIP: 0.315, IVB: 34, VAA: -4.8, 'CSW%': 27, IP: 155, SO: 120, BB: 48, HR: 20, 'K/9': 7.0, 'Putaway%': 24.6 },
      ratings: { stuff: 52, command: 52, stamina: 62, effectiveness: 52, consistency: 52 },
      scouting: '전 OAK 40인 로스터. AAA 이닝이터. 체구 좋고 체력 우수하나 탈삼진 부족' },

    { name: '다나카 유키', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '선발',
      salary: 18, age: 30, throwBat: '우투우타', height: 182, weight: 83,
      stats: { ERA: 3.45, FIP: 3.50, xFIP: 3.55, BABIP: 0.290, IVB: 36, VAA: -4.3, 'CSW%': 31, IP: 158, SO: 142, BB: 38, HR: 15, 'K/9': 8.1, 'Putaway%': 26.7 },
      ratings: { stuff: 55, command: 62, stamina: 62, effectiveness: 58, consistency: 62 },
      scouting: 'NPB 2군 통산 40승급. 1군 등판 기회 부족. 제구력과 이닝 소화력 우수' },

    { name: '사토 켄타', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '선발',
      salary: 20, age: 31, throwBat: '우투우타', height: 185, weight: 88,
      stats: { ERA: 3.65, FIP: 3.50, xFIP: 3.45, BABIP: 0.300, IVB: 38, VAA: -4.0, 'CSW%': 30, IP: 145, SO: 135, BB: 40, HR: 16, 'K/9': 8.4, 'Putaway%': 26.3 },
      ratings: { stuff: 55, command: 58, stamina: 58, effectiveness: 56, consistency: 58 },
      scouting: 'NPB 퍼시픽리그 2군 에이스급. 다구종 투수, 변화구 제구 뛰어남. 1군 벽 못 넘음' },

    { name: 'Nick Margevicius', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '중계',
      salary: 55, age: 28, throwBat: '좌투좌타', height: 193, weight: 95,
      stats: { ERA: 3.80, FIP: 3.60, xFIP: 3.70, BABIP: 0.300, IVB: 30, VAA: -5.0, 'CSW%': 26, IP: 70, SO: 62, BB: 22, HR: 8, 'K/9': 8.0, 'Putaway%': 22.6 },
      ratings: { stuff: 48, command: 58, stamina: 42, effectiveness: 52, consistency: 55 },
      scouting: '전 SD/CLE. 좌완 롱릴리프 가능. 구속은 낮지만 좌타자 상대 강점' },

    { name: 'Brandon Pfaadt', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 80, age: 27, throwBat: '우투우타', height: 193, weight: 98,
      stats: { ERA: 4.75, FIP: 4.20, xFIP: 4.00, BABIP: 0.325, IVB: 42, VAA: -3.8, 'CSW%': 30, IP: 160, SO: 155, BB: 50, HR: 22, 'K/9': 8.7, 'Putaway%': 25.3 },
      ratings: { stuff: 62, command: 52, stamina: 58, effectiveness: 55, consistency: 50 },
      scouting: '전 ARI 유망주. MLB에서 피홈런 많았으나 구위 상급. KBO에서 에이스급 기대' },

    // === T3: CPBL/중남미 (OVR 100~130, $0.2M~0.5M) ===
    { name: '린청룽', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '중계',
      salary: 25, age: 26, throwBat: '좌투좌타', height: 180, weight: 78,
      stats: { ERA: 2.90, FIP: 3.10, xFIP: 3.20, BABIP: 0.285, IVB: 34, VAA: -4.1, 'CSW%': 29, IP: 62, SO: 68, BB: 18, HR: 5, 'K/9': 9.9, 'Putaway%': 27.7 },
      ratings: { stuff: 52, command: 58, stamina: 35, effectiveness: 55, consistency: 58 },
      scouting: 'CPBL 최우수 중계. 좌완 사이드암, 좌타자 상대 피안타율 .190' },

    { name: '왕웨이', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '마무리',
      salary: 30, age: 27, throwBat: '우투우타', height: 183, weight: 85, velocity: 155,
      stats: { ERA: 2.50, FIP: 2.70, xFIP: 2.90, BABIP: 0.270, IVB: 40, VAA: -3.6, 'CSW%': 33, IP: 52, SO: 65, BB: 15, HR: 3, 'K/9': 11.3, 'Putaway%': 31.7 },
      ratings: { stuff: 58, command: 58, stamina: 30, effectiveness: 60, consistency: 55 },
      scouting: 'CPBL 세이브왕. 155km 직구와 날카로운 슬라이더 보유' },

    { name: 'Jose Castillo', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 35, age: 25, throwBat: '좌투좌타', height: 185, weight: 88, velocity: 150,
      stats: { ERA: 3.70, FIP: 3.50, xFIP: 3.60, BABIP: 0.305, IVB: 36, VAA: -4.5, 'CSW%': 28, IP: 130, SO: 115, BB: 42, HR: 14, 'K/9': 8.0, 'Putaway%': 24.5 },
      ratings: { stuff: 55, command: 50, stamina: 52, effectiveness: 50, consistency: 48 },
      scouting: '베네수엘라 윈터리그 MVP. 좌완 150km대 직구. 제구 불안하나 구위 잠재력 큼' },

    { name: 'Miguel Diaz', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '중계',
      salary: 28, age: 28, throwBat: '우투우타', height: 188, weight: 95, velocity: 155,
      stats: { ERA: 3.40, FIP: 3.20, xFIP: 3.35, BABIP: 0.290, IVB: 42, VAA: -3.8, 'CSW%': 31, IP: 58, SO: 65, BB: 22, HR: 5, 'K/9': 10.1, 'Putaway%': 27.5 },
      ratings: { stuff: 60, command: 48, stamina: 32, effectiveness: 52, consistency: 45 },
      scouting: '전 SD 마이너 출신. 도미니카 윈터리그 활약. 155km 싱커 보유, 제구 불안' },

    // === T4: AA/쿠바 (OVR 85~110, $0.1M~0.3M) ===
    { name: 'Yoendrys Gomez', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', role: '선발',
      salary: 20, age: 24, throwBat: '우투우타', height: 185, weight: 88, velocity: 152,
      stats: { ERA: 4.20, FIP: 3.80, xFIP: 3.90, BABIP: 0.310, IVB: 38, VAA: -4.2, 'CSW%': 28, IP: 110, SO: 105, BB: 45, HR: 12, 'K/9': 8.6, 'Putaway%': 24.3 },
      ratings: { stuff: 58, command: 42, stamina: 48, effectiveness: 45, consistency: 42 },
      scouting: '쿠바 탈출 유망주. AA급 구위. 포심 152km, 슬라이더 날카로우나 이닝 소화 미지수' },

    { name: 'Elvis Alvarado', tier: 'T4', nationality: '베네수엘라', type: '기존외국인', origin: 'AA', role: '중계',
      salary: 15, age: 23, throwBat: '좌투좌타', height: 183, weight: 82,
      stats: { ERA: 3.90, FIP: 3.60, xFIP: 3.75, BABIP: 0.300, IVB: 32, VAA: -4.6, 'CSW%': 26, IP: 55, SO: 52, BB: 25, HR: 6, 'K/9': 8.5, 'Putaway%': 22.8 },
      ratings: { stuff: 50, command: 42, stamina: 35, effectiveness: 42, consistency: 40 },
      scouting: 'AA 좌완 유망주. 체인지업 좋으나 전체적 구위 부족. 저렴한 불펜 옵션' },

    { name: 'Daysbel Hernandez', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', role: '마무리',
      salary: 22, age: 26, throwBat: '우투우타', height: 190, weight: 95, velocity: 156,
      stats: { ERA: 3.50, FIP: 3.30, xFIP: 3.50, BABIP: 0.285, IVB: 44, VAA: -3.5, 'CSW%': 32, IP: 48, SO: 58, BB: 22, HR: 4, 'K/9': 10.9, 'Putaway%': 29.0 },
      ratings: { stuff: 62, command: 40, stamina: 28, effectiveness: 48, consistency: 38 },
      scouting: '쿠바 국대 출신. 156km 직구와 파워 슬라이더. 제구 불안하나 마무리 잠재력' },

    // === T5: 독립리그/ABL (OVR 80~95, $0.1M~0.3M) ===
    { name: 'Jack Murray', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '선발',
      salary: 15, age: 27, throwBat: '좌투좌타', height: 190, weight: 92,
      stats: { ERA: 3.80, FIP: 3.55, xFIP: 3.50, BABIP: 0.310, IVB: 36, VAA: -4.4, 'CSW%': 28, IP: 120, SO: 108, BB: 35, HR: 12, 'K/9': 8.1, 'Putaway%': 23.5 },
      ratings: { stuff: 48, command: 50, stamina: 52, effectiveness: 48, consistency: 48 },
      scouting: 'ABL MVP 출신 좌완. WBC 호주 대표, 가성비형. 구위 평범하나 안정적' },

    { name: 'Ty Tice', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '중계',
      salary: 12, age: 27, throwBat: '우투우타', height: 183, weight: 88,
      stats: { ERA: 3.50, FIP: 3.40, xFIP: 3.55, BABIP: 0.295, IVB: 34, VAA: -4.3, 'CSW%': 27, IP: 60, SO: 55, BB: 18, HR: 6, 'K/9': 8.3, 'Putaway%': 25.1 },
      ratings: { stuff: 45, command: 48, stamina: 38, effectiveness: 45, consistency: 48 },
      scouting: '독립리그 올스타. 전 TOR 마이너. 저비용 불펜 보강용, 리스크 낮음' },

    { name: 'Ryan Burr', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '마무리',
      salary: 15, age: 31, throwBat: '우투우타', height: 185, weight: 95,
      stats: { ERA: 3.20, FIP: 3.10, xFIP: 3.30, BABIP: 0.280, IVB: 38, VAA: -3.9, 'CSW%': 30, IP: 52, SO: 55, BB: 15, HR: 5, 'K/9': 9.5, 'Putaway%': 27.2 },
      ratings: { stuff: 50, command: 50, stamina: 30, effectiveness: 48, consistency: 45 },
      scouting: '전 ARI 마이너, 독립리그 세이브왕. 경험 많고 안정적이나 구위 한계 존재' },

    { name: 'Ben Holmes', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '중계',
      salary: 10, age: 25, throwBat: '우투우타', height: 188, weight: 90,
      stats: { ERA: 4.10, FIP: 3.90, xFIP: 4.00, BABIP: 0.305, IVB: 30, VAA: -4.7, 'CSW%': 24, IP: 48, SO: 40, BB: 18, HR: 6, 'K/9': 7.5, 'Putaway%': 22.6 },
      ratings: { stuff: 42, command: 42, stamina: 35, effectiveness: 40, consistency: 42 },
      scouting: 'ABL 호주 대표 후보. 최저비용 옵션. 성장 가능성에 베팅하는 영입' },

    // === 추가 투수 (T1~T5 균등 배분) ===
    // T1 추가
    { name: 'Taijuan Walker', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 140, age: 33, throwBat: '우투우타', height: 193, weight: 102,
      stats: { ERA: 4.80, FIP: 4.40, xFIP: 4.25, BABIP: 0.320, IVB: 36, VAA: -4.3, 'CSW%': 28, IP: 140, SO: 128, BB: 45, HR: 20, 'K/9': 8.2, 'Putaway%': 25.5 },
      ratings: { stuff: 58, command: 55, stamina: 58, effectiveness: 55, consistency: 52 },
      scouting: '전 NYM/PHI. 스플리터 위력적. MLB 통산 ERA 4.20, KBO에서 에이스급 기대' },

    { name: 'Jose Urquidy', tier: 'T1', nationality: '멕시코', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 115, age: 30, throwBat: '우투우타', height: 183, weight: 90,
      stats: { ERA: 5.00, FIP: 4.55, xFIP: 4.40, BABIP: 0.315, IVB: 32, VAA: -4.8, 'CSW%': 26, IP: 125, SO: 105, BB: 35, HR: 22, 'K/9': 7.6, 'Putaway%': 21.7 },
      ratings: { stuff: 52, command: 60, stamina: 55, effectiveness: 52, consistency: 55 },
      scouting: '전 HOU WS 우승 멤버. 제구력 우수하나 구위 하락 추세. 이닝 소화형' },

    { name: 'Matt Boyd', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 105, age: 34, throwBat: '좌투좌타', height: 185, weight: 95,
      stats: { ERA: 5.30, FIP: 4.70, xFIP: 4.50, BABIP: 0.325, IVB: 34, VAA: -5.0, 'CSW%': 27, IP: 115, SO: 110, BB: 38, HR: 24, 'K/9': 8.6, 'Putaway%': 24.5 },
      ratings: { stuff: 55, command: 52, stamina: 50, effectiveness: 50, consistency: 48 },
      scouting: '전 DET/CLE 좌완. 체인지업이 주무기. MLB에서 피홈런 많았으나 KBO 적응 기대' },

    { name: 'Trevor Williams', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 100, age: 33, throwBat: '우투우타', height: 191, weight: 100,
      stats: { ERA: 4.60, FIP: 4.35, xFIP: 4.20, BABIP: 0.300, IVB: 30, VAA: -5.2, 'CSW%': 25, IP: 150, SO: 115, BB: 40, HR: 18, 'K/9': 6.9, 'Putaway%': 20.7 },
      ratings: { stuff: 48, command: 62, stamina: 62, effectiveness: 55, consistency: 58 },
      scouting: '전 PIT/CHC/WSH. 이닝이터 전형. 구속 낮지만 제구력과 경험 풍부' },

    // T2 추가
    { name: 'Daniel Lynch', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 75, age: 28, throwBat: '좌투좌타', height: 198, weight: 98,
      stats: { ERA: 4.50, FIP: 4.10, xFIP: 4.00, BABIP: 0.320, IVB: 34, VAA: -4.6, 'CSW%': 28, IP: 135, SO: 125, BB: 50, HR: 16, 'K/9': 8.3, 'Putaway%': 25.9 },
      ratings: { stuff: 58, command: 48, stamina: 55, effectiveness: 52, consistency: 48 },
      scouting: '전 KC 유망주. 좌완 198cm 장신. 구위 좋으나 제구 불안정. 잠재력 높음' },

    { name: 'Konnor Pilkington', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 60, age: 28, throwBat: '좌투좌타', height: 191, weight: 95,
      stats: { ERA: 4.25, FIP: 4.00, xFIP: 3.95, BABIP: 0.305, IVB: 30, VAA: -5.0, 'CSW%': 27, IP: 140, SO: 118, BB: 42, HR: 18, 'K/9': 7.6, 'Putaway%': 23.5 },
      ratings: { stuff: 52, command: 55, stamina: 58, effectiveness: 52, consistency: 52 },
      scouting: '전 CLE AAA. 좌완 연식 투수. 체인지업 우수, 이닝 소화력 좋음' },

    { name: '스즈키 료', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '중계',
      salary: 16, age: 25, throwBat: '우투우타', height: 178, weight: 80,
      stats: { ERA: 3.30, FIP: 3.15, xFIP: 3.25, BABIP: 0.295, IVB: 42, VAA: -3.9, 'CSW%': 31, IP: 55, SO: 60, BB: 16, HR: 4, 'K/9': 9.8, 'Putaway%': 27.9 },
      ratings: { stuff: 58, command: 55, stamina: 35, effectiveness: 56, consistency: 52 },
      scouting: 'NPB 퓨처스 출신. IVB 높은 라이징 패스트볼, 성장 가능성 큼' },

    { name: '모리타 히로시', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '마무리',
      salary: 18, age: 27, throwBat: '우투우타', height: 180, weight: 82, velocity: 152,
      stats: { ERA: 2.80, FIP: 2.90, xFIP: 3.10, BABIP: 0.275, IVB: 40, VAA: -3.6, 'CSW%': 33, IP: 50, SO: 58, BB: 18, HR: 4, 'K/9': 10.4, 'Putaway%': 29.6 },
      ratings: { stuff: 60, command: 55, stamina: 30, effectiveness: 58, consistency: 52 },
      scouting: 'NPB 2군 세이브왕. 152km 직구와 포크볼 조합. 마무리 적합' },

    { name: 'Cole Irvin', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 65, age: 31, throwBat: '좌투좌타', height: 193, weight: 95,
      stats: { ERA: 4.40, FIP: 4.20, xFIP: 4.15, BABIP: 0.300, IVB: 28, VAA: -5.5, 'CSW%': 25, IP: 155, SO: 110, BB: 35, HR: 22, 'K/9': 6.4, 'Putaway%': 20.6 },
      ratings: { stuff: 45, command: 62, stamina: 62, effectiveness: 55, consistency: 58 },
      scouting: '전 OAK/BAL 좌완. 이닝이터. 구속 낮지만 뛰어난 제구력. KBO 적응 빠를 듯' },

    // T3 추가
    { name: 'Pedro Fernandez', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 35, age: 24, throwBat: '우투우타', height: 190, weight: 92, velocity: 153,
      stats: { ERA: 3.60, FIP: 3.40, xFIP: 3.50, BABIP: 0.300, IVB: 38, VAA: -4.2, 'CSW%': 29, IP: 120, SO: 110, BB: 40, HR: 12, 'K/9': 8.3, 'Putaway%': 24.0 },
      ratings: { stuff: 58, command: 48, stamina: 50, effectiveness: 48, consistency: 45 },
      scouting: '도미니카 윈터리그 신인왕. 153km 직구, 슬라이더 날카로움. 제구 불안' },

    { name: '황웨이한', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '선발',
      salary: 20, age: 28, throwBat: '좌투좌타', height: 183, weight: 85,
      stats: { ERA: 3.20, FIP: 3.30, xFIP: 3.40, BABIP: 0.290, IVB: 32, VAA: -4.8, 'CSW%': 28, IP: 140, SO: 120, BB: 35, HR: 14, 'K/9': 7.7, 'Putaway%': 22.9 },
      ratings: { stuff: 50, command: 58, stamina: 58, effectiveness: 55, consistency: 55 },
      scouting: 'CPBL 다승왕. 좌완 제구형. 이닝 소화력 우수하고 안정적' },

    { name: 'Luis Medina', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '중계',
      salary: 25, age: 25, throwBat: '우투우타', height: 185, weight: 88, velocity: 156,
      stats: { ERA: 3.80, FIP: 3.50, xFIP: 3.60, BABIP: 0.305, IVB: 44, VAA: -3.5, 'CSW%': 30, IP: 55, SO: 62, BB: 28, HR: 5, 'K/9': 10.1, 'Putaway%': 29.1 },
      ratings: { stuff: 62, command: 42, stamina: 32, effectiveness: 48, consistency: 40 },
      scouting: '전 OAK 마이너. 156km 직구 보유. 삼진 능력 뛰어나나 볼넷 많음' },

    { name: 'Ricardo Sanchez', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 30, age: 26, throwBat: '좌투좌타', height: 178, weight: 82,
      stats: { ERA: 3.50, FIP: 3.40, xFIP: 3.50, BABIP: 0.295, IVB: 30, VAA: -4.9, 'CSW%': 27, IP: 130, SO: 108, BB: 38, HR: 14, 'K/9': 7.5, 'Putaway%': 24.8 },
      ratings: { stuff: 50, command: 52, stamina: 55, effectiveness: 50, consistency: 50 },
      scouting: '베네수엘라 리그 좌완. 커브+체인지업 조합. 무난한 이닝 소화형' },

    // T4 추가
    { name: 'Osiel Rodriguez', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', role: '선발',
      salary: 22, age: 23, throwBat: '우투우타', height: 188, weight: 90, velocity: 154,
      stats: { ERA: 4.00, FIP: 3.70, xFIP: 3.80, BABIP: 0.310, IVB: 40, VAA: -4.0, 'CSW%': 29, IP: 100, SO: 98, BB: 42, HR: 10, 'K/9': 8.8, 'Putaway%': 26.7 },
      ratings: { stuff: 60, command: 42, stamina: 45, effectiveness: 45, consistency: 40 },
      scouting: '쿠바 세리에 유망주. 154km 직구+커브. 제구 미완성이나 구위 잠재력 높음' },

    { name: 'Junior Garcia', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', role: '중계',
      salary: 12, age: 24, throwBat: '좌투좌타', height: 180, weight: 78,
      stats: { ERA: 3.70, FIP: 3.50, xFIP: 3.60, BABIP: 0.300, IVB: 32, VAA: -4.5, 'CSW%': 27, IP: 50, SO: 48, BB: 20, HR: 5, 'K/9': 8.6, 'Putaway%': 24.6 },
      ratings: { stuff: 50, command: 45, stamina: 32, effectiveness: 44, consistency: 42 },
      scouting: 'AA 좌완 릴리버. 좌타자 상대 피안타율 .200. 원포인트 가치' },

    { name: 'Prelander Berroa', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 18, age: 25, throwBat: '우투우타', height: 185, weight: 85,
      stats: { ERA: 4.30, FIP: 3.90, xFIP: 4.00, BABIP: 0.315, IVB: 36, VAA: -4.3, 'CSW%': 28, IP: 105, SO: 100, BB: 48, HR: 12, 'K/9': 8.6, 'Putaway%': 25.9 },
      ratings: { stuff: 55, command: 40, stamina: 48, effectiveness: 42, consistency: 38 },
      scouting: '전 CHW 유망주. 구위 좋으나 제구 극도로 불안. 하이리스크 하이리턴' },

    // T5 추가
    { name: 'Matt Tabor', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '선발',
      salary: 12, age: 26, throwBat: '우투우타', height: 190, weight: 88,
      stats: { ERA: 3.90, FIP: 3.70, xFIP: 3.80, BABIP: 0.305, IVB: 34, VAA: -4.5, 'CSW%': 26, IP: 110, SO: 90, BB: 32, HR: 12, 'K/9': 7.4, 'Putaway%': 23.2 },
      ratings: { stuff: 48, command: 48, stamina: 50, effectiveness: 46, consistency: 45 },
      scouting: 'ABL 올스타. 전 ARI 마이너. 가성비 이닝이터, 리스크 낮음' },

    { name: 'Kevin Magee', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '중계',
      salary: 10, age: 28, throwBat: '우투우타', height: 183, weight: 85,
      stats: { ERA: 3.40, FIP: 3.20, xFIP: 3.40, BABIP: 0.290, IVB: 36, VAA: -4.2, 'CSW%': 28, IP: 55, SO: 50, BB: 15, HR: 5, 'K/9': 8.2, 'Putaway%': 24.3 },
      ratings: { stuff: 48, command: 50, stamina: 35, effectiveness: 46, consistency: 46 },
      scouting: '독립리그 최우수 중계. 제구 안정적. 저비용 불펜 보강 옵션' },

    { name: 'Dylan File', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '선발',
      salary: 12, age: 29, throwBat: '우투우타', height: 185, weight: 90,
      stats: { ERA: 3.70, FIP: 3.60, xFIP: 3.70, BABIP: 0.300, IVB: 30, VAA: -5.0, 'CSW%': 25, IP: 125, SO: 95, BB: 30, HR: 14, 'K/9': 6.8, 'Putaway%': 21.3 },
      ratings: { stuff: 45, command: 52, stamina: 52, effectiveness: 45, consistency: 48 },
      scouting: '전 MIL 마이너, 독립리그. 이닝 소화력 좋고 볼넷 적음. 가성비형' },

    { name: 'Emilio Vargas', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 28, age: 26, throwBat: '우투우타', height: 188, weight: 90,
      stats: { ERA: 3.45, FIP: 3.30, xFIP: 3.45, BABIP: 0.295, IVB: 36, VAA: -4.3, 'CSW%': 29, IP: 125, SO: 115, BB: 38, HR: 12, 'K/9': 8.3, 'Putaway%': 24.8 },
      ratings: { stuff: 55, command: 50, stamina: 52, effectiveness: 50, consistency: 48 },
      scouting: '전 OAK 마이너. 도미니카 윈터리그 활약. 직구+슬라이더 조합 좋음' },

    { name: 'Anderson Espinoza', tier: 'T4', nationality: '베네수엘라', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 18, age: 27, throwBat: '우투우타', height: 185, weight: 88,
      stats: { ERA: 4.10, FIP: 3.80, xFIP: 3.90, BABIP: 0.310, IVB: 38, VAA: -4.1, 'CSW%': 28, IP: 95, SO: 90, BB: 35, HR: 10, 'K/9': 8.5, 'Putaway%': 24.6 },
      ratings: { stuff: 55, command: 42, stamina: 42, effectiveness: 45, consistency: 40 },
      scouting: '전 SD 탑유망주. 부상 후 AA 복귀. 구위 살아있으나 체력/제구 불안' },

    { name: '가토 쇼고', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '선발',
      salary: 18, age: 29, throwBat: '좌투좌타', height: 180, weight: 78,
      stats: { ERA: 3.55, FIP: 3.40, xFIP: 3.45, BABIP: 0.295, IVB: 30, VAA: -5.0, 'CSW%': 28, IP: 140, SO: 115, BB: 35, HR: 14, 'K/9': 7.4, 'Putaway%': 24.5 },
      ratings: { stuff: 48, command: 60, stamina: 58, effectiveness: 55, consistency: 58 },
      scouting: 'NPB 2군 좌완 에이스. 제구력 우수, 이닝 소화 탁월. 구위 평범' },

    { name: 'Jason Alexander', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', role: '선발',
      salary: 10, age: 30, throwBat: '우투우타', height: 180, weight: 88,
      stats: { ERA: 4.00, FIP: 3.80, xFIP: 3.90, BABIP: 0.305, IVB: 28, VAA: -5.2, 'CSW%': 24, IP: 130, SO: 85, BB: 28, HR: 16, 'K/9': 5.9, 'Putaway%': 19.9 },
      ratings: { stuff: 40, command: 52, stamina: 55, effectiveness: 45, consistency: 48 },
      scouting: '전 MIL. 독립리그 이닝왕. 구속 낮지만 볼넷 적고 이닝 소화력 좋음' },

    // === 추가 투수 (20명) ===
    { name: 'Marco Gonzales', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 110, age: 34, throwBat: '좌투좌타', height: 185, weight: 90,
      stats: { ERA: 4.70, FIP: 4.40, xFIP: 4.30, BABIP: 0.310, IVB: 28, VAA: -5.4, 'CSW%': 25, IP: 145, SO: 105, BB: 35, HR: 22, 'K/9': 6.5, 'Putaway%': 20.1 },
      ratings: { stuff: 45, command: 65, stamina: 62, effectiveness: 55, consistency: 58 },
      scouting: '전 SEA/PIT 좌완. 구속 낮지만 제구력 최상급. 이닝이터 전형' },

    { name: 'Aaron Sanchez', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 100, age: 33, throwBat: '우투우타', height: 191, weight: 95,
      stats: { ERA: 5.10, FIP: 4.60, xFIP: 4.50, BABIP: 0.325, IVB: 38, VAA: -4.3, 'CSW%': 27, IP: 110, SO: 95, BB: 48, HR: 16, 'K/9': 7.8, 'Putaway%': 23.9 },
      ratings: { stuff: 58, command: 45, stamina: 48, effectiveness: 48, consistency: 42 },
      scouting: '전 TOR/HOU. 한때 ERA 3.00 기록. 부상 후 부진하나 싱커 여전히 위력적' },

    { name: 'Domingo German', tier: 'T1', nationality: '도미니카', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 105, age: 33, throwBat: '우투우타', height: 188, weight: 93,
      stats: { ERA: 5.30, FIP: 4.80, xFIP: 4.60, BABIP: 0.320, IVB: 36, VAA: -4.4, 'CSW%': 28, IP: 120, SO: 115, BB: 45, HR: 22, 'K/9': 8.6, 'Putaway%': 24.1 },
      ratings: { stuff: 58, command: 48, stamina: 50, effectiveness: 48, consistency: 42 },
      scouting: '전 NYY. 노히트 경험. 체인지업 위력적이나 일관성 부족' },

    { name: 'Tyler Anderson', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 75, age: 36, throwBat: '좌투좌타', height: 188, weight: 98,
      stats: { ERA: 4.30, FIP: 4.10, xFIP: 4.00, BABIP: 0.300, IVB: 26, VAA: -5.6, 'CSW%': 25, IP: 150, SO: 115, BB: 38, HR: 20, 'K/9': 6.9, 'Putaway%': 21.6 },
      ratings: { stuff: 42, command: 62, stamina: 62, effectiveness: 55, consistency: 58 },
      scouting: '전 LAD/LAA. 좌완 이닝이터. 구속 낮지만 이닝 소화력 발군' },

    { name: '오카모토 다이키', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '중계',
      salary: 18, age: 26, throwBat: '우투우타', height: 183, weight: 85, velocity: 155,
      stats: { ERA: 2.90, FIP: 3.00, xFIP: 3.15, BABIP: 0.285, IVB: 42, VAA: -3.7, 'CSW%': 32, IP: 58, SO: 65, BB: 18, HR: 5, 'K/9': 10.1, 'Putaway%': 28.4 },
      ratings: { stuff: 60, command: 55, stamina: 35, effectiveness: 58, consistency: 52 },
      scouting: 'NPB 2군 최우수 중계. 155km 직구와 슬라이더. 1군 기회 부족' },

    { name: 'Hayden Wesneski', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 70, age: 27, throwBat: '우투우타', height: 191, weight: 95,
      stats: { ERA: 4.60, FIP: 4.20, xFIP: 4.10, BABIP: 0.315, IVB: 36, VAA: -4.4, 'CSW%': 29, IP: 130, SO: 125, BB: 40, HR: 18, 'K/9': 8.7, 'Putaway%': 24.9 },
      ratings: { stuff: 58, command: 52, stamina: 55, effectiveness: 52, consistency: 48 },
      scouting: '전 CHC. 스플리터 우수. MLB에서 롱릴리프 → KBO 선발 전환 가능' },

    { name: '나카지마 류', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', role: '선발',
      salary: 20, age: 28, throwBat: '좌투좌타', height: 178, weight: 75,
      stats: { ERA: 3.40, FIP: 3.30, xFIP: 3.40, BABIP: 0.295, IVB: 30, VAA: -5.0, 'CSW%': 28, IP: 145, SO: 120, BB: 35, HR: 14, 'K/9': 7.4, 'Putaway%': 22.8 },
      ratings: { stuff: 50, command: 60, stamina: 58, effectiveness: 55, consistency: 58 },
      scouting: 'NPB 퍼시픽리그 2군 좌완. 제구형. 체인지업이 주무기' },

    { name: 'Carlos Hernandez', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 35, age: 27, throwBat: '우투우타', height: 196, weight: 105, velocity: 155,
      stats: { ERA: 3.80, FIP: 3.60, xFIP: 3.70, BABIP: 0.305, IVB: 38, VAA: -4.2, 'CSW%': 28, IP: 115, SO: 105, BB: 40, HR: 12, 'K/9': 8.2, 'Putaway%': 26.2 },
      ratings: { stuff: 58, command: 48, stamina: 50, effectiveness: 50, consistency: 45 },
      scouting: '전 KC. 155km 싱커 보유. 그라운드볼 투수. 제구 불안이 약점' },

    { name: '천진웨이', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '마무리',
      salary: 22, age: 27, throwBat: '우투우타', height: 185, weight: 88, velocity: 152,
      stats: { ERA: 2.60, FIP: 2.80, xFIP: 3.00, BABIP: 0.275, IVB: 42, VAA: -3.5, 'CSW%': 34, IP: 48, SO: 58, BB: 15, HR: 3, 'K/9': 10.9, 'Putaway%': 31.0 },
      ratings: { stuff: 60, command: 58, stamina: 28, effectiveness: 58, consistency: 52 },
      scouting: 'CPBL 올스타 마무리. 152km 직구+스플리터. 9회 적합' },

    { name: 'Reiver Sanmartin', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 28, age: 28, throwBat: '좌투좌타', height: 183, weight: 82,
      stats: { ERA: 3.60, FIP: 3.50, xFIP: 3.60, BABIP: 0.300, IVB: 30, VAA: -5.0, 'CSW%': 27, IP: 120, SO: 100, BB: 35, HR: 14, 'K/9': 7.5, 'Putaway%': 22.3 },
      ratings: { stuff: 48, command: 55, stamina: 52, effectiveness: 50, consistency: 50 },
      scouting: '전 CIN. 좌완 제구형. 베네수엘라 윈터리그에서 부활. 가성비 좋음' },

    { name: 'Abel Taveras', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', role: '중계',
      salary: 15, age: 24, throwBat: '우투우타', height: 188, weight: 92, velocity: 157,
      stats: { ERA: 3.50, FIP: 3.30, xFIP: 3.45, BABIP: 0.295, IVB: 44, VAA: -3.4, 'CSW%': 31, IP: 52, SO: 60, BB: 20, HR: 4, 'K/9': 10.4, 'Putaway%': 29.9 },
      ratings: { stuff: 62, command: 42, stamina: 30, effectiveness: 48, consistency: 40 },
      scouting: 'AA 불펜 유망주. 157km 직구. 삼진 능력 뛰어나나 제구 불안' },

    { name: 'Yoimer Camacho', tier: 'T4', nationality: '베네수엘라', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 18, age: 23, throwBat: '좌투좌타', height: 183, weight: 80,
      stats: { ERA: 4.10, FIP: 3.80, xFIP: 3.90, BABIP: 0.310, IVB: 32, VAA: -4.6, 'CSW%': 27, IP: 100, SO: 92, BB: 38, HR: 10, 'K/9': 8.3, 'Putaway%': 24.0 },
      ratings: { stuff: 52, command: 45, stamina: 48, effectiveness: 45, consistency: 42 },
      scouting: 'AA 좌완 유망주. 성장 가능성 높으나 아직 미완성. 저비용 투자형' },

    { name: 'Luis Peralta', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: '쿠바', role: '마무리',
      salary: 20, age: 25, throwBat: '우투우타', height: 193, weight: 100, velocity: 158,
      stats: { ERA: 3.20, FIP: 3.00, xFIP: 3.20, BABIP: 0.280, IVB: 46, VAA: -3.2, 'CSW%': 33, IP: 45, SO: 55, BB: 20, HR: 3, 'K/9': 11.0, 'Putaway%': 30.9 },
      ratings: { stuff: 65, command: 38, stamina: 28, effectiveness: 48, consistency: 35 },
      scouting: '도미니카 윈터리그 마무리. 158km 직구. 구위는 최상급이나 제구 극도로 불안' },

    { name: 'James Karinchak', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '마무리',
      salary: 80, age: 30, throwBat: '우투우타', height: 191, weight: 98,
      stats: { ERA: 3.30, FIP: 3.10, xFIP: 3.20, BABIP: 0.280, IVB: 48, VAA: -3.0, 'CSW%': 35, IP: 55, SO: 80, BB: 25, HR: 5, 'K/9': 13.1, 'Putaway%': 32.3 },
      ratings: { stuff: 68, command: 45, stamina: 32, effectiveness: 58, consistency: 48 },
      scouting: '전 CLE. 커브볼 스핀레이트 MLB 상위 1%. 삼진 머신이나 볼넷 많음' },

    { name: 'Liam Hendriks', tier: 'T1', nationality: '호주', type: '아시아쿼터', origin: 'MLB', role: '마무리',
      salary: 100, age: 37, throwBat: '우투우타', height: 183, weight: 95,
      stats: { ERA: 3.80, FIP: 3.50, xFIP: 3.40, BABIP: 0.290, IVB: 40, VAA: -3.6, 'CSW%': 32, IP: 50, SO: 60, BB: 15, HR: 6, 'K/9': 10.8, 'Putaway%': 29.6 },
      ratings: { stuff: 60, command: 60, stamina: 30, effectiveness: 58, consistency: 55 },
      scouting: '전 CHW/BOS. 호주 국대 에이스. 올스타 마무리. 암 투병 후 복귀. 경험+구위 겸비' },

    { name: 'Craig Kimbrel', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '마무리',
      salary: 120, age: 38, throwBat: '우투우타', height: 180, weight: 95,
      stats: { ERA: 4.20, FIP: 3.80, xFIP: 3.70, BABIP: 0.300, IVB: 44, VAA: -3.3, 'CSW%': 33, IP: 48, SO: 62, BB: 22, HR: 8, 'K/9': 11.6, 'Putaway%': 32.2 },
      ratings: { stuff: 62, command: 50, stamina: 28, effectiveness: 52, consistency: 48 },
      scouting: '전 ATL/CHC/BOS. 통산 400세이브 레전드. 노장 리스크 있으나 커브볼 여전' },

    { name: 'Sean Doolittle', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '중계',
      salary: 55, age: 38, throwBat: '좌투좌타', height: 188, weight: 95,
      stats: { ERA: 3.50, FIP: 3.40, xFIP: 3.50, BABIP: 0.290, IVB: 32, VAA: -4.8, 'CSW%': 28, IP: 45, SO: 48, BB: 12, HR: 5, 'K/9': 9.6, 'Putaway%': 24.9 },
      ratings: { stuff: 48, command: 62, stamina: 30, effectiveness: 52, consistency: 55 },
      scouting: '전 OAK/WSH. 좌완 경험 풍부. 볼넷 적고 안정적. 좌타자 전문' },

    { name: 'Brad Keller', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 65, age: 30, throwBat: '우투우타', height: 196, weight: 105,
      stats: { ERA: 4.50, FIP: 4.20, xFIP: 4.10, BABIP: 0.305, IVB: 30, VAA: -5.0, 'CSW%': 25, IP: 150, SO: 110, BB: 45, HR: 18, 'K/9': 6.6, 'Putaway%': 22.1 },
      ratings: { stuff: 50, command: 55, stamina: 62, effectiveness: 52, consistency: 52 },
      scouting: '전 KC. 이닝이터. 싱커 위주 그라운드볼. 구속 낮지만 체력 우수' },

    // === 강속구 마이너리그 투수 (150km+) ===
    { name: 'Tanner Bibee', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 80, age: 26, throwBat: '우투우타', height: 191, weight: 93, velocity: 153,
      stats: { ERA: 3.80, FIP: 3.50, xFIP: 3.45, BABIP: 0.300, IVB: 42, VAA: -3.6, 'CSW%': 32, IP: 145, SO: 155, BB: 42, HR: 14, 'K/9': 9.6, 'Putaway%': 28.2 },
      ratings: { stuff: 62, command: 55, stamina: 58, effectiveness: 58, consistency: 52 },
      scouting: '전 CLE 유망주. 평균 구속 153km, 최고 157km. 슬라이더+체인지업 조합 우수. 탈삼진 능력 상급' },

    { name: 'Roansy Contreras', tier: 'T2', nationality: '도미니카', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 65, age: 26, throwBat: '우투우타', height: 183, weight: 82, velocity: 152,
      stats: { ERA: 4.20, FIP: 3.80, xFIP: 3.75, BABIP: 0.310, IVB: 40, VAA: -3.8, 'CSW%': 30, IP: 130, SO: 135, BB: 48, HR: 14, 'K/9': 9.3, 'Putaway%': 26.8 },
      ratings: { stuff: 60, command: 48, stamina: 52, effectiveness: 52, consistency: 48 },
      scouting: '전 PIT. 평균 구속 152km, 최고 156km. 슬라이더 날카로움. 제구 불안이 과제' },

    { name: 'Brayan Bello', tier: 'T2', nationality: '도미니카', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 75, age: 27, throwBat: '우투우타', height: 183, weight: 77, velocity: 154,
      stats: { ERA: 4.00, FIP: 3.70, xFIP: 3.65, BABIP: 0.305, IVB: 38, VAA: -4.0, 'CSW%': 29, IP: 150, SO: 140, BB: 45, HR: 16, 'K/9': 8.4, 'Putaway%': 26.3 },
      ratings: { stuff: 58, command: 52, stamina: 58, effectiveness: 55, consistency: 50 },
      scouting: '전 BOS. 평균 구속 154km, 최고 158km. 싱커+체인지업 주무기. 그라운드볼 유도 능력' },

    { name: 'Eury Perez', tier: 'T2', nationality: '도미니카', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 85, age: 22, throwBat: '우투우타', height: 203, weight: 95, velocity: 155,
      stats: { ERA: 3.60, FIP: 3.40, xFIP: 3.50, BABIP: 0.295, IVB: 44, VAA: -3.3, 'CSW%': 33, IP: 120, SO: 135, BB: 38, HR: 12, 'K/9': 10.1, 'Putaway%': 28.6 },
      ratings: { stuff: 68, command: 50, stamina: 50, effectiveness: 55, consistency: 48 },
      scouting: '전 MIA 탑유망주. 203cm 장신, 평균 구속 155km, 최고 160km. 구위 포텐셜 최상급. 부상 이력 리스크' },

    { name: 'Hunter Brown', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 70, age: 27, throwBat: '우투우타', height: 193, weight: 95, velocity: 154,
      stats: { ERA: 4.40, FIP: 4.00, xFIP: 3.90, BABIP: 0.315, IVB: 40, VAA: -3.7, 'CSW%': 30, IP: 140, SO: 150, BB: 55, HR: 16, 'K/9': 9.6, 'Putaway%': 28.1 },
      ratings: { stuff: 62, command: 45, stamina: 55, effectiveness: 52, consistency: 45 },
      scouting: '전 HOU. 평균 구속 154km, 최고 159km. 슬라이더 위력적. 볼넷이 많지만 삼진도 많음' },

    { name: 'Taj Bradley', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 75, age: 24, throwBat: '우투우타', height: 188, weight: 86, velocity: 153,
      stats: { ERA: 3.90, FIP: 3.60, xFIP: 3.55, BABIP: 0.305, IVB: 42, VAA: -3.5, 'CSW%': 31, IP: 135, SO: 145, BB: 40, HR: 14, 'K/9': 9.7, 'Putaway%': 28.8 },
      ratings: { stuff: 62, command: 52, stamina: 55, effectiveness: 55, consistency: 50 },
      scouting: '전 TB 유망주. 평균 구속 153km, 최고 157km. 커브+체인지업 다구종. KBO 에이스급 잠재력' },

    { name: 'Mason Miller', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '마무리',
      salary: 90, age: 26, throwBat: '우투좌타', height: 196, weight: 95, velocity: 160,
      stats: { ERA: 2.50, FIP: 2.30, xFIP: 2.60, BABIP: 0.260, IVB: 50, VAA: -2.8, 'CSW%': 38, IP: 55, SO: 85, BB: 18, HR: 4, 'K/9': 13.9, 'Putaway%': 34.6 },
      ratings: { stuff: 75, command: 52, stamina: 28, effectiveness: 62, consistency: 52 },
      scouting: '전 OAK. 평균 구속 160km, 최고 164km. MLB 최고 구속 보유자 중 하나. 마무리 특화' },

    { name: 'Ben Joyce', tier: 'T4', nationality: '미국', type: '기존외국인', origin: 'AA', role: '중계',
      salary: 22, age: 25, throwBat: '우투우타', height: 198, weight: 102, velocity: 161,
      stats: { ERA: 3.40, FIP: 3.10, xFIP: 3.30, BABIP: 0.285, IVB: 48, VAA: -2.9, 'CSW%': 34, IP: 50, SO: 68, BB: 22, HR: 4, 'K/9': 12.2, 'Putaway%': 30.4 },
      ratings: { stuff: 70, command: 40, stamina: 30, effectiveness: 50, consistency: 40 },
      scouting: '전 LAA 마이너. 평균 구속 161km, 최고 165km. 순수 화력 최상급이나 제구 미완성' },

    { name: 'Yohan Ramirez', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '중계',
      salary: 28, age: 29, throwBat: '우투우타', height: 188, weight: 88, velocity: 155,
      stats: { ERA: 3.60, FIP: 3.30, xFIP: 3.50, BABIP: 0.295, IVB: 44, VAA: -3.4, 'CSW%': 31, IP: 55, SO: 65, BB: 28, HR: 5, 'K/9': 10.6, 'Putaway%': 27.5 },
      ratings: { stuff: 62, command: 42, stamina: 32, effectiveness: 50, consistency: 42 },
      scouting: '전 SEA/CLE/PIT. 평균 구속 155km, 최고 159km. 파워 슬라이더 보유. 볼넷 리스크' },

    { name: 'Janson Junk', tier: 'T3', nationality: '미국', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 30, age: 29, throwBat: '우투우타', height: 185, weight: 88, velocity: 150,
      stats: { ERA: 3.80, FIP: 3.60, xFIP: 3.70, BABIP: 0.300, IVB: 38, VAA: -4.0, 'CSW%': 28, IP: 125, SO: 115, BB: 35, HR: 14, 'K/9': 8.3, 'Putaway%': 25.3 },
      ratings: { stuff: 55, command: 55, stamina: 55, effectiveness: 52, consistency: 52 },
      scouting: '전 LAA/MIL. 평균 구속 150km, 최고 154km. 슬라이더+커터 조합. 이닝 소화력과 구속 겸비' },

    { name: 'Victor Vodnik', tier: 'T4', nationality: '미국', type: '기존외국인', origin: 'AA', role: '중계',
      salary: 18, age: 25, throwBat: '우투우타', height: 185, weight: 95, velocity: 157,
      stats: { ERA: 3.30, FIP: 3.00, xFIP: 3.20, BABIP: 0.285, IVB: 46, VAA: -3.1, 'CSW%': 33, IP: 52, SO: 62, BB: 22, HR: 4, 'K/9': 10.7, 'Putaway%': 29.7 },
      ratings: { stuff: 65, command: 42, stamina: 30, effectiveness: 50, consistency: 42 },
      scouting: '전 COL/ATL 마이너. 평균 구속 157km, 최고 162km. 파워 싱커+슬라이더. 불펜 화력형' },

    { name: 'Angel Zerpa', tier: 'T4', nationality: '베네수엘라', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 20, age: 26, throwBat: '좌투좌타', height: 183, weight: 82, velocity: 150,
      stats: { ERA: 3.90, FIP: 3.70, xFIP: 3.80, BABIP: 0.300, IVB: 36, VAA: -4.2, 'CSW%': 28, IP: 115, SO: 108, BB: 35, HR: 12, 'K/9': 8.5, 'Putaway%': 24.2 },
      ratings: { stuff: 55, command: 50, stamina: 52, effectiveness: 50, consistency: 48 },
      scouting: '전 KC 마이너. 좌완이면서 평균 구속 150km, 최고 154km. 좌완 강속구 희소 가치' },

    // === 대만(CPBL) 추가 투수 ===
    { name: '쉬지아룽', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '선발',
      salary: 22, age: 27, throwBat: '우투우타', height: 185, weight: 88, velocity: 148,
      stats: { ERA: 3.10, FIP: 3.20, xFIP: 3.30, BABIP: 0.290, IVB: 38, VAA: -4.0, 'CSW%': 30, IP: 148, SO: 130, BB: 38, HR: 12, 'K/9': 7.9, 'Putaway%': 25.8 },
      ratings: { stuff: 55, command: 58, stamina: 60, effectiveness: 55, consistency: 55 },
      scouting: 'CPBL 라미고 에이스급. 평균 구속 148km, 커터+슬라이더 조합. 이닝 소화력 발군' },

    { name: '린위엔', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '선발',
      salary: 25, age: 26, throwBat: '좌투좌타', height: 180, weight: 82,
      stats: { ERA: 3.30, FIP: 3.20, xFIP: 3.35, BABIP: 0.295, IVB: 34, VAA: -4.5, 'CSW%': 29, IP: 140, SO: 125, BB: 35, HR: 14, 'K/9': 8.0, 'Putaway%': 25.3 },
      ratings: { stuff: 52, command: 58, stamina: 58, effectiveness: 55, consistency: 58 },
      scouting: 'CPBL 좌완 에이스. 체인지업+커브 조합 우수. 좌타 상대 피안타율 .210. 제구형' },

    { name: '천쿤위', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '중계',
      salary: 18, age: 25, throwBat: '우투우타', height: 183, weight: 85, velocity: 152,
      stats: { ERA: 2.70, FIP: 2.90, xFIP: 3.10, BABIP: 0.280, IVB: 42, VAA: -3.5, 'CSW%': 32, IP: 58, SO: 65, BB: 18, HR: 4, 'K/9': 10.1, 'Putaway%': 27.7 },
      ratings: { stuff: 58, command: 55, stamina: 32, effectiveness: 55, consistency: 52 },
      scouting: 'CPBL 최우수 셋업맨. 평균 구속 152km, 슬라이더 피안타율 .180. 마무리 전환 가능' },

    { name: '장이', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '선발',
      salary: 20, age: 28, throwBat: '우투우타', height: 188, weight: 90,
      stats: { ERA: 3.40, FIP: 3.30, xFIP: 3.40, BABIP: 0.300, IVB: 36, VAA: -4.2, 'CSW%': 28, IP: 135, SO: 115, BB: 40, HR: 14, 'K/9': 7.7, 'Putaway%': 25.8 },
      ratings: { stuff: 52, command: 55, stamina: 58, effectiveness: 52, consistency: 55 },
      scouting: 'CPBL 통산 50승급. 싱커+체인지업 그라운드볼 투수. 안정적 이닝 소화' },

    { name: '우저하오', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', role: '마무리',
      salary: 22, age: 26, throwBat: '우투우타', height: 182, weight: 83, velocity: 153,
      stats: { ERA: 2.40, FIP: 2.60, xFIP: 2.85, BABIP: 0.270, IVB: 44, VAA: -3.3, 'CSW%': 35, IP: 48, SO: 62, BB: 14, HR: 3, 'K/9': 11.6, 'Putaway%': 31.6 },
      ratings: { stuff: 60, command: 60, stamina: 28, effectiveness: 58, consistency: 55 },
      scouting: 'CPBL 세이브 2위. 평균 구속 153km, 스플리터 공중부양. 제구+구위 겸비 마무리' },

    // === 도미니카 윈터리그 추가 투수 ===
    { name: 'Franklyn Kilome', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 30, age: 28, throwBat: '우투우타', height: 198, weight: 102, velocity: 153,
      stats: { ERA: 3.50, FIP: 3.30, xFIP: 3.45, BABIP: 0.300, IVB: 40, VAA: -3.8, 'CSW%': 29, IP: 120, SO: 115, BB: 42, HR: 12, 'K/9': 8.6, 'Putaway%': 26.5 },
      ratings: { stuff: 58, command: 45, stamina: 52, effectiveness: 50, consistency: 45 },
      scouting: '도미니카 윈터리그 활약. 전 NYM/PHI 마이너. 198cm 장신, 평균 구속 153km. 슬라이더 위력적' },

    { name: 'Adonis Medina', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '중계',
      salary: 25, age: 28, throwBat: '우투우타', height: 185, weight: 88,
      stats: { ERA: 3.20, FIP: 3.10, xFIP: 3.25, BABIP: 0.290, IVB: 38, VAA: -4.0, 'CSW%': 30, IP: 60, SO: 65, BB: 22, HR: 5, 'K/9': 9.8, 'Putaway%': 26.6 },
      ratings: { stuff: 55, command: 50, stamina: 35, effectiveness: 52, consistency: 48 },
      scouting: '도미니카 윈터리그 최우수 중계. 전 PHI 탑유망주. 체인지업 위력적. 불펜 전환 성공' },

    { name: 'Starlin Castillo', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 28, age: 27, throwBat: '우투우타', height: 190, weight: 95, velocity: 154,
      stats: { ERA: 3.40, FIP: 3.20, xFIP: 3.35, BABIP: 0.295, IVB: 42, VAA: -3.6, 'CSW%': 31, IP: 110, SO: 108, BB: 38, HR: 10, 'K/9': 8.8, 'Putaway%': 27.7 },
      ratings: { stuff: 60, command: 48, stamina: 48, effectiveness: 50, consistency: 45 },
      scouting: '도미니카 윈터리그 탈삼진왕. 평균 구속 154km, 커브 스핀레이트 높음. 제구만 잡으면 에이스급' },

    { name: 'Jose Marte', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '중계',
      salary: 18, age: 27, throwBat: '우투우타', height: 188, weight: 92, velocity: 156,
      stats: { ERA: 3.10, FIP: 2.90, xFIP: 3.10, BABIP: 0.285, IVB: 46, VAA: -3.2, 'CSW%': 33, IP: 52, SO: 60, BB: 20, HR: 4, 'K/9': 10.4, 'Putaway%': 31.0 },
      ratings: { stuff: 62, command: 45, stamina: 30, effectiveness: 52, consistency: 42 },
      scouting: '도미니카 윈터리그 셋업맨. 평균 구속 156km, 스위퍼 보유. 불펜 화력 보강용' },

    { name: 'Enmanuel De Jesus', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: '중남미', role: '선발',
      salary: 15, age: 26, throwBat: '좌투좌타', height: 183, weight: 80, velocity: 148,
      stats: { ERA: 3.70, FIP: 3.50, xFIP: 3.60, BABIP: 0.300, IVB: 32, VAA: -4.6, 'CSW%': 27, IP: 105, SO: 95, BB: 35, HR: 12, 'K/9': 8.1, 'Putaway%': 23.9 },
      ratings: { stuff: 50, command: 48, stamina: 50, effectiveness: 48, consistency: 45 },
      scouting: '도미니카 리그 좌완. 평균 구속 148km, 체인지업 주무기. 좌타 상대 강점. 저비용 선발 옵션' },

    // === 마이너리그(AAA/AA) 추가 투수 ===
    { name: 'Andrew Painter', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 70, age: 23, throwBat: '우투우타', height: 196, weight: 95, velocity: 155,
      stats: { ERA: 3.50, FIP: 3.20, xFIP: 3.30, BABIP: 0.295, IVB: 44, VAA: -3.4, 'CSW%': 33, IP: 110, SO: 130, BB: 32, HR: 10, 'K/9': 10.6, 'Putaway%': 29.8 },
      ratings: { stuff: 65, command: 52, stamina: 48, effectiveness: 55, consistency: 48 },
      scouting: '전 PHI 탑유망주. 평균 구속 155km, 최고 159km. TJS 복귀 후 구위 유지. 잠재력 최상급' },

    { name: 'Cade Cavalli', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 65, age: 27, throwBat: '우투우타', height: 196, weight: 100, velocity: 154,
      stats: { ERA: 4.10, FIP: 3.70, xFIP: 3.65, BABIP: 0.310, IVB: 40, VAA: -3.7, 'CSW%': 30, IP: 120, SO: 130, BB: 48, HR: 14, 'K/9': 9.8, 'Putaway%': 28.6 },
      ratings: { stuff: 62, command: 45, stamina: 50, effectiveness: 50, consistency: 42 },
      scouting: '전 WSH 유망주. 평균 구속 154km, 너클커브 위력적. 부상 복귀 후 잠재력에 베팅' },

    { name: 'Matt Waldron', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 60, age: 28, throwBat: '우투우타', height: 188, weight: 88, velocity: 150,
      stats: { ERA: 4.30, FIP: 4.00, xFIP: 3.90, BABIP: 0.305, IVB: 45, VAA: -3.8, 'CSW%': 28, IP: 140, SO: 120, BB: 45, HR: 16, 'K/9': 7.7, 'Putaway%': 24.3 },
      ratings: { stuff: 55, command: 50, stamina: 58, effectiveness: 52, consistency: 50 },
      scouting: '전 SD. 너클볼+패스트볼 조합. 평균 구속 150km. 독특한 구종 믹스로 타자 혼란 유도' },

    { name: 'Kyle Harrison', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', role: '선발',
      salary: 75, age: 24, throwBat: '좌투좌타', height: 188, weight: 93, velocity: 152,
      stats: { ERA: 3.80, FIP: 3.50, xFIP: 3.45, BABIP: 0.300, IVB: 38, VAA: -4.0, 'CSW%': 31, IP: 130, SO: 145, BB: 45, HR: 14, 'K/9': 10.0, 'Putaway%': 29.6 },
      ratings: { stuff: 62, command: 48, stamina: 52, effectiveness: 55, consistency: 48 },
      scouting: '전 SF 유망주. 좌완 평균 구속 152km, 최고 156km. 슬라이더 삼진 능력 탁월' },

    { name: 'Tink Hence', tier: 'T4', nationality: '미국', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 20, age: 22, throwBat: '우투우타', height: 185, weight: 82, velocity: 153,
      stats: { ERA: 3.60, FIP: 3.30, xFIP: 3.40, BABIP: 0.295, IVB: 42, VAA: -3.5, 'CSW%': 32, IP: 90, SO: 100, BB: 32, HR: 8, 'K/9': 10.0, 'Putaway%': 28.3 },
      ratings: { stuff: 60, command: 48, stamina: 42, effectiveness: 48, consistency: 42 },
      scouting: '전 STL AA 유망주. 평균 구속 153km, 커브+체인지업. 어린 나이에 AA 정복. 성장 가능성 높음' },

    { name: 'Marco Raya', tier: 'T4', nationality: '미국', type: '기존외국인', origin: 'AA', role: '선발',
      salary: 18, age: 23, throwBat: '우투우타', height: 183, weight: 82, velocity: 152,
      stats: { ERA: 3.80, FIP: 3.50, xFIP: 3.60, BABIP: 0.305, IVB: 40, VAA: -3.8, 'CSW%': 30, IP: 95, SO: 105, BB: 35, HR: 10, 'K/9': 9.9, 'Putaway%': 28.3 },
      ratings: { stuff: 58, command: 45, stamina: 45, effectiveness: 48, consistency: 42 },
      scouting: '전 MIN AA 유망주. 평균 구속 152km, 슬라이더+체인지업. 멕시코계. 성장형 투자' },

    // === ABL(호주) 추가 투수 ===
    { name: 'Lachlan Wells', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '선발',
      salary: 14, age: 26, throwBat: '우투우타', height: 191, weight: 92, velocity: 148,
      stats: { ERA: 3.50, FIP: 3.30, xFIP: 3.45, BABIP: 0.295, IVB: 38, VAA: -4.0, 'CSW%': 29, IP: 115, SO: 105, BB: 30, HR: 10, 'K/9': 8.2, 'Putaway%': 26.5 },
      ratings: { stuff: 50, command: 52, stamina: 52, effectiveness: 50, consistency: 50 },
      scouting: 'ABL 다승왕. 호주 국대 경험. 평균 구속 148km, 커터+체인지업. 안정적 이닝이터' },

    { name: 'Riley Burt', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '중계',
      salary: 12, age: 25, throwBat: '좌투좌타', height: 185, weight: 85,
      stats: { ERA: 3.20, FIP: 3.10, xFIP: 3.30, BABIP: 0.285, IVB: 34, VAA: -4.4, 'CSW%': 28, IP: 55, SO: 52, BB: 18, HR: 5, 'K/9': 8.5, 'Putaway%': 25.7 },
      ratings: { stuff: 48, command: 52, stamina: 35, effectiveness: 48, consistency: 50 },
      scouting: 'ABL 좌완 릴리버. 호주 WBC 후보. 좌타 상대 강점. 저비용 불펜 좌완 옵션' },

    { name: 'Todd Van Steensel', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '마무리',
      salary: 15, age: 30, throwBat: '우투우타', height: 188, weight: 95, velocity: 150,
      stats: { ERA: 2.80, FIP: 2.90, xFIP: 3.10, BABIP: 0.275, IVB: 40, VAA: -3.6, 'CSW%': 31, IP: 50, SO: 55, BB: 15, HR: 4, 'K/9': 9.9, 'Putaway%': 28.2 },
      ratings: { stuff: 52, command: 55, stamina: 30, effectiveness: 52, consistency: 52 },
      scouting: 'ABL 통산 세이브 1위. 호주 국대 마무리. 평균 구속 150km, 경험+안정감 겸비' },

    { name: 'Dushan Ruzic', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', role: '선발',
      salary: 12, age: 24, throwBat: '우투우타', height: 193, weight: 90, velocity: 149,
      stats: { ERA: 3.70, FIP: 3.50, xFIP: 3.60, BABIP: 0.300, IVB: 36, VAA: -4.2, 'CSW%': 27, IP: 100, SO: 88, BB: 32, HR: 10, 'K/9': 7.9, 'Putaway%': 24.9 },
      ratings: { stuff: 50, command: 48, stamina: 48, effectiveness: 46, consistency: 45 },
      scouting: 'ABL 신인왕 후보. 193cm 장신, 평균 구속 149km. 성장 가능성 높은 저비용 투자형' },

    // === 한국계 선수 ===
    { name: 'Dane Dunning', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', role: '선발',
      salary: 100, age: 32, throwBat: '우투우타', height: 193, weight: 100,
      stats: { ERA: 4.50, FIP: 4.20, xFIP: 4.10, BABIP: 0.305, IVB: 34, VAA: -4.6, 'CSW%': 27, IP: 155, SO: 125, BB: 42, HR: 20, 'K/9': 7.3, 'Putaway%': 23.5 },
      ratings: { stuff: 52, command: 58, stamina: 60, effectiveness: 55, consistency: 55 },
      scouting: '전 TEX. 한국계 미국인. 이닝이터 타입. 싱커/슬라이더 조합. 안정적' },

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

    // === 추가 타자 (20명) ===
    { name: 'Adam Duvall', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: 'LF',
      salary: 110, age: 37, throwBat: '우투우타', height: 185, weight: 95,
      stats: { AVG: 0.225, OBP: 0.285, SLG: 0.440, OPS: 0.725, 'wRC+': 102, 'Barrel%': 14.0, HR: 22, BB: 30, SB: 1, PA: 490 },
      ratings: { contact: 38, power: 65, eye: 38, speed: 22, defense: 48 },
      scouting: '전 ATL/BOS/MIA. 순수 파워형. 삼진 많지만 홈런 생산력 우수. WS 경험' },

    { name: 'Tommy Pham', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: 'LF',
      salary: 100, age: 38, throwBat: '우투우타', height: 185, weight: 95,
      stats: { AVG: 0.248, OBP: 0.330, SLG: 0.400, OPS: 0.730, 'wRC+': 105, 'Barrel%': 9.5, HR: 14, BB: 45, SB: 10, PA: 500 },
      ratings: { contact: 48, power: 50, eye: 52, speed: 45, defense: 42 },
      scouting: '전 STL/SD/BOS. 밸런스형. 출루+도루+파워 고루 갖춤. 노장 리스크' },

    { name: 'Mark Canha', tier: 'T1', nationality: '미국', type: '기존외국인', origin: 'MLB', position: 'RF',
      salary: 105, age: 37, throwBat: '우투우타', height: 185, weight: 95,
      stats: { AVG: 0.240, OBP: 0.340, SLG: 0.390, OPS: 0.730, 'wRC+': 108, 'Barrel%': 8.5, HR: 12, BB: 55, SB: 2, PA: 510 },
      ratings: { contact: 48, power: 48, eye: 62, speed: 28, defense: 42 },
      scouting: '전 OAK/NYM/DET. 선구안 최상급. HBP 많이 맞는 출루 머신' },

    { name: 'Jose Siri', tier: 'T1', nationality: '도미니카', type: '기존외국인', origin: 'MLB', position: 'CF',
      salary: 100, age: 30, throwBat: '우투우타', height: 191, weight: 95,
      stats: { AVG: 0.228, OBP: 0.280, SLG: 0.420, OPS: 0.700, 'wRC+': 95, 'Barrel%': 11.0, HR: 18, BB: 22, SB: 20, PA: 480 },
      ratings: { contact: 38, power: 55, eye: 35, speed: 62, defense: 65 },
      scouting: '전 TB/NYM. 중견수 수비+주루 최상급. 삼진 많지만 파워+스피드 겸비' },

    { name: '마쓰바라 코타', tier: 'T2', nationality: '일본', type: '아시아쿼터', origin: 'NPB', position: '3B',
      salary: 18, age: 27, throwBat: '우투우타', height: 180, weight: 85,
      stats: { AVG: 0.280, OBP: 0.340, SLG: 0.450, OPS: 0.790, 'wRC+': 118, 'Barrel%': 10.0, HR: 15, BB: 35, SB: 5, PA: 500 },
      ratings: { contact: 55, power: 52, eye: 48, speed: 35, defense: 50 },
      scouting: 'NPB 2군 3루수. 중거리 파워와 안정적 수비. 밸런스형' },

    { name: 'Jose Rojas', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', position: '1B',
      salary: 50, age: 31, throwBat: '우투우타', height: 188, weight: 100,
      stats: { AVG: 0.275, OBP: 0.340, SLG: 0.470, OPS: 0.810, 'wRC+': 122, 'Barrel%': 12.0, HR: 20, BB: 35, SB: 2, PA: 490 },
      ratings: { contact: 55, power: 58, eye: 48, speed: 25, defense: 35 },
      scouting: '전 LAA AAA. 중장거리 타격 능력 우수. 1루/DH 겸용' },

    { name: 'Aledmys Diaz', tier: 'T2', nationality: '쿠바', type: '기존외국인', origin: 'AAA', position: 'SS',
      salary: 60, age: 35, throwBat: '우투우타', height: 185, weight: 95,
      stats: { AVG: 0.260, OBP: 0.320, SLG: 0.420, OPS: 0.740, 'wRC+': 108, 'Barrel%': 9.5, HR: 14, BB: 30, SB: 3, PA: 470 },
      ratings: { contact: 52, power: 50, eye: 42, speed: 30, defense: 48 },
      scouting: '전 STL/HOU. 유틸리티(SS/2B/3B). 안정적 타격. 경험 풍부' },

    { name: '황지웨이', tier: 'T3', nationality: '대만', type: '아시아쿼터', origin: 'CPBL', position: '1B',
      salary: 20, age: 28, throwBat: '좌투좌타', height: 185, weight: 95,
      stats: { AVG: 0.290, OBP: 0.360, SLG: 0.480, OPS: 0.840, 'wRC+': 128, 'Barrel%': 12.5, HR: 20, BB: 40, SB: 2, PA: 500 },
      ratings: { contact: 55, power: 58, eye: 52, speed: 22, defense: 32 },
      scouting: 'CPBL 홈런왕. 좌타 파워형. 수비 약하지만 DH/1루 가치' },

    { name: 'Oscar Gonzalez', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', position: 'RF',
      salary: 35, age: 27, throwBat: '우투우타', height: 191, weight: 107,
      stats: { AVG: 0.270, OBP: 0.310, SLG: 0.460, OPS: 0.770, 'wRC+': 112, 'Barrel%': 11.5, HR: 18, BB: 18, SB: 2, PA: 480 },
      ratings: { contact: 52, power: 58, eye: 35, speed: 28, defense: 42 },
      scouting: '전 CLE. 프리 스윙어. 파워 좋으나 선구안 부족. 적극적 타격' },

    { name: 'Roberto Perez', tier: 'T3', nationality: '도미니카', type: '기존외국인', origin: '중남미', position: 'C',
      salary: 30, age: 37, throwBat: '우투우타', height: 178, weight: 95,
      stats: { AVG: 0.220, OBP: 0.310, SLG: 0.360, OPS: 0.670, 'wRC+': 88, 'Barrel%': 7.5, HR: 8, BB: 35, SB: 0, PA: 400 },
      ratings: { contact: 38, power: 42, eye: 50, speed: 20, defense: 62 },
      scouting: '전 CLE/PIT. 수비형 포수. 프레이밍 능력 우수. 타격 약점이나 리드 가치' },

    { name: 'Victor Reyes', tier: 'T3', nationality: '베네수엘라', type: '기존외국인', origin: '중남미', position: 'CF',
      salary: 28, age: 30, throwBat: '양투양타', height: 191, weight: 90,
      stats: { AVG: 0.275, OBP: 0.315, SLG: 0.385, OPS: 0.700, 'wRC+': 95, 'Barrel%': 5.5, HR: 6, BB: 18, SB: 15, PA: 460 },
      ratings: { contact: 55, power: 35, eye: 35, speed: 55, defense: 52 },
      scouting: '전 DET. 양타 외야수. 컨택+스피드형. 파워 부족이나 유틸리티 가치' },

    { name: 'Ernie Clement', tier: 'T4', nationality: '미국', type: '기존외국인', origin: 'AA', position: '2B',
      salary: 15, age: 28, throwBat: '우투우타', height: 183, weight: 82,
      stats: { AVG: 0.270, OBP: 0.310, SLG: 0.370, OPS: 0.680, 'wRC+': 90, 'Barrel%': 4.5, HR: 5, BB: 18, SB: 8, PA: 420 },
      ratings: { contact: 55, power: 32, eye: 38, speed: 48, defense: 52 },
      scouting: '전 CLE/TOR. 컨택형 유틸리티. 다포지션 가능. 파워 부족' },

    { name: 'Rafael Ortega', tier: 'T4', nationality: '베네수엘라', type: '기존외국인', origin: 'AA', position: 'CF',
      salary: 18, age: 34, throwBat: '좌투좌타', height: 175, weight: 72,
      stats: { AVG: 0.260, OBP: 0.330, SLG: 0.380, OPS: 0.710, 'wRC+': 98, 'Barrel%': 5.0, HR: 6, BB: 30, SB: 12, PA: 440 },
      ratings: { contact: 52, power: 32, eye: 48, speed: 52, defense: 50 },
      scouting: '전 CHC. 좌타 중견수. 출루+도루형. 체구 작지만 꾸준' },

    { name: 'Isan Diaz', tier: 'T4', nationality: '쿠바', type: '기존외국인', origin: '쿠바', position: '2B',
      salary: 20, age: 29, throwBat: '좌투좌타', height: 178, weight: 85,
      stats: { AVG: 0.235, OBP: 0.315, SLG: 0.420, OPS: 0.735, 'wRC+': 105, 'Barrel%': 10.0, HR: 14, BB: 35, SB: 3, PA: 440 },
      ratings: { contact: 42, power: 52, eye: 45, speed: 32, defense: 42 },
      scouting: '전 MIA. 좌타 2루수. 파워 잠재력 있으나 삼진 많음. 쿠바 출신' },

    { name: 'Ryan McKenna', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', position: 'CF',
      salary: 12, age: 28, throwBat: '우투우타', height: 180, weight: 82,
      stats: { AVG: 0.245, OBP: 0.310, SLG: 0.360, OPS: 0.670, 'wRC+': 85, 'Barrel%': 5.0, HR: 5, BB: 22, SB: 15, PA: 420 },
      ratings: { contact: 48, power: 32, eye: 42, speed: 58, defense: 58 },
      scouting: '전 BAL. 수비+주루형 외야수. 타격 약하지만 4번째 외야수로 가치' },

    { name: 'Jake McCarthy', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', position: 'LF',
      salary: 15, age: 28, throwBat: '좌투좌타', height: 188, weight: 88,
      stats: { AVG: 0.255, OBP: 0.320, SLG: 0.380, OPS: 0.700, 'wRC+': 92, 'Barrel%': 6.0, HR: 7, BB: 25, SB: 20, PA: 450 },
      ratings: { contact: 48, power: 38, eye: 42, speed: 62, defense: 50 },
      scouting: '전 ARI. 스피드형 외야수. 도루 능력 좋고 수비 범위 넓음' },

    { name: 'Tim Locastro', tier: 'T5', nationality: '미국', type: '기존외국인', origin: '독립리그', position: 'CF',
      salary: 10, age: 33, throwBat: '우투우타', height: 185, weight: 88,
      stats: { AVG: 0.240, OBP: 0.310, SLG: 0.330, OPS: 0.640, 'wRC+': 78, 'Barrel%': 3.5, HR: 2, BB: 22, SB: 25, PA: 400 },
      ratings: { contact: 45, power: 25, eye: 42, speed: 70, defense: 55 },
      scouting: '전 ARI/NYY. 도루 전문가 (MLB 통산 성공률 92%). 대주자 가치' },

    { name: '하야시 유키', tier: 'T5', nationality: '호주', type: '아시아쿼터', origin: 'ABL', position: 'RF',
      salary: 12, age: 26, throwBat: '우투우타', height: 183, weight: 85,
      stats: { AVG: 0.275, OBP: 0.340, SLG: 0.420, OPS: 0.760, 'wRC+': 108, 'Barrel%': 8.0, HR: 10, BB: 30, SB: 8, PA: 460 },
      ratings: { contact: 52, power: 45, eye: 48, speed: 42, defense: 48 },
      scouting: 'ABL 올스타 외야수. 밸런스형. 큰 약점 없고 가성비 우수' },

    { name: 'Marcos Diplán', tier: 'T4', nationality: '도미니카', type: '기존외국인', origin: 'AA', position: 'DH',
      salary: 18, age: 26, throwBat: '우투우타', height: 190, weight: 105,
      stats: { AVG: 0.250, OBP: 0.310, SLG: 0.470, OPS: 0.780, 'wRC+': 115, 'Barrel%': 13.5, HR: 22, BB: 25, SB: 1, PA: 460 },
      ratings: { contact: 42, power: 62, eye: 38, speed: 20, defense: 22 },
      scouting: 'AA 홈런 2위. 순수 파워형 DH. Barrel% 높으나 삼진 극히 많음' },

    // === 한국계 선수 ===
    { name: 'Shea Whitcomb', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', position: '2B',
      salary: 55, age: 28, throwBat: '우투우타', height: 180, weight: 82,
      stats: { AVG: 0.265, OBP: 0.335, SLG: 0.430, OPS: 0.765, 'wRC+': 112, 'Barrel%': 9.5, HR: 14, BB: 32, SB: 8, PA: 490 },
      ratings: { contact: 52, power: 50, eye: 48, speed: 45, defense: 52 },
      scouting: '한국계 미국인. AAA 내야수(2B/SS). 밸런스형. 파워+수비 겸비. HOU 유망주' },

    { name: 'Jermaine Jones', tier: 'T2', nationality: '미국', type: '기존외국인', origin: 'AAA', position: 'RF',
      salary: 60, age: 29, throwBat: '우투우타', height: 183, weight: 82,
      stats: { AVG: 0.270, OBP: 0.340, SLG: 0.420, OPS: 0.760, 'wRC+': 112, 'Barrel%': 8.0, HR: 12, BB: 35, SB: 15, PA: 500 },
      ratings: { contact: 55, power: 48, eye: 48, speed: 55, defense: 55 },
      scouting: '한국계 미국인. 주로 RF 출전, 내야 유틸리티도 가능. 밸런스형 5툴 플레이어' },
];

// ── 미션 상태 관리 ──
let foreignScoutState = {
    unlocked: true,           // 기본 활성화 (교사), 학생은 auth.js에서 잠금
    batterUnlocked: true,     // 기본 활성화
    missionShown: false,
    missionChoice: null,
    recruited: [],
    detailedReports: {},      // 팀별 상세 스카우팅 사용 기록: { 'LG': 'PlayerName', '두산': 'PlayerName2', ... }
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

// ══════════════════════════════════════════
// ── 범용 GM 미션 카드 시스템 ──
// ══════════════════════════════════════════

const GM_MISSIONS = {
    mission2: {
        trigger: 36, tag: '[판단 요청]', title: '외국인 투수, 교체인가 신뢰인가?',
        sender: '구단주님의 메시지',
        message: `우리 팀 외국인 에이스가 최근 성적이 좋지 않습니다.<br>팬들은 교체를 요구하고 있지만, 스카우팅팀은 반등 가능성을 주장합니다.<br><strong>단장으로서 데이터를 보고 직접 판단하세요.</strong>`,
        getData: (tc) => {
            const fp = getTeamPitchers(state, tc).filter(p => p.isForeign)[0];
            const nm = fp?.name || '외국인 에이스';
            return `<div style="margin-bottom:8px;font-weight:700;">📊 ${nm} — 최근 성적 분석</div>
            <table><tr><th>지표</th><th>현재</th><th>리그 평균</th><th>판단</th></tr>
            <tr><td>ERA</td><td class="stat-bad">6.50</td><td>4.20</td><td class="stat-bad">부진</td></tr>
            <tr><td>FIP</td><td class="stat-warn">4.80</td><td>4.10</td><td class="stat-warn">평균 이하</td></tr>
            <tr><td>xFIP</td><td class="stat-ok">3.90</td><td>4.10</td><td class="stat-ok">양호</td></tr>
            <tr><td>BABIP</td><td class="stat-bad">.350</td><td>.300</td><td class="stat-warn">불운?</td></tr>
            <tr><td>IVB</td><td class="stat-ok">42cm</td><td>38cm</td><td class="stat-ok">구위 유지</td></tr></table>
            <div style="margin-top:10px;font-size:12px;color:var(--text-muted);">ERA는 높지만 xFIP와 BABIP를 보면 <strong>불운</strong>일 가능성도 있습니다.</div>`;
        },
        choices: [
            { id:'replace', icon:'🔄', label:'교체한다', desc:'외국인 스카우트에서 새 투수를 찾는다', action:()=>{ showToast('외국인 스카우트에서 새 투수를 찾아보세요.','success'); setTimeout(()=>showView('foreign-scout'),500); } },
            { id:'keep', icon:'🛡️', label:'유지한다', desc:'반등 근거 데이터를 분석한다', action:()=>{ showToast('기존 투수를 유지합니다.','info'); } },
        ],
    },
    mission3: {
        trigger: 42, tag: '[특명]', title: '저평가 에이스 발굴 — FIP & BABIP',
        sender: '스카우팅팀 보고',
        message: `팬들은 ERA만 보고 투수를 비난합니다. 하지만 단장인 당신은 달라야 합니다.<br><strong>ERA는 높지만 FIP가 낮고 BABIP가 높은 투수 = 불운에 빠진 숨겨진 에이스!</strong><br>이 선수는 지금 헐값에 트레이드가 가능합니다.`,
        getData: (tc) => {
            const allP = Object.values(state.players).filter(p => p.position === 'P' && p.realStats?.ERA && p.realStats?.FIP);
            const uv = allP.filter(p => p.realStats.FIP < p.realStats.ERA - 0.5 && (p.realStats.BABIP||0) > 0.310).slice(0,5);
            if (!uv.length) return '<div style="color:var(--text-dim);">리그에서 저평가 투수를 분석 중...</div>';
            return `<div style="margin-bottom:8px;font-weight:700;">📊 저평가 의심 투수</div>
            <table><tr><th>선수</th><th>팀</th><th>ERA</th><th>FIP</th><th>BABIP</th></tr>
            ${uv.map(p=>`<tr><td>${p.name}</td><td>${p.team}</td><td class="stat-bad">${p.realStats.ERA.toFixed(2)}</td><td class="stat-ok">${p.realStats.FIP.toFixed(2)}</td><td class="stat-warn">${(p.realStats.BABIP||0).toFixed(3)}</td></tr>`).join('')}</table>
            <div style="margin-top:8px;font-size:12px;color:var(--text-muted);">"저는 수비의 불운에 가려진 에이스를 봅니다."</div>`;
        },
        choices: [
            { id:'scout', icon:'🔍', label:'저평가 투수 트레이드 추진', desc:'FIP가 낮은 투수를 찾아 영입한다', action:()=>{ showToast('트레이드 탭에서 저평가 투수를 찾아보세요!','success'); setTimeout(()=>showView('trade'),500); } },
            { id:'pass', icon:'⏭️', label:'현 전력으로 유지', desc:'기존 투수진을 신뢰한다', action:()=>{ showToast('현 전력을 유지합니다.','info'); } },
        ],
    },
    mission4: {
        trigger: 54, tag: '[경보]', title: '불펜진 붕괴! 위기 봉쇄 투수 영입',
        sender: '코칭스태프 긴급 보고',
        message: `우리 팀 불펜은 2스트라이크를 잡고도 자꾸 안타를 맞아 역전패를 당하고 있습니다.<br><strong>CSW%가 높은 '결정구 마스터' 불펜 투수를 찾아 영입하세요.</strong><br>이 선수가 마운드에 오르면 타자들은 포기합니다.`,
        getData: (tc) => {
            const bp = getTeamPitchers(state, tc).filter(p => p.role==='중계'||p.role==='마무리');
            const avgERA = bp.length ? (bp.reduce((s,p) => s+(p.simStats?.ERA||p.realStats?.ERA||4.5),0)/bp.length).toFixed(2) : '?';
            return `<div style="margin-bottom:8px;font-weight:700;">📊 우리 팀 불펜 현황</div>
            <table><tr><th>역할</th><th>인원</th><th>평균 ERA</th></tr>
            <tr><td>마무리</td><td>${bp.filter(p=>p.role==='마무리').length}명</td><td rowspan="2">${avgERA}</td></tr>
            <tr><td>중계</td><td>${bp.filter(p=>p.role==='중계').length}명</td></tr></table>
            <div style="margin-top:8px;font-size:12px;color:var(--text-muted);">CSW%가 높은 투수 = 결정구가 뛰어난 투수!</div>`;
        },
        choices: [
            { id:'recruit', icon:'🔥', label:'불펜 투수 영입', desc:'트레이드로 결정구 마스터를 데려온다', action:()=>{ showToast('트레이드 탭에서 불펜 투수를 찾아보세요!','success'); setTimeout(()=>showView('trade'),500); } },
            { id:'internal', icon:'🔧', label:'내부 선수 전환', desc:'2군에서 유망 투수를 올린다', action:()=>{ showToast('로스터에서 2군 투수를 확인하세요.','info'); setTimeout(()=>showView('roster'),500); } },
        ],
    },
    mission6: {
        trigger: 72, tag: '[예산 경보]', title: '샐러리캡 한도! 가성비 출루형 타자',
        sender: '재무팀 경고',
        message: `화려한 홈런 타자는 살 수가 없습니다.<br><strong>wRC+가 높으면서도 연봉이 낮은 '가성비 출루형' 선수를 찾아야 합니다.</strong><br>연봉 대비 wRC+ 효율이 가장 좋은 타자를 영입하세요.`,
        getData: (tc) => {
            const allB = Object.values(state.players).filter(p => p.position!=='P' && p.realStats?.['wRC+'] && p.salary>0);
            const eff = allB.map(p=>({...p, eff: p.realStats['wRC+']/Math.max(p.salary,0.3)})).sort((a,b)=>b.eff-a.eff).slice(0,5);
            if (!eff.length) return '<div style="color:var(--text-dim);">분석 중...</div>';
            return `<div style="margin-bottom:8px;font-weight:700;">📊 가성비 TOP 5 타자 (wRC+/연봉)</div>
            <table><tr><th>선수</th><th>팀</th><th>wRC+</th><th>연봉</th><th>효율</th></tr>
            ${eff.map(p=>`<tr><td>${p.name}</td><td>${p.team}</td><td>${p.realStats['wRC+'].toFixed(1)}</td><td>${p.salary}억</td><td class="stat-ok">${p.eff.toFixed(1)}</td></tr>`).join('')}</table>
            <div style="margin-top:8px;font-size:12px;color:var(--text-muted);">연봉 대비 생산성 = 머니볼의 핵심!</div>`;
        },
        choices: [
            { id:'trade', icon:'💰', label:'가성비 타자 트레이드', desc:'효율 높은 선수를 영입한다', action:()=>{ showToast('트레이드 탭에서 가성비 타자를 찾아보세요!','success'); setTimeout(()=>showView('trade'),500); } },
            { id:'develop', icon:'📈', label:'2군 유망주 육성', desc:'내부 자원으로 해결한다', action:()=>{ showToast('로스터에서 유망주를 확인하세요.','info'); setTimeout(()=>showView('roster'),500); } },
        ],
    },
};

/** 범용 미션 카드 표시 */
function showMissionCard(missionKey) {
    if (!missionKey) { missionKey = 'mission2'; } // 기존 호환
    const mission = GM_MISSIONS[missionKey];
    if (!mission) return;
    if (foreignScoutState['done_' + missionKey]) return;

    const modal = document.getElementById('missionModal');
    if (!modal) return;

    const tc = (typeof getMyTeam==='function'&&getMyTeam()) || document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    document.getElementById('missionTag').textContent = mission.tag;
    document.getElementById('missionTitle').textContent = mission.title;
    document.getElementById('missionSender').textContent = mission.sender;
    document.getElementById('missionMessage').innerHTML = mission.message;
    document.getElementById('missionData').innerHTML = mission.getData(tc);

    const choicesEl = document.getElementById('missionChoices');
    choicesEl.innerHTML = mission.choices.map(c=>`
        <button class="mission-choice" data-choice="${c.id}">
            <span class="mission-choice__icon">${c.icon}</span>
            <span class="mission-choice__label">${c.label}</span>
            <span class="mission-choice__desc">${c.desc}</span>
        </button>`).join('');

    choicesEl.querySelectorAll('.mission-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            foreignScoutState['done_'+missionKey] = btn.dataset.choice;
            saveForeignScoutState();
            const ch = mission.choices.find(c=>c.id===btn.dataset.choice);
            if (ch?.action) ch.action();
        });
    });

    modal.style.display = 'flex';
}

function closeMissionCard(choice) {
    const modal = document.getElementById('missionModal');
    if (modal) modal.style.display = 'none';
}

// ── 미션 트리거 체크 (시뮬레이션 배치 후 호출) ──
function checkForeignMissionTrigger() {
    const totalPlayed = getTotalGamesPlayed(state);
    // 명시적 순서로 미션 체크 (trigger 오름차순)
    const missionOrder = ['mission2', 'mission3', 'mission4', 'mission6'];
    for (let i = 0; i < missionOrder.length; i++) {
        const key = missionOrder[i];
        const mission = GM_MISSIONS[key];
        if (!mission) continue;
        if (totalPlayed >= mission.trigger && !foreignScoutState['done_'+key]) {
            console.log('[미션] ' + key + ' 발동 (경기수: ' + totalPlayed + ', trigger: ' + mission.trigger + ')');
            setTimeout(() => showMissionCard(key), 800);
            return; // 한 번에 하나만
        }
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

// ── 투수 구종 자동 생성 (선수 특성 기반) ──
function generatePitchRepertoire(p) {
    const r = p.ratings;
    const stuff = r.stuff || 50;
    const isLefty = p.throwBat && p.throwBat.startsWith('좌');
    const isSidearm = p.throwBat && (p.throwBat.includes('사') || p.throwBat.includes('언'));

    // 기본 구속: 선수 데이터에 velocity가 있으면 사용, 없으면 stuff 기반 계산
    const baseVelo = (() => {
        if (p.velocity) return p.velocity;
        let v = 140 + (stuff - 50) * 0.4; // stuff 50 = 140km, stuff 70 = 148km
        if (p.origin === 'MLB') v += 3;
        else if (p.origin === 'AAA') v += 1;
        else if (p.origin === 'NPB' || p.origin === 'CPBL') v -= 1;
        else if (p.origin === '독립리그' || p.origin === 'ABL') v -= 3;
        if (isLefty) v -= 1;
        if (isSidearm) v -= 3;
        return Math.round(v);
    })();

    // 시드 해시 (이름 기반으로 일관된 결과)
    let hash = 0;
    for (let i = 0; i < p.name.length; i++) hash = ((hash << 5) - hash) + p.name.charCodeAt(i);
    const rng = () => { hash = (hash * 16807 + 0) % 2147483647; return (hash & 0x7fffffff) / 2147483647; };

    const pitches = [];
    // 포심/싱커 선택
    const useSinker = rng() < 0.35;
    if (useSinker) {
        pitches.push({ name: '싱커', velo: baseVelo - 1, pct: 25 + Math.round(rng() * 15) });
        if (rng() < 0.5) pitches.push({ name: '포심', velo: baseVelo, pct: 10 + Math.round(rng() * 10) });
    } else {
        pitches.push({ name: '포심', velo: baseVelo, pct: 30 + Math.round(rng() * 15) });
    }

    // 변화구 2~4개 추가
    const breakingOptions = [
        { name: '슬라이더', velo: baseVelo - 15 + Math.round(rng() * 4) },
        { name: '커브', velo: baseVelo - 25 + Math.round(rng() * 4) },
        { name: '체인지업', velo: baseVelo - 18 + Math.round(rng() * 4) },
        { name: '커터', velo: baseVelo - 10 + Math.round(rng() * 3) },
        { name: '스플리터', velo: baseVelo - 16 + Math.round(rng() * 3) },
        { name: '포크볼', velo: baseVelo - 20 + Math.round(rng() * 3) },
    ];

    // 셔플
    for (let i = breakingOptions.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [breakingOptions[i], breakingOptions[j]] = [breakingOptions[j], breakingOptions[i]];
    }

    const numBreaking = p.role === '선발' ? (2 + Math.floor(rng() * 2)) : (1 + Math.floor(rng() * 2));
    for (let i = 0; i < numBreaking && i < breakingOptions.length; i++) {
        const pct = i === 0 ? (20 + Math.round(rng() * 10)) : (8 + Math.round(rng() * 12));
        pitches.push({ ...breakingOptions[i], pct });
    }

    // pct 합계 100%로 보정
    const totalPct = pitches.reduce((s, pt) => s + pt.pct, 0);
    pitches.forEach(pt => pt.pct = Math.round(pt.pct / totalPct * 100));
    // 반올림 오차 보정
    const diff = 100 - pitches.reduce((s, pt) => s + pt.pct, 0);
    if (diff !== 0) pitches[0].pct += diff;

    // pct 내림차순 정렬
    pitches.sort((a, b) => b.pct - a.pct);

    return pitches;
}

function getFlagImg(nationality, size = 24) {
    const code = NATIONALITY_CODES[nationality];
    if (!code) return '';
    return `<img src="https://flagcdn.com/w40/${code}.png" alt="${nationality}" style="width:${size}px;height:auto;vertical-align:middle;border-radius:2px;">`;
}

// ── 외국인 스카우트 렌더링 ──
let currentFsMode = 'pitcher';
let fsSortKey = null;
let fsSortDir = 'desc';

function sortFsPool(pool, type) {
    if (!fsSortKey) return pool;
    const sorted = [...pool];
    sorted.sort((a, b) => {
        let va, vb;
        if (fsSortKey === 'name') { va = a.name; vb = b.name; }
        else if (fsSortKey === 'origin') { va = a.origin; vb = b.origin; }
        else if (fsSortKey === 'role' || fsSortKey === 'position') { va = a[fsSortKey] || ''; vb = b[fsSortKey] || ''; }
        else if (fsSortKey === 'salary' || fsSortKey === 'age') { va = a[fsSortKey] || 0; vb = b[fsSortKey] || 0; }
        else if (fsSortKey === 'throwBat') { va = a.throwBat || ''; vb = b.throwBat || ''; }
        else { va = (a.stats && a.stats[fsSortKey]) || 0; vb = (b.stats && b.stats[fsSortKey]) || 0; }
        if (typeof va === 'string') return fsSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
        return fsSortDir === 'asc' ? va - vb : vb - va;
    });
    return sorted;
}

function fsSortHeader(label, key) {
    const tip = STAT_TOOLTIPS[label];
    const arrow = fsSortKey === key ? (fsSortDir === 'asc' ? ' ▲' : ' ▼') : '';
    const cls = tip ? 'fs-th-tip fs-th-sort' : 'fs-th-sort';
    const dataTip = tip ? ` data-tip="${tip}"` : '';
    return `<th class="${cls}"${dataTip} style="cursor:pointer;user-select:none;white-space:nowrap;" onclick="setFsSort('${key}')">${label}${arrow}</th>`;
}

function setFsSort(key) {
    if (fsSortKey === key) {
        fsSortDir = fsSortDir === 'asc' ? 'desc' : 'asc';
    } else {
        fsSortKey = key;
        fsSortDir = (key === 'name' || key === 'origin' || key === 'role' || key === 'position') ? 'asc' : 'desc';
    }
    renderForeignScout();
}

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
    'K/9': '9이닝당 탈삼진. SO÷IP×9로 계산. 9.0 이상이면 우수, 11.0+이면 엘리트급',
    'Putaway%': '결정구 비율. 2스트라이크 후 삼진으로 마무리하는 비율. 28%+ 우수, 33%+ 엘리트급',
    // 타자
    'AVG': '타율. 안타/타수. 높을수록 좋음 (리그평균 ~.260)',
    'OPS': '출루율+장타율. 타자의 종합 생산성. .800 이상이면 우수',
    'wRC+': '조정 득점 생산력. 리그 평균=100, 120이면 평균보다 20% 우수',
    'Barrel%': '배럴 비율. 최적 타구각+속도 비율. 높을수록 장타 능력 우수 (10%+ 우수)',
    'HR': '홈런 수. 시즌 총 홈런 개수',
    'SB': '도루 수. 시즌 총 도루 개수. 주루 능력 지표',
    // 공통
    '출신': '선수의 최근 소속 리그 (MLB/AAA/NPB/CPBL 등)',
    '투구': '투구 손/폼 (좌투/우투/우언/좌사 등)',
    '투타': '투구 손 + 타격 손 (좌투좌타/우투우타/양투양타 등)',
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
    let pool = filterForeignPitchers();
    pool = sortFsPool(pool, 'pitcher');
    document.getElementById('fsResultCount').textContent = `투수 후보 ${pool.length}명`;
    const cnt = document.getElementById('fsCountP');
    if (cnt) cnt.textContent = pool.length + '명';

    const thead = document.querySelector('#fsResultTable thead tr');
    thead.innerHTML =
        `<th style="width:30px;"></th>` + fsSortHeader('이름','name') +
        fsSortHeader('출신','origin') + fsSortHeader('투구','throwBat') + fsSortHeader('역할','role') +
        fsSortHeader('연봉(만$)','salary') + fsSortHeader('나이','age') +
        fsSortHeader('ERA','ERA') + fsSortHeader('FIP','FIP') +
        fsSortHeader('IVB','IVB') + fsSortHeader('CSW%','CSW%') +
        fsSortHeader('K/9','K/9') + fsSortHeader('Putaway%','Putaway%') +
        fsSortHeader('IP','IP') + fsSortHeader('SO','SO') +
        `<th></th>`;

    const tbody = document.querySelector('#fsResultTable tbody');
    tbody.innerHTML = pool.map(p => {
        const throwArm = p.throwBat ? p.throwBat.split(/[우좌]타/)[0] : '-';
        return `<tr onclick="showFsPlayerDetail('pitcher', '${p.name}')">
            <td onclick="event.stopPropagation()"><input type="checkbox" class="fs-compare-chk" data-name="${p.name}" data-type="pitcher" onchange="updateFsCompareBtn()"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.origin}</td>
            <td>${throwArm}</td>
            <td>${p.role}</td>
            <td>${p.salary}</td>
            <td>${p.age}</td>
            <td>${p.stats.ERA.toFixed(2)}</td>
            <td>${p.stats.FIP.toFixed(2)}</td>
            <td>${p.stats.IVB}</td>
            <td>${p.stats['CSW%']}</td>
            <td>${p.stats['K/9']}</td>
            <td>${p.stats['Putaway%']}</td>
            <td>${p.stats.IP}</td>
            <td>${p.stats.SO}</td>
            <td><button class="fs-recruit-btn" onclick="event.stopPropagation(); recruitForeignPlayer('pitcher','${p.name}')">영입</button></td>
        </tr>`;
    }).join('');
}

function renderFsBatters() {
    let pool = filterForeignBatters();
    pool = sortFsPool(pool, 'batter');
    document.getElementById('fsResultCount').textContent = `타자 후보 ${pool.length}명`;
    const cnt = document.getElementById('fsCountB');
    if (cnt) cnt.textContent = pool.length + '명';

    const thead = document.querySelector('#fsResultTable thead tr');
    thead.innerHTML =
        `<th style="width:30px;"></th>` + fsSortHeader('이름','name') +
        fsSortHeader('출신','origin') + fsSortHeader('투타','throwBat') + fsSortHeader('포지션','position') +
        fsSortHeader('연봉(만$)','salary') + fsSortHeader('나이','age') +
        fsSortHeader('AVG','AVG') + fsSortHeader('OPS','OPS') +
        fsSortHeader('wRC+','wRC+') + fsSortHeader('Barrel%','Barrel%') +
        fsSortHeader('HR','HR') + fsSortHeader('SB','SB') +
        `<th></th>`;

    const tbody = document.querySelector('#fsResultTable tbody');
    tbody.innerHTML = pool.map(p => {
        return `<tr onclick="showFsPlayerDetail('batter', '${p.name}')">
            <td onclick="event.stopPropagation()"><input type="checkbox" class="fs-compare-chk" data-name="${p.name}" data-type="batter" onchange="updateFsCompareBtn()"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.origin}</td>
            <td>${p.throwBat || '-'}</td>
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
        if (f.ageMin && p.age < Number(f.ageMin)) return false;
        if (f.ageMax && p.age > Number(f.ageMax)) return false;
        if (f.stuffMin && p.ratings.stuff < Number(f.stuffMin)) return false;
        if (f.stuffMax && p.ratings.stuff > Number(f.stuffMax)) return false;
        if (f.commandMin && p.ratings.command < Number(f.commandMin)) return false;
        if (f.commandMax && p.ratings.command > Number(f.commandMax)) return false;
        const ovr = calcForeignPitcherOVR(p.ratings);
        if (f.ovrMin && ovr < Number(f.ovrMin)) return false;
        if (f.ovrMax && ovr > Number(f.ovrMax)) return false;
        // ── 세이버메트릭스 필터 ──
        const s = p.stats;
        if (f.eraMin  && s.ERA           < Number(f.eraMin))    return false;
        if (f.eraMax  && s.ERA           > Number(f.eraMax))    return false;
        if (f.fipMin  && s.FIP           < Number(f.fipMin))    return false;
        if (f.fipMax  && s.FIP           > Number(f.fipMax))    return false;
        if (f.k9Min   && s['K/9']        < Number(f.k9Min))     return false;
        if (f.k9Max   && s['K/9']        > Number(f.k9Max))     return false;
        if (f.ivbMin  && s.IVB           < Number(f.ivbMin))    return false;
        if (f.ivbMax  && s.IVB           > Number(f.ivbMax))    return false;
        if (f.cswMin  && s['CSW%']       < Number(f.cswMin))    return false;
        if (f.cswMax  && s['CSW%']       > Number(f.cswMax))    return false;
        if (f.ipMin   && s.IP            < Number(f.ipMin))     return false;
        if (f.ipMax   && s.IP            > Number(f.ipMax))     return false;
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
        if (f.ageMin && p.age < Number(f.ageMin)) return false;
        if (f.ageMax && p.age > Number(f.ageMax)) return false;
        if (f.contactMin && p.ratings.contact < Number(f.contactMin)) return false;
        if (f.contactMax && p.ratings.contact > Number(f.contactMax)) return false;
        if (f.powerMin && p.ratings.power < Number(f.powerMin)) return false;
        if (f.powerMax && p.ratings.power > Number(f.powerMax)) return false;
        // ── 세이버메트릭스 필터 ──
        const s = p.stats;
        if (f.opsMin    && s.OPS          < Number(f.opsMin))    return false;
        if (f.opsMax    && s.OPS          > Number(f.opsMax))    return false;
        if (f.wrcMin    && s['wRC+']      < Number(f.wrcMin))    return false;
        if (f.wrcMax    && s['wRC+']      > Number(f.wrcMax))    return false;
        if (f.barrelMin && s['Barrel%']   < Number(f.barrelMin)) return false;
        if (f.barrelMax && s['Barrel%']   > Number(f.barrelMax)) return false;
        if (f.hrMin     && s.HR           < Number(f.hrMin))     return false;
        if (f.hrMax     && s.HR           > Number(f.hrMax))     return false;
        return true;
    });
}

// ── 상세 스카우팅 리포트 생성 ──
function generateDetailedReport(p, type) {
    const r = p.ratings;
    const s = p.stats;
    const isPitcher = type === 'pitcher';

    // ── 종합 요약 ──
    let summary = '';
    if (isPitcher) {
        const avgR = (r.stuff + r.command + r.stamina + r.effectiveness + r.consistency) / 5;
        if (avgR >= 58) summary = `${p.origin} 출신으로 검증된 실력을 갖춘 투수다. 현재 보여주는 것이 곧 이 선수의 실체라고 봐도 무방하다. KBO 리그에서 로테이션의 핵심 자원으로 활용 가능하며, 팀의 투수진 안정화에 크게 기여할 수 있다.`;
        else if (avgR >= 50) summary = `${p.origin}에서 일정 수준의 성적을 보여준 투수다. 뚜렷한 강점과 약점이 공존하며, KBO 적응 여부에 따라 성적 편차가 클 수 있다. 보강 포인트가 명확한 팀이라면 고려해볼 만하다.`;
        else summary = `아직 검증이 부족한 투수다. 잠재력에 베팅하는 영입이 될 수 있으며, 성공 시 가성비가 뛰어나지만 실패 리스크도 상당하다. 충분한 적응 기간이 필요할 것으로 보인다.`;

        if (s.ERA > 5.0 && s.FIP < 4.5) summary += ' 다만, ERA와 FIP의 괴리가 크다는 점은 주목할 만하다. 불운의 영향이 있었을 가능성이 있다.';
        if (s.IVB >= 40) summary += ' 직구의 수직 무브먼트가 인상적이어서 헛스윙을 유도하는 능력이 뛰어나다.';
    } else {
        const avgR = (r.contact + r.power + r.eye + r.speed + r.defense) / 5;
        if (avgR >= 55) summary = `${p.origin} 출신의 검증된 타자다. 복수의 도구에서 평균 이상의 능력을 보유하고 있으며, KBO 리그에서 중심 타선을 구성할 수 있는 자원이다.`;
        else if (avgR >= 45) summary = `${p.origin}에서 활동한 타자로, 특정 영역에서 강점을 가지고 있다. KBO 투수진 상대로 적응 기간이 필요하나, 자신의 강점을 살리면 기여할 수 있다.`;
        else summary = `아직 상위 리그에서의 검증이 부족한 타자다. 성장 가능성에 기대하는 영입이며, 적응에 시간이 필요할 것으로 예상된다.`;

        if (s.OPS >= 0.800) summary += ' 출루+장타 생산력이 우수한 편이다.';
        if (s['Barrel%'] >= 12) summary += ' 타구 질이 뛰어나 장타 생산 능력이 검증되어 있다.';
    }

    // ── 강점 ──
    const strengths = [];
    if (isPitcher) {
        if (r.stuff >= 58) strengths.push('구위가 인상적이며 삼진을 잡아낼 수 있는 구종을 보유하고 있다');
        if (r.stuff >= 62) strengths.push('패스트볼의 무브먼트가 상급이며 타자들이 컨택하기 어려워한다');
        if (r.command >= 58) strengths.push('뛰어난 제구력으로 볼넷을 효과적으로 억제한다');
        if (r.command >= 65) strengths.push('코너워크가 정교하며 유리한 카운트를 만드는 능력이 탁월하다');
        if (r.stamina >= 58) strengths.push('이닝 소화 능력이 우수하여 선발 로테이션 안정화에 기여한다');
        if (r.stamina >= 65) strengths.push('시즌 후반까지 체력이 유지되는 이닝이터 타입이다');
        if (r.effectiveness >= 58) strengths.push('실전에서의 효율이 높아 실제 성적이 기대치를 상회하는 경향이 있다');
        if (r.consistency >= 58) strengths.push('등판마다 안정적인 퍼포먼스를 보여주어 신뢰할 수 있다');
        if (s['CSW%'] >= 30) strengths.push('스트라이크+헛스윙 비율이 높아 카운트 장악력이 뛰어나다');
        if (s['K/9'] >= 10) strengths.push(`K/9 ${s['K/9']}로 탈삼진 능력이 상위권이다. 이닝당 삼진 생산력이 뛰어나다`);
        if (s['Putaway%'] >= 28) strengths.push(`Putaway% ${s['Putaway%']}%로 결정구의 위력이 인상적이다. 2스트라이크 후 마무리 능력이 탁월하다`);
        if (s.FIP < 3.5) strengths.push('수비와 무관한 순수 투구 능력이 상위권이다');
    } else {
        if (r.contact >= 58) strengths.push('컨택 능력이 뛰어나 다양한 구종에 대응하는 능력이 우수하다');
        if (r.contact >= 65) strengths.push('배트 컨트롤이 최상급으로 꾸준한 안타 생산이 가능하다');
        if (r.power >= 58) strengths.push('임팩트 순간의 폭발력이 인상적이며 장타 생산 능력이 우수하다');
        if (r.power >= 68) strengths.push('순수 파워가 최상급이며 한 방으로 경기 흐름을 바꿀 수 있다');
        if (r.eye >= 55) strengths.push('선구안이 좋아 출루율이 높고 투수를 지치게 만든다');
        if (r.eye >= 62) strengths.push('볼 선별 능력이 뛰어나 볼넷을 잘 골라내는 출루 머신이다');
        if (r.speed >= 55) strengths.push('주루 능력이 우수하여 도루와 진루에서 가치를 더한다');
        if (r.speed >= 65) strengths.push('리그 최상위급 스피드로 수비 범위와 주루에서 압도적이다');
        if (r.defense >= 58) strengths.push('수비 안정성이 높아 포지션에서 믿음직한 플레이를 보여준다');
        if (r.defense >= 65) strengths.push('수비 범위와 송구가 출중하며 골드글러브급 수비 가치를 지닌다');
        if (s['wRC+'] >= 120) strengths.push('득점 생산력이 리그 평균 대비 월등히 높다');
    }
    if (strengths.length === 0) strengths.push('특별히 두드러지는 강점보다는 밸런스형 선수로 평가된다');

    // ── 약점 ──
    const weaknesses = [];
    if (isPitcher) {
        if (r.stuff <= 48) weaknesses.push('구위에 한계가 있어 KBO 상위 타선 상대로 고전할 수 있다');
        if (r.command <= 48) weaknesses.push('제구 불안이 있어 볼넷으로 인한 자멸 가능성이 존재한다');
        if (r.command <= 42) weaknesses.push('제구력이 심각하게 부족하여 이닝 초반부터 주자를 내보낼 수 있다');
        if (r.stamina <= 40) weaknesses.push('체력적 한계로 선발 풀이닝 소화가 어려울 수 있다');
        if (r.effectiveness <= 45) weaknesses.push('실전 효율이 낮아 기대 이하의 성적을 낼 가능성이 있다');
        if (r.consistency <= 45) weaknesses.push('등판별 편차가 커서 안정적인 성적을 기대하기 어렵다');
        if (s.HR >= 20 && s.IP < 150) weaknesses.push('피홈런 비율이 높아 한 방에 무너질 수 있는 리스크가 있다');
        if (s['K/9'] < 7) weaknesses.push(`K/9 ${s['K/9']}로 탈삼진 능력이 부족하다. 타구를 허용하는 빈도가 높아 수비 의존도가 높을 수 있다`);
        if (s['Putaway%'] < 20) weaknesses.push(`Putaway% ${s['Putaway%']}%로 결정구 위력이 약하다. 2스트라이크 후에도 안타를 허용할 가능성이 높다`);
    } else {
        if (r.contact <= 45) weaknesses.push('삼진이 많아 찬스 상황에서 생산성이 떨어질 수 있다');
        if (r.power <= 38) weaknesses.push('장타력이 부족하여 클린업 타선에는 적합하지 않다');
        if (r.eye <= 40) weaknesses.push('볼 선별 능력이 부족하여 투수 유리한 카운트에 자주 몰린다');
        if (r.speed <= 28) weaknesses.push('주루와 수비 범위에서 한계가 뚜렷하다');
        if (r.defense <= 35) weaknesses.push('프로 수준의 수비력에 도달하려면 개선이 필요하다');
        if (r.defense <= 25) weaknesses.push('수비 포지션이 DH로 제한될 가능성이 높다');
    }
    if (weaknesses.length === 0) weaknesses.push('뚜렷한 약점은 발견되지 않았으나, 모든 영역에서 압도적이지는 않다');

    // ── 역할 전망 ──
    let roleForecast = '';
    if (isPitcher) {
        if (r.stamina >= 55 && r.command >= 50) {
            if (r.stuff >= 58) roleForecast = `[에이스/핵심 선발] 로테이션의 1~2선발로 기대할 수 있다. 중요한 경기에서 믿고 맡길 수 있는 투수다.`;
            else roleForecast = `[이닝이터/로테이션 선발] 매 경기 안정적인 이닝을 소화하며 불펜 부담을 줄여주는 역할이 기대된다.`;
        } else if (r.stuff >= 58 && r.stamina < 50) {
            roleForecast = `[불펜 핵심/셋업맨] 짧은 이닝에서 구위를 극대화할 수 있다. 7~8회를 책임질 수 있는 자원이다.`;
        } else if (p.role === '마무리') {
            roleForecast = `[마무리/고레버리지] 9회 마운드를 맡길 수 있는 마무리 자원이다. 심장이 강한 타입인지가 관건이다.`;
        } else {
            roleForecast = `[로테이션 하위/롱릴리프] 5선발 또는 롱릴리프로 활용 가능하다. 선발진 부상 시 백업으로서의 가치가 있다.`;
        }
    } else {
        if (r.power >= 60 && r.contact >= 50) roleForecast = `[클린업 타자] 4번 타자 또는 중심 타선에 배치하여 장타력을 활용할 수 있다.`;
        else if (r.contact >= 58 && r.eye >= 50) roleForecast = `[출루형/상위 타선] 1~2번 타자로 출루율을 높이고 득점 기회를 만드는 역할이 적합하다.`;
        else if (r.speed >= 58 && r.defense >= 55) roleForecast = `[수비형/리드오프] 수비와 주루로 팀에 기여하며, 리드오프나 하위 타선에서 활용 가능하다.`;
        else if (r.power >= 65) roleForecast = `[파워 전문/DH] 순수 파워를 활용한 DH 또는 대타 요원으로 가치가 높다.`;
        else roleForecast = `[유틸리티/밸런스형] 여러 역할을 소화할 수 있는 범용 자원이다. 팀 상황에 맞춰 유연하게 활용 가능하다.`;
    }

    // ── 비교 선수 (KBO 역대 외국인) ──
    let compPlayer = '';
    if (isPitcher) {
        if (r.stuff >= 62 && r.command >= 55) compPlayer = '에릭 해커(NC)처럼 구위와 제구를 겸비한 안정적인 에이스 타입이다.';
        else if (r.command >= 62 && r.stuff <= 50) compPlayer = '닉 킹엄(삼성)처럼 구속보다 제구와 경험으로 승부하는 연식 투수 타입이다.';
        else if (r.stuff >= 58 && r.command <= 48) compPlayer = '윌리엄스(롯데)처럼 구위는 좋으나 제구가 불안한 잠재력 타입이다. 코칭스태프의 관리가 관건이다.';
        else if (r.stamina >= 62) compPlayer = '플럿코(삼성)처럼 이닝을 묵묵히 소화하는 워크호스 타입이다.';
        else compPlayer = 'KBO 중위권 외국인 투수와 유사한 프로필이다. 적응 여부에 따라 성적 편차가 클 수 있다.';
    } else {
        if (r.power >= 68) compPlayer = '로하스(KT)처럼 KBO에서 40홈런 이상을 노릴 수 있는 순수 파워 타입이다.';
        else if (r.contact >= 60 && r.eye >= 55) compPlayer = '헤이스(KIA)처럼 안타와 출루를 꾸준히 생산하는 컨택형 타자 타입이다.';
        else if (r.speed >= 60 && r.defense >= 55) compPlayer = '피렐라(삼성)처럼 주루와 수비로 팀에 활력을 불어넣는 타입이다.';
        else if (r.power >= 55 && r.contact >= 50) compPlayer = '오스틴(LG)처럼 파워와 컨택을 겸비한 밸런스형 타자 타입이다.';
        else compPlayer = 'KBO 중위권 외국인 타자와 유사한 프로필이다. 팀 맞춤형 영입이 될 수 있다.';
    }

    // ── KBO 적응 전망 ──
    let adaptForecast = '';
    const originAdapt = { 'MLB': '높음', 'AAA': '보통~높음', 'NPB': '높음', 'CPBL': '보통', 'AA': '보통~낮음', '쿠바': '미지수', '중남미': '보통', '독립리그': '보통~낮음', 'ABL': '보통~낮음' };
    const adaptLevel = originAdapt[p.origin] || '미지수';

    if (p.age >= 33) adaptForecast = `적응 가능성: ${adaptLevel}. ${p.origin} 경험이 있으나 나이(${p.age}세)를 고려하면 체력 관리가 관건이다. 시즌 후반 컨디션 저하 가능성을 대비해야 한다.`;
    else if (p.age <= 25) adaptForecast = `적응 가능성: ${adaptLevel}. 젊은 나이(${p.age}세)로 성장 가능성이 있으나, ${p.origin} 수준에서 KBO로의 전환에 적응 기간이 필요할 수 있다.`;
    else adaptForecast = `적응 가능성: ${adaptLevel}. ${p.origin} 경험과 적정 나이(${p.age}세)를 고려하면 비교적 안정적인 적응이 기대된다.`;

    if (p.origin === 'NPB' || p.origin === 'CPBL') adaptForecast += ' 아시아 야구 경험이 있어 타이밍 적응에 유리하다.';
    if (p.origin === 'MLB') adaptForecast += ' MLB 경험은 큰 자산이지만, KBO 특유의 좁은 존과 느린 경기 템포에 적응해야 한다.';

    return { summary, strengths, weaknesses, roleForecast, compPlayer, adaptForecast };
}

function showDetailedReport(type, name) {
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const p = pool.find(x => x.name === name);
    if (!p) return;

    // 교사는 무제한
    const myTeam = (typeof getMyTeam === 'function') ? getMyTeam() : null;
    const amAdmin = (typeof isAdmin === 'function') && isAdmin();

    if (!amAdmin && myTeam) {
        // 이미 이 팀이 다른 선수에게 사용했는지 확인
        const usedPlayer = foreignScoutState.detailedReports[myTeam];
        if (usedPlayer && usedPlayer !== p.name) {
            showToast(`이미 상세 스카우팅을 사용했습니다. (${usedPlayer})`, 'warning');
            return;
        }
        // 이 팀의 사용 기록 저장
        foreignScoutState.detailedReports[myTeam] = p.name;
    }
    saveForeignScoutState();

    const report = generateDetailedReport(p, type);
    const isAsia = p.type === '아시아쿼터';

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
                    ${p.nationality} · ${type === 'pitcher' ? p.role : p.position} · ${p.throwBat} · ${p.age}세 · ${p.height}cm/${p.weight}kg
                </div>
                <div style="margin-top:4px;font-size:13px;color:#fbbf24;">
                    연봉: ${p.salary}만$ ${isAsia ? '(아시아쿼터)' : ''}
                </div>
                <div style="margin-top:6px;padding:3px 10px;background:var(--accent);color:#fff;border-radius:4px;display:inline-block;font-size:11px;font-weight:700;">
                    DETAILED SCOUTING REPORT
                </div>
            </div>
        </div>`;

    ratings.innerHTML = `
        <div class="fs-report-section">
            <div class="fs-report-title">종합 요약</div>
            <div class="fs-report-box">${report.summary}</div>
        </div>

        <div class="fs-report-section">
            <div class="fs-report-title">강점</div>
            ${report.strengths.map(s => `<div class="fs-report-strength">${s}</div>`).join('')}
        </div>

        <div class="fs-report-section">
            <div class="fs-report-title">약점</div>
            ${report.weaknesses.map(w => `<div class="fs-report-weakness">${w}</div>`).join('')}
        </div>

        <div class="fs-report-section">
            <div class="fs-report-title">역할 전망</div>
            <div class="fs-report-box">${report.roleForecast}</div>
        </div>

        <div class="fs-report-section">
            <div class="fs-report-title">비교 선수</div>
            <div class="fs-report-box">${report.compPlayer}</div>
        </div>

        <div class="fs-report-section">
            <div class="fs-report-title">KBO 적응 전망</div>
            <div class="fs-report-box">${report.adaptForecast}</div>
        </div>`;

    statsEl.innerHTML = `
        <div style="font-size:11px;color:var(--text-muted);margin-top:12px;text-align:center;font-style:italic;">
            이 리포트는 스카우팅팀의 분석입니다. 최종 판단은 GM의 몫입니다.
        </div>`;

    modal.style.display = 'flex';
    const closeBtn = document.getElementById('playerModalClose');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    showToast(`${p.name}의 상세 스카우팅 리포트가 도착했습니다.`, 'success');
    updateScoutingRemaining();
}

function updateScoutingRemaining() {
    const el = document.getElementById('fsScoutingRemain');
    if (!el) return;

    const _amAdmin = (typeof isAdmin === 'function') && isAdmin();
    if (_amAdmin) {
        el.textContent = '상세 스카우팅: 무제한 (관리자)';
        el.style.color = '#fbbf24';
        return;
    }

    const _myTeam = (typeof getMyTeam === 'function') ? getMyTeam() : null;
    if (_myTeam) {
        const used = foreignScoutState.detailedReports[_myTeam];
        if (used) {
            el.textContent = `상세 스카우팅: 사용 완료 (${used})`;
            el.style.color = 'var(--text-muted)';
        } else {
            el.textContent = '상세 스카우팅: 1회 남음';
            el.style.color = '#fbbf24';
        }
    }
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
                <div class="fs-stat-box"><div class="fs-stat-label">K/9</div><div class="fs-stat-val">${p.stats['K/9']}</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">Putaway%</div><div class="fs-stat-val">${p.stats['Putaway%']}%</div></div>
                <div class="fs-stat-box"><div class="fs-stat-label">BABIP</div><div class="fs-stat-val">${p.stats.BABIP.toFixed(3)}</div></div>
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

    // 투수: 구종 섹션 추가
    if (type === 'pitcher') {
        const pitches = generatePitchRepertoire(p);
        const fb = pitches.find(pt => pt.name === '포심' || pt.name === '싱커');
        const avgVelo = fb ? fb.velo : pitches[0].velo;
        const pitchColors = { '포심':'#ef4444', '싱커':'#dc2626', '투심':'#b91c1c', '슬라이더':'#f59e0b', '커브':'#22c55e', '체인지업':'#3b82f6', '커터':'#f97316', '스플리터':'#8b5cf6', '포크볼':'#6366f1' };
        const maxPct = Math.max(...pitches.map(pt => pt.pct));
        statsHtml += `
            <div style="margin-top:12px;">
                <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:8px;">
                    <span style="font-size:24px;font-weight:900;color:var(--text-primary);">${avgVelo}</span>
                    <span style="font-size:11px;color:var(--text-muted);">km/h 평균구속</span>
                    <div style="display:flex;gap:4px;margin-left:auto;flex-wrap:wrap;">
                        ${pitches.map(pt => `<span style="background:${pitchColors[pt.name]||'#888'};color:#fff;font-size:10px;padding:2px 6px;border-radius:10px;">${pt.name} ${pt.velo}</span>`).join('')}
                    </div>
                </div>
                ${pitches.map(pt => `
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <span style="width:52px;font-size:12px;font-weight:600;color:var(--text-secondary);">${pt.name}</span>
                        <div style="flex:1;height:14px;background:var(--bg-main);border-radius:7px;overflow:hidden;">
                            <div style="height:100%;width:${pt.pct/maxPct*100}%;background:${pitchColors[pt.name]||'#888'};border-radius:7px;"></div>
                        </div>
                        <span style="width:32px;font-size:12px;font-weight:700;text-align:right;">${pt.pct}%</span>
                        <span style="width:52px;font-size:11px;color:var(--text-muted);text-align:right;">${pt.velo} km/h</span>
                    </div>
                `).join('')}
            </div>`;
    }

    ratings.innerHTML = statsHtml;

    // 상세 스카우팅 버튼: 팀별 1회 제한 + 다른 팀 리포트 비공개
    let scoutBtnHtml = '';
    const _myTeam = (typeof getMyTeam === 'function') ? getMyTeam() : null;
    const _amAdmin = (typeof isAdmin === 'function') && isAdmin();

    if (_amAdmin) {
        // 교사: 무제한
        scoutBtnHtml = `<button class="btn btn--sm btn--primary" style="width:100%;margin-top:12px;" onclick="event.stopPropagation(); showDetailedReport('${type}','${p.name}')">상세 스카우팅 리포트 보기</button>`;
    } else if (_myTeam) {
        const _usedPlayer = foreignScoutState.detailedReports[_myTeam];
        if (!_usedPlayer) {
            // 아직 미사용 → 버튼 활성화
            scoutBtnHtml = `<button class="btn btn--sm btn--primary" style="width:100%;margin-top:12px;" onclick="event.stopPropagation(); showDetailedReport('${type}','${p.name}')">상세 스카우팅 리포트 보기 (1회 기회)</button>`;
        } else if (_usedPlayer === p.name) {
            // 이 선수에게 이미 사용 → 다시 보기 가능
            scoutBtnHtml = `<button class="btn btn--sm btn--primary" style="width:100%;margin-top:12px;" onclick="event.stopPropagation(); showDetailedReport('${type}','${p.name}')">상세 스카우팅 리포트 다시 보기</button>`;
        } else {
            // 다른 선수에게 이미 사용함
            scoutBtnHtml = `<div style="text-align:center;margin-top:12px;font-size:11px;color:var(--text-muted);">상세 스카우팅 기회를 이미 사용했습니다 (${_usedPlayer})</div>`;
        }
    }

    statsEl.innerHTML = `
        <div style="background:rgba(251,191,36,0.08);border-radius:8px;padding:12px;margin-top:8px;">
            <div style="font-size:12px;font-weight:700;color:#fbbf24;margin-bottom:4px;">스카우팅 리포트</div>
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${p.scouting}</div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">${salaryNote}</div>
        ${scoutBtnHtml}`;

    modal.style.display = 'flex';

    // X 버튼 + 오버레이 클릭 닫기
    const closeBtn = document.getElementById('playerModalClose');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

// ── 방출 + 영입 기능 ──
let pendingRecruit = null; // 영입 대기 중인 선수 정보

function releasePlayer(playerId) {
    const userTeamCode = document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    const team = state.teams[userTeamCode];
    const player = state.players[playerId];
    if (!player) return;

    const playerName = player.name;
    // 로스터에서 제거
    team.roster = team.roster.filter(id => id !== playerId);
    // state에서 삭제
    delete state.players[playerId];

    localStorage.setItem('kbo-sim-state', JSON.stringify(state));
    showToast(`${playerName} 방출 완료.`, 'info');
}

function showReleaseModal(reason, recruitType, afterReleaseFn) {
    const userTeamCode = document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    const team = state.teams[userTeamCode];
    const allPlayers = team.roster.map(id => state.players[id]).filter(Boolean);

    let candidates;
    if (reason === 'foreign') {
        // 외국인 초과 → 같은 타입의 외국인만 (투수 영입이면 외국인 투수만, 타자면 외국인 타자만)
        candidates = allPlayers.filter(p => {
            if (!p.isForeign || p.isFranchiseStar) return false;
            const isPitcher = (p.position === 'P' || p.pos === 'P');
            return recruitType === 'pitcher' ? isPitcher : !isPitcher;
        });
        // 같은 타입이 없으면 전체 외국인 표시
        if (candidates.length === 0) {
            candidates = allPlayers.filter(p => p.isForeign && !p.isFranchiseStar);
        }
    } else {
        candidates = allPlayers.filter(p => !p.isFranchiseStar);
    }

    const modal = document.getElementById('playerModal');
    const header = document.getElementById('playerModalHeader');
    const ratings = document.getElementById('playerModalRatings');
    const statsEl = document.getElementById('playerModalStats');

    const reasonText = reason === 'foreign'
        ? '외국인 선수 자리가 부족합니다. 방출할 선수를 선택하세요.'
        : '1군 로스터(29명)가 가득 찼습니다. 방출할 선수를 선택하세요.';

    header.innerHTML = `
        <h3 style="margin:0;font-size:16px;color:#ef4444;">선수 방출</h3>
        <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${reasonText}</div>`;

    const rows = candidates.map(p => {
        const pos = p.position || p.pos || '-';
        const tag = p.isForeign
            ? (p.isAsiaQuota
                ? '<span style="background:#ff8800;color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;margin-left:3px;">아시아</span>'
                : '<span style="background:#ef4444;color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;margin-left:3px;">외국인</span>')
            : '';
        return `<tr onclick="doRelease('${p.id}')" style="cursor:pointer;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background=''">
            <td style="padding:6px 8px;font-weight:600;font-size:13px;">${p.name}${tag}</td>
            <td style="padding:6px 8px;font-size:12px;text-align:center;">${pos}</td>
            <td style="padding:6px 8px;font-size:12px;text-align:right;">${p.salary || '-'}억</td>
        </tr>`;
    }).join('');

    ratings.innerHTML = `
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
            <thead><tr style="border-bottom:1px solid var(--border);">
                <th style="text-align:left;padding:4px 8px;font-size:11px;color:var(--text-muted);">이름</th>
                <th style="text-align:center;padding:4px 8px;font-size:11px;color:var(--text-muted);">포지션</th>
                <th style="text-align:right;padding:4px 8px;font-size:11px;color:var(--text-muted);">연봉</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <div style="font-size:10px;color:var(--text-muted);margin-top:6px;text-align:center;">클릭하면 방출됩니다</div>`;

    statsEl.innerHTML = `
        <div style="text-align:center;margin-top:8px;">
            <button class="btn btn--sm btn--ghost" onclick="document.getElementById('playerModal').style.display='none'; pendingRecruit=null;">취소</button>
        </div>`;

    modal.style.display = 'flex';
    const closeBtn = document.getElementById('playerModalClose');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; pendingRecruit = null; };
    modal.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; pendingRecruit = null; } };

    window._afterReleaseFn = afterReleaseFn;
}

function doRelease(playerId) {
    const player = state.players[playerId];
    if (!player) return;

    releasePlayer(playerId);
    document.getElementById('playerModal').style.display = 'none';

    // 방출 후 영입 진행
    setTimeout(() => {
        if (window._afterReleaseFn) {
            const fn = window._afterReleaseFn;
            window._afterReleaseFn = null;
            fn();
        }
    }, 200);
}

// 아시아쿼터 선수 → 슬롯 선택 (아시아쿼터 or 외국인)
function showSlotChoiceModal(type, name) {
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const p = pool.find(x => x.name === name);
    if (!p) return;

    const userTeamCode = document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    const currentAsia = getTeamPlayers(state, userTeamCode).filter(pl => pl.isAsiaQuota).length;
    const currentClassic = getTeamPlayers(state, userTeamCode).filter(pl => pl.isForeign && !pl.isAsiaQuota).length;

    const asiaAvail = ASIA_QUOTA.maxAsiaQuota - currentAsia;
    const classicAvail = ASIA_QUOTA.maxForeignClassic - currentClassic;

    const modal = document.getElementById('playerModal');
    const header = document.getElementById('playerModalHeader');
    const ratings = document.getElementById('playerModalRatings');
    const statsEl = document.getElementById('playerModalStats');

    header.innerHTML = `
        <div>
            <h3 style="margin:0;font-size:18px;">${getFlagImg(p.nationality, 24)} ${p.name} 영입 방식 선택</h3>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">이 선수는 아시아쿼터 대상 국적입니다. 어떤 슬롯으로 영입하시겠습니까?</div>
        </div>`;

    ratings.innerHTML = `
        <div style="display:flex;gap:12px;margin-top:16px;">
            <div style="flex:1;background:rgba(0,174,239,0.06);border:1px solid var(--border);border-radius:8px;padding:16px;text-align:center;cursor:pointer;transition:all 0.15s;"
                 onmouseover="this.style.borderColor='#00aeef'" onmouseout="this.style.borderColor='var(--border)'"
                 onclick="document.getElementById('playerModal').style.display='none'; executeRecruit('${type}','${p.name}',true)">
                <div style="font-size:14px;font-weight:700;color:#00aeef;">아시아쿼터</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">잔여 ${asiaAvail}/${ASIA_QUOTA.maxAsiaQuota}명</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">연봉 최대 ${ASIA_QUOTA.newRecruitCap}만$</div>
            </div>
            <div style="flex:1;background:rgba(239,68,68,0.06);border:1px solid var(--border);border-radius:8px;padding:16px;text-align:center;cursor:pointer;transition:all 0.15s;"
                 onmouseover="this.style.borderColor='#ef4444'" onmouseout="this.style.borderColor='var(--border)'"
                 onclick="document.getElementById('playerModal').style.display='none'; executeRecruit('${type}','${p.name}',false)">
                <div style="font-size:14px;font-weight:700;color:#ef4444;">외국인</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">잔여 ${classicAvail}/${ASIA_QUOTA.maxForeignClassic}명</div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">연봉 제한 없음</div>
            </div>
        </div>`;

    statsEl.innerHTML = '';
    modal.style.display = 'flex';
    const closeBtn = document.getElementById('playerModalClose');
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
}

function recruitForeignPlayer(type, name) {
    // 권한 체크: 학생은 자기 팀만 영입 가능
    if (typeof isStudent === 'function' && isStudent()) {
        const currentTeam = document.getElementById('rosterTeamSelect')?.value;
        if (typeof guardTeamAction === 'function' && !guardTeamAction(currentTeam, '외국인 영입')) return;
    }
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const p = pool.find(x => x.name === name);
    if (!p) return;

    // 아시아쿼터 대상 선수 → 슬롯 선택 모달
    if (p.type === '아시아쿼터') {
        showSlotChoiceModal(type, name);
        return;
    }

    // 일반 외국인 → 바로 영입
    executeRecruit(type, name, false);
}

function executeRecruit(type, name, asAsiaQuota) {
    const pool = type === 'pitcher' ? FOREIGN_PITCHER_POOL : FOREIGN_BATTER_POOL;
    const p = pool.find(x => x.name === name);
    if (!p) return;

    const userTeamCode = document.getElementById('rosterTeamSelect')?.value || Object.keys(state.teams)[0];
    const foreignInfo = calcForeignSalary(state, userTeamCode);
    const team = state.teams[userTeamCode];

    // 아시아쿼터 연봉 체크 (아시아쿼터 슬롯 선택 시만)
    if (asAsiaQuota && p.salary > ASIA_QUOTA.newRecruitCap) {
        showToast(`아시아쿼터 신규 영입은 최대 ${ASIA_QUOTA.newRecruitCap}만$입니다.`, 'error');
        return;
    }

    // 외국인 초과 → 방출 모달 (총 외국인 수 기준)
    const needForeignRelease = foreignInfo.count >= ASIA_QUOTA.maxPlayers;

    if (needForeignRelease) {
        pendingRecruit = { type, name };
        showReleaseModal('foreign', type, () => executeRecruit(type, name, asAsiaQuota));
        return;
    }

    // 1군 초과 → 방출 모달
    if (team.roster.length >= 29) {
        pendingRecruit = { type, name };
        showReleaseModal('roster', type, () => executeRecruit(type, name, asAsiaQuota));
        return;
    }

    // 영입 실행
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
        isAsiaQuota: asAsiaQuota,
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
    pendingRecruit = null;

    localStorage.setItem('kbo-sim-state', JSON.stringify(state));

    showToast(`${p.name} 영입 완료!`, 'success');
    renderForeignScout();
}

// ── 초기화 ──
function initForeignScout() {
    loadForeignScoutState();

    // 상세 스카우팅 잔여 횟수 표시
    updateScoutingRemaining();

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
window.showDetailedReport = showDetailedReport;
window.doRelease = doRelease;
window.releasePlayer = releasePlayer;
window.executeRecruit = executeRecruit;
window.setFsSort = setFsSort;
