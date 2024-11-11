function creerPartage(agendaId){
		fetch(`/partage/new/${agendaId}`).then(rafraichirListe());
}

function rafraichirListe(){
		
}