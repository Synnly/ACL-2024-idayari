import {ajout_ecouteurs_agenda} from './script_agenda.js'
import { agendaManager } from "./calendar_controleur.js";


const importerAgenda = document.getElementById('importerAgenda');
const list_agendas = document.getElementById('agendaList');
const select_all = document.getElementById('selectAll');


/**
* Le code suivant gère l'écoute du bouton importer , à savoir l'import d'un fichier json séléctionné puis la sauvegarde dans la bd de l'agenda et des rdvs qu'il contient
*/
importerAgenda.addEventListener('click', function(event) {
      event.preventDefault();
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = _ => {
                const file = input.files[0];    //Fichier sélectionné
                if(file.type === "application/json"){
                    let reader = new FileReader();  //Lecture du fichier sélectionné
                    reader.onload = (event) => {
                        try {
                            let data = JSON.parse(event.target.result)
                            fetch("/agenda-import", {
                                    method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
                                })
                                .then((response) => response.json())
                                .then(result => {
                                    list_agendas.insertAdjacentHTML('beforeend', result.html);
                                    const agenda = document.getElementById(`agenda_${result.data.id}`);
                                    ajout_ecouteurs_agenda(agenda);

                                    agendaManager.addAgenda(result.data);
                                    // si le bouton "tout selectionner" était activé (donc tout était sélectionné)
                                    // et qu'on rajoute un agenda non sélectionné, on le désélectionne
                                    if (select_all.checked && !result.data.agenda.displayed) {
                                        select_all.checked = false;
                                    }
                                    //location.reload();
                                })
                                .catch((error) => {
                                    alert('Erreur lors du chargement du fichier : '+error);
                                });
                        } catch(error){
                            alert('Erreur dans le fichier json ');
                        }
                    }
                    reader.readAsText(file);
                }else{
                    alert("Le fichier n'est pas au format json");
                }
            };
      input.click();
    });

