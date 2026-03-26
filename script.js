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
        form.reset();
    });
}