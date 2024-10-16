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
        res.render("rendezVous", { agendas: await user.getMyAgendas() });
    } else {
        res.redirect("/");
    }
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
        res.redirect('/')
    }

    let rendezVous = null;
    let errMsgs = [];
    let agendas = null;
    if (! (req.body.agendas instanceof Object)) {
        agendas = [(+req.body.agendas)];
    } else {
        agendas = req.body.agendas.map(n => +n);
    }
    try {
        rendezVous = await RendezVous.create({
            titre: req.body.titre,
            lieu: (req.body.lieu ?? null),
            description: (req.body.desc ?? null),
            dateDebut: Date.parse(req.body.dateDebut),
            dateFin: Date.parse(req.body.dateFin),
        });
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
            errMsgs = ["Une erreur est inattendue survenue. Veuillez réessayer plus tard."];
        }
    } catch (e) {
        if (e instanceof ValidationError) {
            errMsgs = e.errors.map(x => x.message);
        } else {
            errMsgs = ["Une erreur est inattendue survenue. Veuillez réessayer plus tard."];
        }
    }
    // si rendezVous = null alors on a pas réussi à créer les lignes
    if (!rendezVous) {
        const user = await User.getById(res.locals.user.id);
        res.render("rendezVous", { errMsgs: errMsgs, agendas: await user.getMyAgendas(),
            titre: req.body.titre, lieu: req.body.lieu, desc: req.body.desc, dateDebut: req.body.dateDebut, dateFin: req.body.dateFin,
            agendasSelectionnes: agendas
        });
    } else {
        res.redirect("/");
    }
}