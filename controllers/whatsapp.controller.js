const { response } = require('express');

const { Client, LocalAuth, LegacySessionAuth, MessageMedia } = require("whatsapp-web.js");

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const QRCode = require('qrcode');
const { getClient } = require('../middleware/whatpsapp');
// const { whatsapp } = require('../lib/whatsapp');

/** ======================================================================
 *  GET
=========================================================================*/
const getQR = async(req, res) => {

    try {

        const { id } = req.params; // Obtén el ID del cliente (puede ser un usuario, un dispositivo, etc.)

        const client = await getClient(id);

        client.on('qr', (qrData) => {

            const filePath = path.join(__dirname, 'qr-code.png');

            // Generar el código QR y guardarlo como archivo PNG
            QRCode.toFile(filePath, qrData, (err) => {
                if (err) {
                    return res.status(500).send('Error generando el código QR');
                }

                // Enviar el archivo como respuesta
                res.sendFile(filePath, (err) => {
                    if (err) {
                        return res.status(500).send('Error enviando el archivo');
                    }

                    // Opcional: eliminar el archivo temporal después de enviarlo
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error eliminando el archivo temporal:', err);
                        }
                    });
                });
            });

        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });

    }


};

/** ======================================================================
 *  POST MENSAJE
=========================================================================*/
const sendMensaje = async(req, res = response) => {

    try {

        const { id } = req.params; // ID del cliente
        const { number, message } = req.body; // Datos del mensaje

        const client = await getClient(id);

        if (!client) {
            return res.status(404).send('Cliente no encontrado');
        }

        const chatId = `${number.substring(1)}@c.us`;

        // const number_details = client.getNumberId(chatId);

        await client.sendMessage(chatId, message)
            .then(response => {
                res.status(200).send('Mensaje enviado con éxito');
            })
            .catch(err => {
                res.status(500).send('Error al enviar el mensaje');
            });
        // if (number_details) {
        // } else {
        //     res.json({
        //         ok: false,
        //         msg: 'Error al enviar el mensaje'
        //     })
        // }



        // if (number_details) {
        //     await client.sendMessage(chatId, message);
        //     res.json({ res: true })
        // } else {
        //     res.json({ res: false })
        // }


        // const chatId = `${phone.substring(1)}@c.us`;;
        // const number_details = await whatsapp.getNumberId(chatId);

        // if (number_details) {
        //     await whatsapp.sendMessage(chatId, message);
        //     res.json({ res: true })
        // } else {
        //     res.json({ res: false })
        // }



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });

    }

};

/** ======================================================================
 *  POST IMG
=========================================================================*/
const sendImage = async(req, res = response) => {


    try {

        const id = req.params.id;
        const number = req.params.number;
        const { caption } = req.body

        // VALIDATE IMAGE
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: 'No has seleccionado ningún archivo'
            });
        }

        const file = await sharp(req.files.image.data).metadata();
        const extFile = file.format;

        // VALID EXT
        const validExt = ['jpg', 'png', 'jpeg', 'webp', 'bmp', 'svg'];
        if (!validExt.includes(extFile)) {
            return res.status(400).json({
                ok: false,
                msg: 'No se permite este tipo de imagen, solo extenciones JPG - jpeg - PNG - WEBP - SVG'
            });
        }
        // VALID EXT

        // GENERATE NAME
        const nameFile = `${ uuidv4() }.webp`;

        // PATH IMAGE
        const path = `./uploads/images/${ nameFile }`;

        sharp(req.files.image.data)
            .webp({ equality: 75, effort: 5 })
            .toFile(path, async(err, info) => {

                const client = await getClient(id);
                const chatId = `${number.substring(1)}@c.us`;

                const media = MessageMedia.fromFilePath(path);

                client.sendMessage(`${chatId}`, media, { caption }).then((response) => {
                    if (fs.existsSync(path)) {
                        // DELET IMAGE OLD
                        fs.unlinkSync(path);
                    }
                    res.status(200).send({ message: 'Imagen enviada', response });
                }).catch((error) => {
                    res.status(500).send({ error: 'Error al enviar la imagen', details: error });
                });


            });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

};

/** ======================================================================
 *  POST MASIVOS
=========================================================================*/
const sendMasives = async(req, res = response) => {

    try {

        const { id } = req.params;
        const contacts = req.body.contacts;

        const client = await getClient(id);

        for (let i = 0; i < contacts.length; i++) {
            const { number, message } = contacts[i];

            try {
                await client.sendMessage(`${number}@c.us`, message);
                console.log(`Mensaje enviado a: ${number}`);

                // Pausa entre mensajes para evitar el spam
                await new Promise(resolve => setTimeout(resolve, 3000)); // Pausa de 3 segundos entre cada mensaje
            } catch (error) {
                console.error(`Error al enviar mensaje a ${number}:`, error);
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error inesperado, porfavor intente nuevamente'
        });
    }

}



// EXPORTS
module.exports = {
    getQR,
    sendMensaje,
    sendImage,
    sendMasives
};