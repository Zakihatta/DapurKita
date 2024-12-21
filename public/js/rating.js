document.addEventListener('DOMContentLoaded', function() {
    const ratingContainer = document.querySelector('.recipe-rating');
    if (!ratingContainer) return;

    const stars = ratingContainer.querySelectorAll('.star-icon');
    const resepId = ratingContainer.dataset.resepId;
    const averageRatingSpan = ratingContainer.querySelector('.average-rating');
    const ratingCountSpan = ratingContainer.querySelector('.rating-count');

    // Mengambil rating user saat ini (jika ada)
    async function getCurrentRating() {
        try {
            const response = await fetch(`/resep/${resepId}/rating`);
            const data = await response.json();
            if (data.rating) {
                highlightStars(data.rating);
            }
        } catch (error) {
            console.error('Error getting current rating:', error);
        }
    }

    // Menyalakan bintang sampai posisi tertentu
    function highlightStars(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Hover effect
    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
            highlightStars(index + 1);
        });

        star.addEventListener('mouseout', () => {
            getCurrentRating();
        });

        star.addEventListener('click', async () => {
            const rating = index + 1;
            try {
                const response = await fetch(`/resep/${resepId}/rating`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ rating })
                });

                const data = await response.json();
                if (data.success) {
                    // Update tampilan rating
                    averageRatingSpan.textContent = data.averageRating;
                    ratingCountSpan.textContent = `(${data.totalRatings} rating)`;
                    highlightStars(rating);
                }
            } catch (error) {
                console.error('Error submitting rating:', error);
            }
        });
    });

    // Ambil rating saat pertama kali load
    getCurrentRating();
});