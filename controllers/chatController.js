const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;  // Tambahkan ini
const Chat = require('../models/Chat');
const PrivateChat = require('../models/PrivateChat');
const Pengguna = require('../models/Pengguna');
const Room = require('../models/Room');

exports.getRoomChat = async (req, res) => {
    try {
        const messages = await Chat.find({ ruangan: req.params.roomId })
            .populate('pengirim', 'nama')
            .sort({ createdAt: 1 })
            .limit(50);

        res.render('pages/chat/room', {
            title: 'Chat Komunitas',
            messages,
            roomId: req.params.roomId,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Terjadi kesalahan saat memuat chat',
            user: req.session.user
        });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.render('pages/chat/rooms', {
            title: 'Chat Komunitas',
            rooms,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Terjadi kesalahan saat memuat ruang chat',
            user: req.session.user
        });
    }
};

exports.getPrivateChats = async (req, res) => {
    try {
        const chats = await PrivateChat.aggregate([
            {
                $match: {
                    $or: [
                        { pengirim: new ObjectId(req.session.user.id) },  // Gunakan new ObjectId()
                        { penerima: new ObjectId(req.session.user.id) }   // Gunakan new ObjectId()
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$pengirim", new ObjectId(req.session.user.id)] }, // Gunakan new ObjectId()
                            "$penerima",
                            "$pengirim"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);

        const chatList = await Pengguna.populate(chats, {
            path: '_id',
            select: 'nama'
        });

        res.render('pages/chat/private-list', {
            title: 'Chat Pribadi List',
            chats: chatList,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            title: 'Error', 
            message: 'Terjadi kesalahan saat memuat chat',
            user: req.session.user 
        });
    }
};

exports.getPrivateChat = async (req, res) => {
    try {
        const otherUser = await Pengguna.findById(req.params.userId)
            .select('nama email');

        if (!otherUser) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Pengguna tidak ditemukan',
                user: req.session.user
            });
        }

        const messages = await PrivateChat.find({
            $or: [
                { pengirim: req.session.user.id, penerima: req.params.userId },
                { pengirim: req.params.userId, penerima: req.session.user.id }
            ]
        })
        .sort({ createdAt: 1 })
        .limit(50);

        res.render('pages/chat/private-chat', {
            title: 'Private Chat',
            messages,
            otherUser,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Terjadi kesalahan saat memuat chat',
            user: req.session.user
        });
    }
};

exports.getPrivateChatRoom = async (req, res) => {
    try {
        const otherUser = await Pengguna.findById(req.params.userId)
            .select('nama');

        if (!otherUser) {
            return res.status(404).render('error', {
                title: 'Error',
                message: 'Pengguna tidak ditemukan',
                user: req.session.user
            });
        }

        const messages = await PrivateChat.find({
            $or: [
                { pengirim: req.session.user.id, penerima: req.params.userId },
                { pengirim: req.params.userId, penerima: req.session.user.id }
            ]
        })
        .sort({ createdAt: 1 });

        res.render('pages/chat/private-chat', {
            title: 'Chat Pribadi Room',
            otherUser,
            messages,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Terjadi kesalahan saat memuat chat',
            user: req.session.user
        });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const users = await Pengguna.find({
            _id: { $ne: req.session.user.id }
        })
        .select('nama email')
        .limit(20);

        res.json(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memuat kontak' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const users = await Pengguna.find({
            _id: { $ne: req.session.user.id },
            nama: { $regex: searchTerm, $options: 'i' }
        })
        .select('nama')
        .limit(10);

        res.json(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mencari pengguna' });
    }
};