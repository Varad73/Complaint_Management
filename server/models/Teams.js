const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dept: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    }
})

module.exports = mongoose.model('Team', teamSchema);