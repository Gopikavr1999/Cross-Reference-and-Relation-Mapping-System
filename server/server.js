const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const route = require("./routes/route") 

const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
const mongoURI = 'mongodb+srv://dev1:policy@cluster0.aopko.mongodb.net/P4US_MASTERS'
// const mongoURI = 'mongodb+srv://gopika:policy@cluster0.tfg5cbi.mongodb.net/P4US_MASTERS';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 50000, 
    connectTimeoutMS: 200000,
    socketTimeoutMS: 200000,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

// Sample route
app.get('/api', (req, res) => {
  res.json({ message: 'Hello upload your file!' });
});

//routes
app.use("/",route)

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
