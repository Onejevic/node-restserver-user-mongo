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
//urlDB = 'mongodb://localhost:27017/cafe';
//-------------------------------------------------------------------------------------
//creamos un if para validar si estamos conectandonos de manera local o remota
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://ejemplo:sherlock067@cluster0-klcgd.mongodb.net/cafe';
}
//para probarlo directamente le asignamos la url dada por mongo atlas
// urlDB = process.env.MONGO_URI;

//estas serían las url para las bd
//mongodb://localhost:27017/cafe
//mongodb+srv://<username>:<password>@cluster0-klcgd.mongodb.net/test
//------------------------------------------------------------------------------------
process.env.URLDB = urlDB;
//------------------------------------------------------------------------------------
//vencimiento del token
// esta variable la colocaré en el método de sign para clarificar el tiempo de vencimiento
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
//------------------------------------------------------------------------------------
//seed de autenticación
//esto lo creo con el fin de manejar la variable de productivo o de desarrollo, por defecto
//la variable seed ya debí haberla creado en el servidor, para el ejemplo heroku.
process.env.SEED = process.env.SEED || 'seed-desarrollo';
//------------------------------------------------------------------------------------
//GOOGLE CLIENT ID
//Creamos una variable global con el fin de almacenar el id creado por en la consola developer
//que nos ayudará a autenticarnos.
process.env.CLIENT_ID = process.env.CLIENT_ID || '112340979272-ddlv3hrspf2dh5pq7b5ufmu8ea78c5rk.apps.googleusercontent.com';