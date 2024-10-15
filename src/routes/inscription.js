import {saveAuthentificationCookie} from "../token.js";
import User from "../model/User.js";

/**
 * Traite la requête GET sur /inscription.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function inscriptionGET(req, res) {
    if (!res.locals.user) {
        res.render("inscription");
    } else {
        // on reste où on est
        res.redirect("/");
    }
}

/**
 * Traite la requête POST sur /inscription.
 * Si le login choisi est déjà utilisé, affiche un message d'erreur
 * @param req La requête
 * @param res La réponse
 */
export async function inscriptionPOST(req, res) {
    try {
        const usr = await User.create({
            username: req.body.user_username,
            hashedPassword: User.hashPassowrd(req.body.user_password),
        });
        //Pour que le server authenthifie l'utilisateur à partir du cookie
        saveAuthentificationCookie(usr, res);
        res.redirect("/");
    } catch (e) {
        res.render("inscription", {
            errMsg: e.name === "SequelizeUniqueConstraintError" ? "Un compte existe déjà avec ce nom d'utilisateur !" : "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
        });
    }
}