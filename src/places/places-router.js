const express = require('express');
const placesRouter = express.Router();
const jsonBodyParser = express.json();
const PlacesService = require('./places-service');
const ReviewsService = require('../reviews/reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');

placesRouter // gets all restaurant find reviewed places with full info
    .route('/api/')
    .all(async (req, res, next) => {
        try {
            res.placesReviewed = [];
            const knexInstance = req.app.get('db')
            const places = await PlacesService.getAllRestaurantPlaces(knexInstance);
            const reviewedPlacesIds = await PlacesService.getAllUserPlaces(knexInstance);
            //need to filter here so that client doesn't show places which reviews has been deleted/
            let filteredPlaces = [];
            places.filter(pl => {
                reviewedPlacesIds.filter(id => {
                    if (pl.id === id) {
                        filteredPlaces.push(pl)
                    };
                });
                return filteredPlaces;
            });
            
            for (let i = 0; i < filteredPlaces.length; i++) {
                const reviews = await ReviewsService.getAllReviews(knexInstance, filteredPlaces[i].id);
               
                if (reviews) {
                  
                    let reviewText = {};
                    let reviewDate = {};
                    let reviewCategory = {};
                    let reviewCheckedFinds = {}

                    reviews.forEach(rev => {
                        reviewText[rev.review] = true;
                        reviewDate[rev.date] = true;
                        reviewCategory[rev.place_category] = true;
                        reviewCheckedFinds[rev.description] = true;
                    });

                    const {
                        id, yelp_id, name, img_url, url, yelp_rating,
                        location_str, location_city, location_zip,
                        location_st, display_phone, restaurant_reviews_count
                    } = filteredPlaces[i];

                    res.placesReviewed.push({
                        id,
                        yelp_id,
                        name,
                        img: img_url,
                        url,
                        yelp_rating,
                        location_str,
                        location_city,
                        location_zip,
                        location_st,
                        display_phone,
                        restaurant_reviews_count: reviews.length,
                        review: Object.keys(reviewText),
                        reviewDate: Object.keys(reviewDate),
                        reviewCategory: Object.keys(reviewCategory),
                        checkedFinds: Object.keys(reviewCheckedFinds)
                    });
                };
                
            };
           
            next();
        } catch (err) {
    next(err);
}
    })
    .get((req, res, next) => {
    res.status(200).json(res.placesReviewed)
});


placesRouter
    //gets restaurant reviewed places by user with full info
    .route('/api/user/')
    .all(requireAuth)
    .all(async (req, res, next) => {

        try {
            const knexInstance = req.app.get('db');
            const user_id = Number(req.user.id);

            res.userPlacesReviewed = [];
            const userPlaces = await PlacesService.getAllRestaurantPlacesByUser(knexInstance, user_id);

            if (userPlaces.length > 0) {
                for (let i = 0; i < userPlaces.length; i++) {
                    const userReviews = await ReviewsService.getAllReviewsByUser(knexInstance, user_id, userPlaces[i].id)
                    console.log(userReviews, "REVIEWS wtf?")
                    if (userReviews) {

                        let reviewText = {};
                        let reviewDate = {};
                        let reviewCategory = {};
                        let reviewCheckedFinds = {}

                        userReviews.forEach(rev => {
                            reviewText[rev.review] = true;
                            reviewDate[rev.date] = true;
                            reviewCategory[rev.place_category] = true;
                            reviewCheckedFinds[rev.description] = true;
                        });

                        const {
                            id, yelp_id, name, img_url, url, yelp_rating,
                            location_str, location_city, location_zip,
                            location_st, display_phone, userid, restaurant_reviews_count,
                        } = userPlaces[i];

                        res.userPlacesReviewed.push({
                            id,
                            yelp_id,
                            name,
                            img: img_url,
                            url,
                            yelp_rating,
                            location_str,
                            location_city,
                            location_zip,
                            location_st,
                            display_phone,
                            userid,
                            restaurant_reviews_count,
                            review: Object.keys(reviewText),
                            reviewDate: Object.keys(reviewDate),
                            reviewCategory: Object.keys(reviewCategory),
                            checkedFinds: Object.keys(reviewCheckedFinds)
                        });

                        //console.log(res.userPlacesReviewed, 'HERE??????')
                    };
                };
            } else {
                return res.status(400).send({ error: { message: 'User has not reviewed any places' } })
            }
            next();
        } catch (err) {
            next(err);
        }
    })
    .get((req, res, next) => {
        res.status(200).json(res.userPlacesReviewed)
    });


placesRouter //gets by id reviewed place with full info
    .route('/api/place/:place_id')
    .all(requireAuth)
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        const user_id = req.user.id
        const place_id = req.params.place_id;

        PlacesService.getPlaceByUserAndId(knexInstance, user_id, place_id)
            .then(place => {
                if (!place) {
                    return res.status(404).json({ error: { message: `User with id ${user_id} did not review place with id ${place_id}` } })
                }
                res.place = place

                ReviewsService.getReviewByPlaceId(knexInstance, user_id, place_id)
                    .then(reviews => {
                        console.log(reviews, 'REVIEWS IN GET BYY ID')
                        if (reviews) {
                            let reviewText = {};
                            let reviewDate = {};
                            let reviewCheckedFinds = {}

                            reviews.forEach(rev => {
                                reviewText[rev.review] = true;
                                reviewDate[rev.date] = true;
                                reviewCheckedFinds[rev.description] = true;
                            });

                            res.fullReviewedPlace = {
                                ...res.place,
                                review: Object.keys(reviewText),
                                reviewDate: Object.keys(reviewDate),
                                checkedFinds: Object.keys(reviewCheckedFinds)
                            };
                        };
                        next()
                    })
                    .catch(next)
            })
            .catch(next)
    })
    .get((req, res, next) => {
        return res.status(200).json(res.fullReviewedPlace)
    });

// placesRouter
// .route('/api/:place_id/count')
// .get((req, res, next) => {
//     const knexInstance = req.app.get('db');
//     const yelp_id = req.params.place_id;
//     console.log(yelp_id, req.params.place_id, 'CHECKING FOR COUNT')
//     ReviewsService.getReviewCountPerPlace(yelp_id)
//     .then(places => {
//         console.log('///success???')
//     })
// })
module.exports = placesRouter;
