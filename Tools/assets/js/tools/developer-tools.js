/* ==========================================================================
   DigitalCron Tools - Developer Tools Suite JavaScript Engine
   Supports: JSON, CSS, HTML, JS Formatters; UUID & Password Generators;
   HEX, RGB, CSS Gradient, Box Shadow, CSS Transform, HTML Button,
   CSS Animation, and Dummy JSON Generators.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initDeveloperTools();
});

function initDeveloperTools() {
  initJSONFormatter();
  initCSSFormatter();
  initHTMLFormatter();
  initJSFormatter();
  initUUIDGenerator();
  initPasswordGenerator();
  initHexColorGenerator();
  initRGBColorGenerator();
  initCSSGradientGenerator();
  initBoxShadowGenerator();
  initCSSTransformGenerator();
  initHTMLButtonGenerator();
  initCSSAnimationGenerator();
  initDummyJSONGenerator();
}

/* Helper Functions */
function safeCopy(text, msg = 'Copied to clipboard!') {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') showToast(msg);
  }).catch(() => {
    if (typeof showToast === 'function') showToast('Failed to copy', 'error');
  });
}

function downloadFile(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* 1. JSON Formatter & Minifier */
function initJSONFormatter() {
  const container = document.getElementById('calc-json-formatter');
  if (!container) return;

  const inputEl = document.getElementById('json-input');
  const outputEl = document.getElementById('json-output');
  const statusEl = document.getElementById('json-status');
  const indentEl = document.getElementById('json-indent');
  const btnPrettify = document.getElementById('btn-json-prettify');
  const btnMinify = document.getElementById('btn-json-minify');
  const btnValidate = document.getElementById('btn-json-validate');
  const btnCopy = document.getElementById('btn-copy-json');
  const btnDownload = document.getElementById('btn-download-json');
  const btnClear = document.getElementById('btn-clear-json');

  const processJSON = (minify = false) => {
    const raw = inputEl.value.trim();
    if (!raw) {
      outputEl.textContent = '';
      statusEl.textContent = 'Ready';
      statusEl.className = 'text-xs font-mono font-bold text-slate-500';
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const indent = minify ? 0 : parseInt(indentEl?.value || '2', 10);
      const result = JSON.stringify(parsed, null, indent);
      outputEl.textContent = result;
      statusEl.textContent = '✓ Valid JSON';
      statusEl.className = 'text-xs font-mono font-bold text-emerald-500';
    } catch (err) {
      outputEl.textContent = 'Error: ' + err.message;
      statusEl.textContent = '✕ Invalid JSON: ' + err.message;
      statusEl.className = 'text-xs font-mono font-bold text-rose-500';
    }
  };

  inputEl?.addEventListener('input', () => processJSON(false));
  indentEl?.addEventListener('change', () => processJSON(false));
  btnPrettify?.addEventListener('click', () => processJSON(false));
  btnMinify?.addEventListener('click', () => processJSON(true));
  btnValidate?.addEventListener('click', () => processJSON(false));

  btnClear?.addEventListener('click', () => {
    inputEl.value = '';
    outputEl.textContent = '';
    statusEl.textContent = 'Cleared';
    statusEl.className = 'text-xs font-mono font-bold text-slate-500';
  });

  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'JSON copied to clipboard!'));
  btnDownload?.addEventListener('click', () => downloadFile('formatted.json', outputEl.textContent, 'application/json'));
}

