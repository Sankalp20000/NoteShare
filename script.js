const File = require('./models/file');
const fs = require('fs');
const connectDB = require('./config/db');
connectDB();

async function deleteData() {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // subtract 24 hours from current time(in ms)
    // Add a timeout to the database query
    const timeout = setTimeout(() => {
        console.log('No files older than pastDate found. Exiting...');
        process.exit(0);
    }, 10000); // Timeout after 10 seconds 
    
    const files = await File.find({ createdAt: {$lt: pastDate}});
    if(files.length) {
        for(const file of files) {
            try {
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`successfully deleted ${file.filename}`)
            } catch(err) {
                console.log(`error while deleteing file ${err}`)
            }
        }
        console.log('Job done!');
    }
}

deleteData().then(process.exit);