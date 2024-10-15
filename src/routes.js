import User from "./model/User.js";
import Agenda from "./model/Agenda.js";
import RendezVous from "./model/RendezVous.js";
import { sequelize } from "./database.js";
import UserAgendaAccess from "./model/UserAgendaAccess.js";
import { saveAuthentificationCookie } from "./token.js";

import AgendaRendezVous from "./model/AgendaRendezVous.js";
import { ValidationError } from "sequelize";
import ejs from "ejs";

export async function index(req, res) {
  if (res.locals.user) {
    const user = await User.findOne({
      where: { id: res.locals.user.id },
    });
    res.locals.agendas = await user.getAgendas();
  }
  // récuperer les rendez-vous sont acynchrones donc pour permettre cela dans le ejs
  const html = await ejs.renderFile("views/index.ejs", res.locals, {async:true});
  res.send(html);
}

export function inscriptionGET(req, res) {
    if (!res.locals.user) {
        res.render("inscription");
    } else {
        // on reste où on est
        res.redirect("/");
    }
}

export async function inscriptionPOST(req, res) {
    try {
        const usr = await User.create({
            username: req.body.user_username,
            hashedPassword: User.hashPassowrd(req.body.user_password),
        });
        //Pour que le server authenthifie l'utilisateur à partir du cookie
        saveAuthentificationCookie(usr, res);
        res.redirect("/");
    } catch (e) {
        res.render("inscription", {
            errMsg: e.name === "SequelizeUniqueConstraintError" ? "Un compte existe déjà avec ce nom d'utilisateur !" : "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
        });
    }
}

/**
 * Affiche tu template des informations personnelles de l'utilisateur.
 * si l'utilisateur est connecté, sinon on le renvoie vers la page connexion
 * @param {object} req - Requête express, informations sur la requête HTTP.
 * @param {object} res - Response express pour le client.
 * @returns {void} retourne rien, fais un rendu d'un template.
 */
export function modifierInfosPersoGET(req, res) {
	if (res.locals.user) {
		res.render('infos_perso', { errMsg: '' });
	} else {
		res.redirect('connexion');
	}
}

/**
 * Gère quand l'utilisateur soumet le formulaire sur les modifications de ses informations
 * @param {object} req - Requête express, informations sur la requête HTTP.
 * @param {object} res - Response express pour le client.
 * @returns {void} un template avec un message pour chaque cas
 * @example si son nouveau nom d'utilisateur est déjà utilisé on ne change pas les infos dans la bdd et on le prévient
 * @example si le mdp de confirmation est incorrect on ne change pas les infos dans la bdd et on le prévient
 * @example si le formulaire est vide on le prévient
 * @example sinon si tout est bon on effectue les modifications dans la bdd est on le prévient
 */
export async function modifierInfosPersoPOST(req, res) {
	try {
		//On cherche si un utilisateur avec cette username existe déjà s'il veut le changer, si oui on le préviens
		const user = await User.findOne({
			where: {
				username: req.body.user_username_change_info,
			},
		});

		if (user) {
			return res.render('infos_perso', { errMsg: 'Vous ne pouvez pas chosir cet username !' });
		} else {
			//Sinon on récupère les informations du formulaire ainsi que le mdp et username courant
			const username = req.body.user_username_change_info;
			const password = req.body.user_password_change_info;
			const lastUsername = res.locals.user.username;

			const user = await User.findOne({
				where: {
					username: lastUsername,
				},
			});

			const lastPassword = user.hashedPassword;
			let hasUsernameChanged = false;
			let hasPasswordChanged = false;
			let data = {};
			const passwordConfirm = req.body.user_password_change_info_confirmation_hidden;

			/* Si le formulaire est pas vide oet que le mdp de confirmation est correct on effectue les
			modification de la bdd sinon on le préviens du problème */

			if ((username !== '' || password !== '') && lastPassword === User.hashPassowrd(passwordConfirm)) {
				if (username !== '') {
					data.username = username;
					hasUsernameChanged = true;
				}
				if (password !== '') {
					data.hashedPassword = User.hashPassowrd(password);
					hasPasswordChanged = true;
				}
				if (Object.keys(data).length > 0) {
					await User.update(data, {
						where: {
							username: lastUsername,
						},
					});
				}

				//On regarde qu'est ce qui à changer et on modifie la bdd en fonction
				if (hasUsernameChanged && hasPasswordChanged) {
					let updatedUser = await User.findOne({ where: { username: username } });
					updatedUser.hashedPassword = data.hashedPassword;
					saveAuthentificationCookie(updatedUser, res);
				} else if (hasUsernameChanged) {
					const updatedUser = { id: user.id, username: data.username, hashedPassword: lastPassword };
					saveAuthentificationCookie(updatedUser, res);
				} else if (hasPasswordChanged) {
					const updatedUser = { id: user.id, username: user.username, hashedPassword: data.hashedPassword };
					saveAuthentificationCookie(updatedUser, res);
				}
				return res.redirect('/infos_perso');
			}

			//Si le mdp de confirmation est incorrect alors on le prévient
			if (lastPassword !== User.hashPassowrd(passwordConfirm)) {
				return res.render('infos_perso', { errMsg: 'Le mot de passe est incorrect.' });
			}
			//Si le formulaire est vide on le prévient
			return res.render('infos_perso', { errMsg: "Aucunes modifications n'est effectué car le formulaire était vide." });
		}
	} catch (error) {
		return res.render('infos_perso', { errMsg: "Une erreur s'est produite" });
	}
}

