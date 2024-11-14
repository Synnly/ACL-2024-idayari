import { json_fetch } from "./utils.js";
import { agendaManager } from "./calendar_controleur.js";

const select_all = document.getElementById('selectAll');
const list_agendas = document.getElementById('agendaList');
const new_agenda_button = document.getElementById('newAgenda');

/**
 * Vérifie si tous les agendas sont sélectionnés
 * @returns {boolean} Vrai si tous les agendas sont sélectionnés, Faux sinon
 */
function every_agenda_selected() {
    return Array.from(list_agendas.getElementsByTagName("INPUT")).every(child => child.checked);
}

/**
 * Clique sur un agenda, sélectionne/déselectionne un agenda
 * @param {HTMLLIElement} agenda L'agenda cliqué
 * @param {String} id L'id de l'agenda cliqué
 * @param {*} event l'event
 */
function selectAgenda(agenda, id, event) {
    // le label renvoie l'event sur l'input
    if (event.target.tagName === "LABEL" || event.target.tagName === "SPAN") {
        return;
    }
    const checkbox = agenda.firstElementChild.firstElementChild;
    if (event.target.tagName !== "INPUT") {
        checkbox.checked = !checkbox.checked;
    }
    // si déselection, on sait que tout n'est plus sélectionné
    if (!checkbox.checked) {
        select_all.checked = false;
        agendaManager.deselectionAgenda(id);
    } else {
        // sinon, on vérifie si tout est sélectionné
        select_all.checked = every_agenda_selected();
        agendaManager.selectionAgenda(id);
    }
}

/**
 * Suppression d'un agenda
 * @param {String} id l'id de l'agenda
 * @param {String} nom le nom de l'agenda
 * @param {HTMLLIElement} removed_agenda l'agenda à supprimer (le noeud html)
 */
function supprimerAgenda(id, nom, removed_agenda) {
    if(confirm(`Êtes vous sûr de supprimer l'agenda ${nom}\nCette action est IRREVERSIBLE.`)){
        fetch(`/supprimerAgenda/${id}`, { method: "DELETE" })
        .then(res => {
            // l'agenda a été trouvé avec succès et supprimé
            if (res.status === 202) {
                const was_selected = removed_agenda.firstElementChild.firstElementChild.checked;
                removed_agenda.remove();
                if (!was_selected) {
                    // Il est possible que la suppression de l'agenda fasse que tous les élements soient sélectionnés
                    select_all.checked = every_agenda_selected();
                }
                agendaManager.removeAgenda(id, was_selected);
            }
        })
        .catch(error => {
            console.log(`erreur suppression agenda: ${error}`);
        })
    }
}

/**
 * Modification d'un agenda
 * @param {String} nom nom de l'agenda
 * @param {HTMLLIElement} agenda l'agenda à modifier
 */
function editAgenda(id, nom, agenda) {
    setDialog({nom: nom}, "/modifierAgenda", (sent, _) => {
        const label = agenda.firstElementChild;
        label.lastElementChild.textContent = sent.nom;
        label.title = sent.nom;
    }, {nom: nom, id: id});
}

/**
 * Supprime les menus quand on clique en dehors
 */
window.addEventListener('click', (event) => {
    if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            const openDropdown = dropdowns[i];
            if (!openDropdown.classList.contains('noshow')) {
                openDropdown.classList.add('noshow');
            }
        }
    }
});

/**
 * Ouvre/Ferme le menu des options sur les agendas
 * @param {HTMLDivElement} elem 
 */
function openDropDownMenu(elem) {
    elem.classList.toggle('noshow');
}

/**
 * Ajoute les écouteurs à un agenda et ses boutons associés
 * @param {HTMLLIElement} agenda 
 */
