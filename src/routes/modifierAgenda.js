import User from "../model/User.js";
import Agenda from "../model/Agenda.js";

/**
 * Traite la requête GET sur /agenda/modifier/{agendaId}.
 * {agendaId} est l'id de l'agenda à modifier
 * Si l'user est déconnecté ou si l'agenda d'id {agendaId} n'appartient pas à l'user, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function modifierAgendaGET(req, res) {
    if (res.locals.user) {
        const user = await User.findByPk(res.locals.user.id);
        const agendas = await user.getMyAgendas();
        let agenda = null;

        for(let a of agendas){ // Verification de l'appartenance de l'agenda
            if(a.id === +req.params.agendaId){
                agenda = a;
                break;
            }
        }
        if(!agenda){  // L'agenda ne nous appartient pas
            return res.redirect('/');
        }

        return res.render('modifierAgenda', {agenda: agenda});
    } else {
        return res.redirect('/');
    }
}

/**
 * Traite la requête POST sur /agenda/modifier/{agendaId}.
 * {agendaId} est l'id de l'agenda à modifier
 * Si l'user est déconnecté ou si l'agenda d'id {agendaId} n'appartient pas à l'user, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function modifierAgendaPOST(req, res) {
    if (res.locals.user) {
        const user = await User.findByPk(res.locals.user.id);
        const agendas = await user.getMyAgendas();
        let agenda = null;

        for(let a of agendas){ // Verification de l'appartenance de l'agenda
            if(a.id === +req.params.agendaId){
                agenda = a;
                break;
            }
        }
        if(!agenda){  // L'agenda ne nous appartient pas
            return res.redirect('/');
        }

        await Agenda.update({nom: req.body.agenda_name}, {where: {id: agenda.id}})

        return res.redirect('/agenda/modifier/'+agenda.id);
    } else {
        return res.redirect('/');
    }
}