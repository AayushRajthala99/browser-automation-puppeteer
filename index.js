import puppeteer from 'puppeteer';
import {
    promises as fsPromises
} from 'fs';

(async () => {
    //Browser Initialization...
    const browser = await puppeteer.launch({
        headless: false
    });

    //Page Initialization...
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    //Reading URLs from .txt file...
    let testurl = await fsPromises.readFile('urls.txt', 'utf-8');

    //Page Navigation...
    await page.goto('https://' + testurl, {
        "waitUntil": "load"
    });

    //Page Terminated...
    await page.close();

    //Browser Terminated...
    await browser.close();
})();