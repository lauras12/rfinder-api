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

    insertNewReview: (knex, newReview) => {
        return knex.into('review').insert(newReview).returning('*')
        .then(rows =>{
            console.log(rows, 'ROWS')
            return rows[0];
        })
    },

    insertNewCheckedFind: (knex, newCheckedFind) => {
        return knex.into('findchecked').insert(newCheckedFind).returning('*')
        .then(rows => {
            console.log(rows)
            return rows[0];
        })
    }

}
module.exports = ReviewsService;
