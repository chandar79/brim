const {spawn} = require("child_process")

class Sub {
  constructor(bin, args) {
    this.p = spawn(bin, [args], {
      shell: true
    })
    this.p.stdout.on("data", (data) => {
      if (this.waiting) return
      console.log(data.toString())
    })
    this.p.stdout.on("error", (e) => {
      if (this.waiting) return
      console.log(e)
    })
    this.p.stderr.on("data", (data) => {
      if (this.waiting) return
      console.log(data.toString())
    })
  }

  waitForOutput(pattern, debug) {
    this.waiting = true
    return new Promise((res, rej) => {
      this.p.stdout.on("data", (d) => {
        if (debug) console.log(d.toString())
        if (pattern.test(d.toString())) res()
      })
      this.p.on("close", () => {
        rej("Process closed before receiving expected output: " + pattern)
      })
    }).finally(() => {
      this.waiting = false
    })
  }
}

module.exports = (bin, args) => new Sub(bin, args)
