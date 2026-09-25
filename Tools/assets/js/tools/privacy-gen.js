/* ==========================================================================
   DigitalCron Tools - Privacy Policy Generator Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('policy-form') || document.getElementById('privacy-gen-form');
  if (form) {
    form.addEventListener('submit', handlePrivacyGen);
  }
});

function handlePrivacyGen(e) {
  e.preventDefault();

  const siteName = document.getElementById('policy-site-name')?.value ||
                   document.getElementById('priv-sitename')?.value ||
                   'DigitalCron Tools';

  const siteUrl = document.getElementById('policy-site-url')?.value ||
                  document.getElementById('priv-siteurl')?.value ||
                  'https://tools.digitalcron.com';

  const country = document.getElementById('policy-country')?.value || 'India';
  const email = document.getElementById('policy-email')?.value || `privacy@${siteUrl.replace(/^https?:\/\//, '').split('/')[0]}`;

  const hasAdSense = document.getElementById('policy-adsense')?.checked ||
                     document.getElementById('priv-adsense')?.checked || false;

  const hasGDPR = document.getElementById('policy-gdpr')?.checked || false;
  const hasAffiliates = document.getElementById('priv-affiliates')?.checked || false;

  let policy = `Privacy Policy for ${siteName}\n\n` +
    `At ${siteName} (accessible from ${siteUrl}), one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information recorded and collected by ${siteName} and how we use it.\n\n` +
    `1. Client-Side Processing & Data Confidentiality\n` +
    `All utility computations, file conversions, transformations, and mathematical calculations occur entirely within your local browser environment. We do not upload, store, inspect, or retain your files, text payloads, or metadata on our servers.\n\n`;

  if (hasAdSense) {
    policy += `2. Google AdSense & Third-Party Advertising\n` +
      `Google is one of our third-party vendors. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at: https://policies.google.com/technologies/ads\n\n`;
  }

  if (hasGDPR) {
    policy += `3. GDPR & CCPA Data Protection Rights\n` +
      `We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:\n` +
      `- The right to access and data portability\n` +
      `- The right to rectification of inaccurate data\n` +
      `- The right to erasure (Right to be Forgotten)\n` +
      `- The right to restrict or object to data processing\n` +
      `Since our tools process data purely on your local machine, we hold no personal profile data on you.\n\n`;
  }

  if (hasAffiliates) {
    policy += `4. Affiliate Marketing Disclosure\n` +
      `We may participate in affiliate referral programs. Clicking certain recommendation links may earn us an affiliate referral fee at zero additional charge to you.\n\n`;
  }

  policy += `5. Governing Law & Jurisdiction\n` +
    `This Privacy Policy and any disputes arising under it are governed by and construed in accordance with the laws of ${country}.\n\n` +
    `6. Contact Information\n` +
    `If you have questions or require more information about our Privacy Policy, do not hesitate to contact us at ${email} or via our Contact Page.`;

  const outContainer = document.getElementById('policy-output-container') || document.getElementById('privacy-output-container');
  const outText = document.getElementById('policy-output-text') || document.getElementById('privacy-output-text');

  if (outText) outText.textContent = policy;
  if (outContainer) outContainer.classList.remove('hidden');

  if (typeof showToast === 'function') {
    showToast('Privacy policy generated successfully!');
  }
}
