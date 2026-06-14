// =========================================
// PLATFORM DETECTION
// =========================================

function detectPlatform() {
  const url = window.location.href
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('indeed.com')) return 'indeed'
  if (url.includes('naukri.com')) return 'naukri'
  if (url.includes('glassdoor.com')) return 'glassdoor'
  if (url.includes('internshala.com')) return 'internshala'
  return 'unknown'
}

// =========================================
// LISTEN FOR START COMMAND
// =========================================

chrome.runtime.onMessage.addListener(
  async (message, sender, sendResponse) => {
  
  if (message.type === 'START_AI_APPLY') {
    const { userProfile, jobData, token } = message
    await startAIApply(userProfile, jobData, token)
  }
  
  if (message.type === 'STOP_AI') {
    stopAI()
  }
})

// =========================================
// GLOBAL STATE
// =========================================

let isAIRunning = false
let isStopped = false

// =========================================
// MAIN AI APPLY FUNCTION
// =========================================

async function startAIApply(userProfile, jobData, token) {
  isAIRunning = true
  isStopped = false
  
  // Show overlay
  if (typeof showOverlay === 'function') {
    showOverlay()
  }
  updateStatus('🔍 Finding application button...')
  
  // Notify background
  chrome.runtime.sendMessage({ type: 'AI_STARTED' })
  
  const platform = detectPlatform()
  
  try {
    // Step 1: Find and click Apply button
    updateStatus('🖱️ Clicking Apply button...')
    await findAndClickApply(platform)
    await sleep(2000)
    if (isStopped) return handleStop()
    
    // Step 2: Handle login if needed
    updateStatus('🔐 Checking login status...')
    await handleLoginIfNeeded(platform, userProfile)
    await sleep(1500)
    if (isStopped) return handleStop()
    
    // Step 3: Fill the form
    updateStatus('📝 Filling application form...')
    await fillApplicationForm(platform, userProfile)
    await sleep(1000)
    if (isStopped) return handleStop()
    
    // Step 4: Upload resume if needed
    updateStatus('📎 Uploading resume...')
    await uploadResume(userProfile.resume_url)
    await sleep(1000)
    if (isStopped) return handleStop()
    
    // Step 5: Take screenshot
    updateStatus('📸 Taking screenshot...')
    const screenshot = await takeScreenshot()
    
    // Step 6: Done!
    updateStatus('✅ Form filled! Please review.')
    if (typeof showDoneState === 'function') {
      showDoneState(screenshot, token, jobData)
    }
    
    // Play sound
    playDoneSound()
    
    // Notify background
    chrome.runtime.sendMessage({ 
      type: 'AI_DONE',
      screenshot: screenshot 
    })
    
  } catch (error) {
    updateStatus('❌ Error: ' + error.message)
    if (typeof showErrorState === 'function') {
      showErrorState(error.message)
    }
  }
}

// =========================================
// FIND AND CLICK APPLY BUTTON
// =========================================

async function findAndClickApply(platform) {
  let applyButton = null
  
  if (platform === 'linkedin') {
    applyButton = 
      document.querySelector('.jobs-apply-button') ||
      document.querySelector('[data-control-name="jobdetails_topcard_inapply"]') ||
      findButtonByText('Easy Apply') ||
      findButtonByText('Apply')
  }
  
  else if (platform === 'indeed') {
    applyButton = 
      document.querySelector('#indeedApplyButton') ||
      document.querySelector('.jobsearch-IndeedApplyButton') ||
      findButtonByText('Apply now') ||
      findButtonByText('Apply')
  }
  
  else if (platform === 'naukri') {
    applyButton = 
      document.querySelector('.apply-button') ||
      document.querySelector('#apply-button') ||
      findButtonByText('Apply') ||
      findButtonByText('Apply Now')
  }
  
  else {
    // Generic: find any Apply button
    applyButton = 
      findButtonByText('Apply Now') ||
      findButtonByText('Apply now') ||
      findButtonByText('Apply') ||
      findButtonByText('Submit Application')
  }
  
  if (!applyButton) {
    throw new Error('Could not find Apply button on this page')
  }
  
  // Highlight button before clicking
  applyButton.style.outline = '2px solid white'
  await sleep(800)
  applyButton.click()
  applyButton.style.outline = ''
}

// =========================================
// HANDLE LOGIN IF NEEDED
// =========================================

