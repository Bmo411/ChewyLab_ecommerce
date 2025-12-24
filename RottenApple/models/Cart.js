const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    items: [
        {
            productUuid: {
                type: String,
                required: true
            },
            title: String,
            price: Number,
            image: String,
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            size: {
                type: String,
                default: 'M'
            }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);
