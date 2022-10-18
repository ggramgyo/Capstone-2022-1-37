const express = require("express");
const nunjucks = require("nunjucks");
const cookieParser = require("cookie-parser");
const morgan = require("morgan"); // log 관리 미들웨어
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const AWS = require("aws-sdk");
require("dotenv").config();

const app = express();
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
// routers
const authRouter = require("./routes/auth");
const pageRouter = require("./routes/page");
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const transactionRouter = require("./routes/transaction");
const { sequelize } = require("./models");
const chatRouter = require("./routes/chat");
const chatviewRouter = require("./routes/chatview");
const store = require("./routes/store");
// ./passport/index.js 와 같음
const passportConfig = require("./passport");
passportConfig(); // 패스포트 설정

sequelize.sync();

app.set("port", process.env.PORT || 8001);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, // js에서 쿠키에 접근할 수 없도록 방지
      secure: false, // http도 쿠키 전송 가능
      maxAge: 1000 * 60 * 60, // 쿠키 유효기간 1시간
    },
  })
);

app.use(flash());

// 요청(req객체)에 passport 설정을 심음
app.use(passport.initialize());
// req.session 객체에 passport 정보 저장
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/", pageRouter);
app.use("/product", productRouter);
app.use("/user", userRouter);
app.use("/transaction", transactionRouter);
app.use(chatRouter);
app.use(chatviewRouter);
app.use("/store", store);
app.use(
  "/docs",
  swaggerUI.serve
  // swaggerUI.setup(require("./config/swaggerDoc"))
);

// 404 처리 미들 웨어
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// 에러 핸들러
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.Error = req.app.get("env") === "develoment" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});
// socket handler
var http = require("http");
var server = http.createServer(app);
const socket = require("socket.io");
const moment = require("moment");
const Chatcontent = require("./models/chatcontent");
const Chat = require("./models/chat");
// const e = require("connect-flash");

var num = -123456789;
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
notReadCnt = {};
sendName = {};
nowRoom = {};
var rValue = 0;
var roomSize = 0;
var readFlag = false;

io.on("connection", (socket) => {
  console.log("새로운 connection이 발생하였습니다.");
  socket.on("join", ({ name, room }, callback) => {
    console.log("join");
    sendName[socket.id] = name;
    nowRoom[socket.id] = room;
    socket.join(room);

    // 방에 입장 시 상대방이 메세지를 보낸 뒤 방을 나간 경우 내가 들어간다면 size는 1
    // 그렇기에 마지막 보낸이가 자신이 아니라면 reload 작용 필요
    Chat.findOne({
      where: {
        id: Number(room),
      },
    }).then((data) => {
      // 안 읽음 수 init
      notReadCnt[room] = data["isReadCnt"];
      if (data["lastSender"] != name) {
        Chatcontent.update(
          {
            isRead: 1,
          },
          {
            where: {
              id: nowRoom[socket.id],
            },
          }
        );
        notReadCnt[room] = 0;
        Chat.update(
          {
            isReadCnt: 0,
          },
          {
            where: { id: nowRoom[socket.id] },
          }
        );
        // io?.emit("chatReload");
      }
      roomSize = io.sockets.adapter.rooms.get(room).size;
      if (roomSize < 2) {
        readFlag = false;
      } else {
        io?.emit("cntReload", ++num);
        readFlag = true;
      }
      // 방 입장 시 최근 cnt 정리 reload
      io?.emit("reload", ++num);
    });
    // console.log("lastInfo " + getLastChat(socket))
    roomSize = io.sockets.adapter.rooms.get(room).size;
    console.log("size: " + roomSize);
    if (roomSize < 2) {
      readFlag = false;
    } else {
      readFlag = true;
    }

    if (readFlag) {
      Chatcontent.update(
        {
          isRead: 1,
        },
        {
          where: {
            id: nowRoom[socket.id],
          },
        }
      );
      rValue = 1;
      notReadCnt[nowRoom[socket.id]] = 0;
      // 안읽음 수 업데이트
      Chat.update(
        {
          isReadCnt: 0,
        },
        {
          where: { id: nowRoom[socket.id] },
        }
      );
    } else {
      rValue = 0;
    }
    // 방 입장 시 최근 cnt 정리 reload
    console.log("JoinUpdatetesttest");
    io?.emit("reload", ++num);
    callback();
  });
  socket.on("chatReload", () => {
    console.log("chatCreate");
    io?.emit("roomReload");
  });
  socket.on("checkRoom", (room) => {
    // 접속해 있는 room이 새로운 room 신호와 다르다면 leave
    if (nowRoom[socket.id] != room && nowRoom[socket.id] != undefined) {
      console.log(room, "+", nowRoom[socket.id], "qqqq");
      socket.leave(nowRoom[socket.id]);
    }
    console.log("roomUpdatetesttest");
    io?.emit("reload", ++num);
  });
  socket.on("sendMessage", (message, callback) => {
    var date = moment().format("YYYY-MM-DD HH:mm:ss");
    // 안읽음 표시 구현을 위한 방에 입장 중인 사람 수
    var roomSize = io.sockets.adapter.rooms.get(nowRoom[socket.id]).size;
    console.log("size: " + roomSize);
    if (roomSize < 2) {
      readFlag = false;
    } else {
      readFlag = true;
    }
    // mysql query 발생 <msg 내역 저장>
    // readFlag 1이면 두명 다 읽음 표시, 0이면 안 읽음
    if (readFlag) {
      Chatcontent.update(
        {
          isRead: 1,
        },
        {
          where: {
            id: nowRoom[socket.id],
          },
        }
      );
      rValue = 1;
      notReadCnt[nowRoom[socket.id]] = 0;
    } else {
      rValue = 0;
      ++notReadCnt[nowRoom[socket.id]];
    }
    // console.log("notReadCnt: " + notReadCnt[nowRoom[socket.id]]);
    Chatcontent.create({
      id: nowRoom[socket.id],
      sender: sendName[socket.id],
      message: String(message),
      time: date,
      isRead: rValue,
    });

    // mysql chat DB last msg 저장 + 안 읽음 수
    Chat.update(
      {
        lastMsg: String(message),
        lastSender: sendName[socket.id],
        lastTime: date,
        isReadCnt: notReadCnt[nowRoom[socket.id]],
      },
      {
        where: { id: nowRoom[socket.id] },
      }
    ).then(() => {
      console.log("ChatUpdatetesttest");
      io?.emit("reload", ++num);
    });
    console.log(nowRoom);
    console.log(sendName);
    // 새 문자 보내기
    io.to(nowRoom[socket.id]).emit("new_message", {
      user: sendName[socket.id],
      text: message,
      sendTime: date,
      date: false,
      isRead: rValue,
    });
    callback();
  });
  socket.on("disconnect", () => {
    socket.leave(nowRoom[socket.id]);
    console.log("유저가 떠났어요.");
  });
});

// socket 때문에 app -> server(http) 변경
server.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
