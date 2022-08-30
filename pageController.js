const pageScraper = require('./pageScraper')

async function scrapeAll(browserInstance, url){
    let browser;
    try {
        browser = await browserInstance;
        await pageScraper.scraper(browser, url);
    }
    catch (err){
        console.log(err);
    }
}

module.exports = (browserInstance, url) => scrapeAll(browserInstance, url)