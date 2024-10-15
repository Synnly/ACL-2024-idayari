import UserAgendaAccess from "../model/UserAgendaAccess.js";

/**
 * Traite la requête GET sur /creerAgenda.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function creationAgendaGET(req, res) {
    if (res.locals.user) {
        res.render("creerAgenda");
    } else {
        res.redirect("/");
    }
}

/**
 * Traite la requête POST sur /creerAgenda.
 * Si la creation d'agenda échoue, affiche un message d'erreur, sinon renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function creationAgendaPOST(req, res) {
    let agenda = null;
    try {
        agenda = await Agenda.create({
            nom: req.body.nom,
            idOwner: res.locals.user.id
        });
    } catch (e) {
        res.render("creerAgenda", {
            errMsg: "Une erreur est inattendue survenue. Veuillez réessayer plus tard.",
        });
        return
    }
    try {
        await UserAgendaAccess.create({
            idUser: res.locals.user.id,
            idAgenda: agenda.id
        })
        res.redirect('/');
    } catch (e){
        await agenda.destroy();
        res.render("creerAgenda", {
            errMsg: "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
        });
    }
}