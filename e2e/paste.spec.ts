import { test, expect } from "@playwright/test";
import { login } from "./helpers/login.js";

// Playwright can't yet copy to clipboard, so this is a workaround.
// https://github.com/microsoft/playwright/issues/15860
async function clipboardCopy(page, text) {
  await page.locator("#note").fill(text);
  await page.locator("#note").focus();
  await page.keyboard.press(`Control+KeyA`);
  await page.keyboard.press(`Control+KeyC`);
  await page.keyboard.press(`Delete`);
}

// Playwright can't yet paste from clipboard, so this is a workaround.
// https://github.com/microsoft/playwright/issues/15860
async function clipboardPaste(page) {
  await page.keyboard.press(`Control+KeyV`);
}

test("pastes text in the upload input", async ({ page }) => {
  await login(page);

  await clipboardCopy(page, "I'm pasting dummy text!");
  await page.locator("#pastebox").focus();
  await clipboardPaste(page);

  await expect(page.locator("#upload-result .message-body")).toHaveText(
    "Upload complete!"
  );
  await expect(page.locator("#upload-result upload-links")).toHaveAttribute(
    "filename",
    /pasted-.*/
  );
  await expect(
    page.locator("#upload-result upload-links #verbose-link-box #link")
  ).toBeVisible();
  await expect(
    page.locator("#upload-result upload-links #short-link-box #link")
  ).toBeVisible();

  await page.locator(".navbar a[href='/files']").click();
  await expect(
    page.locator(".table tbody tr:first-child [test-data-id='filename']")
  ).toHaveText(/pasted-.*/);
  await expect(
    page.locator(".table tbody tr:first-child [test-data-id='note']")
  ).toHaveCount(0);

  await page
    .locator(".table tbody tr:first-child [test-data-id='filename'] a")
    .click();

  await expect(await page.innerText("body")).toEqual("I'm pasting dummy text!");
});

test("pastes text in the upload input that requires UTF-8", async ({
  page,
}) => {
  await login(page);

  await clipboardCopy(page, "璇疯緭鍏ユ偍鐨勯棶棰橈細");
  await page.locator("#pastebox").focus();
  await clipboardPaste(page);

  await expect(page.locator("#upload-result .message-body")).toHaveText(
    "Upload complete!"
  );
  await expect(page.locator("#upload-result upload-links")).toHaveAttribute(
    "filename",
    /pasted-.*/
  );
  await expect(
    page.locator("#upload-result upload-links #verbose-link-box #link")
  ).toBeVisible();
  await expect(
    page.locator("#upload-result upload-links #short-link-box #link")
  ).toBeVisible();

  await page
    .locator("#upload-result upload-links #verbose-link-box #link")
    .click();

  await expect(await page.innerText("body")).toEqual(
    "璇疯緭鍏ユ偍鐨勯棶棰橈細"
  );
});
