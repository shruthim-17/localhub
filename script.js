// ========================================================
// LOCALHUB COMPLETE DYNAMIC & INTERACTIVE CLIENT ENGINE
// ========================================================

const API_BASE = '/api';
const translationCache = new Map();
const originalTextByNode = new WeakMap();
let translationObserver = null;
let translationTimer = null;
let translationInProgress = false;
let translationPending = false;
let translationBlockedUntil = Number(localStorage.getItem('localhubTranslationBlockedUntil') || 0);

function getAppLanguage() {
  return sessionStorage.getItem('localhubLanguage') || 'en-US';
}

function getTranslationLanguage(language = getAppLanguage()) {
  return language.split('-')[0];
}

const voiceResponseTranslations = {
  te: {
    'Opening the platform.': 'ప్లాట్‌ఫారమ్‌ను తెరుస్తున్నాను.',
    'Opening platform.': 'ప్లాట్‌ఫారమ్‌ను తెరుస్తున్నాను.',
    'Opening home.': 'హోమ్‌ను తెరుస్తున్నాను.',
    'Opening homepage.': 'హోమ్ పేజీని తెరుస్తున్నాను.',
    'Opening services.': 'సేవలను తెరుస్తున్నాను.',
    'Opening service page.': 'సేవల పేజీని తెరుస్తున్నాను.',
    'Opening post.': 'పోస్ట్‌ను తెరుస్తున్నాను.',
    'Opening surveys.': 'సేవల పేజీని తెరుస్తున్నాను.',
    'Your human support request was sent.': 'మీ మానవ సహాయ అభ్యర్థన పంపబడింది.',
    'Opening help desk.': 'సహాయ కేంద్రాన్ని తెరుస్తున్నాను.',
    'Opening service.': 'సేవలను తెరుస్తున్నాను.',
    'Opening work.': 'పని పేజీని తెరుస్తున్నాను.',
    'Opening profile.': 'ప్రొఫైల్‌ను తెరుస్తున్నాను.',
    'Opening home page.': 'హోమ్ పేజీని తెరుస్తున్నాను.',
    'Opening community.': 'కమ్యూనిటీని తెరుస్తున్నాను.',
    'Opening the search bar.': 'సెర్చ్ బార్‌ను తెరుస్తున్నాను.',
    'Opening the posting options.': 'పోస్టింగ్ ఎంపికలను తెరుస్తున్నాను.',
    'Opening location settings.': 'లొకేషన్ సెట్టింగ్‌లను తెరుస్తున్నాను.',
    'Going back.': 'వెనక్కి వెళ్తున్నాను.',
    'Submitting your information.': 'మీ సమాచారాన్ని సమర్పిస్తున్నాను.',
    'Applying now.': 'ఇప్పుడు దరఖాస్తు చేస్తున్నాను.',
    'Opening contact options.': 'సంప్రదింపు ఎంపికలను తెరుస్తున్నాను.',
    'Opening booking options.': 'బుకింగ్ ఎంపికలను తెరుస్తున్నాను.',
    'Showing all categories.': 'అన్ని వర్గాలను చూపిస్తున్నాను.',
    'Updating your availability.': 'మీ అందుబాటును నవీకరిస్తున్నాను.',
    'Voice assistant': 'వాయిస్ అసిస్టెంట్',
    'Listening...': 'వింటున్నాను...',
    'Please say a command, such as “find an electrician”.': 'దయచేసి ఒక ఆదేశం చెప్పండి. ఉదాహరణకు, ఎలక్ట్రీషియన్‌ను వెతకండి అని చెప్పండి.',
    'Voice recognition is not supported in this browser.': 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు అందుబాటులో లేదు.',
    'Microphone permission was denied. Allow access and try again.': 'మైక్రోఫోన్ అనుమతి తిరస్కరించబడింది. అనుమతించి మళ్లీ ప్రయత్నించండి.',
    'I did not hear anything. Please say that again.': 'నాకు ఏమీ వినిపించలేదు. దయచేసి మళ్లీ చెప్పండి.',
    'I did not understand. Please say that again.': 'నాకు అర్థం కాలేదు. దయచేసి మళ్లీ చెప్పండి.',
    'Voice recognition failed. Please check microphone access and try again.': 'వాయిస్ గుర్తింపు విఫలమైంది. మైక్రోఫోన్ అనుమతిని తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
    'Voice responses are now on.': 'వాయిస్ స్పందనలు ఇప్పుడు ఆన్‌లో ఉన్నాయి.',
    'Voice responses are now off.': 'వాయిస్ స్పందనలు ఇప్పుడు ఆఫ్‌లో ఉన్నాయి.'
  },
  hi: {
    'Opening the platform.': 'प्लेटफ़ॉर्म खोल रहा हूँ।',
    'Opening platform.': 'प्लेटफ़ॉर्म खोल रहा हूँ।',
    'Opening home.': 'होम खोल रहा हूँ।',
    'Opening homepage.': 'होम पेज खोल रहा हूँ।',
    'Opening services.': 'सेवाएँ खोल रहा हूँ।',
    'Opening service page.': 'सेवा पेज खोल रहा हूँ।',
    'Opening post.': 'पोस्ट खोल रहा हूँ।',
    'Opening surveys.': 'सेवा पेज खोल रहा हूँ।',
    'Your human support request was sent.': 'आपका मानव सहायता अनुरोध भेज दिया गया है।',
    'Opening help desk.': 'सहायता केंद्र खोल रहा हूँ।',
    'Opening work.': 'काम का पेज खोल रहा हूँ।',
    'Opening profile.': 'प्रोफ़ाइल खोल रहा हूँ।',
    'Opening home page.': 'होम पेज खोल रहा हूँ।',
    'Opening community.': 'कम्युनिटी खोल रहा हूँ।',
    'Opening the search bar.': 'सर्च बार खोल रहा हूँ।',
    'Opening the posting options.': 'पोस्ट करने के विकल्प खोल रहा हूँ।',
    'Opening location settings.': 'लोकेशन सेटिंग्स खोल रहा हूँ।',
    'Going back.': 'वापस जा रहा हूँ।',
    'Submitting your information.': 'आपकी जानकारी जमा कर रहा हूँ।',
    'Applying now.': 'अभी आवेदन कर रहा हूँ।',
    'Opening contact options.': 'संपर्क विकल्प खोल रहा हूँ।',
    'Opening booking options.': 'बुकिंग विकल्प खोल रहा हूँ।',
    'Language updated.': 'भाषा अपडेट हो गई है।'
  },
  ta: {
    'Opening the platform.': 'தளத்தைத் திறக்கிறேன்.',
    'Opening platform.': 'தளத்தைத் திறக்கிறேன்.',
    'Opening home.': 'முகப்பைத் திறக்கிறேன்.',
    'Opening homepage.': 'முகப்புப் பக்கத்தைத் திறக்கிறேன்.',
    'Opening services.': 'சேவைகளைத் திறக்கிறேன்.',
    'Opening post.': 'பதிவைத் திறக்கிறேன்.',
    'Opening surveys.': 'சேவைப் பக்கத்தைத் திறக்கிறேன்.',
    'Opening work.': 'வேலைப் பக்கத்தைத் திறக்கிறேன்.',
    'Opening profile.': 'சுயவிவரத்தைத் திறக்கிறேன்.',
    'Opening home page.': 'முகப்புப் பக்கத்தைத் திறக்கிறேன்.',
    'Opening service page.': 'சேவைப் பக்கத்தைத் திறக்கிறேன்.',
    'Opening the search bar.': 'தேடல் பட்டியைத் திறக்கிறேன்.',
    'Opening the posting options.': 'பதிவு விருப்பங்களைத் திறக்கிறேன்.',
    'Going back.': 'பின்செல்கிறேன்.',
    'Language updated.': 'மொழி புதுப்பிக்கப்பட்டது.'
  },
  kn: {
    'Opening the platform.': 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening platform.': 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening home.': 'ಹೋಮ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening homepage.': 'ಹೋಮ್ ಪುಟ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening services.': 'ಸೇವೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening post.': 'ಪೋಸ್ಟ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening surveys.': 'ಸೇವೆ ಪುಟ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening work.': 'ಕೆಲಸದ ಪುಟ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening profile.': 'ಪ್ರೊಫೈಲ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening home page.': 'ಹೋಮ್ ಪುಟ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening service page.': 'ಸೇವೆ ಪುಟ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening the search bar.': 'ಹುಡುಕಾಟ ಪಟ್ಟಿಯನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Opening the posting options.': 'ಪೋಸ್ಟ್ ಆಯ್ಕೆಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.',
    'Going back.': 'ಹಿಂದಕ್ಕೆ ಹೋಗುತ್ತಿದ್ದೇನೆ.',
    'Language updated.': 'ಭಾಷೆ ನವೀಕರಿಸಲಾಗಿದೆ.'
  }
};

const canonicalActionMessages = {
  homepage: 'Opening homepage.',
  services: 'Opening services.',
  work: 'Opening work.',
  post: 'Opening post.',
  community: 'Opening community.',
  profile: 'Opening profile.',
  platform: 'Opening platform.'
};

function getLocalizedVoiceMessage(message) {
  return (voiceResponseTranslations[getTranslationLanguage()] || {})[message] || message;
}

function getPageActionMessage(action) {
  return canonicalActionMessages[action] || 'Opening ' + action + '.';
}

