const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Servir tus archivos estáticos (HTML, CSS, Imágenes)
app.use(express.static(path.join(__dirname, 'public')));

// 2. Rutas de la API (Backend)
app.use('/api', apiRoutes);

// 3. Rutas para navegar (Opcional, si quieres URLs limpias)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/mainpage.html')));
app.get('/collections', (req, res) => res.sendFile(path.join(__dirname, 'public/colections.html')));
app.get('/product', (req, res) => res.sendFile(path.join(__dirname, 'public/product.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'public/shoppingcart.html')));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`💀 Rotten Apple System Online: http://localhost:${PORT}`);
});