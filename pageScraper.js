const scraperObject = {
    url: 'https://visitindy.com/indianapolis-things-to-do-events',
    async scraper(browser){
        let page = await browser.newPage(); // <-- this creates new page instance in the browser
        let pageNumber = 1;
        console.log(`Navigating to ${this.url}`);
        await page.goto(this.url);
        let scrapedData = [];
        // Waiting for required DOM to render
        await page.type('#search_whattodo_from', '04/15/2021') // finds date picker and types desired date to search from
        async function scrapeCurrentPage() {
            await page.waitForSelector('.container'); // waiting for div with class container to load
            
            // Getting link to all events
            let urls = await page.$$eval('.row .list-grid-item > h3', links => { // diving into grid class container all the way to h3
            // Make sure event has proper url
            links = links.filter(link => link.querySelector('a').href.includes('visitindy'));
            // Extracting links from data
            links = links.map(el => el.querySelector('a').href) // diving into h3 to get the href of a
            return links;
            });

            // Looping through each link to begin new instance and get needed data
            let pagePromise = (link) => new Promise(async(resolve, reject) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                dataObj['eventTitle'] = await newPage.$eval('.col-12 > h1', text => text.textContent.replace(/(\r\n\t|\t|\n|\r)/gm,"")); // .replace to remove new lines and tab spaces
                dataObj['eventPage'] = link;
                dataObj['eventLocation'] = await newPage.$eval('.col-12 > .h4 > a', text => text.textContent.replace(/(\r\n\t|\t|\n|\r)/gm,""));
                dataObj['eventAddress'] = await newPage.$eval('.col-12 > .h1', text => text.textContent.replace(/(\r\n\t|\t|\n|\r)/gm,""));
                dataObj['eventDate'] = await newPage.$eval('.col-12 > p:last-child', text => text.textContent.replace(/(\r\n\t|\t|\n|\r)/gm,"")); // p tags have no way of grabbing specific classes or idå luckily it was the last tag that I needed
                resolve(dataObj);
                await newPage.close(); //loops through each url, grabs data needed and closes page before opening next page
            }); // wrapped in promise to be able to wait for each action in loop to complete. Promise wont resolve until data is scraped and page is closed.

            for(link in urls){
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
            }
            // When all the required data on this page is scraped, click the next button and start the scraping of the next page
            // Checking if this button exists first to know if there really is a next page.
            let nextButtonExist = false;
            try {
                const nextButton = await page.$eval('.pagination > .next_page', a => a.textContent);
                nextButtonExist = true;
            } catch (error) {
                nextButtonExist = false;
            }
            if(nextButtonExist && pageNumber === 1){
                await page.click('.pagination > .next_page');
                pageNumber = pageNumber + 1;
                return scrapeCurrentPage(); // calling this function recursively
            }
            await page.close();
            return scrapedData;
        }
        let data = await scrapeCurrentPage();
        console.log('data', data);
        return data;
    }
}

module.exports = scraperObject;