var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');



// ==================================================
// Búsqueda por colección específica
// ==================================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'medicos':
            buscarMedicos(busqueda, regex).then(medicos => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos
                });
            });
            break;
        case 'hospitales':
            buscarHospitales(busqueda, regex).then(hospitales => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
            });
            break;
        case 'usuarios':
            buscarUsuarios(busqueda, regex).then(usuarios => {
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son: medicos, hospitales, usuarios',
                error: { message: 'Tipo de tabla incorrecto' }
            });
    }
});


// ==================================================
// Búsqueda global
// ==================================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // Creando nuestra expresión regular del parámetro de búsqueda
    // La i es de que no considere mayúsculas
    var regex = new RegExp(busqueda, 'i');

    Promise.all(
            [
                buscarHospitales(busqueda, regex),
                buscarMedicos(busqueda, regex),
                buscarUsuarios(busqueda, regex)
            ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

// ==================================================
// Promesa para buscar Hoteles
// ==================================================

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regexp }, (err, hospitales) => {
            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(hospitales);
            }
        });
    });

}


// ==================================================
// Promesa para buscar Medicos
// ==================================================

function buscarMedicos(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regexp }, (err, medicos) => {
            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(medicos);
            }
        });
    });

}

// ==================================================
// Promesa para buscar Usuarios
// ==================================================

function buscarUsuarios(busqueda, regexp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });

}


module.exports = app;