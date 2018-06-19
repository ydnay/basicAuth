require('dotenv').config();

const express      = require("express");
const path         = require("path");
const logger       = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser   = require("body-parser");
const mongoose     = require("mongoose");
const app          = express();
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const Recaptcha = require('express-recaptcha').Recaptcha;
//import Recaptcha from 'express-recaptcha'
const recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY');
const session    = require("express-session");
const MongoStore = require("connect-mongo")(session);

mongoose.Promise = Promise;
mongoose
  .connect('mongodb://localhost/basic-auth', {useMongoClient: true})
  .then(() => {
    console.log('Connected to Mongo!')
  }).catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

// const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: "basic-auth-secret",
  cookie: { maxAge: 60000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

// Express View engine setup
app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// Routes
const authRoutes = require('./routes/auth-routes');
app.use('/', authRoutes);
const index = require('./routes/index');
app.use('/', index);
const siteRoutes = require('./routes/site-routes');
app.use('/', siteRoutes);

module.exports = app;
