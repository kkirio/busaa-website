const express = require("express"),
  dotenv = require("dotenv"),
  mongoose = require("mongoose"),
	methodOverride = require("method-override"),
	layouts = require("express-ejs-layouts"),
	connectFlash = require("connect-flash"),
	cookieParser = require("cookie-parser"),
	expressSession = require("express-session"),
	expressValidator = require("express-validator"),
	passport = require("passport"),
	socketio = require("socket.io"),
	
	User = require("./models/user"),
	router = require("./routes/index"),
	chatController = require("./controllers/chatController"),
	
	app = express();
  dotenv.config();

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.once("open", () => {
	console.log("Successfully connected to mongodb");
});

app.set("port", process.env.PORT);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());
app.set("view engine", "ejs");
app.use(layouts);
app.use(expressValidator());
app.use(
  methodOverride("_method", {
    methods: ["POST", "GET"],
  })
);
app.use(cookieParser(process.env.COOKIE_PARSER));
app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION,
    cookie: {
      maxAge: 40000,
    },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

app.use("/", router);

const server = app.listen(app.get("port"), () => {
    console.log(`The server is running at http://localhost:${app.get("port")}`);
});

const io = socketio(server);
chatController(io);
