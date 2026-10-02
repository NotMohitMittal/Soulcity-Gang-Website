const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/user.routes.js");
const inventoryRouter = require("./routes/inventory.routes.js");
const memberRouter = require("./routes/member.routes.js");
const garageRouter = require("./routes/garage.routes.js");
const noticeRouter = require("./routes/notice.routes.js");

const app = express();

// deployment
const path = require("path");


// Do this in the last 


// app.use(
//   cors({
//     origin: process.env.NODE_ENV === "production" 
//       ? "https://your-render-app-name.onrender.com" // Replace with your actual Render URL
//       : "http://localhost:5173", 
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   }),
// );




app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your actual React frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

// to parse the request-body | Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// router-calls | Middlewares
app.use("/api/auth", userRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/member", memberRouter);
app.use("/api/garage", garageRouter);
app.use("/api/notice", noticeRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../FrontEnd/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../FrontEnd", "dist", "index.html"));
  });
}

module.exports = app;
