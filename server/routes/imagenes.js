const express = require('express'); //importo express
const { verificaTokenImg } = require('../middlewares/autenticacion'); // importo el archivo de middleware que contiene la validación del token por la url
const app = express(); //ejecuto express

//estas importaciones no requieren descarga en el npm ya que son propios de node
const fs = require('fs'); //importo filesystem para el manejo de archivos
const path = require('path'); //importo el path para el gestionamiento de rutas

//en esta petición tengo que mandar el token en la url, por ejemplo http://localhost:3000/imagen/productos/asdmpoasdfnlnf?token=123456
//este será validado por el servicio y si no cumple con las condiciones no será accesible a la imagen.
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo; //obtengo el tipo en una variable
    let img = req.params.img; //obtengo la imagen en una variable

    //creo una ruta absoluta para el path de la imagen con las variables creadas anteriormente.
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    //en un if valido si la ruta de la imagen existe, si es así la muestro en el sistema.
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        //creamos la ruta absoluta del archivo estático cuando no haya imágen que mostrar
        //recordemos que el dirname me redirecciona al directorio donde se encuentre el archivo.
        let noImagePath = path.resolve(__dirname, '../assets/noImagen.jpg')
        res.sendFile(noImagePath);
    }
})

module.exports = app; //exportamos la variable app