/* 2. CSS Formatter & Minifier */
function initCSSFormatter() {
  const container = document.getElementById('calc-css-formatter');
  if (!container) return;

  const inputEl = document.getElementById('css-input');
  const outputEl = document.getElementById('css-output');
  const btnFormat = document.getElementById('btn-css-format');
  const btnMinify = document.getElementById('btn-css-minify');
  const btnCopy = document.getElementById('btn-copy-css');
  const btnDownload = document.getElementById('btn-download-css');

  const formatCSS = (code) => {
    return code
      .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
      .replace(/;\s*;/g, ';')
      .replace(/\{/g, ' {\n  ')
      .replace(/;/g, ';\n  ')
      .replace(/\s*\}\s*/g, '\n}\n\n')
      .replace(/\s*;\s*\n\s*\}/g, '\n}')
      .trim();
  };

  const minifyCSS = (code) => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
      .replace(/;\}/g, '}')
      .replace(/\s+/g, ' ')
      .trim();
  };

  btnFormat?.addEventListener('click', () => {
    outputEl.textContent = formatCSS(inputEl.value);
  });

  btnMinify?.addEventListener('click', () => {
    outputEl.textContent = minifyCSS(inputEl.value);
  });

  inputEl?.addEventListener('input', () => {
    outputEl.textContent = formatCSS(inputEl.value);
  });

  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'CSS copied!'));
  btnDownload?.addEventListener('click', () => downloadFile('styles.css', outputEl.textContent, 'text/css'));
}

/* 3. HTML Formatter & Beautifier */
function initHTMLFormatter() {
  const container = document.getElementById('calc-html-formatter');
  if (!container) return;

  const inputEl = document.getElementById('html-input');
  const outputEl = document.getElementById('html-output');
  const btnFormat = document.getElementById('btn-html-format');
  const btnMinify = document.getElementById('btn-html-minify');
  const btnCopy = document.getElementById('btn-copy-html');
  const btnDownload = document.getElementById('btn-download-html');

  const formatHTML = (html) => {
    let indent = '';
    const tab = '  ';
    let result = '';
    const tokens = html.replace(/>\s*</g, '><').replace(/</g, '\n<').split('\n').filter(Boolean);

    tokens.forEach(token => {
      if (token.match(/^<\/\w/)) {
        indent = indent.substring(tab.length);
      }
      result += indent + token + '\n';
      if (token.match(/^<\w[^>]*[^\/]>$/) && !token.match(/^<(img|input|br|hr|meta|link)/i)) {
        indent += tab;
      }
    });
    return result.trim();
  };

  const minifyHTML = (html) => {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim();
  };

  btnFormat?.addEventListener('click', () => outputEl.textContent = formatHTML(inputEl.value));
  btnMinify?.addEventListener('click', () => outputEl.textContent = minifyHTML(inputEl.value));
  inputEl?.addEventListener('input', () => outputEl.textContent = formatHTML(inputEl.value));

  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'HTML copied!'));
  btnDownload?.addEventListener('click', () => downloadFile('index.html', outputEl.textContent, 'text/html'));
}

/* 4. JavaScript Formatter */
function initJSFormatter() {
  const container = document.getElementById('calc-js-formatter');
  if (!container) return;

  const inputEl = document.getElementById('js-input');
  const outputEl = document.getElementById('js-output');
  const btnFormat = document.getElementById('btn-js-format');
  const btnMinify = document.getElementById('btn-js-minify');
  const btnCopy = document.getElementById('btn-copy-js');
  const btnDownload = document.getElementById('btn-download-js');

  const formatJS = (code) => {
    let indent = 0;
    const tab = '  ';
    return code
      .split('\n')
      .map(line => {
        let trimmed = line.trim();
        if (trimmed.startsWith('}') || trimmed.startsWith(']')) indent = Math.max(0, indent - 1);
        let formatted = tab.repeat(indent) + trimmed;
        if (trimmed.endsWith('{') || trimmed.endsWith('[')) indent++;
        return formatted;
      })
      .join('\n');
  };

  const minifyJS = (code) => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\s*([\{\}\(\)\=\+\-\*\/\:\;\,\>])\s*/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  };

  btnFormat?.addEventListener('click', () => outputEl.textContent = formatJS(inputEl.value));
  btnMinify?.addEventListener('click', () => outputEl.textContent = minifyJS(inputEl.value));
  inputEl?.addEventListener('input', () => outputEl.textContent = formatJS(inputEl.value));

  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'JavaScript copied!'));
  btnDownload?.addEventListener('click', () => downloadFile('script.js', outputEl.textContent, 'application/javascript'));
}

