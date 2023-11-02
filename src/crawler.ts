import puppeteer, { Page } from "puppeteer";

export async function crawlWebsite(page: Page, url: string) {
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (request.resourceType() === "image") {
      request.abort();
    } else {
      request.continue();
    }
  });

  // Navigate the page to a URL
  await page.goto(url, { waitUntil: "networkidle0" });

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  );
  await page.setJavaScriptEnabled(true);

  // Query for an element handle.
  // const element = await page.waitForSelector("::-p-xpath(body)");
  const htmlWithDoctype = await page.content();
  // Remove the doctype declaration from the HTML content
  const contentWithoutDoctype = htmlWithDoctype.replace(/^<!DOCTYPE[^>]+>/, "");

  return contentWithoutDoctype;
}
