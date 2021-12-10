'use strict'

const mongoose = require('mongoose')
    , async = require('async')
    , config = require('../../config/default.json')
    , moment = require('moment');

module.exports = {

    add: (args, callback) => {
        if (args.up_votes && args.up_votes < 0 && args.down_votes && args.down_votes < 0) {
            return callback({
                status: 500,
                message: "please enter valid votes number (should be grater then 0)"
            })
        }
        let movie_data = null;
        let checkMovie =  n => {
            let match = { "$regex" : "^"+args.name+"$" , "$options" : "i"};
            mongoose.models['movies'].findOne({ name: match }, (err, docs) => {
                if (err) {
                    responseObj.message = err;
                    return n(err);
                } else if (docs) {
                    return callback({
                        status: 200,
                        message: "Movie already exists"
                    });
                } else if (!docs) {
                    return n();
                } else {
                    return n("Something went wrong");
                }
            })
        }

        let addMovie = n => {
            let relase_date = moment(args.release_date, 'YYYY-MM-DD', true);
            if (relase_date.isValid() == false) {
                let respData = {
                    status: 1001,
                    message: 'please enter vallid release_date',
                }
                return callback(respData);
            }
    
            let movieObj = {
                "name": args.name,
                "genre": args.genre,
                "release_date": args.release_date,
                "up_votes": args.up_votes,
                "down_votes": args.down_votes,
                "reviews": args.reviews,
                "user_id": args.user_id
            }
            mongoose.models['movies'](movieObj).save((err, res) => {
                if (!err && res) {
                    movie_data = res;
                   return n();
                } else {
                    callback({
                        status: 500,
                        message: err ? err.message : "Something went wrong"
                    })
                }
            })
        }

        async.series([
            checkMovie,
            addMovie,
        ], (err, result) => {
            if (err) {
                return callback({
                    status: 500,
                    message: err
                })
            } else {
                return callback({
                    status: 200,
                    message: "movie added successfully.",
                    data: movie_data
                })
            }
        })
    },

    list: (args, callback) => {
        let limit = parseInt(args.limit),
        skip = limit * (parseInt(args.page) - 1)
    let responseObj = {
        status: 500,
        message: 'error'
    }
    let filter = {
        active: true
    };
    let option = {
        limit: limit,
        skip: skip
    };
    let params = args.filter || {};
    let agg = mongoose.models["movies"]["moviesList"](filter, option, params);
    mongoose.models['movies'].aggregate(agg).exec((err, docs) => {
        if (err) {
            responseObj.message = err;
            return callback(responseObj);
        } else if (docs && docs[0] && docs[0].data && docs[0].data.length) {
            let dataObj = docs[0];
            if (dataObj.metadata.length > 0) {
                dataObj['metadata'][0]['page'] = args.page;
                dataObj['metadata'][0]['limit'] = args.limit;
                dataObj['metadata'][0]['total_pages'] = Math.ceil(dataObj['metadata'][0]['total'] / args.limit)
            }
            responseObj.status = 200;
            responseObj.data = dataObj;
            responseObj.message = "Data available.";
            return callback(responseObj);
        } else if (!docs || (docs[0] && !docs[0].data)) {
            responseObj.status = 200;
            responseObj.data = { metadata: [], data: [] };
            responseObj.message = "No movie available";
            return callback(responseObj);
        } else {
            responseObj.message = "No movie available";
            return callback(responseObj);
        }
    })
    },

    details: (args, callback) => {
        let project = {
            __v: 0,
            user_name: 0,
            createdAt: 0,
            updatedAt: 0
        }
        mongoose.models['movies'].findOne({ _id:  args.id}, project, (err, docs) => {
            if (!err && docs) {
                return callback({
                    status: 200,
                    message: "success",
                    data: docs
                });
            } else if (!docs) { 
                return callback({
                    status: 200,
                    message: "empty list",
                    data: {}
                });
            } else {
                return callback({
                    status: 500,
                    message: err
                });
            }
        }) 
    }
}