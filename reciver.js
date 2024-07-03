const socket = io();

let pvGeneration;
let gridSensor;
let homeConsumption;
let batteryPVchargeDischarge;
let batteryPVpercentage;
let boilerPower;
// car
let carBatteryPercentge;
let carState;
let wallboxChargePower;
let wallboxPlugState;
let lastUpdatePSA;
// GET HTML DIV //
const houseValuePowerDiv = document.getElementById("unit-house-power");
const carValuePercentageDiv = document.getElementById("unit-car-percentage");
const carValuePercentageDivInModal = document.getElementById("car-percentage-div-in-modal");
const carValuePowerDiv = document.getElementById("unit-car-power");
const carValueLastUpdate = document.getElementById("car-last-update");
const wallboxPlugStateDiv = document.getElementById("prism-plug-state");
const boilerValuePowerDiv = document.getElementById("unit-boiler-power");

// // Gestione dell'evento di errore in caso nodejs sia offline
// socket.on('error', (error) => {
//   console.error('Si è verificato un errore di connessione con nodejs:', error);

// });
// socket.on riceve i dati aggiornati secondo le regole del server (ogni 2 secondi) 
socket.on('dati', (data) => {
                    //console.log(data);

                    if(hasError(data))
                    {
                      pvGeneration = "..."; //getValueById(data, "sensor.solaredge_potenza_totale_dc"); console.log("pvGeneration: " + pvGeneration);
                      gridSensor = "...";
                      homeConsumption = "...";
                      batteryPVchargeDischarge = "...";
                      batteryPVpercentage = "...";
                      boilerPower = "...";
                      // car
                      carBatteryPercentge = "...";
                      carState = "...";
                      wallboxChargePower = "...";
                      lastUpdatePSA = "...";
                      // APPARE ALERT CON SCRITTO "IMMPOSSIBILE COMUNICARE CON IL SERVER"
                      showConnectionAPIAlert();
                    
                    }
                    else
                    {
                      hideConnectionAPIAlert(); 
                      // GET VALUE FROM DATA RESPONSE //
                      pvGeneration = data['solaredge_potenza_totale_dc'];
                      gridSensor = data['prism_sensore_rete'];
                      homeConsumption = data['consumo_casa'];
                      batteryPVchargeDischarge = data['lg_carica_scarica_istantanea_kw'];
                      batteryPVpercentage = data['lg_percentuale_di_carica'];
                      boilerPower = data['shelly_consumo_boiler'];
                      // car
                      carBatteryPercentge = data['car_corsa_energy_level'];
                      carState = data['prism_stato'];
                      wallboxChargePower = data['prism_potenza_di_carica'];
                      wallboxPlugState = data['prism_plug_state'];
                      lastUpdatePSA = data['car_corsa_last_update'];
                      //console.log("carState: " + carState);
                      //console.log("wallboxChargePower: " + wallboxChargePower);

                    // SET VALUE IN HTML //
                    // fvValueDiv.textContent = pvGeneration.value + " kw";
                    setRoundValue("fv-value", roundValue(pvGeneration));
                    setRoundValue("grid-value", roundValue(gridSensor));
                    setRoundValue("grid-value-alert", roundValue(gridSensor));
                    setRoundValue("house-value", roundValue(homeConsumption));
                    setRoundValue("battery-power-value", roundValue(batteryPVchargeDischarge));
                    setBatteryValueSize("battery-percentage-value", batteryPVpercentage);

                    //house
                    houseValuePowerDiv.textContent = roundValue(homeConsumption) + " kw";
                    //car
                    carValuePercentageDiv.textContent = carBatteryPercentge + "%";
                    carValuePercentageDivInModal.textContent = carBatteryPercentge + "%";
                    carValuePercentageDivInModal.textContent = carBatteryPercentge + "%";
                    carValueLastUpdate.textContent = lastUpdatePSA;
                    carValuePowerDiv.textContent = wallboxChargePower + " kw";
                    wallboxPlugStateDiv.textContent = wallboxPlugState;
                    if (wallboxPlugState === "Scollegata") {
                      wallboxPlugStateDiv.style.color = "red"; // Testo in rosso
                    } else {
                        wallboxPlugStateDiv.style.color = "green"; // Testo in verde
                    }

                    //boiler
                    boilerValuePowerDiv.textContent = boilerPower + " kw";


                      updateEnergyBar(roundValue(pvGeneration));
                      ChangeCarIcon(carState, wallboxChargePower);
                      boilerIcon(boilerPower);
                      updateArrowVisibility(roundValue(pvGeneration), roundValue(gridSensor), roundValue(homeConsumption), roundValue(batteryPVchargeDischarge));
                      updateBatteryLevel(batteryPVpercentage);
                      updateWeatherImage(roundValue(pvGeneration));
                      checkForEnergyAlert(roundValue(gridSensor), wallboxChargePower.value);

                  }

});
      function ChangeCarIcon(prismState, prismPower) {
        // console.log("prismState: " + prismState);
        // console.log("prismPower: " + prismPower);
        const carImage = document.getElementById('eletric-car-img');   
        const carValuePowerDiv = document.getElementById("unit-car-power");
     
        const carBlock = document.getElementById('car-div');
        if (prismPower > 0.2) {
          carBlock.style.visibility = 'visible';
        }
        else {
          carBlock.style.visibility = 'hidden';
        }
      }
  
      function boilerIcon(boilerPower) {
        const boilerImage = document.getElementById('boiler-img');   
        if (boilerPower > 0.2) {
          boilerImage.style.visibility = 'visible';
        }
        else {
          boilerImage.style.visibility = 'hidden';
        }
      }
  
      function setRoundValue(idHtml, value) {
        const element = document.getElementById(idHtml);
        if (value == "NaN" || value == "Undefined" || value == "undefined" || value == "Unavailable" || value == "unavailable" || value == 999) 
        {
          element.textContent = "...";
          console.log("elemento destinato a " + idHtml + " non trovato");
          return;
        }
        else if (value == "...") 
        {
          element.textContent = "...";
          return;
        }
        else {
          let numericValue;
          try {
            numericValue = parseFloat(value);
          } catch (e) {
            console.log("errore nel parsefloat: " + value);
            return;
          }
          const roundedValue = Math.round(numericValue * 10) / 10;
          element.textContent = roundedValue;
        }
      }
  
      function roundValue(value) {
        //console.log("value dentro roundValue: " + value);
        if (value == "..." || value == "NaN" || value == "Undefined" || value == "undefined" || value == "Unavailable" || value == "unavailable" || isNaN(value)) 
        {
          //console.log("errore letura valore durante il roundValue(): " + value);
          //console.log("OFFLINE");
          return "...";
        }
        let numericValue;
        try {
          numericValue = parseFloat(value);
        } catch (e) {
          console.log("errore nel parsefloat: " + value);
          return;
        }
        return Math.round(numericValue * 10) / 10;
      }
  
      function setBatteryValueSize(idHtml, value) {
        const element = document.getElementById(idHtml);
        const block = document.getElementById('battery-level-percentage-value');
        if (block == 100) {
          block.style.display = 'none';
        }
        else {
          block.style.display = 'block';
        }
        element.textContent = value;
      }

      function hasError(json) {
        // Verifica se l'oggetto JSON contiene la chiave "error" e se il suo valore non è vuoto
        if (json.hasOwnProperty('error') && json.error !== null && json.error !== undefined && json.error !== '') {
            return true; // Restituisce true se la chiave "error" non è vuota
        } else {
            return false; // Restituisce false altrimenti
        }
    }


    function showConnectionAPIAlert() {
      var bodyPage = document.getElementById("bodyPageWithoutAlert");
      if (bodyPage.style.filter !== 'blur(25px)') {
        bodyPage.style.filter = 'blur(25px)';
      }
      //else {console.log("effetto sfocato già impostato");}

      var alert = document.getElementById("internetConnectionAlert");
      alert.style.display = "block";
      if (alert.style.display !== 'block') {
        alert.style.display = 'block';
      }
      //else {console.log("alert visibile già impostato");}

    }

    // Funzione per ripristinare la pagina web e nascondere l'alert
    function hideConnectionAPIAlert() {
      var avviso = document.getElementById("internetConnectionAlert");
      avviso.style.display = "none";

      var avviso = document.getElementById("bodyPageWithoutAlert");
      avviso.style.filter = 'none';
    }
