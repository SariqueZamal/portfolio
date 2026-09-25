/* ==========================================================================
   DigitalCron Tools - Text Tools Suite JavaScript Engine
   Supports Word, Character, Line, Sentence, Paragraph Counters & Cleaners
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTextTools();
});

function initTextTools() {
  const textInput = document.getElementById('text-input');
  if (textInput) {
    textInput.addEventListener('input', updateTextStats);
    updateTextStats(); // Initial run
  }

  // File Upload listener
  const fileInput = document.getElementById('text-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Quick Case Transformation Buttons
  document.getElementById('btn-uppercase')?.addEventListener('click', () => transformCase('upper'));
  document.getElementById('btn-lowercase')?.addEventListener('click', () => transformCase('lower'));
  document.getElementById('btn-titlecase')?.addEventListener('click', () => transformCase('title'));
  document.getElementById('btn-sentencecase')?.addEventListener('click', () => transformCase('sentence'));

  // Action Buttons
  document.getElementById('btn-copy')?.addEventListener('click', copyTextOutput);
  document.getElementById('btn-clear')?.addEventListener('click', clearTextInput);
  document.getElementById('btn-download')?.addEventListener('click', downloadTextOutput);

  // Dedicated Tool Handlers
  document.getElementById('btn-remove-spaces')?.addEventListener('click', executeRemoveExtraSpaces);
  document.getElementById('btn-remove-duplicates')?.addEventListener('click', executeRemoveDuplicates);
  document.getElementById('btn-find-replace')?.addEventListener('click', executeFindReplace);
  document.getElementById('btn-number-lines')?.addEventListener('click', executeNumberLines);
  document.getElementById('btn-remove-line-numbers')?.addEventListener('click', executeRemoveLineNumbers);
}

/* ── Live Stats Computation ────────────────────────────────────────── */
function updateTextStats() {
  const textInput = document.getElementById('text-input');
  if (!textInput) return;

  const text = textInput.value;

  // Words
  const wordsArray = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = wordsArray.length;

  // Characters
  const charWithSpaces = text.length;
  const charNoSpaces = text.replace(/\s/g, '').length;
  const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
  const digitCount = (text.match(/[0-9]/g) || []).length;

  // Sentences
  const sentenceArray = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
  const sentenceCount = sentenceArray.length;

  // Paragraphs
  const paragraphArray = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];
  const paragraphCount = paragraphArray.length;

  // Lines
  const allLines = text ? text.split('\n') : [];
  const lineCount = allLines.length;
  const nonBlankLines = allLines.filter(l => l.trim().length > 0).length;
  const blankLines = lineCount - nonBlankLines;

  // Times
  const readMin = Math.ceil(wordCount / 200);
  const speakMin = Math.ceil(wordCount / 130);

  // Update DOM stats if elements exist
  setEl('stat-words', wordCount.toLocaleString());
  setEl('stat-chars-spaces', charWithSpaces.toLocaleString());
  setEl('stat-chars-nospaces', charNoSpaces.toLocaleString());
  setEl('stat-letters', letterCount.toLocaleString());
  setEl('stat-digits', digitCount.toLocaleString());
  setEl('stat-sentences', sentenceCount.toLocaleString());
  setEl('stat-paragraphs', paragraphCount.toLocaleString());
  setEl('stat-lines', lineCount.toLocaleString());
  setEl('stat-lines-nonblank', nonBlankLines.toLocaleString());
  setEl('stat-lines-blank', blankLines.toLocaleString());
  setEl('stat-read-time', `${readMin} min`);
  setEl('stat-speak-time', `${speakMin} min`);

  // Update social media limit progress bars if present
  updateSocialLimits(charWithSpaces);
}

function updateSocialLimits(count) {
  const limits = { twitter: 280, linkedin: 3000, instagram: 2200 };
  Object.keys(limits).forEach(key => {
    const bar = document.getElementById(`limit-bar-${key}`);
    const badge = document.getElementById(`limit-badge-${key}`);
    if (bar && badge) {
      const pct = Math.min(100, Math.round((count / limits[key]) * 100));
      bar.style.width = `${pct}%`;
      badge.textContent = `${count} / ${limits[key]}`;
      if (count > limits[key]) {
        bar.className = 'h-full bg-rose-500 transition-all duration-200';
        badge.className = 'text-rose-500 font-bold';
      } else {
        bar.className = 'h-full bg-[#6366F1] transition-all duration-200';
        badge.className = 'text-slate-500 dark:text-slate-400 font-bold';
      }
    }
  });
}

/* ── Case Transformations ───────────────────────────────────────────── */
function transformCase(mode) {
  const input = document.getElementById('text-input');
  if (!input || !input.value) return;

  let str = input.value;

  if (mode === 'upper') {
    str = str.toUpperCase();
  } else if (mode === 'lower') {
    str = str.toLowerCase();
  } else if (mode === 'title') {
    str = str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  } else if (mode === 'sentence') {
    str = str.toLowerCase().replace(/(^\s*|\.\s*)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
  }

  input.value = str;
  updateTextStats();
  showToast(`Converted text to ${mode} case!`);
}

/* ── File Upload Handler ───────────────────────────────────────────── */
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    showToast('File size exceeds 10MB limit.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    const input = document.getElementById('text-input');
    if (input) {
      input.value = evt.target.result;
      updateTextStats();
      showToast(`Loaded file: ${file.name}`);
    }
  };
  reader.readAsText(file);
}

/* ── Dedicated Tool Executors ──────────────────────────────────────── */

