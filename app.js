require('dotenv').config();
const express = require('express');
const createError = require('http-errors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dataRouter = require('./routes/data');
const apiAthleteRouter = require('./routes/api_athletes');
const apiUserRouter = require('./routes/api_users');

const app = express();
app.use(cors()); // Enable CORS for all routes

// Set up mongoose connection and monitor errors
const { connectToMongoDB } = require('./utils/mongooseConnection');

// Passport related, insert before view set up
const configPassport = require('./utils/configPassport');

// Global error handler
const globalErrorHandler = require('./utils/globalErrorHandler');

connectToMongoDB();

// Make sure to add SESSION_SECRET in .env
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Place after the session middleware
configPassport();
app.use(passport.initialize());
app.use(passport.session());

// Make currentUser globally available including the views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

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

// The last middleware to execute, the global error handler
app.use(globalErrorHandler);

module.exports = app;
