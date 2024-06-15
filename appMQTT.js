const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const mqtt = require('mqtt');

const options = {
    username: 'mqtt_user',
    password: 'pwd',
    connectTimeout: 3000, // Timeout of 3 seconds
};

const client = mqtt.connect('mqtt://ip', options);
client.on('connect', function () {
    console.log('Connessione al broker MQTT avvenuta con successo');
});

// Gestione dei messaggi ricevuti dal broker MQTT
client.on('message', function (topic, message) {
    const jsonData = JSON.stringify(message.toString(), null, 2);
    const validJsonString = jsonData.replace(/'/g, '"');
    let stringWithoutQuotes = validJsonString.replace(/^["']|["']$/g, '');
    const json = JSON.parse(stringWithoutQuotes);

    io.emit('dati', json);
});

// Gestione degli errori
client.on('error', function (error) {
    console.error('Errore di connessione MQTT');

    const errJson = {
        error: "Home Assistant MQTT Error Connection",
    };
    io.emit('dati', errJson);    
    
});

client.subscribe('dataForMonitorFV', function (err) {
    if (err) {
        console.error('Errore durante la sottoscrizione a dataForMonitorFV', err);
    } else {
        console.log('Sottoscrizione a dataForMonitorFV avvenuta con successo');
    }
});

app.use(express.static(__dirname));

const PORT = 3100;
server.listen(3100, () => {
    console.log(
        "  __  __             _ _             _  _   ________      __  \n" +
        " |  \\/  |           (_) |           | || | |  ____\\ \\    / /  \n" +
        " | \\  / | ___  _ __  _| |_ ___  _ __| || |_| |__   \\ \\  / /   \n" +
        " | |\\/| |/ _ \\| '_ \\| | __/ _ \\| '__|__   _|  __|   \\ \\/ /    \n" +
        " | |  | | (_) | | | | | || (_) | |     | | | |       \\  /     \n" +
        " |_|  |_|\\___/|_| |_|_|\\__\\___/|_|     |_| |_|        \\/      \n" +
        "                                                             \n" +
        "                                                             "
      );
      
    console.log('Server running on http://localhost:3100/monitor.html');
});




// Endpoint per controllare lo stato del server
app.get('/server-status', (req, res) => {
    res.status(200).send('Il server è attivo e funzionante.');
});

