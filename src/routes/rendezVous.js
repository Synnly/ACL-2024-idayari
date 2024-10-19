import AgendaRendezVous from "../model/AgendaRendezVous.js";
import {ValidationError} from "sequelize";
import User from "../model/User.js";
import RendezVous from "../model/RendezVous.js";
import Token from "../model/Token.js";

/**
 * Traite la requête GET sur /rendezVous.
 * Si l'user est déconnecté, renvoie vers /
 * @param req La requête
 * @param res La réponse
 */
export async function creationRendezVousGET(req, res) {
    const valid = await Token.checkValidity(req, res);

    if (valid && res.locals.user) {
        const user = await User.getById(res.locals.user.id);
        return res.render("rendezVous", { agendas: await user.getMyAgendas() });
    } else {
        return res.redirect("/");
    }
}

function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
}

// quick addMonth and addYears functions, should use moment.js in the future
function addMonths(date, months) {
    const result = new Date(date.getTime());
    const d = date.getDate();
    result.setMonth(result.getMonth() + months);
    if (result.getDate() != d) {
      result.setDate(0);
    }
    return result;
  }

  function addYears(date, years) {
    const result = new Date(date.getTime());
    result.setFullYear(result.getFullYear() + years);
    return result;
  }


/**
 * Traite la requête POST sur /rendezVous.
 * Si la création du rendez vous a échoué, affiche un message d'erreur, sinon renvoie vers / .
 * @param req La requête
 * @param res La réponse
 */
export async function creationRendezVousPOST(req, res) {
    const valid = await Token.checkValidity(req, res);
    if(!valid || !res.locals.user){
        return res.redirect('/');
    }
    let rendezVous = null;
    let errMsgs = [];
    const agendas = !(req.body.agendas instanceof Object) ? [(+req.body.agendas)] : 
                                                            req.body.agendas.map(n => +n);
    try {
        rendezVous = RendezVous.build({
            titre: req.body.titre,
            lieu: (req.body.lieu ?? null),
            description: (req.body.desc ?? null),
            dateDebut: Date.parse(req.body.dateDebut),
            dateFin: Date.parse(req.body.dateFin),
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
            errMsgs = [e, "Une erreur inattendue est survenue. Veuillez réessayer plus tard."];
        }
    } catch (e) {
        rendezVous = null;
        if (e instanceof ValidationError) {
            errMsgs = e.errors.map(x => x.message);
        } else {
            errMsgs = [e, "Une erreur inattendue est survenue. Veuillez réessayer plus tard."];
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