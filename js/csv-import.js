// ===== CSV 파서 (UTF-8 BOM 처리) =====

function parseCSV(text) {
    // Remove BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

    // Detect delimiter
    const firstLine = text.split('\n')[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const row = {};
        headers.forEach((h, idx) => {
            const val = vals[idx] || '';
            const num = parseFloat(val);
            row[h] = isNaN(num) ? val : num;
        });
        rows.push(row);
    }

    return rows;
}

// 투수 CSV → 선수 객체
const PITCHER_STAT_MAP = {
    'IVB': 'IVB', 'ivb': 'IVB',
    'VAA': 'VAA', 'vaa': 'VAA',
    'CSW%': 'CSW%', 'csw': 'CSW%', 'csw%': 'CSW%', 'CSW': 'CSW%',
    'FIP': 'FIP', 'fip': 'FIP',
    'BABIP': 'BABIP', 'babip': 'BABIP',
    'Putaway%': 'Putaway%', 'putaway%': 'Putaway%', 'putaway': 'Putaway%',
    'ERA': 'ERA', 'era': 'ERA',
};

const BATTER_STAT_MAP = {
    'Exit Velocity': 'Exit Velocity', 'exit_velocity': 'Exit Velocity', 'ExitVelo': 'Exit Velocity', 'exit velocity': 'Exit Velocity',
    'Launch Angle': 'Launch Angle', 'launch_angle': 'Launch Angle', 'LA': 'Launch Angle', 'launch angle': 'Launch Angle',
    'Barrel%': 'Barrel%', 'barrel%': 'Barrel%', 'barrel': 'Barrel%', 'Barrel': 'Barrel%',
    'wRC+': 'wRC+', 'wrc+': 'wRC+', 'wRC': 'wRC+', 'WRC+': 'wRC+',
    'WAR': 'WAR', 'war': 'WAR',
    'OPS': 'OPS', 'ops': 'OPS',
};

function mapRowToPlayer(row, type, teamCode, existingId) {
    const statMap = type === 'pitcher' ? PITCHER_STAT_MAP : BATTER_STAT_MAP;
    const stats = {};

    for (const [csvKey, statKey] of Object.entries(statMap)) {
        if (row[csvKey] !== undefined) {
            stats[statKey] = typeof row[csvKey] === 'number' ? row[csvKey] : parseFloat(row[csvKey]) || 0;
        }
    }

    const name = row['name'] || row['이름'] || row['Name'] || '이름없음';
    const position = type === 'pitcher' ? 'P' : (row['position'] || row['포지션'] || row['pos'] || 'DH');
    const role = type === 'pitcher' ? (row['role'] || row['역할'] || '선발') : null;
    const salary = parseFloat(row['salary'] || row['연봉'] || 5) || 5;

    return {
        id: existingId || `import_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        team: teamCode,
        position,
        role,
        salary,
        stats,
        powerScore: null,
    };
}

function importCSVToTeam(csvText, type, teamCode, state) {
    const rows = parseCSV(csvText);
    if (rows.length === 0) return { success: false, message: 'CSV 데이터가 비어있습니다.' };

    const team = state.teams[teamCode];
    const currentPlayers = getTeamPlayers(state, teamCode);
    const existingOfType = type === 'pitcher'
        ? currentPlayers.filter(p => p.position === 'P')
        : currentPlayers.filter(p => p.position !== 'P');

    // Replace existing players of this type
    const newPlayers = rows.map((row, i) => {
        const existingId = i < existingOfType.length ? existingOfType[i].id : null;
        return mapRowToPlayer(row, type, teamCode, existingId);
    });

    // Remove old players of this type from roster
    const otherIds = team.roster.filter(id => {
        const p = state.players[id];
        return type === 'pitcher' ? p.position !== 'P' : p.position === 'P';
    });

    // Remove old player objects
    existingOfType.forEach(p => { delete state.players[p.id]; });

    // Add new players
    newPlayers.forEach(p => { state.players[p.id] = p; });

    // Update roster
    team.roster = [...otherIds, ...newPlayers.map(p => p.id)];

    return {
        success: true,
        message: `${newPlayers.length}명의 ${type === 'pitcher' ? '투수' : '타자'} 데이터를 불러왔습니다.`,
        count: newPlayers.length,
    };
}

window.parseCSV = parseCSV;
window.importCSVToTeam = importCSVToTeam;
