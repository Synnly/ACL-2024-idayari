import {manageNewAgenda} from './script_agenda.js'




const importerAgenda = document.getElementById('importerAgenda');   //Bouton importer

/**
* Le code suivant gère l'écoute du bouton importer , à savoir l'import d'un fichier json séléctionné puis la sauvegarde dans la bd de l'agenda et des rdvs qu'il contient
*/
importerAgenda.addEventListener('click', function(event) {
    event.preventDefault();

    const input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('accept', '.json,application/json');
    
    input.onchange = _ => {
        const file = input.files[0];    // Fichier sélectionné
        let reader = new FileReader();  // Lecture du fichier sélectionné

        reader.onload = (event) => {
            try {
                let data = JSON.parse(event.target.result);

                fetch("/agenda-import", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(data)
                })
                .then((response) => response.json())
                .then(result => {
                    manageNewAgenda(result);
                })
                .catch((error) => {
                    showError('Erreur lors du chargement du fichier');
                });
            } catch(error) {
                showError('Erreur dans le fichier JSON');
            }
        };

        reader.readAsText(file);
    };

    input.click();
});

function showError(message) {
    const errorModalBody = document.getElementById('errorModalBody');

    errorModalBody.textContent = message;

    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    errorModal.show();
}
