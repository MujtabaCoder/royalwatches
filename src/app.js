require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const allRoutes = require('./routes/allRoutes');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); 
const connectDB = require('./db'); 
const session = require('express-session');
const connectMongo = require('connect-mongo');

const app = express();

connectDB();


app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(session({
    secret: '123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge:  24 * 60 * 60 * 1000 }, 
    store: connectMongo.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions', 
    }),
}));

app.use((req,res,next)=>{
    res.set('Cache-Control','no-store, no-cache,must-revalidate,private')
   res.setHeader('Expires', '-1')
   res.setHeader('pragma','no-cache')
    next();
})


app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session && req.session.userId ? true : false;
    next();
  });
app.use(allRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
