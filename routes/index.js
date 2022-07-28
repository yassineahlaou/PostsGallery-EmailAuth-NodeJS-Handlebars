const express = require("express")
const { ensureAuth, ensureGuest } = require("../middleware/auth")
const router = express.Router()
const bcrypt =  require('bcryptjs')

const  jwt =  require('jsonwebtoken')
const {auth, ghest} = require('./verifyToken')

const {registrationValidation , loginValidation} = require('../validation')
const UserByEmail = require("../models/UserByEmail")
const Post = require ('../models/Post')




//login & landing page
/*router.get('/',  ensureGuest, (req, res) => {
    res.render('login' , {layout:'login',}) //layout is an object
})*/

router.get('/',  ghest, (req, res) => {
    res.render('login' , {layout:'login',}) //layout is an object
})
//register

router.get('/register', (req, res) => {
    res.render('authByemail/register') //layout is an object
})

router.post('/', async (req, res) => {

    //data validation
    const {error} = registrationValidation(req.body)
    if (error){return res.status(400).send(error.details[0].message)}
  
    //check if user is already in database
  
    const emailExist = await UserByEmail.findOne({email: req.body.email})
    if (emailExist) {return res.status(400).send('This email already exists!')}
  
    //hash the password
  
    const salt = await bcrypt.genSalt(10)
  
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
  
    //create new user
    
    const userbyemail = new UserByEmail ({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
  
    })
  
    //save user
    try {
        const savedUser = await userbyemail.save()
        res.redirect('/login')
        //res.send({user: user._id})
        
    } catch (error) {
        res.status(400).send(error)
  
    }
  })

  //loging

  router.get('/login',  (req, res) => {
    res.render('authByemail/loginbyemail') //layout is an object
  })

  router.post('/processlogin', async (req, res) => {
    //data validation
    const {error} = loginValidation(req.body)
    if (error){return res.status(400).send(error.details[0].message)}

    //check if user is already in database

    const userLog = await UserByEmail.findOne({email: req.body.email})
    if (!userLog) {return res.status(400).send(' email not found!')}

    //check if password is correct 
    const passwordMatched = await bcrypt.compare(req.body.password, userLog.password)
    if (!passwordMatched){return res.status(400).send(' passwored don\'t match')}
    

    //create token jwt , as a security mesure that the user is logged in

    const token = jwt.sign({_id: userLog._id}, process.env.TOKEN_SECRET)
    res.cookie('authtoken', token).redirect('/dashboard')
    

})


//dashboard page



/*router.get('/dashboard', ensureAuth,  async (req, res) => {
    try {
        const posts = await Post.find({user: req.user.id}).lean()//in order to pass in data to a template to loop throught it
        res.render('dashboard', {
            name: req.user.firstName,
            posts
        })
         
    } catch (error) {
        console.eroor(error)
        res.render('error/500')
    }
    
})*/


    router.get('/dashboard', auth,  async (req,res) =>
{
    try {

        const userLoggedIn = await UserByEmail.findById( req.userbyemail._id )
        const posts = await Post.find({userbyemail: req.userbyemail._id}).lean()
        res.render('dashboard', {
            name: userLoggedIn.name,
            posts
        })
        
    }
    
    catch (error){
        console.error(error)
        res.render('error/500')
    }
})
//logout
router.get('/signout',  auth,  async (req,res) =>
{
    
    console.log('Cookies: ', req.cookies)
    
    
    res.clearCookie('authtoken')
    res.redirect('/');
    
   
    
})


module.exports = router