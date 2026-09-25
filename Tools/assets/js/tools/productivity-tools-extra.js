/**
 * Productivity Tools Extra Engines:
 * - Pomodoro Focus Timer (Web Audio API alerts)
 * - 7-Day Habit Streak Tracker (localStorage persistence)
 * - Weighted Decision Matrix
 */


// Modern SaaS non-blocking notification helper
function notifyUser(msg, type = 'error') {
  if (typeof showToast === 'function') {
    showToast(msg, type);
  } else {
    console.warn(`[${type}] ${msg}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────────────────
  // 1. POMODORO FOCUS TIMER
  // ─────────────────────────────────────────────────────────────────
  const timeDisplay = document.getElementById('pomo-time-display');
  if (timeDisplay) {
    const btnToggle = document.getElementById('btn-pomo-toggle');
    const btnReset = document.getElementById('btn-pomo-reset');
    const progressBar = document.getElementById('pomo-progress-bar');
    const modeWork = document.getElementById('pomo-mode-work');
    const modeShort = document.getElementById('pomo-mode-short');
    const modeLong = document.getElementById('pomo-mode-long');
    const statCycles = document.getElementById('pomo-stat-cycles');
    const statTime = document.getElementById('pomo-stat-time');
    const soundToggle = document.getElementById('pomo-sound-toggle');

    let modeMinutes = 25;
    let totalSeconds = 25 * 60;
    let remainingSeconds = totalSeconds;
    let timerInterval = null;
    let isRunning = false;
    let completedCycles = 0;
    let totalMinutesFocused = 0;

    const playChime = () => {
      if (!soundToggle || !soundToggle.checked) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const playTone = (freq, delay, duration) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + duration);
        };

        playTone(587.33, 0, 0.4); // D5
        playTone(880.00, 0.2, 0.6); // A5
      } catch (e) {
        console.warn('Audio play prevented:', e);
      }
    };

    const updateDisplay = () => {
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      const mStr = m < 10 ? '0' + m : m;
      const sStr = s < 10 ? '0' + s : s;
      timeDisplay.textContent = `${mStr}:${sStr}`;

      if (progressBar) {
        const pct = (remainingSeconds / totalSeconds) * 100;
        progressBar.style.width = pct + '%';
      }
    };

    const switchMode = (mins, activeBtn) => {
      clearInterval(timerInterval);
      isRunning = false;
      if (btnToggle) btnToggle.innerHTML = '<span>▶️ START</span>';

      modeMinutes = mins;
      totalSeconds = mins * 60;
      remainingSeconds = totalSeconds;
      updateDisplay();

      [modeWork, modeShort, modeLong].forEach(btn => {
        if (btn) {
          btn.className = 'px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all';
        }
      });
      if (activeBtn) {
        activeBtn.className = 'px-4 py-2 rounded-xl bg-[#6366F1] text-white shadow-md transition-all';
      }
    };

    if (modeWork) modeWork.addEventListener('click', () => switchMode(25, modeWork));
    if (modeShort) modeShort.addEventListener('click', () => switchMode(5, modeShort));
    if (modeLong) modeLong.addEventListener('click', () => switchMode(15, modeLong));

    const toggleTimer = () => {
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        if (btnToggle) btnToggle.innerHTML = '<span>▶️ RESUME</span>';
      } else {
        isRunning = true;
        if (btnToggle) btnToggle.innerHTML = '<span>⏸️ PAUSE</span>';
        timerInterval = setInterval(() => {
          if (remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
          } else {
            clearInterval(timerInterval);
            isRunning = false;
            if (btnToggle) btnToggle.innerHTML = '<span>▶️ START</span>';
            playChime();

            if (modeMinutes === 25) {
              completedCycles++;
              totalMinutesFocused += 25;
              if (statCycles) statCycles.textContent = `${completedCycles} 🍅`;
              if (statTime) statTime.textContent = `${totalMinutesFocused} min`;
              notifyUser('🎉 Great work! 25-minute Pomodoro cycle completed! Take a 5-minute break.');
            } else {
              notifyUser('⏰ Break finished! Ready to dive back in?');
            }
          }
        }, 1000);
      }
    };

    if (btnToggle) btnToggle.addEventListener('click', toggleTimer);

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        if (btnToggle) btnToggle.innerHTML = '<span>▶️ START</span>';
        remainingSeconds = totalSeconds;
        updateDisplay();
      });
    }

    updateDisplay();
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. 7-DAY HABIT STREAK TRACKER
  // ─────────────────────────────────────────────────────────────────
  const habitsContainer = document.getElementById('habits-list-container');
  if (habitsContainer) {
    const habitNameInput = document.getElementById('habit-new-name');
    const btnAddHabit = document.getElementById('btn-add-habit');
    const overallScore = document.getElementById('habit-overall-score');

    const STORAGE_KEY = 'dc_habits_data_v1';
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    let habits = [
      { id: 1, name: 'Deep Work (2 Hours)', checks: [true, true, true, true, false, false, false] },
      { id: 2, name: 'Exercise / Gym Session', checks: [true, true, false, true, true, false, false] },
      { id: 3, name: 'Read 20 Pages', checks: [true, true, true, true, true, false, false] }
    ];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) habits = JSON.parse(saved);
    } catch (e) {}

    const saveHabits = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
      } catch (e) {}
    };

    const renderHabits = () => {
      let totalChecks = 0;
      let completedChecks = 0;

      if (!habits.length) {
        habitsContainer.innerHTML = '<div class="text-center py-8 text-slate-400 font-mono text-xs">No active habits. Add one above to start your streak!</div>';
        if (overallScore) overallScore.textContent = 'Weekly Completion: 0%';
        return;
      }

      habitsContainer.innerHTML = habits.map(h => {
        const habitChecksCount = h.checks.filter(Boolean).length;
        totalChecks += 7;
        completedChecks += habitChecksCount;

        const dayCheckboxes = DAYS.map((day, idx) => {
          const checked = h.checks[idx];
          return `
            <div class="flex flex-col items-center gap-1">
              <span class="text-[10px] text-slate-400 font-mono">${day}</span>
              <button type="button" data-habit-id="${h.id}" data-day-idx="${idx}" class="btn-check-day w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                checked
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }">
                ${checked ? '✓' : ''}
              </button>
            </div>
          `;
        }).join('');

        return `
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
            <div class="space-y-1 w-full md:w-64">
              <div class="flex items-center justify-between">
                <strong class="text-slate-900 dark:text-white text-xs font-mono">${h.name}</strong>
                <button type="button" data-delete-id="${h.id}" class="btn-delete-habit text-slate-400 hover:text-rose-500 text-xs transition-colors" title="Delete Habit">✕</button>
              </div>
              <div class="text-[11px] font-mono text-slate-500">Streak: <span class="text-amber-500 font-bold">${habitChecksCount}/7 Days</span></div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3">
              ${dayCheckboxes}
            </div>
          </div>
        `;
      }).join('');

      const pct = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
      if (overallScore) overallScore.textContent = `Weekly Completion: ${pct}% (${completedChecks}/${totalChecks} Days)`;

      // Wire checkboxes
      document.querySelectorAll('.btn-check-day').forEach(btn => {
        btn.addEventListener('click', () => {
          const hId = parseInt(btn.getAttribute('data-habit-id'), 10);
          const dIdx = parseInt(btn.getAttribute('data-day-idx'), 10);
          const target = habits.find(h => h.id === hId);
          if (target) {
            target.checks[dIdx] = !target.checks[dIdx];
            saveHabits();
            renderHabits();
          }
        });
      });

      // Wire delete buttons
      document.querySelectorAll('.btn-delete-habit').forEach(btn => {
        btn.addEventListener('click', () => {
          const hId = parseInt(btn.getAttribute('data-delete-id'), 10);
          habits = habits.filter(h => h.id !== hId);
          saveHabits();
          renderHabits();
        });
      });
    };

    if (btnAddHabit && habitNameInput) {
      btnAddHabit.addEventListener('click', () => {
        const val = habitNameInput.value.trim();
        if (!val) return;
        habits.push({
          id: Date.now(),
          name: val,
          checks: [false, false, false, false, false, false, false]
        });
        habitNameInput.value = '';
        saveHabits();
        renderHabits();
      });
    }

    renderHabits();
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. WEIGHTED DECISION MATRIX
  // ─────────────────────────────────────────────────────────────────
  const dmTable = document.getElementById('dm-table');
  if (dmTable) {
    const btnAddOption = document.getElementById('btn-dm-add-option');
    const btnAddCrit = document.getElementById('btn-dm-add-criterion');
    const btnLoadSample = document.getElementById('btn-dm-load-sample');
    const winnerBanner = document.getElementById('dm-winner-banner');

    let options = ['Startup Offer', 'Enterprise Corp', 'Stay at Current Job'];
    let criteria = [
      { name: 'Compensation ($)', weight: 5 },
      { name: 'Work-Life Balance', weight: 4 },
      { name: 'Learning & Growth', weight: 4 },
      { name: 'Remote Flexibility', weight: 3 }
    ];

    // scores[criterionIndex][optionIndex]
    let scores = [
      [7, 9, 6],
      [8, 5, 8],
      [9, 6, 4],
      [9, 4, 7]
    ];

    const renderMatrix = () => {
      // Calculate totals
      const totals = options.map((opt, oIdx) => {
        let total = 0;
        criteria.forEach((crit, cIdx) => {
          const val = (scores[cIdx] && scores[cIdx][oIdx]) || 0;
          total += (crit.weight * val);
        });
        return total;
      });

      let maxScore = -1;
      let winningOption = '';
      totals.forEach((score, idx) => {
        if (score > maxScore) {
          maxScore = score;
          winningOption = options[idx];
        }
      });

      if (winnerBanner) {
        winnerBanner.innerHTML = `🏆 Top Pick: <strong>${winningOption}</strong> (${maxScore} pts)`;
      }

      let html = '<thead class="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase">';
      html += '<tr>';
      html += '<th class="p-3 text-slate-700 dark:text-slate-300">Criterion (1-5 Weight)</th>';
      options.forEach(opt => {
        html += `<th class="p-3 text-slate-800 dark:text-slate-200 text-center">${opt}</th>`;
      });
      html += '</tr></thead>';

      html += '<tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">';

      criteria.forEach((crit, cIdx) => {
        html += '<tr>';
        html += `<td class="p-3">
          <div class="font-bold text-slate-900 dark:text-white">${crit.name}</div>
          <div class="text-[10px] text-slate-500">Weight: <strong>${crit.weight}x</strong></div>
        </td>`;

        options.forEach((opt, oIdx) => {
          const val = (scores[cIdx] && scores[cIdx][oIdx]) || 5;
          html += `<td class="p-3 text-center">
            <input type="number" min="1" max="10" value="${val}" data-crit="${cIdx}" data-opt="${oIdx}" class="dm-score-input w-14 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#6366F1]" />
          </td>`;
        });
        html += '</tr>';
      });

      // Totals row
      html += '<tr class="bg-slate-50 dark:bg-slate-950 font-bold border-t-2 border-slate-200 dark:border-slate-800">';
      html += '<td class="p-3 text-slate-900 dark:text-white">TOTAL COMPOSITE SCORE</td>';
      options.forEach((opt, oIdx) => {
        const isWinner = totals[oIdx] === maxScore;
        html += `<td class="p-3 text-center ${isWinner ? 'text-emerald-600 dark:text-emerald-400 text-sm font-black' : 'text-slate-700 dark:text-slate-300'}">
          ${totals[oIdx]} pts ${isWinner ? '🏆' : ''}
        </td>`;
      });
      html += '</tr>';

      html += '</tbody>';
      dmTable.innerHTML = html;

      // Event listeners
      document.querySelectorAll('.dm-score-input').forEach(inp => {
        inp.addEventListener('input', (e) => {
          const cIdx = parseInt(e.target.getAttribute('data-crit'), 10);
          const oIdx = parseInt(e.target.getAttribute('data-opt'), 10);
          const val = Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1));
          if (!scores[cIdx]) scores[cIdx] = [];
          scores[cIdx][oIdx] = val;
          renderMatrix();
        });
      });
    };

    if (btnAddOption) {
      btnAddOption.addEventListener('click', () => {
        const name = prompt('Enter name of new option (e.g. Agency Contract, Svelte):');
        if (name && name.trim()) {
          options.push(name.trim());
          criteria.forEach((_, cIdx) => {
            if (!scores[cIdx]) scores[cIdx] = [];
            scores[cIdx].push(5);
          });
          renderMatrix();
        }
      });
    }

    if (btnAddCrit) {
      btnAddCrit.addEventListener('click', () => {
        const name = prompt('Enter criterion name (e.g. Maintenance Cost, Scalability):');
        if (name && name.trim()) {
          const weightStr = prompt('Enter priority weight (1 to 5):', '3');
          const weight = Math.max(1, Math.min(5, parseInt(weightStr, 10) || 3));
          criteria.push({ name: name.trim(), weight: weight });
          const newRow = options.map(() => 5);
          scores.push(newRow);
          renderMatrix();
        }
      });
    }

    if (btnLoadSample) {
      btnLoadSample.addEventListener('click', () => {
        options = ['Startup Offer', 'Enterprise Corp', 'Stay at Current Job'];
        criteria = [
          { name: 'Compensation ($)', weight: 5 },
          { name: 'Work-Life Balance', weight: 4 },
          { name: 'Learning & Growth', weight: 4 },
          { name: 'Remote Flexibility', weight: 3 }
        ];
        scores = [
          [7, 9, 6],
          [8, 5, 8],
          [9, 6, 4],
          [9, 4, 7]
        ];
        renderMatrix();
      });
    }

    renderMatrix();
  }
});
