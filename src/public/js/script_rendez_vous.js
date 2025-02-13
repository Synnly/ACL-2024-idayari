import { addDays, getConvertedDate, getConvertedTime, json_fetch, THIS_EVENT } from "./utils.js";
import { agendaManager } from "./calendar_controleur.js";
import { confirmDelete } from "./script_agenda.js";

function closeModal(modal) {
    const modalInstance = bootstrap.Modal.getInstance(modal);

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

function reset(elem) {
    elem.required = false;
    elem.value = '';
}

function reset_and_hide(elem) {
    reset(elem);
    elem.style.display = 'none';
}


function change_recurrent_option(is_checked, recurrent_div, freq_input, rec_type, end_date_rec, nb_occurrence, nb_occurrence_div) {
    if (!is_checked) {
        recurrent_div.style.display = 'none';
        reset(freq_input);
        reset(nb_occurrence);
        nb_occurrence_div.style.display = 'none';
        reset(end_date_rec);
    } else {
        recurrent_div.style.display = 'block';
        freq_input.required = true;
        change_fin_recurrence_option(rec_type, end_date_rec, nb_occurrence, nb_occurrence_div);
    }
}

function change_fin_recurrence_option(elem, end_date_rec, nb_occurrence, nb_occurrence_div) {
    if (elem.value === "date") {
        end_date_rec.style.display = 'block';
        end_date_rec.required = true;
    } else {
        reset_and_hide(end_date_rec)
    }
    if (elem.value === "nb") {
        nb_occurrence_div.classList.remove('d-none');
        nb_occurrence_div.classList.add('d-flex');
        nb_occurrence.required = true;
    } else {
        reset(nb_occurrence);
        nb_occurrence_div.classList.remove('d-flex');
        nb_occurrence_div.classList.add('d-none');
    }
}

/**
 * 
 * @param {String} message 
 * @param {HTMLElement} elem 
 */
function add_error(message, elem) {
    const msgErreur = document.createElement('div');
    msgErreur.className = 'text-danger';
    msgErreur.textContent = message;
    elem.parentNode.insertBefore(msgErreur, elem.nextSibling);
}

function setRecRDVChangeModal(action, agenda_changed, onReady) {
    fetch('/views/partials/validationRecRDVDialog.ejs', {method: "GET"})
    .then(response => response.text())
    .then(html => ejs.render(html, {action: action, agenda_changed: agenda_changed}))
    .then(html => {
        closeModal(document.getElementById('dialogRDVRec'));
        document.body.insertAdjacentHTML('beforeend', html);
        const dialog = document.getElementById('dialogRDVRec');
        const vraieModale = new bootstrap.Modal(dialog);

        const form = document.getElementById('rec_rdv_form');
        form.addEventListener('submit', () => {
            onReady(form['which_event'].value);
            closeModal(dialog);
        })
        document.getElementById('closeDialogRDVRec').addEventListener('click', () => {
            closeModal(dialog);
        });
        vraieModale.show();

    });
}

function setRendezVousModal(html, id, idAgenda, initiallyRec, idParent, onsuccess, removeFunction) {
    // s'il y avait déjà une modale, on la supprime
    closeModal(document.getElementById('staticBackdrop'));

    document.body.insertAdjacentHTML('beforeend', html);
    const fausseModale = document.getElementById('staticBackdrop');
    const vraieModale = new bootstrap.Modal(fausseModale);

    const form = document.getElementById('rendezvous_form');
    const startTime = form["startTime"];
    const endTime = form["endTime"];
    const all_day = form["all_day"];
    const recurrence_div = document.getElementById('recurrent_div');
    const recurrent_checkbox = form['recurrent'];
    const frequence_input = form['frequence'];
    const end_date_rec = form['end_date_recurrence'];
    const nb_occurrence_div = document.getElementById('occurrence_div');
    const nb_occurrence_input = form['nb_occurrence'];
    const type_end_recurrence = form['end_recurrence'];
    const remove_button = document.getElementById('remove_button');

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        // suppression des anciennes erreurs
        for (const erreur of document.getElementsByClassName('text-danger')) {
            erreur.remove();
        }

        const titre = form["titre"].value.trim();
        if (!titre) {
            add_error("Le titre doit contenir au moins un caractère", document.getElementById('titleDiv'));
            return;
        }
        const lieu = form["lieu"].value;
        const description = form["description"].value;
        const agenda_id = form["agenda"].value;
        const is_all_day = all_day.checked;
        const color = form["color"].value.split("#")[1];
        let startDate;
        let endDate;
        if (is_all_day) {
            startDate = new Date(form["startDate"].value);
            startDate.setHours(0, 0, 0);
            endDate = addDays(new Date(form["endDate"].value), 1);
            endDate.setHours(0, 0, 0);
        } else {
            startDate = new Date(`${form["startDate"].value}T${startTime.value}`);
            endDate = new Date(`${form["endDate"].value}T${endTime.value}`);
        }
        if (endDate <= startDate) {
            add_error("La date de fin doit être supérieure à la date de début.", document.getElementById('endDateDiv'));
            return;
        }
        // valeur pour un rendez-vous non récurrent
        let type = 'Simple';
        let frequence = null;
        let date_fin_recurrence = null;
        let nb_occurrence = null;
        // rendez-vous récurrent
        if (recurrent_checkbox.checked) {
            type = form["recurrence_type"].value;
            frequence = +frequence_input.value;
            if (type_end_recurrence.value === "date") {
                date_fin_recurrence = new Date(end_date_rec.value);
                date_fin_recurrence.setHours(0, 0, 0);
                date_fin_recurrence = date_fin_recurrence.valueOf();
            }
            if (type_end_recurrence.value === "nb") {
                nb_occurrence = +nb_occurrence_input.value;
            }
        }
        // on envoie les infos du nouveau rendez-vous, ainsi que la période en vue au cas où on devra rajouter des rendez-vous sur le calendrier
        const data = {titre: titre, lieu: lieu, description: description, agenda: agenda_id, all_day: is_all_day, 
                      startDate: startDate.valueOf(), endDate: endDate.valueOf(), type: type, frequence: frequence, 
                      date_fin_recurrence: date_fin_recurrence, nb_occurrence: nb_occurrence, color: color};        
        
        if (remove_button && (initiallyRec || idParent)) {
            setRecRDVChangeModal("Modification", idAgenda != form["agenda"].value, (which) => {
                onsuccess(data, which);
                closeModal(fausseModale);
            });
        } else {
            onsuccess(data);
            closeModal(fausseModale);
        }
    });

    all_day.addEventListener('change', () => {
        // on a sélectionné "toute la journée"
        if (all_day.checked) {
            startTime.style.display = 'none';
            startTime.required = false;
            endTime.style.display = 'none';
            endTime.required = false;
        } else {
            startTime.style.display = 'block';
            startTime.required = true;
            endTime.style.display = 'block';
            endTime.required = true;
        }
    });

    // On suppose que tous les boutons servent à fermer la fenetre
    for (const btn of fausseModale.getElementsByClassName('ferme')) {
        btn.addEventListener('click', () => closeModal(fausseModale));
    }

    if (remove_button) {
        remove_button.addEventListener('click', () => {
            if (recurrent_checkbox.checked || idParent) {
                setRecRDVChangeModal("Suppression", false, (which) => {
                    const is_all_day = all_day.checked;
                    let startDate, endDate;
                    if (is_all_day) {
                        startDate = new Date(form["startDate"].value);
                        startDate.setHours(0, 0, 0);
                        endDate = addDays(new Date(form["endDate"].value), 1);
                        endDate.setHours(0, 0, 0);
                    } else {
                        startDate = new Date(`${form["startDate"].value}T${startTime.value}`);
                        endDate = new Date(`${form["endDate"].value}T${endTime.value}`);
                    }
                    const startNoHours = new Date(startDate);
                    startNoHours.setHours(0, 0, 0);
                    json_fetch('/supprimerRDV', "DELETE", {which: which, id: id, start: startDate.valueOf(), 
                                                            end: endDate.valueOf(), startNoHours: startNoHours.valueOf(), idParent: idParent})
                    .then(response => {
                        if (response.status === 200) {
                            if (which === THIS_EVENT) {
                                removeFunction(); // on supprime l'event
                            } else if (which === "all") {
                                agendaManager.removeEventsByParent(idParent ? idParent : id);
                            } else if (which === "future") {
                                agendaManager.removeEventsByParentAfter(idParent ? idParent : id, startDate.valueOf());
                            }
                            closeModal(fausseModale);
                        }
                    })
                    .catch((error) => console.log(error));
                });
            } else {
                confirmDelete('confirmationModal2','rendezVousName','confirmDeleteButton2', "",() => {
                    json_fetch('/supprimerRDV', "DELETE", {id: id})
                    .then(response => {
                        if (response.status === 200) {
                            agendaManager.remove_events(id);
                            closeModal(fausseModale);
                        }
                    })
                    .catch((error) => console.log(error));
                  });
            }
        });
    }
    recurrent_checkbox.addEventListener('change', () => change_recurrent_option(recurrent_checkbox.checked, recurrence_div, frequence_input, type_end_recurrence, end_date_rec, nb_occurrence_input, nb_occurrence_div));
    type_end_recurrence.addEventListener('change', () => change_fin_recurrence_option(type_end_recurrence, end_date_rec, nb_occurrence_input, nb_occurrence_div));

    vraieModale.show();
}

