const accessToken = new URLSearchParams(window.location.search).get('access_token');
let favoritePhotos = JSON.parse(localStorage.getItem('favoritePhotos')) || [];
let currentSearchQuery = ''; // Variable global para almacenar la consulta actual

// Función para verificar si el usuario ya está autenticado
function checkAuthentication() {
    if (accessToken) {
        // Si hay token en la URL, guardamos el token en localStorage
        localStorage.setItem('accessToken', accessToken);
    }

    const token = localStorage.getItem('accessToken');

    // Si hay un token en el localStorage, mostramos el dashboard
    if (token) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        //fetchPhotos(); // Cargar las fotos cuando estemos autenticados
    } else {
        // Si no hay token, mostramos la pantalla de login
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
    }
}

// Función para obtener fotos desde el servidor
async function fetchPhotos(query = '') {
    try {
        const url = query ? `/search?query=${encodeURIComponent(query)}&access_token=${localStorage.getItem('accessToken')}` : `/photos?access_token=${localStorage.getItem('accessToken')}`;
        const response = await fetch(url); // Cambiar a URL de búsqueda si hay consulta
        const photos = await response.json();
        displayPhotos(photos);
    } catch (error) {
        console.error('Error al obtener las fotos:', error);
    }
}

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
    // Recargar las fotos basadas en la pestaña activa
    const activeTab = document.querySelector('.tab.active').id;
    if (activeTab === 'favoritesTab') {
        displayFavoritePhotos();
    } else {
        fetchPhotos(currentSearchQuery);  // Pasamos la consulta actual
    }
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

// Función para mostrar las fotos favoritas
function displayFavoritePhotos() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Limpiar la galería antes de mostrar las fotos favoritas

    if (favoritePhotos.length === 0) {
        gallery.innerHTML = '<p>No favorite photos yet.</p>';
        return;
    }

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

// Función para actualizar la pestaña activa
function updateActiveTab(tab) {
    const searchBar = document.getElementById('search-bar');
    const gallery = document.getElementById('gallery');

    if (tab === 'favorites') {
        document.getElementById('favoritesTab').classList.add('active');
        document.getElementById('galleryTab').classList.remove('active');
        searchBar.style.display = 'none';
        gallery.innerHTML = '';  // Limpiar la galería antes de mostrar las fotos favoritas
    } else {
        document.getElementById('galleryTab').classList.add('active');
        document.getElementById('favoritesTab').classList.remove('active');
        searchBar.style.display = 'flex';
        gallery.innerHTML = '';  // Limpiar la galería antes de buscar nuevas fotos
    }
}

// Event listeners para las pestañas
document.getElementById('favoritesTab').addEventListener('click', function() {
    document.getElementById('favoritesTab').style.display = 'none';
    document.getElementById('galleryTab').style.display = 'block';
    displayFavoritePhotos();
    updateActiveTab('favorites');
});

document.getElementById('galleryTab').addEventListener('click', function() {
    document.getElementById('favoritesTab').style.display = 'block';
    document.getElementById('galleryTab').style.display = 'none';
    updateActiveTab('gallery');
    fetchPhotos(currentSearchQuery);  // Pasamos la consulta actual
});

// Event listeners para login y logout
document.getElementById('logout-button').addEventListener('click', function() {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    // Eliminar el token de acceso de localStorage
    localStorage.removeItem('accessToken');
    
    // Redirigir al usuario de vuelta al inicio (esto también puede hacerlo el servidor si lo prefieres)
    window.location.href = '/';
});

document.getElementById('login-button').addEventListener('click', function() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    window.location.href = '/login';
});

checkAuthentication();
