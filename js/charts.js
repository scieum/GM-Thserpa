// ===== Chart.js 래퍼 =====

let radarChartInstance = null;
let trendChartInstance = null;

function createRadarChart(canvasId, teamData, leagueData, teamColor) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (radarChartInstance) radarChartInstance.destroy();

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['투수 파워', 'IVB 평균', 'CSW% 평균', '타자 파워', 'wRC+ 평균', 'OPS 평균'],
            datasets: [
                {
                    label: '우리 팀',
                    data: teamData,
                    borderColor: teamColor,
                    backgroundColor: teamColor + '33',
                    borderWidth: 2,
                    pointBackgroundColor: teamColor,
                },
                {
                    label: '리그 평균',
                    data: leagueData,
                    borderColor: '#6b7280',
                    backgroundColor: 'rgba(136,153,170,0.1)',
                    borderWidth: 1,
                    borderDash: [4, 4],
                    pointBackgroundColor: '#6b7280',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { display: false },
                    grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border').trim() },
                    pointLabels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim(), font: { size: 12 } },
                    angleLines: { color: getComputedStyle(document.documentElement).getPropertyValue('--border').trim() },
                }
            },
            plugins: {
                legend: {
                    labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(), font: { size: 12 } }
                }
            }
        }
    });
}

function createTrendChart(canvasId, teamsData, currentQuarter) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (trendChartInstance) trendChartInstance.destroy();

    const labels = [];
    for (let q = 1; q <= currentQuarter; q++) labels.push(`${q}Q`);
    if (labels.length === 0) labels.push('시즌 시작 전');

    const datasets = teamsData.map(td => ({
        label: td.name,
        data: td.rates,
        borderColor: td.color,
        backgroundColor: td.color + '33',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: td.color,
    }));

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim() },
                    grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border').trim() },
                },
                y: {
                    min: 0,
                    max: 1,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-dim').trim(),
                        callback: v => (v * 100).toFixed(0) + '%',
                    },
                    grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border').trim() },
                }
            },
            plugins: {
                legend: {
                    labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim(), font: { size: 11 }, boxWidth: 12 }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(1)}%`
                    }
                }
            }
        }
    });
}

function getTeamRadarData(state, teamCode) {
    const pitchPower = calcTeamPitchPower(state, teamCode);
    const batPower = calcTeamBatPower(state, teamCode);
    const pitchers = getTeamPitchers(state, teamCode);
    const batters = getTeamBatters(state, teamCode);

    const avgIVB = pitchers.length > 0
        ? pitchers.reduce((s, p) => s + p.stats.IVB, 0) / pitchers.length : 0;
    const avgCSW = pitchers.length > 0
        ? pitchers.reduce((s, p) => s + p.stats['CSW%'], 0) / pitchers.length : 0;
    const avgWRC = batters.length > 0
        ? batters.reduce((s, b) => s + b.stats['wRC+'], 0) / batters.length : 0;
    const avgOPS = batters.length > 0
        ? batters.reduce((s, b) => s + b.stats.OPS, 0) / batters.length : 0;

    return [
        pitchPower,
        (avgIVB / 55) * 100,    // normalized to 0-100
        (avgCSW / 40) * 100,
        batPower,
        (avgWRC / 160) * 100,
        (avgOPS / 1.1) * 100,
    ].map(v => Math.min(100, Math.max(0, Math.round(v))));
}

function getLeagueRadarData(state) {
    const codes = Object.keys(state.teams);
    const allData = codes.map(c => getTeamRadarData(state, c));
    return allData[0].map((_, i) => {
        const avg = allData.reduce((s, d) => s + d[i], 0) / allData.length;
        return Math.round(avg);
    });
}

function getTrendData(state, currentQuarter) {
    const teamsData = [];
    for (const code of Object.keys(state.teams)) {
        const team = state.teams[code];
        const rates = [];
        let cumW = 0, cumL = 0;
        for (let q = 1; q <= currentQuarter; q++) {
            const qk = `q${q}`;
            cumW += team.seasonRecord[qk].wins;
            cumL += team.seasonRecord[qk].losses;
            rates.push((cumW + cumL) > 0 ? cumW / (cumW + cumL) : 0.5);
        }
        teamsData.push({ name: team.name, color: team.color, rates });
    }
    return teamsData;
}

window.createRadarChart = createRadarChart;
window.createTrendChart = createTrendChart;
window.getTeamRadarData = getTeamRadarData;
window.getLeagueRadarData = getLeagueRadarData;
window.getTrendData = getTrendData;
