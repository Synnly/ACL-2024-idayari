import Agenda from "../model/Agenda.js";
import RendezVous from "../model/RendezVous.js";

export async function exportAgendaPOST(req, res) {
    if(res.locals.user){
        try {
            const { id } = req.body;
    
            const agenda = await Agenda.findOne({
                where: { id: id },
            });
            const rdv = await RendezVous.findAll({
                where: {idAgenda: id}
            });
    
            if (!agenda) {
                return res.render('error', {
                    status: 404,
                    message: "Agenda non trouvé"
                })
            }
    
            const agendaData = {
                nom: agenda.nom,
                rendezVous:  rdv.map(rdv => ({
                    titre: rdv.titre,
                    description: rdv.description,
                    dateDebut: rdv.dateDebut,
                    dateFin: rdv.dateFin,
                    allDay: rdv.allDay,
                    lieu: rdv.lieu,
                    type: rdv.type,
                    frequence: rdv.frequence,
                    finRecurrence: rdv.finRecurrence,
                    nbOccurrences: rdv.nbOccurrences,
                    color: rdv.color,
                })),
            };
            return res.json(agendaData);
        } catch (error) {
            return res.render('error', {
                status: 500,
                message: "Erreur interne"
            })
            
        }
    }
    return res.redirect('/');
}