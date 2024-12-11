import { Sequelize, Op } from "sequelize";
import RendezVous from "../model/RendezVous.js";
import { monthDiff, yearDiff, ONE_DAY, THIS_EVENT, ALL_EVENTS, FUTURE_EVENTS } from "../public/js/utils.js";
import { ALL } from "dns";
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
        const id_to_rdv = {};
        for (const rdv of rendez_vous) {
            if (rdv.idParent) {
                if (id_to_rdv[rdv.idParent] != undefined) {
                    id_to_rdv[rdv.idParent].add(rdv.dateDebutDansParent.valueOf());
                } else {
                    id_to_rdv[rdv.idParent] = new Set([rdv.dateDebut.valueOf()]);
                }
            }
        }
        for (const rdv of rendez_vous) {
            const data = rdv.get_rendezVous(dateStart, dateEnd, id_to_rdv[rdv.id]);
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
        idAgenda: +data.agenda,
        color: data.color
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
    const id = req.body.id;
    delete req.body['id'];

    const rec_changes = req.body.rec_changes;
    delete req.body['rec_changes'];

    const update_date_debut_dans_parent = req.body.update_spec_date;
    delete req.body.update_spec_date;

    const real_id = req.body.real_id;
    delete req.body.real_id;

    if (req.body.startGap) {
        const gap_in_seconds = req.body.startGap / 1000; 
        delete req.body.startGap;
        req.body.dateDebut = Sequelize.literal(`CASE
                                                    WHEN id = ${real_id} THEN DATE_ADD(dateDebut, INTERVAL ${gap_in_seconds} second)
                                                    ELSE dateDebut
                                                END`);
        if (update_date_debut_dans_parent) {
            req.body.dateDebutDansParent = Sequelize.literal(`DATE_ADD(dateDebutDansParent, INTERVAL ${gap_in_seconds} second)`);
        }
    }

    if (req.body.endGap) {
        const gap_in_seconds = req.body.endGap / 1000;
        delete req.body.endGap;
        req.body.dateFin = Sequelize.literal(`CASE
                                                WHEN id = ${real_id} THEN DATE_ADD(dateFin, INTERVAL ${gap_in_seconds} second)
                                                ELSE dateFin
                                              END`);
    }

    if (req.body.start) {
        req.body.dateDebut = new Date(+req.body.start);
        delete req.body.start;
    }

    if (req.body.end) {
        req.body.dateFin = new Date(+req.body.end);
        delete req.body.end;
    }

    if (req.body.finRecurrence != undefined) {
        req.body.finRecurrence = new Date(+req.body.finRecurrence);
        req.body.nbOccurrences = null;
    }

    if (req.body.nbOccurrences != undefined) {
        req.body.finRecurrence = null;
    }

    if (rec_changes) {
        await RendezVous.destroy({where: {idParent: id}});
    }

    RendezVous.update(req.body, {
        where: {
            [Op.or]: [{id: id}, {idParent: id}]
        }
    })
    .then(_ => res.status(200).json())
    .catch(err => {
        console.log(err);
        res.status(400).json();
    });
}

export function modifierRendezVousRecInstancePOST(req, res) {
    if (!res.locals.user) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
    //Récupération des champs du form
    const { id, title, lieu, description, agenda, start, end, allDay, color, type, frequence, fin_recurrence, nbOccurrences, dateDebutDansParent } = req.body;
    
    RendezVous.create({
        titre: title, lieu: lieu, description: description,
        dateDebut: new Date(+start), dateFin: new Date(+end), allDay: allDay,
        idAgenda: agenda,
        color: color, type: type, nbOccurrences: nbOccurrences,
        frequence: frequence, fin_recurrence: fin_recurrence ? new Date(+fin_recurrence) : null,
        idParent: id, deleted: false, dateDebutDansParent: new Date(+dateDebutDansParent)
    })
    .then(_ => res.status(200).end())
    .catch(_ => res.status(400).end())
}

