import {saveAuthentificationCookie, clearAllCookies} from "../token.js";
import User from "../model/User.js";


/**
 * Traite la requête GET sur /connexion.
 * Si l'user est connecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function connexionGET(req, res) {
    if (!res.locals.user) {
        return res.render("connexion");
    }
    res.redirect("/");
}

/**
 * Traite la requête POST sur /connexion.
 * Si les informations renseignées sont erronées, affiche un message d'erreur, sinon connecte l'utilisateur et renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function connexionPOST(req, res) {
    User.findOne({
        where: { username: req.body.username, hashedPassword: User.hashPassword(req.body.password) },
    }).then(user => {
        if (user === null) {
            return res.render('connexion', 
                { errMsg: 'Identifiant et/ou mot de passe invalides !' });
        } else {
            saveAuthentificationCookie(user, res).then(_ => res.redirect('/'));
        }
    });
}

/**
 * Déconnecte l'utilisateur et supprime les cookies puis renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function deconnexion(req, res) {
    clearAllCookies(res);
    res.redirect('/');
}