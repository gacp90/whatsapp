const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const puppeteer = require('puppeteer');

// Mapa para almacenar clientes
const clients = new Map();

// Función para inicializar un nuevo cliente
const initializeClient = (id) => {
    const client = new Client({
        puppeteer: {
            executablePath: '/usr/bin/chromium-browser', // Ruta al Chromium instalado manualmente
            headless: true, // Modo headless para servidores
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Argumentos recomendados
        },
        authStrategy: new LocalAuth({ clientId: id }) // Usa el `clientId` para separar múltiples sesiones
    });

    client.on('qr', (qr) => {
        console.log(`Escanea este QR para el cliente ${id}`);
        qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
        console.log(`Cliente ${id} listo`);
    });

    client.on('authenticated', (session) => {
        console.log(`Cliente ${id} autenticado`);
    });

    client.on('auth_failure', (msg) => {
        console.error(`Error de autenticación para el cliente ${id}: ${msg}`);
        // Si hay error en la autenticación, borra los archivos de sesión
        deleteSession(id);
    });

    client.on('disconnected', (reason) => {
        console.log(`Cliente ${id} desconectado: ${reason}`);
        // Opcional: borrar la sesión al desconectarse
        deleteSession(id);
    });

    client.initialize();

    clients.set(id, client);
    return client;
};

// Eliminar sesión si está corrupta o si hay problemas de autenticación
const deleteSession = (id) => {
    const sessionPath = `./.wwebjs_auth/session-${id}`;
    if (fs.existsSync(sessionPath)) {
        fs.rmdirSync(sessionPath, { recursive: true });
        console.log(`Sesión eliminada para el cliente ${id}`);
    }
    clients.delete(id);
};

// Obtener cliente o inicializar uno nuevo si no existe
const getClient = (id) => {
    if (clients.has(id)) {
        return clients.get(id);
    } else {
        return initializeClient(id);
    }
};

module.exports = { getClient };