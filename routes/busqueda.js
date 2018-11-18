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

    var promesa;

    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda son: medicos, hospitales, usuarios',
                error: { message: 'Tipo de tabla incorrecto' }
            });
    }

    promesa.then(resultado => {
        res.status(200).json({
            ok: true,
            [tabla]: resultado
        });
    });

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