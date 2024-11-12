function selectAgenda(id, nom) {
    console.log(nom + "     1")
    const agendaItems = document.querySelectorAll('#agendaList .list-group-item');
    agendaItems.forEach(item => item.classList.remove('bg-primary'));
    document.getElementById(`${id}`).classList.add('bg-primary');

    const exportBtn = document.getElementById('exportBtn');
    exportBtn.classList.remove('d-none');
    exportBtn.setAttribute('onclick', `exportAgenda("${nom}", "${id}")`);
}

function exportAgenda(nom, agendaId) {
    console.log(nom + "     2")
    document.getElementById("spinner").classList.remove("d-none");
    document.getElementById("spinner").classList.add("d-flex");
    fetch('/export', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: agendaId })
    })
    .then(response => response.json())
    .then(data => {
        download(`${decodeURIComponent(nom)}.json`, JSON.stringify(data, null, 2));
        
    })
    .catch(error => console.error('Erreur lors de l\'exportation de l\'agenda:', error)).finally(() => {
        document.getElementById("spinner").classList.remove("d-flex");
        document.getElementById("spinner").classList.add("d-none");
    }
    );
}

function download(filename, text) {
    console.log(filename + "     3")
    const blob = new Blob([text], {type: 'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
}
