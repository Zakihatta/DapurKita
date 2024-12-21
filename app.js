const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const socketIo = require('socket.io');
const Chat = require('./models/Chat');
const PrivateChat = require('./models/PrivateChat');

// Import routes dan controllers
const authRoutes = require('./routes/auth');
const resepRoutes = require('./routes/resep');
const ratingRoutes = require('./routes/rating');
const chatRoutes = require('./routes/chat');
const dashboardController = require('./controllers/dashboardController');
const auth = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// View Engine Setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('layout', 'layouts/main');

// Helper function for formatting time
app.locals.formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'rahasia',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Setup Nodemailer
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Bagian Socket.IO di app.js
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handler untuk chat komunitas
    socket.on('join-room', ({ roomId, userNama }) => {
        socket.join(roomId);
        console.log(`User ${userNama} joined room ${roomId}`);
    });

    socket.on('chat-message', async (data) => {
        try {
            const chat = new Chat({
                pengirim: data.userId,
                pesan: data.message,
                ruangan: data.roomId
            });
            
            await chat.save();
            
            // Broadcast ke semua di room termasuk pengirim
            io.to(data.roomId).emit('message', {
                userId: data.userId,
                nama: data.nama,
                message: data.message,
                createdAt: new Date()
            });
            
        } catch (error) {
            console.error('Error saving chat:', error);
            socket.emit('error', { message: 'Gagal mengirim pesan' });
        }
    });

    // Handler untuk private chat
    socket.on('join-private', (data) => {
        const room1 = `private_${data.userId}_${data.otherId}`;
        const room2 = `private_${data.to}_${data.from}`;
        socket.join([room1, room2]);
        console.log(`User joined private rooms: ${room1}, ${room2}`);
    });

    socket.on('private-message', async (data) => {
        try {
            if (!data.from || !data.to || !data.message) {
                console.error('Missing required fields:', data);
                socket.emit('error', { message: 'Data tidak lengkap' });
                return;
            }
    
            const chat = new PrivateChat({
                pengirim: data.from,
                penerima: data.to,
                pesan: data.message,
                createdAt: new Date()
            });
            
            const savedChat = await chat.save();
            
            // Emit ke pengirim dan penerima dengan data lengkap
            const messageData = {
                _id: savedChat._id,
                pengirim: data.from,
                pesan: data.message,
                createdAt: savedChat.createdAt
            };
    
            // Emit ke kedua room
            const room1 = `private_${data.from}_${data.to}`;
            const room2 = `private_${data.to}_${data.from}`;
            io.to(room1).to(room2).emit('private-message', messageData);
            
        } catch (error) {
            console.error('Error saving private message:', error);
            socket.emit('error', { message: 'Gagal mengirim pesan' });
        }
    });

    // Online status handler
    socket.on('user-connect', (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit('user-status-change', {
            userId: userId,
            status: 'online'
        });
        console.log(`User ${userId} is now online`);
    });

    socket.on('disconnect', () => {
        let userId = null;
        for (const [key, value] of onlineUsers.entries()) {
            if (value === socket.id) {
                userId = key;
                break;
            }
        }
        
        if (userId) {
            onlineUsers.delete(userId);
            io.emit('user-status-change', {
                userId: userId,
                status: 'offline'
            });
            console.log(`User ${userId} is now offline`);
        }
        
        console.log('User disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/auth', authRoutes);
app.use('/resep', resepRoutes);
app.use('/rating', ratingRoutes);
app.use('/chat', chatRoutes);

// Page Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('pages/login', { 
            title: 'Masuk',
            error: null,
            user: null
        });
    }
});

app.get('/daftar', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('pages/register', { 
            title: 'Daftar',
            user: null
        });
    }
});

app.get('/dashboard', auth, dashboardController.getDashboard);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error',
        message: 'Terjadi kesalahan!',
        user: req.session ? req.session.user : null
    });
});

// Database Connection
mongoose.connect('mongodb://127.0.0.1:27017/dapurkita')
    .then(() => console.log('Terhubung ke MongoDB'))
    .catch((err) => console.error('Kesalahan koneksi MongoDB:', err));

// Server Start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});