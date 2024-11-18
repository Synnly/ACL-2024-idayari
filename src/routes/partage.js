import { sequelize } from "../database.js";
import User from "../model/User.js";
import UserAgendaAccess from "../model/UserAgendaAccess.js";
import Agenda from "../model/Agenda.js";
import { addAgenda } from "./agenda.js";
import ejs from "ejs";

export function agendaShareInfoGET(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }
    sequelize.query('SELECT Users.id, Users.username, UserAgendaAccess.statut FROM Users JOIN UserAgendaAccess ON Users.id = UserAgendaAccess.idUser WHERE UserAgendaAccess.idAgenda = ? and Users.id != ?;', {
        replacements: [+req.params.id, +res.locals.user.id]
    })
    .then(result => {
        const data = {users: result[0]};
        ejs.renderFile('views/partials/shareDialog.ejs', data)
        .then(html => {
            res.status(200).json({html: html});
        }).catch(error => {
            console.log(error);
            res.status(400).end();
        });
    });
}

export function agendaShareToPOST(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }
    const nom = req.body.nom;
    User.findOne({ where : { username: nom }})
    .then(user => {
        if (!user) {
            return res.json({err: `L'utilisateur ${nom} n'a pas été trouvé.`});
        }
        if (user.id === +res.locals.user.id) {
            return res.json({ err: "Vous ne pouvez pas vous partager l'agenda."});
        }
        UserAgendaAccess.findOrCreate({
            where : {
                idAgenda: +req.body.idAgenda,
                idUser: user.id
            }
        }).then(([instance, created]) => {
            if (created) {
                instance.set('statut', 'En attente');
                instance.save()
                .then(_ => res.json({}));
            } else {
                return res.json({ err: "Vous avez déjà partagé l'agenda à cet utilisateur."});
            }
        })
    })
}

export function rejectSharedAgendaPOST(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }
    UserAgendaAccess.findOne({
        where : {
            idAgenda: +req.body.idAgenda,
            idUser: +res.locals.user.id,
        }
    }).then(instance => {
        if (instance) {
            instance.set('statut', 'Rejeté');
            instance.save()
            .then(_ => res.json({}));
        } else {
            res.json({err: "no instance"});
        }
    })
}

export function acceptSharedAgendaPOST(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }
    UserAgendaAccess.findOne({
        where : {
            idAgenda: +req.body.idAgenda,
            idUser: +res.locals.user.id,
        }
    }).then(instance => {
        if (instance) {
            instance.set('statut', 'Accepté');
            instance.save()
            .then(_ => {
                Agenda.findByPk(+req.body.idAgenda)
                .then(agenda => addAgenda(res, agenda.id.toString(), agenda.nom, false))
            });
        } else {
            res.json({err: "no instance"});
        }
    })
}

export function cancelShareDELETE(req, res) {
    if (!res.locals.user) {
        return res.redirect('/');
    }
    UserAgendaAccess.destroy({
        where : {
            idAgenda: +req.body.idAgenda,
            idUser: +req.body.idUser,
        }
    }).then(_ => {
        res.end();
    })
}