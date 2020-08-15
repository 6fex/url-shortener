const mongoose = require('mongoose');
const shortid = require('shortid');

const tinyUrlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: String,
        required: true,
        default: shortid.generate
    }
}) 

module.exports = mongoose.model('TinyUrl', tinyUrlSchema);

