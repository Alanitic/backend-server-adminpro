var mongoose = require('mongoose');
var schema = mongoose.schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es obligatorio'] },
    img: { type: String, required: false },
    usuario: { type: schema.Types.ObjectId, ref: 'Usuario' }
}, { collection: 'hospitales' });

module.exports = mongoose.model('Hospital', hospitalSchema);