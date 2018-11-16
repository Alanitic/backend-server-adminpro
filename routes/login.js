var express = require('express');

var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var app = express();
var Usuario = require('../models/usuario');


app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario para login',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Contraseña incorreta - password',
                errors: err
            });
        }

        // ==================================================
        // Creando token
        // ==================================================
        var token = jwt.sign({ usuario: usuarioDB }, '@este-es@-un-seed-dificil', { expiresIn: '4h' });


        usuarioDB.password = ':)';
        res.status(200).json({
            ok: true,
            mensaje: 'Login Correcto',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});

module.exports = app;