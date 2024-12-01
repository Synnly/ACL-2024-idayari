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


export async function supprimerAgendaAccepteGET(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }
    try {
        const user = await User.findByPk(res.locals.user.id);
        const agenda = await Agenda.findOne({ where: { id: req.params.id } });
        if (!agenda) {
            return res.render('error', {
                message: "Agenda introuvable.",
                status: 404,
            });
        }
        const owner = await agenda.getOwner();

        if (owner.dataValues.id === user.id) {
            return res.render('error', {
                message: 'Vous ne pouvez pas accéder à cette page',
                status: 403,
            });
        }
        const nb = await UserAgendaAccess.destroy({
            where: {
                idAgenda: req.params.id,
                idUser: user.id,
            },
        });
        if(nb === 0) {
            return res.redirect("/");
        }
        return res.status(200).json({message: "suppresion bien effectuée "});
    }catch (e) {
		console.log(e);
        return res.render('error', {
            message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
            status: 500,
        });
    }
}