const socket = io();
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const newChatBtn = document.getElementById('newChatBtn');
const modal = document.getElementById('newChatModal');
const userSearch = document.getElementById('userSearch');
const searchResults = document.getElementById('searchResults');


// Dapatkan ID user dari data attributes
const otherId = chatMessages?.dataset.otherId;
const userId = document.querySelector('[data-user-id]')?.dataset.userId;

// Emit status online saat user connect
if (userId) {
    socket.emit('user-connect', userId);
}

// Function untuk format waktu
const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Function untuk menambahkan pesan ke UI
function appendMessage(message, isOwn = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own-message' : ''}`;
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <p>${message.pesan || message.message}</p>
            <span class="message-time">${formatTime(message.createdAt)}</span>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

//Update status pengguna
socket.on('user-status-change', (data) => {
    const statusIndicator = document.querySelector(`[data-user-id="${data.userId}"]`);
    if (statusIndicator) {
        statusIndicator.className = `status-indicator ${data.status}`;
    }
});

// Chat functionality
if (chatForm) {
    const otherId = chatMessages.dataset.otherId;
    const userId = chatMessages.dataset.userId;

    // Join private room
    socket.emit('join-private', { userId, otherId });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        
        if (message && userId && otherId) {
            const messageData = {
                from: userId,
                to: otherId,
                message: message
            };

            // Tampilkan pesan secara lokal terlebih dahulu
            appendMessage({
                pesan: message,
                createdAt: new Date()
            }, true);
            
            // Kirim ke server
            socket.emit('private-message', messageData);
            
            // Reset input
            messageInput.value = '';
            messageInput.focus();
        }
    });

    // Listen untuk pesan baru
    socket.on('private-message', (data) => {
        if (data.pengirim !== userId) {
            appendMessage(data, false);
        }
    });
}

// Modal dan pencarian
if (newChatBtn && modal) {
    newChatBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    modal.querySelector('.close-btn')?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    let searchTimeout;
    userSearch?.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        searchTimeout = setTimeout(async () => {
            if (query.length >= 2) {
                try {
                    const response = await fetch(`/chat/users/search?q=${query}`);
                    const users = await response.json();
                    displaySearchResults(users);
                } catch (error) {
                    console.error('Error searching users:', error);
                }
            } else {
                searchResults.innerHTML = '';
            }
        }, 300);
    });
}

// Fungsi untuk menampilkan hasil pencarian
function displaySearchResults(users) {
    searchResults.innerHTML = '';
    users.forEach(user => {
        const userEl = document.createElement('div');
        userEl.className = 'search-result-item';
        userEl.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <span>${user.nama}</span>
            </div>
            <a href="/chat/private/${user._id}" class="btn btn-sm btn-primary">Chat</a>
        `;
        searchResults.appendChild(userEl);
    });
}

// Auto scroll to bottom on load
if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}