// 1. Remove Extra Spaces
function executeRemoveExtraSpaces() {
  const input = document.getElementById('text-input');
  if (!input || !input.value) return;

  const removeTabs = document.getElementById('opt-remove-tabs')?.checked ?? true;
  const removeEmptyLines = document.getElementById('opt-remove-empty-lines')?.checked ?? false;
  const trimLines = document.getElementById('opt-trim-lines')?.checked ?? true;

  let text = input.value;

  // Trim each line
  if (trimLines) {
    text = text.split('\n').map(line => line.trim()).join('\n');
  }

  // Replace multiple spaces with single space
  text = text.replace(/ {2,}/g, ' ');

  if (removeTabs) {
    text = text.replace(/\t+/g, ' ');
  }

  if (removeEmptyLines) {
    text = text.replace(/\n\s*\n/g, '\n').replace(/^\s*[\r\n]/gm, '');
  }

  input.value = text.trim();
  updateTextStats();
  showToast('Removed extra spaces and cleaned text!');
}

// 2. Remove Duplicate Lines
function executeRemoveDuplicates() {
  const input = document.getElementById('text-input');
  if (!input || !input.value) return;

  const caseInsensitive = document.getElementById('opt-case-insensitive')?.checked ?? false;
  const sortAlphabetically = document.getElementById('opt-sort-lines')?.checked ?? false;
  const trimWhitespace = document.getElementById('opt-trim-lines')?.checked ?? true;

  let lines = input.value.split('\n');
  if (trimWhitespace) lines = lines.map(l => l.trim());

  const seen = new Set();
  const result = [];

  lines.forEach(line => {
    const key = caseInsensitive ? line.toLowerCase() : line;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  });

  if (sortAlphabetically) {
    result.sort((a, b) => a.localeCompare(b));
  }

  const origCount = lines.length;
  const newCount = result.length;
  const removed = origCount - newCount;

  input.value = result.join('\n');
  updateTextStats();
  showToast(`Removed ${removed} duplicate line(s)!`);
}

// 3. Find and Replace
function executeFindReplace() {
  const input = document.getElementById('text-input');
  const findVal = document.getElementById('find-query')?.value;
  const replaceVal = document.getElementById('replace-query')?.value || '';

  if (!input || !input.value) return;
  if (!findVal) {
    showToast('Please enter text to find.', 'error');
    return;
  }

  const matchCase = document.getElementById('opt-match-case')?.checked ?? false;
  const matchWhole = document.getElementById('opt-match-whole')?.checked ?? false;
  const useRegex = document.getElementById('opt-use-regex')?.checked ?? false;

  let text = input.value;
  let count = 0;

  try {
    let pattern;
    if (useRegex) {
      const flags = matchCase ? 'g' : 'gi';
      pattern = new RegExp(findVal, flags);
    } else {
      let escaped = findVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWhole) escaped = `\\b${escaped}\\b`;
      const flags = matchCase ? 'g' : 'gi';
      pattern = new RegExp(escaped, flags);
    }

    const matches = text.match(pattern);
    count = matches ? matches.length : 0;

    input.value = text.replace(pattern, replaceVal);
    updateTextStats();
    showToast(`Replaced ${count} occurrence(s)!`);
  } catch (err) {
    showToast('Invalid search pattern or regular expression.', 'error');
  }
}

// 4. Number Lines
function executeNumberLines() {
  const input = document.getElementById('text-input');
  if (!input || !input.value) return;

  const startNum = parseInt(document.getElementById('opt-start-num')?.value || '1', 10);
  const format = document.getElementById('opt-num-format')?.value || '1.';
  const skipBlank = document.getElementById('opt-skip-blank')?.checked ?? true;

  const lines = input.value.split('\n');
  let currentNum = startNum;

  const numbered = lines.map(line => {
    if (skipBlank && line.trim().length === 0) return line;

    let numStr = currentNum.toString();
    if (format === '01.') numStr = currentNum.toString().padStart(2, '0');

    let prefix = `${numStr}. `;
    if (format === '1)') prefix = `${numStr}) `;
    if (format === '[1]') prefix = `[${numStr}] `;
    if (format === '1:') prefix = `${numStr}: `;
    if (format === '01.') prefix = `${numStr}. `;

    currentNum++;
    return `${prefix}${line}`;
  });

  input.value = numbered.join('\n');
  updateTextStats();
  showToast('Line numbers added!');
}

// 5. Remove Line Numbers
function executeRemoveLineNumbers() {
  const input = document.getElementById('text-input');
  if (!input || !input.value) return;

  const lines = input.value.split('\n');

  // Regex matches leading line numbers, bullets, brackets like: 1., 01), [1], L1:, 1 -, •, *
  const cleaned = lines.map(line => {
    return line.replace(/^\s*([\[\(]?\d+[\]\)\.\:\-]?|\d+\s*[\.\:\-]|[\•\*\-\+])\s*/, '');
  });

  input.value = cleaned.join('\n');
  updateTextStats();
  showToast('Removed line numbers and prefixes!');
}

/* ── Actions ────────────────────────────────────────────────────────── */
function copyTextOutput() {
  const input = document.getElementById('text-input');
  if (!input || !input.value) {
    showToast('Nothing to copy.', 'error');
    return;
  }
  navigator.clipboard.writeText(input.value).then(() => {
    showToast('Copied text to clipboard!');
  });
}

function clearTextInput() {
  const input = document.getElementById('text-input');
  if (input) {
    input.value = '';
    updateTextStats();
    showToast('Cleared text area.');
  }
}

function downloadTextOutput() {
  const input = document.getElementById('text-input');
  if (!input || !input.value) {
    showToast('Nothing to download.', 'error');
    return;
  }
  const blob = new Blob([input.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `text-output-${Date.now()}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Downloaded .txt file!');
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
