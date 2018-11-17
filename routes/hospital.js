var express = require('express');

var Hospital = require('../models/hospital');

var mdAtenticacion = require('../middelwares/autentiacion');

var app = express();

// ==================================================
// Obtener todos los hospitales
// ==================================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .populate('usuario', 'nombre email').skip(desde)
        .limit(5)
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar hospitales',
                    error: err
                });
            }

            Hospital.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    mensaje: hospitales,
                    total: conteo
                });
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
                mensaje: 'Error al actualizar hospital',
                error: err

            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontró el hospital'
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

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
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalNuevo) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
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