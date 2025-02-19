"use strict"

import env from "src/app/core/env"

require("regenerator-runtime/runtime")

const isWsl = require("is-wsl")

const {promisify} = require("util")
const childProcess = require("child_process")
const path = require("path")

const pExecFile = promisify(childProcess.execFile)

// Convert a path from WSL format to Windows format:
// `/mnt/c/Program Files/Example/MyApp.exe` → `C:\Program Files\Example\MyApp.exe``
const wslToWindowsPath = async (path) => {
  const {stdout} = await pExecFile("wslpath", ["-w", path])
  return stdout.trim()
}

type Opts = {
  app?: string | string[]
  newWindow?: boolean
  wait?: boolean
}

type ChildProcessOpts = {
  stdio?: string
  detached?: boolean
}

export default async function open(target: string, options?: Opts) {
  if (typeof target !== "string") {
    throw new TypeError("Expected a `target`")
  }

  options = {
    wait: false,
    newWindow: false,
    ...options
  }

  let command
  let appArguments = []
  const cliArguments = []
  const childProcessOptions: ChildProcessOpts = {}

  if (Array.isArray(options.app)) {
    appArguments = options.app.slice(1)

    options.app = options.app[0]
  }

  if (env.isMac) {
    command = "open"

    if (options.newWindow) {
      cliArguments.push("-n")
    }

    if (options.wait) {
      cliArguments.push("-W")
    }

    if (options.app) {
      cliArguments.push("-a", options.app)
    }
  } else if (env.isWindows || isWsl) {
    command = "cmd" + (isWsl ? ".exe" : "")
    cliArguments.push("/c", "start", '""', "/b")
    target = target.replace(/&/g, "^&")

    if (options.wait) {
      cliArguments.push("/wait")
    }

    if (options.app) {
      if (isWsl && options.app.startsWith("/mnt/")) {
        const windowsPath = await wslToWindowsPath(options.app)
        options.app = windowsPath
      }

      cliArguments.push(options.app)
    }

    if (appArguments.length > 0) {
      cliArguments.push(...appArguments)
    }
  } else {
    if (options.app) {
      command = options.app
    } else {
      const useSystemXdgOpen =
        process.versions.electron || process.platform === "android"
      command = useSystemXdgOpen ? "xdg-open" : path.join(__dirname, "xdg-open")
    }

    if (appArguments.length > 0) {
      cliArguments.push(...appArguments)
    }

    if (!options.wait) {
      // `xdg-open` will block the process unless stdio is ignored
      // and it's detached from the parent even if it's unref'd.
      childProcessOptions.stdio = "ignore"
      childProcessOptions.detached = true
    }
  }

  cliArguments.push(target)

  if (env.isMac && appArguments.length > 0) {
    cliArguments.push("--args", ...appArguments)
  }

  const subprocess = childProcess.spawn(
    command,
    cliArguments,
    childProcessOptions
  )

  if (options.wait) {
    return new Promise((resolve, reject) => {
      subprocess.once("error", reject)

      subprocess.once("close", (exitCode) => {
        if (exitCode > 0) {
          reject(new Error(`Exited with code ${exitCode}`))
          return
        }

        resolve(subprocess)
      })
    })
  }

  subprocess.unref()

  return subprocess
}
