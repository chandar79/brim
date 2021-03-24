import {htmlContextMenu} from "src/js/test/locators"
import lib from "../../src/js/lib"
import {Locator} from "../../src/js/test/createLocator"
import appStep from "./appStep/api"
import waitForHook from "./appStep/api/waitForHook"
// TODO in a future PR: remove direct logStep uses here.
import logStep from "./appStep/util/logStep"
import {retryUntil} from "./control"
import newAppInstance from "./newAppInstance"

export default (name: string) => {
  let app
  let testIdx = 0

  beforeAll(async () => {
    app = await newAppInstance(name, ++testIdx)
    await appStep.startApp(app)
  })

  afterAll(async () => {
    if (app && app.isRunning()) await app.stop()
  })

  return {
    $(locator: Locator) {
      return app.client.$(locator.css)
    },

    hook(name, opts?) {
      return waitForHook(app, name, opts)
    },

    getApp() {
      return app
    },

    ingest(file: string) {
      return appStep.ingestFile(app, file)
    },

    mockSaveDialog(value: {
      canceled: boolean
      filePath: string | null | undefined
    }) {
      return app.mainProcess.emit(
        "spectron:mock",
        "windows:showSaveDialog",
        value
      )
    },

    setValue(locator: Locator, value: string) {
      return logStep(`set input ${locator.css} to ${value}`, async () => {
        const el = await app.client.$(locator.css)
        await el.waitForDisplayed()
        return el.setValue(value)
      })
    },

    getText(locator: Locator) {
      return logStep(`get text from ${locator.css}`, async () => {
        const el = await app.client.$(locator.css)
        await el.waitForDisplayed()
        return el.getText()
      })
    },

    clickAppMenuItem(id: string) {
      return app.mainProcess.emit("spectron:clickAppMenuItem", id)
    },

    async clickContextMenuItem(text: string) {
      const menu = await this.$(htmlContextMenu)
      const item = await menu.$(`li=${text}`)
      return item.click()
    },

    search(input: string) {
      return appStep.search(app, input)
    },

    click(locator: Locator) {
      return appStep.click(app, locator.css)
    },

    rightClick(locator: Locator) {
      return appStep.rightClick(app, locator.css)
    },

    waitForText(locator: string, regex: RegExp) {
      return retryUntil(
        async () => (await app.client.$(locator)).getText(),
        (s) => regex.test(s)
      )
    },

    // waitForHTMLText will seek out html instead of visible text, use for hidden elements
    waitForHTMLText(locator: string, regex: RegExp) {
      return retryUntil(
        async () => (await app.client.$(locator)).getHTML(false),
        (s) => regex.test(s)
      )
    },

    async isVisible(locator: Locator) {
      return !!(await (await app.client.$(locator.css)).isDisplayed())
    },

    async isNotVisible(locator: Locator) {
      return !(await (await app.client.$(locator.css)).isDisplayed())
    },

    wait(ms: number) {
      return lib.sleep(ms)
    }
  }
}