export function supprimerRDVDELETE(req, res) {
    if (!res.locals.user) {
        return res.redirect('/connexion');
    }
    const id = req.body.id;
    const which = req.body.which;
    const start = req.body.start;
    const end = req.body.end;
    const startNoHours = req.body.startNoHours;
    const idParent = req.body.idParent;
    if (!which)
        removeSimpleRDV(id, res);
    else if (which === THIS_EVENT) {
        removeInstanceRecRDV(id, start, end, idParent, res);
    } else if (which === ALL_EVENTS) {
        removeSimpleRDV(idParent ? idParent : id, res);
    } else if (which === FUTURE_EVENTS) {
        removeFutureRDV(idParent ? idParent : id, startNoHours, res);
    }  
}

function removeFutureRDV(id, start, res) {
    RendezVous.findByPk(id)
    .then(rdv => {
        const modif = {};
        const startDate = new Date(+start);
        if (rdv.nbOccurrences != null) {
            // on trouve le nouveau nombre d'occurrences si on compte jusqu'à l'évènement cliqué
            const debut = rdv.dateDebut.valueOf();
            let nbOccurrences;
            if (start <= debut) {
                nbOccurrences = 0;
            } else {
                if (rdv.type === 'Daily') {
                    nbOccurrences = Math.ceil((start - debut)/(rdv.frequence * ONE_DAY));
                } else if (rdv.type === 'Weekly') {
                    nbOccurrences = Math.ceil((start - debut)/(rdv.frequence * ONE_DAY * 7));
                } else if (rdv.type === 'Monthly') {
                    let month_diff = monthDiff(rdv.dateDebut, startDate);
                    if (startDate.getDate() > rdv.dateDebut.getDate()) {
                        month_diff += 1;
                    }
                    nbOccurrences = Math.ceil(month_diff / rdv.frequence);
                } else { // year
                    let year_diff = yearDiff(rdv.dateDebut, startDate);
                    if (startDate.getMonth() > rdv.dateDebut.getMonth() || (startDate.getMonth() === rdv.dateDebut.getMonth() && startDate.getDate() > rdv.dateDebut.getDate())) {
                        year_diff += 1;
                    }
                    nbOccurrences = Math.ceil(year_diff / rdv.frequence);
                }
            }
            modif['nbOccurrences'] = nbOccurrences;
        } else {
            modif['finRecurrence'] = startDate;
        }
        RendezVous.update(modif, {
            where: {
                [Op.or]: [{id: id}, {idParent: id}]
            }
        })
        .then(_ => {
            RendezVous.destroy({
                where: {
                    idParent: id, 
                    dateDebut: {
                        [Op.gte]: startDate
                    }
                }
            })
            .then(_ => res.status(200).end())
            .catch(_ => res.status(400).end());
        });
    })
}

function removeSimpleRDV(id, res) {
    RendezVous.findByPk(id)
    .then(rdv => {
        if (rdv) {
            if (res.locals.agendas[rdv.idAgenda].isOwner) {
                rdv.destroy()
                .then(_ => res.status(200).end())
                .catch(_ => res.status(400).end())
            } else {
                res.status(400).end();
            }
        }

    }).catch(_ => res.status(400).end())
}

function removeInstanceRecRDV(id, startDate, endDate, existing_child, res) {
    RendezVous.findByPk(id)
    .then(rdv => {
        if (rdv) {
            if (res.locals.agendas[rdv.idAgenda].isOwner) {
                if (existing_child) {
                    RendezVous.update({deleted: true}, {where: {id: id}})
                    .then(_ => res.status(200).end())
                    .catch(_ => res.status(400).end())
                } else {
                    startDate = new Date(+startDate);
                    endDate = new Date(+endDate);
                    RendezVous.findByPk(id)
                    .then(parent => {
                        RendezVous.create({
                            titre: parent.titre, lieu: parent.lieu, description: parent.description,
                            dateDebut: startDate, dateFin: endDate, allDay: parent.all_day,
                            idAgenda: parent.idAgenda,
                            color: parent.color,
                            type: parent.type, frequence: parent.frequence, 
                            finRecurrence: parent.finRecurrence, nbOccurrences: parent.nbOccurrences,
                            idParent: id, deleted: true, dateDebutDansParent: startDate
                        })
                        .then(_ => res.status(200).end())
                        .catch(_ => res.status(400).end())
                    })
                }
            } else {
                res.status(400).end();
            }
        }
    }).catch(_ => res.status(400).end())
}

