// ===== UI 헬퍼 =====

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function powerColor(score) {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#00AEEF';
    if (score >= 35) return '#B3A177';
    return '#ED1C24';
}

// 20-80 스케일 색상
function ratingColor(val) {
    if (val >= 70) return '#22c55e'; // 플러스+
    if (val >= 60) return '#4ade80'; // 플러스
    if (val >= 50) return '#00AEEF'; // 평균
    if (val >= 40) return '#B3A177'; // 평균 이하
    if (val >= 30) return '#f97316'; // 약점
    return '#ED1C24'; // 심각
}

function formatRate(rate) {
    return rate > 0 ? rate.toFixed(3).slice(1) : '.000';
}

function populateTeamSelect(selectEl, teams) {
    selectEl.innerHTML = '';
    for (const code of Object.keys(teams)) {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = teams[code].name;
        selectEl.appendChild(opt);
    }
}

function createConfetti() {
    const container = document.getElementById('confetti');
    container.innerHTML = '';
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#85c1e9'];
    for (let i = 0; i < 60; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = Math.random() * 2 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        const size = 6 + Math.random() * 10;
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        container.appendChild(piece);
    }
    setTimeout(() => { container.innerHTML = ''; }, 5000);
}

window.showToast = showToast;
window.powerColor = powerColor;
window.ratingColor = ratingColor;
window.formatRate = formatRate;
window.populateTeamSelect = populateTeamSelect;
window.createConfetti = createConfetti;
