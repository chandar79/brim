import {ipcMain} from "electron"
import keytar from "keytar"
import * as os from "os"

export default function() {
  ipcMain.handle("secrets:setKey", (e, {key, val}) => {
    return keytar.setPassword(key, os.userInfo().username, val)
  })
  ipcMain.handle("secrets:getKey", (e, {key}) => {
    return keytar.getPassword(key, os.userInfo().username)
  })
  ipcMain.handle("secrets:deleteKey", (e, {key}) => {
    return keytar.deletePassword(key, os.userInfo().username)
  })
}
