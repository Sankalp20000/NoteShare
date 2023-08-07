const express  = require('express'); // express is a popular library used to build web server
const app = express(); // yarn is a package manager, just like npm 
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(express.json());

const connectDB = require('./config/db.js');
connectDB();

// Cors
const corsOptions = {
    origin: process.env.ALLOWED_CLIENTS.split(',')
}
app.use(cors(corsOptions));

// Template engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// Routes
app.use('/api/files', require('./routes/files'))
app.use('/files', require('./routes/show'));
app.use('/files/download', require('./routes/download')); 

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`) 
}); 