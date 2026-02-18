// ===== Lotto Generator — Main Logic =====

// State
let history = JSON.parse(localStorage.getItem('lottoHistory') || '[]');
let frequency = JSON.parse(localStorage.getItem('lottoFrequency') || '{}');

// ===== Particles Background =====
function createParticles() {
    const container = document.getElementById('particles');
    const count = 30;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';
        particle.style.width = particle.style.height = (2 + Math.random() * 4) + 'px';

        const colors = ['#667eea', '#764ba2', '#f6d365', '#55efc4', '#48dbfb'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        container.appendChild(particle);
    }
}

// ===== Ball Color Class =====
function getBallColorClass(num) {
    if (num <= 10) return 'ball-1-10';
    if (num <= 20) return 'ball-11-20';
    if (num <= 30) return 'ball-21-30';
    if (num <= 40) return 'ball-31-40';
    return 'ball-41-45';
}

// ===== Generate Random Lotto Numbers =====
function generateNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    numbers.sort((a, b) => a - b);

    // Bonus number
    let bonus;
    do {
        bonus = Math.floor(Math.random() * 45) + 1;
    } while (numbers.includes(bonus));

    return { numbers, bonus };
}

// ===== Create Ball Element =====
function createBallElement(num, delay, isSmall = false) {
    const ball = document.createElement('div');
    ball.className = `${isSmall ? 'history-ball' : 'lotto-ball'} ${getBallColorClass(num)}`;
    ball.textContent = num;
    ball.style.animationDelay = `${delay}s`;
    return ball;
}

// ===== Confetti Effect =====
function launchConfetti() {
    const colors = ['#667eea', '#764ba2', '#f6d365', '#55efc4', '#ff6b6b', '#48dbfb', '#fda085'];
    const shapes = ['circle', 'square'];

    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 1.5 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        if (shape === 'circle') {
            confetti.style.borderRadius = '50%';
        } else {
            confetti.style.borderRadius = '2px';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }

        const size = 6 + Math.random() * 8;
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }
}

// ===== Main Generate Function =====
function generateLotto() {
    const setCount = Math.min(10, Math.max(1, parseInt(document.getElementById('setCount').value) || 1));
    const container = document.getElementById('ballContainer');
    const bonusSection = document.getElementById('bonusSection');
    const bonusBall = document.getElementById('bonusBall');
    const placeholder = document.getElementById('placeholderText');
    const stage = document.getElementById('ballStage');

    // Clear previous
    container.innerHTML = '';
    bonusSection.style.display = 'none';

    // Shake effect
    stage.classList.add('shake');
    setTimeout(() => stage.classList.remove('shake'), 500);

    // Generate sets
    const allSets = [];
    for (let s = 0; s < setCount; s++) {
        const { numbers, bonus } = generateNumbers();
        allSets.push({ numbers, bonus });

        // Set label (for multi-set)
        if (setCount > 1) {
            const separator = document.createElement('div');
            separator.className = 'set-separator';
            separator.innerHTML = `<span class="set-label">Set ${String.fromCharCode(65 + s)}</span>`;
            container.appendChild(separator);
        }

        // Row wrapper
        const row = document.createElement('div');
        row.className = 'set-row';

        // Create balls with staggered animation
        numbers.forEach((num, i) => {
            const ball = createBallElement(num, s * 0.8 + i * 0.1);
            row.appendChild(ball);
        });

        // Bonus inline for multi-set
        if (setCount > 1) {
            const bonusInline = document.createElement('div');
            bonusInline.className = 'bonus-section';
            bonusInline.style.display = 'flex';
            bonusInline.style.borderTop = 'none';
            bonusInline.style.marginTop = '0';
            bonusInline.style.paddingTop = '0';
            bonusInline.innerHTML = `<span class="bonus-label">+</span>`;
            const bBall = createBallElement(bonus, s * 0.8 + 6 * 0.1);
            bBall.className = `lotto-ball ${getBallColorClass(bonus)}`;
            bBall.style.width = '52px';
            bBall.style.height = '52px';
            bBall.style.fontSize = '1.1rem';
            bonusInline.appendChild(bBall);
            row.appendChild(bonusInline);
        }

        container.appendChild(row);

        // Single set: show bonus below
        if (setCount === 1) {
            bonusSection.style.display = 'flex';
            bonusBall.className = `bonus-ball ${getBallColorClass(bonus)}`;
            bonusBall.textContent = bonus;
            bonusBall.style.animationDelay = '0.7s';
        }

        // Update frequency
        numbers.forEach(n => {
            frequency[n] = (frequency[n] || 0) + 1;
        });
        frequency[bonus] = (frequency[bonus] || 0) + 1;

        // Add to history
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        history.unshift({ numbers, bonus, time: timeStr });
    }

    // Trim history
    if (history.length > 50) history = history.slice(0, 50);

    // Save
    localStorage.setItem('lottoHistory', JSON.stringify(history));
    localStorage.setItem('lottoFrequency', JSON.stringify(frequency));

    // Confetti!
    launchConfetti();

    // Update UI
    renderHistory();
    renderStats();
}

// ===== Render History =====
function renderHistory() {
    const section = document.getElementById('historySection');
    const list = document.getElementById('historyList');

    if (history.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    list.innerHTML = '';

    history.slice(0, 15).forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';

        const time = document.createElement('span');
        time.className = 'history-time';
        time.textContent = item.time;
        div.appendChild(time);

        const balls = document.createElement('div');
        balls.className = 'history-balls';
        item.numbers.forEach(n => {
            const ball = createBallElement(n, 0, true);
            balls.appendChild(ball);
        });
        div.appendChild(balls);

        const bonus = document.createElement('span');
        bonus.className = 'history-bonus';
        bonus.textContent = `+${item.bonus}`;
        div.appendChild(bonus);

        list.appendChild(div);
    });
}

// ===== Render Stats =====
function renderStats() {
    const section = document.getElementById('statsSection');
    const grid = document.getElementById('statsGrid');

    const hasData = Object.keys(frequency).length > 0;
    if (!hasData) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';
    grid.innerHTML = '';

    for (let i = 1; i <= 45; i++) {
        const count = frequency[i] || 0;
        const cell = document.createElement('div');
        cell.className = 'stat-cell';

        const numDiv = document.createElement('div');
        numDiv.className = `stat-number ${getBallColorClass(i)}`;
        numDiv.textContent = i;
        cell.appendChild(numDiv);

        const countDiv = document.createElement('div');
        countDiv.className = 'stat-count';
        countDiv.textContent = count;
        cell.appendChild(countDiv);

        grid.appendChild(cell);
    }
}

// ===== Clear History =====
function clearHistory() {
    history = [];
    frequency = {};
    localStorage.removeItem('lottoHistory');
    localStorage.removeItem('lottoFrequency');
    renderHistory();
    renderStats();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    renderHistory();
    renderStats();
});
