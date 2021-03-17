const express = require('express');
const reviewsRouter = express.Router();
const jsonBodyParser = express.json();
const PlacesService = require('../places/places-service');
const ReviewsService = require('../reviews/reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');

reviewsRouter
.route('/api/:user_id/review')
.all(requireAuth)
.post(jsonBodyParser, async(req, res, next) => {
    try {
        const knexInstance = req.app.get('db');
        const user_id = Number(req.params.user_id);
        const { yelpId, name, img, url, yelpRating, location_str, location_city, location_zip, location_st, phone, displayPhone, folderId, restaurantReviewsCount, userId, review, checkedFinds} = req.body;
        for (const [key, value] of Object.entries(req.body)) {
            if (value === null) {
                return res.status(400).send({ error: { message: `Missing ${key}` } });
            }
        }
        //checkedFinds is an array of numbers referring to ids of find text
        let newFindChecked
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
            restaurant_reviews_count: restaurantReviewsCount ,
        }

        let savedPlace = await PlacesService.insertNewPlace(knexInstance, newRestaurantPlace)

        let newReview = {
            userid: userId,
            placeid: savedPlace.id,
            review,
        };
        let savedReview = await ReviewsService.insertNewReview(knexInstance, newReview)
        console.log(savedReview);

        checkedFinds.forEach(el => {
            let newCheckedFind = {
                userid : userId, 
                placeid: savedPlace.id,
                reviewid: savedReview.id, 
                find: el
            }
            ReviewsService.insertNewCheckedFind(knexInstance, newCheckedFind)
            .then(newFind => {
                console.log(newFind)
            })

        })



    } catch(err) {
        next(err)
    }


})


module.exports = reviewsRouter; 