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
        const response = await fetch(`/partage/supprimer/${agendaId}`);
        if (response.ok) {
            window.location.reload();
        } else {
            console.error('Erreur lors de la suppression du partage:', await response.text());
        }
    } catch (error) {
        console.error('Erreur réseau:', error);
    }
}