'use strict'

const express = require('express')
    , router = express.Router()
    , movie = require('../../lib/movie')
    , { userAuthenticated } = require('../../utility/token');

function authenticator(req, res, next) {
    userAuthenticated(req, authRes => {
        if (authRes && authRes.token) {
            res.locals.token = authRes.token;
            next();
        } else {
            res.send(authRes);
        }
    })
}

router.post('/add', authenticator, (req, res) => {
    req.body.user_id = res.locals.token.id || "";
    movie.add(req.body, result => {
        res.json(result);
    })
})

router.post('/list', (req, res) => {
    movie.list(req.body, result => {
        res.json(result);
    })
})

router.post('/details', authenticator, (req, res) => {
    movie.details(req.body, result => {
        res.json(result);
    })
})

module.exports = router;