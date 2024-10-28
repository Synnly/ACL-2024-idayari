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

    const modaleHTML = `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Modification du RDV</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler"></button>
                </div>
                <div class="modal-body">
                    <form class="needs-validation" id="formModifRDV" action="/calendar-rdv"" method="POST" novalidate>
                      <input type="hidden" id="idRDV" value="`+ id +`" name="idRDV"> 
                      <div class="mb-3">
                        <label for="titreRDV" class="form-label">Titre</label>
                        <input type="text" class="form-control" id="titreRDV" value="` + escapeHTML(titre) + `" name="titre" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="lieuRDV" class="form-label">Lieu</label>
                        <input type="text" class="form-control" id="lieuRDV" value="` + escapeHTML(lieu) + `" name="lieu">
                      </div>
                      <div class="mb-3">
                        <label for="descriptionRDV" class="form-label">Description</label>
                          <textarea class="form-control" id="descriptionRDV" rows="3" name="description">`+escapeHTML(description)+`</textarea>
                      </div>
                      <div class="mb-3">
                        <label for="dateDebRDV" class="form-label">Début</label>
                        <input type="datetime-local" class="form-control" id="dateDebRDV" value="` + dateDebut + `" name="dateDebut" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="dateFinRDV" class="form-label">Fin</label>
                        <input type="datetime-local" class="form-control" id="dateFinRDV" value="` + dateFin + `" name="dateFin" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-modal" data-bs-dismiss="modal" >Annuler</button>
                    <button type="button" class="btn btn-primary btn-modal" onClick="envoyerForm()">Valider</button>
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

    const titreInput = document.getElementById('titreRDV');
    const descriptionRDV = document.getElementById('descriptionRDV');
    const lieuRDV = document.getElementById('lieuRDV');
    const idRDV = document.getElementById('idRDV');



    const dateDebInput = document.getElementById('dateDebRDV');
    const dateFinInput = document.getElementById('dateFinRDV');

    //Clear des anciennes erreurs
    titreInput.classList.remove("is-invalid");
    dateDebInput.classList.remove("is-invalid");
    dateFinInput.classList.remove("is-invalid");

    const msgErreur = document.getElementById('dateErreur');
    if (msgErreur) {
        msgErreur.remove();
    }

    const dateDeb = new Date(dateDebInput.value);
    const dateFin = new Date(dateFinInput.value);

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
            dateDebut: dateDeb,
            dateFin: dateFin,
            titre: titreInput.value,
            description: descriptionRDV.value,
            lieu: lieuRDV.value,
            idRDV: idRDV.value,
        }
        /*Après récupération du rdv modifié, on demande au controleur de mettre à jour le full calendar pour ce rdv */
        fetch("/calendar-rdv",{
            method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
        })
        .then((response) => response.json())
        .then((data) => agendaManager.updateRdv(data))
        .catch((error) => console.log("Aucune données"));

        //Désactivation de la modale
        const modal = document.getElementById('staticBackdrop');
        let modalInstance = bootstrap.Modal.getInstance(modal);
        
        if (modalInstance) {
            modalInstance.hide(); 
        }
    }
}