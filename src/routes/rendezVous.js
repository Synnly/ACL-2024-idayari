import AgendaRendezVous from "../model/AgendaRendezVous.js";
import {ValidationError} from "sequelize";
import User from "../model/User.js";
import RendezVous from "../model/RendezVous.js";
import { addDays, addMonths, addYears } from "../date_utils.js";

/**
 * Traite la requête GET sur /rendezVous.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function creationRendezVousGET(req, res) {
    if (res.locals.user) {
        const user = await User.getById(res.locals.user.id);
        return res.render("rendezVous", { agendas: await user.getMyAgendas() });
    } else {
        return res.redirect("/");
    }
}

/**
 * Traite la requête POST sur /rendezVous.
 * Si la création du rendez vous a échoué, affiche un message d'erreur, sinon renvoie vers / .
 * @param req La requête
 * @param res La réponse
 */
export async function creationRendezVousPOST(req, res) {
    if (!res.locals.user) {
        return res.redirect('/')
    }
    let rendezVous = null;
    let errMsgs = [];
    const agendas = !(req.body.agendas instanceof Object) ? [(+req.body.agendas)] : 
                                                            req.body.agendas.map(n => +n);
    try {
        const dateDebut = new Date(req.body.dateDebut);
        const dateFin = new Date(req.body.dateFin);
        if (req.body.all_day == "all_day") {
            dateDebut.setHours(0, 0, 0, 0);
            dateFin.setHours(23, 59, 59, 999);
        }
        rendezVous = RendezVous.build({
            titre: req.body.titre,
            lieu: (req.body.lieu ?? null),
            description: (req.body.desc ?? null),
            dateDebut: dateDebut,
            dateFin: dateFin,
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
                const d = new Date(Date.parse(req.body.date_fin_recurrence));
                d.setHours(23, 59, 59, 999);
                rendezVous.set("finRecurrence", d);
            } else if (req.body.fin_recurrence == "1") {
                const nb_occur = +req.body.nb_occurence;
                const add_function = rendezVous.type == 'Regular' ? addDays : (rendezVous.type == 'Monthly' ? addMonths : addYears);
                const d = add_function(rendezVous.dateDebut, (nb_occur-1) * rendezVous.frequence);
                d.setHours(23, 59, 59, 999);
                rendezVous.set('finRecurrence', d);
            }
        }
        await rendezVous.save();
        try {
            for (const agenda_id of agendas) {
                await AgendaRendezVous.create({
                    idAgenda: agenda_id,
                    idRendezVous: rendezVous.id
                })
            }
        } catch (e) {
            await rendezVous.destroy();
            rendezVous = null;
            errMsgs = ["Une erreur inattendue est survenue. Veuillez réessayer plus tard."];
        }
    } catch (e) {
        rendezVous = null;
        if (e instanceof ValidationError) {
            errMsgs = e.errors.map(x => x.message);
        } else {
            errMsgs = ["Une erreur inattendue est survenue. Veuillez réessayer plus tard."];
        }
    }
    // si rendezVous = null alors on a pas réussi à créer les lignes
    if (!rendezVous) {
        const user = await User.getById(res.locals.user.id);
        return res.render("rendezVous", { errMsgs: errMsgs, agendas: await user.getMyAgendas(),
            titre: req.body.titre, lieu: req.body.lieu, desc: req.body.desc, dateDebut: req.body.dateDebut, dateFin: req.body.dateFin,
            agendasSelectionnes: agendas
        });
    } else {
        return res.redirect("/");
    }
}