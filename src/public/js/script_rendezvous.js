function change_recurrent_option(elem) {
    document.getElementById('recurrent_div').style.display = elem.checked ? 'block' : 'none';
    if (!elem.checked) {
        reset(document.getElementById('freq_number'));
        reset(document.getElementById('nb_occurence'));
        reset(document.getElementById('date_fin_recurrence'));
    } else {
        document.getElementById('freq_number').required = true;
        change_fin_recurrence_option(document.getElementById('select_fin_recurrence'));
    }
}

function change_fin_recurrence_option(elem) {
    const date_fin = document.getElementById('date_fin_recurrence');
    const nb_occur = document.getElementById('nb_occurence');
    if (elem.value == "0") {
        date_fin.style.display = 'block';
        date_fin.required = true;
        reset2(nb_occur);
    } else if (elem.value == "1") {
        nb_occur.style.display = 'block';
        nb_occur.required = true;
        reset2(date_fin);
    } else {
        reset2(nb_occur);
        reset2(date_fin);
    }
}

function reset(elem) {
    elem.required = false;
    elem.value = '';
}

function reset2(elem) {
    reset(elem);
    elem.style.display = 'none';
}