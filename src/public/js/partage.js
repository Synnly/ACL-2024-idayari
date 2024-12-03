async function creerPartage(agendaId){
		await fetch(`/partage/new/${agendaId}`).then(() => window.location.reload());
}

function copierLien(id, link){
		navigator.clipboard.writeText('localhost:3000/partage/'+link);
		showCheckMark(id)
}

function showCheckMark(id){
		const button = document.getElementById("bouton_copier_"+id);
		button.classList.remove("bi-clipboard");
		button.classList.add("bi-check-lg");
}

function hideCheckMark(id){
		const button = document.getElementById("bouton_copier_"+id);
		button.classList.add("bi-clipboard");
		button.classList.remove("bi-check-lg");
}

async function supprimerPartage(agendaId){
	try {
		const username = document.getElementById("selectUser").value;
        const response = await fetch(`/partage/supprimer/${agendaId}/${username}`);
        if (response.ok) {
            window.location.reload();
        } else {
            console.error('Erreur lors de la suppression du partage:', await response.text());
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
    }
}

function sortTable(ascending) {
	const table = document.querySelector("table tbody");
	const rows = Array.from(table.rows);
	rows.sort((rowA, rowB) => {
		const nameA = rowA.cells[0].textContent.trim().toLowerCase();
		const nameB = rowB.cells[0].textContent.trim().toLowerCase();

		if (ascending) {
			return nameA.localeCompare(nameB);
		} else {
			return nameB.localeCompare(nameA);
		}
	});

	rows.forEach(row => table.appendChild(row));
}