const voiceAssistantLabels = {
  te: { assistant: 'వాయిస్ అసిస్టెంట్', listening: 'వింటున్నాను...' },
  hi: { assistant: 'वॉइस असिस्टेंट', listening: 'सुन रहा हूँ...' },
  ta: { assistant: 'குரல் உதவியாளர்', listening: 'கேட்கிறேன்...' },
  kn: { assistant: 'ಧ್ವನಿ ಸಹಾಯಕ', listening: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...' }
};

function getVoiceAssistantLabel(name) {
  return (voiceAssistantLabels[getTranslationLanguage()] || {})[name] || name;
}

function rememberOriginalText(element, attribute) {
  if (!attribute && element.nodeType === Node.TEXT_NODE) {
    if (!originalTextByNode.has(element)) originalTextByNode.set(element, element.textContent);
    return originalTextByNode.get(element);
  }
  const key = attribute
    ? 'original' + attribute.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')
    : 'originalText';
  if (!element.dataset[key]) element.dataset[key] = attribute ? element.getAttribute(attribute) : element.textContent;
  return element.dataset[key];
}

async function translateText(text, targetLanguage = getTranslationLanguage(), sourceLanguage = 'en') {
  const source = String(text || '').trim();
  if (!source || targetLanguage === sourceLanguage) return source;
  const cacheKey = sourceLanguage + '|' + targetLanguage + '|' + source;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('/api/translate?text=' + encodeURIComponent(source) + '&source=' + encodeURIComponent(sourceLanguage) + '&target=' + encodeURIComponent(targetLanguage), { signal: controller.signal });
    clearTimeout(timeout);
    const data = await response.json();
    const translated = data && data.success && data.text;
    if (translated) {
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch (error) {
    if (error.name !== 'AbortError') console.warn('Translation unavailable:', error);
  }
  return source;
}

async function translatePage() {
  const targetLanguage = getTranslationLanguage();
  document.documentElement.lang = getAppLanguage();
  if (targetLanguage === 'en') return;
  if (translationInProgress) {
    translationPending = true;
    return;
  }
  translationInProgress = true;
  if (translationObserver) translationObserver.disconnect();
  try {
    const nodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      const value = node.textContent.trim();
      if (!parent || !value || value.length < 2 || /^(SCRIPT|STYLE|OPTION)$/.test(parent.tagName) || parent.closest('.voice-assistant')) continue;
      nodes.push(node);
    }

    const textNodes = nodes.slice(0, 300);
    for (let index = 0; index < textNodes.length; index += 8) {
      await Promise.all(textNodes.slice(index, index + 8).map(async node => {
        const original = rememberOriginalText(node);
        const translated = await translateText(original, targetLanguage);
        if (translated) node.textContent = node.textContent.replace(node.textContent.trim(), translated);
      }));
    }

    const controls = document.querySelectorAll('input[placeholder], textarea[placeholder], [title], [aria-label]');
    for (const control of Array.from(controls).slice(0, 150)) {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        if (!control.hasAttribute(attribute)) continue;
        const original = rememberOriginalText(control, attribute);
        control.setAttribute(attribute, await translateText(original, targetLanguage));
      }
    }
  } finally {
    translationInProgress = false;
    if (translationObserver) translationObserver.observe(document.body, { childList: true, subtree: true });
    if (translationPending) {
      translationPending = false;
      clearTimeout(translationTimer);
      translationTimer = setTimeout(() => translatePage(), 150);
    }
  }
}

function setupLanguageSupport() {
  document.documentElement.lang = getAppLanguage();
  const select = document.getElementById('appLanguageSelect');
  if (select) {
    select.value = getAppLanguage();
    select.addEventListener('change', () => {
      sessionStorage.setItem('localhubLanguage', select.value);
      document.documentElement.lang = select.value;
      const status = document.getElementById('languageStatus');
      if (status) status.textContent = 'Language updated. Reloading the app...';
      announceVoiceAction('Language updated.').finally(() => window.location.reload());
    });
  }
  translatePage();
  translationObserver = new MutationObserver(() => {
    clearTimeout(translationTimer);
    translationTimer = setTimeout(() => translatePage(), 350);
  });
  translationObserver.observe(document.body, { childList: true, subtree: true });
}

// Current session helper
function getCurrentUser() {
  const stored = localStorage.getItem('localhubUser');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { }
  }
  return {};
}

function getSelectedCity() {
  const location = localStorage.getItem('localhubLocation') || '';
  const parts = location.split(',').map(part => part.trim()).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : (parts[0] || 'Hyderabad');
}

function withCity(endpoint) {
  const separator = endpoint.includes('?') ? '&' : '?';
  return endpoint + separator + 'city=' + encodeURIComponent(getSelectedCity());
}

// Check if an item belongs to the current user
function isItemOwned(item) {
  const user = getCurrentUser();
  if (!item) return false;
  if (item.ownerPhone && user.phone && item.ownerPhone.replace(/\s+/g, '') === user.phone.replace(/\s+/g, '')) return true;
  if (item.phone && user.phone && item.phone.replace(/\s+/g, '') === user.phone.replace(/\s+/g, '')) return true;
  if (item.ownerEmail && user.email && item.ownerEmail.toLowerCase() === user.email.toLowerCase()) return true;
  if (item.contactName && user.name && item.contactName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
  if (item.providerName && user.name && item.providerName.trim().toLowerCase() === user.name.trim().toLowerCase()) return true;
  return false;
}

let showAllCategories = false;

// API Fetch helper
async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(API_BASE + endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    return await res.json();
  } catch (err) {
    console.error('API Error (' + endpoint + '):', err);
    return null;
  }
}

// ========================================================
// INITIALIZATION
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    navigator.serviceWorker.register('/sw.js').catch(error => console.warn('Offline app shell unavailable:', error));
  }
  setupLanguageSupport();
  setupActionVoiceFeedback();
  setupUserHeader();
  setupLocationManager();
  setupInteractivePostModal();
  setupLiveSearch();
  setupVoiceAssistant();
  setupHelpSupport();

  // Page-specific initialization
  if (document.getElementById('authForm')) initAuthPage();
  if (document.getElementById('homeJobsGrid')) initHomePage();
  if (document.getElementById('categoriesGrid') || document.getElementById('servicesListGrid')) initServicesPage();
  if (document.getElementById('workJobsGrid')) initWorkPage();
  if (document.getElementById('communityFeedList')) initCommunityPage();
  if (document.getElementById('profileName')) initProfilePage();
});

function setupActionVoiceFeedback() {
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.closest('.voice-assistant') || link.target === '_blank') return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || /^(https?:|mailto:|tel:)/i.test(href)) return;
    event.preventDefault();
    const pageNames = {
      'home.html': 'homepage',
      'services.html': 'services',
      'work.html': 'work',
      'community.html': 'community',
      'profile.html': 'profile',
      'details.html': 'platform',
      'index.html': 'login'
    };
    const target = href.split('?')[0].split('#')[0];
    announceAndNavigate(getPageActionMessage(pageNames[target] || 'the selected page'), href);
  }, true);

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.closest('.voice-assistant') || button.id === 'voiceResponseToggle') return;
    if (button.classList.contains('voice-btn')) return;
    const label = (button.getAttribute('aria-label') || button.title || button.textContent || '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!label || /^(close|back|clear)$/i.test(label)) return;
    const actionMessage = button.id === 'openPostSheetBtn' || /\bpost\b/i.test(label)
      ? getPageActionMessage('post')
      : 'Opening ' + label.toLowerCase() + '.';
    announceVoiceAction(actionMessage);
  }, true);
}

// Setup Topbar User Greeting & Avatar
function setupUserHeader() {
  const user = getCurrentUser();
  const avatarBtn = document.getElementById('userAvatarBtn');
  const greeting = document.getElementById('homeGreeting');
  
  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'M';
  if (avatarBtn) avatarBtn.textContent = initial;
  if (greeting) {
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
    greeting.textContent = timeOfDay + ', ' + user.name + '!';
  }
}

// ========================================================
// AUTH & LOGIN PAGE ENGINE (index.html)
// ========================================================
function initAuthPage() {
  const authForm = document.getElementById('authForm');
  const tabs = document.querySelectorAll('.tab');
  const authHeading = document.getElementById('authHeading');
  const authDesc = document.getElementById('authSectionDescription');
  const authExtraFields = document.getElementById('authExtraFields');
  const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
  const submitBtn = document.getElementById('submitAuthBtn');
  const togglePassBtn = document.getElementById('togglePasswordBtn');
  const toggleConfirmPassBtn = document.getElementById('toggleConfirmPasswordBtn');
  const passInput = document.getElementById('password');
  const confirmPassInput = document.getElementById('confirmPassword');
  const captchaCode = document.getElementById('captchaCode');
  const captchaInput = document.getElementById('captchaInput');
  const captchaChallengeId = document.getElementById('captchaChallengeId');
  const refreshCaptchaBtn = document.getElementById('refreshCaptchaBtn');

  async function loadCaptchaChallenge() {
    const data = await fetchJson('/login-challenge');
    if (!data || !data.success) {
      if (captchaCode) captchaCode.textContent = '------';
      return;
    }
    if (captchaCode) captchaCode.textContent = data.code;
    if (captchaChallengeId) captchaChallengeId.value = data.challengeId;
    if (captchaInput) {
      captchaInput.value = '';
      captchaInput.focus();
    }
  }

  loadCaptchaChallenge();
  if (refreshCaptchaBtn) refreshCaptchaBtn.addEventListener('click', loadCaptchaChallenge);

  let currentTab = 'login';

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');

      if (currentTab === 'login') {
        if (authHeading) authHeading.textContent = 'Welcome Back! 👋';
        if (authDesc) authDesc.textContent = 'Sign in to explore services, work opportunities, and your local community.';
        if (authExtraFields) authExtraFields.classList.add('hidden');
        if (confirmPasswordGroup) confirmPasswordGroup.classList.add('hidden');
        if (submitBtn) submitBtn.textContent = 'Login to LocalHub';
      } else {
        if (authHeading) authHeading.textContent = 'Create Account ✨';
        if (authDesc) authDesc.textContent = 'Join LocalHub to find verified services, flexible jobs, and neighborhood help.';
        if (authExtraFields) authExtraFields.classList.remove('hidden');
        if (confirmPasswordGroup) confirmPasswordGroup.classList.remove('hidden');
        if (submitBtn) submitBtn.textContent = 'Create My Account';
      }
    });
  });

  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passInput.setAttribute('type', type);
      togglePassBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  if (toggleConfirmPassBtn && confirmPassInput) {
    toggleConfirmPassBtn.addEventListener('click', () => {
      const type = confirmPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
      confirmPassInput.setAttribute('type', type);
      toggleConfirmPassBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  ['googleLoginBtn', 'appleLoginBtn', 'whatsappLoginBtn'].forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        alert('This sign-in method is not configured yet. Please use email and password.');
      });
    }
  });

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const challengeAnswer = captchaInput ? captchaInput.value.trim().toUpperCase() : '';
      if (!captchaChallengeId?.value || !challengeAnswer) {
        alert('Please enter the security code shown above.');
        return;
      }

      const email = document.getElementById('email').value.trim();
      const password = passInput.value.trim();

      if (password.length < 6) {
        alert('Password must be at least 6 digits/characters.');
        return;
      }

      if (currentTab === 'create') {
        const fullName = document.getElementById('fullName').value.trim();
        const confirmPass = confirmPassInput ? confirmPassInput.value.trim() : '';

        if (!fullName) {
          alert('Please enter your full name.');
          return;
        }

        if (password !== confirmPass) {
          alert('Passwords do not match. Please re-enter.');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        const res = await fetchJson('/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, name: fullName, challengeId: captchaChallengeId.value, challengeAnswer })
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Create My Account';

        if (res && res.success) {
          localStorage.setItem('localhubUser', JSON.stringify({
            name: fullName,
            email: email,
            phone: '',
            location: ''
          }));
          window.location.href = 'details.html';
        } else {
          alert((res && res.error) || 'Registration failed. Please try again.');
          loadCaptchaChallenge();
        }
      } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging In...';

        const res = await fetchJson('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password, challengeId: captchaChallengeId.value, challengeAnswer })
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Login to LocalHub';

        if (res && res.success) {
          localStorage.setItem('localhubUser', JSON.stringify({
            name: (res.user && res.user.name) || '',
            email: (res.user && res.user.email) || email,
            phone: (res.user && res.user.phone) || '',
            location: (res.user && res.user.location) || ''
          }));
          window.location.href = 'details.html';
        } else {
          alert((res && res.error) || 'Login failed. Please check your details and try again.');
          loadCaptchaChallenge();
        }
      }
    });
  }

  setupTrustSlider();
}

