const express = require('express');
const mongoose = require('mongoose');
const Message = require('./models/Message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const MONGO_URI = 'mongodb://127.0.0.1:27017/web_learning_project';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB!');
})
.catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'Server is running',
        status: 'success'
    });

});

function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}


app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ success: true, token });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});


app.post('/api/messages', async(req, res) => {
    try {
        const { name, email, message } = req.body;
        if(!name || !email || !message){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const newMessage = new Message({name, email, message});
        await newMessage.save();

        console.log('Received message:', { name, email, message });

        res.json({
            success: true,
            message: 'Message received successfully'
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving message'
        });
    }
});

app.get('/api/messages', auth, async(req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
});

app.delete('/api/messages/:id', auth, async(req, res) => {
    try {
        const {id} = req.params;
        const deletedMessage = await Message.findByIdAndDelete(id);
        if(!deletedMessage){
            return res.status(404).json({
                success: false, 
                message: 'Message not found'
            });
        }
        
        console.log('Deleted message:', id);

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message'
        });
    }
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit http://localhost:' + PORT + ' to see the server response');
});