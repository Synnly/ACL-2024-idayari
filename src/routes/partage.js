import ejs, { render } from 'ejs';
import Agenda from '../model/Agenda.js';
import User from '../model/User.js';
import UserAgendaAccess from '../model/UserAgendaAccess.js';
import crypto from 'crypto';
import { Op, where } from 'sequelize';

export async function voirPartagesGET(req, res) {
	if (!res.locals.user) {
		return res.redirect('/');
	}
	res.locals.partages = {};
	const user = await User.findByPk(res.locals.user.id);
	res.locals.username = user.username;

	const query = await Agenda.findAll({
		where: { idOwner: res.locals.user.id },
		include: [
			{
				model: User,
				attributes: ['username'],
			},
		],
	});
	res.locals.agendas = query.map((agenda) => {
		return { id: agenda.dataValues.id, nom: agenda.dataValues.nom, estPartage: agenda.dataValues.estPartage, link: agenda.link };
	});
	res.locals.partages = query.map((agenda) => {
		return { id: agenda.id, users: agenda.dataValues.Users.map((user) => user.dataValues.username) };
	});

	const html = await ejs.renderFile('views/partage.ejs', res.locals, { async: true });
	res.send(html);
}

export async function creerPartageGET(req, res) {
	if (!res.locals.user) {
		return res.redirect("/");
	}
	try {
		const id = req.params.id;
		const link = crypto.randomBytes(64).toString('hex');
		if (!id) {
			return res.status(400).json({ message: 'Paramètre invalide : ID et lien requis.' });
		}

		const result = await Agenda.update({ estPartage: true, link: link }, { where: { id } });

		if (result[0] === 0) {
			return res.status(409).json({ message: "Cet agenda est déjà partagé ou n'existe pas." });
		}

		return res.status(200).json({ message: 'Agenda mis à jour avec succès', link: link });
	} catch (e) {
		console.error("Erreur lors du partage de l'agenda:", e);
		return res.status(500).json({ message: "Une erreur s'est produite" });
	}
}

export async function ajouterPartageGET(req, res) {
	if (!res.locals.user) {
		return res.redirect('/');
	}

	let agenda;
	let owner;
	try {
		agenda = await Agenda.findOne({
			where: {
				link: req.params.id,
			},
		});
		owner = await agenda.getOwner();
	} catch (e) {
		return res.render('error', {
			message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
			status: 500,
		});
	}

	// Agenda non partagé
	if (!agenda.estPartage) {
		return res.redirect('/');
	}

	// le propriétaire essaie d'ajouter son propre agenda
	if (owner.dataValues.id === res.locals.user.id) {
		return res.redirect('/');
	}

	try {
		await UserAgendaAccess.findOrCreate({ where: { idUser: res.locals.user.id, idAgenda: agenda.id } });
	} catch (e) {
		return res.render('error', {
			message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
			status: 500,
		});
	}

	return res.redirect('/');
}

export async function confirmerAjoutPartageGET(req, res) {
	if (!res.locals.user) {
		return res.redirect('/');
	}
	const user = await User.findByPk(res.locals.user.id);
	res.locals.username = user.username;
	let agenda;
	let owner;
	try {
		agenda = await Agenda.findOne({ where: { link: req.params.id } });
		if(!agenda){
			return res.render('error', {
				message: 'Le lien est invalide',
				status: 404,
			});
		}
		owner = await agenda.getOwner();
	} catch (e) {
		return res.render('error', {
			message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
			status: 500,
		});
	}

	// Agenda non partagé
	if (!agenda.estPartage) {
		return res.redirect('/');
	}

	// le propriétaire essaie d'ajouter son propre agenda
	if (owner.dataValues.id === res.locals.user.id) {
		return res.redirect('/');
	}

	// L'user a déjà accès à l'agenda
	const userPartage = await UserAgendaAccess.findOne({ where: { idUser: res.locals.user.id, idAgenda: agenda.id } });
	if (userPartage) {
		return res.redirect('/');
	}
	res.locals.isAdding = true;

	const html = await ejs.renderFile('views/partage.ejs', { locals: res.locals, agenda: { id: agenda.id, nom: agenda.nom, owner: owner.dataValues.username, link: agenda.link } }, { async: true });
	res.send(html);
}

export async function supprimerPartageGET(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }

    try {
        const user = await User.findByPk(res.locals.user.id); 
        const agenda = await Agenda.findOne({ where: { id: req.params.id } });
        if (!agenda) {
            return res.render('error', {
                message: "Agenda introuvable.",
                status: 404,
            });
        }
        const owner = await agenda.getOwner(); 

		//Cas ou le proprio arrête le partage donc on enlève tous les partages
        if (req.params.username === user.username) {
            if (owner.dataValues.id !== user.id) {
                return res.render('error', {
                    message: 'Vous ne pouvez pas accéder à cette page',
                    status: 403,
                });
            }

            await UserAgendaAccess.destroy({
                where: {
                    idAgenda: req.params.id,
                    idUser: { [Op.ne]: user.id }, 
                },
            });

            await Agenda.update(
                { estPartage: false, link: null },
                { where: { id: req.params.id } }
            );

            return res.status(200).json({ message: "Partage supprimé" });
        }
		//Cas ou le proprio veut arreter le partage de quelqu'un
        else {
            const otherUser = await User.findOne({ where: { username: req.params.username } });
            if (!otherUser) {
                return res.render('error', {
                    message: "Utilisateur introuvable.",
                    status: 404,
                });
            }

            await UserAgendaAccess.destroy({
                where: {
                    idAgenda: req.params.id,
                    idUser: otherUser.id,
                },
            });
			const link = crypto.randomBytes(64).toString('hex');
			await agenda.update(
				{link: link },
				{ where: { id: req.params.id } }
			)

            return res.status(200).json({ message: `Partage supprimé pour ${req.params.username}` });
        }
    } catch (e) {
        console.log(e);
        return res.render('error', {
            message: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
            status: 500,
        });
    }
}