function setupTrustSlider() {
  const slides = document.querySelectorAll('.trust-slide');
  const dots = document.querySelectorAll('.indicator-dot');
  if (slides.length === 0) return;

  let currentSlide = 0;
  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    currentSlide = index;
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      showSlide(idx);
    });
  });

  setInterval(() => {
    const nextIdx = (currentSlide + 1) % slides.length;
    showSlide(nextIdx);
  }, 3500);
}

// ========================================================
// LOCATION MANAGER (LIVE GPS + MANUAL SELECTOR)
// ========================================================
function setupLocationManager() {
  const openModalBtn = document.getElementById('openLocationModalBtn');
  const modal = document.getElementById('locationModal');
  const closeModalBtn = document.getElementById('closeLocationModalBtn');
  const useGpsBtn = document.getElementById('useGpsBtn');
  const customCityInput = document.getElementById('customCityInput');
  const saveCustomLocBtn = document.getElementById('saveCustomLocBtn');
  const subtext = document.getElementById('homeSubtext');
  const statusPill = document.getElementById('locStatusPill');

  const savedLoc = localStorage.getItem('localhubLocation') || 'Hyderabad, Telangana';
  if (subtext) subtext.textContent = savedLoc;
  if (statusPill) statusPill.textContent = localStorage.getItem('localhubLocType') || 'LIVE';

  if (!openModalBtn || !modal) return;

  openModalBtn.addEventListener('click', () => modal.classList.add('open'));
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  if (useGpsBtn) {
    useGpsBtn.addEventListener('click', () => {
      useGpsBtn.innerHTML = '🛰️ Detecting location...';
      useGpsBtn.disabled = true;

      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        useGpsBtn.innerHTML = '🛰️ Detect My Live GPS Location';
        useGpsBtn.disabled = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            const res = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon + '&zoom=14&addressdetails=1');
            const data = await res.json();
            
            const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.city_district || data.address.city || 'Local Area';
            const city = data.address.city || data.address.state_district || data.address.state || 'Live Location';
            const locationStr = area + ', ' + city;

            setLocation(locationStr, 'GPS');
            modal.classList.remove('open');
          } catch (e) {
            setLocation('Live GPS (' + lat.toFixed(2) + ', ' + lon.toFixed(2) + ')', 'GPS');
            modal.classList.remove('open');
          } finally {
            useGpsBtn.innerHTML = '🛰️ Detect My Live GPS Location';
            useGpsBtn.disabled = false;
          }
        },
        (error) => {
          alert('Location permission denied or unavailable. Please pick a city from the list below.');
          useGpsBtn.innerHTML = '🛰️ Detect My Live GPS Location';
          useGpsBtn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }

  document.querySelectorAll('.city-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.getAttribute('data-city');
      setLocation(city, 'CITY');
      modal.classList.remove('open');
    });
  });

  if (saveCustomLocBtn && customCityInput) {
    saveCustomLocBtn.addEventListener('click', () => {
      const val = customCityInput.value.trim();
      if (val) {
        setLocation(val, 'MANUAL');
        modal.classList.remove('open');
        customCityInput.value = '';
      }
    });
  }

  function setLocation(loc, type) {
    localStorage.setItem('localhubLocation', loc);
    localStorage.setItem('localhubLocType', type);
    if (subtext) subtext.textContent = loc;
    if (statusPill) statusPill.textContent = type;
    
    const profLoc = document.getElementById('profileLoc');
    if (profLoc) profLoc.textContent = '📍 ' + loc;

    const user = getCurrentUser();
    if (user.email) {
      fetchJson('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({ email: user.email, location: loc })
      }).then(res => {
        if (res && res.success) localStorage.setItem('localhubUser', JSON.stringify(res.user));
      });
    }
    if (document.getElementById('homeJobsGrid') || document.getElementById('servicesListGrid') || document.getElementById('workJobsGrid') || document.getElementById('communityFeedList')) {
      window.location.reload();
    }
  }
}

// ========================================================
// LIVE SEARCH ENGINE (ACROSS ALL PAGES)
// ========================================================
function setupLiveSearch() {
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-search');
      if (window.location.pathname.includes('services')) {
        const input = document.getElementById('serviceSearchInput');
        if (input) { input.value = query; triggerServiceSearch(query); }
      } else if (window.location.pathname.includes('work')) {
        const input = document.getElementById('workSearchInput');
        if (input) { input.value = query; triggerWorkSearch(query); }
      } else {
        window.location.href = 'services.html?q=' + encodeURIComponent(query);
      }
    });
  });

  const urlParams = new URLSearchParams(window.location.search);
  const qParam = urlParams.get('q');
  if (qParam) {
    if (document.getElementById('serviceSearchInput')) {
      document.getElementById('serviceSearchInput').value = qParam;
      triggerServiceSearch(qParam);
    }
    if (document.getElementById('workSearchInput')) {
      document.getElementById('workSearchInput').value = qParam;
      triggerWorkSearch(qParam);
    }
    if (document.getElementById('communitySearchInput')) {
      document.getElementById('communitySearchInput').value = qParam;
      triggerCommunitySearch(qParam);
    }
  }

  const globalInput = document.getElementById('globalSearchInput');
  if (globalInput) {
    globalInput.addEventListener('input', (e) => triggerHomeSearch(e.target.value.trim()));
    globalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = globalInput.value.trim();
        if (q) window.location.href = 'services.html?q=' + encodeURIComponent(q);
      }
    });
  }

  const serviceInput = document.getElementById('serviceSearchInput');
  if (serviceInput) serviceInput.addEventListener('input', (e) => triggerServiceSearch(e.target.value.trim()));

  const workInput = document.getElementById('workSearchInput');
  if (workInput) workInput.addEventListener('input', (e) => triggerWorkSearch(e.target.value.trim()));

  const communityInput = document.getElementById('communitySearchInput');
  if (communityInput) communityInput.addEventListener('input', (e) => triggerCommunitySearch(e.target.value.trim()));

  const clearHomeBtn = document.getElementById('clearSearchBtn');
  if (clearHomeBtn) clearHomeBtn.addEventListener('click', () => { if (globalInput) globalInput.value = ''; triggerHomeSearch(''); });

  const clearServiceBtn = document.getElementById('clearServiceSearchBtn');
  if (clearServiceBtn) clearServiceBtn.addEventListener('click', () => { if (serviceInput) serviceInput.value = ''; triggerServiceSearch(''); });

  const clearWorkBtn = document.getElementById('clearWorkSearchBtn');
  if (clearWorkBtn) clearWorkBtn.addEventListener('click', () => { if (workInput) workInput.value = ''; triggerWorkSearch(''); });

  const clearCommunityBtn = document.getElementById('clearCommunitySearchBtn');
  if (clearCommunityBtn) clearCommunityBtn.addEventListener('click', () => { if (communityInput) communityInput.value = ''; triggerCommunitySearch(''); });

  const voiceBtns = document.querySelectorAll('.voice-btn');
  voiceBtns.forEach(btn => {
    btn.addEventListener('click', () => startVoiceRecognition(btn));
  });
}

// ========================================================
// VOICE ASSISTANT
// Uses the browser Speech Recognition API and existing UI actions.
// ========================================================
let activeVoiceRecognition = null;
let voiceAssistantStatusTimer = null;
let speechQueue = Promise.resolve();

function getSpeechRecognitionConstructor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function setupVoiceAssistant() {
  const Recognition = getSpeechRecognitionConstructor();
  const assistant = document.createElement('div');
  assistant.className = 'voice-assistant';
  assistant.innerHTML = `
    <button class="voice-assistant-btn" id="voiceAssistantBtn" type="button" aria-label="Start voice assistant" title="Voice assistant">🎙️</button>
    <div class="voice-assistant-panel" id="voiceAssistantPanel" role="status" aria-live="polite">
      <strong id="voiceAssistantTitle">Voice assistant</strong>
      <span id="voiceAssistantStatus">Say “go to services” or “search plumber”.</span>
    </div>`;
  document.body.appendChild(assistant);
  updateVoiceAssistantStatus(getLocalizedVoiceMessage('Please say a command, such as “find an electrician”.'), false, false);

  const button = document.getElementById('voiceAssistantBtn');
  if (!Recognition) {
    button.disabled = true;
    button.title = 'Voice recognition is not supported in this browser';
    updateVoiceAssistantStatus('Voice recognition is not supported in this browser.');
    return;
  }

  button.addEventListener('click', () => startVoiceRecognition(button));
}

function updateVoiceAssistantStatus(message, isListening = false, showPanel = true) {
  const panel = document.getElementById('voiceAssistantPanel');
  const status = document.getElementById('voiceAssistantStatus');
  const title = document.getElementById('voiceAssistantTitle');
  if (!panel || !status || !title) return;
  clearTimeout(voiceAssistantStatusTimer);
  panel.classList.toggle('visible', showPanel || isListening);
  panel.classList.toggle('listening', isListening);
  title.textContent = isListening ? getVoiceAssistantLabel('listening') : getVoiceAssistantLabel('assistant');
  status.textContent = message;
  if (!isListening && showPanel) {
    voiceAssistantStatusTimer = setTimeout(() => panel.classList.remove('visible'), 6500);
  }
}

function waitForSpeechVoices() {
  if (!('speechSynthesis' in window)) return Promise.resolve([]);
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) return Promise.resolve(voices);
  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish);
    setTimeout(finish, 1200);
  });
}

function getFemaleVoice(voices, language, languagePrefix) {
  const femaleName = /female|samantha|ava|victoria|karen|susan|zira|hazel|google uk english|microsoft.*female/i;
  return voices.find(voice => voice.lang.toLowerCase() === language.toLowerCase() && femaleName.test(voice.name))
    || voices.find(voice => voice.lang.toLowerCase().startsWith(languagePrefix) && femaleName.test(voice.name))
    || voices.find(voice => voice.lang.toLowerCase() === language.toLowerCase())
    || voices.find(voice => voice.lang.toLowerCase().startsWith(languagePrefix));
}

