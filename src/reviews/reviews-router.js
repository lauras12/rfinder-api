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
            const yelpId = req.params.place_id;
            console.log('IN THE REVIEWS ROUTER',req.body, 'BODY THAT ROUTER RECEIVES')
            const { yelp_id, name, img, url, yelp_rating, location_str, location_city, location_zip, location_st, display_phone, restaurant_reviews_count, category, review, checkedFinds } = req.body;
            for (const [key, value] of Object.entries(req.body)) {
                if (value === null) {
                    return res.status(400).send({ error: { message: `Missing ${key}` } });
                }
            }
            const existingReviewByUser = await PlacesService.getUserInUserPlace(knexInstance, user_id, yelpId)
            if (existingReviewByUser) {
                return res.status(400).send({ error: { message: `your review already exists` } })
            }
            //first check if there's a place of this id in GREEN db, if not we will save the place info, but it it already exists we will just add another review and checked finds
            const existingPlace = await PlacesService.getPlaceById(knexInstance, yelpId)
            if (!existingPlace) {
                console.log(user_id, yelpId, 'saving place yelp data')
                let newRestaurantPlace = {
                    yelp_id,
                    name,
                    img_url: img,
                    url,
                    yelp_rating,
                    location_str,
                    location_city,
                    location_zip,
                    location_st,
                    display_phone,
                    restaurant_reviews_count,
                }

                let savedPlace = await PlacesService.insertNewPlace(knexInstance, newRestaurantPlace)
                console.log('IN THE REVIEWS ROUTER',req.body, 'BODY THAT ROUTER RECEIVES',)
                let newUserPlace = {
                    userid: user_id,
                    reviewed_place_id: savedPlace.id
                }
                let savedUserPlace = await PlacesService.insertNewUserPlace(knexInstance, newUserPlace)
                console.log(savedUserPlace, savedPlace)
               
                let newReview = {
                    userid: user_id,
                    place_id: savedPlace.id,
                    place_category: category,
                    review,
                };
                let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview)
                console.log(savedReview)

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
                return res.json(201).json({ newRestaurantPlace, newReview, checkedFinds }).location(path.posix.join(req.originalUrl, `/${newRestaurantPlace.id}`))

            } else {
                console.log('ENTERING HERE?')
                console.log(existingPlace, 'PLACACELLLLLLLLLLLL')
                let newUserPlace = {
                    userid: user_id,
                    reviewed_place_id: existingPlace.id
                }

                let savedUserPlace = await PlacesService.insertNewUserPlace(knexInstance, newUserPlace)
                console.log(savedUserPlace)
                console.log('IN THE REVIEWS ROUTER',req.body, 'BODY THAT ROUTER RECEIVES',)
               
                let newReview = {
                    userid: user_id,
                    place_id: existingPlace.id,
                    place_category: category,
                    review,
                };
                let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview)
                console.log(savedReview)

                checkedFinds.forEach(el => {
                    let newCheckedFind = {
                        userid: user_id,
                        place_id: existingPlace.id,
                        review_id: savedReview.id,
                        find: el
                    }
                    ReviewsService.insertNewCheckedFind(knexInstance, newCheckedFind)
                        .then(newFind => {
                            console.log(newFind, 'FFFFF?????????')
                        })

                })
                //console.log(existingPlace, savedReview, 'SAVED REVIEW ')
                return res.json(201).json({ newReview, checkedFinds }).location(path.posix.join(req.originalUrl, `/${restaurant_place_id}`))
            }

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
            console.log(user_id, restaurant_place_id, 'AM I HERE?????')

            console.log(req.body, 'RECEIVED BODY IN UPDATE')
            // in future should call proxy here to get place's info again in order to ensure that if the place's address or other info was not changed in yelp it gets updated in restaurant finds up as well.....
            const existingReview = await ReviewsService.getReviewByPlaceId(knexInstance, user_id, restaurant_place_id)
            if (existingReview.length === 0) {
                let newReview = {
                    userid: user_id,
                    place_id: restaurant_place_id,
                    place_category: category,
                    review,
                };

                let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview)
                console.log(savedReview, 'IN UPDATE')
                
                next()

                checkedFinds.forEach(async el => {
                    let updatedCheckedFindInfo = {
                        userid: user_id,
                        place_id: restaurant_place_id,
                        review_id: savedReview.id,
                        find: el
                    }
                    let updatedFind = await ReviewsService.updateFindChecked(knexInstance, user_id, restaurant_place_id, updatedCheckedFindInfo)
                    console.log(updatedFind, 'THUMB UPDATED HURRRAAAAAA')
                });
                
                next()

                return res.json(201).json({ savedReview, checkedFinds }).location(path.posix.join(req.originalUrl, `/${restaurant_place_id}`));
            
            
            } else {
                
                
                const updatedReviewInfo = {
                    userid: user_id,
                    place_id: restaurant_place_id,
                    place_category: category,
                    date: new Date(),
                    review,
                };

                const updatedReview = await ReviewsService.updateReview(knexInstance, user_id, restaurant_place_id, updatedReviewInfo);
                console.log(updatedReview, 'UPDATE???', updatedReview.id)

                next() 

                checkedFinds.forEach(async el => {
                    let updatedCheckedFindInfo = {
                        userid: user_id,
                        place_id: restaurant_place_id,
                        review_id: updatedReview.id,
                        find: el
                    }
                    let updatedFind = await ReviewsService.updateFindChecked(knexInstance, user_id, restaurant_place_id, updatedCheckedFindInfo)
                    console.log(updatedFind, 'THUMB UPDATED HURRRAAAAAA')
                });

                next()

                return res.json(201).json({ updatedReview, checkedFinds }).location(path.posix.join(req.originalUrl, `/${restaurant_place_id}`));

            }


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

        PlacesService.deleteUserPlace(knexInstance, userId, placeToRemove)
            .then(() => {
                ReviewsService.deleteReview(knexInstance, userId, placeToRemove)

            })
            .then(() => {
                console.log('DONE????')
                return res.status(204).send('reviewed place deleted')

            })
            .catch(next)
    })


module.exports = reviewsRouter;