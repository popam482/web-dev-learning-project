const express = require('express');
const mongoose = require('mongoose');
const Message = require('./models/Message');

const app = express();
const MONGO_URI = 'mongodb+srv://admin:Admin123@portfoliocluster.igiubo9.mongodb.net/?appName=PortfolioCluster';

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
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => {
    res.json({
        message: 'Server is running',
        status: 'success'
    });
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

app.get('/api/messages', async(req, res) => {
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

app.delete('/api/messages/:id', async(req, res) => {
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




const PORT =3000;
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    console.log('Visit http://localhost:' + PORT + ' to see the server response');
});