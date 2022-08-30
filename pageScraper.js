const fs = require("fs");
const index = require("./index");

const scraperObj = {
        async scraper(browser, url){
            let page = await browser.newPage();
            console.log(`Navigating to ${url}...`);
            await page.goto(url);

            //wait for the required part of the page to be rendered
            await page.waitForSelector('[id="l-searchResults"]');

            let propertyData = {};

            //get the address of all properties
            propertyData['addresses'] = await page.$$eval('.propertyCard-address', addresses => addresses.map(address => address.textContent));
            propertyData['addresses'].shift(); //remove the sponsored property (because it changes every search)

            //get the property information of all properties
            propertyData['information'] = await page.$$eval('.property-information', information => information.map(information => information.textContent));
            propertyData['information'].shift();

            propertyData['types'] = [];
            propertyData['beds'] = [];
            propertyData['baths'] = [];
            for (i = 0; i < propertyData['information'].length; i++){
                splitInformation = propertyData['information'][i];
                if (propertyData['information'][i].includes('|')){
                    splitInformation = propertyData['information'][i].split('|');
                }
                numBeds = 1
                numBaths = 1
                try{
                    numBeds = splitInformation[1].split(' ')[0].length;
                    numBaths = splitInformation[2].split(' ')[0].length;
                }
                catch (err){
                }
                console.log(splitInformation[2]);
                if (splitInformation[0] != null && splitInformation[1] != null && splitInformation[2] != null){
                    propertyData['types'].push(splitInformation[0]);
                    propertyData['beds'].push(splitInformation[1].slice(0, -numBeds));
                    propertyData['baths'].push(splitInformation[2].slice(0, -numBaths));
                }
            }


            //get the prices of all properties per month
            propertyData['pricesPerMonth'] = await page.$$eval('.propertyCard-priceValue', pricesPerMonth => pricesPerMonth.map(price => price.textContent));
            propertyData['pricesPerMonth'].shift();
            
            //get the prices of all properties per week
            propertyData['pricesPerWeek'] = await page.$$eval('.propertyCard-secondaryPriceValue', pricesPerWeek => pricesPerWeek.map(price => price.textContent));
            propertyData['pricesPerWeek'].shift();

            //get the links of all properties
            propertyData['links'] = await page.$$eval('.propertyCard-link', links => links.map(link => {
                if (link.getAttribute("href") != null && link != null){
                    return ("https://www.rightmove.co.uk" + link.getAttribute("href"))
                }
            }));
            propertyData['links'] = propertyData['links'].filter(function(v, i){ return i % 2 == 0});
            propertyData['links'].shift();

            for (i = 0; i < propertyData['links'].length; i++){
                console.log(propertyData['links'][i]);
            }
            

            var url;
            var json = require('./settings.json');
            var settingsObj = JSON.parse(JSON.stringify(json));
            urls = settingsObj.urls;
            
            var text = fs.readFileSync("./foundProperties.txt").toString('utf-8');
            var textByLine = text.split(/\r\n|\n/);
            
            for (i = 0; i < propertyData['links'].length; i++){
                if (!textByLine.includes(propertyData['links'][i])){
                    fs.appendFile('./foundProperties.txt', propertyData['links'][i] + "\n", function(err){
                        if (err){
                            console.log(err);
                        }
                    });
                index.sendProperty(propertyData['addresses'][i], propertyData['types'][i], propertyData['beds'][i], propertyData['baths'][i], propertyData['pricesPerMonth'][i], propertyData['pricesPerWeek'][i], propertyData['links'][i])
                }
            }
        }
}


module.exports = scraperObj;