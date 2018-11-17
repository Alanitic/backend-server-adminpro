var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');


app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // Creando nuestra expresión regular del parámetro de búsqueda
    // La i es de que no considere mayúsculas
    var regex = new RegExp(busqueda, 'i');

    Hospital.find({ nombre: regex }, (err, hospitales) => {

        res.status(200).json({
            ok: true,
            hospitales: hospitales
        });
    });

});

module.exports = app;