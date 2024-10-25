import { agendaManager, tableauRdvs } from "./calendar_controleur.js";
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
const elementCalendrier = document.getElementById('calendar');

/*SCRIPT qui gère l'affichage dans la page selon les données du model */


const selectionAgenda = document.getElementById("selectionAgenda");
const msgAgenda = document.getElementById("msgAgenda");
const agendasSelectionnes = document.getElementById("agendasSelectionnes");


/*Gère l'affichage et la séléction selon les données du model */
export async function afficher() {
    //Remise à zéro du tableau des rdvs
    for (let i = 0; i < 32; i++) {
        tableauRdvs[i].length = 0;
    }

    afficherAgendas(agendaManager.data);
    afficherAgendasSelectionnes(agendaManager.data);
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
/*À utiliser lors du clique sur un jour ou un rdv */
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