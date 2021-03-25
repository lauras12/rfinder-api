const dataHelpers = require('./test-data');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            users,
            place,
            review,
            findText,
            findChecked
            RESTART IDENTITY CASCADE`
    )
}

//populating for unprotected endpoint
function seedRestaurantPlaces1(db, users, places, userPlaces, reviews, findText, findChecked) {
    return db
        .into('users')
        .insert(users)

        .then(() => {
            return db
                .into('place')
                .insert(places)
        })
        .then(() => {
            return db
                .into('userplace')
                .insert(userPlaces)
        })
        .then(() => {
            return db
                .into('review')
                .insert(reviews)
        })
        .then(() => {
            return db
                .into('findtext')
                .insert(findText)
        })
        .then(() => {
            return db
                .into('findchecked')
                .insert(findChecked)
                .then(() => {
                    console.log('db should be here');
                });
        });

}


function seedRestaurantPlaces2(db, users, places, reviews, userPlaces, findText, findChecked) {

    const verifiedUsers = users.map(user => {
        return ({
            ...user,
            password: bcrypt.hashSync(user.password, 1)
        })
    })

    return db
        .into('users')
        .insert(verifiedUsers)
        .then(() => {
            return db
                .into('place')
                .insert(places)
        })
        .then(() => {
            return db
                .into('userplace')
                .insert(userPlaces)
        })
        .then(() => {
            return db
                .into('review')
                .insert(reviews)
        })
        .then(() => {
            return db
                .into('findtext')
                .insert(findText)
        })
        .then(() => {
            return db
                .into('findchecked')
                .insert(findChecked)
                .then(() => {
                    console.log('db here?');
                });
        });

}




function makeExpectedPlaceReviews(db, user, place, userPlaces, reviews, checkedFinds, findsText) {

    let filteredByUser = reviews.filter(rev => rev.userid === user.id);
    let filteredByPlace = filteredByUser.filter(rev => rev.place_id === place.id);
    let filteredReview = filteredByPlace[0];

    let filteredFinds = checkedFinds.filter(e => e.review_id === filteredReview.id);
    let filteredFindsDescriptionText = filteredFinds.map(find => {
        let found = findsText.find(el => el.id === find.find);
        return found.description
    });

    const expectedPlace = {
        id: place.id,
        yelp_id: place.yelp_id,
        name: place.name,
        img_url: place.img_url,
        url: place.url,
        yelp_rating: Number(place.yelp_rating),
        location_str: place.location_str,
        location_city: place.location_city,
        location_zip: place.location_zip,
        location_st: place.location_st,
        display_phone: place.display_phone,
        userid: user.id,
        restaurant_reviews_count: place.restaurant_reviews_count,
        reviewed_place_id: place.id,
        review: [filteredReview.review,],
        category: [filteredReview.place_category,],
        checkedFinds: filteredFindsDescriptionText,
    };

    return expectedPlace;
}


function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256'
    })

    return `Bearer ${token}`
}

module.exports = {
    cleanTables,
    seedRestaurantPlaces1,
    seedRestaurantPlaces2,
    makeExpectedPlaceReviews,
    makeAuthHeader,
}