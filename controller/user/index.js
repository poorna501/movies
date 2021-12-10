'use strict'

const express = require('express'),
    router = express.Router(),
    users = require('../../lib/user')
    , { userAuthenticated } = require('../../utility/token');

// authenticate the user
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

// user Registration 
router.post('/signup', (req, res) => {
    users.signup(req.body, result => {
        res.json(result);
    })
})

// user login
router.post('/login', (req, res) => {
    users.login(req.body, result => {
        res.json(result);
    })
})

// set favourite genre
router.post('/favGenre', authenticator, (req, res) => {
    req.body.id = res.locals.token.id || "";
    users.favGenere(req.body, result => {
        res.json(result);
    })
})

// user fav genre movies list
router.post('/genreMoviesList', authenticator, (req, res) => {
    req.body.id = res.locals.token.id || "";
    users.genreMoviesList(req.body, result => {
        res.json(result);
    })
})

router.post('/genreMoviesList', authenticator, (req, res) => {
    req.body.id = res.locals.token.id || "";
    users.genreMoviesList(req.body, result => {
        res.json(result);
    })
})

router.post('/addReview', authenticator, (req, res) => {
    req.body.user_id = res.locals.token.id || "";
    users.addReview(req.body, result => {
        res.json(result);
    })
})

router.post('/voting', authenticator, (req, res) => {
    req.body.user_id = res.locals.token.id || "";
    users.voting(req.body, result => {
        res.json(result);
    })
})


module.exports = router;