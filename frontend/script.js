// ---------- CONTACT FORM ----------
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const message = messageInput?.value.trim() || '';

    if (!name) return alert('Please enter your name.');
    if (!email) return alert('Please enter your email.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email.');
      emailInput?.focus();
      return;
    }

    if (!message) return alert('Please enter your message.');

    try {
      const res = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error sending message');
      }

      alert('Sent!');
      contactForm.reset();
    } catch (err) {
      console.error(err);
      alert('Failed to send');
    }
  });
}

// ---------- LOGIN FORM ----------
const loginForm = document.getElementById('messagesForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const loginEmail = document.getElementById('email')?.value.trim() || '';
    const loginPassword = document.getElementById('password')?.value || '';

    if (!loginEmail || !loginPassword) {
      alert('Please enter email and password.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('adminToken', data.token);
      window.location.href = 'messages.html';
    } catch (err) {
      console.error(err);
      alert('Login request failed');
    }
  });
}

// ---------- THEME ----------
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark-mode');
  if (themeToggle) themeToggle.textContent = '☀️';
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark-mode');

    if (document.documentElement.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      localStorage.setItem('theme', 'light');
      themeToggle.textContent = '🌙';
    }
  });
}

// ---------- NAV ACTIVE LINK ----------
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.style.color = 'var(--green-700)';
    link.style.backgroundColor = 'var(--green-100)';
  }
});

// ---------- REVEAL ANIMATION ----------
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => obs.observe(el));
}

// ---------- HAMBURGER ----------
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

if (hamburger && navbar) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navbar.classList.toggle('active');
  });

  document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
    });
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navbar.contains(e.target)) {
      hamburger.classList.remove('active');
      navbar.classList.remove('active');
    }
  });
}

// ---------- MESSAGES PAGE ----------
const messagesListEl = document.getElementById('messagesList');
const messagesStatusEl = document.getElementById('messagesStatus');
const refreshMessagesBtn = document.getElementById('refreshMessages');

const isMessagesPage = window.location.pathname.endsWith('messages.html');

if (isMessagesPage) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
  }
}

async function loadMessages() {
  if (!messagesListEl || !messagesStatusEl) return;

  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  messagesStatusEl.textContent = 'Loading…';
  messagesListEl.innerHTML = '';

  try {
    const res = await fetch('http://localhost:3000/api/messages', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
      return;
    }

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load messages');
    }

    const messages = data.data || [];
    if (!messages.length) {
      messagesStatusEl.textContent = 'No messages yet.';
      return;
    }

    messagesStatusEl.textContent = `Loaded ${messages.length} message(s).`;

    messagesListEl.innerHTML = messages.map(m => {
      const date = m.createdAt ? new Date(m.createdAt).toLocaleString() : '';
      return `
        <article class="message-card">
          <div class="message-meta">
            <div><strong>Name:</strong> ${escapeHtml(m.name || '')}</div>
            <div><strong>Email:</strong> ${escapeHtml(m.email || '')}</div>
            <div><strong>Date:</strong> ${escapeHtml(date)}</div>
          </div>
          <p class="message-text">${escapeHtml(m.message || '')}</p>
          <div class="message-actions">
            <button class="btn btn-danger" data-delete-id="${m._id}">Delete</button>
          </div>
        </article>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    messagesStatusEl.textContent = 'Error loading messages.';
  }
}

if (messagesListEl) {
  messagesListEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-delete-id]');
    if (!btn) return;

    const id = btn.getAttribute('data-delete-id');
    const ok = confirm('Delete this message?');
    if (!ok) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Deleting…';

    try {
      const res = await fetch(`http://localhost:3000/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete');
      }

      await loadMessages();
    } catch (err) {
      console.error(err);
      alert('Failed to delete message.');
      btn.disabled = false;
      btn.textContent = 'Delete';
    }
  });
}

