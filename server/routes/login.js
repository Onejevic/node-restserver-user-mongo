const express = require('express'); //importamos el archivo express para peticiones http
const bcrypt = require('bcrypt'); //importamos el paquete bcrypt para codificar la contraseña
const jwt = require('jsonwebtoken'); //importamos la librería jwt para poder gestionar los token en el server
const { OAuth2Client } = require('google-auth-library'); // importamos los paquetes requeridos de la librería de google
const client = new OAuth2Client(process.env.CLIENT_ID); // mandamos el id creado en OAUTH de la consola developer
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
//-----------------------------------------------------------------------------------------
//Configuraciones de google
//Con esta función (que la brinda el manual de google) Validamos el estado del token
async function verify(token) {
    const ticket = await client.verifyIdToken({
        //mandamos el token y el id creado en console developer como OAUTH
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    //con el método getpayload obtenemos la respuesta del token
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//-----------------------------------------------------------------------------------------
//Creamos el método post que se disparará cuando demos click en el botón de google
//este almacenará en una variable el token  y se lo pasaremos a la función de verify
//para confirmar el correcto estado del token cuando nos logueamos con google.
app.post('/google', async(req, res) => {
    //obtenemos el token que enviamos en la solicitud
    let token = req.body.idtoken;
    //con la función verify, validamos el estado de este token obtenido
    let googleUser = await verify(token)
        //en caso no sea válido mandamos un estatus 403
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });
    //Con un findOne validamos si existe un email en nuestra base de datos
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        //si error es true mandamos un status 500 que indica que es error del server
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //si llegamos acá quiere decir que no hay ningún error por lo cual empezamos a
        //validar si el usuarioDB es true
        if (usuarioDB) {
            //con este if validamos si el email existe pero el estado de google es falso,
            //esto quiere decir que el usuario se logueo bajo nuestra plataforma anteriormente
            //y está intentando loguearse ahora con google
            if (usuarioDB.google === false) {
                //si es así mando un status 400 (recordemos que cuando mando el return saldrá de la función)
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
                // si no es así quiere decir que es correcto por lo cual creamos nuevamente el token, y lo actualizamos
                // enviando un nuevo objeto con el usuario y el token renovado.
            } else {
                let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
            // si el usuario no existe en nuestra base de datos procedemos a crearlo
        } else {

            //creo un objeto con el modelo de usuario
            let usuario = new Usuario();

            //asigno los valores
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            //creo una contraseña con una carita feliz, pero esto no significa que el
            //usuario se pueda loguear con esta carita ya que en el proceso de la contraseña
            //realizamos un hash que nunca hará match.
            usuario.password = ':)';

            //hacemos el almacenamiento de acuerdo al objeto creado.
            usuario.save((err, usuarioDB) => {
                //en caso genere error
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                //creo un token válido para el usuario
                let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});
//-----------------------------------------------------------------------------------------


module.exports = app; //exportamos la constante para usarlo en otro archivo ejemplo en index.js o server.js directamente