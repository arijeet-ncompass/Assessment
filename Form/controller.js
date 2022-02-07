const { fetchResults } = require('../Utilities/db')
const { createErrorResponse } = require('../Utilities/errorHandler')
const { createResponse } = require('../Utilities/responseHandler')
const md5 = require('md5')
const { jwtSign } = require('../Utilities/auth') 

const signIn = async(req,res,next) =>{
    try{
        const { email , password } = req.body
        let passwordDigest = md5(password)

        let sqlQuery = `SELECT EXISTS (SELECT email from user where email = (?) and password = (?)) as userSignIn`
        let sqlValue = [email,passwordDigest]
        let result = await fetchResults(sqlQuery,sqlValue)

        if(result[0].userSignIn === 0){
            let err = new Error()
            err.message = "Please check email and password"
            let errorInstance = createErrorResponse(404,"Not Found",err)
            return next(errorInstance)
        }

        const token = jwtSign({email})
        let response = createResponse(result[0].present,' SignIn Successful',token)
        res.status(200).send(response)

    }catch(err){
        let errorInstance = createErrorResponse(500,"Internal Server Error",err)
        next(errorInstance)
    }
}


const createPost = async(req,res,next) =>{
    try{
        let email = req.userEmail
        let sqlQuery = `SELECT userId from user where email = (?)`
        let sqlValue = [email]
        let result = await fetchResults(sqlQuery,sqlValue)

        let userId = result[0].userId
        let { title,description,tag }= req.body
        sqlQuery = `INSERT INTO post (userId,title,description,tag) values ?`
        sqlValue = [[[userId,title,description,tag]]]
        result = await fetchResults(sqlQuery,sqlValue)

        let response = createResponse(result.affectedRows,`${result.affectedRows} row/s inserted`)
        res.status(200).send(response)

    }catch(err){
        let errorInstance = createErrorResponse(500,"Internal Server Error",err)
        next(errorInstance)
    }
    
}


const updatePost = async(req,res,next) =>{
    try{
        let email = req.userEmail
        let sqlQuery = `SELECT userId from user where email = (?)`
        let sqlValue = [email]
        let result = await fetchResults(sqlQuery,sqlValue)

        let userId = result[0].userId
        let { postId } = req.query
        let columnName = Object.keys(req.body)[0]
        let columnValue = Object.values(req.body)[0]
        sqlQuery = `UPDATE post set ${columnName} = (?) where postId = (?) and userId = (?)`
        sqlValue = [columnValue,postId,userId]
        result = await fetchResults(sqlQuery,sqlValue)

        if(result.affectedRows===0){
            let err = new Error()
            err.message = "Wrong postId"
            let errorInstance = createErrorResponse(404,"Not Found",err)
            return next(errorInstance)
        }

        let response = createResponse(result.affectedRows,`${result.affectedRows} row/s updated`)
        res.status(200).send(response)

    }catch(err){
        let errorInstance = createErrorResponse(500,"Internal Server Error",err)
        next(errorInstance)
    }
}


const deletePost = async(req,res,next) =>{
    try{
        let email = req.userEmail
        let sqlQuery = `SELECT userId from user where email = (?)`
        let sqlValue = [email]
        let result = await fetchResults(sqlQuery,sqlValue)

        let userId = result[0].userId
        let { postId } = req.query
        sqlQuery = `DELETE from post where postId = (?) and userId = (?)`
        sqlValue = [postId,userId]
        result = await fetchResults(sqlQuery,sqlValue)

        if(result.affectedRows===0){
            let err = new Error()
            err.message = "Wrong postId"
            let errorInstance = createErrorResponse(404,"Not Found",err)
            return next(errorInstance)
        }

        let response = createResponse(result.affectedRows,`${result.affectedRows} row/s deleted`)
        res.status(200).send(response)

    }catch(err){
        let errorInstance = createErrorResponse(500,"Internal Server Error",err)
        next(errorInstance)
    }
}





module.exports = {
    signIn,
    createPost,
    updatePost,
    deletePost
}