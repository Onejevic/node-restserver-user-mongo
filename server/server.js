// Importación de los paquetes
require('./config/config'); //Importamos el archivo js que tiene la config del puerto
const express = require('express'); //importamos el archivo express para peticiones http
const mongoose = require('mongoose'); //importamos la librería de moongose para conectarnos a mongo
const app = express(); //ejecutamos express y lo almacenamos en una variable
const bodyParser = require('body-parser'); //importación que me sirve para parsear las peticiones a json
//----------------------------------------------------------------------------
//MIDDLEWARES
//Estos middlewares me ayudan a que la información recibida por una petición 
//codificada es decir puede ser un método post, la podamos tratar o convertir
//en un formato json
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

//para organizar todos los archivos de rutas podemos crear un archivo index donde
//almacenará todos los archivos y después los importo en mi archivo server con
//el fin de tener un orden.
app.use(require('./routes/index'));

//----------------------------------------------------------------------------
//para conectarnos a la base de datos de mongo lo hacemos de la siguiente manera,
//asimismo mando un callback para controlar el error en caso esté corriendo
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, //esto se usa con el fin de quitar los deprecated
    (err, res) => {
        if (err) throw err;
        console.log('Base de datos corriendo en puerto 27017');
    });
//----------------------------------------------------------------------------
app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto ", process.env.PORT);
});