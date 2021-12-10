'use strict'

const mongoose = require('mongoose')
    , async = require('async')
    , config = require('../../config/default.json')
    , { validatePassword } = require('../../utility/common')
    , { generateHash } = require('../../utility/common')
    , { generateToken } = require('../../utility/token');

//     var mongo = require('mongodb');
// var o_id = new mongo.ObjectID(theidID);
// collection.update({'_id': o_id});


module.exports = {
    signup: (args, callback) => {
        let responseObj = {
            status: 500,
            message: 'error'
        }

        let userData = null;
        let checkUser = (n) => {
            mongoose.models['users'].findOne({ name: args.name }, (err, docs) => {
                if (err) {
                    responseObj.message = err;
                    return callback(responseObj);
                } else if (docs) {
                    responseObj.status = 200;
                    responseObj.message = "The user is already registered. Please login to continue.";
                    return callback(responseObj);
                } else if (!docs) {
                    return n();
                } else {
                    return n("Something went wrong");
                }
            })
        }

        let saveUser = (n) => {
            args.password = generateHash(args.password);
            let userObj = {
                name: args.name,
                password: args.password,
            }
            mongoose.models['users'](userObj).save((err, res) => {
                if (!err && res) {
                    userData = res;
                    return n();
                } else {
                    callback({
                        status: 500,
                        message: err ? err.message : "Something went wrong"
                    })
                }
            })
        }

        let jwtToken = null;
        let generateUserToken = (n) => {
            if (userData) {
                let tokenObj = {
                    name: userData.name,
                    id: userData._id,
                    randomString: config.randomStringKey
                }
                jwtToken = generateToken(tokenObj);
                return n();
            } else return n("User authentication failed!");
        }

        async.series([
            checkUser,
            saveUser,
            generateUserToken
        ], (err, result) => {
            if (err) {
                return callback({
                    status: 500,
                    message: err
                })
            } else {
                return callback({
                    status: 200,
                    message: "success",
                    data: {
                        name : userData.name,
                        token: jwtToken
                    }
                })
            }
        })
    },

    login: (args, callback) => {
        let responseObj = {
            status: 500,
            message: 'error'
        }

        let userData = null;
        let checkUser = (n) => {
            mongoose.models['users'].findOne({ name: args.name }, (err, docs) => {
                if (err) {
                    responseObj.message = err;
                    return callback(responseObj);
                } else if (docs) {
                    userData = docs;
                    return n();
                } else if (!docs) {
                    responseObj.status = 200;
                    responseObj.message = "No user available";
                    return callback(responseObj);
                } else {
                    return n("Something went wrong");
                }
            })
        }

        let userAuthenticated = false;
        let validateUserPassword = (n) => {
            if (userData) {
                validatePassword(args.password, userData.password, function (err, validRes) {
                    if (validRes) {
                        userAuthenticated = true;
                        return n();
                    } else {
                        return n("Password didn't matched.");
                    }
                })
            } else return n("No user available.");
        }

        let jwtToken = null;
        let generateUserToken = (n) => {
            if (userAuthenticated) {
                let tokenObj = {
                    id: userData._id,
                    name: userData.name,
                    randomString: config.randomStringKey
                }
                jwtToken = generateToken(tokenObj);
                return n();
            } else return n("User authentication failed!");
        }

        async.series([
            checkUser,
            validateUserPassword,
            generateUserToken
        ], (err, result) => {
            if (err) {
                return callback({
                    status: 500,
                    message: err
                })
            } else {
                return callback({
                    status: 200,
                    token: jwtToken
                })
            }
        })
    },

    favGenere: (args, callback) => {
        mongoose.models['users'].findOneAndUpdate({ _id: args.id }, { $set: { fav_genre: args. fav_genre} }, (err, docs) => {
            if (!err && docs) {
                return callback({
                    status: 200,
                    message: "Successfully added fav genre"
                });
            } else {
                return callback({
                    status: 500,
                    message: err
                });
            }
        });
    },

    genreMoviesList: (args, callback) => {
        let fav_genre = [];
        let m_list = [];
        let checkUser = (n) => {
            mongoose.models['users'].findOne({ _id: args.id }, { fav_genre: 1 }, (err, docs) => {
                if (!err && docs) {
                    fav_genre = docs.fav_genre || [];
                    return n();
                } else {
                    return callback({
                        status: 500,
                        message: err
                    });
                }
            })
        }

        let moviesList = n => {
            if (fav_genre && fav_genre.length > 0) {
                let project = {
                    __v: 0,
                    user_name: 0,
                    createdAt: 0,
                    updatedAt: 0
                }
                mongoose.models['movies'].find({ "genre": {$in: fav_genre} } , project, (err, docs) => {
                    if (!err && docs) {
                        m_list = docs;
                        return n();
                    } else {
                        return callback({
                            status: 500,
                            message: err
                        });
                    }
                });
            } else {
                return n();
                return callback({
                    status: 200,
                    message: "fav genre list is empty",
                    data: []
                });
            }
        }


        

        async.series([
            checkUser,
            moviesList,
        ], (err, result) => {
            if (err) {
                return callback({
                    status: 500,
                    message: err
                })
            } else {
                let msg = "fav genre list is empty";
                if (m_list && m_list.length > 0) {
                    msg = "Success";
                }
                return callback({
                    status: 200,
                    message: "Success",
                    data: m_list
                })
            }
        })
    },
    
    addReview: (args, callback) => {
        let reqObj = {
            _id: args.id,
            user_id: args.user_id
        }

        mongoose.models['movies'].findOneAndUpdate(reqObj, { $set: { reviews: args. reviews} }, (err, docs) => {
            if (!err && docs) {
                return callback({
                    status: 200,
                    message: "Successfulyy added review."
                });
            } else {
                return callback({
                    status: 500,
                    message: err
                });
            }
        });
    },

    voting: (args, callback) => {
        if (args.voting && args.voting < 0) {
            return callback({
                status: 500,
                message: "please enter valid voting"
            })
        }
        let reqObj = {
            _id: args.id,
            user_id: args.user_id
        }
        let parms = {
            down_votes: args.voting
        }
        if (args.up && args.up == true) {
            parms = {
                up_votes: args.voting
            }
        }

        mongoose.models['movies'].findOneAndUpdate(reqObj, { $set: parms }, (err, docs) => {
            if (!err && docs) {
                return callback({
                    status: 200,
                    message: "Successfully added Voting."
                });
            } else {
                return callback({
                    status: 500,
                    message: err
                });
            }
        });
    }
    
}