const ReviewsService = {
    getAllReviews: (knex, placeId) => {
        return knex
            .from('review AS rev')
            .select(
                'rev.id',
                'rev.userid',
                'rev.place_id',
                'rev.review',
                'rev.date',
                'rev.place_category',
                'thc.find',
                'th.description'
            )
            .join(
                'findchecked AS thc',
                'rev.place_id',
                'thc.place_id'
            )
            .join(
                'findtext AS th',
                'thc.find',
                'th.id'
            )
            .where(
                { 'rev.place_id': placeId }
            )

    },

    getAllReviewsByUser: (knex, userId, placeId) => {
        return knex
            .from('review AS rev')
            .select(
                'rev.id',
                'rev.userid',
                'rev.place_id',
                'rev.review',
                'rev.date',
                'rev.place_category',
                'thc.find',
                'th.description'
            )
            .join(
                'findchecked AS thc',
                'rev.place_id',
                'thc.place_id'
            )
            .join(
                'findtext AS th',
                'thc.find',
                'th.id'
            )
            .where(
                {
                    'rev.userid': userId,
                    'rev.place_id': placeId,
                }
            )
    },

    getReviewByPlaceId: (knex, userId, placeId) => {
        return knex
            .from('review AS rev')
            .select(
                'rev.id',
                'rev.userid',
                'rev.place_id',
                'rev.review',
                'rev.date',
                'rev.place_category',
                'thc.find',
                'th.description'
            )
            .join(
                'findchecked AS thc',
                'rev.place_id',
                'thc.place_id'
            )
            .join(
                'findtext AS th',
                'thc.find',
                'th.id'
            )
            .where(
                {
                    'rev.userid': userId,
                    'rev.place_id': placeId,
                }
            )


    },
    getReviewCountPerPlace: (knex, yelp_id) => {
        return knex.from('review').select('*').where({yelp_id: yelp_id})
        .then(rows => {
            console.log(rows, 'REVIEWS FOR THIS PLACE??????')
            return rows;
        })
    },


    insertNewReview: (knex, newReview) => {
        return knex.into('review').insert(newReview).returning('*')
            .then(rows => {
                return rows[0];
            })
    },

    insertNewCheckedFind: (knex, newCheckedFind) => {
        return knex.into('findchecked').insert(newCheckedFind).returning('*')
            .then(rows => {
                return rows;
            })
    },

    updateReview: (knex, userId, placeId, updatedFields) => {
        console.log(updatedFields, 'HERE???>>>>>>>>>', userId, placeId)
        return knex('review').where({ userid: userId, place_id: placeId }).update(updatedFields).returning('*')
            .then(rows => {
                console.log(rows, "ROWS",rows[0],"AT 0" )
                return rows;
            })
    },

    updateFindChecked: (knex, userId, placeId, updatedList) => {
        return knex.into('findchecked').where({ userid: userId, place_id: placeId }).del()
            .then(() => {
                return knex.into('findchecked').insert(updatedList).returning('*')
            })
            .then(rows => {
                return rows;
        })//insert can insert one obj or an array /// dont nest THENS!
    },

    deleteReview: (knex, userId, placeToRemove) => {
        return knex.from('review').select('*').where({ userid: userId, place_id: placeToRemove }).del()
            .then((rows) => {
                console.log(rows, '???????.........222222222>>>>?????????')
            })
    },

    deleteCheckedFind: (knex, userId, placeToRemove) => {
        return knex.from('findchecked').select('*').where({ userid: userId, place_id: placeToRemove }).del()
            .then((rows) => {
                console.log(rows, '???????>>>>>>>?????????')
            })
    }

}
module.exports = ReviewsService;