import User from "../model/User.js";
import { updateUsernameCookie } from "../token.js";

let SUCCESMSG = '';

/**
 * Affiche le template des informations personnelles de l'utilisateur
 * si l'utilisateur est connecté, sinon on le renvoie vers la page connexion
 * @param {object} req - Requête express, informations sur la requête HTTP.
 * @param {object} res - Response express pour le client.
 * @returns {void} retourne rien, fais un rendu d'un template.
 */
export async function modifierInfosPersoGET(req, res) {
	if (res.locals.user) {
		const succesMsg = SUCCESMSG || null;
    	res.render('infos_perso', { succesMsg: succesMsg })
	} else {
		return res.redirect('connexion');
	}
}

/**
 * Gère quand l'utilisateur soumet le formulaire sur les modifications de ses informations
 * @param {object} req - Requête express, informations sur la requête HTTP.
 * @param {object} res - Response express pour le client.
 * @returns {void} un template avec un message pour chaque cas
 * si son nouveau nom d'utilisateur est déjà utilisé on ne change pas les infos dans la bdd et on le prévient
 * si le mdp de confirmation est incorrect on ne change pas les infos dans la bdd et on le prévient
 * si le formulaire est vide on le prévient
 * sinon si tout est bon on effectue les modifications dans la bdd est on le prévient
 */
export async function modifierInfosPersoPOST(req, res) {
	if (res.locals.user) {
		try {
			let user = null;
			if(req.body.user_username_change_info) {
				//On cherche si un utilisateur avec cette username existe déjà s'il veut le changer, si oui on le préviens
				user = await User.findOne({where: {username: req.body.user_username_change_info}});
			}

			if (user) {
				return res.render('infos_perso', {errMsg: 'Vous ne pouvez pas chosir ce nom d\'utilisateur !'});
			} else {
				//Sinon on récupère les informations du formulaire ainsi que le mdp et username courant
				const username = req.body.user_username_change_info;
				const password = req.body.user_password_change_info;

				const user = await User.findByPk(res.locals.user.id);

				const lastPassword = user.hashedPassword;
				const passwordConfirm = req.body.user_password_change_info_confirmation_hidden;

				/* Si le formulaire est pas vide oet que le mdp de confirmation est correct on effectue les
					modification de la bdd sinon on le préviens du problème */
				const mdp_correct = lastPassword === User.hashPassword(passwordConfirm);
				if ((username || password) && mdp_correct) {
					if (username) {
						user.username = username;
					}
					if (password) {
						user.hashedPassword = User.hashPassword(password);
					}

					await user.save();
					// met à jour le cookie avec le nom d'utilisateur
					updateUsernameCookie(username, res);
					SUCCESMSG = "Vos modifications ont été effectuées avec succès.";
					return res.redirect('/infos_perso');
				}

				//Si le mdp de confirmation est incorrect alors on le prévient
				if (!mdp_correct) {
					return res.render('infos_perso', {errMsg: 'Le mot de passe est incorrect.'});
				}
				//Si le formulaire est vide on le prévient
				return res.render('infos_perso', {errMsg: "Aucunes modifications n'est effectué car le formulaire était vide."});
			}
		} catch (error) {
			console.log(error);
			return res.render('infos_perso', {errMsg: "Une erreur s'est produite"});
		}
	}else {
		return res.redirect('connexion');
	}
}