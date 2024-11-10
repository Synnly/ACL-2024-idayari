import User from "../model/User.js";
import Agenda from "../model/Agenda.js";
import RendezVous from "../model/RendezVous.js";
import AgendaRendezVous from "../model/AgendaRendezVous.js";

export async function exportAgendaGET(req, res){
    if (res.locals.user) {
        const user = await User.getById(res.locals.user.id);
        res.locals.agendas = await user.getAgendas();

        return res.render("export");
    }
    return res.redirect("/connexion");
}

export async function exportAgendaPOST(req, res) {
    if(res.locals.user){
        try {
            const { id } = req.body;
    
            const agenda = await Agenda.findOne({
                where: { id: id },
            });
            const agendaRdv = await AgendaRendezVous.findAll({
                where: {idAgenda: id}
            });
            const rdvIds = agendaRdv.map(rdv => rdv.idRendezVous);
            const rdv = await RendezVous.findAll({
                where: {id: rdvIds}
            });
    
            if (!agenda) {
                return res.status(404).json({ error: "Agenda non trouvé" });
            }
    
            const agendaData = {
                id: agenda.id,
                nom: agenda.nom,
                rendezVous:  rdv.map(rdv => ({
                    id: rdv.id,
                    titre: rdv.titre,
                    description: rdv.description,
                    dateDebut: rdv.dateDebut,
                    dateFin: rdv.dateFin,
                    allDay: rdv.allDay,
                    lieu: rdv.lieu,
                    type: rdv.type,
                    frequence: rdv.frequence,
                    finRecurrence: rdv.finRecurrence,
                    nbOccurrences: rdv.nbOccurrences
                })),
                idOwner: res.locals.user.id
            };
            console.log(agendaData)
            return res.json(agendaData);
        } catch (error) {
            console.error('Erreur lors de l\'exportation de l\'agenda:', error);
            return res.status(500).json({ error: "Erreur interne" });
        }
    }
    return res.redirect('/');
}