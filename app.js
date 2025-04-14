var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
let { CreateSuccessResponse, CreateErrorResponse } = require('./utils/responseHandler')
let constants = require("./utils/constants")
let cors = require('cors')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'], // Allow Vue dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}))

mongoose.connect("mongodb://127.0.0.1:27017/S6");
mongoose.connection.on('connected',()=>{
  console.log("connected");
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(constants.SECRET_KEY_COOKIE));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', require('./routes/auth'));
app.use('/menus', require('./routes/menus'));
app.use('/roles', require('./routes/roles'));
app.use('/products', require('./routes/products'));
app.use('/categories', require('./routes/categories'));

// Add a simple test route to check if the server is responding
app.get('/api/healthcheck', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  CreateErrorResponse(res, err.status||500, err.message)
});


//

module.exports = app;