function hasLanguageVoice(voices, language, languagePrefix) {
  return voices.some(voice => voice.lang.toLowerCase() === language.toLowerCase() || voice.lang.toLowerCase().startsWith(languagePrefix));
}

async function speakVoiceAssistant(message, translatedMessage = '') {
  if (localStorage.getItem('localhubVoiceResponses') === 'off' || !('speechSynthesis' in window)) return;
  const spokenMessage = translatedMessage || getLocalizedVoiceMessage(message);
  const language = getAppLanguage();
  const languagePrefix = getTranslationLanguage(language);
  speechQueue = speechQueue.then(async () => {
    const voices = await waitForSpeechVoices();
    return new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(spokenMessage);
    utterance.lang = language;
    const femaleVoice = getFemaleVoice(voices, language, languagePrefix);
    if (femaleVoice) utterance.voice = femaleVoice;
    if (!hasLanguageVoice(voices, language, languagePrefix)) {
      utterance.lang = language;
    }
    utterance.rate = 0.9;
    utterance.pitch = 1.12;
    utterance.volume = 1;
    let settled = false;
    const finishSpeech = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    utterance.onend = finishSpeech;
    utterance.onerror = finishSpeech;
    window.speechSynthesis.speak(utterance);
    setTimeout(finishSpeech, Math.max(5000, spokenMessage.length * 95));
    });
  });
  return speechQueue;
}

async function announceVoiceAction(message) {
  let localizedMessage = getLocalizedVoiceMessage(message);
  if (localizedMessage === message && getTranslationLanguage() !== 'en') {
    localizedMessage = await translateText(message);
  }
  updateVoiceAssistantStatus(localizedMessage, false, false);
  return speakVoiceAssistant(message, localizedMessage);
}

function announceAndNavigate(message, href) {
  announceVoiceAction(message).then(() => { window.location.href = href; });
}

function startVoiceRecognition(button) {
  const Recognition = getSpeechRecognitionConstructor();
  if (!Recognition) {
    announceVoiceAction('Voice recognition is not supported in this browser.');
    return;
  }
  if (activeVoiceRecognition) {
    activeVoiceRecognition.stop();
    return;
  }

  const recognition = new Recognition();
  activeVoiceRecognition = recognition;
  recognition.lang = getAppLanguage();
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  button.classList.add('is-listening');
  updateVoiceAssistantStatus(getLocalizedVoiceMessage('Please say a command, such as “find an electrician”.'), true);

  recognition.onresult = async event => {
    const transcript = event.results[0][0].transcript.trim();
    if (!transcript) {
      announceVoiceAction('I did not hear anything. Please say that again.');
      return;
    }
    const command = await Promise.race([
      translateText(transcript, 'en', getTranslationLanguage()),
      new Promise(resolve => setTimeout(() => resolve(transcript), 1000))
    ]);
    handleVoiceCommand(command);
  };
  recognition.onerror = event => {
    const message = event.error === 'not-allowed'
      ? 'Microphone permission was denied. Allow access and try again.'
      : event.error === 'no-speech'
        ? 'I did not hear anything. Please say that again.'
        : 'Voice recognition failed. Please check microphone access and try again.';
    announceVoiceAction(message);
  };
  recognition.onend = () => {
    activeVoiceRecognition = null;
    button.classList.remove('is-listening');
  };
  try {
    recognition.start();
  } catch (error) {
    activeVoiceRecognition = null;
    button.classList.remove('is-listening');
    const message = error.name === 'InvalidStateError'
      ? 'Voice recognition is already starting. Please try again.'
      : 'I could not start the microphone. Please allow microphone access and try again.';
    announceVoiceAction(message);
  }
}

function findVoiceTarget(text) {
  const normalized = text.toLowerCase();
  const targetMap = [
    { terms: ['home', 'dashboard'], href: 'home.html' },
    { terms: ['service', 'services', 'surveys', 'plumber', 'electrician', 'cleaner', 'carpenter'], href: 'services.html' },
    { terms: ['work', 'job', 'jobs', 'employment'], href: 'work.html' },
    { terms: ['community', 'neighbourhood', 'neighborhood', 'notice'], href: 'community.html' },
    { terms: ['profile', 'account', 'my details'], href: 'profile.html' },
    { terms: ['platform', 'details', 'about'], href: 'details.html' },
    { terms: ['login', 'log in', 'sign in'], href: 'index.html' }
  ];
  return targetMap.find(target => target.terms.some(term => normalized.includes(term)));
}

function setVoiceInputValue(value) {
  const input = document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)
    ? document.activeElement
    : document.querySelector('#globalSearchInput, #serviceSearchInput, #workSearchInput, #communitySearchInput');
  if (!input) return false;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

function handleVoiceCommand(command) {
  const text = command.toLowerCase()
    .replace(/[.!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const fillMatch = text.match(/(?:fill|enter|type|write)\s+(.+?)\s+(?:as|with)\s+(.+)/i);
  if (fillMatch) {
    const fieldName = fillMatch[1].trim();
    const fieldValue = fillMatch[2].trim();
    const field = Array.from(document.querySelectorAll('input, textarea, select')).find(element => {
      const label = element.id ? document.querySelector('label[for="' + element.id + '"]') : null;
      const description = (label ? label.textContent : '') + ' ' + element.id + ' ' + element.name + ' ' + element.placeholder;
      return description.toLowerCase().includes(fieldName);
    });
    if (field) {
      field.value = fieldValue;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      announceVoiceAction('Filled ' + fieldName + '.');
    } else {
      announceVoiceAction('I could not find a field named ' + fieldName + '.');
    }
    return;
  }

  const actionSelectors = [
    { terms: ['detect gps', 'use gps', 'find my location'], selector: '#useGpsBtn', message: 'Using your current location.' },
    { terms: ['save', 'submit', 'publish', 'post it'], selector: 'button[type="submit"], #saveCustomLocBtn', message: 'Submitting your information.' },
    { terms: ['apply', 'apply now'], selector: '.apply-btn', message: 'Applying now.' },
    { terms: ['call', 'contact'], selector: '.call-pro-btn, .call-employer-btn, .call-btn', message: 'Opening contact options.' },
    { terms: ['book', 'book service'], selector: '.book-pro-btn', message: 'Opening booking options.' },
    { terms: ['reply'], selector: '.reply-btn', message: 'Opening the reply form.' },
    { terms: ['helpful'], selector: '.helpful-btn', message: 'Marking this as helpful.' },
    { terms: ['view all categories', 'show all'], selector: '#toggleCategoriesBtn', message: 'Showing all categories.' },
    { terms: ['toggle availability', 'go available', 'go unavailable'], selector: '#workerToggleBtn', message: 'Updating your availability.' },
    { terms: ['logout', 'log out', 'sign out'], selector: '#logoutBtn', message: 'Signing you out.' },
    { terms: ['show password'], selector: '#togglePasswordBtn', message: 'Showing the password.' },
    { terms: ['create account', 'sign up'], selector: '.tab[data-tab="create"]', message: 'Opening account creation.' }
  ];
  const action = actionSelectors.find(candidate => candidate.terms.some(term => text.includes(term)));
  if (action) {
    const target = document.querySelector(action.selector);
    if (target) {
      target.click();
      announceVoiceAction(action.message);
    } else {
      announceVoiceAction('That action is not available on this page.');
    }
    return;
  }

  if (text.includes('open search') || text.includes('show search') || text === 'search bar') {
    const input = document.querySelector('#globalSearchInput, #serviceSearchInput, #workSearchInput, #communitySearchInput');
    if (input) {
      input.focus();
      announceVoiceAction('Opening the search bar.');
    } else {
      announceVoiceAction('There is no search bar on this page.');
    }
    return;
  }

  const searchMatch = text.match(/(?:search|find|look for|show me)\s+(?:a|an|the)?\s*(.+)/i);
  if (searchMatch) {
    const query = searchMatch[1].trim();
    const input = document.querySelector('#globalSearchInput, #serviceSearchInput, #workSearchInput, #communitySearchInput');
    if (input && input.id === 'globalSearchInput') {
      input.value = query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      announceAndNavigate('Opening search results for ' + query + '.', 'services.html?q=' + encodeURIComponent(query));
    } else if (input) {
      setVoiceInputValue(query);
      announceVoiceAction('Searching for ' + query + '.');
    } else {
      announceAndNavigate('Opening search results for ' + query + '.', 'services.html?q=' + encodeURIComponent(query));
    }
    return;
  }

  if (text.includes('post') || text.includes('create listing') || text.includes('add a listing')) {
    const postButton = document.getElementById('openPostSheetBtn');
    if (postButton) {
      postButton.click();
      if (text.includes('job')) setTimeout(() => document.getElementById('selectJobTypeBtn')?.click(), 100);
      else if (text.includes('service')) setTimeout(() => document.getElementById('selectServiceTypeBtn')?.click(), 100);
      else if (text.includes('community') || text.includes('notice')) setTimeout(() => document.getElementById('selectCommunityTypeBtn')?.click(), 100);
      announceVoiceAction('Opening the posting options.');
    } else announceVoiceAction('Open a page with the Post button to create a listing.');
    return;
  }

  if (text.includes('change location') || text.includes('select location') || text.includes('my location')) {
    document.getElementById('openLocationModalBtn')?.click();
    announceVoiceAction('Opening location settings.');
    return;
  }

  if (text.includes('go back') || text === 'back') {
    announceVoiceAction('Going back.').then(() => window.history.back());
    return;
  }

  const target = findVoiceTarget(text.replace(/^(please\s+)?(open|go to|navigate to|show me)\s+/i, ''));
  if (target) {
    const pageName = target.href.replace('.html', '').replace('home', 'homepage');
    announceAndNavigate('Opening ' + pageName + '.', target.href);
    return;
  }

  if (setVoiceInputValue(command)) {
    announceVoiceAction('Added your words to the current field.');
  } else {
    announceVoiceAction('I did not understand. Please say that again.');
  }
}

// ========================================================
// HOME PAGE ENGINE
// ========================================================
async function initHomePage() {
  const grid = document.getElementById('homeJobsGrid');
  if (!grid) return;

  grid.innerHTML = '<div class="data-state">Loading fresh nearby opportunities...</div>';

  const data = await fetchJson(withCity('/jobs'));
  if (!data || !data.jobs || data.jobs.length === 0) {
    grid.innerHTML = '<div class="data-state">No jobs found nearby. Post one with the ➕ button!</div>';
    return;
  }

  grid.innerHTML = '';
  data.jobs.slice(0, 4).forEach(job => {
    grid.appendChild(createJobCard(job));
  });
}

async function triggerHomeSearch(query) {
  const grid = document.getElementById('homeJobsGrid');
  const banner = document.getElementById('searchFeedbackBanner');
  const bannerText = document.getElementById('searchFeedbackText');
  if (!grid) return;

  if (!query) {
    if (banner) banner.classList.add('hidden');
    initHomePage();
    return;
  }

  if (banner && bannerText) {
    banner.classList.remove('hidden');
    bannerText.textContent = 'Showing results for "' + query + '"';
  }

  const data = await fetchJson(withCity('/jobs?q=' + encodeURIComponent(query)));
  grid.innerHTML = '';

  if (!data || !data.jobs || data.jobs.length === 0) {
    grid.innerHTML = '<div class="data-state" style="grid-column: 1/-1;">No jobs matching "' + query + '". <a href="services.html?q=' + encodeURIComponent(query) + '" style="color: var(--primary); text-decoration: underline;">Search in Services →</a></div>';
    return;
  }

  data.jobs.forEach(job => grid.appendChild(createJobCard(job)));
}

// ========================================================
// SERVICES PAGE ENGINE (WITH WORK PROFILE DELETION)
// ========================================================
async function initServicesPage() {
  const catGrid = document.getElementById('categoriesGrid');
  const listGrid = document.getElementById('servicesListGrid');
  const toggleBtn = document.getElementById('toggleCategoriesBtn');
  const countBadge = document.getElementById('servicesCountBadge');

  const categories = [
    { title: 'Plumbing', icon: '🚰' },
    { title: 'Cleaning', icon: '🧹' },
    { title: 'Electrical', icon: '⚡' },
    { title: 'Carpentry', icon: '🪚' },
    { title: 'Home Repairs', icon: '🏠' },
    { title: 'Painting', icon: '🎨' },
    { title: 'Appliance Repair', icon: '🔌' },
    { title: 'Pest Control', icon: '🐜' },
    { title: 'Packers & Movers', icon: '📦' },
    { title: 'Gardening', icon: '🌱' }
  ];

  function renderCategories() {
    if (!catGrid) return;
    catGrid.innerHTML = '';
    const visibleList = showAllCategories ? categories : categories.slice(0, 5);
    
    visibleList.forEach(s => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.innerHTML = `
        <span class="cat-icon">${s.icon || '🛠️'}</span>
        <h3 class="cat-title">${s.title}</h3>
      `;
      card.addEventListener('click', () => {
        const input = document.getElementById('serviceSearchInput');
        if (input) {
          input.value = s.title;
          triggerServiceSearch(s.title);
        }
      });
      catGrid.appendChild(card);
    });

    if (toggleBtn) {
      toggleBtn.textContent = showAllCategories 
        ? 'Show Less (5) ↑' 
        : 'View All (' + categories.length + ') ↓';
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      showAllCategories = !showAllCategories;
      renderCategories();
    });
  }

  renderCategories();

  if (listGrid) {
    listGrid.innerHTML = '<div class="data-state">Loading verified local service providers...</div>';
    const data = await fetchJson(withCity('/services'));
    
    if (data && data.services && data.services.length > 0) {
      if (countBadge) countBadge.textContent = data.services.length + ' Available';
      listGrid.innerHTML = '';
      data.services.forEach(serv => listGrid.appendChild(createServiceProviderCard(serv)));
    } else {
      listGrid.innerHTML = '<div class="data-state">No service providers listed yet. Be the first to list!</div>';
    }
  }
}

