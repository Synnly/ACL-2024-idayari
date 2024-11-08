import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config(); // Récupère et parse le fichier .env pour récupérer clé SECRET

/**
 * Authentifie l'utilisateur. Si `res.locals.user` est défini, alors l'utilisateur est authentifié. S'il est expiré, le cookie est supprimé
 * @param req La requete
 * @param res La réponse
 * @param next La fonction appelée après le traitement
 */
export function authenticate(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        const user = jwt.verify(token, process.env.SECRET); //La fonction décripte le token
        res.locals.user = user;
    } catch (err) {
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
        { id: user.id, username: user.username }, // données à chiffrer
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
    const token = createJWT(savedUser); // On crée le token représentant notre user
    res.cookie("accessToken", token, { httpOnly: true, sameSite: "Strict" });
}