import puppeteer from 'puppeteer';
import {
    promises as fsPromises
} from 'fs';

(async () => {
    try {
        //Browser Initialization...
        const browser = await puppeteer.launch({
            headless: false
        });

        //Reading URLs from .txt file...
        let urlList = await fsPromises.readFile('urls.txt', 'utf-8');

        //Transforming String into Array...
        urlList = urlList.split(/\r?\n/);

        async function screenshotPage(url) {
            //Page Initialization...
            const page = await browser.newPage();
            await page.setViewport({
                width: 1920,
                height: 1080
            });

            return new Promise(async function (resolve, reject) {
                //Page Navigation...
                await page.goto('https://' + url, {
                    timeout: 60000,
                    waitUntil: 'load'
                });

                //Screenshot Save Filename Generation...
                let date = new Date();
                let fileString = (url.length <= 5) ? url.slice(0, 2) : url.slice(0, 6);
                date = date.toISOString().slice(0, 20);
                date = date.replaceAll('-', '');
                date = date.replaceAll(':', '');

                //Page Screenshot Operation...                
                let filePath = './screenshots/' + fileString + '-' + date + '.png';
                await page.screenshot({
                    path: filePath,
                    fullPage: true
                });

                // Page Terminated...
                await page.close();

                resolve({
                    url: url,
                    status: 'Success',
                    error: null
                });
            }).catch((error) => {
                return {
                    url: url,
                    status: 'Failed',
                    error: error
                }
            })
        }

        let promises = [];

        urlList.forEach(url => {
            promises.push(screenshotPage(url));
        })

        await Promise.all(promises)
            .then((result) => {
                console.log(result);
            })
            .catch((err) => {
                console.log("Promise Error: ", err);
            })
        await browser.close();
    } catch (error) {
        console.log("Error: ", error);
    }
})();