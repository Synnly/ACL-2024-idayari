import { addDays, json_fetch } from "./utils.js";

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
        nb_occurrence_div.classList.add('d-flex');
        nb_occurrence.required = true;
    } else {
        reset(nb_occurrence);
        nb_occurrence_div.classList.remove('d-flex');
    }
}

function add_error(message, elem) {
    msgErreur.className = 'text-danger';
    msgErreur.textContent = message;
    elem.appendChild(msgErreur);
}

function setRendezVousModal(html, url, onsuccess) {
    console.log(html);
    document.body.insertAdjacentHTML('beforeend', html);
    const fausseModale = document.getElementById('staticBackdrop');
    const vraieModale = new bootstrap.Modal(fausseModale);

    const form = document.getElementById('rendezvous_form');
    const all_day = form["all_day"];
    const recurrence_div = document.getElementById('recurrent_div');
    const recurrent_checkbox = form['recurrent'];
    const frequence_input = form['frequence'];
    const end_date_rec = form['end_date_recurrence'];
    const nb_occurrence_div = document.getElementById('occurrence_div');
    const nb_occurrence_input = form['nb_occurrence'];
    const type_end_recurrence = form['end_recurrence'];

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        // suppression des anciennes erreurs
        for (const erreur of document.getElementsByClassName('text-danger')) {
            erreur.remove();
        }
        
        const titre = form["titre"].value.trim();
        const lieu = form["lieu"].value.trim();
        const description = form["description"].value.trim();
        const agenda_id = +form["agenda"].value;
        const is_all_day = all_day.checked;
        let startDate = "";
        let endDate = "";
        if (is_all_day) {
            startDate = new Date(form["startDate"]);
            startDate.setHours(0, 0, 0);
            endDate = addDays(new Date(form["endDate"]), 1);
            endDate.setHours(0, 0, 0);
        } else {
            startDate = new Date(`${form["startDate"]}T${form["startTime"]}`);
            endDate = new Date(`${form["endDate"]}T${form["endTime"]}`);
        }
        if (endDate <= startDate) {
            add_error('dateErreur1', "La date de fin doit être supérieure à la date de début.", document.getElementById('endDateDiv').parentElement);
            return;
        }
        // valeur pour un rendez-vous non récurrent
        let type = 'Simple';
        let frequence = null;
        let fin_recurrence = null;
        let nb_occurrence = null;
        // rendez-vous récurrent
        if (recurrent_checkbox.checked) {
            type = form["recurrence_type"].value;
            frequence = +frequence_input.value;
            if (type_end_recurrence.value === "date") {
                fin_recurrence = new Date(end_date_rec.value);
                if (fin_recurrence <= startDate) {
                    add_error('dateErreur2', "La date de fin de récurrence doit être supérieure à la date de début.", document.getElementById('end_recurrence_div').parentElement);
                    return;
                }
            }
            if (type_end_recurrence.value === "nb") {
                nb_occurrence = +nb_occurrence_input.value;
            }
        }
        const data = {titre: titre, lieu: lieu, description: description, agenda: agenda_id, all_day: is_all_day, startDate: startDate, 
                        endDate: endDate, type: type, frequence: frequence, fin_recurrence: fin_recurrence, nb_occurrence: nb_occurrence}
        
        json_fetch(url, "POST", data)
        .then(response => response.json())
        .then(result => onsuccess(data, result));
    });

    all_day.addEventListener('change', () => {
        // on a sélectionné "toute la journée"
        if (all_day.checked) {
            form["startTime"].style.display = 'none';
            form["endTime"].style.display = 'none';
        } else {
            form["startTime"].style.display = 'block';
            form["endTime"].style.display = 'block';
        }
    });

    // On suppose que tous les boutons servent à fermer la fenetre
    for (const btn of fausseModale.getElementsByTagName('BUTTON')) {
        btn.addEventListener('click', () => closeModal(fausseModale));
    }

    recurrent_checkbox.addEventListener('change', () => change_recurrent_option(recurrent_checkbox.checked, recurrence_div, frequence_input, type_end_recurrence, end_date_rec, nb_occurrence, nb_occurrence_div));
    type_end_recurrence.addEventListener('change', () => change_fin_recurrence_option(type_end_recurrence, end_date_rec, nb_occurrence_input, nb_occurrence_div));

    vraieModale.show();
}


export function getRendezVousModal(data, submit_url, onsuccess) {
    const url = "/modalRendezVous?";
    for (const key of Object.keys(data)) {
        url += `${key}=${data.key}&`;
    }
    fetch(url, {method: "GET"})
    .then(response => response.text())
    .then(html => setRendezVousModal(html, submit_url, onsuccess));
}