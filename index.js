// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token, relic_channel } = require("./config.json");
const ordisQuote = require("./quotes.json");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Download the warframe json data
function getWarframeData() {
  fetch("http://content.warframe.com/dynamic/worldState.php")
    .then((response) => {
      return response.json;
    })
    .catch(function (err) {
      console.log("Unable to fetch -", err);
    });
}

class Relic {
  constructor(json) {
    this.hard = json.Hard === true
    this.modifier = {VoidT1:"Lith", VoidT2:"Meso", VoidT3:"Neo", VoidT4:"Axi", VoidT5:"Requiem"}[json.Modifier];
    this.modifierIcon ={
      VoidT1:"<:lith:1192868176036364358>",
      VoidT2:"<:meso:1192868214758178936>",
      VoidT3:"<:neo:1192868235238985818>",
      VoidT4:"<:neo:1192868255786868798>",
      VoidT5:"<:requiem:1192868272094318693>"
    }[json.Modifier];
    this.missionType = {
      MT_SURVIVAL:"Survival",
      MT_RESCUE:"Rescue",
      MT_EXTERMINATION:"Extermination",
      MT_INTEL:"Spy",
      MT_DEFENSE:"Defense",
      MT_CAPTURE:"Capture",
      MT_TERRITORY:"Interception",
      MT_ARTIFACT:"Disruption",
      MT_MOBILE_DEFENSE:"Mobile Defense",
      MT_SABOTAGE:"Sabotage",
      MT_EXCAVATE:"Excavation",
      MT_ASSAINATION:"Assasination",
      MT_DISRUPTION:"Disruption",
      MT_HIVE:"Hive"
    }[json.MissionType];
  }
}

// Grab warframe relic data every 1m
let relicTimer = setInterval(() => {
    let relicMessage = "";
    client.channels.fetch(relic_channel)
      .then(channel => {
        fetch("http://content.warframe.com/dynamic/worldState.php")
          .then(response => response.json())
          // Format the data into a message
          .then(json => {
            for (let i = 0; i < Object.keys(json.ActiveMissions).length; i++) {
                let relicObj = new Relic(json.ActiveMissions[i]);
              relicMessage = relicMessage + `${relicObj.modifierIcon} -*** ${relicObj.missionType}***${relicObj.hard === true ? " <:steelpath:1192865952912646297>" : ""}\n`
              // log the raw data to console if the mission type isnt specified in ./config.json
              // if (relicObj.missionType == undefined){
              //   console.log(json.ActiveMission[i].MissionType);
              // }
            }
            // clear the channel of prior messages
            channel.bulkDelete(5);
            // wait 1s, then send the message in the channel specified in ./config.json
            setTimeout(() => {
              channel.send(relicMessage);
              console.log("ORDIS >> Updated relics");
            }, 1000);
          })
          .catch(function (err) {
            console.log("ORDIS >> Unable to fetch -", err);
          });
      })
      .catch(console.error);
  }, 60000);

// choose a random status from ./quotes.json
// function getRandomQuote(){
//   return ordisQuote[Math.floor(Math.random() * ordisQuote.length)]
// }

// Update status every 5m
let quoteTimer = setInterval(() => {
  client.user.setPresence({ activities: [{ name: ordisQuote[Math.floor(Math.random() * ordisQuote.length)] }], status: 'online' });
  console.log('ORDIS >> Updated status')
}, 300000);


// When the client is ready, run this code (only once).
client.once(Events.ClientReady, (readyClient) => {
  console.log(`ORDIS >> Hello, operator.`);
  client.user.setPresence({ activities: [{ name: 'Warframe' }], status: 'online' });
});

// Log in to Discord with your client's token
client.login(token);
