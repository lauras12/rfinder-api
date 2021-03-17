makeTestUsers = () => {
    return [
        {
            id: 1,
            fullname: 'full name1',
            username: 'username1',
            password: '!@123Abc',
        },
        {
            id: 2,
            fullname: 'full name2',
            username: 'username2',
            password: '!@123Abc',
        },
        {
            id: 3,
            fullname: 'full name3',
            username: 'username3',
            password: '!@123Abc',
        }
    ]
}

const makeTestPlaces = () => {
    return [
        {
            id: 1,
            yelpid: 'aB1c',
            name: 'first place',
            img_url: 'image1',
            url: 'yelpUrl',
            yelprating: 4.5,
            location_str: '1 street',
            location_city: 'cityFirst',
            location_zip: '012345',
            location_st: 'MA',
            phone: '+1234567888',
            displayphone: '(123) 345 5678',
            userid: 1,
            restaurant_reviews_count: 2,
            folderid: 1,
        },
        {
            id: 2,
            yelpid: 'aB2c',
            name: 'second place',
            img_url: 'image2',
            url: 'yelpUrl',
            yelprating: 5,
            location_str: '2 street',
            location_city: 'citySecond',
            location_zip: '012345',
            location_st: 'MA',
            phone: '+1234567888',
            displayphone: '(123) 345 5678',
            userid: 2,
            restaurant_reviews_count: 1,
            folderid: 1,
        },
        {
            id: 3,
            yelpid: 'aB1c',
            name: 'first place',
            img_url: 'image3',
            url: 'yelpUrl',
            yelprating: 4,
            location_str: '3 street',
            location_city: 'cityThird',
            location_zip: '012345',
            location_st: 'MA',
            phone: '+1234567888',
            displayphone: '(123) 345 5678',
            userid: 3,
            restaurant_reviews_count: 0,
            folderid: 3
        },
    ]
}
const makeTestReviews = () => {
    return [
        {
            id:1,
            userId: 1,
            placeId: 1,
            review: 'first review',
            date: new Date(),
        },
        {
            id:2,
            userId: 1,
            placeId: 1,
            review: 'second review',
            date: new Date(),
        },
        {
            id:2,
            userId: 1,
            placeId: 3,
            review: 'third review',
            date: new Date(),
        }
    ]
}

const makeTestTumbText =()=> {
    return [
        {
            id: 1,
            description: 'No single use plastic',
        },
        {
            id: 2,
            description: 'Compostable take-out containers and cups',
        },
        {
            id: 3,
            description: 'No plastic bottled drinks',
        },
        {
            id: 4,
            description: 'Composting food scraps',
        }
    ]
}

const makeTestFindChecked = () => {
    return [
        {
            id: 1,
            userId: 1,
            placeId: 1,
            reviewId: 1,
            find: 1
        },
        {
            id: 2,
            userId: 1,
            placeId: 1,
            reviewId: 1,
            find: 2
        },
        {
            id: 3,
            userId: 1,
            placeId: 3,
            reviewId: 2,
            find: 3
        },
        {
            id: 4,
            userId: 1,
            placeId: 3,
            reviewId: 2,
            find: 4
        }
    ]
}

makeTestData = () => {
    testUsers = makeTestUsers();
    testPlaces = makeTestPlaces();
    testReviews = makeTestReviews();
    testFindText = makeTestFindText();
    testFindChecked = makeTestFindChecked();
    return { testUsers, testPlaces, testReviews, testFindText, testFindChecked};
}

module.exports = {
    makeTestData,
    makeTestUsers,
    makeTestPlaces,
}