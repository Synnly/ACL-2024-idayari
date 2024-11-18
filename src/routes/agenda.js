import UserAgendaAccess from "../model/UserAgendaAccess.js";
import Agenda from "../model/Agenda.js";
import { DISPLAYED_BY_DEFAULT } from "../public/js/utils.js";
import { createCookie } from "../token.js";
import ejs from "ejs";

export function addAgenda(res, id, nom, isOwner) {
    const agendas = res.locals.agendas;
    agendas[id] = {nom: nom, displayed: DISPLAYED_BY_DEFAULT, isOwner: isOwner};
    createCookie("agendas", agendas, res);
    res.locals.agendas = agendas;
    const data = {id: id, agenda: agendas[id]};
    ejs.renderFile('views/partials/agenda.ejs', data)
    .then(html => {
        res.status(200).json({html: html, data: data});
    }).catch(error => {
        console.log(error);
        res.status(400).end();
    });
}
/**
 * Traite la requête POST sur /creerAgenda.
 * Si la creation d'agenda échoue, affiche un message d'erreur, sinon renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function creationAgendaPOST(req, res) {
    if(!res.locals.user){
        return res.redirect('/');
    }
    const error_message = "Une erreur s'est produite";
    Agenda.create({
        nom: req.body.nom,
        idOwner: res.locals.user.id
    }).then(agenda => {
        UserAgendaAccess.create({
            idUser: res.locals.user.id,
            idAgenda: agenda.id
        }).then(_ => addAgenda(res, agenda.id.toString(), agenda.nom, true))
        .catch(error => {
            agenda.destroy().finally(_ => res.status(400).send(error_message))
        })
    }).catch(error => { console.log(error); res.status(400).send(error_message)});
}

/**
 * Traite la requête POST sur /modifierAgendas.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export function modifierAgendaPOST(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }
    const id = +req.body.id;
    Agenda.update({nom: req.body.nom}, {where: {id: id, idOwner: res.locals.user.id}})
    .then(result => {
        // au moins un agenda a été modifié
        if (result[0] > 0) {
            const agendas = res.locals.agendas;
            agendas[req.body.id].nom = req.body.nom;
            createCookie("agendas", agendas, res);
            res.status(200).json({});
        } else {
            res.status(204).json({});
        }
    })
}

/**
 * Supprime un agenda de la bdd et met à jour les cookies
 * @param req La requête
 * @param res La réponse
 * @returns la réponse, avec statut `202` si un agenda a été supprimé, `204` sinon
 */
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