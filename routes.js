const express = require('express');
const authenticateUser = require('./middleware/auth-user');
const router = express.Router();
const asyncHandler = require('./middleware/asyncHandler')
const {Course} = require('./models')
const {User} = require('./models');

// route that will return all properties and values for the currently authenticated User 
router.get('/users',authenticateUser, asyncHandler( async(req,res)=>{
    const user = req.currentUser;
    res.json({
        firstName : user.firstName,
        lastName : user.lastName,
        email : user.emailAddress
    })
    .status(200)
}))

// route that will create a new user, set the Location header to "/"
router.post('/users', authenticateUser,asyncHandler(async (req,res)=>{
    try {
        await User.create(req.body)
        res.status(201)
        .json({
            message : "User successfully created"
        }).setHeader('Location','/').end()
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        }else{
            throw error;
        }
    }
}))


//route that will return all courses including the User associated with each course
router.get('/courses',asyncHandler(async (req, res)=>{
    const courses = await Course.findAll({
        include : [
            {
                model : User,
                attributes : ["firstName", "LastName", "emailAddress"]
            }    
        ],  
    })
    res.json(courses).status(200)
}))


//route that will return the corresponding course including the User associated with that course
router.get('/course/:id',asyncHandler(async(req,res)=>{
    const course = await Course.findByPk(req.params.id,{
       include : [
           {
               model:User,
               attributes : ["firstName", "LastName", "emailAddress"]
           }
       ]
    })
    res.json(course).status(200)
}))

//route that will create a new course, set the Location header to the URI for the newly created course
router.post('/courses',authenticateUser,asyncHandler(async (req,res)=>{
    try {
        const course = await Course.create(req.body)
        res.status(201)
        .json(course)
        .setHeader('Location','/').end()
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err=>err.message)
            res.status(400).json({errors})
        }else{
            throw error
        }
    }
}))

module.exports = router