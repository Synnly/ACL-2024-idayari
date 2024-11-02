import { agendaManager } from "./calendar_controleur.js";
import { escapeHTML,convertDate } from "./utils.js";

/*Créer la modale de modification de rendez vous */
export function creerModale(rdv) {
    const titre = rdv.titre;
    const lieu = rdv.lieu;
    const description = rdv.description;
    const dateDebut = convertDate(rdv.dateDebut);
    const dateFin = convertDate(rdv.dateFin);
    const id = rdv.id;
    const all_day = rdv.allDay;
    let all_day_text = "";
    let date_input_type = "date";
    if (all_day) {
        all_day_text = "checked";
    } else {
        date_input_type += "time-local";
    }
    

    let modaleHTML = `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Affichage du RDV</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler" onClick="quitModal()"></button>
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
                        <label for="all_day">Toute la journée</label>
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
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-modal"  data-bs-dismiss="modal"  onClick="quitModal()">Annuler</button>
                    <button type="button" class="btn btn-primary btn-modal" onClick="envoyerForm()">Modifier</button>
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

/* Post de la requête de modif du rdv puis demande de mise à jours du calendrier au controleur*/
export async function envoyerForm() {
    event.preventDefault();
    let titreInput = document.getElementById('titreRDV');
    let descriptionRDV = document.getElementById('descriptionRDV');
    let lieuRDV = document.getElementById('lieuRDV');
    let idRDV = document.getElementById('idRDV');



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
    const dateDebInit = new Date(dateDebInput.getAttribute('data-initialValue'));
    const dateFin = new Date(dateFinInput.value);
    const dateFinInit = new Date(dateFinInput.getAttribute('data-initialValue'));

    if (document.getElementById('all_day').checked) {
        dateDeb.setHours(0, 0, 0, 0);
        dateFin.setHours(23, 59, 59);
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
        let data = {
            ecartDebut: dateDeb - dateDebInit,
            ecartFin: dateFin - dateFinInit,
            titre: titreInput.value,
            description: descriptionRDV.value,
            lieu: lieuRDV.value,
            idRDV: idRDV.value,
            // on envoie aussi la période actuellement visible
            viewStart: agendaManager.calendrier.view.activeStart,
            viewEnd: agendaManager.calendrier.view.activeEnd
        }
        /*Après récupération du rdv modifié, on demande au controleur de mettre à jour le full calendar pour ce rdv */
        fetch("/calendar-rdv",{
            method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((data) => agendaManager.updateRdv(data))
        .catch((error) => console.log("Aucune données"));

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

export function quitModal(){
    //Désactivation de la modale
    let modal = document.getElementById('staticBackdrop');
    modal.remove();
   
    
}