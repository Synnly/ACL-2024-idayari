function exportAgenda(nom, agendaId) {
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
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.href = url;
    element.download = filename;

    document.body.appendChild(element);
    element.click();

    document.body.removeChild(element);

    URL.revokeObjectURL(url);
}
