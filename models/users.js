const mongoose = require('mongoose')

var Schema = mongoose.Schema;
let schema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    fav_genre: {
        type: Array,
        default: []
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true
    }
})

schema.statics = {
}

module.exports = mongoose.model("users", schema, "users")