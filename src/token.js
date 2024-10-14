import jwt from "jsonwebtoken";
import dotenv from "dotenv"; //Import qui permet la manipulation des variables d'environnement

dotenv.config(); // Récupère et parse le fichier .env pour récupérer clé SECRET

export function authenticate(req, res, next) {
  try {
    let token = req.cookies.accessToken; // ou alors req.cookies['accessToken'];
    let user = jwt.verify(token, process.env.SECRET); //La fonction décripte le token
    res.locals.user = user;
    //IMPORTANT, à partir de maintenant, si res.locals.users est défini alors l'utilisateur est authentifié
  } catch (err) {
    //On peut au gérer ici les autres cas de déconnexion
    if (err.name === "TokenExpiredError") {
      res.clearCookie("accessToken");
    }
  }
  next();
}

//A partir d'ici fonction pour l'authentification
function createJWT(user) {
  return jwt.sign(
    { id: user.id, username: user.username }, // données à crypter
    process.env.SECRET, //Clé de chiffrement dans .env
    { expiresIn: "1h" } //Durée de 1h
  );
}

export function saveAuthentificationCookie(savedUser, res) {
  let token = createJWT({ id: savedUser.id, username: savedUser.username }); //On crée le token représentant notre user
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