async function triggerServiceSearch(query) {
  const listGrid = document.getElementById('servicesListGrid');
  const banner = document.getElementById('serviceSearchBanner');
  const bannerText = document.getElementById('serviceSearchText');
  const countBadge = document.getElementById('servicesCountBadge');
  if (!listGrid) return;

  if (!query) {
    if (banner) banner.classList.add('hidden');
    initServicesPage();
    return;
  }

  if (banner && bannerText) {
    banner.classList.remove('hidden');
    bannerText.textContent = 'Showing matching providers for "' + query + '"';
  }

  listGrid.innerHTML = '<div class="data-state">Searching matching services...</div>';
  const data = await fetchJson(withCity('/services?q=' + encodeURIComponent(query)));

  if (!data || !data.services || data.services.length === 0) {
    if (countBadge) countBadge.textContent = '0 Matches';
    listGrid.innerHTML = '<div class="data-state" style="grid-column: 1/-1;">No service providers found matching "' + query + '". <button class="primary-btn sm-btn" id="postNewServiceDirectBtn" style="margin-top: 0.5rem;">Offer this service as a Pro</button></div>';
    
    const postDirectBtn = document.getElementById('postNewServiceDirectBtn');
    if (postDirectBtn) postDirectBtn.addEventListener('click', () => openPostForm('service'));
    return;
  }

  if (countBadge) countBadge.textContent = data.services.length + ' Matches';
  listGrid.innerHTML = '';
  data.services.forEach(serv => listGrid.appendChild(createServiceProviderCard(serv)));
}

function createServiceProviderCard(serv) {
  const card = document.createElement('div');
  card.className = 'provider-card';
  const owned = isItemOwned(serv);
  
  card.innerHTML = `
    <div>
      <div class="provider-top">
        <span class="provider-category-badge">${serv.icon || '🛠️'} ${serv.category || 'Service'}</span>
        ${owned ? '<span class="owner-pill">👑 YOUR WORK PROFILE</span>' : ''}
        <span class="provider-price">${serv.price || '₹299 Base'}</span>
      </div>
      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0.5rem 0 0.25rem;">${serv.title}</h3>
      <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.45; margin: 0 0 0.5rem;">${serv.description || ''}</p>
      <p style="font-size: 0.76rem; color: var(--text-light); margin: 0 0 0.5rem;">Posted ${formatActivityTime(serv.createdAt)}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
        <span class="contact-phone-chip">📞 ${serv.phone || '+91 98765 43210'}</span>
        <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">👤 ${serv.providerName || 'Verified Pro'}</span>
        <span style="font-size: 0.82rem; color: #d97706; font-weight: 700;">⭐ ${serv.rating || 5.0}</span>
      </div>
    </div>
    <div style="display: flex; gap: 0.6rem; margin-top: 0.4rem; flex-wrap: wrap;">
      ${owned ? `
        <button class="outline-btn sm-btn delete-profile-btn" type="button" style="color: #dc2626; border-color: #fecaca; background: #fef2f2;">
          🗑️ Delete Work Profile
        </button>
      ` : `
        <button class="primary-btn sm-btn call-pro-btn" type="button">📞 Call Now</button>
        <button class="outline-btn sm-btn book-pro-btn" type="button">⚡ Book Service</button>
      `}
    </div>
  `;

  if (owned) {
    const deleteBtn = card.querySelector('.delete-profile-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to remove your "' + serv.title + '" work profile from LocalHub?')) {
          const res = await fetchJson('/services/' + serv.id, { method: 'DELETE' });
          if (res && res.success) {
            announceVoiceAction('Your service work profile has been removed.');
            alert('🗑️ Your service work profile has been removed.');
            initServicesPage();
          }
        }
      });
    }
  } else {
    card.querySelector('.call-pro-btn').addEventListener('click', () => {
      announceVoiceAction('Opening contact options.');
      alert('📞 Calling ' + (serv.providerName || 'Pro') + ' at ' + (serv.phone || '+91 98765 43210') + '...');
    });
    card.querySelector('.book-pro-btn').addEventListener('click', () => {
      announceVoiceAction('Booking request sent.');
      alert('⚡ Booking request sent to ' + (serv.providerName || 'Pro') + ' for "' + serv.title + '". They will call you at your registered phone within 10 minutes!');
      openFeedbackDialog(serv, 'service', serv.title);
    });
  }

  return card;
}

// ========================================================
// WORK PAGE ENGINE (WITH "FOUND HELPER" & DELETION)
// ========================================================
async function initWorkPage() {
  const grid = document.getElementById('workJobsGrid');
  const countBadge = document.getElementById('jobsCountBadge');
  const toggle = document.getElementById('workerToggleBtn');

  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const isActive = toggle.classList.contains('active');
      alert(isActive 
        ? '🟢 Worker availability turned ON! Local employers can reach you directly.' 
        : '⚪ Worker availability turned OFF.');
    });
  }

  if (!grid) return;

  grid.innerHTML = '<div class="data-state">Loading nearby job listings...</div>';
  const data = await fetchJson(withCity('/jobs'));

  if (!data || !data.jobs || data.jobs.length === 0) {
    grid.innerHTML = '<div class="data-state">No open positions right now. Post a job to hire!</div>';
    return;
  }

  if (countBadge) countBadge.textContent = data.jobs.length + ' Active Jobs';
  grid.innerHTML = '';
  data.jobs.forEach(job => grid.appendChild(createJobCard(job)));
  translatePage();
}

async function triggerWorkSearch(query) {
  const grid = document.getElementById('workJobsGrid');
  const banner = document.getElementById('workSearchBanner');
  const bannerText = document.getElementById('workSearchText');
  const countBadge = document.getElementById('jobsCountBadge');
  if (!grid) return;

  if (!query) {
    if (banner) banner.classList.add('hidden');
    initWorkPage();
    return;
  }

  if (banner && bannerText) {
    banner.classList.remove('hidden');
    bannerText.textContent = 'Showing matching jobs for "' + query + '"';
  }

  grid.innerHTML = '<div class="data-state">Searching jobs...</div>';
  const data = await fetchJson(withCity('/jobs?q=' + encodeURIComponent(query)));

  if (!data || !data.jobs || data.jobs.length === 0) {
    if (countBadge) countBadge.textContent = '0 Matches';
    grid.innerHTML = '<div class="data-state" style="grid-column: 1/-1;">No jobs found matching "' + query + '". <button class="primary-btn sm-btn" id="postJobSearchBtn" style="margin-top: 0.5rem;">Post this Job Opening</button></div>';
    
    const postJobBtn = document.getElementById('postJobSearchBtn');
    if (postJobBtn) postJobBtn.addEventListener('click', () => openPostForm('job'));
    return;
  }

  if (countBadge) countBadge.textContent = data.jobs.length + ' Matches';
  grid.innerHTML = '';
  data.jobs.forEach(job => grid.appendChild(createJobCard(job)));
}

