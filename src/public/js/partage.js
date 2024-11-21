async function creerPartage(agendaId){
		await fetch(`/partage/new/${agendaId}`).then(() => window.location.reload());
}

function copierLien(id){
		navigator.clipboard.writeText('localhost:3000/partage/'+id);
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