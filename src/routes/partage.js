import ejs, {render} from "ejs";
import Agenda from "../model/Agenda.js";
import User from "../model/User.js";
import UserAgendaAccess from "../model/UserAgendaAccess.js";

export async function voirPartagesGET(req, res){
		if(!res.locals){
				return res.redirect("/");
		}

		const user = await User.getById(res.locals.user.id);
		res.locals.agendas = await user.getAgendas();
		res.locals.partages = {};

		for(const agenda of res.locals.agendas){
				res.locals.partages[agenda.id] = agenda.estPartage;
		}

		const html = await ejs.renderFile("views/partage.ejs", res.locals, {async:true});
		res.send(html);
}

export async function creerPartageGET(req, res){
		if(!res.locals){
				return res.status(403).json({message: 'Unauthorized access'});
		}
		try{
				const agenda = await Agenda.findOne({where: {id: req.params.id}});
				if(agenda.estPartage){
						return res.status(409).json({message: "Cet agenda est déjà partagé"});
				}
				await Agenda.update({estPartage: true},{where: {id: req.params.id}});
				return res.status(200).json();
		}
		catch (e){
				console.error("Erreur lors du partage de l'agenda:", e);
				return res.status(500).json({message: "Une erreur s'est produite"});
		}
}

export async function ajouterPartageGET(req, res){
		if(!res.locals){
				return res.redirect("/");
		}

		const agenda = await Agenda.findByPk(req.params.id);
		const owner = await agenda.getOwner();

		// le propriétaire essaie d'ajouter son propre agenda
		if(owner.dataValues.id === res.locals.user.id){
				return res.redirect("/");
		}

		// L'user a déjà accès à l'agenda
		const userPartage = await UserAgendaAccess.findOne({where: {idUser: res.locals.user.id, idAgenda: agenda.id}});
		if(userPartage){
				return res.redirect("/");
		}

		try{
				await UserAgendaAccess.create({idUser: res.locals.user.id, idAgenda: agenda.id});
		}
		catch (e) {
				return res.render("error", {
						message: "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
				});
		}

		return res.redirect("/");

}