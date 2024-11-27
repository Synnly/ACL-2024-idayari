import RendezVous from "../model/RendezVous.js";

/*Fonction gère et renvoie les rendez-vous simples pour des agendas donnés dans une période donnée */
export function calendarGetData(req, res) {
    if (!res.locals.user) {
        return res.status(403).json({err: "not auth"});
    }
    const dateStart = new Date(+req.query.start);
    const dateEnd = new Date(+req.query.end);
    RendezVous.findAll({ where: { idAgenda: +req.query.agenda } })
    .then(rendez_vous => {
        const infos = [];
        for (const rdv of rendez_vous) {
            const data = rdv.get_rendezVous(dateStart, dateEnd);
            if (data) {
                data.readonly = !res.locals.agendas[+req.query.agenda].isOwner;
                infos.push(data);
            }
        }
        return res.json(infos);
    }).catch(err => {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    });
}

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
        idAgenda: +data.agenda
    })
    .then(rendez_vous => {
        return res.status(200).json(rendez_vous.idAgenda);
    })
}

/*Fonction modifie un rendez vous */
export async function modifierRendezVousCalendarPOST(req, res) {
    if (!res.locals.user) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
    //Récupération des champs du form
    const { id, title, lieu, description, agenda, startGap, endGap, allDay, type, frequence, dateFinRecurrence, nbOccurrences } = req.body;
    //Récupération du rdv avec l'id donné
    const rdvToUpdate = await RendezVous.findByPk(id);
    if (!rdvToUpdate) {
        return res.status(404).json({ message: 'Rendez-vous introuvable' });
    }
    //Sauvegarde du rdv
    rdvToUpdate.dateDebut = new Date(rdvToUpdate.dateDebut.valueOf() + startGap);
    rdvToUpdate.dateFin = new Date(rdvToUpdate.dateFin.valueOf() + endGap);
    rdvToUpdate.titre = title;
    rdvToUpdate.lieu = lieu;
    rdvToUpdate.allDay = allDay;
    rdvToUpdate.idAgenda = agenda;
    rdvToUpdate.description = description;
    // si on a envoyé un type, alors on veut modifier aussi les informations de récurrence
    if (type) {
        rdvToUpdate.type = type;
        rdvToUpdate.frequence = frequence;
        rdvToUpdate.finRecurrence = dateFinRecurrence ? new Date(+dateFinRecurrence) : dateFinRecurrence;
        rdvToUpdate.nbOccurrences = nbOccurrences;
    } 
    await rdvToUpdate.save();
    return res.status(200).json();
}

export function supprimerRDVDELETE(req, res) {
    if (!res.locals.user) {
        return res.redirect('/connexion');
    }
    RendezVous.findByPk(req.params.id)
    .then(rdv => {
        if (rdv) {
            if (res.locals.agendas[rdv.idAgenda].isOwner) {
                rdv.destroy()
                .then(_ => {
                    res.status(200).end();
                }).catch(error => {
                    res.status(400).end();
                })
            } else {
                res.status(400).end();
            }
        }
    }).catch(_ => {
        res.status(400).end();
    })
}