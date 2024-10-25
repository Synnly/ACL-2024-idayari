import { agendaManager } from "./calendar_controleur.js";
/*SCRIPT qui gère l'écoutes des divers évenements dans la page calendrier */

const selectionAgenda = document.getElementById("selectionAgenda");


/*Ajoute les écouteurs pour gérer l sélection d'agenda - le changement de mois, et le changemnt d'année */
export async function ajouterEcouteurs(data) {
    ajouterEcouteurSelectionAgenda(data);    
}

/*Attention ici l'écouteur click fonctionnne parce que le select des agendas
a la taille du nombre d'agendas. Sinon il faudrait utiliser l'ecouteur change 
comme dans la fonction ajouterEcouteurMonth */
export async function ajouterEcouteurSelectionAgenda(data) {
    selectionAgenda.addEventListener("click", function (event) {
        if (event.target.tagName === "OPTION") {
            let idAgenda = event.target.id.split("-")[1];
            agendaManager.selectionAgenda(idAgenda);
        }
    });
}

