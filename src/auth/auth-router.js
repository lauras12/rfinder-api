const express = require('express');
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require('./auth-service');
 //login router
authRouter
.post('/api/login', jsonBodyParser, (req, res, next) => {
    const {username, password} = req.body;
    const loginUser = {username, password};
    console.log('LOGIN');
    for (const [key,value] of Object.entries(loginUser)){
        if(value == null) {
             return res.status(400).json({ error: {message: `Missing ${key}`}});
        }
    };

    const knexInstance = req.app.get('db');
    console.log(knexInstance);
    AuthService.getUserWithUserName(knexInstance, loginUser.username)
    .then(dbUser => {
        console.log('GOT USER');
        console.dir(dbUser);
        if(!dbUser) {
            return res.status(400).send({error: {message: 'Incorrect user_name or password'}});
        }
        return AuthService.comparePasswords(loginUser.password, dbUser.password)
        .then(compareMatch => {
            console.log('GOT PASSWORD');
            console.dir(dbUser.password);
            
        
            const subject = dbUser.username;
            const payload = { userId : dbUser.id };
            const authToken = AuthService.createJWT(subject, payload);
            console.log('GOT TOKEN');
            console.dir(authToken);
            return res.json({authToken});
            //return res.json({authToken: AuthService.createJWT(subject, payload)});
        });
    })
    .catch(error => { 
        console.log('ERROR'); console.dir(error); 
        return res.status(400).json({error: {message: 'Incorrect user_name or password'}});
    });
    
});

module.exports = authRouter;