function createJobCard(job) {
  const card = document.createElement('div');
  card.className = 'job-card';
  const owned = isItemOwned(job);
  
  card.innerHTML = `
    <div>
      <div class="job-card-header">
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <h3>${job.title}</h3>
          ${owned ? '<span class="owner-pill">👑 POSTED BY YOU</span>' : ''}
        </div>
        <span class="job-salary-tag">${job.salary || 'Competitive Pay'}</span>
      </div>
      <p class="job-card-sub" style="margin-top: 0.35rem;">
        📍 ${job.location || job.distance || 'Near you'} • ⏱️ ${job.timing || 'Immediate'}
      </p>
      <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.45; margin: 0.4rem 0;">
        ${job.description || 'Hiring nearby with direct payouts.'}
      </p>
      <p style="font-size: 0.76rem; color: var(--text-light); margin: 0 0 0.5rem;">Posted ${formatActivityTime(job.createdAt)}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
        <span class="contact-phone-chip">📞 ${job.phone || '+91 98765 43210'}</span>
        <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">👤 ${job.contactName || 'Employer'}</span>
      </div>
    </div>
    <div class="job-card-actions" style="flex-wrap: wrap;">
      ${owned ? `
        <button class="primary-btn sm-btn helper-found-btn" type="button" style="background: #059669; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.28);">
          ✅ Found Helper (Close Job)
        </button>
        <button class="outline-btn sm-btn delete-job-btn" type="button" style="color: #dc2626; border-color: #fecaca; background: #fef2f2;">
          🗑️ Remove
        </button>
      ` : `
        <button class="primary-btn sm-btn apply-btn" type="button">⚡ Apply Now</button>
        <button class="outline-btn sm-btn call-employer-btn" type="button">📞 Contact</button>
      `}
    </div>
  `;

  if (owned) {
    // Fulfill Job (Helper Found)
    const fulfillBtn = card.querySelector('.helper-found-btn');
    if (fulfillBtn) {
      fulfillBtn.addEventListener('click', async () => {
        if (confirm('🎉 Congratulations! Did you find a helper for "' + job.title + '"?\n\nThis will remove the job from the public board and move it to your Completed History.')) {
          const res = await fetchJson('/jobs/' + job.id + '/fulfill', { method: 'POST' });
          if (res && res.success) {
            announceVoiceAction('Your job was marked as fulfilled and archived.');
            alert('🎉 Job marked as fulfilled! It has been removed from the public board and archived in your Profile History.');
            if (window.location.pathname.includes('work')) initWorkPage();
            else if (window.location.pathname.includes('home')) initHomePage();
          }
        }
      });
    }

    // Delete Job
    const deleteBtn = card.querySelector('.delete-job-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this job listing?')) {
          const res = await fetchJson('/jobs/' + job.id, { method: 'DELETE' });
          if (res && res.success) {
            announceVoiceAction('Your job listing was deleted.');
            alert('🗑️ Job listing removed.');
            if (window.location.pathname.includes('work')) initWorkPage();
            else if (window.location.pathname.includes('home')) initHomePage();
          }
        }
      });
    }
  } else {
    card.querySelector('.apply-btn').addEventListener('click', () => {
        announceVoiceAction('Your application was submitted.');
      alert('🎉 Application submitted for "' + job.title + '"! ' + (job.contactName || 'The employer') + ' has been notified and will contact you directly at your registered phone.');
      openFeedbackDialog(job, 'job', job.title);
    });
    card.querySelector('.call-employer-btn').addEventListener('click', () => {
        announceVoiceAction('Opening contact options.');
      alert('📞 Contacting ' + (job.contactName || 'Employer') + ' at ' + (job.phone || '+91 98765 43210') + ' for "' + job.title + '"');
    });
  }

  return card;
}

// ========================================================
// COMMUNITY PAGE ENGINE
// ========================================================
async function initCommunityPage() {
  const list = document.getElementById('communityFeedList');
  const countBadge = document.getElementById('communityCountBadge');
  if (!list) return;

  list.innerHTML = '<div class="data-state">Loading community feed...</div>';
  const data = await fetchJson(withCity('/posts'));

  if (!data || !data.posts || data.posts.length === 0) {
    list.innerHTML = '<div class="data-state">No posts in your neighborhood yet. Share the first update!</div>';
    return;
  }

  if (countBadge) countBadge.textContent = data.posts.length + ' Updates';
  list.innerHTML = '';
  data.posts.forEach(p => list.appendChild(createCommunityCard(p)));
}

async function triggerCommunitySearch(query) {
  const list = document.getElementById('communityFeedList');
  const banner = document.getElementById('communitySearchBanner');
  const bannerText = document.getElementById('communitySearchText');
  const countBadge = document.getElementById('communityCountBadge');
  if (!list) return;

  if (!query) {
    if (banner) banner.classList.add('hidden');
    initCommunityPage();
    return;
  }

  if (banner && bannerText) {
    banner.classList.remove('hidden');
    bannerText.textContent = 'Showing community notices for "' + query + '"';
  }

  list.innerHTML = '<div class="data-state">Searching posts...</div>';
  const data = await fetchJson(withCity('/posts?q=' + encodeURIComponent(query)));

  if (!data || !data.posts || data.posts.length === 0) {
    if (countBadge) countBadge.textContent = '0 Matches';
    list.innerHTML = '<div class="data-state">No community posts matching "' + query + '". <button class="primary-btn sm-btn" id="postCommunitySearchBtn" style="margin-top: 0.5rem;">Post to Community</button></div>';
    
    const postCommBtn = document.getElementById('postCommunitySearchBtn');
    if (postCommBtn) postCommBtn.addEventListener('click', () => openPostForm('community'));
    return;
  }

  if (countBadge) countBadge.textContent = data.posts.length + ' Matches';
  list.innerHTML = '';
  data.posts.forEach(p => list.appendChild(createCommunityCard(p)));
}

function createCommunityCard(p) {
  const card = document.createElement('div');
  card.className = 'post-card';
  const owned = isItemOwned(p);
  const isEmergency = p.category && (p.category.includes('Emergency') || p.category.includes('Blood'));
  
  card.innerHTML = `
    <div class="post-header-row">
      <div style="display: flex; gap: 0.4rem; align-items: center;">
        <span class="post-label ${isEmergency ? 'work-tag' : ''}">${p.category || 'COMMUNITY'}</span>
        ${owned ? '<span class="owner-pill">👑 YOUR POST</span>' : ''}
      </div>
      <span class="post-time">📍 ${p.location || 'Nearby'}</span>
    </div>
    <h3 style="margin: 0.4rem 0 0.25rem;">${p.title}</h3>
    <p>${p.detail || p.content || ''}</p>
    <p style="font-size: 0.76rem; color: var(--text-light); margin: 0.35rem 0;">Posted ${formatActivityTime(p.createdAt)}</p>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin: 0.4rem 0;">
      <span class="contact-phone-chip">📞 ${p.phone || '+91 98765 43210'}</span>
      <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-main);">👤 ${p.contactName || 'Neighbor'}</span>
    </div>
    <div class="post-footer-actions">
      ${owned ? `
        <button class="post-reply-btn delete-post-btn" type="button" style="color: #dc2626; border-color: #fecaca; background: #fef2f2;">🗑️ Delete Post</button>
      ` : `
        <button class="post-reply-btn helpful-btn" type="button">👍 Helpful (4)</button>
        <button class="post-reply-btn reply-btn" type="button">💬 Reply</button>
        <button class="post-reply-btn call-btn" type="button" style="background: #ecfdf5; color: #059669; border-color: #a7f3d0;">📞 Call</button>
      `}
    </div>
  `;

  if (owned) {
    const delBtn = card.querySelector('.delete-post-btn');
    if (delBtn) {
      delBtn.addEventListener('click', async () => {
        if (confirm('Delete this community notice?')) {
          const res = await fetchJson('/posts/' + p.id, { method: 'DELETE' });
          if (res && res.success) {
            announceVoiceAction('Your community post was deleted.');
            alert('Notice deleted.');
            initCommunityPage();
          }
        }
      });
    }
  } else {
    const helpfulBtn = card.querySelector('.helpful-btn');
    let count = 4;
    helpfulBtn.addEventListener('click', () => {
      count++;
      helpfulBtn.innerHTML = '👍 Helpful (' + count + ')';
      helpfulBtn.style.color = 'var(--primary)';
      openFeedbackDialog(p, 'community', p.title);
    });

    card.querySelector('.reply-btn').addEventListener('click', () => {
      const reply = prompt('Reply to "' + p.title + '":');
      if (reply) {
        announceVoiceAction('Your reply was posted.');
        alert('Your reply has been posted to the neighborhood feed!');
      }
    });

    card.querySelector('.call-btn').addEventListener('click', () => {
      announceVoiceAction('Opening contact options.');
      alert('📞 Calling ' + (p.contactName || 'Neighbor') + ' at ' + (p.phone || '+91 98765 43210') + ' regarding "' + p.title + '"');
    });
  }

  return card;
}

// ========================================================
// PROFILE & USER HISTORY ENGINE
// ========================================================
function formatActivityTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return 'Date unavailable';

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return 'just now';
  if (elapsedSeconds < 3600) return Math.floor(elapsedSeconds / 60) + ' min ago';
  if (elapsedSeconds < 86400) return Math.floor(elapsedSeconds / 3600) + ' hrs ago';

  const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return time + ' (' + day + '/' + month + '/' + date.getFullYear() + ')';
}

function formatLastSeen(value) {
  if (!value) return 'Last seen unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Last seen unavailable';
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return 'Last seen just now';
  if (elapsedSeconds < 3600) return 'Last seen ' + Math.floor(elapsedSeconds / 60) + ' min ago';
  if (elapsedSeconds < 86400) return 'Last seen ' + Math.floor(elapsedSeconds / 3600) + ' hrs ago';
  return 'Last seen ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '') + ' (' + date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ')';
}

