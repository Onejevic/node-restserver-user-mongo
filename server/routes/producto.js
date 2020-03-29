const express = require('express'); //importamos el archivo express para peticiones http
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion'); // importo el archivo de middleware que contiene la validación del token y validacion del role
const Producto = require('../models/producto'); // importamos el models para poder crear actualizar o borrar Usuarios
const app = express(); //ejecutamos express y lo almacenamos en una variable

//------------------------------------------------------------------------------------
//Servicio mostrar todos los productos
app.get('/producto', verificaToken, (req, res) => {

    //la forma de recibir datos mediante parámetros de la url es decir (ejemplo.com/datos?desde=5) lo hacemos mediante
    //las propiedades .query.variable y lo utilizamos con una condicional que en caso de que no se envíe ninguna información
    // será por defecto 0
    let desde = req.query.desde || 0;
    desde = Number(desde); //es necesario convertirlo a número ya que por defecto devuelve un string
    //hacemos el mismo proceso pero para colocarle un limite
    let hasta = req.query.hasta || 5;
    hasta = Number(hasta);

    // generamos la búsqueda de todos las productos
    Producto.find({ disponible: true })
        //se salta los registros que le indiquemos en la variable desde
        .skip(desde)
        //limitar y muestra solo cinco registros por defecto o lo que le indique en la variable
        .limit(hasta)
        // esto ayuda a ordenar la búsqueda realizada por ejemplo el nombre
        .sort('nombre')
        // esto me permite enlazar el id del usuario o categoría con el schema para traer mayor información
        // por ejemplo podría traer el nombre e email del usuario y la descripción de la categoría
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        // ejecutamos
        .exec((err, productos) => {
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
                productos
            });
        })
});
//------------------------------------------------------------------------------------
//Servicio que muestra un producto por id
app.get('/producto/:id', verificaToken, (req, res) => {
    //obtengo el id de la url
    let id = req.params.id;
    //realizo la busqueda por id
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            //En caso halla un error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //en caso no halla un objeto
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }
            //mandamos como respuesta el objeto con la categoría
            res.json({
                ok: true,
                productoDB
            });
        })
});
//------------------------------------------------------------------------------------
//Servicio que me permite realizar búsquedas
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
        // recibimos el termino recibido por la url
        let termino = req.params.termino;
        // creamos una variable para expresiones regulares, el primer parámetro es la variable termino
        // y el segundo es insensitive a las mayusculas y minusculas, esta variable la podré mandar
        //en el find y encontrará todas las coincidencias en nuestro schema
        let regex = new RegExp(termino, 'i');

        //ejecuto un find mandando un match en el nombre con la expresión regular creada anteriormente
        //el cual buscará todas las coincidencias que pueda encontrar en nuestra base de datos.
        Producto.find({ nombre: regex })
            //hacemos un inner join con el schema categorias y traemos solo la descripción
            .populate('categoria', 'descripcion')
            //ejecutamos el find y mandamos por parámetro un callback para el error o la respuesta del producto
            .exec((err, productos) => {
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
                    productos
                });
            });
    })
    //------------------------------------------------------------------------------------
    //Servicio para crear nuevo producto
app.post('/producto', verificaToken, (req, res) => {
    //recibo la respuesta
    let body = req.body;
    //creo un objeto de acuerdo al modelo
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria

    });
    //lo almaceno
    producto.save((err, productoDB) => {
        //en caso halla un error mando un status 500
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso no halla creado la categoría mando el status 400
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //como respuesta mando un objeto con la categoría y estado true
        res.json({
            ok: true,
            producto: productoDB
        });

    })
});
//------------------------------------------------------------------------------------
//Servicio para actualizar una categoría
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id; //Almaceno el id recibido por la url
    let body = req.body; //recibo el body por petición post o put
    //creo un objeto con los nuevos valores obtenidos.
    let descProducto = {
            nombre: body.nombre,
            precioUni: body.precioUni,
            categoria: body.categoria,
            disponible: body.disponible,
            descripcion: body.descripcion
        }
        //busco el id y lo actualizo, mando el id, el body actualizado, el tercero me ayuda a que en la respuesta se vea reflejado
        //en el res.json, ya que por defecto enviaría el primer objeto y no mostraría el cambio realizado, y el cuarto el callback
        //que gestiona la respuesta
    Producto.findByIdAndUpdate(id, descProducto, { new: true, runValidators: true }, (err, productoDB) => {
        //en caso halla un error mando un status 500
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso no halla creado un producto mando el status 400
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //si todo salió bien mando un objeto como respuesta indicando un ok en estado true y el producto modificado.
        res.json({
            ok: true,
            producto: productoDB
        });
    })
});
//------------------------------------------------------------------------------------
//borramos el producto, es importante tener encuenta que el producto no se borra sino se modifica
//el estado disponible en false
app.delete('/producto/:id', verificaToken, (req, res) => {
    //recibimos el parámetro mandado por url
    let id = req.params.id;
    //creamos un objeto temporal para modificar la propiedad disponible a false
    let descProducto = {
        disponible: false,
    }

    //con este método actualizo el producto de acuerdo al id mandado, el primer parámetro es el id
    //el segundo es el objeto ya alterado esto solo modificará las propiedades que estén allí para el ejemplo disponible
    //el tercero es para poder mandar la respuesta actualizada al usuario, es decir un objeto ya con la propiedad alterada.
    //y el cuarto viene siendo el callback para manejar el objeto o el error.
    Producto.findByIdAndUpdate(id, descProducto, { new: true, runValidators: true }, (err, productoDB) => {
        //en caso halla un error mando un status 500
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //en caso no halla creado un producto mando el status 400
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //si todo salió bien mando un objeto como respuesta indicando un ok en estado true y el producto modificado.
        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto Borrado'
        });
    });
});
//------------------------------------------------------------------------------------

module.exports = app; //exportamos la variable app