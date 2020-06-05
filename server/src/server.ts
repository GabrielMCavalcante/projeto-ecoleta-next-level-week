// Importing express
import express from 'express'

// Celebrate errors
import { errors } from 'celebrate'

// Importing CORS
import cors from 'cors'

// Importing path
import path from 'path'

// Importing routes
import routes from './routes'

// Setting app to an express instance
const app = express()

// Setting default port
const PORT = 3333

// Setting app to use cors
app.use(cors())

// Setting app to use json in responses
app.use(express.json())

// Setting app to use imported routes
app.use(routes)

// Loading static images to access them in given path
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

// Loading app to use celebrate error handler
app.use(errors())

// Server listener
app.listen(PORT, ()=>{ 
    console.log('Server started at port: ', PORT)
})