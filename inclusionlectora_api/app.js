var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Manejadores globales de errores no manejados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de CORS
app.use(
  cors({
    origin: "*"
  })
);

// Rutas
app.use('/', indexRouter);
app.use('/api', usersRouter);

// Manejo de errores 404
app.use(function(req, res, next) {
  next(createError(404));
});
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      msg: `Archivo demasiado grande. Límite permitido: ${maxFileSize / (1024 * 1024)} MB.`,
      code: 413,
    });
  }

  return res.status(500).json({
    msg: 'Error interno del servidor',
    code: 500,
  });
});


// Manejador de errores
app.use(function(err, req, res, next) {
  // Configura los mensajes de error según el entorno
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderiza la página de error
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
