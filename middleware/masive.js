const { Client } = require('whatsapp-web.js'); // O el cliente que estás usando
const { getClient } = require('./whatpsapp');

// Inicializa tu cliente de WhatsApp aquí, similar a lo que ya tienes

// Función para enviar un mensaje individual
const sendMessage = async(number, message, id) => {
    try {

        number = number.trim().replace(/\s/g, '');

        const client = await getClient(id);

        console.log(`============================================================`);
        console.log(`Enviando mensaje al ${number}`);

        const number_details = await client.getNumberId(number);

        if (number_details) {
            await client.sendMessage(number, message);

        }

        // Pausa entre mensajes para evitar el spam
        const delay = Math.random() * (4500 - 3000) + 3000;
        await new Promise(resolve => setTimeout(resolve, delay));


    } catch (error) {
        console.error(`Error al enviar el mensaje a ${number}`, error);
        throw error; // Devolver el error para que el controlador maneje el fallo
    }
};

// Servicio para manejar el envío de mensajes en lotes
const sendMessagesInBatches = async(contactList, id) => {
    const batchSize = 20; // Ajusta el tamaño de los lotes según la capacidad de tu servidor
    const delayBetweenBatches = Math.random() * (4500 - 3000) + 3000;; // Ajusta el retraso entre lotes (en milisegundos)

    const createBatches = (arr, size) => {
        const batches = [];
        for (let i = 0; i < arr.length; i += size) {
            batches.push(arr.slice(i, i + size));
        }
        return batches;
    };

    const batches = createBatches(contactList, batchSize);

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Enviando lote ${i + 1} de ${batches.length}`);

        // Enviar todos los mensajes del lote de forma simultánea
        await Promise.all(batch.map(contact => sendMessage(contact.number, contact.message, id)));

        // Esperar un retraso antes de enviar el siguiente lote
        await delay(delayBetweenBatches);
    }
};

// Función para retrasar la ejecución
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = { sendMessagesInBatches }