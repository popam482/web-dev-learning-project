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
  document.body.classList.add('dark-mode');
  if (themeToggle) themeToggle.textContent = '☀️';
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
      themeToggle.textContent = '☀️';
    } else {
      localStorage.setItem('theme', 'light');
      themeToggle.textContent = '🌙';
    }
  });
}

// ---------- NAV ACTIVE LINK ----------
const currentPage = window.location.pathname.split('/').pop() || 'startPage.html';
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