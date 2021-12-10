const mongoose = require('mongoose')

var Schema = mongoose.Schema;
let schema = new Schema({
    name: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    release_date: {
        type: String,
        required: true,
        default: ""
    },
    up_votes: {
        type: Number,
        required: true,
        default: 0
    },
    down_votes: {
        type: Number,
        required: true,
        default: 0
    },
    reviews: {
        type: String,
        required: true,
        default: ""
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    user_id: {
        type: String,
        required: true,
        default: ""   
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: true
    }
})

schema.statics = {
    moviesList: (f, o, p) => {
        let agg = [
            {
                $match: f
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    genre: 1,
                    release_date: 1,
                    up_votes: 1,
                    down_votes: 1,
                    reviews: 1
                }
            },
            {$sort: {_id: -1}}
        ]

        //TO get recent 3 appointments only
        if (p && p.up_votes && p.up_votes == true) {
            agg.push(
                { $sort: { up_votes: -1 } },
            )
        }
        if (p && p.down_votes && p.down_votes == true) {
            agg.push(
                { $sort: { down_votes: -1 } },
            )
        }
        if (p && p.release_date && p.release_date == true) {
            agg.push(
                { $sort: { release_date: -1 } },
            )
        }
        agg.push({
            $facet: {
                metadata: [{
                    $count: "total"
                }],
                data: [{
                    $skip: o.skip
                }, {
                    $limit: o.limit
                }]
            }
        })
        return agg;
    },
}

module.exports = mongoose.model("movies", schema, "movies")