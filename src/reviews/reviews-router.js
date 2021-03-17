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
            const { yelpId, name, img, url, yelpRating, location_str, location_city, location_zip, location_st, phone, displayPhone, folderId, restaurantReviewsCount, userId, review, checkedFinds } = req.body;
            for (const [key, value] of Object.entries(req.body)) {
                if (value === null) {
                    return res.status(400).send({ error: { message: `Missing ${key}` } });
                }
            }
            //checkedFinds is an array of numbers referring to ids of find text
            // need to save place first, then review so db assigns placeId and reviewId, then call db to get those ids and create findChecked obj with them
            let newRestaurantPlace = {
                yelpid: yelpId,
                name,
                img_url: img,
                url,
                yelprating: yelpRating,
                location_str,
                location_city,
                location_zip,
                location_st,
                phone,
                displayphone: displayPhone,
                userid: user_id,
                folderid: folderId,
                restaurant_reviews_count: restaurantReviewsCount,
            }

            let savedPlace = await PlacesService.insertNewPlace(knexInstance, newRestaurantPlace)

            let newReview = {
                userid: user_id,
                placeid: savedPlace.id,
                review,
            };
            let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview)


            checkedFinds.forEach(el => {
                let newCheckedFind = {
                    userid: user_id,
                    placeid: savedPlace.id,
                    reviewid: savedReview.id,
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
            console.log(req.params.restaurant_place_id, Number(req.params.restaurant_place_id))
            const { yelpid, name, img_url, url, yelprating, location_str, location_city, location_zip, location_st, phone, displayphone, folderid, restaurant_reviews_count, review, reviewDate, checkedFinds } = req.body;
            // for (const [key, value] of Object.entries(req.body)) {
            //     if (value === null) {
            //         return res.status(400).send({ error: { message: `Missing ${key}` } });
            //     }
            // }

            const fullUpdatedPlace = {
                id: restaurant_place_id,
                yelpid,
                name,
                img_url,
                url,
                yelprating,
                location_str,
                location_city,
                location_zip,
                location_st,
                phone,
                displayphone,
                userid: user_id,
                folderid,
                restaurant_reviews_count,
                review,
                reviewdate: reviewDate,
                checkedFinds,
            }
            console.log(fullUpdatedPlace, '???????HERE??????????')

            let updatedPlaceInfo = {
                id: restaurant_place_id,
                yelpid,
                name,
                img_url,
                url,
                yelprating,
                location_str,
                location_city,
                location_zip,
                location_st,
                phone,
                displayphone,
                userid: user_id,
                folderid,
                restaurant_reviews_count,
            }

            let updatedReviewInfo = {
                userid: user_id,
                placeid: restaurant_place_id,
                date: new Date(),
                review,
            }


            let updatedReview;
            let updatedCheckedFind;
            let updatedPlace;

            updatedPlace = await PlacesService.updateRestaurantPlace(knexInstance, user_id, restaurant_place_id, updatedPlaceInfo)
            console.log(updatedPlace, 'FINISHED???????????')

            updatedReview = await ReviewsService.updateReview(knexInstance, user_id, restaurant_place_id, updatedReviewInfo)
            console.log(updatedReview, 'FINISHED???222222222222????????')

            let updatedFindsList = [];
            
                for(let i = 0; i<checkedFinds.length; i++ ) {
                
                    let updatedFind = {
                        userid: user_id,
                        placeid: restaurant_place_id,
                        reviewid: updatedReview.id,
                        find: checkedFinds[i],
                    }
                    updatedFindsList.push(updatedFind);
                    
                }
                console.log(updatedFindsList, "THUMBLISTTTTTTTTT")
           
            
                let find = await ReviewsService.updateFindChecked(knexInstance, user_id, restaurant_place_id, updatedFindsList)
                // .then(find => {
                    updatedFindsList.push(find)
                    console.log(find, 'TNUMBSSSSSSSSSS')
                // })
                // .catch(next)
            
            
                
                
            

            return res.status(201).json({ updatedPlace, updatedReview, updatedFindsList }).location(path.posix.join(req.originalUrl, `/${restaurant_place_id}`))

        } catch (err) {
            console.log(err,'ERROR')
            next(err)
        }
        next()
    })



reviewsRouter
    .route('/api/place/delete/:restaurant_place_id')
    .all(requireAuth)
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        const userId = req.user.id;
        const placeToRemove = req.params.restaurant_place_id;
        console.log(userId, placeToRemove, req.user, 'IN DELETE')
        //how to determine that we cant delete a place if current user is not its author? on front end
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