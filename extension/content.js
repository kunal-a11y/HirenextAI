// =========================================
// PLATFORM DETECTION
// =========================================

function detectPlatform() {
  const url = window.location.href;
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('indeed.com')) return 'indeed';
  if (url.includes('naukri.com')) return 'naukri';
  if (url.includes('glassdoor.com')) return 'glassdoor';
  if (url.includes('internshala.com')) return 'internshala';
  if (url.includes('wellfound.com')) return 'wellfound';
  if (url.includes('foundit.com')) return 'foundit';
  if (url.includes('remoteok.com')) return 'remoteok';
  if (url.includes('remotive.com')) return 'remotive';
  if (url.includes('arbeitnow.com')) return 'arbeitnow';
  return 'generic';
}

// =========================================
// SMART JOB DETAILS SCRAPER ENGINE
// =========================================

function scrapeJobDetails() {
  const platform = detectPlatform();
  const details = {
    title: '',
    company: '',
    location: '',
    salary: '',
    experience: '',
    skills: '',
    description: '',
    recruiter: '',
    remoteStatus: 'On-site',
    postingDate: '',
    companyLogo: ''
  };

  try {
    if (platform === 'linkedin') {
      details.title = (document.querySelector('.job-details-jobs-unified-top-card__job-title') || 
                       document.querySelector('.jobs-unified-top-card__job-title') || 
                       document.querySelector('.jobs-details-sidebar__job-title') ||
                       document.querySelector('h1') || {}).textContent?.trim() || '';
      
      details.company = (document.querySelector('.job-details-jobs-unified-top-card__company-name') || 
                         document.querySelector('.jobs-unified-top-card__company-name') || 
                         document.querySelector('.jobs-details-sidebar__company-name') || {}).textContent?.trim() || '';
      
      details.location = (document.querySelector('.job-details-jobs-unified-top-card__bullet') || 
                          document.querySelector('.jobs-unified-top-card__bullet') || {}).textContent?.trim() || '';
      
      details.description = (document.querySelector('#job-details') || 
                             document.querySelector('.jobs-description') || 
                             document.querySelector('.jobs-box__html-content') || {}).textContent?.trim() || '';
      
      const logoEl = document.querySelector('.jobs-unified-top-card__company-logo img') || document.querySelector('.company-logo img');
      if (logoEl) details.companyLogo = logoEl.src;
      
      // Remote status check
      const text = document.body.textContent;
      if (text.includes('Remote') || text.includes('remote')) details.remoteStatus = 'Remote';
      else if (text.includes('Hybrid') || text.includes('hybrid')) details.remoteStatus = 'Hybrid';
    } 
    
    else if (platform === 'indeed') {
      details.title = (document.querySelector('.jobsearch-JobInfoHeader-title') || document.querySelector('h1') || {}).textContent?.trim() || '';
      details.company = (document.querySelector('[data-company-name="true"]') || document.querySelector('.jobsearch-InlineCompanyRating') || {}).textContent?.trim() || '';
      details.location = (document.querySelector('#jobLocationSection') || document.querySelector('.jobsearch-JobInfoHeader-subtitle') || {}).textContent?.trim() || '';
      details.description = (document.querySelector('#jobDescriptionText') || {}).textContent?.trim() || '';
    } 
    
    else if (platform === 'naukri') {
      details.title = (document.querySelector('.jd-header-title') || document.querySelector('[title="Job Title"]') || {}).textContent?.trim() || '';
      details.company = (document.querySelector('.jd-header-comp-name') || {}).textContent?.trim() || '';
      details.location = (document.querySelector('.locationVal') || {}).textContent?.trim() || '';
      details.description = (document.querySelector('.job-desc') || document.querySelector('.jd-desc') || {}).textContent?.trim() || '';
    } 
    
    else if (platform === 'glassdoor') {
      details.title = (document.querySelector('[data-test="job-title"]') || document.querySelector('.job-title') || {}).textContent?.trim() || '';
      details.company = (document.querySelector('[data-test="employer-name"]') || document.querySelector('.employer-name') || {}).textContent?.trim() || '';
      details.location = (document.querySelector('[data-test="location"]') || document.querySelector('.location') || {}).textContent?.trim() || '';
      details.description = (document.querySelector('#JobDescriptionContainer') || {}).textContent?.trim() || '';
    } 
    
    else if (platform === 'internshala') {
      details.title = (document.querySelector('.profile_on_detail_page') || {}).textContent?.trim() || '';
      details.company = (document.querySelector('.company_name') || {}).textContent?.trim() || '';
      details.location = (document.querySelector('.location_link') || {}).textContent?.trim() || '';
      details.description = (document.querySelector('.job_description') || document.querySelector('.internship_details') || {}).textContent?.trim() || '';
    }

    else if (platform === 'foundit') {
      details.title = (document.querySelector('.jdTitle') || document.querySelector('h1') || {}).textContent?.trim() || '';
      details.company = (document.querySelector('.jdCompanyName') || document.querySelector('.company-name') || {}).textContent?.trim() || '';
      details.location = (document.querySelector('.jdLocation') || document.querySelector('.location') || {}).textContent?.trim() || '';
      details.description = (document.querySelector('.jdDescription') || document.querySelector('.job-description') || {}).textContent?.trim() || '';
    }
    
    else {
      // Generic selectors fallback
      details.title = (document.querySelector('h1') || document.querySelector('.job-title') || document.querySelector('.title') || document.querySelector('title') || {}).textContent?.trim() || '';
      details.company = (document.querySelector('.company') || document.querySelector('.company-name') || document.querySelector('.employer') || {}).textContent?.trim() || '';
      details.location = (document.querySelector('.location') || document.querySelector('.job-location') || {}).textContent?.trim() || '';
      details.description = (document.querySelector('.job-description') || document.querySelector('.description') || document.querySelector('article') || document.querySelector('main') || {}).textContent?.trim() || '';
    }
  } catch (e) {
    console.error('Job scraping failed:', e);
  }

  // Parse details cleanups
  details.title = details.title.replace(/\s+/g, ' ').trim();
  details.company = details.company.replace(/\s+/g, ' ').trim();
  details.location = details.location.replace(/\s+/g, ' ').trim();
  
  // Extract experience requirements
  const expMatch = details.description.match(/(\d+)\s*-\s*(\d+)\s*years/i) || details.description.match(/(\d+)\s*\+\s*years/i) || details.description.match(/experience\s*of\s*(\d+)/i);
  if (expMatch) {
    details.experience = expMatch[0];
  } else {
    details.experience = 'Not specified';
  }

  // Extract remote details from desc
  if (details.remoteStatus === 'On-site') {
    if (/remote/i.test(details.description) || /work from home/i.test(details.description)) {
      details.remoteStatus = 'Remote';
    } else if (/hybrid/i.test(details.description)) {
      details.remoteStatus = 'Hybrid';
    }
  }

  return details;
}

