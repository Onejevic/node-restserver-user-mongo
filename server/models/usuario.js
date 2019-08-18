//esta es la forma de crear un modelo para la tabla(colección) de Usuario

//importamos mongoose
const mongoose = require('mongoose');

//creamos una variable para la importación de mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');

//creamos una variable con el fin de manejar los enum, (los enum me ayuda a
//que solo se pueda escoger ciertos valores en algunas propiedades, es decir
//solo acepta ADMIN_ROLE Y SUPER_ROLE),asimismo podemos mandar un mensaje el
//cual el valor VALUE, es el valor que haya escrito el usuario, ejemplo
//USUARIO_INVENTADO no es un role válido
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un role válido'
}


//declaramos una variable para crear un schema utilizando la variable de mongoose
let Schema = mongoose.Schema;



//creo un schema el cual me ayuda a restringir los tipos
//de datos que va a recibir la colección
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true, //obliga que el valor sea único
        required: [true, 'El email es necesario']
    },
    password: {
        type: String,
        required: [true, 'El password es necesario']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos // le mandamos la variable para los enum
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

//este método se usa con el fin de borrar o eliminar la impresión del password en la respuesta del json
//en el archivo de usuario.js de routes; este método siempre se lanzará cuando tratemos de imprimir o enviar
//la respuesta bajo un formato json.
usuarioSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

//esto lo usamos con el fin de que cuando genere un error por valor único (ejemplo el email)
//el sistema me arroje la misma estructura de un json como cualquier otro error
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

//la exportamos de la siguiente manera con el fin de darle un nombre al modelo,
//y definirle un schema a este modelo, ejemplo le llamamos Usuario y le aplicamos
//el schema creado anteriormente.
module.exports = mongoose.model('Usuario', usuarioSchema);