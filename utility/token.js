'use strict';

let jwt_token = require('jsonwebtoken')
    , config = require('../config/default.json');


module.exports = {
    // generate token
    generateToken: (user) => {
        return jwt_token.sign(user, config.jwtSecret, { expiresIn: config.tokenExpiresInMinutes * 60 });
    },

    //Authenticating JWT Token over request header
    userAuthenticated: (req, callback) => {
        let responseObj = {
            status: 401,
            message: "Authentication failed..!",
        }

        if (req.headers.authorization) {
            jwt_token.verify(req.headers.authorization, config.jwtSecret, function (err, token) {
                if (err && err.name == "TokenExpiredError") {
                    responseObj.message = "Token expired.";
                   return callback(responseObj)
                } else if (err) {
                    responseObj.message = err;
                    return  callback(responseObj)
                } else {
                    responseObj.status = 200;
                    responseObj.token = token;
                    responseObj.message = "success";
                    return callback(responseObj)
                }
            });
        } else {
            responseObj.message = 'Please provied token';
            return callback(responseObj);
        }
    }
}
