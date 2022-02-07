const express = require('express')
const compression = require('compression')
const config = require('./Config/config.json')
const formRouter = require('./Form/route')

app = express()

app.use(compression({
    level:6
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/',formRouter)
app.use((req,res)=>{
    res.status(404).send({message:"Not Found",success:false})
})

const port = config.app_config.port
const host = config.app_config.host
app.listen(port,host, ()=>{
    console.log(`App is running at port ${port} and host ${host}`);
})