function openFeedbackDialog(record, type, title) {
  const user = getCurrentUser();
  if (!user.email || !record.ownerEmail) {
    alert('Feedback is unavailable until the listing owner has an account email.');
    return;
  }
  showCustomModal('⭐ Share your feedback', `
    <div class="feedback-dialog">
      <p>How was your experience with ${title || 'this listing'}?</p>
      <div class="feedback-stars" role="radiogroup" aria-label="Rating from one to five stars">
        ${[1, 2, 3, 4, 5].map(value => `<button type="button" class="feedback-star" data-rating="${value}" aria-label="${value} stars">★</button>`).join('')}
      </div>
      <textarea id="feedbackCommentInput" placeholder="Tell the community about your experience (optional)"></textarea>
      <button type="button" class="primary-btn" id="submitFeedbackBtn" disabled>Submit feedback</button>
    </div>
  `);

  let rating = 0;
  const stars = document.querySelectorAll('.feedback-star');
  stars.forEach(star => star.addEventListener('click', () => {
    rating = Number(star.dataset.rating);
    stars.forEach(item => item.classList.toggle('selected', Number(item.dataset.rating) <= rating));
    document.getElementById('submitFeedbackBtn').disabled = false;
  }));
  document.getElementById('submitFeedbackBtn').addEventListener('click', async () => {
    const response = await fetchJson('/feedback', {
      method: 'POST',
      body: JSON.stringify({
        authorEmail: user.email,
        targetEmail: record.ownerEmail,
        type,
        recordId: record.id,
        rating,
        comment: document.getElementById('feedbackCommentInput').value
      })
    });
    if (response && response.success) {
      document.getElementById('customHistoryModal').classList.remove('open');
      alert('Thank you. Your feedback updated the member trust score.');
    } else alert((response && response.error) || 'Feedback could not be saved.');
  });
}

function setupHelpSupport() {
  const askButton = document.getElementById('openHelpAssistantBtn');
  const humanButton = document.getElementById('requestHumanSupportBtn');
  if (askButton) askButton.addEventListener('click', () => {
    showCustomModal('❔ Help assistant', `
      <div class="help-dialog">
        <p class="tool-copy">Ask about login, phone verification, posting, ratings, language, voice, or any LocalHub feature.</p>
        <label for="helpQuestionInput">Your question</label>
        <textarea id="helpQuestionInput" placeholder="How do I verify my phone?"></textarea>
        <button class="primary-btn" id="submitHelpQuestionBtn" type="button">Ask LocalHub</button>
        <div class="help-answer hidden" id="helpAnswer" aria-live="polite"></div>
      </div>
    `);
    document.getElementById('submitHelpQuestionBtn')?.addEventListener('click', async () => {
      const input = document.getElementById('helpQuestionInput');
      const answer = document.getElementById('helpAnswer');
      const question = input ? input.value.trim() : '';
      if (!question || !answer) return;
      answer.classList.remove('hidden');
      answer.textContent = 'Thinking...';
      const data = await fetchJson('/help', { method: 'POST', body: JSON.stringify({ question }) });
      const response = data && data.answer ? await translateText(data.answer) : 'I could not answer that yet. Please request human support.';
      answer.textContent = response;
      announceVoiceAction(response);
    });
  });

  if (humanButton) humanButton.addEventListener('click', () => {
    showCustomModal('🧑‍💼 Human support', `
      <div class="help-dialog">
        <p class="tool-copy">Tell us what needs attention. A support owner can follow up using your account details.</p>
        <label for="supportIssueInput">Describe the issue</label>
        <textarea id="supportIssueInput" placeholder="Describe the problem..."></textarea>
        <button class="primary-btn" id="submitHumanSupportBtn" type="button">Send support request</button>
      </div>
    `);
    document.getElementById('submitHumanSupportBtn')?.addEventListener('click', async () => {
      const submitButton = document.getElementById('submitHumanSupportBtn');
      const issue = document.getElementById('supportIssueInput')?.value.trim();
      const user = getCurrentUser();
      if (!issue) {
        alert('Please describe the problem before sending your support request.');
        return;
      }
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
      const data = await fetchJson('/support/request', { method: 'POST', body: JSON.stringify({ issue, email: user.email || '', name: user.name || '', language: getAppLanguage() }) });
      if (data && data.success) {
        document.getElementById('customHistoryModal')?.classList.remove('open');
        announceVoiceAction('Your human support request was sent.');
        alert('Your support request was sent. A human support agent will follow up.');
      } else {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Send support request';
        }
        alert((data && data.error) || 'The support request could not be sent. Please check that the app server is running and try again.');
      }
    });
  });
}

function initProfilePage() {
  const user = getCurrentUser();
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const phoneEl = document.getElementById('profilePhone');
  const locEl = document.getElementById('profileLoc');
  const avatarEl = document.getElementById('profileAvatar');
  const logoutBtn = document.getElementById('logoutBtn');
  const verificationBadge = document.getElementById('profileVerificationBadge');
  const statusEl = document.getElementById('profileStatus');
  const statusSummaryEl = document.getElementById('profileStatusSummary');
  const lastSeenEl = document.getElementById('profileLastSeen');
  const phoneVerificationEl = document.getElementById('profilePhoneVerification');
  const trustScoreEl = document.getElementById('profileTrustScore');
  const serviceCountBadge = document.getElementById('serviceCountBadge');
  const jobCountBadge = document.getElementById('jobCountBadge');
  const postCountBadge = document.getElementById('postCountBadge');
  const phoneInput = document.getElementById('phoneNumberInput');
  const requestOtpBtn = document.getElementById('requestPhoneOtpBtn');
  const otpControls = document.getElementById('phoneOtpControls');
  const otpInput = document.getElementById('phoneOtpInput');
  const verifyOtpBtn = document.getElementById('verifyPhoneOtpBtn');
  const voiceResponseToggle = document.getElementById('voiceResponseToggle');

  function updateVoiceResponseToggle() {
    const enabled = localStorage.getItem('localhubVoiceResponses') !== 'off';
    if (!voiceResponseToggle) return;
    voiceResponseToggle.textContent = enabled ? 'Voice: On' : 'Voice: Off';
    voiceResponseToggle.setAttribute('aria-pressed', String(enabled));
  }

  updateVoiceResponseToggle();
  if (voiceResponseToggle) {
    voiceResponseToggle.addEventListener('click', () => {
      const enabled = localStorage.getItem('localhubVoiceResponses') !== 'off';
      const message = enabled ? 'Voice responses are now off.' : 'Voice responses are now on.';
      if (enabled) speakVoiceAssistant(message);
      localStorage.setItem('localhubVoiceResponses', enabled ? 'off' : 'on');
      updateVoiceResponseToggle();
      if (!enabled) speakVoiceAssistant(message);
    });
  }

  function historyUrl() {
    return '/user/history?phone=' + encodeURIComponent(user.phone || '') + '&email=' + encodeURIComponent(user.email || '');
  }

  async function loadProfileCounts() {
    const data = await fetchJson(historyUrl());
    if (!data || !data.success) return;
    if (serviceCountBadge) serviceCountBadge.textContent = data.serviceCount + ' ACTIVE';
    if (jobCountBadge) jobCountBadge.textContent = data.jobCount + ' POSTED';
    if (postCountBadge) postCountBadge.textContent = data.postCount + ' POSTS';
  }

  loadProfileCounts();

  if (user.email) {
    fetchJson('/user/profile?email=' + encodeURIComponent(user.email)).then(data => {
      if (!data || !data.success) return;
      localStorage.setItem('localhubUser', JSON.stringify(data.user));
      applyProfileVerification(data.user);
      if (phoneEl) phoneEl.textContent = data.user.phone || 'Not provided';
    });
  }

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (phoneEl) phoneEl.textContent = user.phone || 'Not provided';
  if (avatarEl) avatarEl.textContent = user.name ? user.name.trim().charAt(0).toUpperCase() : 'M';

  function applyProfileVerification(profile) {
    const isVerified = Boolean(profile.verified);
    const phoneIsVerified = Boolean(profile.phoneVerified);
    if (verificationBadge) verificationBadge.textContent = isVerified ? '✔ Verified Member' : 'Account not verified';
    if (statusEl) statusEl.textContent = profile.active ? 'Active member' : 'Account inactive';
    if (statusSummaryEl) statusSummaryEl.textContent = formatLastSeen(profile.lastLoginAt);
    if (lastSeenEl) lastSeenEl.textContent = formatLastSeen(profile.lastLoginAt);
    if (phoneVerificationEl) phoneVerificationEl.textContent = phoneIsVerified ? '✔ Phone verified' : 'Phone not verified';
    if (trustScoreEl) trustScoreEl.textContent = typeof profile.trustScore === 'number'
      ? '⭐ ' + profile.trustScore.toFixed(1) + ' / 5.0 (' + (profile.ratingCount || 0) + ' ratings)'
      : 'Not available yet';
  }

  applyProfileVerification(user);

  if (phoneInput) phoneInput.value = user.phone || '';
  if (requestOtpBtn) requestOtpBtn.addEventListener('click', async () => {
    const phone = phoneInput.value.trim();
    requestOtpBtn.disabled = true;
    const data = await fetchJson('/user/phone/request-otp', {
      method: 'POST', body: JSON.stringify({ email: user.email, phone })
    });
    requestOtpBtn.disabled = false;
    if (data && data.success) {
      otpControls.classList.remove('hidden');
      alert(data.developmentOtp
        ? 'Development OTP: ' + data.developmentOtp + '\nThis is available because LOCAL_OTP_MODE is enabled.'
        : 'A verification code was sent to your phone.');
    } else alert((data && data.error) || 'Could not send the verification code.');
  });

  if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', async () => {
    const data = await fetchJson('/user/phone/verify-otp', {
      method: 'POST', body: JSON.stringify({ email: user.email, otp: otpInput.value.trim() })
    });
    if (data && data.success) {
      localStorage.setItem('localhubUser', JSON.stringify(data.user));
      applyProfileVerification(data.user);
      phoneInput.value = data.user.phone;
      otpControls.classList.add('hidden');
      alert('Phone number verified successfully.');
    } else alert((data && data.error) || 'Could not verify the code.');
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('localhubUser');
        window.location.href = 'index.html';
      }
    });
  }

  // Interactive Saved History Modals
  const myReqs = document.getElementById('myRequestsCard');
  const myJobs = document.getElementById('myJobsCard');
  const myPosts = document.getElementById('myPostsCard');
  const settings = document.getElementById('accountSettingsCard');

  if (myJobs) {
    myJobs.addEventListener('click', async () => {
      const data = await fetchJson(historyUrl());
      const list = (data && data.myJobs) ? data.myJobs : [];
      
      let modalContent = '<div style="display: grid; gap: 0.85rem;">';
      if (list.length === 0) {
        modalContent += '<p style="color: var(--text-muted);">No job listings posted yet. Post a job to hire helpers!</p>';
      } else {
        list.forEach(j => {
          const isFulfilled = j.status === 'fulfilled';
          modalContent += `
            <div style="background: var(--surface-subtle); border: 1.5px solid var(--surface-border); border-radius: 14px; padding: 1rem; display: grid; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <strong style="font-size: 1rem; color: var(--text-main);">${j.title}</strong>
                <span style="font-size: 0.76rem; font-weight: 800; padding: 0.2rem 0.55rem; border-radius: 999px; ${isFulfilled ? 'background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;' : 'background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe;'}">
                  ${isFulfilled ? '✅ HELPER FOUND (CLOSED)' : '🟢 ACTIVE LISTING'}
                </span>
              </div>
              <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">${j.salary || ''} • ${j.location || ''} • ${formatActivityTime(j.createdAt)} ${j.closedAt ? '• Closed on ' + j.closedAt : ''}</p>
            </div>
          `;
        });
      }
      modalContent += '</div>';

      showCustomModal('💼 My Jobs & Helper History', modalContent);
    });
  }

  if (myReqs) {
    myReqs.addEventListener('click', async () => {
      const data = await fetchJson(historyUrl());
      const list = (data && data.myServices) ? data.myServices : [];
      
      let modalContent = '<div style="display: grid; gap: 0.85rem;">';
      if (list.length === 0) {
        modalContent += '<p style="color: var(--text-muted);">No active service work profiles listed. You can list your skills as a pro!</p>';
      } else {
        list.forEach(s => {
          modalContent += `
            <div style="background: var(--surface-subtle); border: 1.5px solid var(--surface-border); border-radius: 14px; padding: 1rem; display: grid; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <strong style="font-size: 1rem; color: var(--text-main);">${s.icon || '🛠️'} ${s.title}</strong>
                <span class="owner-pill">ACTIVE WORK PROFILE</span>
              </div>
              <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">${s.category} • ${s.price || 'Standard'} • ${s.phone || 'Phone not provided'} • ${formatActivityTime(s.createdAt)}</p>
              <div style="margin-top: 0.4rem;">
                <button class="outline-btn sm-btn" onclick="deleteServiceDirect(${s.id})" style="color: #dc2626; border-color: #fecaca; background: #fef2f2;">🗑️ Delete Work Profile</button>
              </div>
            </div>
          `;
        });
      }
      modalContent += '</div>';

      showCustomModal('📋 My Service Profiles & Requests', modalContent);
    });
  }

  if (myPosts) {
    myPosts.addEventListener('click', async () => {
      const data = await fetchJson(historyUrl());
      const list = (data && data.myPosts) ? data.myPosts : [];
      
      let modalContent = '<div style="display: grid; gap: 0.85rem;">';
      if (list.length === 0) {
        modalContent += '<p style="color: var(--text-muted);">No community notices posted yet.</p>';
      } else {
        list.forEach(p => {
          modalContent += `
            <div style="background: var(--surface-subtle); border: 1.5px solid var(--surface-border); border-radius: 14px; padding: 1rem; display: grid; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <strong style="font-size: 1rem; color: var(--text-main);">${p.title}</strong>
                <span class="post-label">${p.category || 'COMMUNITY'}</span>
              </div>
              <p style="font-size: 0.84rem; color: var(--text-muted); margin: 0;">${p.detail || ''}</p>
              <span style="font-size: 0.76rem; color: var(--text-light);">Posted ${formatActivityTime(p.createdAt)}</span>
            </div>
          `;
        });
      }
      modalContent += '</div>';

      showCustomModal('💬 My Community Posts', modalContent);
    });
  }

  if (settings) {
    settings.addEventListener('click', () => {
      document.getElementById('phoneNumberInput')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.getElementById('phoneNumberInput')?.focus();
      announceVoiceAction('Opening account and privacy settings.');
    });
  }
}

