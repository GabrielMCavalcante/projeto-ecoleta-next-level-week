// Request and Response types
import { Response } from 'express'

export default {
    setSuccess(res: Response, payload: Object, statusCode: number = 200): Object {
        return res.status(statusCode).json(payload)
    },
    setError(res: Response, message: String = 'Error', statusCode: number = 404): Object {
        return res.status(statusCode).json({ error: message })
    }
}