// =========================================
// GLOBAL STATE & MESSAGING
// =========================================

let isAIRunning = false;
let isStopped = false;
let userProfileData = null;
let currentToken = null;
let activeJobData = null;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'START_AI_APPLY') {
    const { userProfile, jobData, token } = message;
    userProfileData = userProfile;
    currentToken = token;
    activeJobData = jobData;
    await startAIApply(userProfile, jobData, token);
  }
  
  if (message.type === 'STOP_AI') {
    stopAI();
  }
});

// Auto-trigger permissions checking and scraping on startup
setTimeout(async () => {
  const platform = detectPlatform();
  if (platform === 'unknown') return;

  chrome.storage.local.get(['permissions_settings', 'supported_sites', 'assistance_settings', 'onboarding_complete'], async (res) => {
    if (!res.onboarding_complete) return;
    
    // Check if permission for this platform is enabled
    const sites = res.supported_sites || {};
    if (platform !== 'generic' && sites[platform] === false) return;

    // Check if auto inject helper is enabled
    const assistance = res.assistance_settings || {};
    if (assistance.autoInject === false) return;

    // Check site visit permission prompt
    chrome.storage.local.get([`allow_site_${window.location.hostname}`], async (siteAllowed) => {
      const decision = siteAllowed[`allow_site_${window.location.hostname}`];
      
      if (decision === 'allow' || decision === 'always') {
        initializeAssistantWidget();
      } else if (decision !== 'deny') {
        // Show permission consent slider banner
        if (typeof showPermissionBanner === 'function') {
          showPermissionBanner();
        }
      }
    });
  });
}, 2000);

// Initialize sidebar toggle (replaces old mascot widget)
async function initializeAssistantWidget() {
  const jobDetails = scrapeJobDetails();
  
  // Create sidebar toggle button
  if (typeof createSidebarToggle === 'function') {
    createSidebarToggle(jobDetails);
  }
}

