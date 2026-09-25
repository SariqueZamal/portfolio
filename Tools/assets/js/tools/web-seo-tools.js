/* ==========================================================================
   DigitalCron Tools - Web & SEO Tools Suite JavaScript Engine
   Supports: Keyword Density Checker, Robots.txt Generator, XML Sitemap Generator,
   Open Graph Generator, UTM Builder, Meta Length Checker, URL Encoder/Decoder,
   and .htaccess Redirect Generator.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initWebSEOTools();
});

function initWebSEOTools() {
  initKeywordDensityChecker();
  initRobotsTxtGenerator();
  initXMLSitemapGenerator();
  initOpenGraphGenerator();
  initUTMBuilder();
  initMetaLengthChecker();
  initURLEncoderDecoder();
  initHtaccessGenerator();
}

/* Helpers */
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

/* 1. Keyword Density Checker */
function initKeywordDensityChecker() {
  const container = document.getElementById('calc-keyword-density');
  if (!container) return;

  const inputEl = document.getElementById('kd-input');
  const totalWordsEl = document.getElementById('kd-total-words');
  const uniqueWordsEl = document.getElementById('kd-unique-words');
  const resultsTable = document.getElementById('kd-results-table');
  const btnAnalyze = document.getElementById('btn-kd-analyze');

  const stopWords = new Set(['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me']);

  const analyzeText = () => {
    const text = inputEl.value.toLowerCase().replace(/[^\w\s]/g, ' ');
    const words = text.split(/\s+/).filter(w => w.length > 1);
    
    if (words.length === 0) {
      if (totalWordsEl) totalWordsEl.textContent = '0';
      if (uniqueWordsEl) uniqueWordsEl.textContent = '0';
      if (resultsTable) resultsTable.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-slate-500">No words found</td></tr>`;
      return;
    }

    const freq = {};
    words.forEach(w => {
      if (!stopWords.has(w)) {
        freq[w] = (freq[w] || 0) + 1;
      }
    });

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const totalWords = words.length;
    const uniqueCount = Object.keys(freq).length;

    if (totalWordsEl) totalWordsEl.textContent = totalWords.toLocaleString();
    if (uniqueWordsEl) uniqueWordsEl.textContent = uniqueCount.toLocaleString();

    if (resultsTable) {
      resultsTable.innerHTML = sorted.map(([word, count]) => {
        const density = ((count / totalWords) * 100).toFixed(2);
        const isWarning = density > 3.5;
        return `
          <tr class="border-b border-slate-200 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-900/50">
            <td class="p-3 font-bold text-slate-900 dark:text-white font-mono">${word}</td>
            <td class="p-3 text-center text-slate-600 dark:text-slate-400 font-mono">${count}</td>
            <td class="p-3 text-right font-bold font-mono ${isWarning ? 'text-rose-500' : 'text-emerald-500'}">
              ${density}% ${isWarning ? '(Stuffing Warning)' : ''}
            </td>
          </tr>
        `;
      }).join('');
    }
  };

  inputEl?.addEventListener('input', analyzeText);
  btnAnalyze?.addEventListener('click', analyzeText);
  analyzeText();
}

/* 2. Robots.txt Generator */
function initRobotsTxtGenerator() {
  const container = document.getElementById('calc-robots-txt');
  if (!container) return;

  const accessSelect = document.getElementById('robots-access');
  const delayInput = document.getElementById('robots-delay');
  const sitemapInput = document.getElementById('robots-sitemap');
  const disallowInput = document.getElementById('robots-disallow');
  const outputEl = document.getElementById('robots-output');
  const btnGenerate = document.getElementById('btn-robots-generate');
  const btnCopy = document.getElementById('btn-copy-robots');
  const btnDownload = document.getElementById('btn-download-robots');

  const generate = () => {
    const access = accessSelect?.value || 'allow';
    const delay = delayInput?.value.trim();
    const sitemap = sitemapInput?.value.trim();
    const paths = (disallowInput?.value || '').split('\n').map(p => p.trim()).filter(Boolean);

    let lines = ['User-agent: *'];
    if (access === 'disallow_all') {
      lines.push('Disallow: /');
    } else {
      lines.push('Allow: /');
      paths.forEach(p => lines.push(`Disallow: ${p.startsWith('/') ? p : '/' + p}`));
    }

    if (delay) lines.push(`Crawl-delay: ${delay}`);
    if (sitemap) lines.push(`\nSitemap: ${sitemap}`);

    const result = lines.join('\n');
    if (outputEl) outputEl.textContent = result;
  };

  [accessSelect, delayInput, sitemapInput, disallowInput].forEach(el => el?.addEventListener('input', generate));
  btnGenerate?.addEventListener('click', generate);
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'robots.txt copied!'));
  btnDownload?.addEventListener('click', () => downloadFile('robots.txt', outputEl.textContent, 'text/plain'));

  generate();
}

