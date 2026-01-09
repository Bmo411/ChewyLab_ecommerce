const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Models
const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// --- PRODUCTS API ---

router.get('/products', async (req, res) => {
    try {
        const { nombre, categoria, precio } = req.query;
        let query = {};

        if (nombre) query.title = { $regex: nombre, $options: 'i' };
        if (categoria) query.category = { $regex: new RegExp(`^${categoria}$`, 'i') };
        if (precio) query.price = precio;

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({
            $or: [{ uuid: req.params.id }, { title: { $regex: new RegExp(`^${req.params.id}$`, 'i') } }]
        });
        if (product) res.json(product);
        else res.status(404).json({ message: "Producto no encontrado" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/products', async (req, res) => {
    try {
        const { adminEmail, nombre, descripcion, precio, categoria, stock, image } = req.body;

        // VERIFICACIÓN DE SEGURIDAD
        const adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: "No tienes permiso para crear productos." });
        }

        const newProduct = new Product({
            uuid: crypto.randomUUID(),
            title: nombre,
            description: descripcion,
            price: parseFloat(precio),
            category: categoria,
            stock: parseInt(stock),
            image: image || "../Media/placeholder.png",
            oldPrice: null,
            isNew: true
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- USERS & AUTH API ---

// Login Endpoint
// POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        // Generar JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            'secret_key', // Use env var in production
            { expiresIn: '1h' }
        );

        // Guardar token en usuario
        user.token = token;
        await user.save();

        res.json({
            message: "Login exitoso",
            token: token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario creado", user: { name, email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- CART API (POR USUARIO) ---

// GET Carrito de usuario específico
router.get('/cart/:userId', async (req, res) => {
    try {
        const userId = req.params.userId; // El userId será el email
        const cart = await Cart.findOne({ email: userId });
        res.json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST Agregar al carrito de usuario
router.post('/cart/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productUuid, quantity, size } = req.body;

        const product = await Product.findOne({ uuid: productUuid });
        if (!product) return res.status(404).json({ message: "Producto no existe" });

        let cart = await Cart.findOne({ email: userId });

        if (!cart) {
            cart = new Cart({ email: userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.productUuid === productUuid && item.size === size);

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.items.push({
                productUuid: product.uuid,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: parseInt(quantity),
                size: size || 'M'
            });
        }

        await cart.save();
        res.json(cart.items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT Actualizar cantidad
router.put('/cart/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productUuid, size, quantity } = req.body;

        const cart = await Cart.findOne({ email: userId });
        if (!cart) return res.status(404).json({ message: "Carrito vacío" });

        const item = cart.items.find(i => i.productUuid === productUuid && i.size === size);

        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                // Eliminar si es 0
                cart.items = cart.items.filter(i => i !== item);
            }
            await cart.save();
            res.json(cart.items);
        } else {
            res.status(404).json({ message: "Item no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE Eliminar item
router.delete('/cart/:userId/:productUuid/:size', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { productUuid, size } = req.params;

        const cart = await Cart.findOne({ email: userId });
        if (cart) {
            cart.items = cart.items.filter(item => !(item.productUuid === productUuid && item.size === size));
            await cart.save();
            res.json(cart.items);
        } else {
            res.json([]);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;