/**
 * Developer Tools Extra Engines:
 * - JWT Token Decoder & Inspector
 * - Cron Schedule Generator & Humanizer
 * - Markdown to HTML Live Editor
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────────────────
  // 1. JWT TOKEN DECODER & INSPECTOR
  // ─────────────────────────────────────────────────────────────────
  const jwtInput = document.getElementById('jwt-input');
  if (jwtInput) {
    const jwtStatusBadge = document.getElementById('jwt-status-badge');
    const jwtStatAlg = document.getElementById('jwt-stat-alg');
    const jwtStatExp = document.getElementById('jwt-stat-exp');
    const jwtHeaderOutput = document.getElementById('jwt-header-output');
    const jwtPayloadOutput = document.getElementById('jwt-payload-output');
    const btnSample = document.getElementById('btn-jwt-sample');
    const btnClear = document.getElementById('btn-jwt-clear');
    const btnCopyHeader = document.getElementById('btn-copy-jwt-header');
    const btnCopyPayload = document.getElementById('btn-copy-jwt-payload');

    const base64UrlDecode = (str) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    };

    const parseJwt = () => {
      const raw = jwtInput.value.trim();
      if (!raw) {
        if (jwtStatusBadge) {
          jwtStatusBadge.textContent = 'Awaiting Token';
          jwtStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
        }
        if (jwtStatAlg) jwtStatAlg.textContent = 'None';
        if (jwtStatExp) jwtStatExp.textContent = 'N/A';
        if (jwtHeaderOutput) jwtHeaderOutput.textContent = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
        if (jwtPayloadOutput) jwtPayloadOutput.textContent = '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}';
        return;
      }

      const parts = raw.split('.');
      if (parts.length < 2) {
        if (jwtStatusBadge) {
          jwtStatusBadge.textContent = '⚠️ INVALID JWT FORMAT';
          jwtStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400';
        }
        return;
      }

      try {
        const headerJson = JSON.parse(base64UrlDecode(parts[0]));
        const payloadJson = JSON.parse(base64UrlDecode(parts[1]));

        if (jwtHeaderOutput) jwtHeaderOutput.textContent = JSON.stringify(headerJson, null, 2);
        if (jwtPayloadOutput) jwtPayloadOutput.textContent = JSON.stringify(payloadJson, null, 2);

        if (jwtStatAlg) jwtStatAlg.textContent = headerJson.alg || 'Unknown';

        if (payloadJson.exp) {
          const expDate = new Date(payloadJson.exp * 1000);
          const now = Date.now();
          const isExpired = now > (payloadJson.exp * 1000);

          if (jwtStatExp) jwtStatExp.textContent = expDate.toLocaleString();

          if (jwtStatusBadge) {
            if (isExpired) {
              jwtStatusBadge.textContent = '⚠️ TOKEN EXPIRED';
              jwtStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400';
            } else {
              jwtStatusBadge.textContent = '✅ ACTIVE (VALID UNTIL ' + expDate.toLocaleTimeString() + ')';
              jwtStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400';
            }
          }
        } else {
          if (jwtStatExp) jwtStatExp.textContent = 'No Expiration (exp) Claim';
          if (jwtStatusBadge) {
            jwtStatusBadge.textContent = 'ℹ️ VALID (NO EXPIRATION)';
            jwtStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-400';
          }
        }
      } catch (err) {
        if (jwtStatusBadge) {
          jwtStatusBadge.textContent = '⚠️ BASE64 DECODE ERROR';
          jwtStatusBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400';
        }
      }
    };

    jwtInput.addEventListener('input', parseJwt);

    if (btnSample) {
      btnSample.addEventListener('click', () => {
        // Sample token with 24h future expiration
        const futureExp = Math.floor(Date.now() / 1000) + 86400;
        const h = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
        const p = btoa(JSON.stringify({ sub: 'user_98472', name: 'Alex Johnson', role: 'admin', exp: futureExp, iat: Math.floor(Date.now() / 1000) })).replace(/=/g, '');
        jwtInput.value = h + '.' + p + '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        parseJwt();
      });
    }

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        jwtInput.value = '';
        parseJwt();
      });
    }

    if (btnCopyHeader) {
      btnCopyHeader.addEventListener('click', () => {
        safeCopy(jwtHeaderOutput.textContent, 'JWT Header copied to clipboard!');
      });
    }
    if (btnCopyPayload) {
      btnCopyPayload.addEventListener('click', () => {
        safeCopy(jwtPayloadOutput.textContent, 'JWT Payload copied to clipboard!');
      });
    }

    parseJwt();
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. CRON SCHEDULE GENERATOR & HUMANIZER
  // ─────────────────────────────────────────────────────────────────
  const cronInput = document.getElementById('cron-expression-input');
  if (cronInput) {
    const cronDesc = document.getElementById('cron-human-desc');
    const upcomingList = document.getElementById('cron-upcoming-list');
    const btnCopy = document.getElementById('btn-cron-copy');

    const fMin = document.getElementById('cron-f-min');
    const fHour = document.getElementById('cron-f-hour');
    const fDom = document.getElementById('cron-f-dom');
    const fMonth = document.getElementById('cron-f-month');
    const fDow = document.getElementById('cron-f-dow');

    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const humanizeCron = (min, hour, dom, month, dow) => {
      let desc = 'At ';

      // Time
      if (min === '*' && hour === '*') {
        desc = 'Every minute';
      } else if (min.startsWith('*/')) {
        desc = `Every ${min.slice(2)} minutes`;
      } else if (hour === '*' && min !== '*') {
        desc = `At minute ${min} past every hour`;
      } else {
        const h = parseInt(hour, 10);
        const m = parseInt(min, 10) || 0;
        if (!isNaN(h)) {
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h % 12 || 12;
          const mStr = m < 10 ? '0' + m : m;
          desc += `${h12}:${mStr} ${ampm}`;
        } else {
          desc += `minute ${min} of hour ${hour}`;
        }
      }

      // Day of Month / Month
      if (dom !== '*') {
        desc += `, on day ${dom} of the month`;
      }
      if (month !== '*') {
        const mIdx = parseInt(month, 10);
        desc += ` in ${MONTH_NAMES[mIdx] || month}`;
      }

      // Day of Week
      if (dow !== '*') {
        if (dow === '1-5') {
          desc += `, Monday through Friday`;
        } else if (dow === '0,6' || dow === '6,0') {
          desc += `, on Saturday and Sunday`;
        } else {
          const days = dow.split(',').map(d => DAY_NAMES[parseInt(d, 10)] || d).join(', ');
          desc += `, only on ${days}`;
        }
      }

      return desc;
    };

    const updateUpcoming = () => {
      if (!upcomingList) return;
      const now = new Date();
      let html = '';
      for (let i = 1; i <= 5; i++) {
        const next = new Date(now.getTime() + (i * 86400000));
        next.setHours(9, 0, 0, 0);
        html += `<div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span>Run #${i}: <strong>${next.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
          <span class="text-slate-400 font-mono">${next.toLocaleTimeString('en-US')}</span>
        </div>`;
      }
      upcomingList.innerHTML = html;
    };

    const updateFromSubfields = () => {
      const min = fMin ? fMin.value.trim() || '*' : '*';
      const hour = fHour ? fHour.value.trim() || '*' : '*';
      const dom = fDom ? fDom.value.trim() || '*' : '*';
      const month = fMonth ? fMonth.value.trim() || '*' : '*';
      const dow = fDow ? fDow.value.trim() || '*' : '*';

      const exp = `${min} ${hour} ${dom} ${month} ${dow}`;
      cronInput.value = exp;
      if (cronDesc) cronDesc.textContent = `“${humanizeCron(min, hour, dom, month, dow)}”`;
      updateUpcoming();
    };

    const updateFromMainInput = () => {
      const parts = cronInput.value.trim().split(/\s+/);
      if (parts.length === 5) {
        if (fMin) fMin.value = parts[0];
        if (fHour) fHour.value = parts[1];
        if (fDom) fDom.value = parts[2];
        if (fMonth) fMonth.value = parts[3];
        if (fDow) fDow.value = parts[4];
        if (cronDesc) cronDesc.textContent = `“${humanizeCron(parts[0], parts[1], parts[2], parts[3], parts[4])}”`;
        updateUpcoming();
      }
    };

    [fMin, fHour, fDom, fMonth, fDow].forEach(el => {
      if (el) el.addEventListener('input', updateFromSubfields);
    });
    cronInput.addEventListener('input', updateFromMainInput);

    // Preset buttons
    document.querySelectorAll('.btn-cron-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-cron');
        if (val) {
          cronInput.value = val;
          updateFromMainInput();
        }
      });
    });

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(cronInput.value).then(() => {
          const orig = btnCopy.textContent;
          btnCopy.textContent = '✅ Copied!';
          setTimeout(() => { btnCopy.textContent = orig; }, 1800);
        });
      });
    }

    updateFromMainInput();
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. MARKDOWN TO HTML LIVE EDITOR
  // ─────────────────────────────────────────────────────────────────
  const mdInput = document.getElementById('md-input');
  if (mdInput) {
    const mdPreviewPane = document.getElementById('md-preview-pane');
    const mdRawHtmlPane = document.getElementById('md-raw-html-pane');
    const mdToggleRaw = document.getElementById('md-toggle-raw');
    const btnCopyHtml = document.getElementById('btn-md-copy-html');
    const btnDownloadHtml = document.getElementById('btn-md-download-html');

    const parseMarkdown = (md) => {
      let html = md
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Code blocks
        .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-3 font-mono text-xs"><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[#6366F1] font-mono text-xs">$1</code>')
        // Headings
        .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-slate-900 dark:text-white mt-6 mb-3">$1</h1>')
        // Blockquotes
        .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-[#6366F1] pl-4 italic text-slate-600 dark:text-slate-400 my-3">$1</blockquote>')
        // Bold & Italic
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-[#6366F1] underline hover:text-[#5457E5] font-semibold">$1</a>')
        // Unordered lists
        .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        // Horizontal rule
        .replace(/^---$/gim, '<hr class="my-4 border-slate-200 dark:border-slate-800" />')
        // Paragraphs
        .replace(/\n\n+/g, '</p><p class="my-2 leading-relaxed">');

      return '<p class="my-2 leading-relaxed">' + html + '</p>';
    };

    const updateMarkdown = () => {
      const md = mdInput.value;
      const html = parseMarkdown(md);
      if (mdPreviewPane) mdPreviewPane.innerHTML = html;
      if (mdRawHtmlPane) mdRawHtmlPane.value = html;
    };

    mdInput.addEventListener('input', updateMarkdown);

    // Toolbar buttons
    document.querySelectorAll('.btn-md-action').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-md-action');
        const start = mdInput.selectionStart;
        const end = mdInput.selectionEnd;
        const sel = mdInput.value.substring(start, end);
        let replacement = '';

        switch (action) {
          case 'bold': replacement = `**${sel || 'bold text'}**`; break;
          case 'italic': replacement = `*${sel || 'italic text'}*`; break;
          case 'h1': replacement = `# ${sel || 'Heading 1'}`; break;
          case 'h2': replacement = `## ${sel || 'Heading 2'}`; break;
          case 'link': replacement = `[${sel || 'link text'}](https://example.com)`; break;
          case 'code': replacement = `\`${sel || 'code'}\``; break;
          case 'list': replacement = `- ${sel || 'List item'}`; break;
        }

        mdInput.setRangeText(replacement, start, end, 'end');
        updateMarkdown();
        mdInput.focus();
      });
    });

    if (mdToggleRaw) {
      let showingRaw = false;
      mdToggleRaw.addEventListener('click', () => {
        showingRaw = !showingRaw;
        if (showingRaw) {
          mdPreviewPane.classList.add('hidden');
          mdRawHtmlPane.classList.remove('hidden');
          mdToggleRaw.textContent = 'View Visual Preview';
        } else {
          mdRawHtmlPane.classList.add('hidden');
          mdPreviewPane.classList.remove('hidden');
          mdToggleRaw.textContent = 'View Raw HTML';
        }
      });
    }

    if (btnCopyHtml) {
      btnCopyHtml.addEventListener('click', () => {
        navigator.clipboard.writeText(mdRawHtmlPane.value).then(() => {
          const orig = btnCopyHtml.textContent;
          btnCopyHtml.textContent = '✅ Copied!';
          setTimeout(() => { btnCopyHtml.textContent = orig; }, 1800);
        });
      });
    }

    if (btnDownloadHtml) {
      btnDownloadHtml.addEventListener('click', () => {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Exported Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
${mdRawHtmlPane.value}
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'document.html';
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Default sample markdown
    mdInput.value = `# Welcome to Markdown Editor

Transform your ideas into **clean**, *semantic* HTML markup instantly.

## Key Highlights
- ⚡ 100% Client-side compilation
- 🎨 Real-time split-screen preview
- 💾 One-click HTML export

> "Good design is as little design as possible." — Dieter Rams

Check out our [Documentation](https://example.com) for more details.`;

    updateMarkdown();
  }
});
