const express = require('express');
const reviewsRouter = express.Router();
const jsonBodyParser = express.json();
const PlacesService = require('../places/places-service');
const ReviewsService = require('../reviews/reviews-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');

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


        console.log({newRestaurantPlace, newReview, checkedFinds}, "RETURNING TO CLIENT")
        console.log(req.originalUrl, `/${savedPlace.id}`)
        return res.json(201).json({newRestaurantPlace, newReview, checkedFinds}).location(path.posix.join(req.originalUrl, `/${savedPlace.id}`))


    } catch(err) {
        next(err)
    }
})

reviewsRouter
.route('/api/:user_id/review/:restaurant_place_id')
.delete((req,res,next) => {
    const knexInstance = req.app.get('db');
    const userId = req.params.user_id;
    const placeToRemove = req.params.restaurant_place_id ;
    //should I get by id first to make sure that if place does not exist I have an if statement????
    PlacesService.deleteReviewedPlace(knexInstance, userId, placeToRemove)
    .then(() => {
      //delete the rest of info
      ReviewsService.deleteReview(knexInstance, userId, placeToRemove)
      .then(() => {
          console.log('DONE????')
          return res.status(204).send('reviewed place deleted')
        //   ReviewsService.deleteCheckedFind(knexInstance, userId, placeToRemove)
        //   .then(() => {
        //       return res.status(204).json('reviewed place deleted')
        //   })
        //   .catch(next)
      })
      //return res.status(204).send('reviewed place deleted')
      .catch(next)
    })
    .catch(next)
})


module.exports = reviewsRouter; 