import {addDays} from "./utils.js";
import {agendaManager} from "/js/calendar_controleur.js";

export function creerModaleNouveauRdv(agendas) {

    let list_agendas = "";
    for (const elem of agendas) {
        list_agendas += `<option value="${elem.id}">${elem.nom}</option>\n`;
    }

    let modaleHTML = `
 <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="staticBackdropLabel">Créer un nouveau rendez-vous</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler" onClick="deleteModal()"></button>
            </div>
            <div class="modal-body">
                <form class="needs-validation" id="formModifRDV" action="/calendar-rdv" method="POST" novalidate>
                    <input type="hidden" id="idRDV" name="idRDV"> 
                    <div class="mb-3">
                        <label for="titreRDV" class="form-label">Titre</label>
                        <input type="text" class="form-control" id="titreRDV" name="titre">
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
                        <input type="datetime-local" class="form-control" id="dateDebut" name="dateDebut">
                        <div class="invalid-feedback">
                            Champ obligatoire
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="dateFin" class="form-label">Fin</label>
                        <input type="datetime-local" class="form-control" id="dateFin" name="dateFin">
                        <div class="invalid-feedback">
                            Champ obligatoire
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="recurrent">Récurrent ?</label>
                        <input id="toggleRecurrence" type="checkbox" name="recurrent" value="rec" onChange="change_recurrent_option(this)"> 
                        <div id="recurrent_div" style="display: none;">
                            <label for="freq_number"> Tous\/Toutes les </label>
                            <div class="mb-3 d-flex">
                                <input class="form-control  me-2" type="number" min="1" name="freq_number" id="freq_number">
                                <select class="form-control w-fit-content" name="freq_type" id="select_freq">
                                    <option value="j">jour(s)</option>
                                    <option value="s">semaine(s)</option>
                                    <option value="Monthly">Mois</option>
                                    <option value="Yearly">Année(s)</option>
                                </select>
                            </div>
                            <label for="select_fin_recurrence">Fin de la répétition</label>
                            <div class="mb-3 d-flex">
                                <select class="form-control w-fit-content me-2" onchange="change_fin_recurrence_option(this)" id="select_fin_recurrence" name="fin_recurrence">
                                    <option value="0">Jusqu'à une certaine date (excluse)</option>
                                    <option value="1">Après x occurences</option>
                                    <option value="2">Jamais</option>
                                </select>
                                <input class="form-control" type="date" name="date_fin_recurrence" id="date_fin_recurrence">
                                <input class="form-control" type="number" min="2" name="nb_occurence" id="nb_occurence" style="display: none;">
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="select_agendas" class="form-label">Agenda(s) associé(s) au rendez-vous</label>
                        <select name="agendas" id="select_agendas" class="form-control" multiple>
                            ${list_agendas}
                        </select>
                        <div class="invalid-feedback">
                            Champ obligatoire
                        </div>                        
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-modal"  data-bs-dismiss="modal"  onClick="quitModalNouveauRdv()">Annuler</button>
                <input type="submit" class="btn btn-primary btn-modal" onClick="envoyerFormNouveauRdv()" value="Créer">
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
    let titreInput = document.getElementById('titreRDV');
    let descriptionRDV = document.getElementById('descriptionRDV');
    let lieuRDV = document.getElementById('lieuRDV');

    const selectElement = document.getElementById('select_agendas');
    // on récupère uniquement les agendas à ajouter/supprimer
    const selectedAgendas = Array.from(selectElement.options).filter(option => option.selected).map(e => e.value);

    let recurrence = document.getElementById("toggleRecurrence").checked ? "rec" : "";

    let dateDebInput = document.getElementById('dateDebut');
    let dateFinInput = document.getElementById('dateFin');

    let toggleRec = document.getElementById("toggleRecurrence");
    let nbFreq = document.getElementById("freq_number");
    let typeFinRec = document.getElementById("select_fin_recurrence");
    let dateFinRec = document.getElementById("date_fin_recurrence");
    let nbRec = document.getElementById("nb_occurence");

    //Clear des anciennes erreurs
    titreInput.classList.remove("is-invalid");
    dateDebInput.classList.remove("is-invalid");
    dateFinInput.classList.remove("is-invalid");

    nbFreq.classList.remove("is-invalid");
    dateFinRec.classList.remove("is-invalid");
    nbRec.classList.remove("is-invalid");

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
        dateFin.setHours(0, 0, 1);
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

    if(toggleRec.checked){
        if(nbFreq.value === '' || !Number.isInteger(+nbFreq.value) || +(nbFreq.value) < 1){
            nbFreq.classList.add("is-invalid");
            isValid = false;
        }

        if(typeFinRec.selectedOptions[0].value === "0" && dateFinRec.value === ''){
            dateFinRec.classList.add("is-invalid");
            isValid = false;
        }

        if(typeFinRec.selectedOptions[0].value === "1" && (nbRec.value === '' || !Number.isInteger(+nbRec.value) || +(nbRec.value) < 2)){
            nbRec.classList.add("is-invalid");
            isValid = false;
        }

        console.log(dateDeb, new Date(dateFinRec.value), dateDeb >= new Date(dateFinRec.value))
        if(dateDebInput.value !== '' && dateFinRec.value !== '' && dateDeb >= new Date(dateFinRec.value)){
            dateFinRec.classList.add("is-invalid");
            isValid = false;
        }
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
            recurrent: recurrence,
            freq_type: document.getElementById("select_freq").value,
            freq_number:  document.getElementById("freq_number").value ,
            date_fin_recurrence: document.getElementById("date_fin_recurrence").value,
            nb_reccurence: document.getElementById("nb_occurence").value
        };
        fetch("/rendezVous/new", {
            method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
        }).then(() => {
            // Agendas sélectionnés dans l'affichage et dans la modale
            agendaManager.addData(selectedAgendas.filter((id) => document.getElementById("agenda_"+id).classList.contains("active")));
        })
        .catch((error) => {console.log(error)});

        quitModalNouveauRdv()
    }
}

export function quitModalNouveauRdv(){
    let modal = document.getElementById('staticBackdrop');
    let modalInstance = bootstrap.Modal.getInstance(modal);

    //Détruit les éléments liés à la modale (éléments bootstrap)
    if(modalInstance){
        modalInstance.dispose();
        //Pour faire fonctionner le scroll à nouveau
        document.body.style.overflow = '';
    }
    if (modal) {
        modal.remove();
    }
}


function convertDate(date, withTime=true){
    let year = date.getFullYear();
    //PadStart(2,'0') : 2 = nb min de caratère, '0' = le caractère de remplissage qu'on ajoute
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Mois (0-11)
    let day = String(date.getDate()).padStart(2, '0');

    if (withTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
        return `${year}-${month}-${day}`;
    }
}

function change_all_day_option(elem) {
    const date_debut = document.getElementById('dateDebut');
    const date_fin = document.getElementById('dateFin');
    const val_debut = date_debut.value ? new Date(date_debut.value) : "";
    const val_fin = date_fin.value ? new Date(date_fin.value) : "";
    if (elem.checked) {
        date_debut.type = 'date';
        date_fin.type = 'date';
        date_debut.value = val_debut ? convertDate(val_debut, false) : val_debut;
        date_fin.value = val_fin ? convertDate(val_fin, false) : val_fin;
    } else {
        date_debut.type = 'datetime-local';
        date_fin.type = 'datetime-local';
        date_debut.value = val_debut ? convertDate(val_debut) : val_debut;
        date_fin.value = val_fin ? convertDate(val_fin) : val_fin;

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