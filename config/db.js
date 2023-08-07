require('dotenv').config(); // to access dotenv variables
const mongoose = require('mongoose'); // mongoose is a popular library to interact with mongodb DB


function connectDB() {
    // Database connection
    if (!process.env.MONGO_CONNECTION_URL) {
        console.error('MONGO_CONNECTION_URL is not defined in the environment variables.');
        return; // Return early if the URL is not defined
    }
    // Database connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL, { 
        useNewUrlParser: true, 
        useUnifiedTopology: true, 
    });

    const connection = mongoose.connection;

    connection.once('open', () => {
        console.log("Database connected");
    }).on('error', (err) => {
        console.log("Connection failed", err);
    });
}
 
module.exports = connectDB;