const favoritePhotos = JSON.parse(localStorage.getItem('favoritePhotos')) || [];

if (favoritePhotos.length === 0) {
    document.getElementById('gallery').innerHTML = '<p>No favorite photos yet.</p>';
} else {
    displayFavoritePhotos(favoritePhotos);
}

// Función para cargar las fotos favoritas
function displayFavoritePhotos(favoritePhotos) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Limpiar la galería antes de mostrar las fotos favoritas

    // Solicitar todas las fotos favoritas a la vez
    fetch(`/favorite-photos?favoritePhotos=${JSON.stringify(favoritePhotos)}`)
        .then(response => response.json())
        .then(photos => {
            photos.forEach(photo => {
                const photoItem = document.createElement('div');
                photoItem.classList.add('photo-item');
                photoItem.innerHTML = `
                            <img src="${photo.urls.small}" alt="${photo.alt_description}">
                            <button class="favorite-btn" onclick="toggleFavorite('${photo.id}')">
                                Remove from favorites
                            </button>
                        `;
                gallery.appendChild(photoItem);
            });
        })
        .catch(error => {
            console.error('Error al cargar las fotos favoritas:', error);
        });
}

// Función para alternar favoritos
function toggleFavorite(photoId) {
    let favoritePhotos = JSON.parse(localStorage.getItem('favoritePhotos')) || [];
    if (favoritePhotos.includes(photoId)) {
        favoritePhotos = favoritePhotos.filter(id => id !== photoId);
    } else {
        favoritePhotos.push(photoId);
    }
    localStorage.setItem('favoritePhotos', JSON.stringify(favoritePhotos));
    displayFavoritePhotos(favoritePhotos);
}

// Función para actualizar la pestaña activa
function updateActiveTab() {
    const path = window.location.pathname;
    if (path.includes('dashboard')) {
        document.getElementById('galleryTab').classList.add('active');
        document.getElementById('favoritesTab').classList.remove('active');
    } else if (path.includes('favorites')) {
        document.getElementById('favoritesTab').classList.add('active');
        document.getElementById('galleryTab').classList.remove('active');
    }
}

// Actualizar la pestaña activa cuando se carga la página
window.onload = updateActiveTab;