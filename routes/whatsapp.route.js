/** =====================================================================
 *  WHATSAPP ROUTER 
=========================================================================*/
const { Router } = require('express');
const { check } = require('express-validator');

// MIDDLEWARES
const expressFileUpload = require('express-fileupload');

// CONTROLLERS
const { getQR, sendMensaje, sendImage, sendMasives } = require('../controllers/whatsapp.controller');


const router = Router();
router.use(expressFileUpload());

/** =====================================================================
 *  GET QR
=========================================================================*/
router.get('/qr/:id', getQR);

/** =====================================================================
 *  POS SMS
=========================================================================*/
router.post('/send/:id', sendMensaje);

/** =====================================================================
 *  POS SMS
=========================================================================*/
router.post('/send-iamge/:id/:number', sendImage);

/** =====================================================================
 *  POST MASIVE SMS
=========================================================================*/
router.post('/masive/:id', sendMasives);

// EXPORT
module.exports = router;