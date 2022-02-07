const jwt = require('jsonwebtoken')
const config = require('../Config/config.json')
const { createErrorResponse } = require('./errorHandler')

const jwtSign = (payload) =>{
    return jwt.sign(payload,config.jwt_secret_key,{expiresIn:'30m'})
}

const verifyToken = (req,res,next)=>{
    const token = req.rawHeaders[1].split(" ")[1]

    if(!token){
        let err = new Error()
        err.message = "Token not found"
        let errorInstance = createErrorResponse(403,"Forbidden",err)
        return next(errorInstance)
    }
    
    try{
        const decoded = jwt.verify(token,config.jwt_secret_key)
        req.userEmail = decoded.email
        next()
    }catch(err){
        let errorInstance = createErrorResponse(401,"Unauthorized",err)
        next(errorInstance)
    }
}

module.exports = {
    jwtSign,
    verifyToken
}