if (refreshMessagesBtn) {
  refreshMessagesBtn.addEventListener('click', loadMessages);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

if (messagesListEl && messagesStatusEl) {
  loadMessages();
}

const isProjectsPage = window.location.pathname.endsWith('projects.html');

const PAGE_SIZE = 6;
let allRepos = [];
let visibleCount = 0;

let rawRepos = []; 
let filteredRepos = [];  

function repoToCardHtml(repo) {
  const name = repo.name || 'Unnamed repo';
  const desc = repo.description ? escapeHtml(repo.description) : 'Fără descriere disponibilă';
  const lang = repo.language ? escapeHtml(repo.language) : 'N/A';
  const stars = Number(repo.stargazers_count || 0);
  const forks = Number(repo.forks_count || 0);
  const link = repo.html_url || '#';

  return `
    <article class="repo-card">
      <h3>${escapeHtml(name)}</h3>
      <p class="repo-desc">${desc}</p>

      <div class="repo-meta">
        <div class="repo-meta-row"><strong>Language:</strong> <span>${lang}</span></div>
        <div class="repo-meta-row"><strong>Stars:</strong> <span>${stars}</span></div>
        <div class="repo-meta-row"><strong>Forks:</strong> <span>${forks}</span></div>
      </div>

      <div class="repo-actions">
        <a class="btn" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </div>
    </article>
  `;
}

function normalize(str) {
  return String(str || '').toLowerCase();
}

function buildLanguageOptions(repos) {
  const select = document.getElementById('repoLanguage');
  if (!select) return;

  const langs = new Set();
  repos.forEach(r => {
    if (r && r.language) langs.add(r.language);
  });

  const sorted = Array.from(langs).sort((a, b) => a.localeCompare(b));

  select.innerHTML = `<option value="all">All</option>` + sorted
    .map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`)
    .join('');
}

function applyRepoFilters() {
  const searchEl = document.getElementById('repoSearch');
  const langEl = document.getElementById('repoLanguage');
  const sortEl = document.getElementById('repoSort');

  const q = normalize(searchEl?.value);
  const lang = langEl?.value || 'all';
  const sort = sortEl?.value || 'updated';

  filteredRepos = rawRepos.filter(r => {
    if (!r) return false;

    const matchesLang = (lang === 'all') || (r.language === lang);

    const hay = normalize(r.name) + ' ' + normalize(r.description);
    const matchesSearch = !q || hay.includes(q);

    return matchesLang && matchesSearch;
  });

  if (sort === 'updated') {
    filteredRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  } else if (sort === 'stars') {
    filteredRepos.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  } else if (sort === 'name') {
    filteredRepos.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }

  const grid = document.getElementById('repoGrid');
  if (grid) grid.innerHTML = '';

  allRepos = filteredRepos; 
  visibleCount = 0;

  if (allRepos.length === 0) {
    const status = document.getElementById('repoStatus');
    const btn = document.getElementById('loadMoreBtn');
    if (status) status.textContent = 'No repositories match your filters.';
    if (btn) btn.style.display = 'none';
    return;
  }

  renderNextRepos();
}

function wireRepoControls() {
  const searchEl = document.getElementById('repoSearch');
  const langEl = document.getElementById('repoLanguage');
  const sortEl = document.getElementById('repoSort');
  const resetEl = document.getElementById('repoReset');

  if (searchEl) searchEl.addEventListener('input', () => applyRepoFilters());
  if (langEl) langEl.addEventListener('change', () => applyRepoFilters());
  if (sortEl) sortEl.addEventListener('change', () => applyRepoFilters());

  if (resetEl) {
    resetEl.addEventListener('click', () => {
      if (searchEl) searchEl.value = '';
      if (langEl) langEl.value = 'all';
      if (sortEl) sortEl.value = 'updated';
      applyRepoFilters();
    });
  }
}

function updateLoadMoreUI() {
  const status = document.getElementById('repoStatus');
  const btn = document.getElementById('loadMoreBtn');
  if (!status || !btn) return;

  status.textContent = `Showing ${Math.min(visibleCount, allRepos.length)} of ${allRepos.length} repositories.`;

  const hasMore = visibleCount < allRepos.length;
  btn.style.display = hasMore ? 'inline-flex' : 'none';
}

function renderNextRepos() {
  const grid = document.getElementById('repoGrid');
  if (!grid) return;

  const next = allRepos.slice(visibleCount, visibleCount + PAGE_SIZE);
  grid.insertAdjacentHTML('beforeend', next.map(repoToCardHtml).join(''));

  visibleCount += next.length;
  updateLoadMoreUI();
}

async function loadGitHubRepos() {
  const grid = document.getElementById('repoGrid');
  const statusText = document.getElementById('repoStatusText');
  const spinner = document.querySelector('#repoStatus .spinner');
  const btn = document.getElementById('loadMoreBtn');

  if (!grid || !statusText || !btn) return;


  statusText.textContent = 'Loading projects…';
  if (spinner) spinner.style.display = 'inline-block';
  grid.innerHTML = '';
  btn.style.display = 'none';

  const username = 'popam482';
  const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;

  try {
    let res;

    try {
      res = await fetch(url);
    } catch (networkErr) {
      throw new Error('network_error');
    }

    if (!res.ok) {
      if (res.status === 403) throw new Error('rate_limit');
      if (res.status === 404) throw new Error('user_not_found');
      throw new Error(`http_${res.status}`);
    }

    const repos = await res.json();

    rawRepos = (repos || []).filter(r => r && r.fork === false);

    if (rawRepos.length === 0) {
      statusText.textContent = 'No repositories found.';
      if (spinner) spinner.style.display = 'none';
      btn.style.display = 'none';
      grid.innerHTML = '';
      return;
    }

    buildLanguageOptions(rawRepos);
    wireRepoControls();
    applyRepoFilters(); 

    if (spinner) spinner.style.display = 'none';

    btn.onclick = () => renderNextRepos();

  } catch (err) {
    console.error(err);

    grid.innerHTML = '';
    btn.style.display = 'none';
    if (spinner) spinner.style.display = 'none';

    if (err.message === 'rate_limit') {
      statusText.textContent =
        'Oops! You have hit the GitHub API rate limit. Please try again later.';
    } else if (err.message === 'user_not_found') {
      statusText.textContent =
        'Oops! The GitHub user was not found. Please check the username.';
    } else if (err.message === 'network_error') {
      statusText.textContent =
        'Oops! There is no internet connection or GitHub is not responding at the moment.';
    } else {
      statusText.textContent =
        'Oops! We could not load the projects at the moment.';
    }
  }
}

if (isProjectsPage) {
  loadGitHubRepos();
}