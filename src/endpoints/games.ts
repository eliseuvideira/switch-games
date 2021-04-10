import { endpoint } from '@ev-fns/endpoint';
import puppeteer from 'puppeteer';

const isVisible = async (
  page: puppeteer.Page,
  selector: string,
  timeout = 500,
) => {
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
  } catch (err) {
    return false;
  }
  return true;
};

export const gamesGetMany = endpoint(async (req, res) => {
  const browser = await puppeteer.launch({
    headless: !!+(process.env.HEADLESS || 0),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  try {
    const pages = await browser.pages();
    const page = pages[0];

    await page.setUserAgent(process.env.USER_AGENT || '');

    await page.goto('https://www.nintendo.com/games/game-guide/');

    await page.waitForSelector('.platform legend');
    await page.click('.platform legend');

    await page.waitForSelector(
      '[data-attribute="platform"][data-value="Nintendo Switch"]',
    );
    await page.click(
      '[data-attribute="platform"][data-value="Nintendo Switch"]',
    );
    await page.waitForNavigation();

    while (await isVisible(page, '#btn-load-more', 3000)) {
      try {
        await page.waitForSelector('#btn-load-more', { timeout: 200 });
        await page.click('#btn-load-more');
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (err) {
        console.error(err);
      }
    }

    const items = await page.evaluate(() => {
      const tiles = Array.from(document.querySelectorAll('game-tile'));

      return tiles.map((tile: any) => ({
        platform: tile.platform,
        date: tile.date,
        link: 'https://nintendo.com' + tile.href,
        cover: tile.image,
        title: tile.querySelector('h3')?.textContent || '',
        price: tile.msrp,
      }));
    });

    res.status(200).json(items);
  } finally {
    await browser.close();
  }
});
