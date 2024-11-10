import Agenda from "../model/Agenda.js";
import { createCookie } from "../token.js";

/**
 * Traite la requête GET sur /modifierAgendas.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function modifierAgendaGET(req, res) {
    if (res.locals.user) {
        res.render("modifierAgenda");
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
    if (!res.locals.user) {
        return res.redirect('/');
    }
    const agendas = res.locals.agendas;
    for(const id in req.body){    // Si nom modifié, on fait une requête
        if(agendas[id].nom !== req.body[id]) {
            await Agenda.update({nom: req.body[id]}, {where: {id: id}})
        }
    }
    return res.redirect('/modifierAgendas');
}

export function supprimerAgendaDELETE(req, res){
    if (!res.locals.user) {
        return res.redirect('/');
    }
    Agenda.destroy({where: {id: req.params.id, idOwner: res.locals.user.id}})
    .then(nb_destroyed => {
        if (nb_destroyed > 0) {
            // on met à jour le cookie
            const agendas = res.locals.agendas;
            delete agendas[req.params.id];
            createCookie("agendas", agendas, res);
            res.status(202).end();
        } else {
            res.status(204).end();
        }
    })
}