/* 5. UUID Generator */
function initUUIDGenerator() {
  const container = document.getElementById('calc-uuid-generator');
  if (!container) return;

  const countInput = document.getElementById('uuid-count');
  const uppercaseToggle = document.getElementById('uuid-uppercase');
  const hyphensToggle = document.getElementById('uuid-hyphens');
  const outputEl = document.getElementById('uuid-output');
  const btnGenerate = document.getElementById('btn-uuid-generate');
  const btnCopy = document.getElementById('btn-copy-uuid');

  const generateUUIDv4 = () => {
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    if (!hyphensToggle?.checked) uuid = uuid.replace(/-/g, '');
    if (uppercaseToggle?.checked) uuid = uuid.toUpperCase();
    return uuid;
  };

  const generateList = () => {
    const count = Math.min(100, Math.max(1, parseInt(countInput?.value || '1', 10)));
    const uuids = Array.from({ length: count }, () => generateUUIDv4());
    outputEl.value = uuids.join('\n');
  };

  btnGenerate?.addEventListener('click', generateList);
  [countInput, uppercaseToggle, hyphensToggle].forEach(el => el?.addEventListener('change', generateList));
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.value, 'UUID(s) copied to clipboard!'));

  generateList();
}

/* 6. Secure Password Generator */
function initPasswordGenerator() {
  const container = document.getElementById('calc-password-generator');
  if (!container) return;

  const lengthInput = document.getElementById('pwd-length');
  const lengthVal = document.getElementById('pwd-length-val');
  const incUpper = document.getElementById('pwd-upper');
  const incLower = document.getElementById('pwd-lower');
  const incNumbers = document.getElementById('pwd-numbers');
  const incSymbols = document.getElementById('pwd-symbols');
  const excAmbiguous = document.getElementById('pwd-ambiguous');
  const outputEl = document.getElementById('pwd-output');
  const strengthBar = document.getElementById('pwd-strength-bar');
  const strengthText = document.getElementById('pwd-strength-text');
  const btnGenerate = document.getElementById('btn-pwd-generate');
  const btnCopy = document.getElementById('btn-copy-pwd');

  const charsUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charsLower = 'abcdefghijklmnopqrstuvwxyz';
  const charsNumbers = '0123456789';
  const charsSymbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const ambiguous = /[IOl01]/g;

  const generatePassword = () => {
    let pool = '';
    if (incUpper?.checked) pool += charsUpper;
    if (incLower?.checked) pool += charsLower;
    if (incNumbers?.checked) pool += charsNumbers;
    if (incSymbols?.checked) pool += charsSymbols;

    if (excAmbiguous?.checked) {
      pool = pool.replace(ambiguous, '');
    }

    if (!pool) {
      outputEl.value = 'Select at least one character set!';
      return;
    }

    const len = parseInt(lengthInput?.value || '16', 10);
    if (lengthVal) lengthVal.textContent = len;

    let pwd = '';
    const cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      const values = new Uint32Array(len);
      cryptoObj.getRandomValues(values);
      for (let i = 0; i < len; i++) {
        pwd += pool[values[i] % pool.length];
      }
    } else {
      for (let i = 0; i < len; i++) {
        pwd += pool[Math.floor(Math.random() * pool.length)];
      }
    }

    outputEl.value = pwd;
    updateStrength(pwd);
  };

  const updateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 14) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    let pct = (score / 5) * 100;
    let label = 'Weak';
    let color = 'bg-rose-500';

    if (score >= 4) {
      label = 'Very Strong';
      color = 'bg-emerald-500';
    } else if (score >= 3) {
      label = 'Strong';
      color = 'bg-teal-400';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-amber-400';
    }

    if (strengthBar) {
      strengthBar.style.width = pct + '%';
      strengthBar.className = `h-2 rounded-full transition-all duration-300 ${color}`;
    }
    if (strengthText) {
      strengthText.textContent = label;
    }
  };

  btnGenerate?.addEventListener('click', generatePassword);
  lengthInput?.addEventListener('input', generatePassword);
  [incUpper, incLower, incNumbers, incSymbols, excAmbiguous].forEach(el => el?.addEventListener('change', generatePassword));
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.value, 'Password copied!'));

  generatePassword();
}

