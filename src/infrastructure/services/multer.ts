// import multer from 'multer'
// import path from 'path'

// const storage = multer.diskStorage({  
//     destination:(req,file,cb)=>{
//         cb(null,path.join(__dirname,'../../public'))
//     },
//     filename:(req,file,cb)=>{
//         cb(null,Date.now() +"-"+file.originalname)
//     }
    
// })

// const upload = multer({storage:storage})

// export default upload

import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Define the path for storing the uploads
const uploadPath = path.join(__dirname, '../../public');

// Ensure the upload directory exists
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("File upload reached! Saving to:", uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        console.log("Uploading file:", file.originalname);
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

export default upload;
