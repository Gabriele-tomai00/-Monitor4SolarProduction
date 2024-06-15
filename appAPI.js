const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const endpoint = 'endpoint';
const token = 'token';

function getValueById(data, id) {
    const sensor = data.find(item => item.entity_id === id);
    return sensor ? sensor.state : 'N/A';
}


// Configura Express per servire file statici dalla directory principale
app.use(express.static(__dirname));

// Avvia il server Express sulla porta specificata
const PORT = 3100;


io.on('connection', (socket) => {
    console.log('Un client si è connesso');
    // il payload scaricato ogni 2 secondi è di circa 0.24 MB

    // Funzione per effettuare una richiesta API e inviare i dati ai client
    const sendDataToDevices = async () => {
        try {
            // Effettua una richiesta API includendo il token nell'intestazione
            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 4000 // Timeout di 3 secondi in millisecondi
            });

            // Ottieni i dati dalla risposta
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

    // Invia i dati ogni 2 secondi
    setInterval(sendDataToDevices, 2000);
});

server.listen(3100, () => {
    console.log('Server running on http://localhost:3100/monitor.html');
});




// Endpoint per controllare lo stato del server
app.get('/server-status', (req, res) => {
    res.status(200).send('Il server è attivo e funzionante.');
});
app.get('/favicon.ico', (req, res) => res.status(204));


