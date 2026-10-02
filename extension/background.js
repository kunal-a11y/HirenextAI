// HirenextAI Browser Extension — Background Service Worker
// Production-ready with configurable backend URL

const DEFAULT_BACKEND = 'https://hirenextai.com';
const DEV_BACKEND = 'http://localhost:3003';

async function getBackendUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['backend_url', 'dev_mode'], (result) => {
      if (result.dev_mode) {
        resolve(result.backend_url || DEV_BACKEND);
      } else {
        resolve(result.backend_url || DEFAULT_BACKEND);
      }
    });
  });
}

async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['jwt_token'], (result) => {
      resolve(result.jwt_token || null);
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // Badge updates
  if (message.type === 'AI_STARTED') {
    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: '#000000' });
  }

  if (message.type === 'AI_DONE') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'HirenextAI Career Assistant',
      message: message.message || 'Form filled! Please review and submit.'
    });
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#000000' });
  }

  if (message.type === 'AI_STOPPED' || message.type === 'AI_CANCELLED') {
    chrome.action.setBadgeText({ text: '' });
  }

  // Screenshot capture
  if (message.type === 'TAKE_SCREENSHOT') {
    chrome.tabs.captureVisibleTab(
      sender.tab?.windowId || chrome.windows.WINDOW_ID_CURRENT,
      { format: 'png' },
      (dataUrl) => sendResponse({ screenshot: dataUrl })
    );
    return true;
  }

  // API Request Proxy — the core communication layer
  if (message.type === 'API_REQUEST') {
    (async () => {
      try {
        const backendUrl = await getBackendUrl();
        const token = await getAuthToken();
        const { url, method, headers = {}, body } = message;
        const finalUrl = url.startsWith('http') ? url : `${backendUrl}${url}`;

        // Auto-inject auth token if available
        const finalHeaders = {
          'Content-Type': 'application/json',
          ...headers
        };
        if (token && !finalHeaders['Authorization']) {
          finalHeaders['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(finalUrl, {
          method: method || 'GET',
          headers: finalHeaders,
          body: body ? JSON.stringify(body) : undefined
        });

        let data = {};
        try { data = await response.json(); } catch (e) {}

        sendResponse({ ok: response.ok, status: response.status, data });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  }

  // Send data to backend (used by overlay after form submission)
  if (message.type === 'SEND_TO_BACKEND') {
    (async () => {
      try {
        const backendUrl = await getBackendUrl();
        const token = message.token || await getAuthToken();

        await fetch(`${backendUrl}/api/applications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            jobTitle: message.data?.job_title,
            company: message.data?.company,
            location: '',
            salary: '',
            status: message.data?.status || 'applied',
            matchScore: 0
          })
        });
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();
    return true;
  }

  // Show notification
  if (message.type === 'SHOW_NOTIFICATION') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: message.title || 'HirenextAI',
      message: message.message || ''
    });
    sendResponse({ success: true });
  }

  // Get auth status
  if (message.type === 'GET_AUTH_STATUS') {
    (async () => {
      const token = await getAuthToken();
      chrome.storage.local.get(['user_data'], (result) => {
        sendResponse({
          isAuthenticated: !!token,
          token,
          user: result.user_data || null
        });
      });
    })();
    return true;
  }

  // Toggle sidebar on active tab
  if (message.type === 'TOGGLE_SIDEBAR') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_SIDEBAR' });
      }
    });
    sendResponse({ success: true });
  }
});

// External messages from the website
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ installed: true, version: chrome.runtime.getManifest().version });
    return;
  }

  if (message.type === 'SYNC_TOKEN') {
    if (message.token) {
      chrome.storage.local.set({ jwt_token: message.token });
      if (message.user) {
        chrome.storage.local.set({ user_data: message.user });
      }
    }
    sendResponse({ success: true });
    return;
  }

  if (message.type === 'APPLY_WITH_AI') {
    const token = message.token || null;
    if (token) chrome.storage.local.set({ jwt_token: token });

    chrome.tabs.create({ url: message.job?.url }, (tab) => {
      if (!tab?.id) {
        sendResponse({ success: false, error: 'Could not open job page' });
        return;
      }
      const onUpdated = (tabId, info) => {
        if (tabId !== tab.id || info.status !== 'complete') return;
        chrome.tabs.onUpdated.removeListener(onUpdated);
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'START_AI_APPLY',
            userProfile: message.userProfile || {},
            jobData: message.job || {},
            token
          }).catch(() => {});
        }, 1500);
      };
      chrome.tabs.onUpdated.addListener(onUpdated);
      sendResponse({ success: true });
    });
    return true;
  }
});

// Auto-detect dev mode on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['dev_mode'], (result) => {
    if (result.dev_mode === undefined) {
      const manifest = chrome.runtime.getManifest();
      const isDev = !('update_url' in manifest);
      chrome.storage.local.set({ dev_mode: isDev });
      if (isDev) {
        chrome.storage.local.set({ backend_url: DEV_BACKEND });
        console.log('[HirenextAI] Dev mode enabled, backend:', DEV_BACKEND);
      }
    }
  });
});
