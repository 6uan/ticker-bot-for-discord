console.log("LOADING...");

require("dotenv").config();
const { DISCORD_TOKEN, DISCORD_ID } = process.env;
const axios = require("axios");
const cheerio = require("cheerio");
const https = require("https");

const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences] });
client.login(DISCORD_TOKEN).catch(console.error);

const REFRESH_TIME = 60000;

function setNickname(nickname) {
    const guilds = client.guilds.cache.forEach(guild => {
        let me = guild.members.cache.get(DISCORD_ID);
        me.setNickname(nickname);
    });
}

function setStatus(status) {
    client.user.setPresence({ activities: [{ name: status, type: ActivityType.Watching }], status: 'online'});
}

function monitor() {
    console.log("UPDATING DATA...");
    
    let httpsAgent = new https.Agent({keepAlive: true});
    axios.get("https://coinmarketcap.com/currencies/magic-token/", {
        httpsAgent
    }).then((res) => {
        const $ = cheerio.load(res.data);
        const price = $(".priceTitle > div > span");
        const percent = $(".priceTitle > span");
        const change = $(".priceTitle > span > span");
        let prefix = "+";
        if (change[0].attribs.class.includes("down")) {
            prefix = "-";
        }

        setNickname(`${price.text().replace("$", "")} USD`);
        setStatus(`MAGIC | 24h: ${prefix}${percent.text()}`);
        setTimeout(monitor, REFRESH_TIME);
    }).catch((err) => {
        console.log(err);
        setTimeout(monitor, REFRESH_TIME);
    });
}

client.on("ready", async function() {
    console.log("ONLINE");
    monitor();
});