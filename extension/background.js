chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    
  // When AI starts applying
  if (message.type === 'AI_STARTED') {
    // Update badge
    chrome.action.setBadgeText({ text: '...' })
    chrome.action.setBadgeBackgroundColor({ 
      color: '#ffffff' 
    })
  }
  
  // When AI finishes filling
  if (message.type === 'AI_DONE') {
    // Send notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'HirenextAI Agent',
      message: 'Form filled! Please review and submit.'
    })
    // Update badge
    chrome.action.setBadgeText({ text: '✓' })
  }
  
  // When user stops AI
  if (message.type === 'AI_STOPPED') {
    chrome.action.setBadgeText({ text: '' })
  }
  
  // Screenshot request
  if (message.type === 'TAKE_SCREENSHOT') {
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: 'png' },
      (dataUrl) => {
        sendResponse({ screenshot: dataUrl })
      }
    )
    return true
  }
  
  // Send data to HirenextAI backend
  if (message.type === 'SEND_TO_BACKEND') {
    // Forward to backend API
    fetch('https://hirenextai.com/api/applications/ai-apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${message.token}`
      },
      body: JSON.stringify(message.data)
    })
    .then(r => r.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, err }))
    return true
  }
})

// Messages sent from the HirenextAI website.
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({ installed: true, version: chrome.runtime.getManifest().version })
    return
  }

  if (message.type === 'APPLY_WITH_AI') {
    const token = message.token || null
    if (token) {
      chrome.storage.local.set({ jwt_token: token })
    }

    chrome.tabs.create({ url: message.job?.url }, (tab) => {
      if (!tab?.id) {
        sendResponse({ success: false, error: 'Could not open job page' })
        return
      }

      const onUpdated = (tabId, info) => {
        if (tabId !== tab.id || info.status !== 'complete') return
        chrome.tabs.onUpdated.removeListener(onUpdated)
        chrome.tabs.sendMessage(tab.id, {
          type: 'START_AI_APPLY',
          userProfile: message.userProfile || {},
          jobData: message.job || {},
          token
        }).catch(() => {})
      }
      chrome.tabs.onUpdated.addListener(onUpdated)
      sendResponse({ success: true })
    })
    return true
  }
})
