const pup = require('puppeteer')

async function startBrowser(){
    let browser;
    try {
        console.log("Opening a browser..")
        browser = await pup.launch({
            headless: true,
            args: ["--disable-setuid-sandbox"],
            'ignoreHTTPSErrors': true
        });
    }
    catch (err) {
        console.log(err);
    }
    return browser;
}


module.exports = {
    startBrowser
}