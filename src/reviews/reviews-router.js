const express = require('express');
const reviewsRouter = express.Router();
const jsonBodyParser = express.json();
const PlacesService = require('../places/places-service');
const ReviewsService = require('../reviews/reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');
const validUrl = require('valid-url');

reviewsRouter
    //creates restaurant-reviewed place in db that consists of yelp-place-data recorded into 'place' table and review section recorded into 'review' and 'findChecked' tables
    .route('/api/:place_id/review')
    .all(requireAuth)
    .post(jsonBodyParser, async (req, res, next) => {
        try {
            const knexInstance = req.app.get('db');
            const user_id = req.user.id;

            //const yelpId = req.params.place_id;
            const { yelp_id, name, img, url, yelp_rating, location_str, location_city, location_zip, location_st, display_phone, restaurant_reviews_count, category, price, userid, review, checkedFinds } = req.body;
            for (const [key, value] of Object.entries(req.body)) {
                if (value === null) {
                    return res.status(400).send({ error: { message: `Missing ${key}` } });
                }
            }
            //checkedFinds is an array of numbers referring to ids of find text
            // need to save place first, then review so db assigns placeId and reviewId, then call db to get those ids and create findChecked obj with them
            let newRestaurantPlace = {
                yelp_id,
                name,
                img_url:img,
                url,
                yelp_rating,
                location_str,
                location_city,
                location_zip,
                location_st,
                display_phone,
                userid: user_id,
                category,
                restaurant_reviews_count,
            }

            let savedPlace = await PlacesService.insertNewPlace(knexInstance, newRestaurantPlace)

            let newReview = {
                userid: user_id,
                place_id: savedPlace.id,
                review,
            };
            let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview)


            checkedFinds.forEach(el => {
                let newCheckedFind = {
                    userid: user_id,
                    place_id: savedPlace.id,
                    review_id: savedReview.id,
                    find: el
                }
                ReviewsService.insertNewCheckedFind(knexInstance, newCheckedFind)
                    .then(newFind => {
                        console.log(newFind)
                    })

            })


            console.log({ newRestaurantPlace, newReview, checkedFinds }, "RETURNING TO CLIENT")
            console.log(req.originalUrl, `/${savedPlace.id}`)
            return res.json(201).json({ newRestaurantPlace, newReview, checkedFinds }).location(path.posix.join(req.originalUrl, `/${savedPlace.id}`))


        } catch (err) {
            next(err)
        }
    })


reviewsRouter //updating a reviewed place
    .route('/api/edit/:restaurant_place_id')
    .all(requireAuth)
    .all(jsonBodyParser, async (req, res, next) => {
        try {
            const knexInstance = req.app.get('db');
            const restaurant_place_id = Number(req.params.restaurant_place_id);
            const user_id = req.user.id;
            const { 
                yelp_id, name, img, url, yelp_rating, 
                location_str, location_city, location_zip, 
                location_st, display_phone, 
                restaurant_reviews_count, category, review, checkedFinds 
            } = req.body;

            // for (const [key, value] of Object.entries(req.body)) {
            //     if (value === null) {
            //         return res.status(400).send({ error: { message: `Missing ${key}` } });
            //     }
            // }

// in future should call proxy here to get place's info again in order to ensure that if the place's address or other info was not changed in yelp it gets updated in restaurant finds up as well.....
            let updatedPlaceInfo = {
                id: restaurant_place_id,
                yelp_id,
                name,
                img_url:img,
                url,
                yelp_rating,
                location_str,
                location_city,
                location_zip,
                location_st,
                display_phone,
                userid: user_id,
                restaurant_reviews_count,
                category,
            }

            const updatedReviewInfo = {
                userid: user_id,
                place_id: restaurant_place_id,
                date: new Date(),
                review,
            };
            
            const updatedPlace = await PlacesService.updateRestaurantPlace(knexInstance, user_id, restaurant_place_id, updatedPlaceInfo);
            const updatedReview = await ReviewsService.updateReview(knexInstance, user_id, restaurant_place_id, updatedReviewInfo);

            checkedFinds.forEach(el => {
                let updatedCheckedFindInfo = {
                    userid: user_id,
                    place_id: restaurant_place_id,
                    review_id: updatedReview.id,
                    find: el
                }
                ReviewsService.updateFindChecked(knexInstance, user_id, restaurant_place_id, updatedCheckedFindInfo)
                    .then(find => {
                        console.log(find, 'TNUMBSSSSSSSSSS')
                    });
            });

            return res.json(201).json({ updatedPlace, updatedReview, checkedFinds }).location(path.posix.join(req.originalUrl, `/${restaurant_place_id}`));

        } catch (err) {
            next(err);
        }
        next();
    });



reviewsRouter
    .route('/api/place/delete/:restaurant_place_id')
    .all(requireAuth)
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        const userId = req.user.id;
        const placeToRemove = Number(req.params.restaurant_place_id);
        console.log(userId, placeToRemove, req.user, 'IN DELETE')
        //how to determine that we cant delete a place if current user is not its author? => on front end
        PlacesService.deleteReviewedPlace(knexInstance, userId, placeToRemove)
            .then(() => {
                //delete the rest of info
                return ReviewsService.deleteReview(knexInstance, userId, placeToRemove)
            })
            .then(() => {
                console.log('DONE????')
                return res.status(204).send('reviewed place deleted')
            
            })
            .catch(next)
    })


module.exports = reviewsRouter;