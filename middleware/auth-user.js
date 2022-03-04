const auth = require('basic-auth');
const bcrypt = require('bcrypt')
const User = require('../models').User

const authenticateUser = async (req,res,next)=>{
    const credentials = auth(req)
    let message;

    if (credentials){
        const user = await User.findOne({where:{emailAddress : credentials.name}})

        if (user){
            const authenticated = bcrypt.compareSync(credentials.pass, user.password)
            if(authenticated){
                console.log(`Authentication successful for account: ${user.emailAddress}`);
                req.currentUser = user;
            }else{
                message = `Authentication failure for username: ${user.username}`;
            }
        }else{
            message = `User not found for ${credentials.name}`
        }

    }else{
        message = 'Auth header not found';
    }
    next()
}

module.exports = authenticateUser;