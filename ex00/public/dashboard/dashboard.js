const accessToken = new URLSearchParams(window.location.search).get('access_token');
let favoritePhotos = JSON.parse(localStorage.getItem('favoritePhotos')) || [];
let currentSearchQuery = ''; // Variable global para almacenar la consulta actual

// Función para obtener fotos desde el servidor
async function fetchPhotos(query = '') {
    try {
        const url = query ? `/search?query=${encodeURIComponent(query)}&access_token=${accessToken}` : `/photos?access_token=${accessToken}`;
        const response = await fetch(url); // Cambiar a URL de búsqueda si hay consulta
        const photos = await response.json();
        displayPhotos(photos);
    } catch (error) {
        console.error('Error al obtener las fotos:', error);
    }
}

// Llama a la función fetchPhotos para cargar las fotos cuando se carga la página
window.onload = () => {
    fetchPhotos();
    updateActiveTab(); // Actualiza la pestaña activa al cargar la página
};

function displayPhotos(photos) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    if (photos.length === 0) {
        gallery.innerHTML = '<p>No photos were found.</p>';
        return;
    }

    photos.forEach(photo => {
        const isFavorite = favoritePhotos.includes(photo.id); // Verifica si está en favoritos
        const photoItem = document.createElement('div');
        photoItem.classList.add('photo-item');
        photoItem.innerHTML = `
                    <img src="${photo.urls.small}" alt="${photo.alt_description}">
                    <button class="favorite-btn" onclick="toggleFavorite('${photo.id}')">
                        ${isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    </button>
                `;
        gallery.appendChild(photoItem);
    });
}

function toggleFavorite(photoId) {
    if (favoritePhotos.includes(photoId)) {
        // Eliminar de favoritos
        favoritePhotos = favoritePhotos.filter(id => id !== photoId);
    } else {
        // Agregar a favoritos
        favoritePhotos.push(photoId);
    }
    // Actualizar localStorage
    localStorage.setItem('favoritePhotos', JSON.stringify(favoritePhotos));
    // Recargar las fotos basadas en la búsqueda actual
    fetchPhotos(currentSearchQuery);  // Pasamos la consulta actual
}

// Manejar la búsqueda
document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevenir que se recargue la página
    const query = document.getElementById('search-query').value.trim();
    if (query) {
        currentSearchQuery = query; // Guardar la consulta actual
        fetchPhotos(query); // Llamar a la función de búsqueda
    }
});

// Función para actualizar la pestaña activa
function updateActiveTab() {
    const path = window.location.pathname;
    if (path.includes('dashboard')) {
        document.getElementById('galleryTab').classList.add('active');
        document.getElementById('favoritesTab').classList.remove('active');
    } else {
        document.getElementById('favoritesTab').classList.add('active');
        document.getElementById('galleryTab').classList.remove('active');
    }
}