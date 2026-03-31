// ===== 뎁스 차트 (Depth Chart) =====

let dcTeam = null;
let dcTab = 'batter';
let dcLineupType = 'vsRHP'; // vsRHP or vsLHP
let dcDragData = null; // { type, from, playerId }

// 선수 이름 클릭 → 모달 열기 헬퍼
function dcPlayerLink(playerId, name, cssClass) {
    return `<a class="dc-player-link ${cssClass || ''}" href="#" onclick="event.preventDefault(); showPlayerModal(state.players['${playerId}'])">${name}</a>`;
}

// ── 드래그 앤 드롭 ──
function dcDragStart(e, type, from, playerId) {
    if (!playerId) { e.preventDefault(); return; }
    dcDragData = { type, from, playerId };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', playerId);
    e.currentTarget.classList.add('dc-dragging');
}
function dcDragEnd(e) {
    e.currentTarget.classList.remove('dc-dragging');
    document.querySelectorAll('.dc-dragover').forEach(el => el.classList.remove('dc-dragover'));
    dcDragData = null;
}
function dcDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('dc-dragover'); }
function dcDragLeave(e) { e.currentTarget.classList.remove('dc-dragover'); }

function dcDropDefense(e, targetPos) {
    e.preventDefault(); e.currentTarget.classList.remove('dc-dragover');
    if (!dcDragData || dcDragData.type !== 'defense') return;
    const dc = state.teams[dcTeam].depthChart;
    const srcPos = dcDragData.from;
    const srcId = dc.defense[srcPos];
    const tgtId = dc.defense[targetPos];
    dc.defense[srcPos] = tgtId;
    dc.defense[targetPos] = srcId;
    dcDragData = null;
    renderBatterPanel();
}

function dcDropLineup(e, targetIdx) {
    e.preventDefault(); e.currentTarget.classList.remove('dc-dragover');
    if (!dcDragData || dcDragData.type !== 'lineup') return;
    const lineup = state.teams[dcTeam].depthChart.lineup[dcLineupType];
    const srcIdx = dcDragData.from;
    const srcId = lineup[srcIdx];
    const tgtId = lineup[targetIdx];
    lineup[srcIdx] = tgtId;
    lineup[targetIdx] = srcId;
    dcDragData = null;
    renderBatterPanel();
}

function dcDropRotation(e, targetIdx) {
    e.preventDefault(); e.currentTarget.classList.remove('dc-dragover');
    if (!dcDragData) return;
    const dc = state.teams[dcTeam].depthChart;
    if (dcDragData.type === 'rotation') {
        // 선발↔선발 교환
        const srcIdx = dcDragData.from;
        const srcId = dc.rotation[srcIdx];
        const tgtId = dc.rotation[targetIdx];
        dc.rotation[srcIdx] = tgtId;
        dc.rotation[targetIdx] = srcId;
    } else if (dcDragData.type === 'bullpen') {
        // 불펜→선발: 불펜에서 빼고 선발에 넣기 (기존 선발은 불펜으로)
        const { section: srcKey, index: srcIdx } = dcDragData.from;
        const movingId = dc.bullpen[srcKey][srcIdx];
        const displaced = dc.rotation[targetIdx];
        dc.bullpen[srcKey].splice(srcIdx, 1);
        if (displaced) dc.bullpen[srcKey].push(displaced);
        dc.rotation[targetIdx] = movingId;
    }
    dcDragData = null;
    renderPitcherPanel();
}

function dcDropBullpen(e, targetKey) {
    e.preventDefault(); e.currentTarget.classList.remove('dc-dragover');
    if (!dcDragData) return;
    const dc = state.teams[dcTeam].depthChart;
    if (dcDragData.type === 'bullpen') {
        const { section: srcKey, index: srcIdx } = dcDragData.from;
        if (srcKey === targetKey) return; // 같은 섹션이면 무시
        const movingId = dc.bullpen[srcKey][srcIdx];
        dc.bullpen[srcKey].splice(srcIdx, 1);
        dc.bullpen[targetKey].push(movingId);
    } else if (dcDragData.type === 'rotation') {
        // 선발→불펜
        const srcIdx = dcDragData.from;
        const movingId = dc.rotation[srcIdx];
        dc.rotation[srcIdx] = null;
        dc.bullpen[targetKey].push(movingId);
    }
    dcDragData = null;
    renderPitcherPanel();
}

