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
        let postId = req.query.postId
        let columnName = Object.keys(req.query)[1]
        let columnValue = Object.values(req.query)[1]
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


const answerPost = async(req,res,next) =>{
    try{
        let email = req.userEmail
        let sqlQuery = `SELECT userId from user where email = (?)`
        let sqlValue = [email]
        let result = await fetchResults(sqlQuery,sqlValue)

        let userId = result[0].userId
        let { postId, answer } = req.body
        sqlQuery = `INSERT into answer (userId, postId, answer) values ?`
        sqlValue = [[[userId,postId,answer]]]
        result = await fetchResults(sqlQuery,sqlValue)

        let response = createResponse(result.affectedRows,`${result.affectedRows} row/s inserted`)
        res.status(200).send(response)

    }catch(err){
        let errorInstance = createErrorResponse(500,"Internal Server Error",err)
        next(errorInstance)
    }
}


const displayAnswer = async(req,res,next) =>{
    try{
        let title = req.query.title
        let sqlQuery = `SELECT postId from post where title = ?`
        let sqlValue = [title]
        let result = await fetchResults(sqlQuery,sqlValue)

        let postId = result[0].postId
        sqlQuery="SELECT "
        let filters = Object.keys(req.query)
        if(filters.length===1) sqlQuery += ("* from answer ")
        else{
            for(let i=1;i<filters.length;i++){
                if(i!=filters.length-1) sqlQuery += (`${filters[i]}, `)
                else sqlQuery += (`${filters[i]} `)
            }
            sqlQuery += ("from answer")
        }
        sqlQuery += (` where postId = (?) order by createdTime desc`)
        sqlValue = [postId]
        result = await fetchResults(sqlQuery,sqlValue)

        let response = createResponse(result,'Read all Data')
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
    deletePost,
    answerPost,
    displayAnswer
}