import User from './model/User.js';
import sequelize from './database.js';
import Agenda from './model/Agenda.js';
import UserAgendaAccess from './model/UserAgendaAccess.js';

import dotenv from 'dotenv'; //Import qui permet la manipulation des variables d'environnement
import jwt from 'jsonwebtoken';
dotenv.config(); // Récupère et parse le fichier .env pour récupérer clé SECRET

let currentId = 0;

function getNewId() {
	return ++currentId;
}

export function index(req, res) {
	res.render('index');
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

export function inscriptionGET(req, res) {
	res.render('inscription', { errMsg: '' });
}
export async function inscriptionPOST(req, res) {
	try {
		const usr = await User.create({
			username: req.body.user_username,
			hashedPassword: User.hashPassowrd(req.body.user_password),
		});
		//Pour que le server authenthifie l'utilisateur à partir du cookie
		saveAuthentificationCookie(usr, res);
		res.redirect('/');
	} catch (e) {
		if (e.name === 'SequelizeUniqueConstraintError') {
			res.render('inscription', {
				errMsg: "Un compte existe déjà avec ce nom d'utilisateur !",
			});
		} else {
			res.redirect('/inscription');
		}
	}
}

export function creationAgendaGET(req, res) {
	res.render('creerAgenda');
}
export async function creationAgendaPOST(req, res) {
	try {
		//TODO : QUAND LA CONNEXION SERA IMPLEMENTEE, CHERCHER L'UTILISATEUR CONNECTE
		const usr = await User.create({ username: 'test', hashedPassword: '345678909876545678' });

		const agenda = await Agenda.create({
			nom: req.body.nom,
		});

		await UserAgendaAccess.create({
			idUser: usr.id,
			idAgenda: agenda.id,
			idOwner: usr.id,
		});

		res.redirect('/');
	} catch (_) {
		res.redirect('/creerAgenda');
	}
}

export function getThread(req, res, next) {
	const id = req.params.threadId;
	const thread = forum.threads.find((thread) => thread.id == id);
	if (!thread) {
		next(createError(404));
	} else {
		res.send(threadView(thread));
	}
}
//Pour se diriger à la page de connexion
export function connexionGET(req, res, next) {
	res.render('connexion', { errMsg: '' });
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
	res.clearCookie('accessToken');
	res.redirect('/');
}
export function authenticate(req, res, next) {
	try {
		let token = req.cookies.accessToken; // ou alors req.cookies['accessToken'];
		let user = jwt.verify(token, process.env.SECRET); //La fonction décripte le token
		res.locals.user = user;
		//IMPORTANT, à partir de maintenant, si res.locals.users est défini alors l'utilisateur est authentifié
	} catch {}
	next();
}
//A partir d'ici fonction pour l'authentification
export function createJWT(user) {
	return jwt.sign(
		{ id: user.id, username: user.username }, // données à crypter
		process.env.SECRET, //Clé de chiffrement dans .env
		{ expiresIn: '1h' } //Durée de 1h
	);
}
export function saveAuthentificationCookie(savedUser, res) {
	let token = createJWT({ id: savedUser.id, username: savedUser.username }); //On crée le token représentant notre user
	res.cookie('accessToken', token, { httpOnly: true });
}

/* explication sur l'authentification
Lorsqu'on s'inscrit ou se connecte on enregistre le cookie accessToken qui représente l'objet User (en crypté)
le middlewares   .use(routes.authenticate) va pour chaque requete, tester si le cookie accessToken contient un user, 
si c'est le cas il va insérer l'user décripté dans les variables locales de la reponse actuelle (res.locals.user = user)

Dans les différents templates, on a qu'a vérifier comme dans cette exemple : 
<% if (locals.user) { %>
    <p>Vous êtes connecté : <%= locals.user.username %></p>
  */

