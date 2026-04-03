const form = document.querySelector('form');
const nameInput=document.getElementById('name');
const emailInput=document.getElementById('email');
const messageInput=document.getElementById('message');

if(form){
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const name=nameInput.value.trim();
        const email=emailInput.value.trim();
        const message=messageInput.value.trim();
        if(!name){
            alert('Please enter your name.');
            return;
        }
        if(!email){
            alert('Please enter your email.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            alert('Please enter a valid email.');
            emailInput.focus();
            return;
        }
        if(!message){
            alert('Please enter your message.');
            return;
        }
        alert('Thank you for your message, ' + name + '! You will receive a response at ' + email + ' soon.');
        
        fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
            })
            .then(r => r.json())
            .then(data => {
            if (data.success) {
                alert('Sent!');
                form.reset();
            } else {
                alert(data.message || 'Error');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Failed to send');
        });
        form.reset();
    });
}

const themeToggle = document.getElementById('themeToggle');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
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

const currentPage = window.location.pathname.split('/').pop() || 'startPage.html';
document.querySelectorAll('.navbar a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.style.color = 'var(--green-700)';
        link.style.backgroundColor = 'var(--green-100)';
    }
});

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

const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');
if(hamburger){
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