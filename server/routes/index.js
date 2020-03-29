const express = require('express'); //importamos el archivo express para peticiones http
const app = express(); //ejecutamos express y lo almacenamos en una variable

//realizamos la importación de todas las rutas que tengamos actualmente
app.use(require('./usuario'));
app.use(require('./login'));
app.use(require('./categoria'));
app.use(require('./producto'));

//lo exporto para poderlo usar en el archivo server.js
module.exports = app;