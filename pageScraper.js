const fs = require("fs");
const index = require("./index");

const scraperObj = {
        async scraper(browser, url){
            let page = await browser.newPage();
            await page.goto(url);

            //wait for the required part of the page to be rendered
            await page.waitForSelector('[id="l-searchResults"]');

            let propertyData = {};

            //check if there is a sponsored property
            propertyData['sponsored'] = null;
            try{
                propertyData['sponsored'] = await page.waitForSelector('.propertyCard--featured');
            }
            catch{}


            //get the address of all properties
            propertyData['addresses'] = await page.$$eval('.propertyCard-address', addresses => addresses.map(address => address.textContent));


            //get the property information of all properties
            propertyData['information'] = await page.$$eval('.property-information', information => information.map(information => information.textContent));
            
            if (propertyData['sponsored']){
                propertyData['information'].shift();
            }

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
                    if (splitInformation[1]){
                        numBeds = splitInformation[1].split(' ')[0].length;
                    }
                    if (splitInformation[2]){
                        numBaths = splitInformation[2].split(' ')[0].length;
                    }
                }
                catch (err){
                    console.log(err)
                }
                if (splitInformation[0]){
                    propertyData['types'].push(splitInformation[0]);
                }
                else{
                    propertyData['baths'].push("Unspecified type of property");
                }
                if (splitInformation[1]){
                    propertyData['beds'].push(splitInformation[1].slice(0, -numBeds));
                }
                else{
                    propertyData['baths'].push("Unspecified number of bathrooms");
                }
                if (splitInformation[2]){
                    propertyData['baths'].push(splitInformation[2].slice(0, -numBaths));
                }
                else{
                    propertyData['baths'].push("Unspecified number of bathrooms");
                }
            }


            //get the prices of all properties per month
            propertyData['pricesPerMonth'] = await page.$$eval('.propertyCard-priceValue', pricesPerMonth => pricesPerMonth.map(price => price.textContent));
            
            
            //get the prices of all properties per week
            propertyData['pricesPerWeek'] = await page.$$eval('.propertyCard-secondaryPriceValue', pricesPerWeek => pricesPerWeek.map(price => price.textContent));
            

            //get the links of all properties
            propertyData['links'] = await page.$$eval('.propertyCard-link', links => links.map(link => {
                if (link.getAttribute("href") != null && link != null){
                    return ("https://www.rightmove.co.uk" + link.getAttribute("href"))
                }
            }));
            propertyData['links'] = propertyData['links'].filter(function(v, i){ return i % 2 == 0});
            

            if (propertyData['sponsored']){
                propertyData['addresses'].shift(); //remove the sponsored property (because it changes every search)
                propertyData['pricesPerMonth'].shift();
                propertyData['pricesPerWeek'].shift();
                propertyData['links'].shift();
            }

            var url;
            var json = require('./settings.json');
            var settingsObj = JSON.parse(JSON.stringify(json));
            urls = settingsObj.urls;
            
            var text = fs.readFileSync("./foundProperties.txt").toString('utf-8');
            var textByLine = text.split(/\r\n|\n/);
            
            for (i = 0; i < propertyData['information'].length; i++){
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