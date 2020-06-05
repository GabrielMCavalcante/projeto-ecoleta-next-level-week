import express from 'express'

// Celebrate validation
import { celebrate, Segments, Joi } from 'celebrate'

// Image upload
import multer from 'multer'

// Multer config
import multerConfig from './config/multer'

// database connection
import knex from './database/connection'

// PointsController
import PointsController from './controllers/PointsController'
const pointsController = new PointsController()

// ItemsController
import ItemsController from './controllers/ItemsController'
const itemsController = new ItemsController()

// Setting express Router instance
const routes = express.Router()

// Setting image upload
const upload = multer(multerConfig)

// Lists all available items in database
routes.get('/items', itemsController.index)

// Creates a new collect point
routes.post(
    '/points',
    upload.single('image'),
    celebrate({
        [Segments.BODY]: Joi.object().keys({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            whatsapp: Joi.number().integer().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().min(2).max(2).required(),
            items: Joi.string().regex(/(.+?)(?:,|$)/).required()
        })
    }, { abortEarly: false }),
    pointsController.create
)

// Lists all collect points
routes.get('/points', pointsController.index)

// Shows specified collect point
routes.get('/points/:id', pointsController.show)

// Deletes specified collect point
routes.delete('/points/:id', pointsController.delete)

// [DEV] Deletes specified relationship of point-items
routes.delete('/points/reset/:id', async (req, res) => {
    const deleteID = req.params.id
    await knex('point_items').where('point_id', deleteID).del()
    return res.json({ message: 'success' })
})

export default routes