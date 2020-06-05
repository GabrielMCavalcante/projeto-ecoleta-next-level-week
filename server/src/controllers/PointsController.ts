// Request and Response types
import { Request, Response } from 'express'

// Database connection
import knex from '../database/connection'

// Response handler
import resHandlers from './ResponseHandlers'

class PointsController {
    // Create new collection point method
    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude: +latitude,
            longitude: +longitude,
            city,
            uf
        }

        let point_id: number

        knex.transaction(async trx => {
            const insertedIds = await trx('points').insert(point)

            point_id = insertedIds[0]

            const pointItems = items
                .split(',')
                .map((item: string) => +item.trim())
                .map((item_id: number) => {
                    return { item_id, point_id }
                })

            await trx('point_items').insert(pointItems)
        })
            .then(() => resHandlers.setSuccess(res, { point_id, ...point }))
            .catch(err => resHandlers.setError(res, err.message, 400))
    }

    // List all stored collection points
    async index(req: Request, res: Response) {
        // const { city, uf, items }
        const { city, uf, items } = req.query
        const parsedItems = String(items).split(',').map(item => +item.trim())

        let fetchedPoints

        if (items !== '') {
            fetchedPoints = await knex('points')
                .join('point_items', 'points.id', '=', 'point_items.point_id')
                .whereIn('point_items.item_id', parsedItems)
                .where('city', String(city))
                .where('uf', String(uf))
                .distinct()
                .select('points.*')
        }
        else {
            fetchedPoints = await knex('points')
                .where('city', String(city))
                .where('uf', String(uf))
                .select('points.*')

        }

        const serializedPoints = fetchedPoints.map(point => {
            return {
                ...point,
                image_url: `http://192.168.0.28:3333/uploads/${point.image}`
            }
        })

        resHandlers.setSuccess(res, serializedPoints)
    }

    // Show specified stored collection point
    async show(req: Request, res: Response) {
        const { id } = req.params
        return knex('points').where('id', id).select('*').first()
            .then(point => {
                knex('items')
                    .join('point_items', 'items.id', '=', 'point_items.item_id')
                    .where('point_items.point_id', id)
                    .select('items.title')
                    .then(items => {
                        const serializedPoint = {
                            ...point,
                            image_url: `http://192.168.0.28:3333/uploads/${point.image}`
                        }
                        resHandlers.setSuccess(res, { ...serializedPoint, items })
                    })
                    .catch(err => resHandlers.setError(res, err.message, 400))
            }).catch(err => resHandlers.setError(res, err.message, 400))
    }

    // [DEV] Delete a stored collection point
    async delete(req: Request, res: Response) {
        const delete_id = req.params.id
        await knex('points').where('id', delete_id).del()
            .then(() => resHandlers.setSuccess(res, { deletedPointWithId: delete_id }))
            .catch(err => resHandlers.setError(res, err.message, 400))
    }
}

export default PointsController