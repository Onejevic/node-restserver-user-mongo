const express = require('express'); //importo express
const fileUpload = require('express-fileupload'); //importo la librería que me ayuda a la descarga y carga de archivos
const Usuario = require('../models/usuario'); //importo los modelos
const Producto = require('../models/producto'); //importo los modelos
const app = express(); //ejecuto express

//estas importaciones no requieren descarga en el npm ya que son propios de node
const fs = require('fs'); //importo filesystem para el borrado de archivos
const path = require('path'); //importo el path para el gestionamiento de rutas

//ejecuto el middleware para las opciones por defecto
app.use(fileUpload());

//creo un servicio tipo put para realizar la petición de carga de archivos mediante el path upload
//asimismo mando dos parámetros que son el tipo y el id que corresponderá si es un producto o usuario
//y el id corresponde al id del elemento almacenado en mongo
app.put('/upload/:tipo/:id', function(req, res) {

    //almaceno en unas variables los valores mandados por url
    let tipo = req.params.tipo;
    let id = req.params.id;

    //En caso de que files esté vacío o la llave de su longitud sea igual a cero mande un status 400
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }
    //creamos una validación con el fin de verificar el valor que manda el usuario en la url, para el 
    //ejemplo solo son válidos los tipos productos y usuarios
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Los tipos permitidos son ' + tiposValidos.join(',')
                }
            });
    }

    //si llega aquí quiere decir que no hubo error por lo cual creo una variable con nombre archivo y almaceno
    //en lo que viene en su propiedad (este es el mismo nombre del campo relacionado en el html)
    let archivo = req.files.archivo;
    //obtenemos el nombre del archivo pero haciendo un split por punto para tener separado la extension con el nombre
    let nombreCortado = archivo.name.split('.');
    //obtengo la última posición del arreglo que es la extensión.
    let extension = nombreCortado[nombreCortado.length - 1];
    // creo un arreglo con las extensiones válidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    //con un if hago la validación, por ejemplo con un indexof valido si el valor de la extensión está incluida en las válidas
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status.json({
            ok: false,
            err: {
                // concatenamos el mensaje con todo lo contenido en el arreglo especificando las extensiones válidas
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(','),
                ext: extension
            }
        });
    }

    //creo un nombre dinámico para asignarselo a la url
    //mas o menos la estructura sería 125s3fasdf-123.jpg
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;


    // ahora en la url mandamos el nombre creado anteriormente, asimismo mando en la misma url
    // el tipo que yo mandé, por lo cual esto lo enlazará a las carpetas creadas y lo guardará en su repositorio
    // correspondiente
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        // en caso halla un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };

        //si está acá quiere decir que todo está bien por lo cual ejecuto la función creada
        //en la parte inferior
        if (tipo === "usuarios") {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });
});

//-------------------------------------------------------------------------------------------------------------
//creo la función para guardar la imagen en el json del usuario y en nuestro repositorio
//la función se llama imagen usuario y recibe por parámetro el id(identificador del usuario correspondiente
//a los almacenados en mongo),res (que es la respuesta de la solicitud y tengo que mandarsela por referencia a
//la función) y el nombreArchivo (corresponde al nombre que le doy a la imagen guardada)
let imagenUsuario = (id, res, nombreArchivo) => {
        //busco mediante el id el usuario
        Usuario.findById(id, (err, usuarioDB) => {
            //en caso halla un error mando un status 500 con el err en formato json
            if (err) {
                //tambien es necesario borrar la imagen cuando salga un error ya que por defecto, de acuerdo
                //a como se creó el código siempre subirá la imagen.
                borrarArchivo(nombreArchivo, 'usuarios');
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //en caso de que el usuario no exista, mando un status 400 con un mensaje personalizado
            if (!usuarioDB) {
                // tambien es necesario borrar la imagen obsoleta cuando salga un error de usuario inexistente
                borrarArchivo(nombreArchivo, 'usuarios');
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no existe'
                    }
                });
            }

            //ejecuto la función de borrar archivo, para el ejemplo es la foto enviada por el usuario
            //borra la obsoleta o antigua.
            borrarArchivo(usuarioDB.img, 'usuarios');

            //si estamos acá, quiere decir que está todo bien por lo cual actualizo el objeto devuelto
            //por el callback y modifico la imagen
            usuarioDB.img = nombreArchivo;

            //posteriormente procedo a salvar la información actualizada con la funcion save
            usuarioDB.save((err, usuarioGuardado) => {
                res.json({
                    ok: true,
                    usuario: usuarioGuardado
                });
            })
        })
    }
    //-------------------------------------------------------------------------------------------------------------
let imagenProducto = (id, res, nombreArchivo) => {
        //busco mediante el id del producto
        Producto.findById(id, (err, productoDB) => {
            //en caso halla un error mando un status 500 con el err en formato json
            if (err) {
                //tambien es necesario borrar la imagen cuando salga un error ya que por defecto, de acuerdo
                //a como se creó el código siempre subirá la imagen.
                borrarArchivo(nombreArchivo, 'productos');
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //en caso de que el producto no exista, mando un status 400 con un mensaje personalizado
            if (!productoDB) {
                // tambien es necesario borrar la imagen obsoleta cuando salga un error de producto inexistente
                borrarArchivo(nombreArchivo, 'productos');
                console.log(productoDB);
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no existe'
                    }
                });
            }

            //ejecuto la función de borrar archivo, para el ejemplo es la foto enviada por el producto
            //borra la obsoleta o antigua.
            borrarArchivo(productoDB.img, 'productos');

            //si estamos acá, quiere decir que está todo bien por lo cual actualizo el objeto devuelto
            //por el callback y modifico la imagen
            productoDB.img = nombreArchivo;

            //posteriormente procedo a salvar la información actualizada con la funcion save
            productoDB.save((err, productoGuardado) => {
                res.json({
                    ok: true,
                    producto: productoGuardado
                });
            })
        })
    }
    //-------------------------------------------------------------------------------------------------------------
    //función encargada de borrar un archivo de acuerdo al path que enviemos.
let borrarArchivo = (nombreImagen, tipo) => {
        //armo el path de la imagen que quiero buscar con el fin de obtenerlo y borrarlo
        let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
        //con el if y con la función existsSync valido si el path existe, si es así con la función
        //unlinkSync borro el path encontrado.
        if (fs.existsSync(pathImagen)) {
            fs.unlinkSync(pathImagen);
        }
    }
    //-----------------------------------------------------------------------------------------------------------------




module.exports = app; //exportamos la variable app