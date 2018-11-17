var express = require('express');

var Hospital = require('../models/hospital');

var mdAtenticacion = require('../middelwares/autentiacion');

var app = express();

// ==================================================
// Obtener todos los hospitales
// ==================================================

app.get('/', (req, res) => {
    Hospital.find({}, (err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar hospitales',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: hospitales
        });
    });
});

// ==================================================
// Actualizar hospital
// ==================================================

app.put('/:id', mdAtenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar usuario',
                error: err

            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontró el usuario'
            });
        }
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        // TODO: Asignar el usuario que creó el registro
        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital en la base de datos',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Hospital actualizado',
                hospital: hospitalActualizado
            });
        });

    });
});

// ==================================================
// Crear un nuevo Hospital
// ==================================================

app.post('/', mdAtenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img
    });

    hospital.save((err, hospitalNuevo) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hosputal',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Hospital creado',
            hospital: hospitalNuevo
        });
    });
});

// ==================================================
// Borrando un hospital
// ==================================================
app.delete('/:id', mdAtenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err)  {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital de la Base de datos',
                error: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con ese id'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Hospital eliminado',
            hospital: hospitalBorrado
        });
    });
});


module.exports = app;