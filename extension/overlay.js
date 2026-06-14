function showOverlay() {
  // Remove existing overlay
  removeOverlay()
  
  const overlay = document.createElement('div')
  overlay.id = 'hirenextai-overlay'
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
          🤖 AI Agent is working...
        </span>
      </div>
      
      <div class="hnai-controls">
        <button class="hnai-stop-btn" id="hnai-stop">
          ⬛ Stop AI
        </button>
      </div>
    </div>
    
    <div class="hnai-mouse-warning" 
         id="hnai-mouse-warning"
         style="display:none">
      ⚠️ Please don't interact — AI is working
    </div>
  `
  
  document.body.appendChild(overlay)
  
  // Stop button
  document.getElementById('hnai-stop')
    .addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'STOP_AI_FROM_PAGE' })
      if (typeof stopAI === 'function') stopAI()
    })
  
  // Mouse click warning
  document.addEventListener('click', showMouseWarning, true)
}

function showMouseWarning(e) {
  if (typeof isAIRunning !== 'undefined' && !isAIRunning) return
  
  const warning = document.getElementById('hnai-mouse-warning')
  const stopBtn = document.getElementById('hnai-stop')
  
  // Allow clicking stop button
  if (e.target === stopBtn || 
      stopBtn?.contains(e.target)) return
  
  // Block click and show warning
  e.stopPropagation()
  e.preventDefault()
  
  if (warning) {
    warning.style.display = 'block'
    warning.style.left = (e.clientX - 100) + 'px'
    warning.style.top = (e.clientY - 40) + 'px'
    
    setTimeout(() => {
      warning.style.display = 'none'
    }, 1500)
  }
}

function showDoneState(screenshot, token, jobData) {
  if (typeof isAIRunning !== 'undefined') {
    isAIRunning = false
  }
  
  document.removeEventListener(
    'click', showMouseWarning, true
  )
  
  const bottomBar = document.querySelector('.hnai-bottom-bar')
  if (!bottomBar) return
  
  bottomBar.innerHTML = `
    <div class="hnai-done-info">
      <span class="hnai-done-icon">✅</span>
      <div>
        <div class="hnai-done-title">
          Form filled by HirenextAI Agent
        </div>
        <div class="hnai-done-sub">
          Please review all details before submitting
        </div>
      </div>
    </div>
    
    <div class="hnai-done-actions">
      <button class="hnai-btn-secondary" 
              id="hnai-restart">
        🔄 Restart
      </button>
      <button class="hnai-btn-danger" 
              id="hnai-cancel">
        ✕ Cancel
      </button>
      <button class="hnai-btn-primary" 
              id="hnai-submit">
        Submit Application →
      </button>
    </div>
  `
  
  // Send screenshot to HirenextAI chat
  if (screenshot && token) {
    sendScreenshotToChat(screenshot, token, jobData)
  }
  
  // Restart button
  document.getElementById('hnai-restart')
    ?.addEventListener('click', async () => {
      chrome.runtime.sendMessage({ 
        type: 'RESTART_AI_APPLY' 
      })
    })
  
  // Cancel button  
  document.getElementById('hnai-cancel')
    ?.addEventListener('click', () => {
      removeOverlay()
      chrome.runtime.sendMessage({ 
        type: 'AI_CANCELLED' 
      })
    })
  
  // Submit button
  document.getElementById('hnai-submit')
    ?.addEventListener('click', () => {
      submitApplication(token, jobData)
    })
}

async function submitApplication(token, jobData) {
  if (typeof updateStatus === 'function') {
    updateStatus('📤 Submitting application...')
  }
  
  // Find and click submit button on page
  let submitBtn = null
  if (typeof findButtonByText === 'function') {
    submitBtn = 
      findButtonByText('Submit application') ||
      findButtonByText('Submit') ||
      findButtonByText('Apply') ||
      findButtonByText('Send application')
  } else {
    // fallback if content.js function isn't available
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
    submitBtn.click()
    if (typeof sleep === 'function') await sleep(2000)
    
    // Take final screenshot
    let finalScreenshot = null
    if (typeof takeScreenshot === 'function') {
      finalScreenshot = await takeScreenshot()
    }
    
    // Notify backend - application submitted
    chrome.runtime.sendMessage({
      type: 'SEND_TO_BACKEND',
      token: token,
      data: {
        job_title: jobData.title,
        company: jobData.company,
        job_url: window.location.href,
        status: 'pending',
        screenshot: finalScreenshot,
        applied_via: 'ai_agent'
      }
    })
    
    if (typeof updateStatus === 'function') {
      updateStatus('🎉 Application submitted!')
    }
    
    // Update bottom bar to success
    const bottomBar = document.querySelector(
      '.hnai-bottom-bar'
    )
    if (bottomBar) {
      bottomBar.innerHTML = `
        <div class="hnai-success">
          🎉 Application submitted successfully!
          Check your HirenextAI dashboard for updates.
          <button class="hnai-btn-secondary" 
                  id="hnai-close-final">
            Close
          </button>
        </div>
      `
      document.getElementById('hnai-close-final')
        ?.addEventListener('click', removeOverlay)
    }
    
    setTimeout(removeOverlay, 5000)
    
  } else {
    if (typeof updateStatus === 'function') {
      updateStatus(
        '⚠️ Could not find Submit button. Please submit manually.'
      )
    }
  }
}

async function sendScreenshotToChat(
  screenshot, token, jobData
) {
  try {
    await fetch(
      'https://hirenextai.com/api/applications/screenshot',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          screenshot,
          jobData,
          message: `✅ AI Agent filled the application form for **${jobData.title}** at **${jobData.company}**. Please review the screenshot and click Submit when ready.`
        })
      }
    )
  } catch (e) {
    console.log('Could not send to chat:', e)
  }
}

function updateStatus(text) {
  const statusEl = document.getElementById('hnai-status')
  if (statusEl) statusEl.textContent = text
}

function hideOverlay() {
  const overlay = document.getElementById(
    'hirenextai-overlay'
  )
  if (overlay) {
    overlay.style.opacity = '0'
    setTimeout(() => overlay.remove(), 300)
  }
}

function removeOverlay() {
  hideOverlay()
  document.removeEventListener(
    'click', showMouseWarning, true
  )
}
