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