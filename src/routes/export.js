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
            const rendezVous = rdv.map(rdv => {
                delete rdv.dataValues.idAgenda;
                return rdv;
            });
            
            const agendaData = {
                nom: agenda.nom,
                rendezVous:  rendezVous
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