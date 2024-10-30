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

        await client.on('qr', (qrData) => {

            // DEVOLVEMOS LA DATA
            res.json({
                ok: true,
                qr: qrData
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
        let { number, message } = req.body; // Datos del mensaje
        number = number.trim();

        const client = await getClient(id);

        if (!client) {
            return res.status(404).send('Cliente no encontrado');
        }

        const chatId = `${number}@c.us`;

        const number_details = await client.getNumberId(chatId);

        if (number_details) {
            await client.sendMessage(chatId, message)
                .then(response => {
                    res.json({
                        ok: true,
                        msg: 'Mensaje enviado con éxito'
                    })
                })
                .catch(err => {
                    res.status(500).send('Error al enviar el mensaje');
                });
        } else {
            return res.status(400).json({
                ok: false,
                msg: 'Error al enviar el mensaje, porfavor revisa el numero o intenta nuevamente'
            });
        }


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
        let number = req.params.number;
        number = number.trim();
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
                const chatId = `${number}@c.us`;

                const number_details = await client.getNumberId(chatId);

                if (!number_details) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Error al enviar el mensaje, porfavor revisa el numero o intenta nuevamente'
                    });
                }

                const media = MessageMedia.fromFilePath(path);

                client.sendMessage(`${chatId}`, media, { caption }).then((response) => {
                    if (fs.existsSync(path)) {
                        // DELET IMAGE OLD
                        fs.unlinkSync(path);
                    }
                    res.json({
                        ok: true,
                        msg: 'Imagen enviada'
                    });
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

        let contador = 0;

        for (let i = 0; i < contacts.length; i++) {

            let { number, message } = contacts[i];
            number = number.trim();
            number.replace(/ /g, "")

            console.log(`============================================================`);
            console.log(`Enviando mensaje al ${number}`);
            const client = await getClient(id);

            const chatId = `${number}@c.us`;
            contador++;
            await client.sendMessage(chatId, message);
            console.log(`Mensaje enviado con exito!`);
            console.log(`============================================================`);


            // const number_details = await client.getNumberId(chatId);

            // if (number_details) {
            // }

            // Pausa entre mensajes para evitar el spam
            await new Promise(resolve => setTimeout(resolve, 3000));

        }

        res.json({
            ok: true,
            msg: `Se enviaron exitosamente, ${contador + 1} mensajes`
        })

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