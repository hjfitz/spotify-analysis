const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');


const app = express();


const MemoryStore = require('memorystore')(session);

app.use(session({
  store: new MemoryStore({
    checkPeriod: 86400000, // prune expired entries every 24h
  }),
  secret: 'keyboard cat',
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

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
