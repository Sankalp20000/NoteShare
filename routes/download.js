const router = require('express').Router();
const File = require('../models/file');

router.get('/:uuid', async (req, res) => {
   // Extract link and get file from storage send download stream 
   const file = await File.findOne({ uuid: req.params.uuid });
   // Link expired
   if(!file) {
        return res.render('download', { error: 'Link has been expired.'});
   } 
//    const response = await file.save();
   const filePath = `${__dirname}/../${file.path}`;
   res.download(filePath);
});


module.exports = router;

// http://locahost:3000/files/download/f0da8e73-45e8-452b-a6fa-68e8a7221540