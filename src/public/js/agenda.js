import { json_fetch } from "./utils.js";
import { agendaManager } from "./calendar_controleur.js";

const select_all = document.getElementById('selectAll');
const list_agendas = document.getElementById('agendaList');
const new_agenda_button = document.getElementById('newAgenda');
const all_options_buttons = document.getElementsByClassName('dropbtn');
const dialog_agenda = document.getElementById('dialogAgenda');
const fermer_dialog = document.getElementById("fermerDialogAgenda");
const sup_buttons = document.getElementsByClassName("sup-btn");
const dropdowns = document.getElementsByClassName("dropdown");

/**
 * Vérifie si tous les agendas sont sélectionnés
 * @returns {boolean} Vrai si tous les agendas sont sélectionnés, Faux sinon
 */
function every_agenda_selected() {
    return Array.from(list_agendas.getElementsByTagName("INPUT")).every(child => child.checked);
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
 * Click sur nouvel agenda
 */
new_agenda_button.addEventListener('click', () => {
    dialog_agenda.showModal();
});

function close() {
    document.getElementById('agenda_nom').value = "";
    dialog_agenda.close();
} 

/**
 * Click sur annuler dans la boite de dialogue d'un nouvel agenda
 */
fermer_dialog.addEventListener("click", close);


function selectAgenda(agenda, event) {
    const id = agenda.id.split("_")[1];
    const checkbox = agenda.firstElementChild.firstElementChild;
    if (event.target.tagName != "LABEL" && event.target.tagName != "INPUT") {
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
 * Click sur un agenda
 */
for(const agenda of list_agendas.children) {
    agenda.addEventListener('click', (event) => selectAgenda(agenda, event));
}

function clearOptionsDIV() {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
        const openDropdown = dropdowns[i];
        if (!openDropdown.classList.contains('noshow')) {
            openDropdown.classList.add('noshow');
        }
    }
}

// factorise le fait d'empecher la sélection d'agendas quand on clique sur les boutons du menu
// ou les 3 points
for (const elem of dropdowns) {
    elem.addEventListener('click', (event) => event.stopPropagation());
}

function openDropDownMenu(elem) {
    elem.nextElementSibling.classList.toggle('noshow');
}
/**
 * Click sur les 3 points
 */
for (const elem of all_options_buttons) {
    elem.addEventListener('click', () => openDropDownMenu(elem));
}
/**
 * Supprime le menu quand on clique en dehors
 */
window.addEventListener('click', (event) => {
    if (!event.target.matches('.dropbtn')) {
        clearOptionsDIV();
    }
});

function supprimerAgenda(sup_button) {
    const id = sup_button.getAttribute('data-id');
    const nom = sup_button.getAttribute('data-nom');
    if(confirm(`Êtes vous sûr de supprimer l'agenda ${nom}\nCette action est IRREVERSIBLE.`)){
        fetch(`/supprimerAgenda/${id}`, { method: "DELETE" })
        .then(res => {
            // l'agenda a été trouvé avec succès et supprimé
            if (res.status === 202) {
                const removed_agenda = document.getElementById(`agenda_${id}`);
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
 * Suppression d'un agenda
 */
for (const sup_button of sup_buttons) {
    sup_button.addEventListener('click', () => supprimerAgenda(sup_button));
}

const form = document.getElementById("agenda_form");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const nom = form["nom"].value.trim();
    json_fetch("/agenda/new", "POST", {nom: nom})
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(result => {
        list_agendas.insertAdjacentHTML('beforeend', result.html);

        // ajout des écouteurs (NE PAS OUBLIER)
        const agenda = document.getElementById(`agenda_${result.data.id}`);
        agenda.addEventListener('click', (event) => selectAgenda(agenda, event));
        const dropdown = agenda.lastElementChild;
        dropdown.addEventListener('click', (event) => event.stopPropagation());
        const option = dropdown.firstElementChild;
        option.addEventListener('click', () => openDropDownMenu(option));
        // les options (modifier, supprimer, etc...)
        for (const elem of option.nextElementSibling.children) {
            if (elem.classList.contains('sup-btn')) {
                elem.addEventListener('click', () => supprimerAgenda(elem));
            }
            // IMPORTANT : Une fois le reste géré, NE PAS OUBLIER D'AJOUTER LES ECOUTEURS SI NOUVEL AGENDA
        }

        agendaManager.addAgenda(result.data);
        // si le bouton "tout selectionner" était activé (donc tout était sélectionné)
        // et qu'on rajoute un agenda non sélectionné, on le désélectionne
        if (select_all.checked && !result.data.agenda.displayed) {
            select_all.checked = false;
        }
        close();
    })
    .catch(error => console.log(error));
}); 


// qu'est ce que ça fait là ??
(() => {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

