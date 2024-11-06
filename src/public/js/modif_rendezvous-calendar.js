import { agendaManager } from "./calendar_controleur.js";
import { addDays, removeDays, escapeHTML, convertDate } from "./utils.js";

/*Créer la modale de modification de rendez vous */
export function creerModale(rdv, agendas) {
    const titre = rdv.title;
    const lieu = rdv.lieu;
    const description = rdv.description;
    let dateDebut;
    let dateFin;
    const id = rdv.id;
    const all_day = rdv.allDay;
	const type = rdv.type;
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
	let recurrence_check = "";
	const hidden = 'style="display: none;"';
	let style_freq_div = hidden;
	let freq_number_value = "";
	let jour_selected = "";
	let semaine_selected = "";
	let mois_selected = "";
	let annee_selected = "";
	let date_fin_selected = "";
	let nb_occur_selected = "";
	let no_end = "";
	let style_input_fin_rec = hidden;
	let style_input_nb_occur = hidden;
	let value_fin_rec = "";
	let value_nb_occur = "";
	if (type != 'Simple') {
		recurrence_check = "checked";
		style_freq_div = "";
		freq_number_value = rdv.frequence;
		if (rdv.type == 'Regular') {
			if (rdv.frequence % 7 == 0) {
				semaine_selected = "selected";
				freq_number_value = rdv.frequence/7;
			} else {
				jour_selected = "selected";
			}
		} else if (rdv.type == 'Monthly') {
			mois_selected = "selected";
		} else if (rdv.type == "Yearly") {
			annee_selected = "selected";
		}
		if (rdv.fin_recurrence) {
			date_fin_selected = "selected";
			style_input_fin_rec = "";
			value_fin_rec = convertDate(rdv.fin_recurrence, false);
		} else if (rdv.nbOccurrences) {
			nb_occur_selected = "selected";
			style_input_nb_occur = "";
			value_nb_occur = rdv.nbOccurrences;
		} else {
			no_end = "selected";
		}
	}
    let list_agendas = "";
    for (const elem of agendas) {
        let selected_text = "";
        let initvalue = "";

        if (rdv.agendas.includes(elem.id)) {
            selected_text = "selected";
            initvalue = "data-initial='yes'";
        }
        list_agendas += `<option value="${elem.id}" ${initvalue} ${selected_text}>${elem.nom}</option>\n`;
    }

    let modaleHTML = `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Modifier le rendez-vous</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler" onClick="quitModal()"></button>
                </div>
				<form class="needs-validation" id="formModifRDV" action="/calendar-rdv" method="POST" onsubmit="envoyerForm()">
					<div class="modal-body">
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
					<input type="${date_input_type}" class="form-control" id="dateDebut" value="${dateDebut}" data-initialValue = "${rdv.dateDebut}" name="dateDebut" required>
					<div class="invalid-feedback">
						Champ obligatoire
					</div>
					</div>
					<div class="mb-3">
					<label for="dateFin" class="form-label">Fin</label>
					<input type="${date_input_type}" class="form-control" id="dateFin" value="${dateFin}" data-initialValue = "${rdv.dateFin}" name="dateFin" required>
					<div class="invalid-feedback">
						Champ obligatoire
					</div>
					</div>

					<div class="form-check">
					<input type="checkbox" class="form-check-input" name="recurrent" ${recurrence_check} id="recurrent" onchange="change_recurrent_option(this)">
					<label class="form-check-label" for="recurrent">Récurrent ?</label>
					</div>

					<div id="recurrent_div" class="mb-3" ${style_freq_div}>
					<label>Tous/Toutes les</label>
					<input type="number" min="1" name="freq_number" id="freq_number" value='${freq_number_value}' class="form-control d-inline w-25">
					<select name="freq_type" id="select_freq" class="form-select d-inline w-50">
						<option value="j" ${jour_selected}>jour(s)</option>
						<option value="s" ${semaine_selected}>semaine(s)</option>
						<option value="Monthly" ${mois_selected}>Mois</option>
						<option value="Yearly" ${annee_selected}>Année(s)</option>
					</select>
	
					<label>Fin de la répétition :</label>
					<select onchange="change_fin_recurrence_option(this)" id="select_fin_recurrence" name="fin_recurrence" class="form-select">
						<option value="0" ${date_fin_selected}>Jusqu'à une certaine date (incluse)</option>
						<option value="1" ${nb_occur_selected}>Après x occurences</option>
						<option value="2" ${no_end}>Jamais</option>
					</select>
					<input type="date" name="date_fin_recurrence" id="date_fin_recurrence" value=${value_fin_rec} class="form-control" ${style_input_fin_rec}>
					<input type="number" min="2" name="nb_occurence" id="nb_occurence" value=${value_nb_occur} class="form-control" ${style_input_nb_occur}>
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
					<div class="modal-footer">
					<button type="button" class="btn btn-secondary btn-modal"  data-bs-dismiss="modal"  onClick="quitModal()">Annuler</button>
					<button type="submit" class="btn btn-primary btn-modal">Modifier</button>
					</div>
				</form>
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

/* Post de la requête de modif du rdv puis demande de mise à jours du calendrier au controleur*/
export async function envoyerForm() {
    event.preventDefault();

    const recurrent = document.getElementById('recurrent');
    let freq_type = 'Simple';
    let freq_number = null;
    let date_fin_recurrence = null;
    let nb_occurrence = null;
    if(recurrent.checked){
		const select_freq = document.getElementById('select_freq').value;
		freq_number = +document.getElementById('freq_number').value;
		if (select_freq == 'j') {
			freq_type = 'Regular';
		} else if (select_freq == 's') {
			freq_type = 'Regular';
			freq_number = freq_number * 7;
		} else {
			freq_type == select_freq;
		}
		const sel_fin_rect = document.getElementById('select_fin_recurrence').value;
        if (sel_fin_rect == "0") {
			date_fin_recurrence = new Date(document.getElementById('date_fin_recurrence').value);
			date_fin_recurrence.setDate(date_fin_recurrence.getDate() + 1);
			date_fin_recurrence.setHours(0, 0, 0);
		} else if (sel_fin_rect == "1") {
			nb_occurrence = +document.getElementById('nb_occurence').value
		}
    }
    
    let titreInput = document.getElementById('titreRDV');
    let descriptionRDV = document.getElementById('descriptionRDV');
    let lieuRDV = document.getElementById('lieuRDV');
    
    const selectElement = document.getElementById('select_agendas');
    // on récupère uniquement les agendas à ajouter/supprimer
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
            description: descriptionRDV.value, agendas: new_agendas, allDay: all_day,
             freq_type: freq_type, freq_number: freq_number, date_fin_recurrence: date_fin_recurrence, nb_occurrence: nb_occurrence});
        
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

function change_recurrent_option(elem) {
  document.getElementById('recurrent_div').style.display = elem.checked ? 'block' : 'none';
  if (!elem.checked) {
      reset(document.getElementById('freq_number'));
      reset(document.getElementById('nb_occurence'));
      reset(document.getElementById('date_fin_recurrence'));
  } else {
      document.getElementById('freq_number').required = true;
      change_fin_recurrence_option(document.getElementById('select_fin_recurrence'));
  }
}

function change_fin_recurrence_option(elem) {
  const date_fin = document.getElementById('date_fin_recurrence');
  const nb_occur = document.getElementById('nb_occurence');
  if (elem.value == "0") {
      date_fin.style.display = 'block';
      date_fin.required = true;
      reset2(nb_occur);
  } else if (elem.value == "1") {
      nb_occur.style.display = 'block';
      nb_occur.required = true;
      reset2(date_fin);
  } else {
      reset2(nb_occur);
      reset2(date_fin);
  }
}

function reset(elem) {
  elem.required = false;
  elem.value = '';
}

function reset2(elem) {
  reset(elem);
  elem.style.display = 'none';
}

export function quitModal(){
    //Désactivation de la modale
    let modal = document.getElementById('staticBackdrop');
    modal.remove();
   
    
}