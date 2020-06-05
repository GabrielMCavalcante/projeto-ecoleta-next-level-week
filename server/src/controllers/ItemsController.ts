// Request and Response types
import { Request, Response } from 'express'

// Database connection
import knex from '../database/connection'

// Response handler
import resHandlers from './ResponseHandlers'

class ItemsController {
    // List all stored items
    async index(req: Request, res: Response) {
        knex('items').select('*')
            .then(items => {
                if (items.length === 0)
                    return resHandlers.setError(res, 'No stored items found')
                else {
                    const serializedItems = items.map(item => {
                        return {
                            id: item.id,
                            title: item.title,
                            image_url: `http://192.168.0.28:3333/uploads/${item.image}`
                        }
                    })
                    return resHandlers.setSuccess(res, serializedItems)
                }
            })
            .catch(err => resHandlers.setError(res, err.message, 400))
    }
}

export default ItemsController