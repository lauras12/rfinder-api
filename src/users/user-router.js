const express =require('express');
const userRouter = express.Router();
const jsonBodyParser = express.json();
const UserService = require('./user-service');
const path = require('path');

userRouter
.post('/api/register', jsonBodyParser, (req,res,next) => {
    for (const field of ['fullname', 'username', 'password']) {
        if(!req.body[field]) {
            console.log('working1')
            return res.status(400).json({error: {message: `Missing ${field}`}})
        }
    }

    const {fullname, username, password} = req.body;
    const passwordError = UserService.validatePassword(password);
   
    if(passwordError) {
        console.log('working2')
        return res.status(400).json({ error: {message: passwordError }})
    }

    const knexInstance = req.app.get('db');
    UserService.hasUserWithUserName(knexInstance, username)
    .then(takenUser => {
        if(takenUser) {
            console.log('working3')
            return res.status(400).json({error: {message:`Username already taken` }})
        }
        return UserService.hashPassword(password)
        .then(hashedPassword => {
            const newUser = {
                fullname,
                username,
                password: hashedPassword,
            }
            return UserService.insertUser(knexInstance, newUser)
            .then(user => {
                res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${user.id}`))
                .json(user)
            })
        })
    })
    .catch(next)
})

module.exports = userRouter