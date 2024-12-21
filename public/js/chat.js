const socket = io();
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const statusIndicator = document.getElementById('connection-status');
const noMessages = document.getElementById('noMessages');

const roomId = document.querySelector('[data-room-id]').dataset.roomId;
const userId = document.querySelector('[data-user-id]').dataset.userId;
const userNama = document.querySelector('[data-user-nama]').dataset.userNama;

// Update status koneksi
function updateConnectionStatus(status, isConnected) {
    const statusIcon = statusIndicator.previousElementSibling;
    if (isConnected) {
        statusIcon.className = 'fas fa-circle connected';
        statusIndicator.textContent = status;
    } else {
        statusIcon.className = 'fas fa-circle connecting';
        statusIndicator.textContent = status;
    }
}

// Koneksi socket
socket.on('connect', () => {
    updateConnectionStatus('Terhubung', true);
    socket.emit('join-room', { roomId, userNama });
});

socket.on('disconnect', () => {
    updateConnectionStatus('Terputus', false);
});

socket.on('reconnecting', () => {
    updateConnectionStatus('Menghubungkan kembali...', false);
});

// Fungsi untuk menambah pesan
function appendMessage(message, isOwn = false) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isOwn ? 'own-message' : ''}`;
    
    messageElement.innerHTML = `
        <div class="message-content">
            ${message.text}
        </div>
        <div class="message-meta">
            <span class="message-sender">${message.sender}</span>
            <span class="message-time">${formatTime(message.time)}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Sembunyikan notifikasi tidak ada pesan
    if (noMessages) {
        noMessages.style.display = 'none';
    }
}

// Handle form submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    
    if (message && socket.connected) {
        const messageData = {
            userId,
            nama: userNama,
            message,
            roomId,
            time: new Date()
        };

        // Tampilkan pesan secara lokal terlebih dahulu
        appendMessage({
            text: message,
            sender: userNama,
            time: new Date()
        }, true);

        // Kirim ke server
        socket.emit('chat-message', messageData);
        
        messageInput.value = '';
        messageInput.focus();
    }
});

// Terima pesan dari server
socket.on('message', (data) => {
    if (data.userId !== userId) {
        appendMessage({
            text: data.message,
            sender: data.nama,
            time: new Date(data.createdAt)
        });
    }
});

// Format waktu
function formatTime(date) {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Auto scroll ke bawah saat halaman dimuat
chatMessages.scrollTop = chatMessages.scrollHeight;