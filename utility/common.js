'use strict';

const bcrypt = require('bcrypt-nodejs');

module.exports = {
    // to validate the password with bcrypt
    validatePassword: (password, upass, callback) => {
        bcrypt.compare(password, upass, function (err, res) {
            return callback(err, res)
        });
    },
    // generating a hash
    generateHash: (password) => {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
    }
}