export function getRendezVousModal(data, onsuccess, removeFunction) {
    data.agendas = [];
    
    // on récupère la liste des agendas
    for (const elem of document.getElementById('agendaList').children) {
        const id = elem.id.split("_")[1];
        if (elem.lastElementChild.lastElementChild.children.length === 3 || data.readonly) {                        
            data.agendas.push({
                id: id,
                nom: elem.firstElementChild.title,
                isOwner: !data.readonly 
            });
        }
    }

    if (data.end && data.all_day) {
        data.end.setDate(data.end.getDate() - 1);
    }

    // date et heure par défaut
    if (!data.start && !data.end) {
        data.start = new Date(Date.now());
        data.end = new Date(data.start);
        data.end.setHours(data.end.getHours() + 1);
    }

    data.toDate = getConvertedDate;
    data.toTime = getConvertedTime;
    fetch('/views/partials/rendez_vous_modal.ejs', {method: "GET"})
    .then(response => response.text())
    .then(html => ejs.render(html, data))
    .then(html => setRendezVousModal(html, data.id, data.agenda, data.type != 'Simple', data.idParent, onsuccess, removeFunction));
}



//Recherche de rendez vous (filtre)
const inputSearch = document.getElementById("searchRdv");

inputSearch.addEventListener("keyup",searchRdv);


