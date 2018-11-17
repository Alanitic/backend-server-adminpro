var express = require('express');

var Medico = require('../models/medico');

var mdAtenticacion = require('../middelwares/autentiacion');

var app = express();

// ==================================================
// Obtener todos los medicos
// ==================================================

app.get('/', (req, res) => {
    Medico.find({}, (err, medicos) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al cargar los medicos',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: medicos
        });
    }).populate('usuario', 'nombre email').populate('hospital');
});

// ==================================================
// Actualizar médico
// ==================================================

app.put('/:id', mdAtenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al actualizar medico',
                error: err

            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encontró el usuario'
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                mensaje: 'Médico actualizado',
                medico: medicoActualizado
            });
        });

    });
});

// ==================================================
// Crear un nuevo medico
// ==================================================

app.post('/', mdAtenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoNuevo) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear Médico',
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: 'Médico creado',
            medico: medicoNuevo
        });
    });
});

// ==================================================
// Borrando un medico
// ==================================================
app.delete('/:id', mdAtenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err)  {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar médico de la Base de datos',
                error: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el médico con ese id'
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Médico eliminado',
            medico: medicoBorrado
        });
    });
});


module.exports = app;