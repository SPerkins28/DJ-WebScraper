const pageScraper = require('./pageScraper');
const fs = require('fs'); // allows saving of scraped data as a JSON file

async function scrapeAll(browserInstance){
    let browser;
    try{
        browser = await browserInstance;
        let scrapedData = {};
        scrapedData = await pageScraper.scraper(browser);
        console.log('browser', scrapedData);
        await browser.close();
        fs.writeFile('data.json', JSON.stringify(scrapedData), 'utf8', function(err) { // this function creates the file data.json once all data is scraped and the browser closes
            if(err) {
                return console.log(err);
            }
            console.log("The data has been scraped and saved successfully! View it at './data.json' ");
        });
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)

//exporting browserInstance passing it to scrapeAll() then passes instance to pageScraper.scraper() as an arg to scrape pages