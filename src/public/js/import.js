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
                const file = input.files[0];    //Fichier sélectionné
                let reader = new FileReader();  //Lecture du fichier sélectionné
                reader.onload = (event) => {
                    try {
                        let data = JSON.parse(event.target.result);
                        fetch("/agenda-import", {
                                method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
                            })
                            .then((response) => response.json())
                            .then(result => {   //Traitement du nouvel Agenda
                                manageNewAgenda(result);
                            })
                            .catch((error) => {
                                alert('Erreur lors du chargement du fichier ');
                            });
                    } catch(error){
                        alert('Erreur dans le fichier json ');
                    }
                }
                reader.readAsText(file);
            };
      input.click();
    });

