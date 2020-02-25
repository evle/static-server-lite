const http = require("http");
const url = require("url");
const path = require("path");
const chalk = require("chalk");
const fs = require("fs").promises;
const mime = require("mime");
const { createReadStream } = require("fs");

class Server {
  constructor(opts) {
    const {
      onstart = () => console.log("Starting up the static server")
    } = opts;

    this.onstart = onstart;
  }

  async handleRequest(req, res) {
    let { pathname } = url.parse(req.url);
    let filepath = path.join(__dirname, pathname);

    try {
      let filestat = await fs.stat(filepath);

      if (filestat.isDirectory()) {
        filepath = path.join(filepath, "index.html");
        await fs.access(filepath);
      }

      this.sendFile(req, res, filepath);
    } catch (e) {
      this.sendError(req, res, e);
    }
  }

  sendFile(req, res, filepath) {
    res.statusCode = 200;
    res.setHeader("Content-Type", `${mime.getType(filepath)};charset=utf-8`);
    createReadStream(filepath).pipe(res);
  }

  sendError(req, res, e) {
    console.log(chalk.redBright(e));
    res.statusCode = 404;
    res.end("Not Found");
  }

  start(port) {
    let server = http.createServer(this.handleRequest.bind(this));

    server.listen(port, this.onstart);

    /**
     *  端口被占用时 使用新端口并提示
     */
    server.on("error", e => {
      if (e.code === "EADDRINUSE") {
        let newPort = port + 1;
        server.listen(newPort);

        console.log(
          chalk.redBright(
            `WARNNING: \nPort already in use, use port ${newPort} instead`
          )
        );
      }
    });
  }
}

module.exports = Server;
