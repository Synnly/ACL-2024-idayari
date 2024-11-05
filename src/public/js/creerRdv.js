import {addDays} from "./utils.js";
import {agendaManager} from "/js/calendar_controleur.js";

export function creerModaleNouveauRdv(agendas) {
    let list_agendas = "";
    for (const elem of agendas) {
        list_agendas += `<option value="${elem.id}">${elem.nom}</option>\n`;
    }

    let modaleHTML = `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Créer un nouveau rendez-vous</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler" onClick="quitModal()"></button>
                </div>
                <div class="modal-body">
                    <form class="needs-validation" id="formModifRDV" action="/calendar-rdv" method="POST" novalidate>
                      <input type="hidden" id="idRDV" name="idRDV"> 
                      <div class="mb-3">
                        <label for="titreRDV" class="form-label">Titre</label>
                        <input type="text" class="form-control" id="titreRDV" name="titre" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="lieuRDV" class="form-label">Lieu</label>
                        <input type="text" class="form-control" id="lieuRDV" name="lieu">
                      </div>
                      <div class="mb-3">
                        <label for="descriptionRDV" class="form-label">Description</label>
                          <textarea class="form-control" id="descriptionRDV" rows="3" name="description"></textarea>
                      </div>
                      <div class="mb-3">
                        <label for="all_day" class="form-label">Toute la journée</label>
                        <input type="checkbox" name="all_day" id="all_day" onChange="change_all_day_option(this)">
                      </div>
                      <div class="mb-3">
                        <label for="dateDebut" class="form-label">Début</label>
                        <input type="datetime-local" class="form-control" id="dateDebut" name="dateDebut" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="dateFin" class="form-label">Fin</label>
                        <input type="datetime-local" class="form-control" id="dateFin" name="dateFin" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="select_agendas" class="form-label">Agenda(s) associé(s) au rendez-vous</label>
                        <select name="agendas" id="select_agendas" class="form-control" multiple required>
                            ${list_agendas}
                        </select>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>                        
                      </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-modal"  data-bs-dismiss="modal"  onClick="quitModal()">Annuler</button>
                    <button type="button" class="btn btn-primary btn-modal" onClick="envoyerForm()">Créer</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modaleHTML);

    //Création et affichage d'une modale Bootstrap
    const fausseModale = document.getElementById('staticBackdrop');
    const vraieModale = new bootstrap.Modal(fausseModale);

    vraieModale.show();
}

/* Post de la requête de modif du rdv puis demande de mise à jours du calendrier au controleur*/
export async function envoyerFormNouveauRdv() {
    event.preventDefault();
    let titreInput = document.getElementById('titreRDV');
    let descriptionRDV = document.getElementById('descriptionRDV');
    let lieuRDV = document.getElementById('lieuRDV');

    const selectElement = document.getElementById('select_agendas');
    // on récupère uniquement les agendas à ajouter/supprimer
    const selectedAgendas = Array.from(selectElement.options).filter(option => option.selected).map(e => e.value);

    let dateDebInput = document.getElementById('dateDebut');
    let dateFinInput = document.getElementById('dateFin');

    //Clear des anciennes erreurs
    titreInput.classList.remove("is-invalid");
    dateDebInput.classList.remove("is-invalid");
    dateFinInput.classList.remove("is-invalid");

    let msgErreur = document.getElementById('dateErreur');
    if (msgErreur) {
        msgErreur.remove();
    }

    const dateDeb = new Date(dateDebInput.value);
    let dateFin = new Date(dateFinInput.value);
    const all_day = document.getElementById('all_day').checked;

    if (all_day) {
        dateDeb.setHours(0, 0, 0);
        dateFin = addDays(dateFin, 1);
        dateFin.setHours(0, 0, 0);
    }
    let isValid = true;

    //Vérification des champs obligatoires
    if (titreInput.value.trim() === '') {
        titreInput.classList.add("is-invalid");
        isValid = false;
    }

    if (dateDebInput.value === '') {
        dateDebInput.classList.add("is-invalid");
        isValid = false;
    }

    if (dateFinInput.value === '') {
        dateFinInput.classList.add("is-invalid");
        isValid = false;
    }

    //Vérification des dates
    if (isValid && dateFin <= dateDeb) {
        const msgErreur = document.createElement('div');
        msgErreur.id = 'dateErreur';
        msgErreur.className = 'text-danger';
        msgErreur.textContent = "La date de fin doit être supérieure à la date de début.";

        dateFinInput.parentNode.appendChild(msgErreur);
        return;
    }

    if(selectedAgendas.length === 0){
        const msgErreur = document.createElement('div');
        msgErreur.id = 'dateErreur';
        msgErreur.className = 'text-danger';
        msgErreur.textContent = "Au moins un agenda doit être sélectionné.";

        selectElement.parentNode.appendChild(msgErreur);
        return;
    }

    if (isValid) {
        const data = {
            dateDebut: dateDeb,
            dateFin: dateFin,
            titre: titreInput.value,
            lieu: lieuRDV.value,
            description: descriptionRDV.value,
            agendas: selectedAgendas,
            all_day: all_day,
        };
        fetch("/rendezVous/new", {
            method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
        }).then(() => {
            // Agendas sélectionnés dans l'affichage et dans la modale
            agendaManager.addData(selectedAgendas.filter((id) => document.getElementById("agenda_"+id).classList.contains("active")));
        })
        .catch((error) => {console.log(error)});

        //Désactivation de la modale
        let modal = document.getElementById('staticBackdrop');
        let modalInstance = bootstrap.Modal.getInstance(modal);

        //Détruit les éléments liés à la modale (éléments bootstrap)
        if(modalInstance){
            modalInstance.dispose();
            //Pour faire fonctionner le scroll à nouveau
            document.body.style.overflow = '';
        }

        //On supprime la modal pour pouvoir la recréer avec de nouvelles données
        if (modal) {
            modal.remove();
        }
    }
}

export function quitModalNouveauRdv(){
    let modal = document.getElementById('staticBackdrop');
    if (modal) {
        modal.remove();
    }
}