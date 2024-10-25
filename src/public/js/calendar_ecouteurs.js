import { agendaManager } from "./calendar_controleur.js";
/*SCRIPT qui gère l'écoutes des divers évenements dans la page calendrier */

const selectionAgenda = document.getElementById("selectionAgenda");
// const leftYear = document.getElementById("leftYear");
// const rightYear = document.getElementById("rightYear");
// const selectionMois = document.getElementById("mois");

/*Ajoute les écouteurs pour gérer l sélection d'agenda - le changement de mois, et le changemnt d'année */
export async function ajouterEcouteurs(data) {
    // ajouterEcouteursYear(data);
    ajouterEcouteurSelectionAgenda(data);
    // ajouterEcouteurMonth(data);
}

// export function ajouterEcouteursYear(data) {
//     leftYear.addEventListener("click", function () {
//         agendaManager.leftYear();
//     });
//     rightYear.addEventListener("click", function () {
//         agendaManager.rightYear();
//     });
// }
/*Gère le changement d'année */

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
/*Gère le changement de mois */
// export async function ajouterEcouteurMonth(data) {
//     selectionMois.addEventListener("change", function (event) {
//         let mois = event.target.selectedOptions[0].id.split("-")[1];
//         agendaManager.selectionMois(mois);
//     });
// }
