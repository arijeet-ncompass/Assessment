const express = require('express')
const { signIn,createPost,updatePost,deletePost } = require('./controller')
const { validateSignIn,validateCreatePost,validateUpdatePost,validateDeletePost } = require('./validation')
const { verifyToken } = require('../Utilities/auth')
const { errorHandleMiddleware } = require('../Utilities/errorHandler')

const formRouter = express.Router()

formRouter.post('/signin',validateSignIn,signIn)
formRouter.post('/createpost',verifyToken,validateCreatePost,createPost)
formRouter.put('/updatepost',verifyToken,validateUpdatePost,updatePost)
formRouter.delete('/deletepost',verifyToken,validateDeletePost,deletePost)
formRouter.use(errorHandleMiddleware)

module.exports = formRouter