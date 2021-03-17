const dataHelpers = require('./test-data');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            users,
            place
            RESTART IDENTITY CASCADE`
    )
}

function seedRestaurantPlaces(db, users, places, reviews, findText, findChecked) {
    return db
        .into('users')
        .insert(users)
        .then(() => {
            db
                .into('place')
                .insert(places)
                .then(() => {
                    db
                        .into('review')
                        .insert(reviews)
                        .then(() => {
                            db
                                .into('findText')
                                .insert(findText)
                                .then(() => {
                                    db
                                        .into('findChecked')
                                        .insert(findChecked)
                                        .then(() => {

                                        })
                                })
                        })
                })
        })
}

function makeExpectedPlace(users, places, reviews, findText, findChecked) {
    let restaurantPlacesList = [];
    for (let i = 0; i < places.length; i++) {

        let filteredReviews = reviews.filter(rev => rev.placeId === places[i].id)

        let finalFilteredReviews = [...filteredReviews]
        console.log(filteredReviews, 'Final???????')
        let reviewText = {};
        let reviewDate = {};
        let reviewCheckedFinds = {}

        finalFilteredReviews.forEach(rev => {
            reviewText[rev.review] = true;
            reviewDate[rev.date] = true;
            reviewCheckedFinds[rev.description] = true;
        });

        restaurantPlacesList.push({
            id: places[i].id,
            yelpId: places[i].yelpid,
            name: places[i].name,
            img: places[i].img,
            url: places[i].url,
            yelpRating: places[i].yelpRating,
            location_str: places[i].location_str,
            location_city: places[i].location_city,
            location_zip: places[i].location_zip,
            location_st: places[i].location_st,
            phone: places[i].phone,
            displayPhone: places[i].phone,
            userId: places[i].userId,
            folderId: places[i].folderId,
            restaurant_reviews_count: places[i].restaurant_reviews_count,
            review: Object.keys(reviewText),
            reviewDate: Object.keys(reviewDate),
            checkedFinds: Object.keys(reviewCheckedFinds)
        })
    }
    console.log(restaurantPlacesList)
    return restaurantPlacesList;

}

module.exports = {
    cleanTables,
    seedRestaurantPlaces,
    makeExpectedPlace,
} 