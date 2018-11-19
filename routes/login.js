var express = require('express');

var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var seed = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ==================================================
// Google Autentication
// ==================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,

    }
}

app.post('/google', async(req, res) => {
    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario para login',
                errors: err
            });
        }
        // El usuario ya existe
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Este usuario ya fue autenticado por otro medio',
                    errors: err
                });
            } else {
                //El usuario existe y se esta volviendo a autenticar con google 
                var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: '4h' });

                usuarioDB.password = ':)';
                res.status(200).json({
                    ok: true,
                    mensaje: 'Login Correcto',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.password = ':)';
            usuario.google = true;

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: '4h' });

                usuarioDB.password = ':)';
                res.status(200).json({
                    ok: true,
                    mensaje: 'Login Correcto',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            })
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Token válido',
    //     user: googleUser
    // });
});

// ==================================================
// Autenticación normal
// ==================================================

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
        var token = jwt.sign({ usuario: usuarioDB }, seed, { expiresIn: '4h' });


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