// Global helper for profile modal direct actions
window.deleteServiceDirect = async function(id) {
  if (confirm('Are you sure you want to delete this service work profile?')) {
    const res = await fetchJson('/services/' + id, { method: 'DELETE' });
    if (res && res.success) {
      alert('Service work profile deleted successfully.');
      window.location.reload();
    }
  }
};

function showCustomModal(title, htmlContent) {
  let modal = document.getElementById('customHistoryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'customHistoryModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-card" style="max-height: 80vh; overflow-y: auto;">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="icon-btn" onclick="document.getElementById('customHistoryModal').classList.remove('open')">✕</button>
      </div>
      <div style="margin-top: 0.85rem;">
        ${htmlContent}
      </div>
    </div>
  `;

  modal.classList.add('open');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

// ========================================================
// INTERACTIVE MULTI-STEP POST MODAL ENGINE
// ========================================================
function setupInteractivePostModal() {
  const openBtn = document.getElementById('openPostSheetBtn');
  const modal = document.getElementById('createPostModal');
  const closeBtn = document.getElementById('closePostModalBtn');

  const selectView = document.getElementById('postTypeSelectView');
  const jobForm = document.getElementById('jobFormView');
  const serviceForm = document.getElementById('serviceFormView');
  const communityForm = document.getElementById('communityFormView');

  if (!openBtn || !modal) return;

  openBtn.addEventListener('click', () => {
    resetPostModal();
    modal.classList.add('open');
  });

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  document.querySelectorAll('.close-modal-step-btn').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.remove('open'));
  });

  document.querySelectorAll('.back-to-type-btn').forEach(btn => {
    btn.addEventListener('click', () => resetPostModal());
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  const selectJobBtn = document.getElementById('selectJobTypeBtn');
  const selectServiceBtn = document.getElementById('selectServiceTypeBtn');
  const selectCommunityBtn = document.getElementById('selectCommunityTypeBtn');

  if (selectJobBtn) selectJobBtn.addEventListener('click', () => openPostForm('job'));
  if (selectServiceBtn) selectServiceBtn.addEventListener('click', () => openPostForm('service'));
  if (selectCommunityBtn) selectCommunityBtn.addEventListener('click', () => openPostForm('community'));

  const user = getCurrentUser();
  const curLoc = localStorage.getItem('localhubLocation') || 'Hyderabad, Telangana';

  if (document.getElementById('jobPosterNameInput')) document.getElementById('jobPosterNameInput').value = user.name || '';
  if (document.getElementById('jobPhoneInput')) document.getElementById('jobPhoneInput').value = user.phone || '';
  if (document.getElementById('jobLocationInput')) document.getElementById('jobLocationInput').value = curLoc;

  if (document.getElementById('serviceProviderNameInput')) document.getElementById('serviceProviderNameInput').value = user.name || '';
  if (document.getElementById('servicePhoneInput')) document.getElementById('servicePhoneInput').value = user.phone || '';
  if (document.getElementById('serviceLocationInput')) document.getElementById('serviceLocationInput').value = curLoc;

  if (document.getElementById('communityNameInput')) document.getElementById('communityNameInput').value = user.name || '';
  if (document.getElementById('communityPhoneInput')) document.getElementById('communityPhoneInput').value = user.phone || '';
  if (document.getElementById('communityLocationInput')) document.getElementById('communityLocationInput').value = curLoc;

  if (jobForm) {
    jobForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        type: 'job',
        title: document.getElementById('jobTitleInput').value.trim(),
        salary: document.getElementById('jobSalaryInput').value.trim(),
        timing: document.getElementById('jobTimingInput').value.trim(),
        contactName: document.getElementById('jobPosterNameInput').value.trim(),
        phone: document.getElementById('jobPhoneInput').value.trim(),
        email: user.email || '',
        location: document.getElementById('jobLocationInput').value.trim(),
        description: document.getElementById('jobDescInput').value.trim()
      };

      const res = await fetchJson('/post', { method: 'POST', body: JSON.stringify(payload) });
      modal.classList.remove('open');

      if (res && res.success) {
        announceVoiceAction('Your job post was accepted and published.');
        alert('🎉 Job Opening published live! It is now visible on the Work and Home pages.');
        if (window.location.pathname.includes('work')) initWorkPage();
        else if (window.location.pathname.includes('home')) initHomePage();
        else window.location.href = 'work.html';
      }
    });
  }

  if (serviceForm) {
    serviceForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        type: 'service',
        category: document.getElementById('serviceCategorySelect').value,
        title: document.getElementById('serviceTitleInput').value.trim(),
        price: document.getElementById('servicePriceInput').value.trim(),
        contactName: document.getElementById('serviceProviderNameInput').value.trim(),
        phone: document.getElementById('servicePhoneInput').value.trim(),
        email: user.email || '',
        location: document.getElementById('serviceLocationInput').value.trim(),
        description: document.getElementById('serviceDescInput').value.trim()
      };

      const res = await fetchJson('/post', { method: 'POST', body: JSON.stringify(payload) });
      modal.classList.remove('open');

      if (res && res.success) {
        announceVoiceAction('Your service post was accepted and published.');
        alert('🎉 Your Service has been listed live! Neighbors can now call and book you.');
        if (window.location.pathname.includes('services')) initServicesPage();
        else window.location.href = 'services.html';
      }
    });
  }

  if (communityForm) {
    communityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        type: 'community',
        category: document.getElementById('communityCategorySelect').value,
        title: document.getElementById('communityTitleInput').value.trim(),
        contactName: document.getElementById('communityNameInput').value.trim(),
        phone: document.getElementById('communityPhoneInput').value.trim(),
        email: user.email || '',
        location: document.getElementById('communityLocationInput').value.trim(),
        description: document.getElementById('communityDescInput').value.trim()
      };

      const res = await fetchJson('/post', { method: 'POST', body: JSON.stringify(payload) });
      modal.classList.remove('open');

      if (res && res.success) {
        announceVoiceAction('Your community post was accepted and published.');
        alert('🎉 Community Notice published live to the neighborhood feed!');
        if (window.location.pathname.includes('community')) initCommunityPage();
        else window.location.href = 'community.html';
      }
    });
  }
}

function resetPostModal() {
  const selectView = document.getElementById('postTypeSelectView');
  const jobForm = document.getElementById('jobFormView');
  const serviceForm = document.getElementById('serviceFormView');
  const communityForm = document.getElementById('communityFormView');

  if (selectView) selectView.classList.remove('hidden');
  if (jobForm) jobForm.classList.add('hidden');
  if (serviceForm) serviceForm.classList.add('hidden');
  if (communityForm) communityForm.classList.add('hidden');
}

function openPostForm(type) {
  const modal = document.getElementById('createPostModal');
  const selectView = document.getElementById('postTypeSelectView');
  const jobForm = document.getElementById('jobFormView');
  const serviceForm = document.getElementById('serviceFormView');
  const communityForm = document.getElementById('communityFormView');

  if (modal) modal.classList.add('open');
  if (selectView) selectView.classList.add('hidden');
  if (jobForm) jobForm.classList.add('hidden');
  if (serviceForm) serviceForm.classList.add('hidden');
  if (communityForm) communityForm.classList.add('hidden');

  if (type === 'job' && jobForm) jobForm.classList.remove('hidden');
  if (type === 'service' && serviceForm) serviceForm.classList.remove('hidden');
  if (type === 'community' && communityForm) communityForm.classList.remove('hidden');
}
