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
        
        const formData=new FormData(form);
        fetch('send-email.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
            if(data.success){
                alert('Your message has been sent successfully!');
            } else {
                alert('There was an error sending your message. Please try again later.');
            }
        })
        .catch(error => {
            alert('There was an error sending your message. Please try again later.');
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