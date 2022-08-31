require("dotenv").config()
const fs = require("fs");
const Discord = require("discord.js");
const { response } = require("express");
const client = new Discord.Client()
const express = require('express');
const webserver = express();
webserver.set('port', (5000));
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('ok');
});
server.listen(process.env.PORT || 5000);

const pup = require('puppeteer')
const browserObj = require('./browser')
const scraperController = require('./pageController')

var propertiesChannel;


client.on("ready", () =>{
    console.log("bot alive");

    // Set the presence
    const activity = {
        name: 'Looking for properties...',
        type: 'PLAYING',
        timestamps: {
            start: Date.now(),
        },
    };
    client.user.setPresence({
        pid: process.pid,
        activity: activity,
        status: 'online',
    });

    try{
        propertiesChannel = client.channels.cache.find(channel => channel.name === "properties");
    }
    catch{}

})


  
let browserInstance = browserObj.startBrowser();

function reply(message, content){
    client.api.channels[message.channel.id].messages.post({
        data: {
          content: content,
          message_reference: {
            message_id: message.id,
            channel_id: message.channel.id,
            guild_id: message.guild.id
          }
        }
      })
}

client.on("message", message => {
    if (message.author.bot){
        return;
    }
    let prefix = "!"
    if (message.content.startsWith(prefix)){
        const args = message.content.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        if (command == "help"){
                  reply(message, "**PropertySearchBot Help Guide:**\n**MAKE SURE TO HAVE A CHANNEL CALLED properties (make sure it is lower-case). BOT WON'T WORK WITHOUT THIS!**\n\n**Rightmove commands:**\nNOTE: To search with Rightmove, you must first go to Rightmove on a web-browser, search for properties in an area and add any filters you want, and then copy the URL.\n• **!update rightmove *url*** - This will update the bot to start searching **Rightmove** properties based on the URL you provided.\n• **!search rightmove** - This will force the bot to search **Rightmove** properties based on the URL you have provided. The bot automatically searches every 4 minutes, but this command allows you to manually force the bot to make a new search.")
        }
        if (command == "update"){
            if (!args.length){
                return reply(message, "You must say which service you are updating and then provide a URL to update it.\n\n*Example:*\n!update rightmove *url*")
            }
            if (args[0] == "rightmove"){
                if (args[1] != null){
                    if ((args[1].includes("https") || args[1].includes("http")) && args[1].includes("www.rightmove.co.uk")){
                        updateURL(args[1], message);
                    }
                    else{
                        reply(message, "The URL you provided is not a valid Rightmove URL!");
                    }
                }
                else{
                    reply(message, "You must provide a URL to update the search for Rightmove properties!");
                }
            }
        }
        if (command == "search"){
            if (!args.length){
                return reply(message, "You must say which service you want to force a search from.\n\n*Example:*\n!search rightmove");
            }
            if (args[0] == "rightmove"){
                reply(message, "Forcing a search on Rightmove!");
                searchURL();
            }
        }
    }
})

var url;
var json = require('./settings.json');
var settingsObj = JSON.parse(JSON.stringify(json));
url = settingsObj.url;

async function updateURL(updateUrl, message){
    try{
        var json = require('./settings.json');
        var settingsObj = JSON.parse(JSON.stringify(json));
        settingsObj.url = updateUrl;
        url = updateUrl;

        await fs.writeFileSync('./settings.json', JSON.stringify(settingsObj));
        
        reply(message, "Successfully updated the URL!");
        searchURL();
    }
    catch (err){
        console.log(err);
        reply(message, "Error updating URL: " + err);
    }

}

function searchURL(){
    try{        
        scraperController(browserInstance, url);
    }
    catch (err){
        console.log(err);
    }
}

searchURL();
const clock = setInterval(searchURL, 240000)



function sendProperty(address, type, bed, bath, pricePerMonth, pricePerWeek, link){
    try{
        if (propertiesChannel){
            propertiesChannel.send(`**${address}**\n\n${type} | ${bed} | ${bath}\n\n**${pricePerMonth}**\n(${pricePerWeek})\n\nLink: ${link}`)
        }
    }
    catch (err){
        console.log(err);
    }


}


module.exports.sendProperty = (address, type, bed, bath, pricePerMonth, pricePerWeek, link) => sendProperty(address, type, bed, bath, pricePerMonth, pricePerWeek, link);

client.login(process.env.TOKEN)