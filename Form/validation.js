const Joi = require("joi")
const { createErrorResponse } = require('../Utilities/errorHandler')

const validateSignIn = async(req,res,next) =>{
    const Schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })

    let validationBody = Schema.validate(req.body,{ abortEarly: false })
    
    if(validationBody.error){
        let errorInstance = createErrorResponse(400,"Bad Request",validationBody.error)
        return next(errorInstance)
    }
    else{
        next()
    }
} 

const validateCreatePost = async(req,res,next) =>{
    const Schema = Joi.object({
        title: Joi.string().min(1).required(),
        description: Joi.string().min(1).required(),
        tag:Joi.string().min(0)
    })

    let validationBody= Schema.validate(req.body,{ abortEarly: false })
    
    if(validationBody.error){
        let errorInstance = createErrorResponse(400,"Bad Request",validationBody.error)
        return next(errorInstance)
    }
    else{
        next()
    }
}


const validateUpdatePost = async(req,res,next) =>{
    const Schema = Joi.object({
        title: Joi.string().min(1),
        description: Joi.string().min(1),
        tag:Joi.string().min(0),
        postId:Joi.number()
    })

    let validationQuery = Schema.validate(req.query,{ abortEarly: false })

    if(validationQuery.error){
        let errorInstance = createErrorResponse(400,"Bad Request",validationQuery.error)
        return next(errorInstance)
    }

    else{
        next()
    }
}


const validateDeletePost = async(req,res,next) =>{
    const Schema = Joi.object({
        postId:Joi.number().required()
    })

    let validationQuery = Schema.validate(req.query)

    if(validationQuery.error){
        let errorInstance=createErrorResponse(400,"Bad Request",validationQuery.error)
        return next(errorInstance)
    }

    else{
        next()
    }
}

const validateAnswerPost = async(req,res,next) =>{
    const Schema = Joi.object({
        postId:Joi.number().strict().required(),
        answer: Joi.string().required()
    })

    let validationBody = Schema.validate(req.body)

    if(validationBody.error){
        let errorInstance=createErrorResponse(400,"Bad Request",validationBody.error)
        return next(errorInstance)
    }

    else{
        next()
    }
}


const validateDisplayAnswer = async(req,res,next)=>{
    const Schema = Joi.object({
        title: Joi.string().min(1),
    }).unknown(true)
    let validationQuery = Schema.validate(req.query)
    if(validationQuery.error){
        let errorInstance=createErrorResponse(400,"Bad Request",validationQuery.error)
        return next(errorInstance)
    }
    else{
        next()
    }
}





module.exports = {
    validateSignIn,
    validateCreatePost,
    validateUpdatePost,
    validateDeletePost,
    validateAnswerPost,
    validateDisplayAnswer
}