var express = require('express');

var Usuario = require('../models/usuario');
var bcrypt = require('bcrypt');

var mdAtenticacion = require('../middelwares/autentiacion');

var jwt = require('jsonwebtoken');


var app = express();

// ==================================================
// Obtener todos los usuarios
// ==================================================

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargado usuarios',
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    mensaje: usuarios,
                    total: conteo
                });

            });
        });


});


// ==================================================
// Acualizar usuario
// ==================================================

app.put('/:id', mdAtenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, 'nombre email img role')
        .exec((err, usuario) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario con el id' + id + ' no existe',
                    errors: err
                });
            }
            usuario.nombre = body.nombre;
            usuario.email = body.email;
            usuario.role = body.role;

            usuario.save((err, usuarioActualizado) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario en base de datos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuario: usuarioActualizado
                });

            });
        });
});

// ==================================================
// Crear un nuevo usuario
// ==================================================
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar el usuario en base de datos',
                errors: err
            });
        }
        usuarioGuardado.password = ':)';
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });

});

// ==================================================
// Borrar un usuario
// ==================================================

app.delete('/:id', mdAtenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id'
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;