/* 7. Hex Color Generator */
function initHexColorGenerator() {
  const container = document.getElementById('calc-hex-generator');
  if (!container) return;

  const hexInput = document.getElementById('hex-color-picker');
  const hexText = document.getElementById('hex-val');
  const rgbText = document.getElementById('hex-rgb-val');
  const hslText = document.getElementById('hex-hsl-val');
  const previewBox = document.getElementById('hex-preview');
  const btnRandom = document.getElementById('btn-hex-random');
  const btnCopyHex = document.getElementById('btn-copy-hex');
  const btnCopyRgb = document.getElementById('btn-copy-hex-rgb');

  const updateColor = (hex) => {
    hex = hex.toUpperCase();
    if (!hex.startsWith('#')) hex = '#' + hex;
    if (hexText) hexText.value = hex;
    if (hexInput) hexInput.value = hex;
    if (previewBox) previewBox.style.backgroundColor = hex;

    // Convert to RGB
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    if (rgbText) rgbText.textContent = `rgb(${r}, ${g}, ${b})`;

    // Convert to HSL
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }
    if (hslText) hslText.textContent = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const randomHex = () => {
    const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    updateColor(hex);
  };

  hexInput?.addEventListener('input', (e) => updateColor(e.target.value));
  hexText?.addEventListener('input', (e) => updateColor(e.target.value));
  btnRandom?.addEventListener('click', randomHex);
  btnCopyHex?.addEventListener('click', () => safeCopy(hexText.value, 'HEX color copied!'));
  btnCopyRgb?.addEventListener('click', () => safeCopy(rgbText.textContent, 'RGB color copied!'));

  randomHex();
}

/* 8. RGB Color Generator */
function initRGBColorGenerator() {
  const container = document.getElementById('calc-rgb-generator');
  if (!container) return;

  const rInput = document.getElementById('rgb-r');
  const gInput = document.getElementById('rgb-g');
  const bInput = document.getElementById('rgb-b');
  const aInput = document.getElementById('rgb-a');
  const rVal = document.getElementById('rgb-r-val');
  const gVal = document.getElementById('rgb-g-val');
  const bVal = document.getElementById('rgb-b-val');
  const aVal = document.getElementById('rgb-a-val');

  const rgbCode = document.getElementById('rgb-code');
  const hexCode = document.getElementById('rgb-hex-code');
  const previewBox = document.getElementById('rgb-preview');
  const btnCopyRgb = document.getElementById('btn-copy-rgb');
  const btnCopyHex = document.getElementById('btn-copy-rgb-hex');

  const update = () => {
    const r = parseInt(rInput?.value || '99', 10);
    const g = parseInt(gInput?.value || '102', 10);
    const b = parseInt(bInput?.value || '241', 10);
    const a = parseFloat(aInput?.value || '1');

    if (rVal) rVal.textContent = r;
    if (gVal) gVal.textContent = g;
    if (bVal) bVal.textContent = b;
    if (aVal) aVal.textContent = a.toFixed(2);

    const strRgb = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
    const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

    if (rgbCode) rgbCode.textContent = strRgb;
    if (hexCode) hexCode.textContent = hex.toUpperCase();
    if (previewBox) previewBox.style.backgroundColor = strRgb;
  };

  [rInput, gInput, bInput, aInput].forEach(el => el?.addEventListener('input', update));
  btnCopyRgb?.addEventListener('click', () => safeCopy(rgbCode.textContent, 'RGB code copied!'));
  btnCopyHex?.addEventListener('click', () => safeCopy(hexCode.textContent, 'HEX code copied!'));

  update();
}

