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


function change_recurrent_option(is_checked, recurrent_div, freq_input, rec_type, end_date_rec, nb_occurrence) {
    if (!is_checked) {
        recurrent_div.style.display = 'none';
        reset(freq_input);
        reset(nb_occurrence);
        reset(end_date_rec);
    } else {
        recurrent_div.style.display = 'block';
        freq_input.required = true;
        change_fin_recurrence_option(rec_type, end_date_rec, nb_occurrence);
    }
}

function change_fin_recurrence_option(elem, end_date_rec, nb_occurrence) {
    if (elem.value === "0") {
        end_date_rec.style.display = 'block';
        end_date_rec.required = true;
        reset_and_hide(nb_occur);
    } else if (elem.value === "1") {
        nb_occurrence.style.display = 'block';
        nb_occurrence.required = true;
        reset_and_hide(end_date_rec);
    } else {
        reset_and_hide(nb_occurrence);
        reset_and_hide(end_date_rec);
    }
}


function setRendezVousModal(html) {
    console.log(html);
    document.body.insertAdjacentHTML('beforeend', html);
    const fausseModale = document.getElementById('staticBackdrop');
    const vraieModale = new bootstrap.Modal(fausseModale);


    const form = document.getElementById('rendezvous_form');

    const all_day = form["all_day"];
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

    const recurrence_div = document.getElementById('recurrent_div');
    const recurrent_checkbox = form['recurrent'];
    const frequence = form['frequence'];
    const end_date_rec = form['end_date_recurrence'];
    const nb_occurrence = form['nb_occurrence'];
    const type_end_recurrence = form['end_recurrence'];
    recurrent_checkbox.addEventListener('change', () => change_recurrent_option(recurrent_checkbox.checked, recurrence_div, frequence, type_end_recurrence, end_date_rec, nb_occurrence));
    type_end_recurrence.addEventListener('change', () => change_fin_recurrence_option(type_end_recurrence, end_date_rec, nb_occurrence));

    vraieModale.show();
}


export function getRendezVousModal(data) {
    const url = "/modalRendezVous?";
    for (const key of Object.keys(data)) {
        url += `${key}=${data.key}&`;
    }
    fetch(url, {method: "GET"})
    .then(response => response.text())
    .then(html => setRendezVousModal(html));
}