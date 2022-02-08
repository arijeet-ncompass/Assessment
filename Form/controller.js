const { fetchResults } = require('../Utilities/db')
const { createErrorResponse } = require('../Utilities/errorHandler')
const { createResponse } = require('../Utilities/responseHandler')
const md5 = require('md5')
const { jwtSign } = require('../Utilities/auth') 

const signIn = async(req,res,next) =>{
    try{
        const { email , password } = req.body
        let passwordDigest = md5(password)

        let sqlQuery = `SELECT EXISTS (SELECT user.email from user where user.email = (?) and user.password = (?)) as userSignIn`
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
        let sqlQuery = `SELECT user.userId from user where user.email = (?)`
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
        let sqlQuery = `SELECT user.userId from user where user.email = (?)`
        let sqlValue = [email]
        let result = await fetchResults(sqlQuery,sqlValue)

        let userId = result[0].userId
        let postId = req.query.postId
        let postUpdateColumn = {...req.query} // contains columns of Post table and new values for update
        delete postUpdateColumn["postId"]
        
        sqlQuery = `UPDATE post set ? where post.postId = (?) and post.userId = (?)`
        sqlValue = [postUpdateColumn,postId,userId]
        result = await fetchResults(sqlQuery,sqlValue)

        if(result.affectedRows===0){
            let err = new Error()
            err.message = `Unauthorised to view the postId = ${postId}`
            let errorInstance = createErrorResponse(403,"Unauthorised",err)
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
        let sqlQuery = `SELECT user.userId from user where user.email = (?)`
        let sqlValue = [email]
        let result = await fetchResults(sqlQuery,sqlValue)

        let userId = result[0].userId
        let { postId } = req.query
        sqlQuery = `DELETE from post where post.postId = (?) and post.userId = (?)`
        sqlValue = [postId,userId]
        result = await fetchResults(sqlQuery,sqlValue)

        if(result.affectedRows===0){
            let err = new Error()
            err.message = `Unauthorised to view the postId = ${postId}`
            let errorInstance = createErrorResponse(403,"Unauthorised",err)
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
        let sqlQuery = `SELECT user.userId from user where user.email = (?)`
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
        let sqlQuery = `SELECT post.postId from post where post.title = ?`
        let sqlValue = [title]
        let result = await fetchResults(sqlQuery,sqlValue)

        let postId = result[0].postId
        let answerColumnNames = [] // column names in answer table
        for(let i=1;i<Object.keys(req.query).length;i++) answerColumnNames.push(`answer.${Object.keys(req.query)[i]}`)
        let results
        if(answerColumnNames.length === 0){
            sqlQuery = "SELECT answer.answerId,answer.userId,answer.postId,answer.answer,answer.createdTime from answer where answer.postId = ? order by answer.createdTime desc"
            results = await fetchResults(sqlQuery,[postId])
        }
        else{
            sqlQuery = 'SELECT ?? from answer where answer.postId = ? order by answer.createdTime desc'
            results = await fetchResults(sqlQuery,[answerColumnNames,postId])
        }

        if(results.length===0){
            let err = new Error()
            err.message = "No answer available"
            let errorInstance = createErrorResponse(404,"Not found",err)
            return next(errorInstance)
        }
        

        let response = createResponse(results,'Read all Data')
        res.status(200).send(response)

    }catch(err){
        let errorInstance = createErrorResponse(500,"Internal Server Error",err)
        next(errorInstance)
    }
}


const displayPost = async(req,res,next) =>{
    try{
        let page = req.query.page
        page = Number(page)
        let recordsPerPage = 2
        offsetValue = (page-1)*recordsPerPage

        let sqlQuery = "SELECT post.postId,post.userId,post.title,post.description,post.tag,post.createdTime from post where (post.title like ? or ? IS NULL) and (post.tag like ? or ? IS NULL) order by post.createdTime desc limit ? offset ?"
        let title = req.query.title
        let tag = req.query.tag
        if (title === undefined) title = null
        else title = `%${title}%`
        if(tag === undefined) tag = null
        else tag = `%${tag}%`
        let sqlValue = [title,title,tag,tag,recordsPerPage,offsetValue]
        
        let results = await fetchResults(sqlQuery,sqlValue)
        if(results.length===0){
            let err = new Error()
            err.message = "No data"
            let errorInstance = createErrorResponse(404,"Not found",err)
            return next(errorInstance)
        }

        let response = createResponse(results,'Read all Data')
        res.status(200).send(response)

    }catch(err){
        console.log(err)
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
    displayAnswer,
    displayPost
}