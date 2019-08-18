//------------------------------------------------------------------------------------
//CONFIGURACIÓN PUERTO
//Esto se realiza con el fin de que si estamos en desarrollo
//maneje automáticamente el puerto 3000, sin embargo
//si pasaramos el proyecto a heroku no tendríamos que configurar nada
//ya que el tomará por defecto el valor que tiene configurado process.env.PORT.
process.env.PORT = process.env.PORT || 3000;
//------------------------------------------------------------------------------------
//CONFIGURACIÓN PUERTO BD
//Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'

//bd
let urlDB;

//creamos un if para validar si estamos conectandonos de manera local o remota
// if (process.env.NODE_ENV === 'dev') {
//     urlDB = 'mongodb://localhost:27017/cafe';
// } else {
//     urlDB = 'mongodb+srv://ejemplo:sherlock067@cluster0-klcgd.mongodb.net/cafe';
// }

//para probarlo directamente le asignamos la url dada por mongo atlas
urlDB = 'mongodb+srv://ejemplo:sherlock067@cluster0-klcgd.mongodb.net/cafe';

//estas serían las url para las bd
//mongodb://localhost:27017/cafe
//mongodb+srv://<username>:<password>@cluster0-klcgd.mongodb.net/test
//------------------------------------------------------------------------------------
process.env.URLDB = urlDB;