// Handle sidebar toggle from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TOGGLE_SIDEBAR') {
    if (typeof toggleSidebar === 'function') {
      toggleSidebar();
    }
    sendResponse({ success: true });
  }
});

// =========================================
// MAIN AI APPLY FLOW
// =========================================

async function startAIApply(userProfile, jobData, token) {
  isAIRunning = true;
  isStopped = false;
  
  if (typeof showOverlay === 'function') {
    showOverlay();
  }
  updateStatus('🔍 Locating application button...');
  chrome.runtime.sendMessage({ type: 'AI_STARTED' });
  
  const platform = detectPlatform();
  
  try {
    // 1. Locate and click Easy Apply / Apply button
    updateStatus('🖱️ Opening application form...');
    await findAndClickApply(platform);
    await sleep(2500);
    if (isStopped) return handleStop();
    
    // 2. Perform login if prompt is present
    updateStatus('🔐 Verifying authentication status...');
    await handleLoginIfNeeded(platform, userProfile);
    await sleep(1500);
    if (isStopped) return handleStop();
    
    // 3. Populate form fields
    updateStatus('📝 Filling application details...');
    await fillApplicationForm(platform, userProfile);
    await sleep(1000);
    if (isStopped) return handleStop();
    
    // 4. Attach Resume document
    updateStatus('📎 Uploading latest resume...');
    await uploadResume(userProfile.resume_url || userProfile.resumeUrl);
    await sleep(1500);
    if (isStopped) return handleStop();
    
    // 5. Capture Preview Screenshot
    updateStatus('📸 Preparing review snapshot...');
    const screenshot = await takeScreenshot();
    
    // 6. Complete and show Review Screen overlay
    updateStatus('✅ Done! Please review details before submitting.');
    if (typeof showDoneState === 'function') {
      showDoneState(screenshot, token, jobData);
    }
    
    playDoneSound();
    chrome.runtime.sendMessage({ 
      type: 'AI_DONE',
      screenshot: screenshot 
    });
    
  } catch (error) {
    updateStatus('❌ Alert: ' + error.message);
    if (typeof showErrorState === 'function') {
      showErrorState(error.message);
    }
  }
}

// =========================================
// FIND AND CLICK APPLY BUTTON
// =========================================

async function findAndClickApply(platform) {
  let applyButton = null;
  
  if (platform === 'linkedin') {
    applyButton = 
      document.querySelector('.jobs-apply-button') ||
      document.querySelector('[data-control-name="jobdetails_topcard_inapply"]') ||
      findButtonByText('Easy Apply') ||
      findButtonByText('Apply');
  }
  
  else if (platform === 'indeed') {
    applyButton = 
      document.querySelector('#indeedApplyButton') ||
      document.querySelector('.jobsearch-IndeedApplyButton') ||
      findButtonByText('Apply Now') ||
      findButtonByText('Apply');
  }
  
  else if (platform === 'naukri') {
    applyButton = 
      document.querySelector('.apply-button') ||
      document.querySelector('#apply-button') ||
      findButtonByText('Apply') ||
      findButtonByText('Apply Now');
  }
  
  else {
    applyButton = 
      findButtonByText('Easy Apply') ||
      findButtonByText('Apply Now') ||
      findButtonByText('Apply') ||
      findButtonByText('Submit Application');
  }
  
  if (!applyButton) {
    // If no explicit apply button but standard forms exist, we are already on form
    const input = document.querySelector('input');
    if (input) return;
    throw new Error('Could not find Apply button on this page');
  }
  
  applyButton.style.outline = '3px solid #000000';
  applyButton.style.outlineOffset = '2px';
  await sleep(1000);
  applyButton.click();
  applyButton.style.outline = '';
}

// =========================================
// LOGIN INTERCEPTOR
// =========================================

