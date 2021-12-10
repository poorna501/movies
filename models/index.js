'use strict'

// Initialize models to mongoose when application starts
const users = require('./users');
const movies = require('./movies');


module.exports = {
    users,
    movies
}
