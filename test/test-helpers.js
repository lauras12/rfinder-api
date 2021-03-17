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
            findChecked,
            folder
            RESTART IDENTITY CASCADE`
    )
}

function seedRestaurantPlaces(db, users, places, reviews, findText, findChecked) {
    //console.log(db, 'DBBBBBBEEEE')
    return db
        .into('users')
        .insert(users)
        .then(() => {
            db.from('users').select('*')
             .then((users) => {
                 console.log(users, 'UEEEEEEE')
            //     return db
            //     .into('place')
            //     .insert(places)
            //     .then(() => {
            //         return db
            //             .into('review')
            //             .insert(reviews)
            //             .then(() => {
            //                 return db
            //                     .into('findText')
            //                     .insert(findText)
            //                     .then(() => {
            //                         return db
            //                             .into('findChecked')
            //                             .insert(findChecked)
            //                             .then(() => {
            //                                  console.log('populated db')
            //                             })
            //                     })
            //             })
            //     })
             })
            
        })
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));
    return db
        .into('users')
        .insert(preppedUsers)
        .then(() => {
            console.log('users populated')
        })
}

function makeExpectedPlace(users, places, reviews, findText, findChecked) {
    let restaurantPlacesList = [];
    for (let i = 0; i < places.length; i++) {
       
        let filteredReviews = reviews.filter(rev => rev.place_Id === places[i].id)
       
        console.log(filteredReviews, 'Final???????')
        let reviewText = {};
        let reviewDate = {};
        let reviewCheckedFinds = {}

        finalFilteredReviews.forEach(rev => {
            // reviewText[rev.review] = true;
            // reviewDate[rev.date] = true;
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
            displayphone: places[i].phone,
            userId: places[i].userId,
            folderId: places[i].folderId,
            restaurant_reviews_count: places[i].restaurant_reviews_count,
            review: filteredReviews.map(rev => rev.review),
            reviewDate:filteredReviews.map(rev => rev.date),
            checkedfinds: Object.keys(reviewCheckedFinds)
        })
    }
    console.log(restaurantPlacesList)
    return restaurantPlacesList;

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
    seedRestaurantPlaces,
    seedUsers,
    makeExpectedPlace,
    makeAuthHeader,
    
}
