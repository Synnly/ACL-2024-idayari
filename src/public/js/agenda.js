import { json_fetch } from "./utils.js";
import { agendaManager } from "./calendar_controleur.js";

function confirmerSuppression(id){
    const node = document.getElementById(id.toString());
    const nomTronque = node.placeholder.substring(0, 15);

    if(confirm(`Êtes vous sûr de supprimer ${nomTronque === node.placeholder ? node.placeholder : nomTronque+'...'} ?\nCette action est IRREVERSIBLE.`)){
        fetch(`/supprimerAgenda/${id}`, { method: "DELETE" })
        .then(res => {
            if (res.status === 202) {
                document.getElementById(`div_${id}`).remove();
            }
        })
        .catch(error => {
            console.log(`erreur suppression agenda: ${error}`);
        })
    }
}

const form = document.getElementById("new_agenda_form");
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
        document.getElementById('agendaList').insertAdjacentHTML('beforeend', result.html);
        agendaManager.addAgenda(result.data);
        // si le bouton "tout selectionner" était activé (donc tout était sélectionné)
        // et qu'on rajoute un agenda non sélectionné, on le désélectionne
        const all_select_button = document.getElementById('selectAll');
        if (all_select_button.checked && !result.data.agenda.displayed) {
            all_select_button.checked = false;
        }
        close();
    })
    .catch(error => console.log(error));
});

function close() {
    document.getElementById('new_agenda_nom').value = "";
    document.getElementById("viewDialogCreationAgenda").close();
}

document.getElementById("ouvreDialogCreationAgenda").addEventListener("click", ()=> {
    const boiteDialog = document.getElementById("viewDialogCreationAgenda");
    boiteDialog.showModal();
});

const boutonFermerDialog = document.getElementById("fermerDialogCreationAgenda");
boutonFermerDialog.addEventListener("click", close);  

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

