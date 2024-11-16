import User from "../model/User.js";
import ejs from "ejs";
import RendezVous from "../model/RendezVous.js";
import Agenda from "../model/Agenda.js";
import UserAgendaAccess from "../model/UserAgendaAccess.js";

/**
 * Traite la requête GET sur / .
 * Si l'user est connecté, affiche ses agendas
 * @param req La requête
 * @param res La réponse
 */
export async function index(req, res) {
    if (res.locals.user) {
        const user = await User.getById(res.locals.user.id);
        let agendas = await user.getAgendas();
        res.locals.agendas = agendas.filter(agenda => agenda.idOwner === res.locals.user.id);
        res.locals.partages = agendas.filter(agenda => agenda.idOwner !== res.locals.user.id && agenda.estPartage);
    }

    // récuperer les rendez-vous sont acynchrones donc pour permettre cela dans le ejs
    const html = await ejs.renderFile("views/index.ejs", res.locals, {async:true});
    res.send(html);
}

export async function modifierRendezVousPOST(req, res) {
    if (res.locals.user) {
        try {
            //Récupération des champs du form
            const { idRDV, titre, lieu, description, dateDebut, dateFin } = req.body;

            //Récupération du rdv avec l'id donné
            const rdvToUpdate = await RendezVous.findOne({ where: { id: idRDV } });

            if (!rdvToUpdate) {
                return res.status(404).json({ message: 'Rendez-vous introuvable' });
            }

            rdvToUpdate.titre = titre;
            rdvToUpdate.lieu = lieu;
            rdvToUpdate.description = description;
            rdvToUpdate.dateDebut = new Date(dateDebut);
            rdvToUpdate.dateFin = new Date(dateFin);

            await rdvToUpdate.save();

            return res.redirect('/');
        } catch (error) {
            console.error('Erreur lors de la modification du rdv:', error);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } else {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
}