document.addEventListener('DOMContentLoaded', async () => {
  const statusDot = document.getElementById('status-dot')
  const statusText = document.getElementById('status-text')
  
  const connectedState = document.getElementById('connected-state')
  const disconnectedState = document.getElementById('disconnected-state')
  
  const openHirenextBtn = document.getElementById('open-hirenextai')
  const startJobHuntBtn = document.getElementById('start-job-hunt')
  const disconnectLink = document.getElementById('disconnect-link')

  // Check token
  chrome.storage.local.get(['jwt_token', 'user_data', 'apply_stats'], async (result) => {
    const token = result.jwt_token
    
    if (token) {
      try {
        const response = await fetch('https://hirenextai.com/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // Show Connected
          statusDot.className = 'status-dot online'
          statusText.textContent = 'Connected'
          
          connectedState.style.display = 'block'
          disconnectedState.style.display = 'none'
          disconnectLink.style.display = 'inline'
          
          // Populate UI
          const userData = data.user || data || result.user_data || {}
          
          document.getElementById('user-name').textContent = userData.name || 'User'
          document.getElementById('user-email').textContent = userData.email || ''
          
          const initials = userData.name ? userData.name.substring(0, 2).toUpperCase() : 'AI'
          document.getElementById('user-initials').textContent = initials
          
          document.getElementById('plan-badge').textContent = userData.plan || 'PRO'
          
          // Update stats if we have them
          if (result.apply_stats) {
            document.getElementById('applied-today').textContent = result.apply_stats.today_count || 0
            document.getElementById('total-applied').textContent = result.apply_stats.total_count || 0
            
            const sr = result.apply_stats.success_rate || '68%'
            document.getElementById('success-rate').textContent = sr
          }
          
          // Store latest data
          chrome.storage.local.set({
            user_data: userData,
            user_profile: data.profile || result.user_profile
          })
          
        } else {
          showDisconnected()
        }
      } catch (err) {
        // If network fails but we have token, we can assume disconnected for now
        showDisconnected()
      }
    } else {
      showDisconnected()
    }
  })
  
  function showDisconnected() {
    statusDot.className = 'status-dot offline'
    statusText.textContent = 'Disconnected'
    
    connectedState.style.display = 'none'
    disconnectedState.style.display = 'block'
    disconnectLink.style.display = 'none'
  }

  // Button actions
  openHirenextBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://hirenextai.com' })
  })

  startJobHuntBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://hirenextai.com/chat' })
  })

  disconnectLink.addEventListener('click', (e) => {
    e.preventDefault()
    chrome.storage.local.remove(['jwt_token', 'user_data', 'user_profile', 'apply_stats'], () => {
      showDisconnected()
    })
  })
})
