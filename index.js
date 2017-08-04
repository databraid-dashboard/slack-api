require('dotenv').config();
const express    = require('express');
const path       = require('path');
const bodyParser = require('body-parser');
const socket     = require('socket.io');
const slack      = require('./routes/slack');
const index      = require('./routes/index');


const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/slack', slack.router);
app.use('/', index);


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
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

const server = app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Express server listening on port ${PORT}`);
});

var io = socket(server);

io.on('connection', function(socket){
  /* eslint-disable no-console */
  console.log(`Made socket connection [${socket.id}]`);
});

slack.setEvents(io);

module.exports = app;