export function creationAgendaGET(req, res) { 
  if (res.locals.user) {
    res.render("creerAgenda");
  } else {
    res.redirect("/");
  }
}

export async function creationAgendaPOST(req, res) {
    let agenda = null;
    try {
      agenda = await Agenda.create({
          nom: req.body.nom,
          idOwner: res.locals.user.id
      });
    } catch (e) {
        res.render("creerAgenda", {
            errMsg: "Une erreur est inattendue survenue. Veuillez réessayer plus tard.",
        });
        return
    }
    try {
      await UserAgendaAccess.create({
        idUser: res.locals.user.id,
        idAgenda: agenda.id
      })
      res.redirect('/');
    } catch (e){
        await agenda.destroy();
        res.render("creerAgenda", {
            errMsg: "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
        });
    }
}

//Pour se diriger à la page de connexion
export function connexionGET(req, res, next) {
    if (!res.locals.user) {
        res.render("connexion");
    } else {
        res.redirect("/");
    }
}

//Pour traiter le formulaire de connexion
export async function connexionPOST(req, res, next) {
	let username = req.body.username;
	let password = User.hashPassowrd(req.body.password);

	const user = await User.findOne({
		where: { username: username, hashedPassword: password },
	});
	if (user === null) {
		res.render('connexion', {
			errMsg: 'Identifiant et/ou mot de passe invalides !',
		});
	} else {
		saveAuthentificationCookie(user, res);
		res.redirect('/');
	}
}
export function deconnexion(req, res, next) {
  await Token.deleteToken(req.cookies.accessToken);
	res.clearCookie('accessToken');
	res.redirect('/');
}

export async function creationRendezVousGET(req, res) {
  if (res.locals.user) {
    const user = await User.findOne({
      where: { id: res.locals.user.id }
    });
    res.render("rendezVous", { agendas: await user.getMyAgendas() });
  } else {
    res.redirect("/");
  }
}

export async function creationRendezVousPOST(req, res) {
  	let rendezVous = null;
  	let errMsgs = [];
  	try {
    	rendezVous = await RendezVous.create({
        	titre: req.body.titre,
        	lieu: req.body.lieu ?? null,
        	desc: req.body.desc ?? null,
        	dateDebut: Date.parse(req.body.dateDebut),
        	dateFin: Date.parse(req.body.dateFin),
    	});
		try {
			let agendas = req.body.agendas;
			if (! agendas instanceof Object) {
			  	agendas = [agendas];
			}
			for (const agenda_id of agendas) {
			  	await AgendaRendezVous.create({
					idAgenda: +agenda_id,
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
		const user = await User.findOne({
			where: { id: res.locals.user.id }
		});
		res.render("rendezVous", { errMsgs: errMsgs, agendas: await user.getMyAgendas(),
			titre: req.body.titre, lieu: req.body.lieu, desc: req.body.desc, dateDebut: req.body.dateDebut, dateFin: req.body.dateFin
		});
	} else {
		res.redirect("/");
	}
}