function ajout_ecouteurs_agenda(agenda) {
    const id = agenda.id.split("_")[1];
    const label = agenda.firstElementChild;
    const nom = label.title;
    agenda.addEventListener('click', (event) => selectAgenda(agenda, id, event));
    const dropdown = label.nextElementSibling;
    // si on a le dropdown menu (peut ne pas être le cas si agenda partagé)
    if (dropdown) {
        // factorise le fait d'empecher la sélection d'agendas quand on clique sur les boutons du menu ou les 3 points
        dropdown.addEventListener('click', (event) => event.stopPropagation());
        const option = dropdown.firstElementChild;
        const list_options = option.nextElementSibling;
        option.addEventListener('click', () => openDropDownMenu(list_options));
        // les options (modifier, supprimer, etc...)
        for (const elem of list_options.children) {
            if (elem.getAttribute('data-type') === "sup") {
                elem.addEventListener('click', () => supprimerAgenda(id, nom, agenda));
            }
            if (elem.getAttribute('data-type') === "edit") {
                elem.addEventListener('click', () => editAgenda(id, nom, agenda));
            }
        }
    }
}

// met en place les écouteurs pour tous les agendas
for(const agenda of list_agendas.children) {
    ajout_ecouteurs_agenda(agenda);
}

/**
 * Click sur tout sélectionner
 */
select_all.addEventListener('click', () => {
    // on a déselectionné, donc plus aucun n'est sélectionné
    if(!select_all.checked){
        for(const child of list_agendas.children){
            // on récupère le label puis l'input
            child.firstElementChild.firstElementChild.checked = false;
        }
        agendaManager.deselectAll();
    } else {
        for(const child of list_agendas.children){
            child.firstElementChild.firstElementChild.checked = true;
        }
        agendaManager.selectAll(list_agendas);
    }
});

/**
 * Ferme une boite de dialogue et supprime tout le html
 * @param {HTMLDialogElement} elem La boite de dialogue
 */
function close_dialog(elem) {
    elem.close();
    elem.remove();
}

/**
 * Fonction qui à partir du html de la boite de dialogue, met en place la boite de dialogue et les boutons
 * @param {String} html le html de la boite de dialogue
 * @param {String} url l'url à appeler en cas de soumission réussi du formulaire
 * @param {Function} onsuccess fonction à appeler après avoir effectué les opérations backend 
 * (ajouter le html du nouvel agenda/modifier le html existant)
 * @param {object} old_data des données d'agendas à comparer pour ne pas faire de requêtes si pas de changement (et obtenir l'id)
 */
function setDialog(data, url, onsuccess, old_data) {
    fetch('/views/partials/dialogAgenda.ejs', {method: "GET"})
    .then(response => response.text())
    .then(html => ejs.render(html, data))
    .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        const dialog_agenda = document.getElementById('dialogAgenda');
        const fermer_dialog = document.getElementById("fermerDialogAgenda");
        fermer_dialog.addEventListener('click', () => {
            close_dialog(dialog_agenda);
        });

        const form = document.getElementById("agenda_form");
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const nom = form["nom"].value.trim();
            const sent = {nom: nom};
            if (old_data) {
                // aucune modification
                if (old_data.nom === sent.nom) {
                    close_dialog(dialog_agenda);
                    return;
                } else {
                    sent.id = old_data.id;
                }
            }
            json_fetch(url, "POST", sent)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(response.statusText);
                }
            })
            .then(result => {
                onsuccess(sent, result);
                close_dialog(dialog_agenda);
            })
            .catch(error => console.log(error));
        }); 
        dialog_agenda.showModal();
    });
}

/**
 * Click sur nouvel agenda
 */
new_agenda_button.addEventListener('click', () => {
    setDialog({}, "/agenda/new", (_, result) => {
        list_agendas.insertAdjacentHTML('beforeend', result.html);
        const agenda = document.getElementById(`agenda_${result.data.id}`);
        ajout_ecouteurs_agenda(agenda);

        agendaManager.addAgenda(result.data);
        // si le bouton "tout selectionner" était activé (donc tout était sélectionné)
        // et qu'on rajoute un agenda non sélectionné, on le désélectionne
        if (select_all.checked && !result.data.agenda.displayed) {
            select_all.checked = false;
        }
    });
});

// // qu'est ce que ça fait là ??
// (() => {
//     // Fetch all the forms we want to apply custom Bootstrap validation styles to
//     const forms = document.querySelectorAll('.needs-validation')

//     // Loop over them and prevent submission
//     Array.from(forms).forEach(form => {
//         form.addEventListener('submit', event => {
//             if (!form.checkValidity()) {
//                 event.preventDefault()
//                 event.stopPropagation()
//             }

//             form.classList.add('was-validated')
//         }, false)
//     })
// })()