import UserAgendaAccess from "../model/UserAgendaAccess.js";
import Agenda from "../model/Agenda.js";
import { DISPLAYED_BY_DEFAULT } from "../public/js/utils.js";
import { createCookie } from "../token.js";
import ejs from "ejs";

/**
 * Traite la requête POST sur /creerAgenda.

 * Si la creation d'agenda échoue, affiche un message d'erreur, sinon renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function creationAgendaPOST(req, res) {
    if(!res.locals.user){
        return res.redirect('/')
    }
    const error_message = "Une erreur s'est produite";
    Agenda.create({
        nom: req.body.nom,
        idOwner: res.locals.user.id
    }).then(agenda => {
        UserAgendaAccess.create({
            idUser: res.locals.user.id,
            idAgenda: agenda.id
        }).then(_ => {
            const agendas = res.locals.agendas;
            agendas[agenda.id.toString()] = {nom: agenda.nom, displayed: DISPLAYED_BY_DEFAULT, isOwner: true};
            createCookie("agendas", agendas, res);
            res.locals.agendas = agendas;
            const data = {id: agenda.id.toString(), agenda: agendas[agenda.id.toString()]};
            ejs.renderFile('views/partials/agenda.ejs', data)
            .then(html => {
                res.status(200).json({html: html, data: data});
            }).catch(error => {
                console.log(error);
                res.status(400).end();
            });
        })
        .catch(error => {
            agenda.destroy().finally(_ => {
                console.log(error); res.status(400).send(error_message)})
        })
    }).catch(error => { console.log(error); res.status(400).send(error_message)});
}