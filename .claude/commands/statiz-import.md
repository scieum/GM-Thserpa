# KBO 팀 선수 데이터 Statiz 임포트

Statiz(statiz.co.kr)에서 KBO 팀의 투수/타자 시즌 기록을 수집하여 `js/data.js`의 `REAL_SEASON_STATS`에 입력하는 자동화 스킬.

사용자가 팀명과 작업 유형(투수/타자공격/타자수비)을 지정하면 해당 데이터를 수집하고 코드에 반영한다.

## 사용법

```
/statiz-import [팀명] [유형]
```

- 팀명: LG, 두산, 롯데, KIA, KT, 한화, NC, SSG, 키움, 삼성
- 유형: `pitcher` | `batter` | `defense` | `all`

예시: `/statiz-import 롯데 pitcher`

---

## Statiz 팀 코드

| 팀명 | 코드 |
|------|------|
| LG | 5002 |
| 두산 | 6002 |
| 롯데 | 3001 |
| KIA | 2002 |
| KT | 12001 |
| 한화 | 7002 |
| NC | 11001 |
| SSG | 9002 |
| 키움 | 10001 |
| 삼성 | 1001 |

---

## 1단계: 사전 확인

### 1군 로스터 확인
`js/data.js`에서 `REAL_ROSTERS[팀명]`을 읽어 1군 선수 목록을 파악한다.
- `P`: 투수 배열 (이름 뒤 `*`는 외국인)
- `C`, `IF`, `OF`: 야수 배열

### 기존 데이터 확인
`REAL_SEASON_STATS[팀명]`에 이미 데이터가 있는지 확인한다. 있으면 추가/업데이트, 없으면 새로 생성.

---

## 2단계: 투수 데이터 수집 (pitcher)

Chrome 브라우저 MCP 도구를 사용하여 Statiz 페이지를 탐색한다.

### 2-1. 기본 스탯 (기본 탭)

**URL**: `https://www.statiz.co.kr/stats/?m=main&m2=pitching&m3=default&so=&ob=&year=2025&te={teamCode}&lt=10100&reg=A&pr=50`

JavaScript로 테이블 데이터 추출:
```javascript
const rows = document.querySelectorAll('.table_type01 table tr');
const result = [];
rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 30) {
        const v = Array.from(cells).map(c => c.textContent.trim());
        // Name|G|GS|W|L|S|HD|IP|ER|R|H|HR|BB|HBP|SO|ERA|FIP|WHIP|WAR
        result.push([v[1],v[4],v[5],v[10],v[11],v[12],v[13],v[14],v[15],v[16],v[19],v[22],v[23],v[24],v[26],v[30],v[34],v[35],v[36]].join('\t'));
    }
});
result.join('\n');
```

**주의**: 데이터가 잘릴 수 있으므로 `result.slice(15).join('\n')` 등으로 나눠서 추출.

### 2-2. BABIP (심화 탭)

**URL**: `m3=deepen` (같은 필터)

```javascript
// BABIP은 index 12
const rows = document.querySelectorAll('.table_type01 table tr');
const result = [];
rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 12) {
        const v = Array.from(cells).map(c => c.textContent.trim());
        result.push(v[1] + '|' + v[12]);
    }
});
result.join('\n');
```

### 2-3. WPA (WP 탭)

**URL**: `m3=wp` (같은 필터)

```javascript
// WPA 종합은 index 3 (Sort 컬럼)
const rows = document.querySelectorAll('.table_type01 table tr');
const result = [];
rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 4) {
        const v = Array.from(cells).map(c => c.textContent.trim());
        result.push(v[1] + '|' + v[3]);
    }
});
result.join('\n');
```

### 2-4. 구종/구속 (구종 탭)

**URL**: `m3=ballType` (같은 필터)

```javascript
// 구종별 구속: indices 26-35 (투심,포심,커터,커브,슬라,체인지업,싱커,포크,너클,기타)
// 구종별 구사율: indices 36-45
const rows = document.querySelectorAll('.table_type01 table tr');
const result = [];
rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 45) {
        const v = Array.from(cells).map(c => c.textContent.trim());
        result.push(v[1] + '|' + v.slice(26, 36).join(',') + '|' + v.slice(36, 46).join(','));
    }
});
result.join('\n');
```

구종 매핑 (index 순서):
- 0: 투심 → `투심`
- 1: 포심 → `포심`
- 2: 커터 → `커터`
- 3: 커브 → `커브`
- 4: 슬라이더 → `슬라이더`
- 5: 체인지업 → `체인지업`
- 6: 싱커 → `싱커`
- 7: 포크 → `포크`
- 8: 너클 → `너클볼`
- 9: 기타 → 무시

구사율 0% 이하인 구종은 제외. 구사율 높은 순서대로 pitches 배열에 넣는다.

### 2-5. 데이터 작성

`js/data.js`의 `REAL_SEASON_STATS` 내 해당 팀 섹션에 다음 형식으로 작성:

```javascript
'선수명': { pos:'P', role:'선발', G:22, GS:22, W:10, L:5, S:0, HLD:0, IP:123.1, H:123, HR:10, BB:48, HBP:5, SO:119, ER:50, R:53, ERA:3.65, WHIP:1.39, FIP:3.85, WAR:3.38, BABIP:0.329, WPA:1.25,
    pitches:[{name:'포심',pct:40,velo:146.6},{name:'슬라이더',pct:26,velo:134.5}] },
```

**역할 판별 기준**:
- GS >= G*0.5 → `선발`
- S >= 10 또는 팀 세이브 1위 → `마무리`
- 나머지 → `중계`

