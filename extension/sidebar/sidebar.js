// =========================================
// HirenextAI Sidebar — Core Application Logic
// =========================================

// --- State ---
let authToken = null;
let currentUser = null;
let currentJob = null;
let currentTab = 'home';
let jobAnalysis = null;
let resume = null;
let applications = [];
let documents = [];
let selectedDocType = 'cover_letter';
let historyFilter = 'all';

// --- API Communication (via background.js proxy) ---
function apiRequest(endpoint, method, body) {
  method = method || 'GET';
  return new Promise(function(resolve) {
    chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      url: '/api' + endpoint,
      method: method,
      body: body || undefined
    }, function(response) {
      resolve(response || { ok: false, error: 'No response' });
    });
  });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get(['jwt_token', 'user_data'], function(result) {
    if (result.jwt_token) {
      authToken = result.jwt_token;
      currentUser = result.user_data || null;
      verifySession();
    } else {
      showScreen('login-screen');
    }
  });

  bindEvents();
  listenForMessages();
});

function verifySession() {
  showScreen('loading-screen');
  apiRequest('/extension/verify', 'POST', {
    version: '1.0.0',
    browser: 'chrome'
  }).then(function(res) {
    if (res.ok && res.data && res.data.success) {
      currentUser = res.data.user;
      chrome.storage.local.set({ user_data: currentUser });
      renderDashboard();
      showScreen('dashboard-screen');
      loadResume();
      loadApplications();
      loadDocuments();
    } else {
      chrome.storage.local.remove(['jwt_token', 'user_data']);
      authToken = null;
      showScreen('login-screen');
    }
  });
}

// --- Screen Management ---
function showScreen(screenId) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  var target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

// --- Tab Navigation ---
function switchTab(tabName) {
  currentTab = tabName;
  var tabs = document.querySelectorAll('.tab-item');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === tabName);
  }
  var contents = document.querySelectorAll('.tab-content');
  for (var j = 0; j < contents.length; j++) {
    contents[j].classList.toggle('active', contents[j].id === 'tab-content-' + tabName);
  }
}

// --- Event Binding ---
function bindEvents() {
  // Tab bar
  var tabBtns = document.querySelectorAll('.tab-item');
  for (var i = 0; i < tabBtns.length; i++) {
    tabBtns[i].addEventListener('click', function() {
      switchTab(this.getAttribute('data-tab'));
    });
  }

  // Login form
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleLogin();
    });
  }

  // Quick actions
  bindClick('qa-analyze', function() { switchTab('analysis'); if (currentJob) runJobAnalysis(); });
  bindClick('qa-cover-letter', function() { switchTab('documents'); selectDocType('cover_letter'); });
  bindClick('qa-apply-ai', function() { triggerApplyWithAI(); });
  bindClick('qa-history', function() { switchTab('history'); });
  bindClick('home-upload-resume-btn', function() { switchTab('resume'); });

  // Analysis
  bindClick('analyze-btn', runJobAnalysis);

  // Resume
  bindClick('resume-upload-btn', handleResumeUpload);
  bindClick('ai-resume-create-btn', handleAIResumeCreate);
  bindClick('resume-analyze-btn', handleResumeAnalyze);
  bindClick('resume-upload-new-btn', function() {
    show('resume-empty'); hide('resume-view');
  });
  bindClick('resume-download-btn', handleResumeDownload);

  // Documents
  var docTypePills = document.querySelectorAll('[data-doctype]');
  for (var d = 0; d < docTypePills.length; d++) {
    docTypePills[d].addEventListener('click', function() {
      selectDocType(this.getAttribute('data-doctype'));
    });
  }
  bindClick('doc-generate-btn', handleDocGenerate);
  bindClick('doc-copy-btn', handleDocCopy);
  bindClick('doc-save-btn', handleDocSave);

  // History filters
  var filterBtns = document.querySelectorAll('[data-filter]');
  for (var f = 0; f < filterBtns.length; f++) {
    filterBtns[f].addEventListener('click', function() {
      historyFilter = this.getAttribute('data-filter');
      var pills = document.querySelectorAll('[data-filter]');
      for (var p = 0; p < pills.length; p++) pills[p].classList.remove('active');
      this.classList.add('active');
      renderApplications();
    });
  }

  // Settings
  bindClick('logout-btn', handleLogout);
}

function bindClick(id, fn) {
  var el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}

