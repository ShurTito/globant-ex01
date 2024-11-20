const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Ruta para redirigir al usuario a Unsplash para autenticación
app.get('/login', (req, res) => {
    const authorizationUrl = `https://unsplash.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=public`;
    res.redirect(authorizationUrl);
});
 
// Ruta de callback para recibir el código de autorización
app.get('/callback', async (req, res) => {
    const authorizationCode = req.query.code;

    try {
        const response = await axios.post('https://unsplash.com/oauth/token', {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            redirect_uri: process.env.REDIRECT_URI,
            code: authorizationCode,
            grant_type: 'authorization_code',
        });

        const accessToken = response.data.access_token;
        console.log('Token de acceso recibido:', accessToken);

        // Redirige al usuario a index.html con el token de acceso como parámetro
        res.redirect(`/index.html?access_token=${accessToken}`);

    } catch (error) {
        console.error('Error al obtener el token:', error.response ? error.response.data : error.message);
        res.status(500).send('Error al obtener el token');
    }
});

// Ruta para obtener las fotos desde Unsplash
app.get('/photos', async (req, res) => {
    const accessToken = req.query.access_token; // Obtener el token de acceso
    const query = req.query.query || ''; // Si hay consulta, la obtenemos, si no, es una búsqueda general
    const perPage = 30;  // Número de fotos por solicitud
    const page = req.query.page || 1; // Página por defecto es 1

    if (!accessToken) {
        return res.status(400).send('Token de acceso no disponible');
    }

    try {
        const url = query 
            ? `https://api.unsplash.com/search/photos?query=${query}&client_id=${process.env.CLIENT_ID}&page=${page}&per_page=${perPage}` // Búsqueda
            : `https://api.unsplash.com/photos?client_id=${process.env.CLIENT_ID}&page=${page}&per_page=${perPage}`; // Fotos generales
        
        const response = await axios.get(url);
        console.log(response.data);  // Verifica si se están obteniendo las fotos

        const photos = query ? response.data.results : response.data; // Si hay búsqueda, obtenemos 'results'

        res.json(photos); // Devuelve las fotos obtenidas
    } catch (error) {
        console.error('Error al obtener fotos:', error.response ? error.response.data : error.message);
        res.status(500).send('Error al obtener fotos');
    }
});

// Ruta para obtener fotos favoritas desde el almacenamiento
app.get('/favorite-photos', async (req, res) => {
    const favoritePhotoIds = JSON.parse(req.query.favoritePhotos || '[]');

    if (favoritePhotoIds.length === 0) {
        return res.json([]); // No hay fotos favoritas
    }

    try {
        // Hacer solicitudes a Unsplash para obtener las fotos por sus IDs
        const photoPromises = favoritePhotoIds.map(photoId =>
            axios.get(`https://api.unsplash.com/photos/${photoId}?client_id=${process.env.CLIENT_ID}`)
        );

        const photoResponses = await Promise.all(photoPromises);
        const photos = photoResponses.map(response => response.data);

        res.json(photos); // Devuelve las fotos favoritas
    } catch (error) {
        console.error('Error al obtener fotos favoritas:', error);
        res.status(500).send('Error al obtener fotos favoritas');
    }
});

app.get('/search', async (req, res) => {
    const query = req.query.query;  // Obtener la consulta
    const accessToken = req.query.access_token;  // Obtener el token de acceso

    if (!accessToken) {
        return res.status(400).send('Token de acceso no disponible');
    }

    try {
        const response = await axios.get(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${process.env.CLIENT_ID}`);
        const photos = response.data.results;
        res.json(photos); // Enviar las fotos al frontend
    } catch (error) {
        console.error('Error al buscar fotos:', error);
        res.status(500).send('Error al realizar la búsqueda');
    }
});

// Ruta para manejar el logout: eliminamos el token de acceso
app.get('/logout', (req, res) => {
    // Limpiamos la sesión del frontend, enviando al usuario a la página de inicio.
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Servidor en http://localhost:${port}`);
});
