import UserAgendaAccess from "../model/UserAgendaAccess.js";
import Token from "../model/Token.js";
import Agenda from "../model/Agenda.js";

/**
 * Traite la requête GET sur /creerAgenda.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function creationAgendaGET(req, res) {
    const valid = await Token.checkValidity(req, res);
    if (valid && res.locals.user) {
        return res.render("creerAgenda");
    } else {
        return res.redirect("/");
    }
}

/**
 * Traite la requête POST sur /creerAgenda.
 * Si la creation d'agenda échoue, affiche un message d'erreur, sinon renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function creationAgendaPOST(req, res) {
    const valid = await Token.checkValidity(req, res);
    if(!valid || !res.locals.user){
        return res.redirect('/')
    }

    let agenda = null;
    try {
        agenda = await Agenda.create({
            nom: req.body.nom,
            idOwner: res.locals.user.id
        });
    } catch (e) {
        return res.render("creerAgenda", {
            errMsg: "Une erreur est inattendue survenue. Veuillez réessayer plus tard.",
        });
    }
    try {
        await UserAgendaAccess.create({
            idUser: res.locals.user.id,
            idAgenda: agenda.id
        })
        return res.redirect('/');
    } catch (e){
        await agenda.destroy();
        return res.render("creerAgenda", {
            errMsg: "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
        });
    }
}