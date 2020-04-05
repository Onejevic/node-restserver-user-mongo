//importo la librería jwt para dar uso de verificación de tokens en este archivo
const jwt = require('jsonwebtoken');

//creamos una función que se encargará de realizar la validación del token
//este recibe la solicitud, respuesta y un next( que se utiliza para que continúe con su cadena de ejecución)
let verificaToken = (req, res, next) => {
    //para recibir la data de un header podemos utilizar el método get, el cual por parámetro tendría que colocar
    // la key que se le halla asignado, para el ejemplo es token
    let token = req.get('token');

    //mandar como respuesta el mismo token esto se realiza como prueba en el sistema
    // res.json({
    //     token: token
    // });

    //para verificar el token utilizamos una función definida por el mismo jwt
    //el primer parámetro es el token recibido por el header
    //el segundo es la semilla que planteamos en el servidor
    //el tercero es una función donde arrojará un error con la variable err, o arrojará el payload
    //con la variable decoded
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        //si hay un error retornamos un estatus 401 y mandamos estado false con el error en un objeto.
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            })
        }

        //en la solucitud reescribo el req.usuario con el payload recibido.
        req.usuario = decoded.usuario;
        //si yo no lanzo el next, cuando se ejecute este método mediante la petición get el flujo de código
        //que tenga no se ejecutará.
        next();
    })
};
//----------------------------------------------------------------------------------------------------------
//para colocar otro middelware podemos crear otra función, para el ejemplo creamos un middleware encargado
//de validar que usuario es, por ejemplo si es ADMIN_ROLE podrá continuar con su funcionalidad, si no lo es,
//arrojará un error.
let verificaAdmin_Role = (req, res, next) => {
        let usuario = req.usuario;

        if (usuario.role === 'ADMIN_ROLE') {
            next();
        } else {
            return res.json({
                ok: false,
                err: {
                    message: 'El usuario no es un administrador'
                }
            });
        }

    }
    //----------------------------------------------------------------------------------------------------------
    //creo una función que validará el token mediante un parámetro obtenido en la url y no por el header,
    //por lo tanto obtengo este parámetro mediante req.query.variable_que_haya_definido; de la misma manera hago la validación
    //del token con el mismo método
let verificaTokenImg = (req, res, next) => {
        let token = req.query.token;

        jwt.verify(token, process.env.SEED, (err, decoded) => {
            //si hay un error retornamos un estatus 401 y mandamos estado false con el error en un objeto.
            if (err) {
                return res.status(401).json({
                    ok: false,
                    err
                })
            }

            //en la solucitud reescribo el req.usuario con el payload recibido.
            req.usuario = decoded.usuario;
            //si yo no lanzo el next, cuando se ejecute este método mediante la petición get el flujo de código
            //que tenga no se ejecutará.
            next();
        });
    }
    //----------------------------------------------------------------------------------------------------------
    //exportamos el módulo
module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}