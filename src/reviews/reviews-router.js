const express = require('express');
const reviewsRouter = express.Router();
const jsonBodyParser = express.json();
const PlacesService = require('../places/places-service');
const ReviewsService = require('../reviews/reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');
const validUrl = require('valid-url');

reviewsRouter
    /* creates restaurant-reviewed place in db that consists of yelp-place-data recorded into 'place' table and review section recorded into 'review' and 'findChecked' table*/
    .route('/api/:place_id/review')
    .all(requireAuth)
    .post(jsonBodyParser, async (req, res, next) => {
        try {
            const knexInstance = req.app.get('db');
            const user_id = req.user.id;
            const yelpId = req.params.place_id;
            const { yelp_id, name, img_url, url, yelp_rating, location_str, location_city, location_zip, location_st, display_phone, category, review, checkedFinds } = req.body;
            
            for (const [key, value] of Object.entries(req.body)) {
                if (value === null || value.length === 0 || value === '') {
                    return res.status(400).send({ error: { message: `Missing fields` } });
                }
            }
            const existingReviewByUser = await PlacesService.getUserInUserPlace(knexInstance, user_id, yelpId)
            if (existingReviewByUser) {
                return res.status(400).send({ error: { message: `your review already exists` } });
            }
            //first check if there's a place of this id in db, if not we will save the place info, but it it already exists we will just add another review and checked finds
            const existingPlace = await PlacesService.getPlaceById(knexInstance, yelpId);
            if (!existingPlace) {
                let newRestaurantPlace = {
                    yelp_id,
                    name,
                    img_url,
                    url,
                    yelp_rating: Number(yelp_rating),
                    location_str,
                    location_city,
                    location_zip,
                    location_st,
                    display_phone,
                };
                let savedPlace = await PlacesService.insertNewPlace(knexInstance, newRestaurantPlace);
                let newUserPlace = {
                    userid: user_id,
                    reviewed_place_id: savedPlace.id
                };
                let savedUserPlace = await PlacesService.insertNewUserPlace(knexInstance, newUserPlace);
                let newReview = {
                    userid: user_id,
                    place_id: savedPlace.id,
                    place_category: category,
                    review,
                };
                let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview);

                let findArr= checkedFinds.map(el => {
                    let newCheckedFind = {
                        userid: user_id,
                        place_id: savedPlace.id,
                        review_id: savedReview.id,
                        find: el
                    };
                    return newCheckedFind;
                });
                let newSavedFinds = await ReviewsService.insertNewCheckedFind(knexInstance, findArr)
                .then(rows => {
                        return rows.map(el => el.find)
                })
                
                return res.status(201).json({ savedPlace, savedReview, newSavedFinds });

            } else {
                let newUserPlace = {
                    userid: user_id,
                    reviewed_place_id: existingPlace.id
                };

                let savedUserPlace = await PlacesService.insertNewUserPlace(knexInstance, newUserPlace);
               
                let newReview = {
                    userid: user_id,
                    place_id: existingPlace.id,
                    place_category: category,
                    review,
                };
                let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview);
    
                let findArr= checkedFinds.map(el => {
                    let newCheckedFind = {
                        userid: user_id,
                        place_id: existingPlace.id,
                        review_id: savedReview.id,
                        find: el
                    };
                    return newCheckedFind;
                });
                let savedFinds = await ReviewsService.insertNewCheckedFind(knexInstance, findArr)
                .then(rows => {
                        return rows.map(el => el.find);
                });
                return res.status(201).json({savedReview, savedFinds});
            }
        } catch (err) {
            next(err);
        }
    });

reviewsRouter //updating a reviewed place
    .route('/api/edit/:restaurant_place_id')
    .all(requireAuth)
    .patch(jsonBodyParser, async (req, res, next) => {
        try {
            const knexInstance = req.app.get('db');
            const restaurant_place_id = Number(req.params.restaurant_place_id);
            const user_id = req.user.id;
            let {
                yelp_id, name, img, url, yelp_rating,
                location_str, location_city, location_zip,
                location_st, display_phone,
                 category, review, checkedFinds
            } = req.body;

            
            for (const [key, value] of Object.entries(req.body)) {
                if (value === null) {
                    return res.status(400).send({ error: { message: `Missing fields` } });
                }
            }
        
            
            // in future should call proxy here to get place's info again in order to ensure that if the place's address or other info was not changed in yelp it gets updated in restaurant finds up as well.....
            const existingReview = await ReviewsService.getReviewByPlaceId(knexInstance, user_id, restaurant_place_id);
           
            if (existingReview.length === 0) {
                let newReview = {
                    userid: user_id,
                    place_id: restaurant_place_id,
                    place_category: category,
                    review,
                };

                let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview)
               
               
                let findArr= checkedFinds.map(el => {
                    let newCheckedFind = {
                        userid: user_id,
                        place_id: restaurant_place_id,
                        review_id: savedReview.id,
                        find: el
                    }
                    return newCheckedFind;
                })
                let updatedFinds = await ReviewsService.updateFindChecked(knexInstance, user_id, restaurant_place_id, findArr)
                .then(rows => {
                        return rows.map(el => el.find)
                })
                
               
                return res.status(201).json({ savedReview, updatedFinds })
            
            
            } else {
                
                if (!review) {
                    review = ' ';
                }
                if (Array.isArray(review)) {
                    review = review[0]
                }
            

                const updatedReviewInfo = {
                    userid: user_id,
                    place_id: restaurant_place_id,
                    place_category: category,
                    date: new Date(),
                    review: review,
                };

                const updatedReview = await ReviewsService.updateReview(knexInstance, user_id, restaurant_place_id, updatedReviewInfo);
    
               
                let findArr = checkedFinds.map(el => {
                    let newCheckedFind = {
                        userid: user_id,
                        place_id: restaurant_place_id,
                        review_id: updatedReview.id,
                        find: el
                    }
                    return newCheckedFind;
                })
            
                let updatedFinds = await ReviewsService.updateFindChecked(knexInstance, user_id, restaurant_place_id, findArr)
                .then(rows => {
                        return rows.map(el => el.find)
                })

                return res.status(201).json({ updatedReview, updatedFinds })
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

        PlacesService.deleteUserPlace(knexInstance, userId, placeToRemove)
            .then(() => {
                ReviewsService.deleteReview(knexInstance, userId, placeToRemove);
            })
            .then(() => {
                return res.status(204).send('reviewed place deleted');
            })
            .catch(next);
    });

module.exports = reviewsRouter;