import User from "../model/User.js";
import { createCookie } from "../token.js";
import { DISPLAYED_BY_DEFAULT } from "../public/js/utils.js";

/**
 * Traite la requête GET sur / .
 * Si l'user est connecté, affiche ses agendas
 * @param req La requête
 * @param res La réponse
 */
export async function index(req, res) {
    if (res.locals.user) {
        // récupère les informations (qui peuvent avoir changé)
        const user = await User.findByPk(res.locals.user.id);
        res.locals.username = user.username;
        const my_agendas = {};
        const waiting_agendas = {}; 
        let my_agendas_all_selected = true;
        const agendas = await user.getAgendas();
        for (const agenda of agendas) {
            const id = agenda.id.toString();
            const statut = agenda.UserAgendaAccess.statut;
            if (!statut || statut === "Accepté") {
                const cookie_agenda = res.locals.agendas[id];
                my_agendas[id] = {nom: agenda.nom, isOwner: agenda.idOwner === user.id};
                my_agendas[id].displayed = cookie_agenda ? cookie_agenda.displayed : DISPLAYED_BY_DEFAULT;
                
                if (my_agendas[id].isOwner && !my_agendas[id].displayed) {
                    my_agendas_all_selected = false;
                }
            } else if (statut == "En attente") {
                const owner = await User.findByPk(agenda.idOwner);
                waiting_agendas[id] = {nom: agenda.nom, o_username: owner.username};
            }
        }
        createCookie("agendas", my_agendas, res);
        res.locals.agendas = my_agendas;
        res.locals.received_agendas = waiting_agendas;
        res.locals.all_selected = my_agendas_all_selected;
    }
    res.render('index');
}