import User from "../model/User.js";
import { createCookie } from "../token.js";
import { DISPLAYED_BY_DEFAULT } from "../public/js/utils.js";
import Agenda from "../model/Agenda.js";
import UserAgendaAccess from "../model/UserAgendaAccess.js";

/**
 * Traite la requête GET sur / .
 * Si l'user est connecté, affiche ses agendas
 * @param req La requête
 * @param res La réponse
 */
export async function index(req, res) {
    if (res.locals.user) {
        if (req.cookies.currentView) {
            res.locals.currentView = req.cookies.currentView;
            res.locals.currentDateStart = req.cookies.currentDateStart;
        }
        // récupère les informations (qui peuvent avoir changé)
        const user = await User.findByPk(res.locals.user.id);
        res.locals.username = user.username;
        const agendas = {};
        let my_agendas_all_selected = true;
        for (const agenda of await user.getAgendas()) {
            const id = agenda.id.toString();
            const cookie_agenda = res.locals.agendas[id];
            agendas[id] = {nom: agenda.nom, isOwner: agenda.idOwner === user.id};
            agendas[id].displayed = cookie_agenda ? cookie_agenda.displayed : DISPLAYED_BY_DEFAULT;
            
            if (agendas[id].isOwner && !agendas[id].displayed) {
                my_agendas_all_selected = false;
            }
        }
        createCookie("agendas", agendas, res);
        res.locals.agendas = agendas;
        res.locals.all_selected = my_agendas_all_selected;
    }
    res.render('index');
}