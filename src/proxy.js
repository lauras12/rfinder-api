const axios = require('axios')
const express = require('express');
const proxyRouter = express.Router();

proxyRouter
.get('/yelp/', (req, res) => {
    const { term, location } = req.query;

    const headers = {
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Methods': "GET,HEAD"
    };
    
    axios({
        method: 'get',
        url: `https://api.yelp.com/v3/businesses/search?term=${term}&location=${location}`,
        headers: {
            'Authorization': 'bearer pCzcyRwsJ4cqsP9asMZ7VJJbBSrzy_CNLLUX0hUyj26uAZ3_5NcJMLC-DtJt1il1FT1WlosQ-mEopYjyLJWvYFmPXrVpIbGazzY_OP_XPATgB5kbd9tgNy6RJKw_YHYx',
        },
        responseType: 'stream'
    })
        .then(response => {
            if (response.status === 200) {
                res.writeHead(200, {
                    ...headers, 'Content-Type': response.headers['content-type']
                });
                response.data.pipe(res);
            } else {
                res.writeHead(response.status);
                res.end();
            }
        })
        .catch(res.error)
});

module.exports = proxyRouter;