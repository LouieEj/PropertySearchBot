const pup = require('puppeteer')

async function startBrowser(){
    let browser;
    try {
        console.log("Opening a browser..")
        browser = await pup.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
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