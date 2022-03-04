const express = require('express');
const authenticateUser = require('./middleware/auth-user');
const router = express.Router();
const asyncHandler = require('./middleware/asyncHandler')
const {Course} = require('./models')
const {User} = require('./models');
const res = require('express/lib/response');
const auth = require('basic-auth');

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
        .location('/').end()
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
router.get('/courses/:id',asyncHandler(async(req,res,next)=>{
    const course = await Course.findByPk(req.params.id,{
       include : [
           {
               model:User,
               attributes : ["firstName", "LastName", "emailAddress"]
           }
       ]
    })
    if(course){
        res.json(course).status(200)
    }else{
        const error = new Error();
            error.status = 404;
            error.message = 'Course not found';
            next(error);
    }
    
}))

//route that will create a new course, set the Location header to the URI for the newly created course
router.post('/courses',authenticateUser,asyncHandler(async (req,res)=>{
    try {
        const course = await Course.create(req.body)
        res.status(201).location(`/courses/${course.id}`).end()
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err=>err.message)
            res.status(400).json({errors})
        }else{
            throw error
        }
    }
}))

//route that will update the corresponding course 
router.put('/courses/:id', authenticateUser,asyncHandler(async (req,res)=>{
    try {
        const course = await Course.findByPk(req.params.id)
        await course.update(req.body)
        res.status(204).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError'){
            const errors = error.errors.map(err=>err.message)
            res.status(400).json({errors})
        }else{
            throw error
        }
    }
}))

// route that will delete the corresponding course
router.delete('/courses/:id',authenticateUser,asyncHandler(async (req,res)=>{
    const course = await Course.findByPk(req.params.id)
    if (course){
        if (req.currentUser.id === course.userId){
            await course.destroy()
            res.status(204).end();
        }else{
            res.status(403)
            .json({error:{message:"You are Not authorized to delete this course"}})
        }
        
    }else{
        res.status(404)
        .json({error : {message:`Course with id of ${req.params.id} not Found`}})
    }
}))

module.exports = router