// --- Message Listener (from content script / parent) ---
function listenForMessages() {
  window.addEventListener('message', function(event) {
    if (!event.data) return;
    if (event.data.type === 'SIDEBAR_INIT') {
      if (event.data.jobData) {
        currentJob = event.data.jobData;
        renderJobPreview();
        autoFillDocFields();
      }
    }
    if (event.data.type === 'JOB_DATA_UPDATE') {
      currentJob = event.data.jobData;
      jobAnalysis = null;
      renderJobPreview();
      autoFillDocFields();
      if (currentTab === 'analysis') {
        show('analysis-empty'); hide('analysis-results'); hide('analysis-loading');
        if (currentJob && currentJob.title) {
          show('analysis-action'); hide('analysis-empty');
        }
      }
    }
  });
}

// --- Render Dashboard ---
function renderDashboard() {
  if (!currentUser) return;
  var name = currentUser.name || currentUser.email || 'User';
  setText('user-name', name);
  var initials = name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
  setText('user-avatar', initials);
  var planBadge = document.getElementById('user-plan');
  if (planBadge) {
    var plan = (currentUser.plan || 'free').toUpperCase();
    planBadge.textContent = plan;
    planBadge.className = 'plan-badge plan-' + (currentUser.plan || 'free');
  }
  setText('settings-email', currentUser.email || '');
}

// --- Login ---
function handleLogin() {
  var email = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value;
  if (!email || !password) return showLoginError('Please enter email and password.');

  setButtonLoading('login-btn', true);
  hideLoginError();

  apiRequest('/auth/login', 'POST', { email: email, password: password }).then(function(res) {
    setButtonLoading('login-btn', false);
    if (res.ok && res.data && res.data.token) {
      authToken = res.data.token;
      currentUser = res.data.user;
      chrome.storage.local.set({ jwt_token: authToken, user_data: currentUser });
      renderDashboard();
      showScreen('dashboard-screen');
      loadResume();
      loadApplications();
      loadDocuments();
    } else {
      showLoginError(res.data?.error || res.data?.message || 'Login failed. Check your credentials.');
    }
  });
}

