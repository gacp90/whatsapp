const { Schema, model } = require('mongoose');

const WhatsappSchema = Schema({

    clientId: {
        type: String,
        required: true,
        unique: true
    },
    sessionData: {
        type: Object,
        default: {}
    }, // Aquí almacenaremos los datos de la sesión
    client: {
        type: Object,
        default: {}
    },
    isReady: {
        type: Boolean,
        default: false
    }, // Indicamos si el cliente está listo
    fecha: {
        type: Date,
        default: Date.now
    }

});

WhatsappSchema.method('toJSON', function() {

    const { __v, _id, ...object } = this.toObject();
    object.wid = _id;
    return object;

});

module.exports = model('Whatsapp', WhatsappSchema);