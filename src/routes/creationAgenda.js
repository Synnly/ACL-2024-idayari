import UserAgendaAccess from "../model/UserAgendaAccess.js";
import Agenda from "../model/Agenda.js";

/**
 * Traite la requête POST sur /creerAgenda.

 * Si la creation d'agenda échoue, affiche un message d'erreur, sinon renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function creationAgendaPOST(req, res) {
    if(!res.locals.user){
        return res.redirect('/')
    }
    let errMsg = null;
    try {
        const agenda = await Agenda.create({
            nom: req.body.nom,
            idOwner: res.locals.user.id
        });
        try {
            await UserAgendaAccess.create({
                idUser: res.locals.user.id,
                idAgenda: agenda.id
            })
        } catch (e){
            await agenda.destroy();
            errMsg = "Une erreur inattendue est survenue. Veuillez réessayer plus tard.";
        }
    } catch (e) {
        errMsg = "Une erreur est inattendue survenue. Veuillez réessayer plus tard.";
    }
    // je prévois de faire des sessions et d'afficher `errMsg`
    // mais on doit revenir à la page d'accueil
    res.redirect("/")
}