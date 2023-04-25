import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as fs from "fs/promises";
import puppeteer from "puppeteer";

const MAIN_PAGE = "https://vertbet.com/en-US#login";
const EMAIL = "graberjetx@gmail.com";
const PASSWORD = "Password1234!";
const JETX_PAGE = "https://vertbet.com/en-US/casinos/game/jetx";

@Injectable()
export class PlannerService {
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const rawGames = await fs.readFile("/var/www/dev.oooi.app/jetx.txt", {
      encoding: "utf8"
    });

    let { games } = JSON.parse(rawGames);
    const games_100 = await this.getLast100Games();

    if (!games.length) {
      games = games.concat(games_100);
    } else {
      const last_25 = games.slice(-25);
      let LAST_INDEX = 0;
      games_100.forEach((item_1, index_1) => {
        if (item_1 === last_25[0]) {
          if (
            last_25.every(
              (item_2, index_2) => item_2 === games_100[index_1 + index_2]
            )
          ) {
            LAST_INDEX = index_1 + 25;
          }
        } else {
          return;
        }
      });
      games = games.concat(games_100.slice(LAST_INDEX));
    }
    await fs.writeFile(
      "/var/www/dev.oooi.app/jetx.txt",
      JSON.stringify({ games })
    );
  }

  async getLast100Games() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.goto(MAIN_PAGE);

    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector("#login");

    await page.type("input[data-aqa=login_input_email]", EMAIL);
    await page.type("input[data-aqa=login_input_password]", PASSWORD);

    await (await page.$("button[data-aqa=login_button_submit]")).press("Enter");

    await new Promise((r) => {
      setTimeout(() => {
        r(null);
      }, 15000);
    });

    await page.goto(JETX_PAGE);

    await page.waitForSelector("#game-iframe");
    await new Promise((r) => {
      setTimeout(() => {
        r(null);
      }, 15000);
    });

    const elementHandle = await page.$("iframe#game-iframe");
    const frame = await elementHandle.contentFrame();
    await frame.waitForSelector("iframe#game-frame");
    const JETX_GAME = await frame.$eval("iframe#game-frame", (e) =>
      e.getAttribute("src")
    );

    await page.goto(JETX_GAME);
    await page.waitForSelector("aside#left");
    await new Promise((r) => {
      setTimeout(() => {
        r(null);
      }, 1000);
    });
    const rawData = await page.$eval(
      ".history",
      (element) => element.innerHTML
    );

    await page.close();
    await browser.close();

    const reg_exp = /">([0-9]{1,4}.[0-9]{2})<\/div>/g;
    return [...rawData.matchAll(reg_exp)].map((m) => +m[1]).reverse();
  }
}
