const PlacesService = {
    getAllRestaurantPlaces: (knex) => {
        return knex
            .from('place')
            .select('*')   
    },

    getAllRestaurantPlacesByUser: (knex, userId) => {
        return knex.from('place').select('*').where('userid', userId)
    },

    insertNewPlace: (knex, newPlace) =>{
        return knex.into('place').insert(newPlace).returning('*')
        .then(rows => {
            return rows[0]
        })
    }
}
module.exports = PlacesService;
