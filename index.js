const express = require("express");
const exphbs = require("express-handlebars"); // Para alterar as views
const session = require("express-session");
const FileStore = require("session-file-store")(session); // Para salvar a session
const flash = require("express-flash"); // para enviar msg flash

const app = express(); // Inicializando o express

const conn = require("./db/conn");

// Models
const Thought = require("./models/Thought");
const User = require("./models/User");

// Import Routes
const thoughtsRoutes = require("./routes/thoughtsRoutes");
const authRoutes = require("./routes/authRoutes");

// Import Controller
const ThoughtController = require("./controllers/ThoughtController");

// -------------- Template engine ------------
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// -------------- Receber a resposta do body ---------
app.use(express.urlencoded({ extended: true }));

app.use(express.json()); // Esse middleware nos ajuda a receber os dados em json

// -------------- Session middleware -----------------
app.use(
  session({
    name: "session",
    secret: "nosso_secret",
    resave: false, // caiu a conexão, então ele vai desconectar, podemos colocar um tempo limite para o usuário permanecer logado
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "sessions"),
    }),
    cookie: {
      secure: false,
      maxAge: 360000, // tempo limite 1 dia
      expires: new Date(Date.now() + 360000), // expira em 1 dia
      httpOnly: true, // como é na nossa própria maquina, não dá para usar esse modulo de cookie em https
    },
  })
);

// -------------- Flash Messages ---------------
app.use(flash());

// -------------- Public Path ------------------
app.use(express.static("public"));

// -------------- Set Session To Res -----------
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session; // se tiver sessão, ela vai poder ser usada no front
  }

  next(); // passa adiante caso não tenha uma sessão
});

// -------------- ROUTES -----------------------
app.use("/thoughts", thoughtsRoutes);
app.use("/", authRoutes);

app.get("/", ThoughtController.showThoughts);

// -------------- Conexão do App ---------------
conn
  //.sync({ force: true })
  .sync()
  .then(() => app.listen(3000))
  .catch((err) => console.log(err));
