import { agendaManager, tableauRdvs } from "./calendar_controleur.js";
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
const elementCalendrier = document.getElementById('calendar');

/*SCRIPT qui gère l'affichage dans la page selon les données du model */

// const listRdvs = document.getElementById("listRdvs");
const selectionAgenda = document.getElementById("selectionAgenda");
const msgAgenda = document.getElementById("msgAgenda");
const agendasSelectionnes = document.getElementById("agendasSelectionnes");
// const rdvday = document.getElementById("rdvday");

// const calendar = document.getElementById("calendar");
// /*Va servir à  savoir à quel case commence le 1er du mois */
// const weekdays = [
//     "Lundi",
//     "Mardi",
//     "Mercredi",
//     "Jeudi",
//     "Vendredi",
//     "Samedi",
//     "Dimanche",
// ];

// export function loadCalendar() {
//     calendar.innerHTML = "";
//     /* Note : new Date : les mois vont de 0 à 11 , 
//     3eme paramètre jour du mois sauf 0 = 1 jours avant le premier jours du mois*/
//     let daysInMonth = new Date(
//         agendaManager.data.year,
//         agendaManager.data.month,
//         0
//     ).getDate(); //Donne le nombre de jours dans le mois
//     let firstDayInMonth = new Date(
//         agendaManager.data.year,
//         agendaManager.data.month - 1,
//         1
//     );
//     /* Renvoie une date au format : mardi, 01/10/2024 */
//     let dateString = firstDayInMonth.toLocaleDateString("fr-FR", {
//         weekday: "long",
//         year: "numeric",
//         month: "numeric",
//         day: "numeric",
//     });
//     //Pour récupérer uniquement le jour
//     dateString = dateString.split(" ")[0];
//     //Pour être sur que la première lettre est une majuscule
//     dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
//     /*Récupère l'index du jour de la semaine 
//     (paddingDays = jours qui appartiennent aux mois précédent de 1 jusqu'à paddingDays)*/
//     let paddingDays = weekdays.indexOf(dateString);
//     console.log(paddingDays, dateString);

//     for (let i = 1; i <= paddingDays + daysInMonth; i++) {
//         let daySquare = document.createElement("div");
//         daySquare.classList.add("day");
//         if (i > paddingDays) {
//             //Pour obtenir le vrai numéro du jour
//             daySquare.innerText = i - paddingDays;
//             daySquare.id = "day-" + (i - paddingDays);
//             daySquare.addEventListener("click", (event) =>
//                 ajoutRdvsDuJours(i - paddingDays)
//             );
//         } else {
//             daySquare.classList.add("padding");
//         }
//         calendar.appendChild(daySquare);
//         // console.log(daySquare.id);
//     }
// }

/*Gère l'affichage et la séléction selon les données du model */
export async function afficher() {
    //Remise à zéro du tableau des rdvs
    for (let i = 0; i < 32; i++) {
        tableauRdvs[i].length = 0;
    }
    //Remise à zéro du rdv du jours
    // rdvday.innerHTML = "";
    // loadCalendar(afficherRendezVous);
    afficherAgendas(agendaManager.data);
    // afficherRendezVous(agendaManager.data);
    // afficherYear(agendaManager.data);
    // afficherMonth(agendaManager.data);
    afficherAgendasSelectionnes(agendaManager.data);
}
/*Sélection de l'année selon le modéle */
export function afficherYear(data) {
    let displayedYear = document.getElementById("displayedYear");
    displayedYear.textContent = data.year;
}
/*Sélection du mois selon le modéle */
export function afficherMonth(data) {
    let displayedMonth = document.getElementById("month-" + data.month);
    displayedMonth.selected = true;
}