// 포지션 적합도 판정 (subPositions 우선, 패널티 기반 보조)
function canPlayPosition(player, targetPos) {
    if (!player || player.position === 'P') return false;
    if (targetPos === 'DH') return true;
    const primaryPos = player.primaryPosition || player.position;
    if (primaryPos === targetPos) return true;
    // subPositions에 있으면 무조건 가능
    if (player.subPositions && player.subPositions.includes(targetPos)) return true;
    // 패널티 기반
    const config = typeof POSITION_GROUPS !== 'undefined' ? POSITION_GROUPS[primaryPos] : null;
    if (!config) return false;
    const penalty = config.penalty[targetPos];
    if (penalty == null) return false;
    const baseDef = (player.ratings && player.ratings.defense) ? player.ratings.defense : 40;
    return (baseDef + penalty) >= 35;
}

// ── 초기화 ──
function setupDepthChartView() {
    const sel = document.getElementById('dcTeamSelect');
    sel.addEventListener('change', () => {
        dcTeam = sel.value;
        ensureDepthChart(dcTeam);
        renderDepthChart();
    });

    // 서브탭 전환
    document.querySelectorAll('.dc-sub-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            dcTab = tab.dataset.dcTab;
            document.querySelectorAll('.dc-sub-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.dc-panel').forEach(p => p.classList.remove('active'));
            document.querySelector(`.dc-panel--${dcTab}`).classList.add('active');
            renderDepthChart();
        });
    });

    // 자동 배정 버튼
    document.getElementById('btnAutoDepth').addEventListener('click', () => {
        if (!dcTeam) return;
        autoAssignDepthChart(dcTeam);
        renderDepthChart();
        showToast('자동 배정 완료!', 'success');
    });
}

// ── 뎁스차트 데이터 보장 ──
function ensureDepthChart(teamCode) {
    const team = state.teams[teamCode];
    if (!team.depthChart) {
        team.depthChart = createEmptyDepthChart();
        autoAssignDepthChart(teamCode);
    }
}

function createEmptyDepthChart() {
    return {
        lineup: {
            vsRHP: Array(9).fill(null),
            vsLHP: Array(9).fill(null),
        },
        rotation: Array(5).fill(null),
        bullpen: {
            closer: [],
            setup: [],
            middle: [],
            long: [],
        },
        defense: {
            C: null, '1B': null, '2B': null, '3B': null, SS: null,
            LF: null, CF: null, RF: null, DH: null,
        },
    };
}

