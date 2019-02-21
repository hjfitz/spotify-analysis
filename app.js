const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const app = express();

app.use(session({
  store: new MongoDBStore({
    uri: process.env.DATABASE_URL,
    collection: 'mySessions',
  }),
  secret: 'supersecretbetternotpushthistogithub!!!!',
}));

const envLoc = path.join(process.cwd(), '.env');


if (fs.existsSync(envLoc)) {
  const lines = fs.readFileSync(envLoc).toString().split('\n');
  lines.forEach((line) => {
    const [key, ...rest] = line.split('=');
    const val = rest.join('=');
    console.log(`setting [${key}] as [${val}]`);
    process.env[key] = val;
  });
}

// pull in routes after session is applied
const indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
