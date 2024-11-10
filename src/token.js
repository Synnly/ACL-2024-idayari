import jwt from "jsonwebtoken";
import { DISPLAYED_BY_DEFAULT } from "./public/js/utils.js";

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
        res.locals.agendas = req.cookies.agendas;
    } catch (err) {
        //On peut au gérer ici les autres cas de déconnexion
        if (err.name === "TokenExpiredError") {
            clearAllCookies(res);
        }
    }
    next();
}

/**
 * Supprime tous les cookies
 * @param {*} res La réponse
 */
export function clearAllCookies(res) {
    res.clearCookie("accessToken");
    res.clearCookie("agendas");
}

/**
 * Gérère un token JWT avec l'id de l'utilisateur, et un sel aléatoire. Ce token est enregistré dans la BDD avec le sel et sa date d'expiration.
 * Le token a une durée de vie de 1h.
 * @param id L'id de l'utilisateur
 * @returns {String} Le token
 */
function createJWT(id) {
    return jwt.sign(
        { id: id }, // données à chiffrer
        process.env.SECRET, //Clé de chiffrement dans .env
        { expiresIn: "1h" } //Durée de 1h
    );
}

/**
 * Sauvegarde le token dans un cookie
 * @param {User} user L'utilisateur
 * @param res La réponse
 */
export function saveAuthentificationCookie(user, res) {
    const token = createJWT(user.id); // On crée le token représentant notre user
    createCookie("accessToken", token, res);
    // les agendas sont sauvegardés dans un cookie
    // pour, entre autres, se rappeler de ceux affichés quand on recharge la page
    return user.getAgendas({ attributes: ['id', 'nom', 'idOwner'] }).then(agendas => {
        const saved_agendas = {};
        agendas.forEach(a => saved_agendas[a.id] = {nom: a.nom, displayed: DISPLAYED_BY_DEFAULT, 
                                                    isOwner: user.id === a.idOwner});
        createCookie("agendas", saved_agendas, res);
    });
}

/**
 * crée ou met à jour un cookie (permet de factoriser les options)
 * @param {String} name le nom du cookie
 * @param {String} value la valeur qu'on veut sauvegarder
 * @param {object} res la réponse
 */
export function createCookie(name, value, res) {
    res.cookie(name, value, { httpOnly: true, sameSite: "Strict" });
}