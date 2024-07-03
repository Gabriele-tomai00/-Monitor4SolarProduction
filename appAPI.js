const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
require('dotenv').config();

const endpoint = process.env.ENDPOINT;
const token = process.env.TOKEN;

function getValueById(data, id) {
    const sensor = data.find(item => item.entity_id === id);
    return sensor ? sensor.state : 'N/A';
}

app.use(express.static(__dirname));
const PORT = 3100;


io.on('connection', (socket) => {
    console.log('Un client si è connesso');
    // the payload downloaded every 2 seconds is about 0.24 MB

    // Function to make an API request and send data to clients
    const sendDataToDevices = async () => {
        try {
            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 4000 // Timeout di 3 secondi in millisecondi
            });
            const filteredData = {
                solaredge_potenza_totale_dc: getValueById(response.data, "sensor.solaredge_potenza_totale_dc"),
                prism_sensore_rete: getValueById(response.data, "sensor.prism_sensore_rete"),
                consumo_casa: getValueById(response.data, "sensor.consumo_casa"),
                lg_carica_scarica_istantanea_kw: getValueById(response.data, "sensor.lg_carica_scarica_istantanea_kw"),
                lg_percentuale_di_carica: getValueById(response.data, "sensor.lg_percentuale_di_carica"),
                shelly_consumo_boiler: getValueById(response.data, "sensor.shelly_consumo_boiler"),
                car_corsa_energy_level: getValueById(response.data, "sensor.car_corsa_energy_level"),
                prism_stato: getValueById(response.data, "sensor.prism_stato"),
                prism_potenza_di_carica: getValueById(response.data, "sensor.prism_potenza_di_carica")
            };

            const jsonData = JSON.stringify(filteredData);
            const json = JSON.parse(jsonData);

            io.emit('dati', json);

        } catch (error) {
            console.error('Errore durante la richiesta API:', error.message);
            //console.log("invio json vuoto");
            const errJson = {
                error: "Home Assistant API Error Connection",
            };
            io.emit('dati', errJson);

        }
    };

    // Send data every 2 seconds
    setInterval(sendDataToDevices, 2000);
});

server.listen(3100, () => {
    console.log('Server running on http://localhost:3100/monitor.html');
});




// Endpoint to check the status of the server
app.get('/server-status', (req, res) => {
    res.status(200).send('The server is up and running');
});
app.get('/favicon.ico', (req, res) => res.status(204));


