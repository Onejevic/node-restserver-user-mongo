const express = require('express'); //importamos el archivo express para peticiones http
const bcrypt = require('bcrypt'); //importamos el paquete bcrypt para codificar la contraseña
const jwt = require('jsonwebtoken'); //importamos la librería jwt para poder gestionar los token en el server
const Usuario = require('../models/usuario'); // importamos el models para poder crear actualizar o borrar Usuarios
const app = express(); //ejecutamos express y lo almacenamos en una variable

//creamos una petición post
app.post('/login', (req, res) => {
    //almacenamos el cuerpo del req en una variable
    let body = req.body;

    //Con el objeto importado, hacemos un findone, el cual se encarga de buscar solo un usuario en la bd,
    //en los corchetes colocamos una condicion para que me devuelva este dato, la condicion es que el email
    //sea igual al que se envió en la petición, en caso sea así manejo la respuesta bajo un callback que puede
    //o mandar el error o mandar el objeto del usuario.
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        //en caso de que error sea true, manda un status 500 y un json con estado false y saliendo del flujo
        //de la función.
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso de que usuarioDB sea false, mando un status 400 y esto define que el correo no existe en la bd
        //para el ejemplo la respuesta lo indicamos en paréntesis sin embargo no debemos hacer esto en productivo.
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }
        //en este estado de la función debería existir el correo por lo cual en este if, validamos SI la contraseña
        //no es igual a la del correo me arroje un status 400 y salga del flujo de la función.
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        //despues de descargar la librería, procedemos a utilizar el método sign, este método utiliza tres propiedades
        //la primera es la información que le vamos a mandar al token
        //la segunda es la semilla o el dato que yo creo en el servidor y que será comparado con la semilla que se guarda
        //en el ordenador (localstorage), y deben de coincidir ya que si no lo hacen el token pudo haber sido manipulado.
        //y el tercero es el tiempo de expiración que tendrá este token
        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

        //si estamos en esta parte de la función, quiere decir que todos los aspectos de la busqueda cumplen por lo cual
        //mando una respuesta de estado true y mando el usuario.
        res.json({
            ok: true,
            usuario: usuarioDB,
            token //de igual manera retorno el token generado en la respuesta
        });
    });
});

module.exports = app; //exportamos la constante para usarlo en otro archivo ejemplo en index.js o server.js directamente