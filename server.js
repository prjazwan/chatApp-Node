const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors());

const dbConfig = require("./config/secret");

const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

require("./socket/streams")(io);

const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET",
    "POST",
    "DELETE",
    "PUT",
    "OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// 1) Middleware
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(morgan("dev"));

// 2) Database
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database!");
  });

// 3) Routes(Mounting Routers)
app.use("/api/chatapp/", authRouter);
app.use("/api/chatapp/", postRouter);

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
