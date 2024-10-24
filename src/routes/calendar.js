import User from "../model/User.js";
import Agenda from "../model/Agenda.js";
import { tabAgenda } from "../token.js";

// const tabAgenda = []; //Permet de gérer la sélection des agendas (dera fait avec données session plus tard)

/*Direction vers la page calendar */
export function calendarGet(req, res) {
    if (res.locals.user) {
        return res.render("calendar");
    }
    return res.redirect("/");
}

/*C'est la même fonction qui gère les requête selon le changement de mois - le changement d'année
- la sélection/déselection d' un agenda
Les paramètre dans la requête sont optionnels et comblés par la fonction si besoin */
export async function calendarGetData(req, res) {
    const param = req.query?.id; //param = id de l'agenda sélectionné/déselectionné
    let paramMonth = req.query?.month;
    let paramYear = req.query?.year;
    let aujourdhui = new Date();

    if (!paramMonth) {
        paramMonth = aujourdhui.getMonth() + 1; //Car renvoi mois entre 0 et 11
    }
    if (!paramYear) {
        paramYear = aujourdhui.getFullYear();
    }
    // Premier jour du mois (selon année et mois choisi)
    const firstDate = new Date(paramYear, paramMonth - 1, 2); // Premier jours
    // Dernier jour du mois (selon année et mois choisi)
    const lastDate = new Date(paramYear, paramMonth, 1); // Dernier Jours à 23h (pas mieux que ça)

    if (res.locals.user) {
        //Récupération des agendas de l'utilisateur
        const user = await User.getById(res.locals.user.id);
        const agendas = await user.getAgendas();

        if (param) {
            //Si le paramètre optionnel id à été fourni on est dans le cas d'une sélection/déselection d'agenda
            let idAgenda = req.query.id;
            let agendaToFind = tabAgenda.find((e) => e.id == idAgenda);
            //Agenda trouvé = déselection donc suppression dans le tableau
            if (agendaToFind) {
                let tab = tabAgenda.filter((e) => e.id != idAgenda);
                tabAgenda.length = 0;
                tabAgenda.push(...tab);
            } else {
                //Agenda non trouvé, on est dans le cas d'une sélection
                agendaToFind = await Agenda.findOne({
                    where: {
                        id: idAgenda,
                    },
                });
                //Enregistrement de l'agenda sélectionné
                if (agendaToFind) {
                    tabAgenda.push(agendaToFind);
                }
            }
        }
        //Récupération de tout les rdvs des agendas sélectionnés
        let rendezVous = [];
        let listRdv = null;
        for (let key in tabAgenda) {
            //IMPORTANT : À remplacer par la fonction de récupération des rdvs (dont récurrent)
            listRdv = await tabAgenda[key].getRendezVous();
            if (listRdv) {
                for (let key in listRdv) {
                    /*IMPORTANT : on fait ca car la fonction qui récupère les rdvs 
                    (dont les récurents) ne fonctionne pas */
                    if (
                        listRdv[key].dateDebut >= firstDate &&
                        listRdv[key].dateFin <= lastDate
                    ) {
                        rendezVous.push(listRdv[key]);
                    }
                }
            }
        }
        //Données à renvoyées au model
        let donnees = {
            agendas: agendas,
            selectedAgendas: tabAgenda,
            rdvs: rendezVous,
            user: res.locals.user,
            month: paramMonth,
            year: paramYear,
        };

        return res.json(donnees);
    }
    //User déconnecté (impossible d'accéder ici normalement)
    return res.json({
        agendas: null,
        selectedAgendas: null,
        rdvs: [],
        user: null,
        month: paramMonth,
        year: paramYear,
    });
}
