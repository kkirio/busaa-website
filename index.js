const mongoose = require("mongoose"),
	express = require("express"),
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

/* Connect to "mongodb://localhost:27017/busaa" on Mac
   Connect to "mongodb://0.0.0.0:27017/busaa" on Windows */
mongoose.connect("mongodb://0.0.0.0:27017/busaa");
const db = mongoose.connection;
db.once("open", () => {
	console.log("Successfully connected to mongodb");
});

app.set("port", process.env.PORT || 3000);
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
app.use(cookieParser("secret-pascode"));
app.use(
  expressSession({
    secret: "secret_passcode",
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
