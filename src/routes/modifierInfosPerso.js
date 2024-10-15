import User from "../model/User.js";
import {saveAuthentificationCookie} from "../token.js";
import Token from "../model/Token.js";

/**
 * Affiche le template des informations personnelles de l'utilisateur
 * si l'utilisateur est connecté, sinon on le renvoie vers la page connexion
 * @param {object} req - Requête express, informations sur la requête HTTP.
 * @param {object} res - Response express pour le client.
 * @returns {void} retourne rien, fais un rendu d'un template.
 */
export async function modifierInfosPersoGET(req, res) {
    const valid = await Token.checkValidity(req, res);

    if (valid && res.locals.user) {
        res.render('infos_perso');
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
    const valid = await Token.checkValidity(req, res);
    if(!valid){
        res.redirect('/')
    }

    try {
        //On cherche si un utilisateur avec cette username existe déjà s'il veut le changer, si oui on le préviens
        const user = await User.findOne({where: {username: req.body.user_username_change_info}});

        if (user) {
            return res.render('infos_perso', { errMsg: 'Vous ne pouvez pas chosir cet username !' });
        } else {
            //Sinon on récupère les informations du formulaire ainsi que le mdp et username courant
            const username = req.body.user_username_change_info;
            const password = req.body.user_password_change_info;
            const lastUsername = res.locals.user.username;

            const user = await User.findOne({where: {username: lastUsername}});

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

                await User.update(data, {where: {username: lastUsername}});

                //On regarde qu'est ce qui à changer et on modifie la bdd en fonction
                if (hasUsernameChanged && hasPasswordChanged) {
                    let updatedUser = await User.findOne({ where: { username: username } });
                    updatedUser.hashedPassword = data.hashedPassword;
                    saveAuthentificationCookie(updatedUser, res);
                } else if (hasUsernameChanged) {
                    const updatedUser = { id: user.id, username: data.username, hashedPassword: lastPassword };
                    await Token.deleteToken(req.cookies.accessToken);
                    saveAuthentificationCookie(updatedUser, res);
                } else if (hasPasswordChanged) {
                    const updatedUser = { id: user.id, username: user.username, hashedPassword: data.hashedPassword };
                    await Token.deleteToken(req.cookies.accessToken);
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