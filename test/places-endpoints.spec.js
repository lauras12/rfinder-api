const knex = require('knex');
const app = require('../src/app');
const bcrypt = require('bcryptjs');
const dataHelpers = require('./test-data');
const helpers = require('./test-helpers');

describe('places endpoints', function () {
    let db;

    const { testUsers, testPlaces, testReviews, testUserPlaces, testFindText, testFindChecked } = dataHelpers.makeTestData()
    before('knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)

    })
    after('disconnect from db', () => db.destroy(db));
    beforeEach('cleanup', () => helpers.cleanTables(db));
    afterEach('cleanup', () => helpers.cleanTables(db));

    describe('GET /api/', () => {
        context('given no restaurant reviewed places', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/')
                    .expect(200, [])
            })
        })

        context('given reviewed places in db', () => {
            beforeEach('insert places', () => {
                return helpers.seedRestaurantPlaces1(db, testUsers, testPlaces, testUserPlaces, testReviews, testFindText, testFindChecked)
            });

            it('responds with 200 and places array', () => {
                const expectedPlace = helpers.makeExpectedPlaceReviews(db, testUsers[0], testPlaces[0], testUserPlaces, testReviews, testFindChecked, testFindText)
                return supertest(app)
                    .get('/api/')
                    .expect(200)
                    .expect(res => {
                        res.body[0] === expectedPlace;
                    });
            });
        });
    });

    //fetches all restaurant places by user

    describe('GET /api/user', () => {
        context('given no reviewed places by user in db', () => {
            beforeEach('insert users', () => {
                const verifiedUsers = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }))
                return db
                    .into('users')
                    .insert(verifiedUsers)
            })
            it('returns 400 ', () => {
                return supertest(app)
                    .get('/api/user')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
                    .expect(400, {
                        error: {
                            message: `User has not reviewed any places`
                        }
                    })

            })
        })

        context('given reviewed places in db', () => {
            beforeEach('insert data', () => {
                return helpers.seedRestaurantPlaces2(db, testUsers, testPlaces, testReviews, testUserPlaces, testFindText, testFindChecked)
            })

            it('returns 200', () => {
                const expectedPlace = helpers.makeExpectedPlaceReviews(db, testUsers[0], testPlaces[0], testUserPlaces, testReviews, testFindChecked, testFindText)
                return supertest(app)
                    .get('/api/user')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .then(res => {
                        res.body[0] === expectedPlace
                    })
            })
        })

    })
    //get user's place by id
    describe('GET /api/place/:place_id', () => {
        context('given no places with given id', () => {
            beforeEach('insert users', () => {
                const verifiedUsers = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }));
                return db
                    .into('users')
                    .insert(verifiedUsers);
            });

            it('returns 400', () => {
                const placeId = 12;
                return supertest(app)
                    .get(`/api/place/${placeId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(400, { error: { message: `User with id ${testUsers[0].id} did not review place with id ${placeId}` } });
            });
        });

        context('given place exists in db', () => {
            beforeEach('populate the db', () => {
                return helpers.seedRestaurantPlaces2(db, testUsers, testPlaces, testReviews, testUserPlaces, testFindText, testFindChecked)
            })
            it('returns selected place', () => {
                const placeId = 1;
                const expectedPlace = helpers.makeExpectedPlaceReviews(db, testUsers[0], testPlaces[0], testUserPlaces, testReviews, testFindChecked, testFindText);
                return supertest(app)
                    .get(`/api/place/${placeId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedPlace);
            });
        });
    });

    describe('POST /api/:place_id/review', () => {
        context('db has no saved place', () => {
            beforeEach('insert users', () => {
                const verifiedUsers = testUsers.map(user => ({
                    ...user,
                    password: bcrypt.hashSync(user.password, 1)
                }))
                return db
                    .into('users')
                    .insert(verifiedUsers)
                    .then(() => {
                        return db
                        .into('findtext')
                        .insert(testFindText)
                    })
            })
            it('inserts a new place with new review and checked finds', () => {
                const user = testUsers[2];
                const place = {
                    yelp_id: 'aB4c',
                    name: 'test place',
                    img_url: 'image1',
                    url: 'yelpUrl4',
                    yelp_rating: 5,
                    location_str: '1 street',
                    location_city: 'cityFirst',
                    location_zip: '012345',
                    location_st: 'MA',
                    display_phone: '(123) 345 5678',
                    restaurant_reviews_count: 4,
                }

                const testNewUserPlace = {
                    userid: user.id,
                    reviewed_place_id: place.yelp_id,
                }

                const testNewReview = {
                    userid: user.id,
                    place_id: place.id,
                    place_category: 'category',
                    review: 'new test review in review obj',
                }

                const testFindsChecked = [1, 2, 3];

                const {
                     yelp_id, name, img_url, url, yelp_rating,
                    location_str, location_city, location_zip,
                    location_st, display_phone, restaurant_reviews_count,
                } = place;


                const testNewPlaceReq = {
                    yelp_id,
                    name,
                    img_url,
                    url,
                    yelp_rating,
                    location_str,
                    location_city,
                    location_zip,
                    location_st,
                    display_phone,
                    userid: user.id,
                    category: testNewReview.place_category,
                    review: testNewReview.review,
                    checkedFinds: testFindsChecked
                }
                
                return supertest(app)
                    .post(`/api/${place.yelp_id}/review`)
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .send(testNewPlaceReq)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.savedPlace).to.have.property('id');
                        expect(res.body.savedPlace.yelp_id).to.eql(testNewPlaceReq.yelp_id);
                        expect(res.body.savedPlace.name).to.eql(testNewPlaceReq.name);
                        expect(res.body.savedPlace.img_url).to.eql(testNewPlaceReq.img_url);
                        expect(res.body.savedPlace.url).to.eql(testNewPlaceReq.url);
                        expect(res.body.savedPlace.yelp_rating).to.eql(testNewPlaceReq.yelp_rating);
                        expect(res.body.savedPlace.location_str).to.eql(testNewPlaceReq.location_str);
                        expect(res.body.savedPlace.location_city).to.eql(testNewPlaceReq.location_city);
                        expect(res.body.savedPlace.location_st).to.eql(testNewPlaceReq.location_st);
                        expect(res.body.savedPlace.display_phone).to.eql(testNewPlaceReq.display_phone);
                        
                        
                        expect(res.body.savedReview).to.have.property('id');
                        expect(res.body.savedReview.userid).to.eql(testNewPlaceReq.userid);
                        expect(res.body.savedReview.place_id).to.eql(res.body.savedPlace.id);
                        expect(res.body.savedReview.place_category).to.eql(testNewPlaceReq.category);
                        expect(res.body.savedReview.review).to.eql(testNewPlaceReq.review);

                        expect(res.body.newSavedFinds).to.eql(testNewPlaceReq.checkedFinds)
                    })
                //this is in response body that router sents : newReview, checkedFinds 
            })
        })
    })



    context('given restaurantDB already has that saved place', () => {

        beforeEach('insert users', () => {
            const verifiedUsers = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }))
            return db
                .into('users')
                .insert(verifiedUsers)
                .then(() => {
                    return db
                    .into('place')
                    .insert(testPlaces)
                })
                .then(() => {
                    return db
                    .into('findtext')
                    .insert(testFindText)
                })
        })
        it('inserts new review to a saved place in db', () => {
            const user = testUsers[2];
            const place = testPlaces[2];

            const testNewUserPlace = {
                userid: user.id,
                reviewed_place_id: place.yelp_id,
            }

            const testNewReview = {
                userid: user.id,
                place_id: place.id,
                place_category: 'category',
                review: 'new test review in review obj',
            }

            const testFindsChecked = [1, 2, 3];

            const {
                id, yelp_id, name, img_url, url, yelp_rating,
                location_str, location_city, location_zip,
                location_st, display_phone, restaurant_reviews_count,
            } = place;


            const testNewPlaceReq = {
                id,
                yelp_id,
                name,
                img_url,
                url,
                yelp_rating,
                location_str,
                location_city,
                location_zip,
                location_st,
                display_phone,
                userid: user.id,
                category: testNewReview.place_category,
                review: testNewReview.review,
                checkedFinds: testFindsChecked
            }
            return supertest(app)
                .post(`/api/${place.yelp_id}/review`)
                .set('Authorization', helpers.makeAuthHeader(user))
                .send(testNewPlaceReq)
                .expect(201)
                .expect(res => {
                    expect(res.body.savedReview).to.have.property('id');
                    expect(res.body.savedReview.userid).to.eql(testNewPlaceReq.userid);
                    expect(res.body.savedReview.place_id).to.eql(place.id);
                    expect(res.body.savedReview.place_category).to.eql(testNewPlaceReq.category);
                    expect(res.body.savedReview.review).to.eql(testNewPlaceReq.review);

                    expect(res.body.savedFinds).to.eql(testNewPlaceReq.checkedFinds)
                })
      
        })
    })

    describe('PATCH /api/edit/:restaurant_place_id', () => {
           
        beforeEach('insert users', () => {
            const verifiedUsers = testUsers.map(user => ({
                ...user,
                password: bcrypt.hashSync(user.password, 1)
            }))
            return db
                .into('users')
                .insert(verifiedUsers)
                .then(() => {
                    return db
                    .into('place')
                    .insert(testPlaces)
                })
                .then(() => {
                    return db
                    .into('findtext')
                    .insert(testFindText)
                })
        })

            it('created new review and checked finds for the place', () => {
                const user = testUsers[2];
                const place = testPlaces[1];
    
                const testUpdatedReview = {
                    userid: user.id,
                    place_id: place.id,
                    place_category: 'category',
                    review: 'updated review',
                }
    
                const testFindsChecked = [1, 3];
    
                const {
                    id, yelp_id, name, img_url, url, yelp_rating,
                    location_str, location_city, location_zip,
                    location_st, display_phone, restaurant_reviews_count,
                } = place;
    
    
                const testUpdatedPlaceReq = {
                    id,
                    yelp_id,
                    name,
                    img_url,
                    url,
                    yelp_rating,
                    location_str,
                    location_city,
                    location_zip,
                    location_st,
                    display_phone,
                    userid: user.id,
                    reviewed_place_id: place.id,
                    restaurant_reviews_count,
                    category: testUpdatedReview.place_category,
                    review: testUpdatedReview.review,
                    checkedFinds: testFindsChecked
                }
                return supertest(app)
                .patch(`/api/edit/${place.id}`)
                .set('Authorization', helpers.makeAuthHeader(user))
                .send(testUpdatedPlaceReq)
                .expect(201)
                .expect(res => {
                    expect(res.body.savedReview).to.have.property('id');
                    expect(res.body.savedReview.userid).to.eql(testUpdatedPlaceReq.userid);
                    expect(res.body.savedReview.place_id).to.eql(testUpdatedPlaceReq.id);
                    expect(res.body.savedReview.place_category).to.eql(testUpdatedPlaceReq.category);
                    expect(res.body.savedReview.review).to.eql(testUpdatedPlaceReq.review);

                    expect(res.body.updatedFinds).to.eql(testUpdatedPlaceReq.checkedFinds)
                })
            })
        
    })
    describe('DELETE /api/place/delete/:restaurant_place_id', () => {
        beforeEach('insert data', () => {
            return helpers.seedRestaurantPlaces2(db, testUsers, testPlaces, testReviews, testUserPlaces, testFindText, testFindChecked)
        })
        it('deletes selected place review and finds', () => {
            const user = testUsers[0];
            const placeToRemove = testPlaces[0].id;
            return supertest(app)
            .delete(`/api/place/delete/${placeToRemove}`)
            .set('Authorization', helpers.makeAuthHeader(user))
            .expect(204)
        })
    })
})




