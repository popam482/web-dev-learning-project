const express = require('express');
const app=express();

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'Server is running',
        status: 'success'
    });
});

app.post('/api/messages', (req, res) => {
    const { name, email, message } = req.body;
    if(!name || !email || !message){
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }
    console.log('Received message:', { name, email, message });
    res.json({
        success: true,
        message: 'Message received successfully'
    });
});

const PORT =3000;
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit http://localhost:' + PORT + ' to see the server response');
});