async function handleLoginIfNeeded(platform, userProfile) {
  await sleep(2000)
  
  // Check if login form appeared
  const loginForm = 
    document.querySelector('input[type="email"]') ||
    document.querySelector('input[name="email"]') ||
    document.querySelector('#username')
  
  if (!loginForm) return // Already logged in
  
  updateStatus('🔐 Logging you in...')
  
  if (platform === 'linkedin') {
    const emailInput = document.querySelector('#username') ||
      document.querySelector('input[name="session_key"]')
    const passInput = document.querySelector('#password') ||
      document.querySelector('input[name="session_password"]')
    
    if (emailInput && userProfile.linkedin_email) {
      await typeSlowly(emailInput, userProfile.linkedin_email)
    }
    if (passInput && userProfile.linkedin_password) {
      await typeSlowly(passInput, userProfile.linkedin_password)
      await sleep(500)
      const submitBtn = document.querySelector(
        '[type="submit"]'
      )
      if (submitBtn) submitBtn.click()
      await sleep(3000)
    }
  }
  
  else if (platform === 'indeed') {
    const emailInput = document.querySelector(
      'input[name="__email"]'
    ) || document.querySelector('input[type="email"]')
    
    if (emailInput && userProfile.indeed_email) {
      await typeSlowly(emailInput, userProfile.indeed_email)
      const continueBtn = findButtonByText('Continue') ||
        document.querySelector('[type="submit"]')
      if (continueBtn) {
        continueBtn.click()
        await sleep(2000)
      }
    }
  }
}

// =========================================
// FILL APPLICATION FORM
// =========================================

async function fillApplicationForm(platform, userProfile) {
  await sleep(1500)
  
  // Common fields mapping
  const fieldMappings = [
    {
      selectors: [
        'input[name="name"]',
        'input[placeholder*="name" i]',
        'input[id*="name" i]',
        'input[autocomplete="name"]'
      ],
      value: userProfile.name
    },
    {
      selectors: [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email" i]',
        'input[autocomplete="email"]'
      ],
      value: userProfile.email
    },
    {
      selectors: [
        'input[type="tel"]',
        'input[name="phone"]',
        'input[placeholder*="phone" i]',
        'input[placeholder*="mobile" i]',
        'input[autocomplete="tel"]'
      ],
      value: userProfile.phone
    },
    {
      selectors: [
        'input[name*="experience" i]',
        'input[placeholder*="experience" i]',
        'input[id*="experience" i]'
      ],
      value: userProfile.years_experience
    },
    {
      selectors: [
        'input[name*="location" i]',
        'input[placeholder*="location" i]',
        'input[placeholder*="city" i]'
      ],
      value: userProfile.location
    },
    {
      selectors: [
        'input[name*="linkedin" i]',
        'input[placeholder*="linkedin" i]'
      ],
      value: userProfile.linkedin_url
    },
    {
      selectors: [
        'input[name*="portfolio" i]',
        'input[name*="website" i]',
        'input[placeholder*="portfolio" i]'
      ],
      value: userProfile.portfolio_url
    },
    {
      selectors: [
        'input[name*="salary" i]',
        'input[placeholder*="salary" i]',
        'input[placeholder*="expected" i]'
      ],
      value: userProfile.salary_expectation
    }
  ]
  
  // Fill each field
  for (const field of fieldMappings) {
    if (!field.value) continue
    
    for (const selector of field.selectors) {
      const input = document.querySelector(selector)
      if (input && !input.value) {
        // Highlight field
        input.style.outline = '2px solid rgba(255,255,255,0.5)'
        input.style.background = 'rgba(255,255,255,0.05)'
        
        await typeSlowly(input, field.value)
        await sleep(300)
        
        // Remove highlight
        input.style.outline = ''
        input.style.background = ''
        break
      }
    }
  }
  
  // Fill textareas (cover letter, about)
  const textareas = document.querySelectorAll('textarea')
  for (const textarea of textareas) {
    const label = getFieldLabel(textarea)
    
    if (!textarea.value && 
        (label.includes('cover') || 
         label.includes('about') || 
         label.includes('why') ||
         label.includes('message'))) {
      
      updateStatus('✍️ Writing cover letter...')
      
      const coverLetter = await generateCoverLetter(
        userProfile, 
        window.location.href
      )
      
      textarea.style.outline = '2px solid rgba(255,255,255,0.5)'
      await typeSlowly(textarea, coverLetter)
      textarea.style.outline = ''
      await sleep(500)
    }
  }
  
  // Handle dropdowns/selects
  const selects = document.querySelectorAll('select')
  for (const select of selects) {
    const label = getFieldLabel(select).toLowerCase()
    
    if (label.includes('experience') && 
        userProfile.years_experience) {
      setSelectByValue(select, userProfile.years_experience)
    }
    
    if (label.includes('notice') || 
        label.includes('joining')) {
      setSelectByText(select, 'Immediately') ||
      setSelectByText(select, '15 days') ||
      setSelectFirstOption(select)
    }
  }
  
  // Handle checkboxes (terms, agreements)
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]'
  )
  for (const checkbox of checkboxes) {
    const label = getFieldLabel(checkbox).toLowerCase()
    if (label.includes('terms') || 
        label.includes('agree') ||
        label.includes('consent')) {
      if (!checkbox.checked) checkbox.click()
    }
  }
}

// =========================================
// UPLOAD RESUME
// =========================================

