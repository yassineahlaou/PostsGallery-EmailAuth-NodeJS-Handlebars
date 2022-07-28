const  jwt =  require('jsonwebtoken')

module.exports =  { auth : (req, res, next) =>
{
    const token = req.cookies.authtoken
    
    if (!token){return res.status(401).redirect('/')}

    try {

        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.userbyemail = verified
        next()
        
    } catch (error) {
        res.status(400).send('Invalid Token')
    }
},

ghest : (req, res, next) => {
    const token = req.cookies.authtoken
    if (!token){return next()}
    try {

        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.userbyemail = verified
        res.redirect('/dashboard')
        
    } catch (error) {
        res.status(400).send('Invalid Token')
    }



}
}