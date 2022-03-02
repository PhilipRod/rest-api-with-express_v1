const auth = require('basic-auth');
const bcrypt = require('bcrypt')
const User = require('../models').User

const authenticateUser = async (req,res,next)=>{
    const credentials = auth(req)

    if (credentials){
        const user = await User.findOne({where:{emailAddress : credentials.name}})

        if (user){
            const authenticated = bcrypt.compareSync(credentials.pass, user.password)
            if(authenticated){
                req.currentUser = user;
            }else{

            }
        }else{

        }

    }else{

    }
    next()
}

module.exports = authenticateUser;