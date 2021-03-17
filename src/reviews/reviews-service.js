const ReviewsService = {
    getAllReviews: (knex, placeId) => {
        return knex
            .from('review AS rev')
            .select(
                'rev.id',
                'rev.userid',
                'rev.placeid',
                'rev.review',
                'rev.date',
                'thc.find',
                'th.description'
            )
            .join(
                'findchecked AS thc',
                'rev.placeid',
                'thc.placeid'
            )
            .join(
                'findtext AS th',
                'thc.find',
                'th.id'
            )
            .where(
                { 'rev.placeid': placeId }
            )

    },

    getAllReviewsByUser: (knex, userId, placeId) => {
        return knex
            .from('review AS rev')
            .select(
                'rev.id',
                'rev.userid',
                'rev.placeid',
                'rev.review',
                'rev.date',
                'thc.find',
                'th.description'
            )
            .join(
                'findchecked AS thc',
                'rev.placeid',
                'thc.placeid'
            )
            .join(
                'findtext AS th',
                'thc.find',
                'th.id'
            )
            .where(
                {
                    'rev.userid': userId,
                    'rev.placeid': placeId,
                }
            )
    },

    getReviewByPlaceId: (knex, userId, placeId) => {
        return knex
            .from('review AS rev')
            .select(
                'rev.id',
                'rev.userid',
                'rev.placeid',
                'rev.review',
                'rev.date',
                'thc.find',
                'th.description'
            )
            .join(
                'findchecked AS thc',
                'rev.placeid',
                'thc.placeid'
            )
            .join(
                'findtext AS th',
                'thc.find',
                'th.id'
            )
            .where(
                {
                    'rev.userid': userId,
                    'rev.placeid': placeId,
                }
            )


    },

    insertNewReview: (knex, newReview) => {
        return knex.into('review').insert(newReview).returning('*')
            .then(rows => {
                console.log(rows, 'ROWS')
                return rows[0];
            })
    },

    insertNewCheckedFind: (knex, newCheckedFind) => {
        return knex.into('findchecked').insert(newCheckedFind).returning('*')
            .then(rows => {
                return rows[0];
            })
    },

    updateReview: (knex, userId, placeId, updatedFields) => {
        //console.log(updatedFields, 'HERE???>>>>>>>>>')
        return knex('review').where({ userid: userId, placeid: placeId }).update(updatedFields).returning('*')
            .then(rows => {
                return rows[0];
            })
    },

    updateFindChecked: (knex, userId, placeId, updatedList) => {
        return knex.into('findchecked').where({ userid: userId, placeid: placeId }).del()
            .then(() => {
                return knex.into('findchecked').insert(updatedList).returning('*')
            })
            .then(rows => {
                return rows;
        })//insert can insert one obj or an array /// dont nest THENS!
    },

    deleteReview: (knex, userId, placeToRemove) => {
        return knex.from('review').select('*').where({ userid: userId, placeid: placeToRemove }).del()
            .then((rows) => {
                console.log(rows, '???????.........222222222>>>>?????????')
            })
    },

    deleteCheckedFind: (knex, userId, placeToRemove) => {
        return knex.from('findchecked').select('*').where({ userid: userId, placeid: placeToRemove }).del()
            .then((rows) => {
                console.log(rows, '???????>>>>>>>?????????')
            })
    }

}
module.exports = ReviewsService;