/* 3. XML Sitemap Generator */
function initXMLSitemapGenerator() {
  const container = document.getElementById('calc-xml-sitemap');
  if (!container) return;

  const urlsInput = document.getElementById('sitemap-urls');
  const freqSelect = document.getElementById('sitemap-freq');
  const prioritySelect = document.getElementById('sitemap-priority');
  const outputEl = document.getElementById('sitemap-output');
  const btnGenerate = document.getElementById('btn-sitemap-generate');
  const btnCopy = document.getElementById('btn-copy-sitemap');
  const btnDownload = document.getElementById('btn-download-sitemap');

  const generate = () => {
    const urls = (urlsInput?.value || '').split('\n').map(u => u.trim()).filter(Boolean);
    const freq = freqSelect?.value || 'weekly';
    const priority = prioritySelect?.value || '0.8';
    const today = new Date().toISOString().split('T')[0];

    const xmlUrls = urls.map(url => {
      const cleanUrl = url.startsWith('http') ? url : 'https://' + url;
      return `  <url>\n    <loc>${cleanUrl}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`;
    if (outputEl) outputEl.textContent = xml;
  };

  [urlsInput, freqSelect, prioritySelect].forEach(el => el?.addEventListener('input', generate));
  btnGenerate?.addEventListener('click', generate);
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'sitemap.xml copied!'));
  btnDownload?.addEventListener('click', () => downloadFile('sitemap.xml', outputEl.textContent, 'application/xml'));

  generate();
}

/* 4. Open Graph Generator */
function initOpenGraphGenerator() {
  const container = document.getElementById('calc-open-graph');
  if (!container) return;

  const titleInput = document.getElementById('og-title');
  const descInput = document.getElementById('og-desc');
  const urlInput = document.getElementById('og-url');
  const imageInput = document.getElementById('og-image');
  const siteNameInput = document.getElementById('og-site-name');
  const typeSelect = document.getElementById('og-type');

  const outputEl = document.getElementById('og-output');
  const previewTitle = document.getElementById('og-preview-title');
  const previewDesc = document.getElementById('og-preview-desc');
  const previewUrl = document.getElementById('og-preview-url');
  const btnCopy = document.getElementById('btn-copy-og');

  const update = () => {
    const title = titleInput?.value || 'Digital Cron Tools';
    const desc = descInput?.value || 'Free online web and developer tools platform.';
    const url = urlInput?.value || 'https://tools.digitalcron.com/';
    const image = imageInput?.value || 'https://tools.digitalcron.com/assets/og-cover.png';
    const siteName = siteNameInput?.value || 'Digital Cron';
    const type = typeSelect?.value || 'website';

    if (previewTitle) previewTitle.textContent = title;
    if (previewDesc) previewDesc.textContent = desc;
    if (previewUrl) previewUrl.textContent = url.replace(/^https?:\/\//, '');

    const tags = `<!-- HTML Meta Tags -->\n<title>${title}</title>\n<meta name="description" content="${desc}" />\n\n<!-- Facebook Meta Tags -->\n<meta property="og:url" content="${url}" />\n<meta property="og:type" content="${type}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${desc}" />\n<meta property="og:image" content="${image}" />\n<meta property="og:site_name" content="${siteName}" />\n\n<!-- Twitter Meta Tags -->\n<meta name="twitter:card" content="summary_large_image" />\n<meta property="twitter:domain" content="${url.replace(/^https?:\/\//, '').split('/')[0]}" />\n<meta property="twitter:url" content="${url}" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${desc}" />\n<meta name="twitter:image" content="${image}" />`;

    if (outputEl) outputEl.textContent = tags;
  };

  [titleInput, descInput, urlInput, imageInput, siteNameInput, typeSelect].forEach(el => el?.addEventListener('input', update));
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, 'Open Graph meta tags copied!'));

  update();
}