export function modifyFutureRecRDVPOST(req, res) {
    if (!res.locals.user) {
        return res.redirect('/connexion');
    }
    const id = req.body.id;
    const start = req.body.start;
    const fake_start = req.body.start;
    const startNoHours = req.body.startNoHours;
    const changes = req.body.changes;
    RendezVous.findByPk(id)
    .then(rdv => {
        const modif = {};
        const old_data = rdv.dataValues;
        delete old_data.id;
        const startDate = new Date(+startNoHours);
        let nbOccurrences;
        if (rdv.nbOccurrences != null) {
            // on trouve le nouveau nombre d'occurrences si on compte jusqu'à l'évènement cliqué
            const debut = rdv.dateDebut.valueOf();
            if (startNoHours <= debut) {
                nbOccurrences = 0;
            } else {
                if (rdv.type === 'Daily') {
                    nbOccurrences = Math.ceil((startNoHours - debut)/(rdv.frequence * ONE_DAY));
                } else if (rdv.type === 'Weekly') {
                    nbOccurrences = Math.ceil((startNoHours - debut)/(rdv.frequence * ONE_DAY * 7));
                } else if (rdv.type === 'Monthly') {
                    let month_diff = monthDiff(rdv.dateDebut, startDate);
                    if (startDate.getDate() > rdv.dateDebut.getDate()) {
                        month_diff += 1;
                    }
                    nbOccurrences = Math.ceil(month_diff / rdv.frequence);
                } else { // year
                    let year_diff = yearDiff(rdv.dateDebut, startDate);
                    if (startDate.getMonth() > rdv.dateDebut.getMonth() || (startDate.getMonth() === rdv.dateDebut.getMonth() && startDate.getDate() > rdv.dateDebut.getDate())) {
                        year_diff += 1;
                    }
                    nbOccurrences = Math.ceil(year_diff / rdv.frequence);
                }
            }
            modif['nbOccurrences'] = nbOccurrences;
        } else {
            modif['finRecurrence'] = startDate;
        }
        // on met à jour les rendez-vous
        RendezVous.update(modif, {
            where: {
                [Op.or]: [{id: id}, {idParent: id}]
            }
        })
        .then(_ => {
            // on crée un nouveau rendez-vous pour représenter la recurrence
            RendezVous.create(old_data)
            .then(new_rdv => {
                const new_start = new Date(+fake_start);
                new_rdv.set('dateDebut', new_start);
                new_rdv.set('dateFin', new Date(new_start.getTime() + (old_data.dateFin.getTime() - old_data.dateDebut.getTime())));
                if (new_rdv.nbOccurrences != null) {
                    console.log(old_data.nbOccurrences, nbOccurrences);
                    new_rdv.set('nbOccurrences', old_data.nbOccurrences - nbOccurrences);
                }
                new_rdv.save()
                .then(_ => {
                    RendezVous.update({idParent: new_rdv.id}, {
                        where: {
                            idParent: id,
                            dateDebut: {[Op.gte]: new Date(+start)}
                        }
                    })
                    .then(_ => {
                        changes['id'] = new_rdv.id;
                        if (changes.real_id == id) {
                            changes.real_id = new_rdv.id;
                        }
                        req.body = changes;
                        modifierRendezVousCalendarPOST(req, res);
                    })
                    .catch(_ => res.status(400).end());
                })
                .catch(_ => res.status(400).end());
            })
            .catch(_ => res.status(400).end());
        });
    })
}