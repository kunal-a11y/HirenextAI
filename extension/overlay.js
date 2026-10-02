// =========================================
// SIDEBAR MANAGEMENT SYSTEM
// =========================================

let sidebarVisible = false;
let sidebarIframe = null;
let currentJobDetails = null;

function createSidebarToggle(jobDetails) {
  currentJobDetails = jobDetails;

  const existingToggle = document.getElementById('hirenextai-sidebar-toggle');
  if (existingToggle) existingToggle.remove();
  const existingHelper = document.getElementById('hirenextai-mascot-widget');
  if (existingHelper) existingHelper.remove();

  const toggle = document.createElement('div');
  toggle.id = 'hirenextai-sidebar-toggle';
  toggle.className = 'hnai-sidebar-toggle';
  toggle.innerHTML = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="7" fill="currentColor" />
      <path d="M 50 50 V 25 H 35" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <path d="M 50 38 H 63" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <circle cx="63" cy="38" r="3.5" fill="currentColor" />
      <circle cx="35" cy="25" r="3.5" fill="currentColor" />
      <path d="M 50 50 H 75 V 35" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <path d="M 62 50 V 63" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <circle cx="62" cy="63" r="3.5" fill="currentColor" />
      <circle cx="75" cy="35" r="3.5" fill="currentColor" />
      <path d="M 50 50 V 75 H 65" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <path d="M 50 62 H 37" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <circle cx="37" cy="62" r="3.5" fill="currentColor" />
      <circle cx="65" cy="75" r="3.5" fill="currentColor" />
      <path d="M 50 50 H 25 V 65" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <path d="M 38 50 V 37" stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" />
      <circle cx="38" cy="37" r="3.5" fill="currentColor" />
      <circle cx="25" cy="65" r="3.5" fill="currentColor" />
    </svg>
    <div class="hnai-toggle-tooltip">Open HirenextAI</div>
  `;

  document.body.appendChild(toggle);
  toggle.addEventListener('click', toggleSidebar);
}

function toggleSidebar() {
  if (sidebarVisible) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  if (sidebarIframe) {
    sidebarIframe.style.transform = 'translateX(0)';
    sidebarVisible = true;
    updateTogglePosition(true);
    document.body.style.marginRight = '380px';
    return;
  }

  // Create sidebar container
  const container = document.createElement('div');
  container.id = 'hirenextai-sidebar-container';
  container.className = 'hnai-sidebar-container';

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'hirenextai-sidebar-iframe';
  iframe.className = 'hnai-sidebar-iframe';
  iframe.src = chrome.runtime.getURL('sidebar/sidebar.html');
  iframe.setAttribute('allow', 'clipboard-write');

  container.appendChild(iframe);
  document.body.appendChild(container);
  sidebarIframe = container;
  sidebarVisible = true;
  updateTogglePosition(true);

  // Push page content left
  document.body.style.transition = 'margin-right 0.3s ease';
  document.body.style.marginRight = '380px';

  // Send job data to sidebar after it loads
  iframe.addEventListener('load', () => {
    setTimeout(() => {
      iframe.contentWindow.postMessage({
        type: 'SIDEBAR_INIT',
        jobData: currentJobDetails
      }, '*');
    }, 500);
  });
}

function closeSidebar() {
  if (sidebarIframe) {
    sidebarIframe.style.transform = 'translateX(100%)';
    setTimeout(() => {
      document.body.style.marginRight = '0';
    }, 300);
  }
  sidebarVisible = false;
  updateTogglePosition(false);
}

function updateTogglePosition(sidebarOpen) {
  const toggle = document.getElementById('hirenextai-sidebar-toggle');
  if (toggle) {
    toggle.style.right = sidebarOpen ? '392px' : '24px';
    const tooltip = toggle.querySelector('.hnai-toggle-tooltip');
    if (tooltip) tooltip.textContent = sidebarOpen ? 'Close HirenextAI' : 'Open HirenextAI';
  }
}

function updateSidebarJobData(jobDetails) {
  currentJobDetails = jobDetails;
  const iframe = document.getElementById('hirenextai-sidebar-iframe');
  if (iframe) {
    iframe.contentWindow.postMessage({
      type: 'JOB_DATA_UPDATE',
      jobData: jobDetails
    }, '*');
  }
}

// Listen for messages from sidebar iframe
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_AI_APPLY') {
    if (typeof startAIApply === 'function') {
      startAIApply(event.data.userProfile, event.data.jobData, event.data.token);
    }
  }
  if (event.data && event.data.type === 'SIDEBAR_API_REQUEST') {
    chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      ...event.data.payload
    }, (response) => {
      const iframe = document.getElementById('hirenextai-sidebar-iframe');
      if (iframe) {
        iframe.contentWindow.postMessage({
          type: 'API_RESPONSE',
          requestId: event.data.requestId,
          response
        }, '*');
      }
    });
  }
});

// =========================================
// CONSENT SLIDE BANNER OVERLAY
// =========================================

function showPermissionBanner() {
  const existingBanner = document.getElementById('hirenextai-consent-banner');
  if (existingBanner) existingBanner.remove();

  const banner = document.createElement('div');
  banner.id = 'hirenextai-consent-banner';
  banner.className = 'hnai-consent-banner';
  banner.innerHTML = `
    <div class="hnai-consent-header">
      <span>🛡️</span>
      <span>Allow HirenextAI on this site?</span>
    </div>
    <div class="hnai-consent-desc">
      To auto-fill details, HirenextAI needs to scan the job description and input fields on this page.
    </div>
    <div class="hnai-consent-actions">
      <button class="hnai-consent-deny" id="hnai-consent-deny">Deny</button>
      <button class="hnai-consent-allow" id="hnai-consent-allow">Allow</button>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('hnai-consent-allow').addEventListener('click', () => {
    chrome.storage.local.set({ [`allow_site_${window.location.hostname}`]: 'allow' }, () => {
      banner.remove();
      initializeAssistantWidget();
    });
  });

  document.getElementById('hnai-consent-deny').addEventListener('click', () => {
    chrome.storage.local.set({ [`allow_site_${window.location.hostname}`]: 'deny' }, () => {
      banner.remove();
    });
  });
}

