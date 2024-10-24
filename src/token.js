import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sequelize from "./database.js";

export const tabAgenda = []; //Permet de gérer la sélection des agendas (dera fait avec données session plus tard)

dotenv.config(); // Récupère et parse le fichier .env pour récupérer clé SECRET

/**
 * Authentifie l'utilisateur. Si `res.locals.users` est défini, alors l'utilisateur est authentifié. S'il est expiré, le cookie est supprimé
 * @param req La requete
 * @param res La réponse
 * @param next La fonction appelée après le traitement
 */
export function authenticate(req, res, next) {
    try {
        let token = req.cookies.accessToken; // ou alors req.cookies['accessToken'];
        let user = jwt.verify(token, process.env.SECRET); //La fonction décripte le token
        res.locals.user = user;
        //IMPORTANT, à partir de maintenant, si res.locals.users est défini alors l'utilisateur est authentifié
    } catch (err) {
        tabAgenda.length = 0; //On vide le tableau d'agenda sélectionné
        //On peut au gérer ici les autres cas de déconnexion
        if (err.name === "TokenExpiredError") {
          res.clearCookie("accessToken");
        }
    }
    next();
}


/**
 * Gérère un token JWT avec l'id et le login de l'utilisateur, et un sel aléatoire. Ce token est enregistré dans la BDD avec le sel et sa date d'expiration.
 * Le token a une durée de vie de 1h.
 * @param user L'utilisateur
 * @returns {*} Le token
 */
function createJWT(user) {
    return jwt.sign(
        { id: user.id, username: user.username}, // données à crypter
        process.env.SECRET, //Clé de chiffrement dans .env
        { expiresIn: "1h" } //Durée de 1h
    );
}

/**
 * Sauvegarde le token dans un cookie
 * @param savedUser L'utilisateur
 * @param res La réponse
 */
export function saveAuthentificationCookie(savedUser, res) {
    let token = createJWT(savedUser); //On crée le token représentant notre user
    res.cookie("accessToken", token, { httpOnly: true });
}

/* explication sur l'authentification
  Lorsqu'on s'inscrit ou se connecte on enregistre le cookie accessToken qui représente l'objet User (en crypté)
  le middlewares   .use(routes.authenticate) va pour chaque requete, tester si le cookie accessToken contient un user, 
  si c'est le cas il va insérer l'user décripté dans les variables locales de la reponse actuelle (res.locals.user = user)
  
  Dans les différents templates, on a qu'a vérifier comme dans cette exemple : 
  <% if (locals.user) { %>
      <p>Vous êtes connecté : <%= locals.user.username %></p> */
