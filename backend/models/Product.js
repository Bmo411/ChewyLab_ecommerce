const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    isNew: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Product', productSchema);
