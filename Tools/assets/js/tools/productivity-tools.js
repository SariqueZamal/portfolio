/* ==========================================================================
   DigitalCron Tools - Productivity Tools Suite JavaScript Engine
   Supports: Daily Planner, Weekly Planner, Monthly Planner, Focus Timer,
   Priority Matrix Tool (Eisenhower), & Daily Schedule Generator.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initProductivityTools();
});

function initProductivityTools() {
  initDailyPlanner();
  initWeeklyPlanner();
  initMonthlyPlanner();
  initFocusTimer();
  initPriorityMatrix();
  initDailyScheduleGenerator();
}

function safeCopy(text, msg = 'Copied to clipboard!') {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') showToast(msg);
  }).catch(() => {
    if (typeof showToast === 'function') showToast('Failed to copy', 'error');
  });
}

/* 1. Daily Planner Engine */
function initDailyPlanner() {
  const container = document.getElementById('calc-daily-planner');
  if (!container) return;

  const taskInput = document.getElementById('dp-task-input');
  const timeInput = document.getElementById('dp-time-input');
  const prioritySelect = document.getElementById('dp-priority-select');
  const btnAdd = document.getElementById('btn-dp-add');
  const btnClear = document.getElementById('btn-dp-clear');
  const btnExport = document.getElementById('btn-dp-export');
  const tasksList = document.getElementById('dp-tasks-list');
  const progressText = document.getElementById('dp-progress-text');

  let tasks = JSON.parse(localStorage.getItem('dc_daily_planner_tasks') || '[]');

  const saveAndRender = () => {
    localStorage.setItem('dc_daily_planner_tasks', JSON.stringify(tasks));
    render();
  };

  const render = () => {
    if (!tasksList) return;
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
      tasksList.innerHTML = '<div class="p-6 text-center text-slate-400 text-xs italic">No tasks added yet. Add your first task above!</div>';
      if (progressText) progressText.textContent = '0 / 0 Completed (0%)';
      return;
    }

    let completedCount = 0;
    tasks.forEach((item, index) => {
      if (item.done) completedCount++;
      const el = document.createElement('div');
      el.className = `p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
        item.done ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
      }`;
      
      const badgeColor = item.priority === 'High' ? 'bg-red-500/20 text-red-400' : item.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400';

      el.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden">
          <input type="checkbox" ${item.done ? 'checked' : ''} data-index="${index}" class="dp-checkbox rounded border-slate-700 text-[#6366F1] focus:ring-[#6366F1] w-4 h-4 cursor-pointer shrink-0" />
          <span class="font-bold text-[11px] px-2 py-0.5 rounded ${badgeColor} shrink-0">${item.priority}</span>
          ${item.time ? `<span class="text-[11px] text-slate-400 shrink-0 font-mono">[${item.time}]</span>` : ''}
          <span class="truncate font-mono">${item.text}</span>
        </div>
        <button data-index="${index}" class="dp-delete text-slate-400 hover:text-red-400 font-bold px-2 py-1 transition-colors">✕</button>
      `;
      tasksList.appendChild(el);
    });

    const pct = Math.round((completedCount / tasks.length) * 100) || 0;
    if (progressText) progressText.textContent = `${completedCount} / ${tasks.length} Completed (${pct}%)`;

    // Attach list event listeners
    tasksList.querySelectorAll('.dp-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        tasks[idx].done = e.target.checked;
        saveAndRender();
      });
    });

    tasksList.querySelectorAll('.dp-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        tasks.splice(idx, 1);
        saveAndRender();
      });
    });
  };

  btnAdd?.addEventListener('click', () => {
    const text = taskInput?.value.trim();
    if (!text) return;
    tasks.push({
      text,
      time: timeInput?.value || '',
      priority: prioritySelect?.value || 'Medium',
      done: false
    });
    if (taskInput) taskInput.value = '';
    saveAndRender();
  });

  btnClear?.addEventListener('click', () => {
    if (confirm('Clear all tasks for today?')) {
      tasks = [];
      saveAndRender();
    }
  });

  btnExport?.addEventListener('click', () => {
    if (tasks.length === 0) return;
    let exportText = `--- DAILY PLANNER ---\nDate: ${new Date().toLocaleDateString()}\n\n`;
    tasks.forEach((t, idx) => {
      exportText += `${t.done ? '[X]' : '[ ]'} ${t.time ? '[' + t.time + '] ' : ''}(${t.priority}) ${t.text}\n`;
    });
    safeCopy(exportText, 'Daily Planner schedule copied to clipboard!');
  });

  render();
}

/* 2. Weekly Planner Engine */
function initWeeklyPlanner() {
  const container = document.getElementById('calc-weekly-planner');
  if (!container) return;

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const goalInput = document.getElementById('wp-main-goal');
  const btnClear = document.getElementById('btn-wp-clear');
  const btnExport = document.getElementById('btn-wp-export');

  // Load saved state
  if (goalInput) goalInput.value = localStorage.getItem('dc_wp_goal') || '';
  days.forEach(d => {
    const el = document.getElementById(`wp-${d}`);
    if (el) el.value = localStorage.getItem(`dc_wp_${d}`) || '';
  });

  // Event Listeners for autosave
  goalInput?.addEventListener('input', (e) => localStorage.setItem('dc_wp_goal', e.target.value));
  days.forEach(d => {
    const el = document.getElementById(`wp-${d}`);
    el?.addEventListener('input', (e) => localStorage.setItem(`dc_wp_${d}`, e.target.value));
  });

  btnClear?.addEventListener('click', () => {
    if (confirm('Clear entire weekly planner?')) {
      if (goalInput) goalInput.value = '';
      localStorage.removeItem('dc_wp_goal');
      days.forEach(d => {
        const el = document.getElementById(`wp-${d}`);
        if (el) el.value = '';
        localStorage.removeItem(`dc_wp_${d}`);
      });
      if (typeof showToast === 'function') showToast('Weekly planner cleared');
    }
  });

  btnExport?.addEventListener('click', () => {
    let text = `=== WEEKLY PLANNER ===\nMain Goal: ${goalInput?.value || 'N/A'}\n\n`;
    days.forEach(d => {
      const el = document.getElementById(`wp-${d}`);
      text += `[${d.toUpperCase()}]:\n${el?.value || 'No notes'}\n\n`;
    });
    safeCopy(text, 'Weekly planner overview copied!');
  });
}

/* 3. Monthly Planner Engine */
function initMonthlyPlanner() {
  const container = document.getElementById('calc-monthly-planner');
  if (!container) return;

  const monthSelect = document.getElementById('mp-month-select');
  const focusInput = document.getElementById('mp-focus-input');
  const milestonesInput = document.getElementById('mp-milestones-input');
  const calendarGrid = document.getElementById('mp-calendar-grid');
  const btnExport = document.getElementById('mp-export-btn');

  if (focusInput) focusInput.value = localStorage.getItem('dc_mp_focus') || '';
  if (milestonesInput) milestonesInput.value = localStorage.getItem('dc_mp_milestones') || '';

  focusInput?.addEventListener('input', (e) => localStorage.setItem('dc_mp_focus', e.target.value));
  milestonesInput?.addEventListener('input', (e) => localStorage.setItem('dc_mp_milestones', e.target.value));

  const renderCalendar = () => {
    if (!calendarGrid) return;
    calendarGrid.innerHTML = '';
    const daysInMonth = 31;
    for (let i = 1; i <= daysInMonth; i++) {
      const key = `dc_mp_day_${i}`;
      const savedVal = localStorage.getItem(key) || '';

      const dayCard = document.createElement('div');
      dayCard.className = 'p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1';
      dayCard.innerHTML = `
        <div class="text-[10px] font-bold text-[#6366F1]">DAY ${i < 10 ? '0' + i : i}</div>
        <textarea id="${key}" placeholder="Add note..." class="w-full h-12 bg-transparent text-[11px] font-mono text-slate-800 dark:text-slate-200 focus:outline-none resize-none">${savedVal}</textarea>
      `;
      calendarGrid.appendChild(dayCard);

      dayCard.querySelector('textarea').addEventListener('input', (e) => {
        localStorage.setItem(key, e.target.value);
      });
    }
  };

  monthSelect?.addEventListener('change', renderCalendar);
  btnExport?.addEventListener('click', () => {
    let summary = `=== MONTHLY PLANNER (${monthSelect?.value || 'Current Month'}) ===\n`;
    summary += `Focus Target: ${focusInput?.value || 'N/A'}\n`;
    summary += `Milestones: ${milestonesInput?.value || 'N/A'}\n\n`;
    for (let i = 1; i <= 31; i++) {
      const val = localStorage.getItem(`dc_mp_day_${i}`);
      if (val) summary += `Day ${i}: ${val}\n`;
    }
    safeCopy(summary, 'Monthly plan copied to clipboard!');
  });

  renderCalendar();
}

/* 4. Focus Timer (Pomodoro Engine) */
function initFocusTimer() {
  const container = document.getElementById('calc-focus-timer');
  if (!container) return;

  const timeDisplay = document.getElementById('ft-timer-display');
  const btnWork = document.getElementById('btn-ft-work');
  const btnShort = document.getElementById('btn-ft-[#6366F1]');
  const btnLong = document.getElementById('btn-ft-long');
  const btnStart = document.getElementById('btn-ft-start');
  const btnPause = document.getElementById('btn-ft-pause');
  const btnReset = document.getElementById('btn-ft-reset');
  const sessionsCount = document.getElementById('ft-sessions-count');

  let durationSeconds = 25 * 60;
  let remainingSeconds = 25 * 60;
  let timerInterval = null;
  let isRunning = false;
  let completedSessions = 0;

  const updateDisplay = () => {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    if (timeDisplay) {
      timeDisplay.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    }
  };

  const setMode = (mins) => {
    clearInterval(timerInterval);
    isRunning = false;
    durationSeconds = mins * 60;
    remainingSeconds = durationSeconds;
    if (btnStart) btnStart.classList.remove('hidden');
    if (btnPause) btnPause.classList.add('hidden');
    updateDisplay();
  };

  btnWork?.addEventListener('click', () => setMode(25));
  document.getElementById('btn-ft-short')?.addEventListener('click', () => setMode(5));
  btnLong?.addEventListener('click', () => setMode(15));

  btnStart?.addEventListener('click', () => {
    if (isRunning) return;
    isRunning = true;
    btnStart.classList.add('hidden');
    btnPause?.classList.remove('hidden');

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        btnStart.classList.remove('hidden');
        btnPause?.classList.add('hidden');
        completedSessions++;
        if (sessionsCount) sessionsCount.textContent = completedSessions;
        if (typeof showToast === 'function') showToast('Focus session complete! Take a break 🎉');
      }
    }, 1000);
  });

  btnPause?.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    btnPause.classList.add('hidden');
    btnStart?.classList.remove('hidden');
  });

  btnReset?.addEventListener('click', () => {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = durationSeconds;
    btnPause?.classList.add('hidden');
    btnStart?.classList.remove('hidden');
    updateDisplay();
  });

  updateDisplay();
}

/* 5. Priority Matrix (Eisenhower Matrix Engine) */
function initPriorityMatrix() {
  const container = document.getElementById('calc-priority-matrix');
  if (!container) return;

  const quadrants = [
    { id: 'q1', title: 'Do First (Urgent & Important)' },
    { id: 'q2', title: 'Schedule (Not Urgent & Important)' },
    { id: 'q3', title: 'Delegate (Urgent & Not Important)' },
    { id: 'q4', title: 'Delete (Not Urgent & Not Important)' }
  ];

  quadrants.forEach(q => {
    const input = document.getElementById(`pm-${q.id}-input`);
    const btnAdd = document.getElementById(`btn-pm-${q.id}-add`);
    const list = document.getElementById(`pm-${q.id}-list`);

    let items = JSON.parse(localStorage.getItem(`dc_pm_${q.id}`) || '[]');

    const render = () => {
      if (!list) return;
      list.innerHTML = '';
      items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs font-mono';
        itemEl.innerHTML = `
          <span>${item}</span>
          <button data-index="${index}" class="pm-del text-slate-400 hover:text-red-400 font-bold px-1">✕</button>
        `;
        list.appendChild(itemEl);
      });

      list.querySelectorAll('.pm-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          items.splice(idx, 1);
          localStorage.setItem(`dc_pm_${q.id}`, JSON.stringify(items));
          render();
        });
      });
    };

    const addItem = () => {
      const val = input?.value.trim();
      if (!val) return;
      items.push(val);
      localStorage.setItem(`dc_pm_${q.id}`, JSON.stringify(items));
      if (input) input.value = '';
      render();
    };

    btnAdd?.addEventListener('click', addItem);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addItem();
      }
    });

    render();
  });

  const btnExport = document.getElementById('btn-pm-export');
  btnExport?.addEventListener('click', () => {
    let text = `=== EISENHOWER PRIORITY MATRIX ===\n\n`;
    quadrants.forEach(q => {
      const items = JSON.parse(localStorage.getItem(`dc_pm_${q.id}`) || '[]');
      text += `[${q.title.toUpperCase()}]:\n`;
      if (items.length === 0) text += `  (No items)\n`;
      else items.forEach(i => text += `  - ${i}\n`);
      text += `\n`;
    });
    safeCopy(text, 'Priority Matrix copied to clipboard!');
  });
}

/* 6. Daily Schedule Generator Engine */
function initDailyScheduleGenerator() {
  const container = document.getElementById('calc-schedule-gen');
  if (!container) return;

  const startTimeInput = document.getElementById('sg-start-time');
  const tasksInput = document.getElementById('sg-tasks-input');
  const btnGenerate = document.getElementById('btn-sg-generate');
  const outputContainer = document.getElementById('sg-output-container');
  const btnCopy = document.getElementById('btn-sg-copy');

  btnGenerate?.addEventListener('click', () => {
    const startTimeStr = startTimeInput?.value || '09:00';
    const rawTasks = tasksInput?.value.split('\n').map(t => t.trim()).filter(Boolean) || [];

    if (rawTasks.length === 0) {
      if (typeof showToast === 'function') showToast('Please enter at least one task', 'error');
      return;
    }

    let [currentHour, currentMin] = startTimeStr.split(':').map(n => parseInt(n, 10));
    let scheduleHTML = '';
    let textSummary = `=== GENERATED DAILY SCHEDULE ===\nStart Time: ${startTimeStr}\n\n`;

    rawTasks.forEach((line) => {
      // Parse task line format: "Task Name - 30m" or "Task Name" (default 30m)
      let durationMins = 30;
      let taskName = line;

      const match = line.match(/(.+?)(?:\s*-\s*|\s+)(\d+)\s*(?:m|mins|minutes)?$/i);
      if (match) {
        taskName = match[1].trim();
        durationMins = parseInt(match[2], 10);
      }

      const formatTime = (h, m) => {
        const hh = h < 10 ? '0' + h : h;
        const mm = m < 10 ? '0' + m : m;
        return `${hh}:${mm}`;
      };

      const slotStart = formatTime(currentHour, currentMin);
      
      // Calculate end time
      currentMin += durationMins;
      currentHour += Math.floor(currentMin / 60);
      currentMin %= 60;
      currentHour %= 24;

      const slotEnd = formatTime(currentHour, currentMin);

      scheduleHTML += `
        <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs font-mono">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 rounded-lg bg-[#6366F1]/10 text-[#6366F1] font-bold shrink-0">${slotStart} - ${slotEnd}</span>
            <span class="font-medium text-slate-900 dark:text-white">${taskName}</span>
          </div>
          <span class="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono shrink-0">${durationMins} min</span>
        </div>
      `;

      textSummary += `[${slotStart} - ${slotEnd}] (${durationMins}m) ${taskName}\n`;
    });

    if (outputContainer) outputContainer.innerHTML = scheduleHTML;
    if (btnCopy) {
      btnCopy.classList.remove('hidden');
      btnCopy.onclick = () => safeCopy(textSummary, 'Daily Schedule copied!');
    }
  });
}
