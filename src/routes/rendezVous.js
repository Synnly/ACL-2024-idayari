import RendezVous from "../model/RendezVous.js";

/**
 * Traite la requête POST sur /rendezVous.
 * Si la création du rendez vous a échoué, affiche un message d'erreur, sinon renvoie vers / .
 * @param req La requête
 * @param res La réponse
 */
export function creationRendezVousPOST(req, res){
    if (!res.locals.user) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
    const data = req.body;
    data.startDate = new Date(+data.startDate);
    data.endDate = new Date(+data.endDate);
    if (data.date_fin_recurrence) {
        data.date_fin_recurrence = new Date(+data.date_fin_recurrence);
    }
    RendezVous.create({
        titre: data.titre,
        lieu: data.lieu,
        description: data.description,
        dateDebut: data.startDate,
        dateFin: data.endDate,
        allDay: data.all_day,
        type: data.type,
        frequence: data.frequence,
        finRecurrence: data.date_fin_recurrence,
        nbOccurrences: data.nb_occurrence,
        idAgenda: data.agenda
    })
    .then(rendez_vous => {
        return res.status(200).json(rendez_vous.idAgenda);
    })

}

export function supprimerRDVGET(req, res) {
    if (!res.locals.user) {
        return res.redirect('/connexion');
    }

    if (res.locals.agendas[req.params.idAgenda].isOwner) {
        RendezVous.destroy({
            where: { id: req.params.id }
        }).then(nb_destroyed => {
            if (nb_destroyed > 0) {
                res.status(200).end();
            }
        }).catch(error => {
            res.status(400).end();
        })
    } else {
        res.status(400).end();
    }
    
}

