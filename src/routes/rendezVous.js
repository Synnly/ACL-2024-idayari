import RendezVous from "../model/RendezVous.js";
import Agenda from "../model/Agenda.js";
import ejs from 'ejs';


export function rendezVousModalGET(req, res) {
    if (!res.locals.user) {
        return res.render("/");
    }
    const data = req.query;
    data.agendas = [];
    // on récupère la liste des agendas du cookie
    for (const key of Object.keys(res.locals.agendas)) {
        const agenda = res.locals.agendas[key];
        if (agenda.isOwner) {
            data.agendas.push({id: key, nom: agenda.nom});
        }
    }
    ejs.renderFile('views/partials/rendez_vous_modal.ejs', data)
    .then(html => res.status(200).send(html))
    .catch(error => {
        console.log(error);
        res.status(400).end();
    });
}

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

}


export async function supprimerRDVGET(req, res) {
    if (!res.locals.user) {
        return res.redirect('/connexion')
    }

    try {
        const agenda = await Agenda.findOne({
            where: { id: req.params.idAgenda }
        });

        if (agenda.idOwner === res.locals.user.id) {
            await RendezVous.destroy({
                where: { id: req.params.id }
            });
            return res.redirect('/')
        } else {
            return res.render('error', {
                status: 403,
                message: "Vous n'êtes pas autorisé à supprimer ce rendez-vous."
            });
        }
    } catch (error) {
        return res.render('error', {
            status: 500,
            message: "Erreur serveur. Impossible de supprimer le rendez-vous."
        })
    }
}