/* 9. CSS Gradient Generator */
function initCSSGradientGenerator() {
  const container = document.getElementById('calc-css-gradient');
  if (!container) return;

  const typeInput = document.getElementById('grad-type');
  const angleInput = document.getElementById('grad-angle');
  const angleVal = document.getElementById('grad-angle-val');
  const color1Input = document.getElementById('grad-color1');
  const color2Input = document.getElementById('grad-color2');
  const previewBox = document.getElementById('grad-preview');
  const cssOutput = document.getElementById('grad-css-output');
  const btnCopy = document.getElementById('btn-copy-grad');

  const update = () => {
    const type = typeInput?.value || 'linear';
    const angle = angleInput?.value || '135';
    const c1 = color1Input?.value || '#6366F1';
    const c2 = color2Input?.value || '#a855f7';

    if (angleVal) angleVal.textContent = angle + '°';

    let gradCss = '';
    if (type === 'linear') {
      gradCss = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    } else if (type === 'radial') {
      gradCss = `radial-gradient(circle, ${c1}, ${c2})`;
    } else {
      gradCss = `conic-gradient(from ${angle}deg, ${c1}, ${c2})`;
    }

    const fullCss = `background: ${c1};\nbackground: ${gradCss};`;

    if (previewBox) previewBox.style.background = gradCss;
    if (cssOutput) cssOutput.textContent = fullCss;
  };

  [typeInput, angleInput, color1Input, color2Input].forEach(el => el?.addEventListener('input', update));
  btnCopy?.addEventListener('click', () => safeCopy(cssOutput.textContent, 'CSS Gradient copied!'));

  update();
}

