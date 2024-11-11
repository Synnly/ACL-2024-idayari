import RendezVous from "../model/RendezVous.js";

/*Fonction gère et renvoie les rendez-vous simples pour des agendas donnés dans une période donnée */
export function calendarGetData(req, res) {
    if (!res.locals.user) {
        return res.json({err: "not auth"});
    }
    const dateStart = new Date(+req.query.start);
    const dateEnd = new Date(+req.query.end);
    RendezVous.findAll({ where: { idAgenda: +req.query.agenda } })
    .then(rendez_vous => {
        const simples = [];
        for (const rdv of rendez_vous) {
            for (const simple of rdv.get_rendezVous(dateStart, dateEnd)) {
                simples.push(simple);
            };
        }
        return res.json(simples);
    }).catch(err => {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    });
}


/*Fonction modifie un rendez vous */
export async function modifierRendezVousCalendarPOST(req, res) {
    if (res.locals.user) {
        try {
            //Récupération des champs du form
            const { id, title, lieu, description, start, end, allDay } = req.body;
            //Récupération du rdv avec l'id donné
            const rdvToUpdate = await RendezVous.findByPk(id);
            if (!rdvToUpdate) {
                return res.status(404).json({ message: 'Rendez-vous introuvable' });
            }
            //Sauvegarde du rdv
            rdvToUpdate.dateDebut = new Date(start);
            rdvToUpdate.dateFin = new Date(end);
            rdvToUpdate.titre = title;
            rdvToUpdate.lieu = lieu;
            rdvToUpdate.allDay = allDay;
            rdvToUpdate.description = description;
            await rdvToUpdate.save();

            return res.status(200).json();

        } catch (error) {
            console.error('Erreur lors de la modification du rdv:', error);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } else {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
}