async function handleLoginIfNeeded(platform, userProfile) {
  await sleep(2000);
  
  const loginForm = 
    document.querySelector('input[type="email"]') ||
    document.querySelector('input[name="email"]') ||
    document.querySelector('#username');
    
  if (!loginForm) return; // Already logged in
  
  updateStatus('🔐 Authenticating profile credentials...');
  
  if (platform === 'linkedin') {
    const emailInput = document.querySelector('#username') || document.querySelector('input[name="session_key"]');
    const passInput = document.querySelector('#password') || document.querySelector('input[name="session_password"]');
    
    if (emailInput && userProfile.linkedin_email) {
      await typeSlowly(emailInput, userProfile.linkedin_email);
    }
    if (passInput && userProfile.linkedin_password) {
      await typeSlowly(passInput, userProfile.linkedin_password);
      await sleep(500);
      const submitBtn = document.querySelector('[type="submit"]') || findButtonByText('Sign in');
      if (submitBtn) submitBtn.click();
      await sleep(4000);
    }
  }
  
  else if (platform === 'indeed') {
    const emailInput = document.querySelector('input[name="__email"]') || document.querySelector('input[type="email"]');
    if (emailInput && userProfile.indeed_email) {
      await typeSlowly(emailInput, userProfile.indeed_email);
      const continueBtn = findButtonByText('Continue') || document.querySelector('[type="submit"]');
      if (continueBtn) {
        continueBtn.click();
        await sleep(2500);
      }
    }
  }
}

// =========================================
// AUTOFILL FORM FIELDS ENGINE
// =========================================

async function fillApplicationForm(platform, userProfile) {
  await sleep(1500);
  
  const fieldMappings = [
    {
      selectors: ['input[name="name"]', 'input[placeholder*="name" i]', 'input[id*="name" i]', 'input[autocomplete="name"]'],
      value: userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim()
    },
    {
      selectors: ['input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]', 'input[autocomplete="email"]'],
      value: userProfile.email
    },
    {
      selectors: ['input[type="tel"]', 'input[name="phone"]', 'input[placeholder*="phone" i]', 'input[placeholder*="mobile" i]', 'input[autocomplete="tel"]'],
      value: userProfile.phone
    },
    {
      selectors: ['input[name*="experience" i]', 'input[placeholder*="experience" i]', 'input[id*="experience" i]'],
      value: userProfile.years_experience || userProfile.experienceLevel || ''
    },
    {
      selectors: ['input[name*="location" i]', 'input[placeholder*="location" i]', 'input[placeholder*="city" i]'],
      value: userProfile.location
    },
    {
      selectors: ['input[name*="linkedin" i]', 'input[placeholder*="linkedin" i]'],
      value: userProfile.linkedin_url || userProfile.linkedinUrl
    },
    {
      selectors: ['input[name*="portfolio" i]', 'input[name*="website" i]', 'input[placeholder*="portfolio" i]'],
      value: userProfile.portfolio_url || userProfile.portfolio || userProfile.githubUrl
    },
    {
      selectors: ['input[name*="salary" i]', 'input[placeholder*="salary" i]', 'input[placeholder*="expected" i]'],
      value: userProfile.salary_expectation || ''
    }
  ];
  
  // 1. Fill standard inputs
  for (const field of fieldMappings) {
    if (!field.value) continue;
    
    for (const selector of field.selectors) {
      const inputs = document.querySelectorAll(selector);
      for (const input of inputs) {
        if (input && !input.value) {
          input.style.border = '2px solid #000000';
          input.style.background = 'rgba(0, 0, 0, 0.02)';
          
          await typeSlowly(input, field.value);
          await sleep(200);
          
          input.style.border = '';
          input.style.background = '';
        }
      }
    }
  }
  
  // 2. Identify custom questions & textareas
  const textareas = document.querySelectorAll('textarea');
  for (const textarea of textareas) {
    if (textarea.value) continue;
    
    const label = getFieldLabel(textarea).toLowerCase();
    
    if (label.includes('cover') || label.includes('why') || label.includes('about') || label.includes('message') || label.includes('describe')) {
      updateStatus('✍️ Drafting response with AI...');
      
      const responseText = await generateCustomFieldText(label, userProfile);
      
      textarea.style.border = '2px solid #000000';
      await typeSlowly(textarea, responseText);
      textarea.style.border = '';
      await sleep(400);
    }
  }
  
  // 3. Dropdowns & Dropdown selects
  const selects = document.querySelectorAll('select');
  for (const select of selects) {
    const label = getFieldLabel(select).toLowerCase();
    
    if (label.includes('experience') && userProfile.years_experience) {
      setSelectByValue(select, userProfile.years_experience);
    }
    
    if (label.includes('notice') || label.includes('joining')) {
      setSelectByText(select, 'Immediately') ||
      setSelectByText(select, '15 days') ||
      setSelectFirstOption(select);
    }
    
    if (label.includes('sponsor') || label.includes('visa')) {
      setSelectByText(select, 'No') || setSelectFirstOption(select);
    }
  }
  
  // 4. Checkboxes for terms & agreements
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  for (const checkbox of checkboxes) {
    const label = getFieldLabel(checkbox).toLowerCase();
    if (label.includes('terms') || label.includes('agree') || label.includes('consent') || label.includes('privacy')) {
      if (!checkbox.checked) checkbox.click();
    }
  }
}