function showLoginError(msg) {
  var el = document.getElementById('login-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideLoginError() {
  var el = document.getElementById('login-error');
  if (el) el.style.display = 'none';
}

// --- Logout ---
function handleLogout() {
  chrome.storage.local.remove(['jwt_token', 'user_data'], function() {
    authToken = null;
    currentUser = null;
    showScreen('login-screen');
  });
}

// --- Job Preview ---
function renderJobPreview() {
  var card = document.getElementById('job-preview-card');
  if (!currentJob || !currentJob.title) {
    if (card) card.style.display = 'none';
    return;
  }
  if (card) card.style.display = 'block';
  setText('job-preview-title', currentJob.title);
  setText('job-preview-company', currentJob.company || 'Unknown Company');
  setText('job-preview-location', currentJob.location || '');
  var tagsEl = document.getElementById('job-preview-tags');
  if (tagsEl) {
    var tags = [];
    if (currentJob.remoteStatus && currentJob.remoteStatus !== 'On-site') tags.push(currentJob.remoteStatus);
    if (currentJob.experience && currentJob.experience !== 'Not specified') tags.push(currentJob.experience);
    tagsEl.innerHTML = tags.map(function(t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
  }

  // Update resume status
  updateResumeStatus();

  // Show analysis action if job is present
  if (currentTab === 'analysis') {
    hide('analysis-empty');
    show('analysis-action');
  }
}

// --- Resume Status on Home ---
function updateResumeStatus() {
  if (resume) {
    setText('resume-status-title', resume.title || 'Resume uploaded');
    setText('resume-status-sub', 'Ready for AI analysis and applications');
    var btn = document.getElementById('home-upload-resume-btn');
    if (btn) btn.textContent = 'View';
  }
}

// --- Job Analysis ---
function runJobAnalysis() {
  if (!currentJob || !currentJob.title) return;
  hide('analysis-empty');
  hide('analysis-results');
  hide('analysis-action');
  show('analysis-loading');

  apiRequest('/extension/analyze-job', 'POST', {
    title: currentJob.title,
    company: currentJob.company,
    location: currentJob.location,
    description: (currentJob.description || '').substring(0, 5000),
    salary: currentJob.salary,
    experience: currentJob.experience,
    remoteStatus: currentJob.remoteStatus
  }).then(function(res) {
    hide('analysis-loading');
    if (res.ok && res.data && res.data.analysis) {
      jobAnalysis = res.data.analysis;
      renderAnalysisResults();
    } else {
      show('analysis-action');
      alert('Analysis failed. Please try again.');
    }
  });
}

function renderAnalysisResults() {
  show('analysis-results');
  var a = jobAnalysis;
  var score = a.overallMatch || 0;

  // Animate score circle
  animateScoreCircle('score-fill', score, 62);
  setText('score-value', score + '%');
  setText('score-verdict', a.verdict || getVerdict(score));

  // Breakdown bars
  var breakdown = a.breakdown || {};
  var barsHtml = '';
  var labels = { resumeMatch: 'Resume', skillsMatch: 'Skills', experienceMatch: 'Experience', locationMatch: 'Location', educationMatch: 'Education', salaryMatch: 'Salary' };
  for (var key in labels) {
    var val = breakdown[key] || 0;
    barsHtml += '<div class="bar-row"><span class="bar-label">' + labels[key] + '</span><div class="bar-track"><div class="bar-fill" style="width:' + val + '%"></div></div><span class="bar-value">' + val + '%</span></div>';
  }
  var barsEl = document.getElementById('breakdown-bars');
  if (barsEl) barsEl.innerHTML = barsHtml;

  // Missing skills
  renderTagList('missing-skills-card', 'missing-skills-tags', a.missingSkills);

  // Strengths
  renderInsightList('strengths-card', 'strengths-list', a.strengths);

  // Weaknesses
  renderInsightList('weaknesses-card', 'weaknesses-list', a.weaknesses);

  // Resume suggestions
  renderInsightList('suggestions-card', 'suggestions-list', a.resumeChanges);

  // Salary insight
  if (a.salaryInsight) {
    show('salary-card');
    setText('salary-text', a.salaryInsight);
  }
}

function animateScoreCircle(id, score, radius) {
  var circle = document.getElementById(id);
  if (!circle) return;
  var circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;
  setTimeout(function() {
    var offset = circumference - (score / 100) * circumference;
    circle.style.transition = 'stroke-dashoffset 1.2s ease-in-out';
    circle.style.strokeDashoffset = offset;
  }, 100);
}

function getVerdict(score) {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 50) return 'Moderate Match';
  return 'Needs Improvement';
}

// --- Resume ---
function loadResume() {
  apiRequest('/extension/resume').then(function(res) {
    if (res.ok && res.data && res.data.resume) {
      resume = res.data.resume;
      show('resume-view'); hide('resume-empty');
      var preview = document.getElementById('resume-preview-content');
      if (preview) preview.textContent = (resume.content || '').substring(0, 2000);
      updateResumeStatus();
    }
  });
}

function handleResumeUpload() {
  var text = document.getElementById('resume-text-input').value.trim();
  if (!text) return alert('Please paste your resume text.');
  setButtonLoading('resume-upload-btn', true);
  apiRequest('/extension/resume/upload', 'POST', { content: text, title: 'My Resume' }).then(function(res) {
    setButtonLoading('resume-upload-btn', false);
    if (res.ok && res.data && res.data.success) {
      resume = { id: res.data.id, content: text, title: 'My Resume' };
      show('resume-view'); hide('resume-empty');
      var preview = document.getElementById('resume-preview-content');
      if (preview) preview.textContent = text.substring(0, 2000);
      updateResumeStatus();
    } else {
      alert('Upload failed. Please try again.');
    }
  });
}

function handleAIResumeCreate() {
  var answers = {
    fullName: document.getElementById('ai-fullname').value.trim(),
    targetRole: document.getElementById('ai-jobtitle').value.trim(),
    experience: document.getElementById('ai-experience').value.trim(),
    skills: document.getElementById('ai-skills').value.trim(),
    education: document.getElementById('ai-education').value.trim(),
    summary: document.getElementById('ai-summary').value.trim()
  };
  if (!answers.fullName) return alert('Please enter your full name.');
  setButtonLoading('ai-resume-create-btn', true);
  apiRequest('/extension/resume/create', 'POST', { answers: answers }).then(function(res) {
    setButtonLoading('ai-resume-create-btn', false);
    if (res.ok && res.data && res.data.content) {
      resume = { id: res.data.id, content: res.data.content, title: 'AI Generated Resume' };
      show('resume-view'); hide('resume-empty');
      var preview = document.getElementById('resume-preview-content');
      if (preview) preview.textContent = res.data.content.substring(0, 2000);
      updateResumeStatus();
    } else {
      alert('Resume creation failed. Please try again.');
    }
  });
}

function handleResumeAnalyze() {
  setButtonLoading('resume-analyze-btn', true);
  var jobDesc = currentJob ? currentJob.description : '';
  apiRequest('/extension/resume/analyze', 'POST', {
    resumeText: resume ? resume.content : '',
    jobDescription: jobDesc
  }).then(function(res) {
    setButtonLoading('resume-analyze-btn', false);
    if (res.ok && res.data && res.data.analysis) {
      var a = res.data.analysis;
      // ATS score
      show('resume-ats-section');
      animateScoreCircle('ats-score-fill', a.atsScore || 0, 44);
      setText('ats-score-value', (a.atsScore || 0) + '%');

      renderInsightList('resume-strengths-card', 'resume-strengths-list', a.strengths);
      renderInsightList('resume-weaknesses-card', 'resume-weaknesses-list', a.weaknesses);
      renderInsightList('resume-improvements-card', 'resume-improvements-list', a.improvements);
    } else {
      alert('Analysis failed. Please try again.');
    }
  });
}

function handleResumeDownload() {
  if (!resume || !resume.content) return;
  var blob = new Blob([resume.content], { type: 'text/plain' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = (resume.title || 'resume') + '.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// --- Documents ---
function loadDocuments() {
  apiRequest('/extension/documents').then(function(res) {
    if (res.ok && res.data && res.data.documents) {
      documents = res.data.documents;
      renderDocHistory();
    }
  });
}

function selectDocType(type) {
  selectedDocType = type;
  var pills = document.querySelectorAll('[data-doctype]');
  for (var i = 0; i < pills.length; i++) {
    pills[i].classList.toggle('active', pills[i].getAttribute('data-doctype') === type);
  }
}

function autoFillDocFields() {
  if (!currentJob) return;
  var titleInput = document.getElementById('doc-job-title');
  var companyInput = document.getElementById('doc-company');
  var descInput = document.getElementById('doc-description');
  if (titleInput && !titleInput.value) titleInput.value = currentJob.title || '';
  if (companyInput && !companyInput.value) companyInput.value = currentJob.company || '';
  if (descInput && !descInput.value) descInput.value = (currentJob.description || '').substring(0, 3000);
}

function handleDocGenerate() {
  var jobTitle = document.getElementById('doc-job-title').value.trim();
  var company = document.getElementById('doc-company').value.trim();
  var desc = document.getElementById('doc-description').value.trim();
  if (!jobTitle && !company) return alert('Please enter a job title or company.');
  setButtonLoading('doc-generate-btn', true);
  hide('doc-output-section');

  apiRequest('/extension/generate-document', 'POST', {
    type: selectedDocType,
    jobTitle: jobTitle,
    company: company,
    jobDescription: desc
  }).then(function(res) {
    setButtonLoading('doc-generate-btn', false);
    if (res.ok && res.data && res.data.content) {
      var output = document.getElementById('doc-output-text');
      if (output) { output.value = res.data.content; output.readOnly = false; }
      var title = document.getElementById('doc-output-title');
      var typeNames = { cover_letter: 'Cover Letter', recruiter_message: 'Recruiter Message', application_answers: 'Application Answers' };
      if (title) title.textContent = typeNames[selectedDocType] || 'Generated Document';
      show('doc-output-section');
    } else {
      alert('Generation failed. Please try again.');
    }
  });
}

function handleDocCopy() {
  var output = document.getElementById('doc-output-text');
  if (!output || !output.value) return;
  navigator.clipboard.writeText(output.value).then(function() {
    var btn = document.getElementById('doc-copy-btn');
    if (btn) { btn.textContent = 'Copied!'; setTimeout(function() { btn.textContent = 'Copy'; }, 2000); }
  });
}

function handleDocSave() {
  var output = document.getElementById('doc-output-text');
  if (!output || !output.value) return;
  var jobTitle = document.getElementById('doc-job-title').value.trim();
  var company = document.getElementById('doc-company').value.trim();
  setButtonLoading('doc-save-btn', true);

  apiRequest('/extension/documents', 'POST', {
    type: selectedDocType,
    title: selectedDocType.replace(/_/g, ' ') + ' — ' + (company || jobTitle || 'General'),
    content: output.value
  }).then(function(res) {
    setButtonLoading('doc-save-btn', false);
    if (res.ok && res.data && res.data.success) {
      loadDocuments();
      var btn = document.getElementById('doc-save-btn');
      if (btn) { btn.textContent = 'Saved!'; setTimeout(function() { btn.textContent = 'Save'; }, 2000); }
    }
  });
}

function renderDocHistory() {
  var container = document.getElementById('doc-history-list');
  if (!container) return;
  if (!documents || documents.length === 0) {
    container.innerHTML = '<div class="empty-state small"><p class="empty-desc">No saved documents yet.</p></div>';
    return;
  }
  var html = '';
  for (var i = 0; i < documents.length; i++) {
    var doc = documents[i];
    var typeIcon = doc.type === 'cover_letter' ? '✉️' : doc.type === 'recruiter_message' ? '💬' : '📝';
    var date = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '';
    html += '<div class="doc-item"><span class="doc-icon">' + typeIcon + '</span><div class="doc-info"><span class="doc-title">' + escapeHtml(doc.title || 'Untitled') + '</span><span class="doc-date">' + date + '</span></div></div>';
  }
  container.innerHTML = html;
}

// --- Application History ---
function loadApplications() {
  apiRequest('/extension/applications').then(function(res) {
    if (res.ok && res.data && res.data.applications) {
      applications = res.data.applications;
      renderApplications();
    }
  });
}

function renderApplications() {
  var container = document.getElementById('history-list');
  var emptyEl = document.getElementById('history-empty');
  if (!container) return;

  var filtered = applications;
  if (historyFilter !== 'all') {
    filtered = applications.filter(function(a) { return a.status === historyFilter; });
  }

  if (filtered.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(emptyEl);
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  var html = '';
  for (var i = 0; i < filtered.length; i++) {
    var app = filtered[i];
    var date = app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '';
    var statusClass = 'status-' + (app.status || 'applied');
    html += '<div class="app-item"><div class="app-info"><span class="app-title">' + escapeHtml(app.jobTitle || 'Untitled') + '</span><span class="app-company">' + escapeHtml(app.company || '') + '</span></div><div class="app-meta"><span class="status-badge ' + statusClass + '">' + escapeHtml(app.status || 'applied') + '</span><span class="app-date">' + date + '</span></div></div>';
  }
  container.innerHTML = html;
}

// --- Apply with AI ---
function triggerApplyWithAI() {
  if (!currentJob || !currentJob.title) {
    alert('Navigate to a job listing first.');
    return;
  }
  chrome.storage.local.get(['jwt_token', 'user_data'], function(result) {
    if (!result.jwt_token) {
      alert('Please sign in first.');
      return;
    }
    window.parent.postMessage({
      type: 'START_AI_APPLY',
      userProfile: result.user_data || {},
      jobData: currentJob,
      token: result.jwt_token
    }, '*');
  });
}

// --- Utilities ---
function show(id) { var el = document.getElementById(id); if (el) el.style.display = ''; }
function hide(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }
function setText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

function setButtonLoading(id, loading) {
  var btn = document.getElementById(id);
  if (!btn) return;
  var text = btn.querySelector('.btn-text');
  var spinner = btn.querySelector('.btn-spinner');
  if (loading) {
    btn.disabled = true;
    if (text) text.style.display = 'none';
    if (spinner) spinner.style.display = 'inline-flex';
  } else {
    btn.disabled = false;
    if (text) text.style.display = '';
    if (spinner) spinner.style.display = 'none';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderTagList(cardId, containerId, items) {
  var card = document.getElementById(cardId);
  var container = document.getElementById(containerId);
  if (!card || !container) return;
  if (!items || items.length === 0) { card.style.display = 'none'; return; }
  card.style.display = '';
  container.innerHTML = items.map(function(item) { return '<span class="tag">' + escapeHtml(item) + '</span>'; }).join('');
}

function renderInsightList(cardId, listId, items) {
  var card = document.getElementById(cardId);
  var list = document.getElementById(listId);
  if (!card || !list) return;
  if (!items || items.length === 0) { card.style.display = 'none'; return; }
  card.style.display = '';
  list.innerHTML = items.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('');
}
