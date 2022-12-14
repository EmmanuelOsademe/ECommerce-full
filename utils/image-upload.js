const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const upload = multer(
    {
        storage: multer.diskStorage({}),
        fileFilter: (req, file, cb) =>{
            const ext = path.extname(file.originalname);
            if(['.jpg', '.jpeg', '.png'].indexOf(ext) === -1){
                cb(new Error('File type not supported'));
                return;
            }
            req.body.image = file.originalname;
            console.log(req.body.image);
            cb(null, true);
        }
    }
)

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    }
);

module.exports = {upload, cloudinary};