import Agenda from "../model/Agenda.js";
import RendezVous from "../model/RendezVous.js";
import UserAgendaAccess from "../model/UserAgendaAccess.js";

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
            const tabRdv = req.body.rendezVous.map(rdv =>(
                {
                    titre: rdv.titre,
                    lieu: rdv.lieu,
                    description: rdv.description,
                    dateDebut: rdv.dateDebut,
                    dateFin: rdv.dateFin,
                    allDay: rdv.allDay,
                    type: rdv.type,
                    frequence:rdv.frequence,
                    finRecurrence: rdv.finRecurrence,
                    nbOccurrences: rdv.nbOccurrences,
                    idAgenda:agenda.id,
                }));
            RendezVous.bulkCreate(tabRdv).then(rdvs => {
                return res.json({agenda: { nom: agenda.nom, id: agenda.id }});
            }).catch(error => {
                userAgendaAccess.destroy().finally(_ => {
                        agenda.destroy().finally(_ => {
                        console.log(error); res.status(400).send(error_message)})
                })
            });
        }).catch(error => {
            agenda.destroy().finally(_ => {
            console.log(error); res.status(400).send(error_message)});
        });
    }).catch(error => { console.log(error); res.status(400).send(error_message)});
}
