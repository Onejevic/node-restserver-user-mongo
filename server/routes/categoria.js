const express = require('express'); //importamos el archivo express para peticiones http
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion'); // importo el archivo de middleware que contiene la validación del token y validacion del role
const Categoria = require('../models/categoria'); // importamos el models para poder crear actualizar o borrar Usuarios
const app = express(); //ejecutamos express y lo almacenamos en una variable

//------------------------------------------------------------------------------------
//Servicio mostrar todas las categorias
app.get('/categoria', verificaToken, (req, res) => {
    // generamos la búsqueda de todas las categorías
    Categoria.find({})
        // esto ayuda a ordenar la búsqueda realizada
        .sort('descripcion')
        // esto me permite traer el usuario de acuerdo al id almacenado en la categoría es como un inner join, 
        // el segundo parámetro son las propiedades que quiero mostrar de este usuario para el ejemplo el nombre e email
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            //en caso halla un error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //Si no hubo un error mando un estado true, y mando la respuesta
            res.json({
                ok: true,
                categorias
            });
        })
});
//------------------------------------------------------------------------------------
//Servicio que muestra una categoría por id
app.get('/categoria/:id', verificaToken, (req, res) => {
    //obtengo el id de la url
    let id = req.params.id;
    //realizo la busqueda por id
    Categoria.findById(id, (err, categoriaDB) => {
        //En caso halla un error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso no halla un objeto
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //mandamos como respuesta el objeto con la categoría
        res.json({
            ok: true,
            categoriaDB
        });
    });
});
//------------------------------------------------------------------------------------
//Servicio para crear nueva categoría
app.post('/categoria', verificaToken, (req, res) => {
    //recibo la respuesta
    let body = req.body;
    //creo un objeto de acuerdo al modelo
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    //lo almaceno
    categoria.save((err, categoriaDB) => {
        //en caso halla un error mando un status 500
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso no halla creado la categoría mando el status 400
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //como respuesta mando un objeto con la categoría y estado true
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })
});
//------------------------------------------------------------------------------------
//Servicio para actualizar una categoría
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id; //Almaceno el id recibido por la url
    let body = req.body; //recibo el body por petición post o put
    //creo un objeto con la nueva descripción mandada por el usuario
    let descCategoria = {
            descripcion: body.descripcion
        }
        //busco el id y lo actualizo, mando el id, el body actualizado, el tercero me ayuda a que en la respuesta se vea reflejado
        //en el res.json, ya que por defecto enviaría el primer objeto y no mostraría el cambio realizado, y el cuarto el callback
        //que gestiona la respuesta
    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        //en caso halla un error mando un status 500
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso no halla creado la categoría mando el status 400
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //si todo salió bien mando un objeto como respuesta indicando un ok en estado true y la categoría modificada.
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});
//------------------------------------------------------------------------------------
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        //en caso halla un error mando un status 500
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso no halla creado la categoría mando el status 400
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }
        //en caso de que salga todo bien borrará la categoría y mandará un mensaje
        //indicando lo sucedido.
        res.json({
            ok: true,
            message: 'Categoría Borrada'
        });
    });
});
//------------------------------------------------------------------------------------

module.exports = app; //exportamos la variable app