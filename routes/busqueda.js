var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // Creando nuestra expresión regular del parámetro de búsqueda
    // La i es de que no considere mayúsculas
    var regex = new RegExp(busqueda, 'i');

    Promise.all(
            [buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1]
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

module.exports = app;