// =========================================
// MAIN SCREEN OVERLAYS
// =========================================

function showOverlay() {
  removeOverlay();
  
  const overlay = document.createElement('div');
  overlay.id = 'hirenextai-overlay';
  overlay.innerHTML = `
    <div class="hnai-border-top"></div>
    <div class="hnai-border-right"></div>
    <div class="hnai-border-bottom"></div>
    <div class="hnai-border-left"></div>
    
    <div class="hnai-bottom-bar">
      <div class="hnai-agent-info">
        <div class="hnai-pulse"></div>
        <span class="hnai-logo">HirenextAI</span>
        <span class="hnai-status" id="hnai-status">
          🤖 AI Assistant is filling details...
        </span>
      </div>
      
      <div class="hnai-controls">
        <button class="hnai-stop-btn" id="hnai-stop">
          ⬛ Stop Assistant
        </button>
      </div>
    </div>
    
    <div class="hnai-mouse-warning" id="hnai-mouse-warning" style="display:none">
      ⚠️ Keep mouse still — AI is automating form inputs
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('hnai-stop').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'STOP_AI_FROM_PAGE' });
    if (typeof stopAI === 'function') stopAI();
  });
  
  document.addEventListener('click', showMouseWarning, true);
}

function showMouseWarning(e) {
  if (typeof isAIRunning !== 'undefined' && !isAIRunning) return;
  
  const warning = document.getElementById('hnai-mouse-warning');
  const stopBtn = document.getElementById('hnai-stop');
  
  if (e.target === stopBtn || stopBtn?.contains(e.target)) return;
  
  e.stopPropagation();
  e.preventDefault();
  
  if (warning) {
    warning.style.display = 'block';
    warning.style.left = (e.clientX - 100) + 'px';
    warning.style.top = (e.clientY - 40) + 'px';
    
    setTimeout(() => {
      warning.style.display = 'none';
    }, 1500);
  }
}

function showDoneState(screenshot, token, jobData) {
  if (typeof isAIRunning !== 'undefined') {
    isAIRunning = false;
  }
  
  document.removeEventListener('click', showMouseWarning, true);
  
  const bottomBar = document.querySelector('.hnai-bottom-bar');
  if (!bottomBar) return;
  
  bottomBar.innerHTML = `
    <div class="hnai-done-info">
      <span class="hnai-done-icon">🎉</span>
      <div>
        <div class="hnai-done-title">
          Ready for Submission!
        </div>
        <div class="hnai-done-sub">
          Please review the details, then submit.
        </div>
      </div>
    </div>
    
    <div class="hnai-done-actions">
      <button class="hnai-btn-secondary" id="hnai-restart">
        🔄 Restart
      </button>
      <button class="hnai-btn-danger" id="hnai-cancel">
        ✕ Cancel
      </button>
      <button class="hnai-btn-primary" id="hnai-submit">
        Submit Application →
      </button>
    </div>
  `;
  
  if (screenshot && token) {
    sendScreenshotToChat(screenshot, token, jobData);
  }
  
  document.getElementById('hnai-restart')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESTART_AI_APPLY' });
  });
  
  document.getElementById('hnai-cancel')?.addEventListener('click', () => {
    removeOverlay();
    chrome.runtime.sendMessage({ type: 'AI_CANCELLED' });
  });
  
  document.getElementById('hnai-submit')?.addEventListener('click', () => {
    submitApplication(token, jobData);
  });
}

function showErrorState(errorMessage) {
  const bottomBar = document.querySelector('.hnai-bottom-bar');
  if (!bottomBar) return;
  
  bottomBar.innerHTML = `
    <div class="hnai-done-info">
      <span class="hnai-done-icon">❌</span>
      <div>
        <div class="hnai-done-title">Something went wrong</div>
        <div class="hnai-done-sub">${errorMessage}</div>
      </div>
    </div>
    <div class="hnai-done-actions">
      <button class="hnai-btn-secondary" id="hnai-error-close">Close</button>
    </div>
  `;
  
  document.getElementById('hnai-error-close')?.addEventListener('click', removeOverlay);
}

// =========================================
// APPLICATION FINAL SUBMISSION ENGINE
// =========================================

async function submitApplication(token, jobData) {
  if (typeof updateStatus === 'function') {
    updateStatus('📤 Submitting application...');
  }
  
  let submitBtn = null;
  if (typeof findButtonByText === 'function') {
    submitBtn = 
      findButtonByText('Submit application') ||
      findButtonByText('Submit') ||
      findButtonByText('Apply') ||
      findButtonByText('Send application');
  } else {
    const buttons = document.querySelectorAll('button, a, [role="button"]');
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('submit application') || text.includes('submit') || text.includes('apply') || text.includes('send application')) {
        submitBtn = btn;
        break;
      }
    }
  }
  
  if (submitBtn) {
    submitBtn.click();
    if (typeof sleep === 'function') await sleep(2000);
    
    let finalScreenshot = null;
    if (typeof takeScreenshot === 'function') {
      finalScreenshot = await takeScreenshot();
    }
    
    // Save to server via background.js proxy
    chrome.runtime.sendMessage({
      type: 'SEND_TO_BACKEND',
      token: token,
      data: {
        job_title: jobData.title,
        company: jobData.company,
        job_url: window.location.href,
        status: 'applied',
        screenshot: finalScreenshot,
        applied_via: 'ai_agent'
      }
    });
    
    if (typeof updateStatus === 'function') {
      updateStatus('🎉 Application submitted!');
    }
    
    // Update bottom bar to success
    const bottomBar = document.querySelector('.hnai-bottom-bar');
    if (bottomBar) {
      bottomBar.innerHTML = `
        <div class="hnai-success">
          <span>🎉 Application submitted successfully! Details synced to your account.</span>
          <button class="hnai-btn-secondary" id="hnai-close-final" style="margin-left: 14px;">
            Close
          </button>
        </div>
      `;
      document.getElementById('hnai-close-final')?.addEventListener('click', removeOverlay);
    }
    
    setTimeout(removeOverlay, 5000);
  } else {
    if (typeof updateStatus === 'function') {
      updateStatus('⚠️ Could not locate Submit button. Please click Submit manually.');
    }
  }
}

async function sendScreenshotToChat(screenshot, token, jobData) {
  try {
    chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      url: '/api/applications/screenshot',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        screenshot,
        jobData,
        message: `✅ AI Agent filled the application form for **${jobData.title}** at **${jobData.company}**. Please review the screenshot and click Submit when ready.`
      }
    });
  } catch (e) {
    console.error('Could not sync screenshot to dashboard:', e);
  }
}

function updateStatus(text) {
  const statusEl = document.getElementById('hnai-status');
  if (statusEl) statusEl.textContent = text;
}

function hideOverlay() {
  const overlay = document.getElementById('hirenextai-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 300);
  }
}

function removeOverlay() {
  hideOverlay();
  document.removeEventListener('click', showMouseWarning, true);
}
