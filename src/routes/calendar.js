import User from "../model/User.js";
import Agenda from "../model/Agenda.js";
import { tabAgenda } from "../token.js";
import RendezVous from "../model/RendezVous.js";


// const tabAgenda = []; //Permet de gérer la sélection des agendas (dera fait avec données session plus tard)

/*Va servir à  savoir à quel case commence le 1er du mois */
const weekdays = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi", "Vendredi", "Samedi"];
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
    let startDay = getBeginingDay(paramYear,paramMonth);
    let endDay = getEndDay(paramYear,paramMonth);
    console.log(startDay, endDay);
    // Premier jour du mois (selon année et mois choisi)
    const firstDate = new Date(paramYear, paramMonth - 1, 2-startDay); // Premier jours
    firstDate.setHours(2,0,0); //PROBLEME SUR LE FUSEAU HORAIRE
    // Dernier jour du mois (selon année et mois choisi)
    const lastDate = new Date(paramYear, paramMonth, 1+(6-endDay)); // Dernier Jours à 23h (pas mieux que ça)
    lastDate.setHours(0,59,59); //PROBLEME SUR LE FUSEAU HORAIRE
    console.log(firstDate, lastDate);


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


export async function modifierRendezVousCalendarPOST(req, res) {
    if (res.locals.user) {
        try {
            //Récupération des champs du form
            const { idRDV, titre, lieu, description, dateDebut, dateFin } = req.body;

            //Récupération du rdv avec l'id donné
            const rdvToUpdate = await RendezVous.findOne({ where: { id: idRDV } });

            if (!rdvToUpdate) {
                return res.status(404).json({ message: 'Rendez-vous introuvable' });
            }

            rdvToUpdate.titre = titre;
            rdvToUpdate.lieu = lieu;
            rdvToUpdate.description = description;

            /*ATTENTION : On devrait être au format GMT+1 , ce qui n'est pas le cas dans le server j'avance d'1 heure ici
            manuellement, mais cela est à changer plus tard*/
            let debut =new Date(dateDebut); 
             debut.setHours(debut.getHours() + 1)
            let fin =new Date(dateFin);  
             fin.setHours(fin.getHours() + 1)

            rdvToUpdate.dateDebut = debut;

            rdvToUpdate.dateFin = fin;

            await rdvToUpdate.save();
            let data = {
                id: rdvToUpdate.id,
                titre: rdvToUpdate.titre,
                dateDebut: rdvToUpdate.dateDebut,
                dateFin: rdvToUpdate.dateFin,
                description: rdvToUpdate.description,
                lieu: rdvToUpdate.lieu
            };
            console.log('DATADATDATDATDATDAT',data);
            return res.json(data);

            //return res.redirect('/calendar');
        } catch (error) {
            console.error('Erreur lors de la modification du rdv:', error);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } else {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
}


export function getBeginingDay(year,month){
    /* Note : new Date : les mois vont de 0 à 11 , 
    3eme paramètre jour du mois sauf 0 = 1 jours avant le premier jours du mois*/
    let daysInMonth = new Date(year,month,0).getDate(); //Donne le nombre de jours dans le mois

    let firstDayInMonth = new Date(year,month - 1,1);

    /* Renvoie une date au format : mardi, 01/10/2024 */
    let dateString = firstDayInMonth.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    //Pour récupérer uniquement le jour
    dateString = dateString.split(" ")[0];
    //Pour être sur que la première lettre est une majuscule
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    /*Récupère l'index du jour de la semaine 
    (paddingDays = jours qui appartiennent aux mois précédent de 1 jusqu'à paddingDays)*/
    let paddingDays = weekdays.indexOf(dateString);
    // console.log(paddingDays, dateString);
    return paddingDays;
}

/*lE CODE suivant nous donne le bon jour avec la Mauvaise Date (Problème fuseau horaire?) */
export function getEndDay(year,month){
    /* Note : new Date : les mois vont de 0 à 11 , 
    3eme paramètre jour du mois sauf 0 = 1 jours avant le premier jours du mois*/
    let lastDayInMonth = new Date(year,month,0);
    console.log('lastday',lastDayInMonth);

    /* Renvoie une date au format : mardi, 01/10/2024 */
    let dateString = lastDayInMonth.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    //Pour récupérer uniquement le jour
    dateString = dateString.split(" ")[0];
    //Pour être sur que la première lettre est une majuscule
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    /*Récupère l'index du jour de la semaine 
    (paddingDays = jours qui appartiennent aux mois précédent de 1 jusqu'à paddingDays)*/
    let paddingDays = weekdays.indexOf(dateString);
    // console.log(paddingDays, dateString);
    return paddingDays;
}
