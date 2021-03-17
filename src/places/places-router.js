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
    .all(async (req, res, next) => {
        try {

            const knexInstance = req.app.get('db');
            const user_id = req.user.id
            const place_id = Number(req.params.place_id);

            let foundPlace = await PlacesService.getPlaceByUserAndId(knexInstance, user_id, place_id)
            if (!foundPlace) {
                return res.status(400).json({ error: { message: `User with id ${user_id} did not review place with id ${place_id}` } });
            }
            
            res.place = foundPlace;

            let foundReviews = await ReviewsService.getReviewByPlaceId(knexInstance, user_id, place_id);
            
            if (foundReviews) {
                let reviewText = {};
                let reviewCheckedFinds = {};
                let reviewCategory = {};

                foundReviews.forEach(rev => {
                    reviewText[rev.review] = true;
                    reviewCheckedFinds[rev.description] = true;
                    reviewCategory[rev.place_category] = true;
                });
                res.fullReviewedPlace = {
                    ...res.place,
                    review: Object.keys(reviewText),
                    checkedFinds: Object.keys(reviewCheckedFinds),
                    category: Object.keys(reviewCategory),
                };
            };
            next();

        } catch (err) {
            next(err);
        }
    })

    .get((req, res, next) => {
        return res.status(200).json(res.fullReviewedPlace);
    });


module.exports = placesRouter;