**외국인 신규 선수** (1군 로스터에 `*` 표시인데 Statiz 기록 없음):
```javascript
'선수명': { pos:'P', role:'선발' },
```

---

## 3단계: 타자 공격 데이터 수집 (batter)

### 3-1. 기본+비율 스탯 (기본 탭)

**URL**: `m=main&m2=batting&m3=default&...&te={teamCode}`

테이블은 33개 td 컬럼:
```
0:Rank, 1:Name, 2:Team, 3:Sort, 4:G, 5:oWAR, 6:dWAR, 7:PA, 8:ePA, 9:AB,
10:R, 11:H, 12:2B, 13:3B, 14:HR, 15:TB, 16:RBI, 17:SB, 18:CS, 19:BB,
20:HP, 21:IB, 22:SO, 23:GDP, 24:SH, 25:SF, 26:AVG, 27:OBP, 28:SLG,
29:OPS, 30:R/ePA, 31:wRC+, 32:WAR
```

```javascript
const rows = document.querySelectorAll('.table_type01 table tr');
const result = [];
rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 33) {
        const v = Array.from(cells).map(c => c.textContent.trim());
        result.push([v[1],v[4],v[7],v[9],v[10],v[11],v[12],v[13],v[14],v[16],v[17],v[18],v[19],v[20],v[22],v[26],v[27],v[28],v[29],v[31],v[32],v[5],v[6]].join('|'));
    }
});
result.join('\n');
```

### 3-2. IsoP (심화 탭)

**URL**: `m3=deepen`

```javascript
// IsoP는 index 8
const rows = document.querySelectorAll('.table_type01 table tr');
const result = [];
rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 9) {
        const v = Array.from(cells).map(c => c.textContent.trim());
        result.push(v[1] + '|' + v[8]);
    }
});
result.join('\n');
```

### 3-3. 데이터 작성

포지션은 `REAL_ROSTERS`의 C/IF/OF 배열과 `PLAYER_DETAILS`에서 판별.

```javascript
'선수명': { pos:'LF', AVG:.326, OBP:.386, SLG:.475, OPS:.861, 'wRC+':124.8, WAR:3.21, oWAR:3.63, dWAR:-0.42, H:187, '2B':44, '3B':1, HR:13, RBI:107, R:75, SB:7, CS:1, BB:58, SO:66, G:144, PA:643, AB:573, IsoP:.149 },
```

**선수 분류**:
- PA >= 100: 주전 (`// ── 주전 (100+ PA) ──`)
- PA 20-99: 준레귤러 (`// ── 준레귤러 / 벤치 (20–99 PA) ──`)
- PA 10-19: 소표본 (`// ── 소표본 (10–19 PA) ──`)
- PA < 10: 극소표본 (`// ── 극소표본 (< 10 PA) ──`)

**외국인 신규 / 군복무 선수**:
```javascript
'선수명': { pos:'RF' },  // 또는 salary만 포함
```

---

## 4단계: 타자 수비 데이터 수집 (defense)

### 4-1. 수비 RAA (수비 기록실)

**URL**: `m=main&m2=fielding&m3=default&so=WAAwithPOS&ob=DESC&...&te={teamCode}`

```javascript
const rows = document.querySelectorAll('.table_type01 table tr');
const result = [];
rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 20) {
        const v = Array.from(cells).map(c => c.textContent.trim());
        const pos = v[2].replace(/25\s+/,'').trim();
        result.push(v[1] + '|' + pos + '|G:' + v[4] + '|Range:' + v[13] + '|Arm:' + v[14] + '|Err:' + v[15] + '|DP:' + v[16] + '|CS:' + v[18] + '|Frm:' + v[20] + '|Total:' + v[21]);
    }
});
result.join('\n');
```

**주의**: 한 선수가 여러 포지션으로 나올 수 있음. 출전 경기수(G)가 가장 많은 포지션의 수비 기록을 사용.

### 4-2. 데이터 반영

기존 타자 엔트리에 수비 필드를 추가:

**내야수** (1B/2B/3B/SS):
```javascript
defRAA:3.83, rangeRAA:2.12, errRAA:0.95, dpRAA:0.68
```

**외야수** (LF/CF/RF):
```javascript
defRAA:5.55, rangeRAA:6.85, errRAA:-0.36, armRAA:-0.94
```

**포수** (C):
```javascript
defRAA:1.83, rangeRAA:0.71, errRAA:1.29, csRAA:-1.25, frmRAA:1.83
```

---

## 5단계: 검증

데이터 입력 후 프리뷰 서버를 실행하여 확인:

1. `npx http-server . -p 8080 -c-1` 실행
2. 브라우저에서 앱 로드, `generateSampleData()` 실행
3. 해당 팀 선수의 `realStats` 존재 여부 확인
4. 선수 모달 열어서 클래식/세이버메트릭스/수비 탭 정상 표시 확인

---

## 주의사항

1. **BABIP/WPA null 체크**: `renderPitcherSaberStats`에서 BABIP/WPA가 없으면 `-` 표시 (이미 수정됨)
2. **데이터 잘림**: JavaScript 추출 시 결과가 길면 잘림. `result.slice(N).join('\n')`으로 분할 추출
3. **페이지 로딩**: Statiz 탭 전환 시 `wait` 2-3초 필요. URL 직접 이동이 더 안정적
4. **투수 타격 기록 무시**: 투수의 타격 기록(PA=0)은 무시
5. **salary 필드**: 기존에 salary가 있는 엔트리는 유지
6. **워크트리 vs 원본**: 반드시 원본 프로젝트 경로의 `data.js`를 수정할 것
