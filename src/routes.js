import User from "./model/User.js";
import Agenda from "./model/Agenda.js";
import { sequelize } from "./database.js";
import UserAgendaAccess from "./model/UserAgendaAccess.js";
import { saveAuthentificationCookie } from "./token.js";

export async function index(req, res) {
  if (res.locals.user) {
    const user = await User.findOne({
      where: { id: res.locals.user.id },
    });
    const agendas = await user.getAgendas();
    res.render("index", { agendas: agendas });
    return;
  }
  res.render("index");
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
      console.log(e);
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
    res.render("connexion", {
      errMsg: "Identifiant et/ou mot de passe invalides !",
    });
  } else {
    saveAuthentificationCookie(user, res);
    res.redirect("/");
  }
}
export function deconnexion(req, res, next) {
  res.clearCookie("accessToken");
  res.redirect("/");
}

export function creationRendezVousGET(req, res) {
  if (res.locals.user) {
    const user = User.findOne({
      where: { id: res.locals.user.id }
    });
    // on utilisera "User.getMyAgendas()" mais pas dispo à cause de l'implémentation actuelle
    res.render("rendezVous", { agendas: [] });
  } else {
    res.redirect("/");
  }
}

export function creationRendezVousPOST(req, res) {
  // besoin du modèle RendezVous
  res.redirect("/");
}