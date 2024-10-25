function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function creerModale(titre, lieu, description, dateDebut, dateFin, id) {
    description = description.trim();
    const modaleHTML = `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Modification du RDV</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler"></button>
                </div>
                <div class="modal-body">
                    <form class="needs-validation" id="formModifRDV" action="/" method="POST" novalidate>
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
                        <input type="datetime-local" class="form-control" id="dateDebRDV" value="` + dateDebut.toISOString().slice(0, 16) + `" name="dateDebut" required>
                        <div class="invalid-feedback">
                          Champ obligatoire
                        </div>
                      </div>
                      <div class="mb-3">
                        <label for="dateFinRDV" class="form-label">Fin</label>
                        <input type="datetime-local" class="form-control" id="dateFinRDV" value="` + dateFin.toISOString().slice(0, 16) + `" name="dateFin" required>
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

function envoyerForm() {
    event.preventDefault();
    const titreInput = document.getElementById('titreRDV');
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
        document.getElementById("formModifRDV").submit();
    }
}

document.addEventListener("DOMContentLoaded", function() {

    // Suppression des modales lors de la fermeture.
    document.addEventListener('hidden.bs.modal', function(event) {
        const modale = event.target;

        if (modale.classList.contains('modal')) {
            modale.remove();
        }
    });
});