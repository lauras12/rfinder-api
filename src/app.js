require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const app = express();
const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';
const proxyRouter = require('./proxy');
const authRouter = require('./auth/auth-router');
const userRouter = require('./users/user-router');
const placesRouter = require('./places/places-router');
const reviewsRouter = require('./reviews/reviews-router');
const {CLIENT_ORIGIN} = require('./config');

    app.use(morgan(morganOption));
    app.use(helmet());
    app.use(cors());

    app.use(proxyRouter);
    app.use(authRouter);
    app.use(userRouter);
    app.use(placesRouter);
    app.use(reviewsRouter);

    app.get('/', (req, res) => {
        res.send('hello from restaurant finder!')
    });
/*
app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "http://localhost:3000");
     res.header("Access-Control-Allow-Origin", "https://rfinder-app.vercel.app/");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");     
     next();   });
*/
/* error handler */
    app.use(function errorHandler(error, req, res, next) {
        let response;
        if (NODE_ENV === 'production') {
            response = { error: { message: 'server error' } }
            console.log(error);
        } else {
            console.error(error)
            response = { message: error.message, error }
        }
        res.status(500).json(response)
    });

module.exports = app;

