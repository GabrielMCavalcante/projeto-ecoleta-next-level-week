import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import crypto from 'crypto'

export default {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads'),
        filename(req, file, callback) {

            const hash = crypto.randomBytes(6).toString('hex')

            const fileName = `${hash}-${file.originalname}`

            callback(null, fileName)
        }
    }), 
    fileFilter: function (
        req: any, 
        file: Express.Multer.File, 
        callback: FileFilterCallback
    ) {
        switch(file.mimetype){
            case 'image/png':
            case 'image/jpg':
            case 'image/jpeg':
                callback(null, true)
            default: 
                callback(null, false)
        }
    }
}