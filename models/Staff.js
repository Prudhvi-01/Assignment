// models/Staff.js
const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['principal', 'teacher'],
        required: true
    },
    password:
    {
        type:String,
        required:true,
    }
});

module.exports = mongoose.model('Staff', staffSchema);
