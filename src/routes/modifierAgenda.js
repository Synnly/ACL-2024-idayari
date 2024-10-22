import User from "../model/User.js";
import Agenda from "../model/Agenda.js";

/**
 * Traite la requête GET sur /modifierAgendas.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function modifierAgendaGET(req, res) {
    if (res.locals.user) {
        const user = await User.findByPk(res.locals.user.id);
        const agendas = await user.getMyAgendas();

        return res.render('modifierAgenda', {agendas: agendas});
    } else {
        return res.redirect('/');
    }
}

/**
 * Traite la requête POST sur /modifierAgendas.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function modifierAgendaPOST(req, res) {
    if (res.locals.user) {
        for(let id in req.body){
            await Agenda.update({nom: req.body[id]}, {where: {id: id}})
        }

        return res.redirect('/modifierAgendas');
    } else {
        return res.redirect('/');
    }
}