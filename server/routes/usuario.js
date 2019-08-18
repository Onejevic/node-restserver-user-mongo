const express = require('express'); //importamos el archivo express para peticiones http
const bcrypt = require('bcrypt'); //importamos el paquete bcrypt para codificar la contraseña
const _ = require('underscore'); //este paquete me provee de varias funcionalidades adicionales de javascript
const app = express(); //ejecutamos express y lo almacenamos en una variable
const Usuario = require('../models/usuario'); // importamos el models para poder crear actualizar o borrar Usuarios
//----------------------------------------------------------------------------
//PETICIÓN GET
app.get('/usuario', function(req, res) {

    //la forma de recibir datos mediante parámetros de la url es decir (ejemplo.com/datos?desde=5) lo hacemos mediante
    //las propiedades .query.variable y lo utilizamos con una condicional que en caso de que no se envíe ninguna información
    // será por defecto 0
    let desde = req.query.desde || 0;
    desde = Number(desde); //es necesario convertirlo a número ya que por defecto devuelve un string
    //hacemos el mismo proceso pero para colocarle un limite
    let hasta = req.query.hasta || 5;
    hasta = Number(hasta);


    //para obtener la información de nuestra bd, podemos hacerlo mediante el método
    //find del objeto Usuario que corresponde al schema creado en model, el primer parámetro
    //equivale a un objeto {}, el cual puedo incluir algún filtro en la busqueda, el segundo
    //es el exec, y esto recibe un callback para gestionar la información.
    Usuario.find({ estado: true }, 'nombre email role estado google img') //buscar el valor bajo un filtro, el segundo parámetro son los campos que me arrojará en la respuesta es decir si quisiera solo coloco 2
        .skip(desde) //se salta los registros que le indiquemos en la variable desde
        .limit(hasta) //limitar y muestra solo cinco registros por defecto o lo que le indique en la variable
        .exec((err, usuarios) => { //ejecutarlo
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            //para contar los registros podemos usar la función count, el cual recibe como parámetros un objeto (que va a realizar el filtro),
            //y recibe el callback, que arroja un error y la respuesta de conteo, por defecto lo relacionamos en la respuesta en la propiedad
            //cuantos.
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })
            })

        })

});
//----------------------------------------------------------------------------
//PETICIÓN POST
app.post('/usuario', function(req, res) {
    //para tratar la información podemos hacerlo mediante req.body(esto lo podemos hacer
    //ya que importamos el paquete bodyparser y nos devolverá un formato json)
    let body = req.body;

    //mediante el modelo creado anteriormente  creo una instancia mandandole todos los valores
    //bajo un objeto, este objeto recibirá los datos por medio del body
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //para codificar la contraseña podemos utilizar el método hashSync de la varaible bcrypt,
        //esto me solicita dos parámetros, el primero es la data y el segundo el número de vueltas.
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //para almacenarlo solo debemos ejecutar la función save, sin embargo podemos manejar las respuestas
    //mediante un callback que por parámetros recibe el error y el dato en caso se haya almacenado correctamente
    usuario.save((err, usuarioDB) => {
        //si detecta que hay un error mando un return para que salga de la función y su status es 400,asimismo mando
        //un objeto con algunas propiedades como ok igual a false y mando el error
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //si yo no quisiera que enviara en la respuesta la contraseña podemos modificar el objeto, limpiando
        //la contraseña y despues pasarla a la respuesta json ejemplo:
        //usuarioDB.password = null;

        //si no entro en el error mandamos como respuesta un objeto con el valor de dato ingresado en la bd de
        //mongoose
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});
//----------------------------------------------------------------------------
//PETICIÓN PUT
app.put('/usuario/:id', function(req, res) {
    //para obtener el valor de :id, lo hacemos de esta manera
    let id = req.params.id;

    //optenemos lo enviado por la solicitud post (entre comillas ya que es un put)
    //al importar el paquete underscore, podemos utilizar una función llamada pick( validar  la documentación),
    //el cual me ayuda a que estos datos que mando en el arreglo sean los únicos modificables mediante el put
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    //este método se usa con el fin de buscar y actualizar un registro de la tabla, el primer parámetro es el id
    //el segundo es la data con el cual vamos a modificar la información (si no enviamos nada no modifica nada
    //y envía el mismo objeto sin ninguna alteración), el tercero me ayuda a que en la respuesta se vea reflejado
    //en el res.json, ya que por defecto enviaría el primer objeto y no mostraría el cambio realizado, y por ultimo
    //es un callback que utilizaremos para enviar la respuesta.
    Usuario.findByIdAndUpdate(
        id,
        body, {
            new: true, //actualiza los cambios automáticamente
            runValidators: true //verifica las validaciones que yo tenga en el schema para que no permita realizar modificaciones erroneas
        },
        (err, usuarioDB) => {
            //en caso se presente un error
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            //retorno un json con el valor mandado por url
            res.json({
                ok: true,
                usuario: usuarioDB
            });
        })
});
//----------------------------------------------------------------------------
// PETICIÓN DELETE
//Para hacer la eliminación lo hacemos mediante una petición get (suena ilógico pero en cierta manera el parámetro viaja por la url)
app.delete('/usuario/:id', function(req, res) {
    //obtenemos el parámetro de la variable id mandada por url
    let id = req.params.id;
    //-----------------------------------------------------------
    //la mayoría de las veces no se debería eliminar el registro y solo con modificar alguna propiedad bastaría para que fuera eliminado

    //guardo en una variable un objeto con los parámetros que quiero modificar este estado define si está eliminado o no
    let cambiaEstado = {
        estado: false
    }

    //aplico el método findByIdAndUpdate, el cual le mando por parámetro el id del objeto que quiero modificar, el segundo es un objeto con las propiedades
    //que quiero modificar, el tercero lo utilizamos con el fin de que en la respuesta me mande la data ya actualizada con el cambio,
    //y el cuarto es un callback para gestionar la eliminación
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        })
    })

    //-----------------------------------------------------------
    //con el método findByIdAndRemove eliminamos el registro, esto toma dos parámetros, uno es el id que queremos eliminar y el otro
    //y el segundo el callback que gestiona la eliminación
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     //si hay un error manda un status 400 y una respuesta con el error
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }
    //     //puede que el usuario no exista, por lo cual tambien lo controlamos con un if, indicando que el usuario no lo ha encontrado.
    //     if (!usuarioBorrado) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     //mandamos el objeto eliminado como respuesta.
    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     })
    // })
});
//----------------------------------------------------------------------------
//exportamos la variable app para poderla usar en otro archivo
module.exports = app;