// ── 자동 배정 (OVR 기반) ──
function autoAssignDepthChart(teamCode) {
    const team = state.teams[teamCode];
    const pitchers = getTeamPitchers(state, teamCode);
    const batters = getTeamBatters(state, teamCode);

    if (!team.depthChart) team.depthChart = createEmptyDepthChart();
    const dc = team.depthChart;

    // 1) 수비 라인업
    const posOrder = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];
    const usedIds = new Set();
    for (const pos of posOrder) {
        const candidates = batters.filter(b => b.position === pos && !usedIds.has(b.id));
        if (candidates.length > 0) {
            candidates.sort((a, b) => b.ovr - a.ovr);
            dc.defense[pos] = candidates[0].id;
            usedIds.add(candidates[0].id);
        } else {
            dc.defense[pos] = null;
        }
    }
    const dhCandidates = batters.filter(b => !usedIds.has(b.id));
    if (dhCandidates.length > 0) {
        dhCandidates.sort((a, b) => b.ovr - a.ovr);
        dc.defense.DH = dhCandidates[0].id;
        usedIds.add(dhCandidates[0].id);
    }

    // 2) 타선 라인업 — OVR순으로 3-4-5-2-1-6-7-8-9 배치
    const lineupPlayers = posOrder.map(pos => dc.defense[pos]).filter(Boolean);
    const dhId = dc.defense.DH;
    if (dhId) lineupPlayers.push(dhId);
    const sorted = [...lineupPlayers].sort((a, b) => (state.players[b]?.ovr || 0) - (state.players[a]?.ovr || 0));
    const orderMapping = [4, 2, 0, 1, 3, 5, 6, 7, 8];
    dc.lineup.vsRHP = Array(9).fill(null);
    dc.lineup.vsLHP = Array(9).fill(null);
    for (let i = 0; i < Math.min(sorted.length, 9); i++) {
        const slot = orderMapping[i] !== undefined ? orderMapping[i] : i;
        dc.lineup.vsRHP[slot] = sorted[i];
        dc.lineup.vsLHP[slot] = sorted[i];
    }

    // 3) 선발 로테이션
    const starters = pitchers.filter(p => p.role === '선발').sort((a, b) => b.ovr - a.ovr);
    dc.rotation = starters.slice(0, 5).map(p => p.id);
    while (dc.rotation.length < 5) dc.rotation.push(null);

    // 4) 불펜 구성
    const closers = pitchers.filter(p => p.role === '마무리').sort((a, b) => b.ovr - a.ovr);
    const relievers = pitchers.filter(p => p.role === '중계').sort((a, b) => b.ovr - a.ovr);
    dc.bullpen.closer = closers.slice(0, 1).map(p => p.id);
    dc.bullpen.setup = relievers.slice(0, 3).map(p => p.id);
    dc.bullpen.middle = relievers.slice(3, 6).map(p => p.id);
    dc.bullpen.long = relievers.slice(6, 8).map(p => p.id);
}

// ── 메인 렌더 ──
function renderDepthChart() {
    const sel = document.getElementById('dcTeamSelect');
    if (!sel.options.length) populateDcTeamSelect();
    if (!dcTeam) {
        dcTeam = sel.value;
        if (!dcTeam) return;
    }
    if (sel.value !== dcTeam) sel.value = dcTeam;
    ensureDepthChart(dcTeam);

    document.getElementById('dcEmblem').src = teamEmblem(dcTeam);
    document.getElementById('dcWordmark').src = teamWordmark(dcTeam);

    if (dcTab === 'batter') renderBatterPanel();
    if (dcTab === 'pitcher') renderPitcherPanel();
}

function populateDcTeamSelect() {
    const sel = document.getElementById('dcTeamSelect');
    sel.innerHTML = '';
    for (const code of Object.keys(state.teams)) {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = state.teams[code].name;
        sel.appendChild(opt);
    }
    dcTeam = sel.value;
}

