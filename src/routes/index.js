import User from "../model/User.js";
import ejs from "ejs";
import RendezVous from "../model/RendezVous.js";

/**
 * Traite la requête GET sur / .
 * Si l'user est connecté, affiche ses agendas
 * @param req La requête
 * @param res La réponse
 */
export async function index(req, res) {
    if (res.locals.user) {
        const user = await User.getById(res.locals.user.id);
        res.locals.agendas = await user.getAgendas();
    }
    // récuperer les rendez-vous sont acynchrones donc pour permettre cela dans le ejs
    const html = await ejs.renderFile("views/index.ejs", res.locals, {async:true});
    res.send(html);
}


export async function modifierRendezVousCalendarPOST(req, res) {
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

            /*ATTENTION : On devrait être au format GMT+1 , ce qui n'est pas le cas dans le server j'avance d'1 heure ici
            manuellement, mais cela est à changer plus tard*/
            let debut =new Date(dateDebut); 
            // debut.setHours(debut.getHours() + 1)
            let fin =new Date(dateFin);  
            // fin.setHours(debut.getHours() + 1)

            rdvToUpdate.dateDebut = debut;

            rdvToUpdate.dateFin = fin;

            await rdvToUpdate.save();
            let data = {
                id: rdvToUpdate.id,
                titre: rdvToUpdate.titre,
                dateDebut: rdvToUpdate.dateDebut,
                dateFin: rdvToUpdate.dateFin,
                description: rdvToUpdate.description,
                lieu: rdvToUpdate.lieu
            };
            console.log('DATADATDATDATDATDAT',data);
            return res.json(data);

            //return res.redirect('/calendar');
        } catch (error) {
            console.error('Erreur lors de la modification du rdv:', error);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } else {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
}