// AI Custom Question/autofill helper
async function generateCustomFieldText(label, profile) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      url: '/api/ai/autofill',
      method: 'POST',
      body: {
        formFields: [{ name: 'question', label: label }],
        userProfile: profile,
        jobDescription: scrapeJobDetails().description
      }
    }, (res) => {
      if (res && res.ok && res.data && res.data.autofill) {
        resolve(res.data.autofill.question || res.data.autofill[Object.keys(res.data.autofill)[0]] || '');
      } else {
        // Fallback default response
        resolve(`With my background in ${profile.skills || 'relevant fields'} and ${profile.years_experience || 'several'} years of experience, I am confident in my ability to excel in this role. I have worked on multiple successful projects, collaborating with teams to deliver clean, scalable code.`);
      }
    });
  });
}

// =========================================
// ATTACH RESUME DOCUMENT
// =========================================

async function uploadResume(resumeUrl) {
  if (!resumeUrl) return;
  
  const fileInputs = document.querySelectorAll('input[type="file"]');
  for (const fileInput of fileInputs) {
    const label = getFieldLabel(fileInput).toLowerCase();
    
    if (label.includes('resume') || label.includes('cv') || fileInput.accept?.includes('.pdf') || fileInput.accept?.includes('.doc')) {
      updateStatus('📎 Fetching and uploading resume...');
      
      try {
        const response = await fetch(resumeUrl);
        const blob = await response.blob();
        const file = new File([blob], 'resume.pdf', { type: 'application/pdf' });
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(1500);
      } catch (e) {
        console.error('Resume upload helper failed:', e);
      }
      break;
    }
  }
}

// =========================================
// UTILITIES & HELPER INTERFACES
// =========================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeSlowly(element, text) {
  element.focus();
  element.value = '';
  
  for (const char of text) {
    element.value += char;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(25 + Math.random() * 15);
  }
}

function findButtonByText(text) {
  const buttons = document.querySelectorAll('button, a, [role="button"]');
  for (const btn of buttons) {
    if (btn.textContent.trim().toLowerCase().includes(text.toLowerCase())) {
      return btn;
    }
  }
  return null;
}

function getFieldLabel(element) {
  if (element.ariaLabel) return element.ariaLabel;
  if (element.placeholder) return element.placeholder;
  
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent;
  }
  
  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.textContent;
  
  const parent = element.parentElement;
  if (parent) return parent.textContent.slice(0, 60);
  
  return '';
}

function setSelectByValue(select, value) {
  for (const option of select.options) {
    if (option.value.includes(value) || option.text.includes(value)) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

function setSelectByText(select, text) {
  for (const option of select.options) {
    if (option.text.toLowerCase().includes(text.toLowerCase())) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
  }
  return false;
}

function setSelectFirstOption(select) {
  if (select.options.length > 1) {
    select.selectedIndex = 1;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

async function takeScreenshot() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'TAKE_SCREENSHOT' }, (response) => {
      resolve(response?.screenshot || null);
    });
  });
}

function stopAI() {
  isStopped = true;
  isAIRunning = false;
  updateStatus('🛑 AI stopped by user');
  
  setTimeout(() => {
    if (typeof hideOverlay === 'function') {
      hideOverlay();
    }
    chrome.runtime.sendMessage({ type: 'AI_STOPPED' });
  }, 1000);
}

function handleStop() {
  if (typeof hideOverlay === 'function') {
    hideOverlay();
  }
  chrome.runtime.sendMessage({ 
    type: 'AI_STOPPED',
    reason: 'user_stopped'
  });
}

function playDoneSound() {
  try {
    const audio = new Audio(chrome.runtime.getURL('sounds/done.mp3'));
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {
    // sound ignored
  }
}

// =========================================
// SPA NAVIGATION DETECTION
// =========================================
// Re-scrape job data when URL changes (LinkedIn, Glassdoor are SPAs)
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    setTimeout(() => {
      const jobDetails = scrapeJobDetails();
      if (jobDetails.title && typeof updateSidebarJobData === 'function') {
        updateSidebarJobData(jobDetails);
      }
    }, 2000);
  }
});
urlObserver.observe(document.body, { childList: true, subtree: true });

