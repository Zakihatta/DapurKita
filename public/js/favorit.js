document.addEventListener('DOMContentLoaded', function() {
    const favoritBtn = document.getElementById('favoritBtn');
    if (favoritBtn) {
        favoritBtn.addEventListener('click', async function() {
            const resepId = window.location.pathname.split('/').pop();
            try {
                const response = await fetch(`/resep/${resepId}/favorit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                
                // Update tampilan tombol
                if (data.isFavorit) {
                    favoritBtn.classList.remove('btn-primary');
                    favoritBtn.classList.add('btn-danger');
                    favoritBtn.querySelector('span').textContent = 'Hapus dari Favorit';
                } else {
                    favoritBtn.classList.remove('btn-danger');
                    favoritBtn.classList.add('btn-primary');
                    favoritBtn.querySelector('span').textContent = 'Tambah ke Favorit';
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
});