const express = require('express');
const placesRouter = express.Router();
const jsonBodyParser = express.json();
const PlacesService = require('./places-service');
const ReviewsService = require('../reviews/reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');

placesRouter // gets all restaurant reviewed places with full info
    .route('/api/')
    .all(async (req, res, next) => {
        try {
            res.placesReviewed = [];
            const knexInstance = req.app.get('db')
            const places = await PlacesService.getAllRestaurantPlaces(knexInstance);

            for (let i = 0; i < places.length; i++) {
                const reviews = await ReviewsService.getAllReviews(knexInstance, places[i].id);
                if (reviews) {
                    let reviewText = {};
                    let reviewDate = {};
                    let reviewCheckedFinds = {}

                    reviews.forEach(rev => {
                        reviewText[rev.review] = true;
                        reviewDate[rev.date] = true;
                        reviewCheckedFinds[rev.description] = true;
                    });

                    const { 
                        id, yelpid, name, img_url, url, yelprating,
                        location_str, location_city, location_zip, 
                        location_st, phone, displayPhone, userId, 
                        folderId, restaurantReviewsCount 
                    } = places[i];

                    res.placesReviewed.push({
                        id,
                        yelpId: yelpid,
                        name, 
                        img: img_url,
                        url,
                        location_str,
                        location_city,
                        location_zip,
                        location_st,
                        phone,
                        displayPhone,
                        userId,
                        folderId,
                        restaurantReviewsCount,
                        review: Object.keys(reviewText),
                        reviewDate: Object.keys(reviewDate),
                        checkedFinds: Object.keys(reviewCheckedFinds)
                    });
                }
            }
            next();
        } catch (err) {
            next(err);
        }
    })
    .get((req, res, next) => {
        console.log(res.placesReviewed, 'HERERER')
        res.status(200).json(res.placesReviewed)
    });

    placesRouter
    //gets restaurant reviewd places by user with full info
    .route('/api/:user_id')
    .all(requireAuth)
    .all(async (req, res, next) => {
        console.log('kk')
        try {
            const knexInstance = req.app.get('db');
            const user_id = Number(req.params.user_id);
            res.userPlacesReviewed = [];
            const userPlaces = await PlacesService.getAllRestaurantPlacesByUser(knexInstance, user_id)

            if (!userPlaces) {
                return res.status(400).send({ error: { message: 'User has not reviewed any places' } })
            }

            for (let i = 0; i < userPlaces.length; i++) {
                const userReviews = await ReviewsService.getAllReviewsByUser(knexInstance, user_id, userPlaces[i].id)
                if (userReviews) {
                    let reviewText = {};
                    let reviewDate = {};
                    let reviewCheckedFinds = {}

                    userReviews.forEach(rev => {
                        reviewText[rev.review] = true;
                        reviewDate[rev.date] = true;
                        reviewCheckedFinds[rev.description] = true;
                    });

                    const {
                        id, yelpid, name, img_url, url, yelprating,
                        location_str, location_city, location_zip,
                        location_st, phone, displayPhone, userId,
                        folderId, restaurantReviewsCount
                    } = userPlaces[i];

                    res.userPlacesReviewed.push({
                        id,
                        yelpId: yelpid,
                        name,
                        img: img_url,
                        url,
                        yelprating,
                        location_str,
                        location_city,
                        location_zip,
                        location_st,
                        phone,
                        displayPhone,
                        userId,
                        folderId,
                        restaurantReviewsCount,
                        review: Object.keys(reviewText),
                        reviewDate: Object.keys(reviewDate),
                        checkedFinds: Object.keys(reviewCheckedFinds)
                    });

                    console.log(res.userPlacesReviewed, 'here?')
                }
            }
            next();
        } catch (err) {
            next(err);
        }
    })

    .get((req, res, next) => {
        console.log(res.userPlacesReviewed, 'here!')
        res.status(200).json(res.userPlacesReviewed)
    })
module.exports = placesRouter;