async function uploadResume(resumeUrl) {
  if (!resumeUrl) return
  
  const fileInputs = document.querySelectorAll(
    'input[type="file"]'
  )
  
  for (const fileInput of fileInputs) {
    const label = getFieldLabel(fileInput).toLowerCase()
    
    if (label.includes('resume') || 
        label.includes('cv') || 
        fileInput.accept?.includes('.pdf') ||
        fileInput.accept?.includes('.doc')) {
      
      updateStatus('📎 Uploading resume...')
      
      // Fetch resume as blob
      try {
        const response = await fetch(resumeUrl)
        const blob = await response.blob()
        const file = new File(
          [blob], 
          'resume.pdf', 
          { type: 'application/pdf' }
        )
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInput.files = dataTransfer.files
        
        fileInput.dispatchEvent(
          new Event('change', { bubbles: true })
        )
        await sleep(1500)
      } catch (e) {
        console.log('Resume upload failed:', e)
      }
      break
    }
  }
}

// =========================================
// GENERATE COVER LETTER (AI)
// =========================================

async function generateCoverLetter(userProfile, jobUrl) {
  try {
    const token = await getStoredToken()
    const response = await fetch(
      'https://hirenextai.com/api/ai/cover-letter',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobTitle: document.title || 'Job Application',
          company: window.location.hostname,
          jobDescription: jobUrl,
          userProfile
        })
      }
    )
    const data = await response.json()
    return data.coverLetter || 
      `I am excited to apply for this position. 
       With ${userProfile.years_experience} years 
       of experience in ${userProfile.skills}, 
       I believe I would be a great fit.`
  } catch {
    return `Dear Hiring Manager,
I am writing to express my strong interest 
in this position. With my background in 
${userProfile.skills || 'relevant fields'} 
and ${userProfile.years_experience || 'several'} 
years of experience, I am confident I can 
contribute effectively to your team.
Best regards,
${userProfile.name}`
  }
}

// =========================================
// TAKE SCREENSHOT
// =========================================

async function takeScreenshot() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: 'TAKE_SCREENSHOT' },
      (response) => {
        resolve(response?.screenshot || null)
      }
    )
  })
}

// =========================================
// STOP AI
// =========================================

function stopAI() {
  isStopped = true
  isAIRunning = false
  updateStatus('🛑 AI stopped by user')
  
  setTimeout(() => {
    if (typeof hideOverlay === 'function') {
      hideOverlay()
    }
    chrome.runtime.sendMessage({ type: 'AI_STOPPED' })
  }, 1500)
}

function handleStop() {
  if (typeof hideOverlay === 'function') {
    hideOverlay()
  }
  chrome.runtime.sendMessage({ 
    type: 'AI_STOPPED',
    reason: 'user_stopped'
  })
}

// =========================================
// HELPER FUNCTIONS
// =========================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function typeSlowly(element, text) {
  element.focus()
  element.value = ''
  
  for (const char of text) {
    element.value += char
    element.dispatchEvent(
      new Event('input', { bubbles: true })
    )
    element.dispatchEvent(
      new Event('change', { bubbles: true })
    )
    await sleep(30 + Math.random() * 20)
  }
}

function findButtonByText(text) {
  const buttons = document.querySelectorAll(
    'button, a, [role="button"]'
  )
  for (const btn of buttons) {
    if (btn.textContent.trim()
        .toLowerCase()
        .includes(text.toLowerCase())) {
      return btn
    }
  }
  return null
}

function getFieldLabel(element) {
  // Check aria-label
  if (element.ariaLabel) return element.ariaLabel
  
  // Check placeholder
  if (element.placeholder) return element.placeholder
  
  // Check associated label
  if (element.id) {
    const label = document.querySelector(
      `label[for="${element.id}"]`
    )
    if (label) return label.textContent
  }
  
  // Check parent label
  const parentLabel = element.closest('label')
  if (parentLabel) return parentLabel.textContent
  
  // Check nearby text
  const parent = element.parentElement
  if (parent) return parent.textContent.slice(0, 50)
  
  return ''
}

function setSelectByValue(select, value) {
  for (const option of select.options) {
    if (option.value.includes(value) || 
        option.text.includes(value)) {
      select.value = option.value
      select.dispatchEvent(
        new Event('change', { bubbles: true })
      )
      return true
    }
  }
  return false
}

function setSelectByText(select, text) {
  for (const option of select.options) {
    if (option.text.toLowerCase()
        .includes(text.toLowerCase())) {
      select.value = option.value
      select.dispatchEvent(
        new Event('change', { bubbles: true })
      )
      return true
    }
  }
  return false
}

function setSelectFirstOption(select) {
  if (select.options.length > 1) {
    select.selectedIndex = 1
    select.dispatchEvent(
      new Event('change', { bubbles: true })
    )
  }
}

async function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['jwt_token'], (result) => {
      resolve(result.jwt_token || null)
    })
  })
}

function playDoneSound() {
  try {
    const audio = new Audio(
      chrome.runtime.getURL('sounds/done.mp3')
    )
    audio.volume = 0.5
    audio.play().catch(() => {})
  } catch (e) {
    console.error('Audio play failed', e)
  }
}