/*Affichage de la liste des Agendas selon le modèle */
export async function afficherAgendas(data) {
    msgAgenda.innerHTML = "";
    if (data.agendas.length > 0) {
        let h3 = document.createElement("h3");
        h3.textContent =
            "Sélectionnez un ou plusieurs agendas pour voir les rdvs associés";
        msgAgenda.appendChild(h3);

        selectionAgenda.size = data.agendas.length;
        selectionAgenda.multiple = true;
        for (const agenda of data.agendas) {
            let option = document.createElement("option");
            option.id = "option-" + agenda.id;
            option.className = "option";
            option.value = agenda.nom;
            option.textContent = agenda.nom;
            selectionAgenda.appendChild(option);
        }
    } else {
        let h3 = document.createElement("h3");
        h3.textContent = "Il n'y a pas d'agenda";
        msgAgenda.appendChild(h3);
    }
}
/*Affichage des agendas sélectionnés selon le model */
export async function afficherAgendasSelectionnes(data) {
    agendasSelectionnes.innerHTML = "";
    if (data.selectedAgendas.length > 0) {
        let h3 = document.createElement("h3");
        h3.textContent = "Agendas sélectionnés";
        agendasSelectionnes.appendChild(h3);
        let br = document.createElement("br");
        agendasSelectionnes.appendChild(br);

        for (const agenda of data.selectedAgendas) {
            let span = document.createElement("span");
            span.textContent = agenda.nom + ", ";
            agendasSelectionnes.appendChild(span);
        }
    } else {
        let h3 = document.createElement("h3");
        h3.textContent = "Il n'y a pas d'agenda sélectionnés";
        agendasSelectionnes.appendChild(h3);
    }
}
/* Affichage des rendez vous selon le model
IMPORTANT :  : c'est ici que l'on va injecter les rdvs à l'interieur des jours correspondants */
export async function afficherRendezVous(data) {
    listRdvs.innerHTML = "";
    if (data.rdvs.length > 0) {
        let br = document.createElement("br");
        listRdvs.appendChild(br);
        for (const rdv of data.rdvs) {
            let span = document.createElement("span");
            span.id = "rdv-" + rdv.id;
            span.className = "rdv";
            span.textContent = rdv.titre + ", ";
            listRdvs.appendChild(span);
            ajoutDuRdv(rdv);
        }
    } else {
        let h3 = document.createElement("h3");
        h3.textContent = "Il n'y a pas de rendez vous";
        listRdvs.appendChild(h3);
    }
}

export function ajoutDuRdv(rdv) {
    let jours = new Date(rdv.dateDebut).getDate();
    tableauRdvs[+jours].push(rdv); //Ajout des rdvs dans la table de rdvs
    let day = document.getElementById("day-" + jours);
    console.log(day);
    let br = document.createElement("br");

    let span = document.createElement("span");
    span.textContent = rdv.titre;
    span.classList.add("rdv");
    day.appendChild(br);
    day.appendChild(span);
}

export function ajoutRdvsDuJours(day) {
    rdvday.innerHTML = "";
    console.log("what", day);
    let h3Date = document.createElement("h3");
    h3Date.textContent =
        "Rdvs du " +
        day +
        "/" +
        agendaManager.data.month +
        "/" +
        agendaManager.data.year;
    rdvday.appendChild(h3Date);
    for (let rdv of tableauRdvs[day]) {
        let h3 = document.createElement("h3");
        h3.textContent = rdv.titre;

        let span = document.createElement("span");
        span.textContent = "Lieu : " + rdv.lieu;
        span.classList.add("rdv");
        let span2 = document.createElement("span");
        span2.textContent = "Descritption : " + rdv.description;
        span2.classList.add("rdv");
        rdvday.appendChild(h3);
        let br = document.createElement("br");
        rdvday.appendChild(br);
        rdvday.appendChild(span);
        br = document.createElement("br");
        rdvday.appendChild(br);
        rdvday.appendChild(span2);
    }
    rdvday;
    tableauRdvs;
}

/*À utiliser pour remplacer le code de loadCalendar()*/
export function getJourCorrespondant(day) {
    let firstDayInMonth = new Date(
        agendaManager.data.year,
        agendaManager.data.month - 1,
        day
    );
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
    return dateString;
}


export function afficherFullcalendar(rdvs){
    let calendrier = new Calendar(elementCalendrier,{
        //Appel des différents composants composants
        plugins : [dayGridPlugin,timeGridPlugin,listPlugin],
        locale:'fr',
        //Attention listWeek potentielleemnet à changer en list
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'} ,
            buttonText: {
                today:'Aujourd\'hui',
                month:'Mois',
                week:'Semaine',
                list:'Liste',
                day:"Jour"
            },
        //initialView: 'dayGridWeek'
        // initialView: 'dayGridDay'
        // initialView: 'dayGridMonth'
        // initialView:'timeGridWeek'
        // initialView:'timeGridDay'
        // initialView:'list'
         events:rdvs
    
    
    
    });
    calendrier.render();
    
}