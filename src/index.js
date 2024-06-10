import http from "http";
import { PORT } from "./config.js";
import { indexOt, userInfo, exportUsers, importUsers } from "./controller.js";

const server = http.createServer(async (req, res) => {
  const { url, method } = req;

  if (method === "GET") {
    switch (url) {
      case "/":
        indexOt(req, res);
        break;
      case "/users":
        userInfo(req, res);
        break;
      case "/import":
        importUsers(req, res);
        break;
      case "/export":
        exportUsers(req, res);
        break;
      default:
        res.end("Page not found: " + url);
        break;
    }
  }
});

server.listen(PORT, () => {
  console.log("server is running on port");
});
