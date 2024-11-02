import Agenda from "../model/Agenda.js";
import RendezVous from "../model/RendezVous.js";
import AgendaRendezVous from "../model/AgendaRendezVous.js";
import { Sequelize } from "sequelize";


/*Fonction gère et renvoie les rendez-vous simples pour des agendas donnés dans une période donnée */
export async function calendarGetData(req, res) {
    if (!res.locals.user) {
        return res.json({err : "deconnecte"});
    }
    const dateStart = new Date(req.query.start);
    const dateEnd = new Date(req.query.end);

    //Récupération des agendas sélectionnés
    const tabAgendas = JSON.parse(decodeURIComponent(req.query.agendas)).map(e => +e);
    // requête pour récupérer tous les rendez-vous associés aux agendas
    // et pour chaque rendez-vous les ids des agendas *SELECTIONNES* associés
    // c'est-à-dire un rendez-vous peut être dans 5 agendas mais si seul 2 de ces agendas sont sélectionnés
    // on retourne les 2 sélectionnés.
    const options = {
        separate: true,
        include: [
            {
                model: Agenda,
                as: 'Agendas',
                through: AgendaRendezVous,
                where: {
                    id: {
                        [Sequelize.Op.in]: tabAgendas
                    }
                },
                attributes: ['id']
            }
        ]
    };
    RendezVous.findAll(options)
    .then((results) => {
        const rendez_vous_simples = [];
        for (const rdv of results) {
            for (const rdv2 of rdv.get_rendezVous(dateStart, dateEnd)) {
                rdv2.agendas = rdv.Agendas.map(e => e.id);
                rendez_vous_simples.push(rdv2);
            }
        }
        return res.json(rendez_vous_simples);
    })
    .catch((error) => {
        return res.json({err : error})
    });
}


/*Fonction modifie un rendez vous */
export async function modifierRendezVousCalendarPOST(req, res) {
    if (res.locals.user) {
        try {
            //Récupération des champs du form
            const { idRDV, titre, lieu, description, ecartDebut, ecartFin, viewStart, viewEnd } = req.body;
            //Récupération du rdv avec l'id donné
            const rdvToUpdate = await RendezVous.findOne({ where: { id: idRDV } });

            if (!rdvToUpdate) {
                return res.status(404).json({ message: 'Rendez-vous introuvable' });
            }
            //Sauvegarde du rdv
            rdvToUpdate.dateDebut = new Date(rdvToUpdate.dateDebut.valueOf() + ecartDebut);
            rdvToUpdate.dateFin = new Date(rdvToUpdate.dateFin.valueOf() + ecartFin);
            rdvToUpdate.titre = titre;
            rdvToUpdate.lieu = lieu;
            rdvToUpdate.description = description;
            await rdvToUpdate.save();
            
            //Récupération des rdvs
            const dateStart = new Date(viewStart);
            const dateEnd = new Date(viewEnd);

            return res.json(rdvToUpdate.get_rendezVous(dateStart, dateEnd));

        } catch (error) {
            console.error('Erreur lors de la modification du rdv:', error);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } else {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
}