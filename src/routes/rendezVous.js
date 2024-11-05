import AgendaRendezVous from "../model/AgendaRendezVous.js";
import {ValidationError} from "sequelize";
import { addDays } from "../date_utils.js";
import User from "../model/User.js";
import RendezVous from "../model/RendezVous.js";


/**
 * Traite la requête POST sur /rendezVous.
 * Si la création du rendez vous a échoué, affiche un message d'erreur, sinon renvoie vers / .
 * @param req La requête
 * @param res La réponse
 */
export async function creationRendezVousPOST(req, res){
    if (!res.locals.user) {
        return res.status(403).json({ message: 'Unauthorized access' });
    }

    let rendezVous = null;
    const agendas = !(req.body.agendas instanceof Object) ? [(+req.body.agendas)] :
        req.body.agendas.map(n => +n);
    try {
        const dateDebut = new Date(req.body.dateDebut);
        let dateFin = new Date(req.body.dateFin);
        if (req.body.all_day == "all_day") {
            dateDebut.setHours(0, 0, 0);
            // date de fin exclusive, donc on ajoute un jour
            dateFin = addDays(dateFin, 1);
            dateFin.setHours(0, 0, 0);
        }
        rendezVous = RendezVous.build({
            titre: req.body.titre,
            lieu: (req.body.lieu ?? null),
            description: (req.body.desc ?? null),
            dateDebut: dateDebut,
            dateFin: dateFin,
            allDay: req.body.all_day == "all_day",
        });
        // si c'est un rendez-vous récurrent
        if (req.body.recurrent == "rec") {
            if (req.body.freq_type == "j" || req.body.freq_type == "s") {
                rendezVous.set("type", "Regular");
            } else {
                rendezVous.set("type", req.body.freq_type);
            }
            // si c'est des semaines, cela revient à 7 jours
            rendezVous.set("frequence", req.body.freq_type == "s" ? 7 * (+req.body.freq_number) : +req.body.freq_number);
            if (req.body.fin_recurrence == "0") {
                const d = addDays(new Date(req.body.date_fin_recurrence), 1);
                d.setHours(0, 0, 0);
                rendezVous.set("finRecurrence", d);
            } else if (req.body.fin_recurrence == "1") {
                rendezVous.set('nbOccurrences', +req.body.nb_occurence);
            }
        }
        await rendezVous.save();
        try {
            for (const agenda_id of agendas) {
                await AgendaRendezVous.create({idAgenda: agenda_id, idRendezVous: rendezVous.id})
            }
            return res.status(200).json();
        }
        catch (e) {
            await rendezVous.destroy();
            rendezVous = null;
            console.error('Erreur lors de la modification du rdv:', e);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } catch (e) {
        console.error('Erreur lors de la modification du rdv:', e);
        return res.status(500).json({ message: "Une erreur s'est produite" });
    }
}