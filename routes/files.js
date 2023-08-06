const router = require('express').Router();
const multer = require('multer'); // multer is framework like express to handle file uploads
const path = require('path');
const File = require('../models/file');
const { v4: uuid4} = require('uuid');


let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 * 100} // max file size: 100mb
}).single('myfile'); // single() for single file

router.post('/', (req, res) => { // POST request from insomnia is received here

    // Store file in uploads folder
    upload(req, res, async (err) => {
        // Validate Request
        if(!req.file) {
            return res.json({error: 'All fields are required'});
        }
        if(err) {
            return res.status(500).send({ error: err.message })
        }
        // Store into Database
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(), 
            path: req.file.path,
            size: req.file.size
        });

        // Response -> Download link of file
        const response = await file.save();
        return res.json({file: `${process.env.APP_BASE_URL}/files/${response.uuid}`});
        // sample download link : http://localhost:3000/files/23l4h23kl4hk2l3-j4h23j52n3
    });
});

router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom} = req.body;
    console.log('Received request:', { uuid, emailTo, emailFrom });
    // validate request
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required except expiry.'});
    }
    // Get data from db 
    try {
      const file = await File.findOne({ uuid: uuid });
      console.log('Found file in database:', file);
      if(file.sender) { // sender already exists, i.e. email already sent before
        return res.status(422).send({ error: 'Email already sent once.'});
      }

      file.sender = emailFrom;
      file.receiver = emailTo;
      const response = await file.save();
      console.log('File saved:', response);

      // Send mail
      const sendMail = require('../services/emailService');
      sendMail({
        from: emailFrom,
        to: emailTo,
        subject: '🚀Your Notes Have Arrived',
        text: `${emailFrom} shared notes with you.`,
        html:   require('../services/emailTemplate')({
                  emailFrom, 
                  downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email` ,
                  size: parseInt(file.size/1000) + ' KB',
                  expires: '24 hours'
                })
      }).then(() => {
        console.log('Email sent successfully');
        return res.json({success: true});
      }).catch(err => {
        console.log('Error in email sending:', err);
        return res.status(500).json({error: 'Error in email sending.'});
      });
    } catch(err) {
        console.log('Error in database operation:', err);
        return res.status(500).send({ error: 'Something went wrong.'});
    }
  
});
      

module.exports = router;