import {expect, test} from "@playwright/test"

test("home page", async ({page}) => {
    await page.goto("localhost:3000")
    await expect(page).toHaveTitle("trmnl | home")

    await expect(page.getByRole("heading", {name: "Home"})).toBeVisible()
})