/* 10. Box Shadow Generator */
function initBoxShadowGenerator() {
  const container = document.getElementById('calc-box-shadow');
  if (!container) return;

  const xInput = document.getElementById('shadow-x');
  const yInput = document.getElementById('shadow-y');
  const blurInput = document.getElementById('shadow-blur');
  const spreadInput = document.getElementById('shadow-spread');
  const colorInput = document.getElementById('shadow-color');
  const opacityInput = document.getElementById('shadow-opacity');
  const insetToggle = document.getElementById('shadow-inset');

  const xVal = document.getElementById('shadow-x-val');
  const yVal = document.getElementById('shadow-y-val');
  const blurVal = document.getElementById('shadow-blur-val');
  const spreadVal = document.getElementById('shadow-spread-val');

  const previewTarget = document.getElementById('shadow-preview-box');
  const cssOutput = document.getElementById('shadow-css-output');
  const btnCopy = document.getElementById('btn-copy-shadow');

  const hexToRgba = (hex, opacity) => {
    let r = parseInt(hex.slice(1, 3), 16) || 0;
    let g = parseInt(hex.slice(3, 5), 16) || 0;
    let b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const update = () => {
    const x = parseInt(xInput?.value || '0', 10);
    const y = parseInt(yInput?.value || '10', 10);
    const blur = parseInt(blurInput?.value || '25', 10);
    const spread = parseInt(spreadInput?.value || '-5', 10);
    const color = colorInput?.value || '#000000';
    const opacity = parseFloat(opacityInput?.value || '0.25');
    const inset = insetToggle?.checked ? 'inset ' : '';

    if (xVal) xVal.textContent = x + 'px';
    if (yVal) yVal.textContent = y + 'px';
    if (blurVal) blurVal.textContent = blur + 'px';
    if (spreadVal) spreadVal.textContent = spread + 'px';

    const rgba = hexToRgba(color, opacity);
    const shadowValue = `${inset}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;
    const fullCss = `box-shadow: ${shadowValue};\n-webkit-box-shadow: ${shadowValue};`;

    if (previewTarget) previewTarget.style.boxShadow = shadowValue;
    if (cssOutput) cssOutput.textContent = fullCss;
  };

  [xInput, yInput, blurInput, spreadInput, colorInput, opacityInput, insetToggle].forEach(el => el?.addEventListener('input', update));
  btnCopy?.addEventListener('click', () => safeCopy(cssOutput.textContent, 'Box Shadow CSS copied!'));

  update();
}

/* 11. CSS Transform Generator */
function initCSSTransformGenerator() {
  const container = document.getElementById('calc-css-transform');
  if (!container) return;

  const rotateInput = document.getElementById('tf-rotate');
  const scaleXInput = document.getElementById('tf-scale-x');
  const scaleYInput = document.getElementById('tf-scale-y');
  const translateXInput = document.getElementById('tf-translate-x');
  const translateYInput = document.getElementById('tf-translate-y');
  const skewXInput = document.getElementById('tf-skew-x');
  const skewYInput = document.getElementById('tf-skew-y');

  const previewBox = document.getElementById('tf-preview-box');
  const cssOutput = document.getElementById('tf-css-output');
  const btnCopy = document.getElementById('btn-copy-tf');

  const update = () => {
    const rot = parseInt(rotateInput?.value || '0', 10);
    const scX = parseFloat(scaleXInput?.value || '1');
    const scY = parseFloat(scaleYInput?.value || '1');
    const trX = parseInt(translateXInput?.value || '0', 10);
    const trY = parseInt(translateYInput?.value || '0', 10);
    const skX = parseInt(skewXInput?.value || '0', 10);
    const skY = parseInt(skewYInput?.value || '0', 10);

    const tfVal = `rotate(${rot}deg) scale(${scX}, ${scY}) translate(${trX}px, ${trY}px) skew(${skX}deg, ${skY}deg)`;
    const fullCss = `transform: ${tfVal};\n-webkit-transform: ${tfVal};`;

    if (previewBox) previewBox.style.transform = tfVal;
    if (cssOutput) cssOutput.textContent = fullCss;
  };

  [rotateInput, scaleXInput, scaleYInput, translateXInput, translateYInput, skewXInput, skewYInput].forEach(el => el?.addEventListener('input', update));
  btnCopy?.addEventListener('click', () => safeCopy(cssOutput.textContent, 'Transform CSS copied!'));

  update();
}

/* 12. HTML Button Generator */
function initHTMLButtonGenerator() {
  const container = document.getElementById('calc-html-button');
  if (!container) return;

  const textInput = document.getElementById('btn-gen-text');
  const bgColorInput = document.getElementById('btn-gen-bg');
  const textColorInput = document.getElementById('btn-gen-color');
  const radiusInput = document.getElementById('btn-gen-radius');
  const paddingXInput = document.getElementById('btn-gen-px');
  const paddingYInput = document.getElementById('btn-gen-py');
  const fontSizeInput = document.getElementById('btn-gen-size');

  const previewTarget = document.getElementById('btn-gen-preview');
  const htmlOutput = document.getElementById('btn-gen-html-code');
  const cssOutput = document.getElementById('btn-gen-css-code');
  const btnCopyHtml = document.getElementById('btn-copy-btn-html');
  const btnCopyCss = document.getElementById('btn-copy-btn-css');

  const update = () => {
    const text = textInput?.value || 'Click Me';
    const bg = bgColorInput?.value || '#6366F1';
    const color = textColorInput?.value || '#ffffff';
    const radius = radiusInput?.value || '12';
    const px = paddingXInput?.value || '24';
    const py = paddingYInput?.value || '12';
    const size = fontSizeInput?.value || '14';

    const css = `.custom-btn {\n  background-color: ${bg};\n  color: ${color};\n  padding: ${py}px ${px}px;\n  border-radius: ${radius}px;\n  font-size: ${size}px;\n  font-weight: 600;\n  border: none;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}`;
    const html = `<button class="custom-btn">${text}</button>`;

    if (previewTarget) {
      previewTarget.textContent = text;
      previewTarget.style.backgroundColor = bg;
      previewTarget.style.color = color;
      previewTarget.style.borderRadius = `${radius}px`;
      previewTarget.style.padding = `${py}px ${px}px`;
      previewTarget.style.fontSize = `${size}px`;
    }

    if (htmlOutput) htmlOutput.textContent = html;
    if (cssOutput) cssOutput.textContent = css;
  };

  [textInput, bgColorInput, textColorInput, radiusInput, paddingXInput, paddingYInput, fontSizeInput].forEach(el => el?.addEventListener('input', update));
  btnCopyHtml?.addEventListener('click', () => safeCopy(htmlOutput.textContent, 'HTML code copied!'));
  btnCopyCss?.addEventListener('click', () => safeCopy(cssOutput.textContent, 'CSS code copied!'));

  update();
}

/* 13. CSS Animation Generator */
function initCSSAnimationGenerator() {
  const container = document.getElementById('calc-css-animation');
  if (!container) return;

  const animTypeSelect = document.getElementById('anim-type');
  const durationInput = document.getElementById('anim-duration');
  const durationVal = document.getElementById('anim-duration-val');
  const previewTarget = document.getElementById('anim-preview-box');
  const cssOutput = document.getElementById('anim-css-output');
  const btnCopy = document.getElementById('btn-copy-anim');

  const animations = {
    pulse: `@keyframes pulse {\n  0%, 100% { transform: scale(1); }\n  50% { transform: scale(1.15); }\n}`,
    bounce: `@keyframes bounce {\n  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }\n  40% { transform: translateY(-30px); }\n  60% { transform: translateY(-15px); }\n}`,
    spin: `@keyframes spin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}`,
    flip: `@keyframes flip {\n  0% { transform: perspective(400px) rotateY(0); }\n  100% { transform: perspective(400px) rotateY(360deg); }\n}`
  };

  const update = () => {
    const type = animTypeSelect?.value || 'pulse';
    const dur = parseFloat(durationInput?.value || '1.5');
    if (durationVal) durationVal.textContent = dur + 's';

    const keyframes = animations[type] || animations.pulse;
    const rule = `.animated-element {\n  animation: ${type} ${dur}s infinite ease-in-out;\n}\n\n${keyframes}`;

    if (cssOutput) cssOutput.textContent = rule;

    // Apply animation dynamically
    let styleTag = document.getElementById('dc-dynamic-anim-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dc-dynamic-anim-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `${keyframes}\n#anim-preview-box { animation: ${type} ${dur}s infinite ease-in-out; }`;
  };

  [animTypeSelect, durationInput].forEach(el => el?.addEventListener('input', update));
  btnCopy?.addEventListener('click', () => safeCopy(cssOutput.textContent, 'Animation CSS copied!'));

  update();
}