/* 5. UTM Campaign Builder */
function initUTMBuilder() {
  const container = document.getElementById('calc-utm-builder');
  if (!container) return;

  const urlInput = document.getElementById('utm-url');
  const sourceInput = document.getElementById('utm-source');
  const mediumInput = document.getElementById('utm-medium');
  const campaignInput = document.getElementById('utm-campaign');
  const termInput = document.getElementById('utm-term');
  const contentInput = document.getElementById('utm-content');
  const outputEl = document.getElementById('utm-output');
  const btnCopy = document.getElementById('btn-copy-utm');

  const update = () => {
    let baseUrl = (urlInput?.value || '').trim();
    if (!baseUrl) {
      if (outputEl) outputEl.value = 'Please enter a valid target URL';
      return;
    }
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }

    const params = new URLSearchParams();
    if (sourceInput?.value.trim()) params.append('utm_source', sourceInput.value.trim());
    if (mediumInput?.value.trim()) params.append('utm_medium', mediumInput.value.trim());
    if (campaignInput?.value.trim()) params.append('utm_campaign', campaignInput.value.trim());
    if (termInput?.value.trim()) params.append('utm_term', termInput.value.trim());
    if (contentInput?.value.trim()) params.append('utm_content', contentInput.value.trim());

    const queryString = params.toString();
    const finalUrl = queryString ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${queryString}` : baseUrl;

    if (outputEl) outputEl.value = finalUrl;
  };

  [urlInput, sourceInput, mediumInput, campaignInput, termInput, contentInput].forEach(el => el?.addEventListener('input', update));
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.value, 'UTM URL copied!'));

  update();
}

/* 6. Meta Length Checker */
function initMetaLengthChecker() {
  const container = document.getElementById('calc-meta-length');
  if (!container) return;

  const titleInput = document.getElementById('ml-title');
  const descInput = document.getElementById('ml-desc');
  const titleCount = document.getElementById('ml-title-count');
  const descCount = document.getElementById('ml-desc-count');
  const serpTitle = document.getElementById('serp-title');
  const serpDesc = document.getElementById('serp-desc');

  const update = () => {
    const title = titleInput?.value || '';
    const desc = descInput?.value || '';

    if (titleCount) {
      titleCount.textContent = `${title.length} / 60 Chars (${Math.round(title.length * 9.5)}px)`;
      titleCount.className = `text-xs font-mono font-bold ${title.length > 60 ? 'text-rose-500' : 'text-emerald-500'}`;
    }

    if (descCount) {
      descCount.textContent = `${desc.length} / 160 Chars (${Math.round(desc.length * 6)}px)`;
      descCount.className = `text-xs font-mono font-bold ${desc.length > 160 ? 'text-rose-500' : 'text-emerald-500'}`;
    }

    if (serpTitle) serpTitle.textContent = title || 'Your Page Meta Title Will Appear Here';
    if (serpDesc) serpDesc.textContent = desc || 'Your meta description text will be truncated around 160 characters in Google Search result snippets.';
  };

  [titleInput, descInput].forEach(el => el?.addEventListener('input', update));
  update();
}

/* 7. URL Encoder / Decoder */
function initURLEncoderDecoder() {
  const container = document.getElementById('calc-url-encoder');
  if (!container) return;

  const inputEl = document.getElementById('url-enc-input');
  const outputEl = document.getElementById('url-enc-output');
  const btnEncode = document.getElementById('btn-url-encode');
  const btnDecode = document.getElementById('btn-url-decode');
  const btnCopy = document.getElementById('btn-copy-url-enc');

  btnEncode?.addEventListener('click', () => {
    try {
      outputEl.value = encodeURIComponent(inputEl.value);
    } catch (e) {
      outputEl.value = 'Encoding Error: ' + e.message;
    }
  });

  btnDecode?.addEventListener('click', () => {
    try {
      outputEl.value = decodeURIComponent(inputEl.value);
    } catch (e) {
      outputEl.value = 'Decoding Error: ' + e.message;
    }
  });

  btnCopy?.addEventListener('click', () => safeCopy(outputEl.value, 'Result copied!'));
}

/* 8. HTACCESS Redirect Generator */
function initHtaccessGenerator() {
  const container = document.getElementById('calc-htaccess-generator');
  if (!container) return;

  const typeSelect = document.getElementById('ht-type');
  const forceHttps = document.getElementById('ht-https');
  const oldUrlInput = document.getElementById('ht-old-url');
  const newUrlInput = document.getElementById('ht-new-url');
  const outputEl = document.getElementById('ht-output');
  const btnGenerate = document.getElementById('btn-ht-generate');
  const btnCopy = document.getElementById('btn-copy-ht');
  const btnDownload = document.getElementById('btn-download-ht');

  const generate = () => {
    const type = typeSelect?.value || '301';
    const oldPath = oldUrlInput?.value.trim() || '/old-page.html';
    const newPath = newUrlInput?.value.trim() || '/new-page.html';

    let lines = ['# Generated by Digital Cron .htaccess Engine', 'RewriteEngine On'];

    if (forceHttps?.checked) {
      lines.push('\n# Force HTTPS');
      lines.push('RewriteCond %{HTTPS} off');
      lines.push('RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
    }

    lines.push(`\n# Page Redirect (${type})`);
    lines.push(`Redirect ${type} ${oldPath} ${newPath}`);

    const result = lines.join('\n');
    if (outputEl) outputEl.textContent = result;
  };

  [typeSelect, forceHttps, oldUrlInput, newUrlInput].forEach(el => el?.addEventListener('input', generate));
  btnGenerate?.addEventListener('click', generate);
  btnCopy?.addEventListener('click', () => safeCopy(outputEl.textContent, '.htaccess rules copied!'));
  btnDownload?.addEventListener('click', () => downloadFile('.htaccess', outputEl.textContent, 'text/plain'));

  generate();
}
