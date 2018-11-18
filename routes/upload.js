var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

// Using fileupload
app.use(fileUpload());

app.put('/:tipo/:id', (req, res) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colección
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No es una colección válida',
            errors: { message: 'Las colecciones válidas son:' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se seleccinó archivo',
            errors: { message: 'Debe seleccionar un archivo' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones permitidas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo.toLowerCase()) < 0)  {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
    // Mover el archivo
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, (err) => {
        if (err) {

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }
        subirPorTipo(tipo, id, path, res, nombreArchivo);
    });

});

// ==================================================
// Función para relacionar la imagen a alguna colección
// ==================================================

function subirPorTipo(tipo, id, path, res, nombreArchivo) {
    var tipoColección;
    switch (tipo) {
        case 'usuarios':
            tipoColección = Usuario;
            break;
        case 'medicos':
            tipoColección = Medico;
            break;
        case 'hospitales':
            tipoColección = Hospital;
            break;
    }

    tipoColección.findById(id, 'nombre img')
        .exec((err, resultado) => {
            if (err || !resultado) {
                fs.unlink(path, err => { if (err) throw err }); // Borro el archivo cuando no tengo id valido
                return res.status(400).json({
                    ok: false,
                    mensaje: `No se encontraron ${tipo} con ese id`,
                    errors: { message: 'Debe selecionar un Id valido' }
                });
            }
            // Si ya existe una imagen hay que eliminarla
            var pathViejo = resultado.img;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => { if (err) throw err });
            }
            resultado.img = nombreArchivo;

            resultado.save((err, resultadoActualizado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: `Error al actualizar ${tipo}`,
                        errors: err
                    });
                }
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    [resultado]: resultadoActualizado
                });
            });
        });
}

module.exports = app;