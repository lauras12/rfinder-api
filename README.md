# Restaurant Finder

Check it out at [Restaurant Finder](https://rfinder-app.vercel.app/).

Restaurant Finder is a place where users can login and search for places to eat and let other know what they best like about the restaurant. 

## WHY MAKE THIS APP?

This application was created to allow users to save and rate their favorite places.  Being able to categorize different places as "having good vibes" or "having a great beer list and outdoor patio" are just some of the many ways users can categorize their saves venues. 
  

## ENDPOINTS AND EXPECTED DATA
### Yelp Proxy Endpoint
#### /yelp/

  description: a proxy endpoint to Yelp.  This endpoint can be used without loggin into Restaurant Finder

  method: GET

  input: 

    query: {
      term: string,
      location: string
    }

  output: 

    status: 201,

    body: {

      rating: number,
      price: symbol,
      phone: string,
      id: string,
      alias: string,
      is_closed: boolean,
      categories": [
        {
          alias: string,
          title: string
        }
      ],
      review_count: number,
      name: string,
      url: string,
      coordinates": {
        latitude: number,
        longitude: number
      },
      image_url: string,
      location: {
        city: string,
        country: string,
        address2: string,
        address3: string,
        state: string,
        address1: string,
        zip_code: string 
      },
      distance: number,
      transactions: array of stigs

    },

### User Registration
#### /api/register

  description: registration endpoint

  method: POST

  input: 

    body: {

      fullname: string,
      username: string,
      password: string,
      id: number

    }

  output: 

    status: 201,

    body: {

      fullname: string,
      username: string,
      password: encrypted, 

    }

### Auth Login Endpoint
#### /api/login

  description: user login endpoint
  
  method: POST

  input:

    body: {

      userName: string, 
      password: string

    }

  output:

    body: {

      authToken: jwt (javascript web token)

    }

### places Endpoints
#### /api/

  description: gets all restaurant find reviewed places with full info

  method: GET

  output: 
    
    status: 200,

    body: [

      {

        id: number,
        yelp_id: number,
        name: string,
        img: string,
        url: string,
        yelpRating: number,
        location_str: string,
        location_city: string,
        location_zip: string,
        location_st: string,
        display_phone: string,
        restaurant_reviews_count: number,
        review: string,
        reviewDate: Date
        reviewCategory: string,
        checkedFinds, array of strings

      }

    ]

#### /api/user/

  description: gets restaurant reviewed places by user with full info

  method: GET

  output: 
  
    status: 200,

    body: [

      {

        id: number,
        yelp_id: number,
        name: string,
        img: string,
        url: string,
        yelpRating: number,
        location_str: string,
        location_city: string,
        location_zip: string,
        location_st: string,
        display_phone: string,
        restaurant_reviews_count: number,
        review: string,
        reviewDate: Date
        reviewCategory: string,
        checkedFinds, array of strings

      }

    ]

#### /api/place/:place_id

  description: gets by id reviewed place with full info

  method: GET

  input: 

    params: place_id: string

  example output:

    {
      id: 1,
      yelp_id: '5dyqBEBuwDgZ23iLQJjl0w',
      name: 'restaurant name',
      img_url: 'image url',
      url: 'website url',
      yelp_rating: 5,
      location_str: 'street address',
      location_city: 'city',
      location_zip: 'zip code',
      location_st: 'state',
      display_phone: 'phone number',
      restaurant_reviews_count: 1,
      userid: 1,
      reviewed_place_id: 1,
      review: 'string',
      checkedFinds: [
        'Good vibes', 
        'Awesome service', 
        'Contactless', 
        'Recycle and compost bins inside', 
        'Clean bathrooms', 
        'Locally sourced produce', 
        'Outdoor patio', 
        ],
      category: 'Juice-Bar'
    }

### Reviews Endpoints
#### /api/:place_id/review

  description: creates restaurant-reviewed place in db that consists of yelp-place-data recorded into 'place' table and review section recorded into 'review' and 'findChecked' tables

  method: POST

  input: 

    params: yelpId: string

    body: {
      
      yelp_id: string, 
      name: string, 
      img_url: string, 
      url: string, 
      yelp_rating: number, 
      location_str: string, 
      location_city: string, 
      location_zip: string, 
      location_st: string, 
      display_phone: string, 
      restaurant_reviews_count: number, 
      category: string, 
      review: string, 
      checkedFinds: array of strings

    }

  example output:

    {

      savedPlace: {
        id: 23,
        yelp_id: string,
        name: restaurant name,
        img_url: 'image url',
        url: 'website url',
        yelp_rating: 4,
        location_str: 'street address',
        location_city: 'city',
        location_zip: 'zip code',
        location_st: 'state',
        display_phone: 'phone number',
        restaurant_reviews_count: 1,
      },
      savedReview: {
        id: 81,
        userid: 1,
        place_category: 'Lunch',
        review: 'string',
        date: 2020-03-24T00:46:31.534Z,
        place_id: 23
      },
      newSavedFinds: [ 10, 9, 7, 5, 4 ]

    }

#### /api/edit/:restaurant_place_id

  description: updates a reviewed place

  method: PATCH

  input: 

    params: restaurant_place_id: string

    body: {
      
      category: string, 
      review: string, 
      checkedFinds: array of strings

    }

  example output:

    status: 201

    body: {
      savedReview: {
        id: 85,
      userid: 1,
      place_category: 'Bakery',
      review: 'string',
      date: 2020-03-24T00:53:10.047Z,
      place_id: 24
      },
      updatedFinds: [ 3, 4, 11 ]
    }

#### /api/place/delete/:restaurant_place_id

  description: deletes an existing review

  method: DELETE

  input: 

    params: restaurant_place_id: string

  example output:

    status: 204

    message: 'reviewed place deleted'


## TECH STACK
#### FRONT-END
* HTML5
* CSS3
* JavaScript
* React.js front end framework
* font-awesome
* bcrypt

#### BACK-END
* Node.js backend run-time environment
* Express.js backend framework and architecture
* SQL for database
* Postgres - relational database management system
* Yelp API
* JWTs for authentication
* Axios - Promise based HTTP Client

#### TESTING and DEPOLYMENT
* Mocha - back-end testing framework
* Chai - assertion library backend testing
* Enzyme - React.js testing utility
* Heroku - cloud application platform