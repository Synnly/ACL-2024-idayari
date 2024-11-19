import Agenda from "../model/Agenda.js";
import RendezVous from "../model/RendezVous.js";
import UserAgendaAccess from "../model/UserAgendaAccess.js";

import {manageAddedAgenda} from "./agenda.js";
import {renderAgendaEjs} from "./agenda.js";

/**
 * Enregistre l'agenda et ses rdvs à partir du json de la requête (import json)
 * Si l'agenda est crée on crée l'UserAgendaAcces, si celui ci est crées on crées les rdvs, si ceux ci sont crées on return le json des rdvs et de l'agenda
 * Selon le niveau d'imbrication on détruit les tuples précédements crées
 * @param req La requete
 * @param res La réponse
 */
export async function importAgendaPOST(req,res){
    const error_message = "Error : L'agenda n'a pas pus être chargé ";
    Agenda.create({
        nom: req.body.nom,
        idOwner: res.locals.user.id
    }).then(agenda => {
        UserAgendaAccess.create({

            idUser: res.locals.user.id,
            idAgenda: agenda.id

        }).then(userAgendaAccess => {

            const tabRdvs = req.body.rendezVous.map(rdv => ({...rdv,idAgenda: agenda.id})); 

            RendezVous.bulkCreate(tabRdvs).then(rdvs => { //bulkCreate : Création de l'ensemble de rdv

                const data = manageAddedAgenda(agenda,res); //Gestion cookie et récupération agenta exploitable par AgendaManager
                renderAgendaEjs(data,res);  // Gestion réponse du serveur

            }).catch(error => { //erreur création rdvs

                userAgendaAccess.destroy().finally(_ => {
                        agenda.destroy().finally(_ => {
                        console.log(error); res.status(400).send(error_message)})
                        .catch(err => console.error('Error destroying Agenda:', err));
                        
                }).catch(err => console.error('Error destroying userAgendaAccess:', err));
            });
        }).catch(error => { //Erreur création userAgendaAccess

            agenda.destroy().finally(_ => {
            console.log(error); res.status(400).send(error_message)});

        }).catch(err => console.error('Error destroying Agenda:', err));
        
    }).catch(error => { console.log(error); res.status(400).send(error_message)});  //Erreur création Agenda
}

