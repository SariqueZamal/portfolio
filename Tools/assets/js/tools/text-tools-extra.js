/**
 * Text Tools Extra Engines:
 * - Case Converter
 * - Slug Generator
 * - Lorem Ipsum Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────────────────
  // 1. CASE CONVERTER
  // ─────────────────────────────────────────────────────────────────
  const caseInput = document.getElementById('case-input');
  if (caseInput) {
    const statWords = document.getElementById('stat-words');
    const statChars = document.getElementById('stat-chars');
    const statLines = document.getElementById('stat-lines');

    const updateStats = () => {
      const text = caseInput.value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
      if (statWords) statWords.textContent = words.toLocaleString();
      if (statChars) statChars.textContent = chars.toLocaleString();
      if (statLines) statLines.textContent = lines.toLocaleString();
    };

    caseInput.addEventListener('input', updateStats);

    const transformText = (type) => {
      const text = caseInput.value;
      if (!text) return;
      let res = text;

      switch (type) {
        case 'upper':
          res = text.toUpperCase();
          break;
        case 'lower':
          res = text.toLowerCase();
          break;
        case 'title':
          res = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          break;
        case 'sentence':
          res = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
          break;
        case 'camel': {
          const words = text.trim().replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
          res = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
          break;
        }
        case 'pascal': {
          const words = text.trim().replace(/[^a-zA-Z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
          res = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
          break;
        }
        case 'snake': {
          res = text.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
          break;
        }
        case 'kebab': {
          res = text.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
          break;
        }
        case 'constant': {
          res = text.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
          break;
        }
      }

      caseInput.value = res;
      updateStats();
    };

    const caseButtons = {
      'btn-case-upper': 'upper',
      'btn-case-lower': 'lower',
      'btn-case-title': 'title',
      'btn-case-sentence': 'sentence',
      'btn-case-camel': 'camel',
      'btn-case-pascal': 'pascal',
      'btn-case-snake': 'snake',
      'btn-case-kebab': 'kebab',
      'btn-case-constant': 'constant'
    };

    Object.entries(caseButtons).forEach(([id, type]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => transformText(type));
      }
    });

    const btnCopy = document.getElementById('btn-case-copy');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (!caseInput.value) return;
        navigator.clipboard.writeText(caseInput.value).then(() => {
          const original = btnCopy.innerHTML;
          btnCopy.innerHTML = '✅ Copied!';
          setTimeout(() => { btnCopy.innerHTML = original; }, 1800);
        });
      });
    }

    const btnDownload = document.getElementById('btn-case-download');
    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        if (!caseInput.value) return;
        const blob = new Blob([caseInput.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted-text.txt';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    const btnClear = document.getElementById('btn-case-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        caseInput.value = '';
        updateStats();
      });
    }

    updateStats();
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. URL SLUG GENERATOR
  // ─────────────────────────────────────────────────────────────────
  const slugInput = document.getElementById('slug-input');
  const slugOutput = document.getElementById('slug-output');
  if (slugInput && slugOutput) {
    const slugDelimiter = document.getElementById('slug-delimiter');
    const slugLowercase = document.getElementById('slug-lowercase');
    const slugStripStopwords = document.getElementById('slug-strip-stopwords');
    const btnSlugCopy = document.getElementById('btn-slug-copy');

    const STOP_WORDS = new Set([
      'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
      'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
      'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'how',
      'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'more', 'most', 'my', 'no', 'nor', 'not', 'now',
      'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'out', 'over', 'own',
      'same', 'she', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
      'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 'your'
    ]);

    const generateSlug = () => {
      let text = slugInput.value || '';
      const delimiter = slugDelimiter ? slugDelimiter.value : '-';
      const toLower = slugLowercase ? slugLowercase.checked : true;
      const removeStop = slugStripStopwords ? slugStripStopwords.checked : false;

      // Normalize diacritics / accents
      text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (toLower) {
        text = text.toLowerCase();
      }

      // Split into word tokens
      let words = text.replace(/[^a-zA-Z0-9\s-_/]/g, ' ').trim().split(/\s+/).filter(Boolean);

      if (removeStop) {
        words = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
      }

      const slug = words.join(delimiter);
      slugOutput.value = slug;
    };

    slugInput.addEventListener('input', generateSlug);
    if (slugDelimiter) slugDelimiter.addEventListener('change', generateSlug);
    if (slugLowercase) slugLowercase.addEventListener('change', generateSlug);
    if (slugStripStopwords) slugStripStopwords.addEventListener('change', generateSlug);

    if (btnSlugCopy) {
      btnSlugCopy.addEventListener('click', () => {
        if (!slugOutput.value) return;
        navigator.clipboard.writeText(slugOutput.value).then(() => {
          const original = btnSlugCopy.innerHTML;
          btnSlugCopy.innerHTML = '✅ Copied!';
          setTimeout(() => { btnSlugCopy.innerHTML = original; }, 1800);
        });
      });
    }

    generateSlug();
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. LOREM IPSUM GENERATOR
  // ─────────────────────────────────────────────────────────────────
  const loremOutput = document.getElementById('lorem-output');
  if (loremOutput) {
    const loremType = document.getElementById('lorem-type');
    const loremCount = document.getElementById('lorem-count');
    const loremStart = document.getElementById('lorem-start');
    const loremHtml = document.getElementById('lorem-html');
    const btnGenerate = document.getElementById('btn-lorem-generate');
    const btnCopy = document.getElementById('btn-lorem-copy');
    const btnDownload = document.getElementById('btn-lorem-download');

    const LOREM_WORDS = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
      'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
      'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
      'ut', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in',
      'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur',
      'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
      'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium',
      'tincidunt', 'lacus', 'nulla', 'gravida', 'orci', 'a', 'odio', 'nullam', 'varius', 'turpis',
      'et', 'commodo', 'pharetra', 'est', 'eros', 'bibendum', 'elit', 'nec', 'luctus', 'magna',
      'felis', 'sollicitudin', 'mauris', 'integer', 'in', 'mauris', 'eu', 'nibh', 'euismod',
      'gravida', 'duis', 'ac', 'tellus', 'et', 'risus', 'vulputate', 'vehicula', 'donec', 'lobortis'
    ];

    const getRandomWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

    const generateSentence = (minWords = 8, maxWords = 15) => {
      const len = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
      const sentenceWords = [];
      for (let i = 0; i < len; i++) {
        sentenceWords.push(getRandomWord());
      }
      const raw = sentenceWords.join(' ');
      return raw.charAt(0).toUpperCase() + raw.slice(1) + '.';
    };

    const generateParagraph = (minSentences = 4, maxSentences = 7) => {
      const count = Math.floor(Math.random() * (maxSentences - minSentences + 1)) + minSentences;
      const sentences = [];
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence());
      }
      return sentences.join(' ');
    };

    const generateLorem = () => {
      const type = loremType ? loremType.value : 'paragraphs';
      const count = loremCount ? Math.max(1, Math.min(100, parseInt(loremCount.value, 10) || 3)) : 3;
      const startWithLorem = loremStart ? loremStart.checked : true;
      const wrapHtml = loremHtml ? loremHtml.checked : false;

      let result = '';

      if (type === 'paragraphs') {
        const paras = [];
        for (let i = 0; i < count; i++) {
          let p = generateParagraph();
          if (i === 0 && startWithLorem) {
            p = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + p;
          }
          paras.push(wrapHtml ? ('<p>' + p + '</p>') : p);
        }
        result = paras.join('\n\n');
      } else if (type === 'sentences') {
        const sentences = [];
        for (let i = 0; i < count; i++) {
          let s = generateSentence();
          if (i === 0 && startWithLorem) {
            s = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
          }
          sentences.push(wrapHtml ? ('<p>' + s + '</p>') : s);
        }
        result = sentences.join(wrapHtml ? '\n' : ' ');
      } else if (type === 'words') {
        const words = [];
        for (let i = 0; i < count; i++) {
          if (i === 0 && startWithLorem) {
            words.push('lorem');
          } else if (i === 1 && startWithLorem) {
            words.push('ipsum');
          } else {
            words.push(getRandomWord());
          }
        }
        result = words.join(' ');
      } else if (type === 'list') {
        const items = [];
        for (let i = 0; i < count; i++) {
          let item = generateSentence(4, 10);
          items.push(wrapHtml ? ('  <li>' + item + '</li>') : ('• ' + item));
        }
        result = wrapHtml ? ('<ul>\n' + items.join('\n') + '\n</ul>') : items.join('\n');
      }

      loremOutput.value = result;
    };

    if (btnGenerate) btnGenerate.addEventListener('click', generateLorem);
    if (loremType) loremType.addEventListener('change', generateLorem);
    if (loremCount) loremCount.addEventListener('input', generateLorem);
    if (loremStart) loremStart.addEventListener('change', generateLorem);
    if (loremHtml) loremHtml.addEventListener('change', generateLorem);

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (!loremOutput.value) return;
        navigator.clipboard.writeText(loremOutput.value).then(() => {
          const original = btnCopy.innerHTML;
          btnCopy.innerHTML = '✅ Copied!';
          setTimeout(() => { btnCopy.innerHTML = original; }, 1800);
        });
      });
    }

    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        if (!loremOutput.value) return;
        const blob = new Blob([loremOutput.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lorem-ipsum.txt';
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    generateLorem();
  }
});
