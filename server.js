const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

const dbConfig = require("./config/secret");
const authRouter = require("./routes/authRoutes");

// 1) Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// 2) Database
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
}).then(() => {
  console.log("Connected to Database!");
});

// 3) Routes(Mounting Routers)
app.use("/api/chatapp/", authRouter);

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
