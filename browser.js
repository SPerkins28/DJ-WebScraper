const puppeteer = require('puppeteer');

async function startBrowser(){
    let browser;
    try {
        console.log("Opening the browser.......");
        browser = await puppeteer.launch({      // method launches an instance of a browser and returns a Promise -- making sure it resolves using await
            headless: true,   // false used for running the browser with an interface to watch the script run (for testing purposes)
            // args: ["--disable-setuid-sandbox"],
            // 'ignoreHTTPSErrors': true       // setting to true allows to visit sites that aren't hosted over a secure HTTPS protocol and ignores errors
        });
    } catch (error) {
        console.log("Could not create a browser instance => : ", err);
    }
    return browser;
}

module.exports = {
    startBrowser
};