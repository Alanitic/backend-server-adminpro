var express = require('express');

var fileUpload = require('express-fileupload');

var app = express();

// Using fileupload
app.use(fileUpload());

app.put('/', (req, res, next) => {

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

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente',
        extension: extensionArchivo
    });
});

module.exports = app;