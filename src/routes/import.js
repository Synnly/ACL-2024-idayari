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
    const error_message = "Erreur : Impossible de charger l'agenda ";
    Agenda.create({
        nom: req.body.nom,
        idOwner: res.locals.user.id
    }).then(agenda => {
        UserAgendaAccess.create({

            idUser: res.locals.user.id,
            idAgenda: agenda.id

        }).then(userAgendaAccess => {
            try{
                const mapParent = [];
                const rdvEnfant = [];
           
            req.body.rendezVous.forEach(rdv => {
                let { id, ...rdvWithoutId } = rdv;
                rdvWithoutId.idAgenda = agenda.id;
                if(rdv.idParent){
                    console.log("IL EN EXISTE 111111111111111111111111111111111111",rdv.idParent);
                    rdvEnfant.push(rdvWithoutId);
                }else{
                    // console.log('description rdv',rdv);
                    // console.log('idParent ',rdv.idParent);
                    // console.log('idParent ',rdvWithoutParentId);
                    RendezVous.create(rdvWithoutId).then(newRdv => {
                        console.log("est ce qu'on arrive iciiiiiiiiiiiiiiiiiii????? ,??????");
                        console.log(rdv.id, newRdv.id);
                        mapParent.push(rdv.id);
                        mapParent[rdv.id] = newRdv.id;
                    });
                }
                console.log("ET LES PARENTS DANS TOUS CA HEIN !! ",mapParent);
                rdvEnfant.forEach(rdv => {
                    if(mapParent[rdv.idParent]){
                        let {id, updatedRdv }= { ...rdv, idParent: mapParent[rdv.idParent] };
                        RendezVous.create(updatedRdv);
                    }
                }) 
            });
        

            }catch (error) {
                // Gérer les erreurs pour toutes les créations
                userAgendaAccess.destroy().finally(_ => {
                    agenda.destroy().finally(_ => {
                    console.log(error); res.status(400).send(error_message)})
                    .catch(err => console.error('Error destroying Agenda:', err));    
                }).catch(err => console.error('Error destroying userAgendaAccess:', err));
            }
            const data = manageAddedAgenda(agenda,res); //Gestion cookie et récupération agenta exploitable par AgendaManager
            renderAgendaEjs(data,res);  // Gestion réponse du serveur

        }).catch(error => { //Erreur création userAgendaAccess
            
            agenda.destroy().finally(_ => {
            console.log(error); res.status(400).send(error_message)});
        }).catch(err => console.error('Error destroying Agenda:', err));
        
    }).catch(error => { console.log(error); res.status(400).send(error_message)});  //Erreur création Agenda
}

