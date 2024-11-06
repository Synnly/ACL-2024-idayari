import { agendaManager } from "./calendar_controleur.js";
import { addDays, removeDays, escapeHTML, convertDate } from "./utils.js";

/*Créer la modale de modification de rendez vous */
export function creerModale(rdv, agendas) {
	deleteModal();
    const titre = rdv.title;
    const lieu = rdv.lieu;
    const description = rdv.description;
    let dateDebut;
    let dateFin;
    const id = rdv.id;
    const all_day = rdv.allDay;
    let all_day_text = "";
    let date_input_type = "date";
    if (all_day) {
        dateDebut = convertDate(rdv.start, false);
        dateFin = convertDate(removeDays(rdv.end, 1), false);
        all_day_text = "checked";
    } else {
        date_input_type += "time-local";
        dateDebut = convertDate(rdv.start);
        dateFin = convertDate(rdv.end);
    }
    let list_agendas = "";
    for (const elem of agendas) {
        let selected_text = "";

        if (rdv.agendas.includes(elem.id)) {
            selected_text = "selected";
        }
        list_agendas += `<option value="${elem.id}" ${selected_text}>${elem.nom}</option>\n`;
    }

    let modaleHTML = `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Modifier le rendez-vous</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler" onClick="deleteModal()"></button>
                </div>
                <div class="modal-body">
                    <form class="needs-validation" id="formModifRDV" action="/calendar-rdv" method="POST" novalidate>
                      <input type="hidden" id="idRDV" value="${id}" name="idRDV"> 
                      <div class="mb-3">
                        <label for="titreRDV" class="form-label">Titre</label>
                        <input type="text" class="form-control" id="titreRDV" value="${escapeHTML(titre)}" name="titre" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="lieuRDV" class="form-label">Lieu</label>
                        <input type="text" class="form-control" id="lieuRDV" value="${escapeHTML(lieu)}" name="lieu">
                      </div>
                      <div class="mb-3">
                        <label for="descriptionRDV" class="form-label">Description</label>
                          <textarea class="form-control" id="descriptionRDV" rows="3" name="description">${escapeHTML(description)}</textarea>
                      </div>
                      <div class="mb-3">
                        <label for="all_day" class="form-label">Toute la journée</label>
                        <input type="checkbox" name="all_day" id="all_day" ${all_day_text} onChange="change_all_day_option(this)">
                      </div>
                      <div class="mb-3">
                        <label for="dateDebut" class="form-label">Début</label>
                        <input type="${date_input_type}" class="form-control" id="dateDebut" value="${dateDebut}" name="dateDebut" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="dateFin" class="form-label">Fin</label>
                        <input type="${date_input_type}" class="form-control" id="dateFin" value="${dateFin}" name="dateFin" required>
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
                <div class="modal-footer d-flex justify-content-between">
                    <button type="button" class="btn btn-outline-danger btn-modal" onclick="suppressionRDV(`+id+`)">Supprimer</button>
                    <div>
                        <button type="button" class="btn btn-secondary btn-modal" data-bs-dismiss="modal" onclick="deleteModal()">Annuler</button>
                        <button type="button" class="btn btn-primary btn-modal" onClick="envoyerForm()">Valider</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modaleHTML);

    //Création et affichage d'une modale Bootstrap
    const fausseModale = document.getElementById('staticBackdrop');
    const vraieModale = new bootstrap.Modal(fausseModale);

    vraieModale.show();
}

window.suppressionRDV = function(id){
  if(confirm("Vous allez supprimer le rendez-vous.")){
    fetch(`/supprimerRDV/${id}`)
      .then((_) => {
        deleteModal();
        agendaManager.remove_events(id);
      })
      .catch((error) => {
        console.log(error);
    });
  }
}


/* Post de la requête de modif du rdv puis demande de mise à jours du calendrier au controleur*/
window.envoyerForm = function() {
    event.preventDefault();
    let titreInput = document.getElementById('titreRDV');
    let descriptionRDV = document.getElementById('descriptionRDV');
    let lieuRDV = document.getElementById('lieuRDV');
    
    const selectElement = document.getElementById('select_agendas');
    // agendas selectionnés
    const new_agendas = Array.from(selectElement.options).filter(option => option.selected).map(e => e.value);

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

    if (isValid) {
        agendaManager.update_event({start: dateDeb, end: dateFin, title: titreInput.value, lieu: lieuRDV.value, 
                                    description: descriptionRDV.value, agendas: new_agendas, allDay: all_day});

      deleteModal();
    }
}

function deleteModal(){
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

window.deleteModal = deleteModal;