/* 14. Dummy JSON Generator */
function initDummyJSONGenerator() {
  const container = document.getElementById('calc-dummy-json');
  if (!container) return;

  const schemaSelect = document.getElementById('dummy-schema');
  const countInput = document.getElementById('dummy-count');
  const outputEl = document.getElementById('dummy-output');
  const btnGenerate = document.getElementById('btn-dummy-generate');
  const btnCopy = document.getElementById('btn-copy-dummy');
  const btnDownload = document.getElementById('btn-download-dummy');

  const names = ['Alex Rivera', 'Sarah Chen', 'Michael Scott', 'Emma Watson', 'David Miller', 'Sophia Lin'];
  const cities = ['New York', 'London', 'Tokyo', 'Berlin', 'San Francisco', 'Paris'];
  const products = ['Wireless Earbuds', 'Ergonomic Desk Chair', 'Mechanical Keyboard', '4K Monitor', 'Smart Watch'];
  const categories = ['Electronics', 'Furniture', 'Accessories', 'Software'];

  const generateData = () => {
    const schema = schemaSelect?.value || 'users';
    const count = Math.min(50, Math.max(1, parseInt(countInput?.value || '5', 10)));
    const list = [];

    for (let i = 1; i <= count; i++) {
      if (schema === 'users') {
        const name = names[(i - 1) % names.length];
        list.push({
          id: i,
          name: name,
          email: name.toLowerCase().replace(' ', '.') + '@example.com',
          role: i === 1 ? 'Admin' : 'User',
          city: cities[(i - 1) % cities.length],
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        });
      } else if (schema === 'products') {
        list.push({
          id: 1000 + i,
          title: products[(i - 1) % products.length],
          price: parseFloat((Math.random() * 200 + 19).toFixed(2)),
          category: categories[(i - 1) % categories.length],
          inStock: i % 2 === 0,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1))
        });
      } else {
        list.push({
          id: i,
          title: `Sample Blog Post ${i}`,
          slug: `sample-blog-post-${i}`,
          views: Math.floor(Math.random() * 5000) + 100,
          published: true
        });
      }
    }

    const jsonStr = JSON.stringify(list, null, 2);
    if (outputEl) outputEl.textContent = jsonStr;
  };

  btnGenerate?.addEventListener('click', generateData);
  [schemaSelect, countInput].forEach(el => el?.addEventListener('change', generateData));
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'Dummy JSON copied!'));
  btnDownload?.addEventListener('click', () => downloadFile('dummy_data.json', outputEl.textContent, 'application/json'));

  generateData();
}
