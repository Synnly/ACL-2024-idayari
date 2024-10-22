

function creerModale(titre, lieu, description, dateDebut, dateFin) {
    const modaleHTML = `
    <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Modification du RDV</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Annuler"></button>
                </div>
                <div class="modal-body">
                    <form>
                      <div class="mb-3">
                        <label for="titreRDV" class="form-label">Titre</label>
                        <input type="text" class="form-control" id="titreRDV" value="` + titre + `">
                      </div>
                      <div class="mb-3">
                        <label for="lieuRDV" class="form-label">Lieu</label>
                        <input type="text" class="form-control" id="lieuRDV" value="` + lieu + `">
                      </div>
                      <div class="mb-3">
                        <label for="descriptionRDV" class="form-label">Description</label>
                          <textarea class="form-control" id="descriptionRDV" rows="3"> ` + description +`</textarea>
                      </div>
                      <div class="mb-3">
                        <label for="dateDebRDV" class="form-label">Lieu</label>
                        <input type="date" class="form-control" id="dateDebRDV" value="` + dateDebut.toISOString().split('T')[0]+ `">
                      </div>
                      <div class="mb-3">
                        <label for="dateFinRDV" class="form-label">Lieu</label>
                        <input type="date" class="form-control" id="dateFinRDV" value="` + dateFin.toISOString().split('T')[0]+ `">
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

    const fausseModale = document.getElementById('staticBackdrop');
    const vraieModale = new bootstrap.Modal(fausseModale);

    vraieModale.show();

}

function envoyerForm(){
    const dateDeb = new Date(document.getElementById('dateDebRDV').value);
    const dateFin = new Date(document.getElementById('dateFinRDV').value);

    const msgErreur = document.getElementById('dateErreur');
    if (msgErreur) {
        msgErreur.remove();
    }

    if (dateFin <= dateDeb) {
        const msgErreur = document.createElement('div');
        msgErreur.id = 'dateErreur';
        msgErreur.className = 'text-danger';
        msgErreur.textContent = "La date de fin doit être supérieure à la date de début.";

        document.getElementById('dateFinRDV').parentNode.appendChild(msgErreur);
        return;
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