require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const session = require("express-session");


const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcryptjs')

const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dataRouter = require('./routes/data');
const apiAthleteRouter = require('./routes/api_athletes');
const apiUserRouter = require('./routes/api_users');

const User = require('./models/user')

const app = express();
app.use(cors()); // Enable CORS for all routes

// Set up mongoose connection
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

// Connect to the database when the app starts
connectToMongoDB();

// ^Passport related, insert before view set up
// This function will be called when we use the passport.authenticate() function
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password)
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      };
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

// Function to create a cookie
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Function to decode a cookie
// Add const User = require('./models/user')
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

// Make sure to add SESSION_SECRET in .env
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Make currentUser globally available including the views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ^-----


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/data', dataRouter);
app.use('/api/athletes', apiAthleteRouter);
app.use('/api/users', apiUserRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
