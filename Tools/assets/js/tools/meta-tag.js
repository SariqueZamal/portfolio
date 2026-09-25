/* ==========================================================================
   DigitalCron Tools - Meta Tag Generator Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  generateMetaTags();

  // Listen on any input changes in both conventions
  const inputs = document.querySelectorAll('.meta-input-field, #meta-form input, #meta-form textarea, #meta-form select');
  inputs.forEach(i => {
    i.addEventListener('input', generateMetaTags);
    i.addEventListener('change', generateMetaTags);
  });
});

function generateMetaTags() {
  // Support both meta-title and meta-input-title
  const title = document.getElementById('meta-title')?.value ||
                document.getElementById('meta-input-title')?.value ||
                'DigitalCron Tools';

  const desc = document.getElementById('meta-desc')?.value ||
               document.getElementById('meta-input-desc')?.value ||
               'Free online platform offering developer tools, generators, converters, and utilities.';

  const canonical = document.getElementById('meta-url')?.value ||
                    document.getElementById('meta-input-canonical')?.value ||
                    'https://tools.digitalcron.com';

  const ogImg = document.getElementById('meta-og-image')?.value ||
                document.getElementById('meta-input-ogimg')?.value ||
                'https://tools.digitalcron.com/assets/img/og-image.png';

  const twitterCard = document.getElementById('meta-twitter')?.value ||
                      document.getElementById('meta-input-twitter')?.value ||
                      'summary_large_image';

  // Live Snippet Previews (support both ID schemes)
  const gUrl = document.getElementById('preview-url-display') || document.getElementById('google-prev-url');
  const gTitle = document.getElementById('preview-title-display') || document.getElementById('google-prev-title');
  const gDesc = document.getElementById('preview-desc-display') || document.getElementById('google-prev-desc');

  if (gUrl) gUrl.textContent = canonical;
  if (gTitle) gTitle.textContent = title;
  if (gDesc) gDesc.textContent = desc;

  // Code Output (support both meta-output-text and meta-code-output)
  const snippet = `<!-- Primary Meta Tags -->\n` +
    `<title>${escapeHtml(title)}</title>\n` +
    `<meta name="title" content="${escapeHtml(title)}" />\n` +
    `<meta name="description" content="${escapeHtml(desc)}" />\n` +
    `<link rel="canonical" href="${escapeHtml(canonical)}" />\n\n` +
    `<!-- Open Graph / Facebook -->\n` +
    `<meta property="og:type" content="website" />\n` +
    `<meta property="og:url" content="${escapeHtml(canonical)}" />\n` +
    `<meta property="og:title" content="${escapeHtml(title)}" />\n` +
    `<meta property="og:description" content="${escapeHtml(desc)}" />\n` +
    `<meta property="og:image" content="${escapeHtml(ogImg)}" />\n\n` +
    `<!-- Twitter -->\n` +
    `<meta property="twitter:card" content="${escapeHtml(twitterCard)}" />\n` +
    `<meta property="twitter:url" content="${escapeHtml(canonical)}" />\n` +
    `<meta property="twitter:title" content="${escapeHtml(title)}" />\n` +
    `<meta property="twitter:description" content="${escapeHtml(desc)}" />\n` +
    `<meta property="twitter:image" content="${escapeHtml(ogImg)}" />`;

  const codeOut = document.getElementById('meta-output-text') || document.getElementById('meta-code-output');
  if (codeOut) codeOut.textContent = snippet;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
