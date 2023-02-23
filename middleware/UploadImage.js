const multer = require('multer')
const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
    destination : (req, File, callback) => {
        const dir = "./Uploads"

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }

        callback(null, dir)
    },
    filename : (req, file, callback)=>{
        callback(null, file.fieldname+'-'+Date.now()+ path.extname(file.originalname))
        // console.log(file.filename)
    },
    // limits : {
    //     fileSize : 100*100
    // }
})

const upload = multer({storage : storage})
module.exports = upload