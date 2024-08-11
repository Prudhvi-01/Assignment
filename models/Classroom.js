// models/Classroom.js
const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff', // Refers to the Staff model with role 'teacher'
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    timings: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Classroom', classroomSchema);