// ============================================
//  야수 라인업 패널 (수비 + 타선 통합)
// ============================================
function renderBatterPanel() {
    const panel = document.getElementById('dcBatterPanel');
    const dc = state.teams[dcTeam].depthChart;
    const teamColor = state.teams[dcTeam].color || '#005fa3';
    const batters = getTeamBatters(state, dcTeam);
    const lineup = dc.lineup[dcLineupType] || Array(9).fill(null);

    const positions = [
        { pos: 'LF', label: 'LF', className: 'field-lf' },
        { pos: 'CF', label: 'CF', className: 'field-cf' },
        { pos: 'RF', label: 'RF', className: 'field-rf' },
        { pos: 'SS', label: 'SS', className: 'field-ss' },
        { pos: '2B', label: '2B', className: 'field-2b' },
        { pos: '3B', label: '3B', className: 'field-3b' },
        { pos: '1B', label: '1B', className: 'field-1b' },
        { pos: 'C', label: 'C', className: 'field-c' },
        { pos: 'DH', label: 'DH', className: 'field-dh' },
    ];

    panel.innerHTML = `
        <div class="dc-split">
            <!-- 좌: 수비 라인업 (야구장) -->
            <div class="dc-split__left">
                <h3 class="dc-section-title">수비 라인업</h3>
                <div class="field-container">
                    <div class="field-bg">
                        <div class="field-outfield"></div>
                        <div class="field-infield"></div>
                        <div class="field-diamond"></div>
                        <div class="field-mound"></div>
                        <div class="field-home"></div>
                    </div>
                    ${positions.map(({ pos, label, className }) => {
                        const playerId = dc.defense[pos];
                        const player = playerId ? state.players[playerId] : null;
                        return `
                            <div class="field-pos ${className}" style="--team-clr: ${teamColor}"
                                 draggable="${player ? 'true' : 'false'}"
                                 ondragstart="dcDragStart(event,'defense','${pos}','${playerId||''}')"
                                 ondragend="dcDragEnd(event)"
                                 ondragover="dcDragOver(event)"
                                 ondragleave="dcDragLeave(event)"
                                 ondrop="dcDropDefense(event,'${pos}')">
                                <div class="field-pos__label">${label}</div>
                                <div class="field-pos__card">
                                    ${player ? `
                                        <div class="field-pos__name">${dcPlayerLink(player.id, player.name)}</div>
                                        <div class="field-pos__ovr">${player.ovr}</div>
                                        <div class="field-pos__info">${player.position} | ${ratingLabel(player.ratings?.defense)}</div>
                                    ` : `<div class="field-pos__empty">미배정</div>`}
                                </div>
                                <select class="field-pos__select" data-pos="${pos}" onchange="onDefenseChange(this)">
                                    <option value="">선택...</option>
                                    ${batters.filter(b => canPlayPosition(b, pos) || b.id === playerId).map(b => {
                                        const fit = canPlayPosition(b, pos);
                                        const style = !fit ? 'color:#aaa' : '';
                                        return `<option value="${b.id}" ${b.id === playerId ? 'selected' : ''} style="${style}">${b.name} (${b.position} / OVR ${b.ovr})</option>`;
                                    }).join('')}
                                </select>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- 우: 타선 라인업 -->
            <div class="dc-split__right">
                <div class="dc-section-title-row">
                    <h3 class="dc-section-title">타선 라인업</h3>
                    <div class="lineup-toggle">
                        <button class="btn btn--sm ${dcLineupType === 'vsRHP' ? 'btn--primary' : ''}" onclick="switchLineupType('vsRHP')">vs 우투</button>
                        <button class="btn btn--sm ${dcLineupType === 'vsLHP' ? 'btn--primary' : ''}" onclick="switchLineupType('vsLHP')">vs 좌투</button>
                    </div>
                </div>
                <div class="lineup-grid">
                    ${lineup.map((pid, i) => {
                        const p = pid ? state.players[pid] : null;
                        return `
                            <div class="lineup-slot" style="--team-clr: ${teamColor}"
                                 draggable="${p ? 'true' : 'false'}"
                                 ondragstart="dcDragStart(event,'lineup',${i},'${pid||''}')"
                                 ondragend="dcDragEnd(event)"
                                 ondragover="dcDragOver(event)"
                                 ondragleave="dcDragLeave(event)"
                                 ondrop="dcDropLineup(event,${i})">
                                <div class="lineup-slot__order">${i + 1}</div>
                                <div class="lineup-slot__info">
                                    ${p ? `
                                        <div class="lineup-slot__name">${dcPlayerLink(p.id, p.name)}</div>
                                        <div class="lineup-slot__meta">${p.position} | OVR ${p.ovr} | ${p.throwBat || ''}</div>
                                        <div class="lineup-slot__ratings">
                                            <span>컨택 ${p.ratings?.contact || '-'}</span>
                                            <span>파워 ${p.ratings?.power || '-'}</span>
                                            <span>선구 ${p.ratings?.eye || '-'}</span>
                                            <span>스피드 ${p.ratings?.speed || '-'}</span>
                                        </div>
                                    ` : `<div class="lineup-slot__empty">미배정</div>`}
                                </div>
                                <select class="lineup-slot__select" data-idx="${i}" onchange="onLineupChange(this)">
                                    <option value="">선택...</option>
                                    ${batters.map(b => `<option value="${b.id}" ${b.id === pid ? 'selected' : ''}>${b.name} (${b.position} / OVR ${b.ovr})</option>`).join('')}
                                </select>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function onDefenseChange(sel) {
    const pos = sel.dataset.pos;
    const newId = sel.value || null;
    const dc = state.teams[dcTeam].depthChart;
    const oldId = dc.defense[pos];

    // swap: 새 선수가 이미 다른 포지션에 있으면 교환
    if (newId) {
        for (const p of Object.keys(dc.defense)) {
            if (p !== pos && dc.defense[p] === newId) {
                dc.defense[p] = oldId;
                break;
            }
        }
    }
    dc.defense[pos] = newId;

    // 타선 라인업 동기화: 빠진 선수는 교체된 선수로 대체
    if (oldId && newId && oldId !== newId) {
        for (const type of ['vsRHP', 'vsLHP']) {
            const lineup = dc.lineup[type];
            const idx = lineup.indexOf(oldId);
            if (idx !== -1) {
                lineup[idx] = newId;
            }
        }
    }

    renderBatterPanel();
}

function ratingLabel(val) {
    if (val == null) return '-';
    if (val >= 70) return 'A';
    if (val >= 60) return 'B';
    if (val >= 50) return 'C';
    if (val >= 40) return 'D';
    return 'F';
}

function switchLineupType(type) {
    dcLineupType = type;
    renderBatterPanel();
}

function onLineupChange(sel) {
    const idx = parseInt(sel.dataset.idx);
    const newId = sel.value || null;
    const dc = state.teams[dcTeam].depthChart;
    const lineup = dc.lineup[dcLineupType];
    const oldId = lineup[idx];

    // swap: 새 선수가 이미 다른 타순에 있으면 교환
    if (newId) {
        const existingIdx = lineup.indexOf(newId);
        if (existingIdx !== -1 && existingIdx !== idx) {
            lineup[existingIdx] = oldId;
        }
    }
    lineup[idx] = newId;

    // 수비 라인업 동기화: 빠진 선수의 포지션을 새 선수로 대체
    if (oldId && newId && oldId !== newId) {
        for (const pos of Object.keys(dc.defense)) {
            if (dc.defense[pos] === oldId) {
                dc.defense[pos] = newId;
                break;
            }
        }
    }

    renderBatterPanel();
}

// ============================================
//  투수 운용 패널 (선발 로테이션 + 불펜 통합)
// ============================================
function renderPitcherPanel() {
    const panel = document.getElementById('dcPitcherPanel');
    const dc = state.teams[dcTeam].depthChart;
    const teamColor = state.teams[dcTeam].color || '#005fa3';
    const allPitchers = getTeamPitchers(state, dcTeam);

    const bullpenSections = [
        { key: 'setup', label: '필승조 (셋업)', icon: '⚡', max: 3 },
        { key: 'middle', label: '추격조 (중계)', icon: '💪', max: 3 },
        { key: 'long', label: '롱릴리프', icon: '🛡️', max: 2 },
        { key: 'closer', label: '마무리', icon: '🔥', max: 1 },
    ];

    panel.innerHTML = `
        <div class="dc-split">
            <!-- 좌: 선발 로테이션 -->
            <div class="dc-split__left dc-split__left--pitcher">
                <h3 class="dc-section-title">선발 로테이션</h3>
                <div class="rotation-grid">
                    ${dc.rotation.map((pid, i) => {
                        const p = pid ? state.players[pid] : null;
                        return `
                            <div class="rotation-slot" style="--team-clr: ${teamColor}"
                                 draggable="${p ? 'true' : 'false'}"
                                 ondragstart="dcDragStart(event,'rotation',${i},'${pid||''}')"
                                 ondragend="dcDragEnd(event)"
                                 ondragover="dcDragOver(event)"
                                 ondragleave="dcDragLeave(event)"
                                 ondrop="dcDropRotation(event,${i})">
                                <div class="rotation-slot__num">${i + 1}선발</div>
                                <div class="rotation-slot__info">
                                    ${p ? `
                                        <div class="rotation-slot__name">${dcPlayerLink(p.id, p.name)}</div>
                                        <div class="rotation-slot__ovr">OVR ${p.ovr}</div>
                                        <div class="rotation-slot__ratings">
                                            <span>구위 ${p.ratings?.stuff || '-'}</span>
                                            <span>제구 ${p.ratings?.command || '-'}</span>
                                            <span>체력 ${p.ratings?.stamina || '-'}</span>
                                        </div>
                                    ` : `<div class="rotation-slot__empty">미배정</div>`}
                                </div>
                                <select class="rotation-slot__select" data-idx="${i}" onchange="onRotationChange(this)">
                                    <option value="">선택...</option>
                                    ${allPitchers.map(s => `<option value="${s.id}" ${s.id === pid ? 'selected' : ''}>${s.name} (${s.role || '-'} / OVR ${s.ovr})</option>`).join('')}
                                </select>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- 우: 불펜 구성 -->
            <div class="dc-split__right">
                <h3 class="dc-section-title">불펜 구성</h3>
                <div class="bullpen-grid">
                    ${bullpenSections.map(({ key, label, icon, max }) => {
                        const pids = dc.bullpen[key] || [];
                        return `
                            <div class="bullpen-section" style="--team-clr: ${teamColor}"
                                 ondragover="dcDragOver(event)"
                                 ondragleave="dcDragLeave(event)"
                                 ondrop="dcDropBullpen(event,'${key}')">
                                <div class="bullpen-section__header">
                                    <span class="bullpen-section__icon">${icon}</span>
                                    <span class="bullpen-section__label">${label}</span>
                                    <span class="bullpen-section__count">${pids.length}/${max}</span>
                                </div>
                                <div class="bullpen-section__slots">
                                    ${pids.map((pid, i) => {
                                        const p = pid ? state.players[pid] : null;
                                        return `
                                            <div class="bullpen-card"
                                                 draggable="${p ? 'true' : 'false'}"
                                                 ondragstart="dcDragStart(event,'bullpen',{section:'${key}',index:${i}},'${pid||''}')"
                                                 ondragend="dcDragEnd(event)">
                                                ${p ? `
                                                    <div class="bullpen-card__name">${dcPlayerLink(p.id, p.name)}</div>
                                                    <div class="bullpen-card__ovr">OVR ${p.ovr}</div>
                                                    <div class="bullpen-card__ratings">구위 ${p.ratings?.stuff || '-'} | 제구 ${p.ratings?.command || '-'}</div>
                                                ` : ''}
                                                <button class="bullpen-card__remove" onclick="removeBullpen('${key}', ${i})" title="제거">&times;</button>
                                            </div>
                                        `;
                                    }).join('')}
                                    ${pids.length < max ? `
                                        <div class="bullpen-add">
                                            <select class="bullpen-add__select" data-key="${key}" onchange="addBullpen(this)">
                                                <option value="">+ 추가...</option>
                                                ${allPitchers
                                                    .filter(r => !isBullpenAssigned(dc, r.id) && !dc.rotation.includes(r.id))
                                                    .map(r => `<option value="${r.id}">${r.name} (${r.role || '-'} / OVR ${r.ovr})</option>`)
                                                    .join('')}
                                            </select>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function onRotationChange(sel) {
    const idx = parseInt(sel.dataset.idx);
    const newId = sel.value || null;
    const rotation = state.teams[dcTeam].depthChart.rotation;

    // swap: 새 선수가 이미 다른 슬롯에 있으면 교환
    if (newId) {
        const oldId = rotation[idx];
        const existingIdx = rotation.indexOf(newId);
        if (existingIdx !== -1 && existingIdx !== idx) {
            rotation[existingIdx] = oldId;
        }
    }
    rotation[idx] = newId;
    renderPitcherPanel();
}

function isBullpenAssigned(dc, playerId) {
    const bp = dc.bullpen;
    return [...bp.closer, ...bp.setup, ...bp.middle, ...bp.long].includes(playerId);
}

function addBullpen(sel) {
    const key = sel.dataset.key;
    const val = sel.value;
    if (!val) return;
    state.teams[dcTeam].depthChart.bullpen[key].push(val);
    renderPitcherPanel();
}

function removeBullpen(key, idx) {
    state.teams[dcTeam].depthChart.bullpen[key].splice(idx, 1);
    renderPitcherPanel();
}
