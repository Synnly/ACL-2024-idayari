import { agendaManager } from "./calendar_controleur.js";

/*SCRIPT qui gère l'affichage dans la page selon les données du model */
const selectionAgenda = document.getElementById("selectionAgenda");
const msgAgenda = document.getElementById("msgAgenda");
const agendasSelectionnes = document.getElementById("agendasSelectionnes");

/*Gère l'affichage et la séléction selon les données du model */
export async function afficher() {
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