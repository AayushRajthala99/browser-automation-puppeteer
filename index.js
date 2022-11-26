import puppeteer from 'puppeteer';
import {
    promises as fsPromises
} from 'fs';
import {
    lookup
} from 'dns-lookup-cache';

//URL REGEX...
const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

(async () => {
    try {
        //Browser Initialization...
        const browser = await puppeteer.launch({
            headless: true
        });

        //Reading URLs from .txt file...
        let urlList = await fsPromises.readFile('urls.txt', 'utf-8');

        //Filtering Invalid URLs...
        urlList = await filterUrl(urlList);
        // console.log("Query URLs === ", urlList);

        let promises = [];
        urlList.forEach(async url => {
            promises.push(screenshotPage(browser, url));
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

async function filterUrl(urls) {
    //Transforming String into Array...
    let urlList = urls.split(/\r?\n/);
    let newUrlList = [];

    // for (let i = 0; i < urlList.length; i++) {
    //     urlList[i] = urlFormatter(urlList[i]);
    // }

    urlList.forEach(async url => {
        await Promise.all([await dnslooker(url)])
            .then((result) => {
                newUrlList = newUrlList.concat(result);
            })
    })
    console.log("Filtered URLs", newUrlList);
    return urlList;
}

async function dnslooker(url) {
    return new Promise(function (resolve, reject) {
        lookup(url, {
            all: false,
            family: 4
        }, (error, address) => {
            if (error === null && address !== undefined) {
                console.log("RESULT===", url);
                resolve(url);
            }
        });
    })
}

async function screenshotPage(browser, url) {
    //Page Initialization...
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    return new Promise(async function (resolve, reject) {
        //Formatting URL...
        url = urlFormatter(url);

        //Page Navigation...
        await page.goto(url, {
            timeout: 30000,
            waitUntil: 'load'
        });

        //Screenshot Filename Generation...
        let date = new Date();
        let fileString = (url.length <= 13) ? url.slice(8, 10) : url.slice(8, 14);
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

function urlFormatter(url) {
    if (!(url.includes('https://')) && url !== '') {
        url = 'https://' + url;
    }
    return url;
}