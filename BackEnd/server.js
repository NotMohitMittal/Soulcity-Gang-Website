require("dotenv").config();

const app = require("./src/app.js");
const connectDB = require("./src/db/db.js");

connectDB();

const server = app;

server.listen(process.env.SERVER_PORT, () => {
  console.log("Server Running");
});
