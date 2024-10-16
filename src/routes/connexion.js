import {saveAuthentificationCookie} from "../token.js";
import User from "../model/User.js";
import Token from "../model/Token.js";

/**
 * Traite la requête GET sur /connexion.
 * Si l'user est connecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function connexionGET(req, res) {
    if (!res.locals.user) {
        return res.render("connexion");
    } else {
        return res.redirect("/");
    }
}

/**
 * Traite la requête POST sur /connexion.
 * Si les informations renseignées sont erronées, affiche un message d'erreur, sinon connecte l'utilisateur et renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function connexionPOST(req, res) {
    let username = req.body.username;
    let password = User.hashPassowrd(req.body.password);

    const user = await User.findOne({
        where: { username: username, hashedPassword: password },
    });
    if (user === null) {
        return res.render('connexion', {
            errMsg: 'Identifiant et/ou mot de passe invalides !',
        });
    } else {
        saveAuthentificationCookie(user, res);
        return res.redirect('/');
    }
}

/**
 * Déconnecte l'utilisateur et supprime le cookie et le token de la bdd, puis renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function deconnexion(req, res) {
    await Token.deleteToken(req.cookies.accessToken);
    res.clearCookie('accessToken');
    return res.redirect('/');
}