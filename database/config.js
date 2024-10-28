const mongoose = require('mongoose');
const { MongoStore } = require('wwebjs-mongo');
const { Client, RemoteAuth } = require('whatsapp-web.js');

/**
 * The function `dbConnection` connects to a MongoDB database using the `mongoose` library and
 * initializes the `autoIncrement` plugin. daytas
 */
const dbConection = async() => {

    try {

        const client = new Client();

        /* The code `const connection = await mongoose.connect(process.env.DB_CNN, { useNewUrlParser:
        true, useUnifiedTopology: true, useCreateIndex: true });` is establishing a connection to a
        MongoDB database using the `mongoose` library. */
        const connection = await mongoose.connect(process.env.DB_CNN).then(() => {
            const store = new MongoStore({ mongoose: mongoose });
            const client = new Client({
                authStrategy: new RemoteAuth({
                    store: store,
                    backupSyncIntervalMs: 300000
                })
            });

            client.initialize();
        });
        console.log('DB Online');

    } catch (error) {
        console.log(error);
        throw new Error('Error al iniciar la BD');
    }

};

module.exports = {
    dbConection
};