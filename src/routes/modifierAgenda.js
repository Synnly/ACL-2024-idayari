import User from "../model/User.js";
import Agenda from "../model/Agenda.js";
import ejs from "ejs";

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

        const html = res.render("modifierAgenda.ejs", {agendas:agendas});
        return html;
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
        const user = await User.getById(res.locals.user.id);
        const myagendas = await user.getMyAgendas();
        let agendas = {};

        for(let agenda of myagendas){   // {idAgenda : nomAgenda}
            agendas[agenda.dataValues.id] = agenda.dataValues.nom;
        }

        for(let id in req.body){    // Si nom modifié, on fait une requête
            if(agendas[id] !== req.body[id]) {
                await Agenda.update({nom: req.body[id]}, {where: {id: id}})
            }
        }

        return res.redirect('/modifierAgendas');
    } else {
        return res.redirect('/');
    }
}

export async function supprimerAgendaGET(req, res){
    if(res.locals.user){
        const agenda = await Agenda.findOne({where: {id: req.params.id, idOwner: res.locals.user.id}})
        if(agenda){
            await agenda.destroy();
        }
        res.redirect('/modifierAgendas');
    }
    else {
        res.redirect('/');
    }
}