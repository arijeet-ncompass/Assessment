const express = require('express')
const { signIn,createPost,updatePost,deletePost,answerPost,displayAnswer,displayPost} = require('./controller')
const { validateSignIn,validateCreatePost,validateUpdatePost,validateDeletePost,validateAnswerPost,validateDisplayAnswer,validateDisplayPost} = require('./validation')
const { verifyToken } = require('../Utilities/auth')
const { errorHandleMiddleware } = require('../Utilities/errorHandler')

const formRouter = express.Router()

formRouter.post('/signin',validateSignIn,signIn)
formRouter.post('/createpost',verifyToken,validateCreatePost,createPost)
formRouter.put('/updatepost',verifyToken,validateUpdatePost,updatePost)
formRouter.delete('/deletepost',verifyToken,validateDeletePost,deletePost)
formRouter.post('/answerpost',verifyToken,validateAnswerPost,answerPost)
formRouter.get('/getanswer',validateDisplayAnswer,displayAnswer)
formRouter.get('/getpost',validateDisplayPost,displayPost)

formRouter.use(errorHandleMiddleware)

module.exports = formRouter