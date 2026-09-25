/**
 * Web & SEO Tools Extra Engines:
 * - Google SERP Snippet Simulator
 * - HTTP Status Code Explorer & Inspector
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────────────────
  // 1. GOOGLE SERP SNIPPET SIMULATOR
  // ─────────────────────────────────────────────────────────────────
  const serpTitle = document.getElementById('serp-title');
  if (serpTitle) {
    const serpDesc = document.getElementById('serp-desc');
    const serpUrl = document.getElementById('serp-url');
    const toggleDate = document.getElementById('serp-toggle-date');
    const toggleRating = document.getElementById('serp-toggle-rating');

    const titleCounter = document.getElementById('serp-title-counter');
    const titleMeter = document.getElementById('serp-title-meter');
    const descCounter = document.getElementById('serp-desc-counter');
    const descMeter = document.getElementById('serp-desc-meter');

    const prevContainer = document.getElementById('serp-preview-container');
    const prevDomain = document.getElementById('serp-prev-domain');
    const prevPath = document.getElementById('serp-prev-path');
    const prevTitle = document.getElementById('serp-prev-title');
    const prevRating = document.getElementById('serp-prev-rating');
    const prevDate = document.getElementById('serp-prev-date');
    const prevDescText = document.getElementById('serp-prev-desc-text');

    const btnDesktop = document.getElementById('serp-view-desktop');
    const btnMobile = document.getElementById('serp-view-mobile');

    // Canvas for approximate pixel measurement (Arial 20px for Google desktop titles)
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = '20px Arial, sans-serif';

    const updateSerp = () => {
      const title = serpTitle.value || 'Page Title';
      const desc = serpDesc.value || 'Meta description text...';
      const urlStr = serpUrl.value || 'https://example.com';

      // Parse domain & path
      try {
        const u = new URL(urlStr);
        if (prevDomain) prevDomain.textContent = u.hostname;
        const p = u.pathname.replace(/^\/|\/$/g, '').replace(/\//g, ' › ');
        if (prevPath) prevPath.textContent = p || 'home';
      } catch (e) {
        if (prevDomain) prevDomain.textContent = 'example.com';
        if (prevPath) prevPath.textContent = 'page';
      }

      // Title pixel measurement (Google cuts off at ~600px desktop)
      const pxWidth = Math.round(measureCtx.measureText(title).width);
      const titleChars = title.length;
      if (titleCounter) titleCounter.textContent = `${titleChars} / 60 chars (${pxWidth}px / 600px)`;

      const titlePct = Math.min(100, (pxWidth / 600) * 100);
      if (titleMeter) {
        titleMeter.style.width = titlePct + '%';
        titleMeter.className = pxWidth > 600 ? 'bg-rose-500 h-full transition-all' : (pxWidth > 540 ? 'bg-amber-500 h-full transition-all' : 'bg-emerald-500 h-full transition-all');
      }

      // Truncate title in preview if > 600px
      if (prevTitle) {
        if (pxWidth > 600) {
          prevTitle.textContent = title.slice(0, 56) + '...';
        } else {
          prevTitle.textContent = title;
        }
      }

      // Description counter (cut off at ~160 chars)
      const descChars = desc.length;
      if (descCounter) descCounter.textContent = `${descChars} / 160 chars`;
      const descPct = Math.min(100, (descChars / 160) * 100);
      if (descMeter) {
        descMeter.style.width = descPct + '%';
        descMeter.className = descChars > 160 ? 'bg-rose-500 h-full transition-all' : (descChars > 150 ? 'bg-amber-500 h-full transition-all' : 'bg-emerald-500 h-full transition-all');
      }

      if (prevDescText) {
        if (descChars > 160) {
          prevDescText.textContent = desc.slice(0, 155) + '...';
        } else {
          prevDescText.textContent = desc;
        }
      }

      // Toggles
      if (prevRating) {
        prevRating.style.display = (toggleRating && toggleRating.checked) ? 'flex' : 'none';
      }
      if (prevDate) {
        prevDate.style.display = (toggleDate && toggleDate.checked) ? 'inline' : 'none';
      }
    };

    [serpTitle, serpDesc, serpUrl].forEach(el => {
      if (el) el.addEventListener('input', updateSerp);
    });
    if (toggleDate) toggleDate.addEventListener('change', updateSerp);
    if (toggleRating) toggleRating.addEventListener('change', updateSerp);

    if (btnDesktop && btnMobile && prevContainer) {
      btnDesktop.addEventListener('click', () => {
        prevContainer.style.maxWidth = '600px';
        btnDesktop.className = 'px-3 py-1 rounded-lg bg-[#6366F1] text-white font-bold text-[11px] shadow';
        btnMobile.className = 'px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-[11px] hover:text-white';
      });
      btnMobile.addEventListener('click', () => {
        prevContainer.style.maxWidth = '375px';
        btnMobile.className = 'px-3 py-1 rounded-lg bg-[#6366F1] text-white font-bold text-[11px] shadow';
        btnDesktop.className = 'px-3 py-1 rounded-lg text-slate-600 dark:text-slate-400 font-bold text-[11px] hover:text-white';
      });
    }

    updateSerp();
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. HTTP STATUS CODE EXPLORER
  // ─────────────────────────────────────────────────────────────────
  const httpGrid = document.getElementById('http-cards-grid');
  if (httpGrid) {
    const searchInput = document.getElementById('http-search');

    const HTTP_DATA = [
      // 2xx Success
      { code: 200, phrase: 'OK', cat: '2xx', badge: 'Standard Success', desc: 'The standard response for successful HTTP requests. Web pages are indexed normally by Googlebot.', seo: 'Optimal state. Google crawls and indexes content without issue.' },
      { code: 201, phrase: 'Created', cat: '2xx', badge: 'Resource Created', desc: 'The request has been fulfilled, resulting in the creation of a new resource (e.g. POST API call).', seo: 'Primarily used in REST APIs. Search engines rarely index POST endpoints.' },
      { code: 204, phrase: 'No Content', cat: '2xx', badge: 'Empty Response', desc: 'The server successfully processed the request, but is not returning any content in the response body.', seo: 'Not suitable for indexable web pages. Use 200 OK for search-facing content.' },

      // 3xx Redirection
      { code: 301, phrase: 'Moved Permanently', cat: '3xx', badge: 'Permanent Redirect', desc: 'This and all future requests should be directed to the target URI specified in the Location header.', seo: 'Essential SEO tool. Passes 99%+ of PageRank link equity to new URL.' },
      { code: 302, phrase: 'Found (Temporary)', cat: '3xx', badge: 'Temporary Redirect', desc: 'The target resource resides temporarily under a different URI. Used for seasonal promotions.', seo: 'Search engines continue indexing the old URL. Does NOT pass full link equity long-term.' },
      { code: 304, phrase: 'Not Modified', cat: '3xx', badge: 'Cache Revalidation', desc: 'Indicates that the resource has not been modified since the version specified by the request headers.', seo: 'Conserves crawl budget. Googlebot skips re-downloading unchanged pages.' },
      { code: 307, phrase: 'Temporary Redirect', cat: '3xx', badge: 'HTTP 1.1 Temp', desc: 'Temporary redirect guaranteeing that the HTTP method (POST/GET) cannot change.', seo: 'Treated similarly to 302 by search crawlers.' },
      { code: 308, phrase: 'Permanent Redirect', cat: '3xx', badge: 'HTTP 1.1 Perm', desc: 'Permanent redirect guaranteeing that the request method will not be altered.', seo: 'Modern equivalent to 301. Fully supported by Google for passing link authority.' },

      // 4xx Client Errors
      { code: 400, phrase: 'Bad Request', cat: '4xx', badge: 'Malformed Syntax', desc: 'The server cannot process the request due to perceived client error (e.g. invalid query string or malformed JSON).', seo: 'Crawlers will report crawl errors in Google Search Console if internal links return 400.' },
      { code: 401, phrase: 'Unauthorized', cat: '4xx', badge: 'Authentication Required', desc: 'Similar to 403 Forbidden, but specifically for when authentication is required and has failed or not been provided.', seo: 'Googlebot cannot pass HTTP Auth walls. Content behind 401 will not be indexed.' },
      { code: 403, phrase: 'Forbidden', cat: '4xx', badge: 'Access Denied', desc: 'The server understood the request but refuses to authorize it. Even with authentication, permissions are denied.', seo: 'Googlebot drops 403 pages from the index after repeated crawl attempts.' },
      { code: 404, phrase: 'Not Found', cat: '4xx', badge: 'Resource Missing', desc: 'The origin server did not find a current representation for the target resource.', seo: 'Standard 404s do not hurt domain health, but fix broken internal links to retain user experience.' },
      { code: 410, phrase: 'Gone', cat: '4xx', badge: 'Permanently Deleted', desc: 'Indicates that access to the target resource is no longer available at the origin server and no forwarding address is known.', seo: 'Google de-indexes 410 pages faster than 404s. Use when permanently purging old catalog items.' },
      { code: 429, phrase: 'Too Many Requests', cat: '4xx', badge: 'Rate Limited', desc: 'The user or automated bot has sent too many requests in a given amount of time (rate limiting).', seo: 'Googlebot slows down crawl speed immediately when encountering 429 responses.' },

      // 5xx Server Errors
      { code: 500, phrase: 'Internal Server Error', cat: '5xx', badge: 'Server Crash', desc: 'A generic error message, given when an unexpected condition was encountered on backend code.', seo: 'Severe SEO issue. Prolonged 500 errors cause Google to drop pages from index.' },
      { code: 502, phrase: 'Bad Gateway', cat: '5xx', badge: 'Gateway / Proxy Failure', desc: 'The server, while acting as a gateway or proxy, received an invalid response from the inbound server.', seo: 'Commonly caused by PHP-FPM, Node.js process crashes behind NGINX. Check reverse proxy.' },
      { code: 503, phrase: 'Service Unavailable', cat: '5xx', badge: 'Maintenance Mode', desc: 'The server is currently unable to handle the request due to temporary overloading or scheduled maintenance.', seo: 'Pair with `Retry-After` header during scheduled maintenance to prevent de-indexing.' },
      { code: 504, phrase: 'Gateway Timeout', cat: '5xx', badge: 'Upstream Timeout', desc: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.', seo: 'Indicates slow database queries or hanging microservice endpoints.' }
    ];

    let currentFilter = 'all';
    let currentSearch = '';

    const renderHttpCards = () => {
      const q = currentSearch.toLowerCase().trim();
      const filtered = HTTP_DATA.filter(item => {
        const matchCat = (currentFilter === 'all' || item.cat === currentFilter);
        const matchSearch = !q || item.code.toString().includes(q) || item.phrase.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
        return matchCat && matchSearch;
      });

      if (!filtered.length) {
        httpGrid.innerHTML = '<div class="col-span-full py-12 text-center text-slate-400 font-mono text-xs">No HTTP status codes match your search criteria.</div>';
        return;
      }

      httpGrid.innerHTML = filtered.map(item => {
        let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
        let codeColor = 'text-[#6366F1]';
        if (item.cat === '2xx') {
          badgeColor = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400';
          codeColor = 'text-emerald-600 dark:text-emerald-400';
        } else if (item.cat === '3xx') {
          badgeColor = 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-400';
          codeColor = 'text-[#6366F1]';
        } else if (item.cat === '4xx') {
          badgeColor = 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400';
          codeColor = 'text-amber-600 dark:text-amber-400';
        } else if (item.cat === '5xx') {
          badgeColor = 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-400';
          codeColor = 'text-rose-600 dark:text-rose-400';
        }

        return `
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
            <div class="flex items-center justify-between">
              <span class="text-2xl font-black ${codeColor}">${item.code}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}">${item.badge}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white font-sans">${item.phrase}</h4>
            <p class="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-sans">${item.desc}</p>
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 font-sans">
              <strong class="text-slate-700 dark:text-slate-300">SEO Impact:</strong> ${item.seo}
            </div>
          </div>
        `;
      }).join('');
    };

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderHttpCards();
      });
    }

    document.querySelectorAll('.btn-http-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-http-filter').forEach(b => {
          b.className = 'btn-http-filter px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-[#6366F1] hover:text-white transition-all';
        });
        btn.className = 'btn-http-filter px-3 py-1.5 rounded-lg bg-[#6366F1] text-white font-bold transition-all';
        currentFilter = btn.getAttribute('data-cat') || 'all';
        renderHttpCards();
      });
    });

    renderHttpCards();
  }
});
