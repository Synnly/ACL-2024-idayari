import {saveAuthentificationCookie} from "../token.js";
import User from "../model/User.js";
import Agenda from "../model/Agenda.js";
import UserAgendaAccess from "../model/UserAgendaAccess.js";

/**
 * Traite la requête GET sur /inscription.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function inscriptionGET(req, res) {
    if (res.locals.user) {
        return res.redirect("/");
    }
    return res.render("inscription");
}

/**
 * Traite la requête POST sur /inscription.
 * Si le login choisi est déjà utilisé, affiche un message d'erreur
 * @param req La requête
 * @param res La réponse
 */
export function inscriptionPOST(req, res) {
    if (res.locals.user) {
        return res.redirect("/");
    }
    User.create({
        username: req.body.user_username,
        hashedPassword: User.hashPassword(req.body.user_password),
    }).then(user => {
        Agenda.create({
            nom: "Mon agenda",
            idOwner: user.id
        }).then(agenda => {
            UserAgendaAccess.create({
                idUser: user.id,
                idAgenda: agenda.id
            }).then(_ => {
                // Pour que le server authenthifie l'utilisateur à partir du cookie
                saveAuthentificationCookie(user, res).then(_ => res.redirect("/"));
            }).catch(e => {
                res.render("inscription", {
                    errMsg: "Une erreur inattendue est survenue. Veuillez réessayer plus tard."
                });
            });
        }).catch(e => {
            res.render("inscription", {
                errMsg: "Une erreur inattendue est survenue. Veuillez réessayer plus tard."
            });
        });
    }).catch(e => {
        res.render("inscription", {
            errMsg: e.name === "SequelizeUniqueConstraintError" ? "Un compte existe déjà avec ce nom d'utilisateur !" : "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
        });
    });
}