let idTimeOut=0; // Id Pour gérer l'interval entre chaque touche pressée

/**
 * Lance la recherche de rdv à lors de l'event 'keyup', seulement si la dernière touche a été entrée il y a plus de 300 ms
 */
function searchRdv(){
    //On efface réinitialise le timeout à chaque nouvelle frappe pour ne pas filtrer les rdvs immédiatement (utile pour requête serveur)
    clearTimeout(idTimeOut);
    //Pour ne pas générer la recherche immédiatement
    idTimeOut = setTimeout(() =>{
        let term = document.getElementById("searchRdv").value;
        agendaManager.filterByTerm(term);
    },300);
}


//Recherche RDV server
const searchButton = document.getElementById("searchButton");
const list_agendas = document.getElementById('agendaList');
const agendaView = document.getElementById("calendar");


function SearchRdvs() {
    const checkedAgendas = Array.from(document.querySelectorAll('#agendaList .li_agenda')).filter((li) => {
        const checkbox = li.querySelector('input[type="checkbox"]');
        return checkbox && checkbox.checked;
    }).map(li => {
        return li.id.split("_")[1];
    });       

    const agendaQuery = checkedAgendas.join(","); 
    const query = `/calendar-search?&search=${encodeURIComponent(inputSearch.value)}&agendas=${agendaQuery}`;
    const { startDate, endDate } = agendaManager.getDisplayedDatInterval();

    fetch(query)
        .then(response => response.json())
        .then(async (rendezVous) => {
            let allEvents = [];
            const tenYears = 315360000000;
            const currentTime = new Date().getTime();
            rendezVous.forEach((rdv) => {
                rdv.dates.forEach((date) => {
                    const startTime = new Date(date.start).getTime();
                    if (startTime >= currentTime - tenYears && startTime <= currentTime + tenYears) {
                    allEvents.push({
                        ...date,
                        ...rdv,
                        agendaName: rdv.agendaName,
                    })
                };
                });
            });

            allEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

            const templateResponse = await fetch('../views/partials/search_list.ejs');
            const templateText = await templateResponse.text();

            const compiledTemplate = ejs.render(templateText, {
                allEvents: allEvents,
                formatEventTime: formatEventTime,
                formatDate: formatDate,
                search: inputSearch.value
            });
            const existingSearchResultsView = document.getElementById("searchResultsView");

            if (existingSearchResultsView) {
                agendaContainer.removeChild(existingSearchResultsView);
                
            }
        
            const searchResultsView = document.createElement("div");
            searchResultsView.id = "searchResultsView";
            searchResultsView.innerHTML = compiledTemplate;

            agendaContainer.appendChild(searchResultsView);
            agendaView.style.display = "none";

            const closeSearchView = document.getElementById("closeSearchView");
            closeSearchView.addEventListener("click", () => {
                agendaContainer.removeChild(searchResultsView);
                agendaView.style.display = "flex";
                agendaManager.calendrier.updateSize();
                removeCheckboxListeners();
            })
        }).catch(err => console.error("Erreur lors de la recherche :", err));
}

/**
 * Lance la recherche de rdv lors du clique sur boutton
 */
searchButton.addEventListener("click", () => {
    SearchRdvs();
});

function formatDate(dateString) {
    const date = new Date(dateString);
    return getConvertedDate(date); 
}
function formatEventTime(startString, endString) {
   return `${getConvertedTime(new Date(startString))}- ${getConvertedTime(new Date(endString))}`;
}

function addCheckboxListeners() {
    Array.from(list_agendas.getElementsByTagName("INPUT")).forEach(input => {
        input.addEventListener("change", SearchRdvs);
    });

    const selectAllCheckbox = document.getElementById("selectAll");
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", SearchRdvs);
    }
}

function removeCheckboxListeners() {
    Array.from(list_agendas.getElementsByTagName("INPUT")).forEach(input => {
        input.removeEventListener("change", SearchRdvs); 
    });

    const selectAllCheckbox = document.getElementById("selectAll");
    if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener("change", SearchRdvs);
    }
}

// Si le dom change pour ajouter searchResultsView alors on à fait un recherche
// Donc ça veut dire qu'il faut ajouter les écouteurs à ce moments
const observer = new MutationObserver(() => {
    const existingSearchResultsView = document.getElementById("searchResultsView");
    if (existingSearchResultsView) {
        addCheckboxListeners();
        observer.disconnect(); 
    }else {

    }
});

observer.observe(document.body, { childList: true, subtree: true });

