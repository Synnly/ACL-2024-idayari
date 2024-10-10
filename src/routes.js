import User from "./model/User.js";
import sequelize from "./database.js";
import dotenv from "dotenv"; //Import qui permet la manipulation des variables d'environnement
import jwt from "jsonwebtoken";
dotenv.config(); // Récupère et parse le fichier .env pour récupérer clé SECRET

let currentId = 0;

function getNewId() {
  return ++currentId;
}

export function index(req, res) {
  res.render("index");
}
export function inscriptionGET(req, res) {
  res.render("inscription", { errMsg: "" });
}
export async function inscriptionPOST(req, res) {
  //console.log(req);
  console.log(req.body.user_username);
  console.log(req.body.user_email);
  console.log(req.body.user_password);

  try {
    const usr = await User.create({
      username: req.body.user_username,
      hashedPassword: User.hashPassowrd(req.body.user_password),
    });
    console.log("Utilisateur créé avec succès :", usr.toJSON());
    //Pour que le server authenthifie l'utilisateur à partir du cookie
    saveAuthentificationCookie(usr, res);
    res.redirect("/");
  } catch (e) {
    console.log("Le nom de l'erreur", e);
    if (e.name === "SequelizeUniqueConstraintError") {
      res.render("inscription", {
        errMsg: "Un compte existe déjà avec cette combinaison username/email",
      });
    } else {
      res.redirect("/inscription");
    }
  }
}

export function getThread(req, res, next) {
  const id = req.params.threadId;
  const thread = forum.threads.find((thread) => thread.id == id);
  if (!thread) {
    next(createError(404));
  } else {
    res.send(threadView(thread));
  }
}
export function authenticate(req, res, next) {
  try {
    let token = req.cookies.accessToken; // ou alors req.cookies['accessToken'];
    let user = jwt.verify(token, process.env.SECRET); //La fonction décripte le token
    res.locals.user = user;
    //IMPORTANT, à partir de maintenant, si res.locals.users est défini alors l'utilisateur est authentifié
  } catch {}
  next();
}
//A partir d'ici fonction pour l'authentification
export function createJWT(user) {
  return jwt.sign(
    { id: user.id, username: user.username }, // données à crypter
    process.env.SECRET, //Clé de chiffrement dans .env
    { expiresIn: "1h" } //Durée de 1h
  );
}
export function saveAuthentificationCookie(savedUser, res) {
  let token = createJWT({ id: savedUser.id, username: savedUser.username }); //On crée le token représentant notre user
  console.log("Test du createJWT");
  res.cookie("accessToken", token, { httpOnly: true });
}

/* explication sur l'authentification
Lorsqu'on s'inscrit ou se connecte on enregistre le cookie accessToken qui représente l'objet User (en crypté)
le middlewares   .use(routes.authenticate) va pour chaque requete, tester si le cookie accessToken contient un user, 
si c'est le cas il va insérer l'user décripté dans les variables locales de la reponse actuelle (res.locals.user = user)

Dans les différents templates, on a qu'a vérifier comme dans cette exemple : 
<% if (locals.user) { %>
    <p>Vous êtes connecté : <%= locals.user.username %></p>
  */
