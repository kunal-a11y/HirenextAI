const BACKEND_URL = 'http://localhost:3003';

document.addEventListener('DOMContentLoaded', async () => {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  
  // Views
  const welcomeScreen = document.getElementById('welcome-screen');
  const step1Screen = document.getElementById('onboarding-step1');
  const step2Screen = document.getElementById('onboarding-step2');
  const step3Screen = document.getElementById('onboarding-step3');
  const connectedState = document.getElementById('connected-state');
  
  // Buttons
  const btnSignIn = document.getElementById('btn-sign-in');
  const btnCreateAccount = document.getElementById('btn-create-account');
  const btnGuestContinue = document.getElementById('btn-guest-continue');
  
  const btnStep1Next = document.getElementById('step1-next');
  const btnStep2Next = document.getElementById('step2-next');
  const btnStep3Finish = document.getElementById('step3-finish');
  
  const btnStartJobHunt = document.getElementById('start-job-hunt');
  const disconnectLink = document.getElementById('disconnect-link');
  const settingsLink = document.getElementById('settings-link');

  // Initial State Check
  chrome.storage.local.get([
    'jwt_token', 
    'user_data', 
    'apply_stats', 
    'onboarding_complete',
    'permissions_settings',
    'supported_sites',
    'assistance_settings'
  ], async (result) => {
    
    // Check if onboarding is completed
    if (!result.onboarding_complete) {
      showView(welcomeScreen);
      return;
    }

    const token = result.jwt_token;
    if (token) {
      await verifyToken(token, result);
    } else {
      showGuestDashboard(result);
    }
  });

  // Verify JWT Token with Backend
  async function verifyToken(token, cachedResult) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user || data || cachedResult.user_data || {};
        
        statusDot.className = 'status-dot online';
        statusText.textContent = 'Connected';
        
        // Populate Dashboard
        document.getElementById('user-name').textContent = userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : (userData.name || 'User');
        document.getElementById('user-email').textContent = userData.email || '';
        document.getElementById('user-initials').textContent = (userData.firstName || userData.name || 'HI').substring(0, 2).toUpperCase();
        document.getElementById('plan-badge').textContent = (userData.plan || 'FREE').toUpperCase();
        
        // Stats
        if (cachedResult.apply_stats) {
          document.getElementById('applied-today').textContent = cachedResult.apply_stats.today_count || 0;
          document.getElementById('total-applied').textContent = cachedResult.apply_stats.total_count || 0;
          document.getElementById('success-rate').textContent = cachedResult.apply_stats.success_rate || '100%';
        }
        
        // Save latest
        chrome.storage.local.set({
          user_data: userData,
          user_profile: data.profile || cachedResult.user_profile
        });

        disconnectLink.style.display = 'inline';
        showView(connectedState);
      } else {
        // Token invalid, clear it and show Guest mode
        chrome.storage.local.remove(['jwt_token', 'user_data']);
        showGuestDashboard(cachedResult);
      }
    } catch (err) {
      // Offline or network error - show cached data if available
      if (cachedResult.user_data) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'Offline Mode';
        document.getElementById('user-name').textContent = cachedResult.user_data.name || 'User';
        document.getElementById('user-email').textContent = cachedResult.user_data.email || '';
        document.getElementById('plan-badge').textContent = (cachedResult.user_data.plan || 'FREE').toUpperCase();
        showView(connectedState);
      } else {
        showGuestDashboard(cachedResult);
      }
    }
  }

  // Show Guest Dashboard
  function showGuestDashboard(result) {
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Guest Mode';
    
    document.getElementById('user-name').textContent = 'Guest User';
    document.getElementById('user-email').textContent = 'Demo Mode (Read-Only AI)';
    document.getElementById('user-initials').textContent = 'GU';
    document.getElementById('plan-badge').textContent = 'GUEST';
    
    document.getElementById('applied-today').textContent = '0';
    document.getElementById('total-applied').textContent = '0';
    document.getElementById('success-rate').textContent = 'N/A';
    
    disconnectLink.style.display = 'inline';
    disconnectLink.textContent = 'Reset Assistant';
    showView(connectedState);
  }

  // Helper to switch views
  function showView(activeView) {
    [welcomeScreen, step1Screen, step2Screen, step3Screen, connectedState].forEach(view => {
      if (view) view.style.display = 'none';
    });
    if (activeView) activeView.style.display = 'block';
  }

  // Welcome Interactions
  btnSignIn.addEventListener('click', () => {
    chrome.tabs.create({ url: BACKEND_URL });
  });

  btnCreateAccount.addEventListener('click', () => {
    chrome.tabs.create({ url: BACKEND_URL });
  });

  btnGuestContinue.addEventListener('click', () => {
    showView(step1Screen);
  });

  // Step 1 Click
  btnStep1Next.addEventListener('click', () => {
    const permissions = {
      readTabs: document.getElementById('perm-read-tabs').checked,
      storage: document.getElementById('perm-storage').checked,
      notifications: document.getElementById('perm-notifications').checked
    };
    chrome.storage.local.set({ permissions_settings: permissions });
    showView(step2Screen);
  });

  // Step 2 Click
  btnStep2Next.addEventListener('click', () => {
    const sites = {
      linkedin: document.getElementById('site-linkedin').checked,
      indeed: document.getElementById('site-indeed').checked,
      naukri: document.getElementById('site-naukri').checked,
      glassdoor: document.getElementById('site-glassdoor').checked,
      internshala: document.getElementById('site-internshala').checked,
      other: document.getElementById('site-other').checked
    };
    chrome.storage.local.set({ supported_sites: sites });
    showView(step3Screen);
  });

  // Step 3 Click
  btnStep3Finish.addEventListener('click', () => {
    const assistance = {
      autoInject: document.getElementById('opt-auto-inject').checked,
      autoTrack: document.getElementById('opt-auto-track').checked
    };
    chrome.storage.local.set({ 
      assistance_settings: assistance,
      onboarding_complete: true
    }, () => {
      // Re-evaluate state
      chrome.storage.local.get(['jwt_token', 'user_data'], (res) => {
        if (res.jwt_token) {
          verifyToken(res.jwt_token, res);
        } else {
          showGuestDashboard(res);
        }
      });
    });
  });

  // Dashboard buttons
  btnStartJobHunt.addEventListener('click', () => {
    chrome.tabs.create({ url: `${BACKEND_URL}/chat` });
  });

  disconnectLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.storage.local.clear(() => {
      statusDot.className = 'status-dot offline';
      statusText.textContent = 'Disconnected';
      disconnectLink.style.display = 'none';
      showView(welcomeScreen);
    });
  });
});
