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
    console.log('A client is connected');
    // the payload downloaded every 2 seconds is about 0.24 MB

    // Function to make an API request and send data to clients
    const sendDataToDevices = async () => {
        try {
            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                timeout: 4000 // Timeout of 3 seconds
            });
            const filteredData = {
                solaredge_potenza_totale_dc: getValueById(response.data, "sensor.solaredge_potenza_totale_dc"),
                prism_sensore_rete: getValueById(response.data, "sensor.sensore_rete"),
                consumo_casa: getValueById(response.data, "sensor.consumo_casa"),
                lg_carica_scarica_istantanea_kw: getValueById(response.data, "sensor.lg_carica_scarica_istantanea_kw"),
                lg_percentuale_di_carica: getValueById(response.data, "sensor.lg_percentuale_di_carica"),
                shelly_consumo_boiler: getValueById(response.data, "sensor.shelly_consumo_boiler"),
                car_corsa_energy_level: getValueById(response.data, "sensor.car_corsa_energy_level"),
                prism_plug_state: getValueById(response.data, "sensor.prism_stato"),
                prism_potenza_di_carica: getValueById(response.data, "sensor.prism_potenza_di_carica"),
                car_corsa_last_update: getValueById(response.data, "sensor.car_corsa_last_update"),

                // new
                solar_panel_to_grid: getValueById(response.data, "sensor.solar_panel_to_grid_kw"),
                solar_panel_to_house: getValueById(response.data, "sensor.solar_panel_to_house_kw"),
                solar_panel_to_battery: getValueById(response.data, "sensor.solar_panel_to_battery_kw"),
                solar_grid_to_house: getValueById(response.data, "sensor.solar_grid_to_house_kw")
            };
               

            const jsonData = JSON.stringify(filteredData);
            const json = JSON.parse(jsonData);

            io.emit('dati', json);

        } catch (error) {
            console.error('Error during API request:', error.message);
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




// Endpoint to check the status of the server
app.get('/server-status', (req, res) => {
    res.status(200).send('The server is up and running');
});
app.get('/favicon.ico', (req, res) => res.status(204));


