function confirmerSuppression(id, nom){
    event.preventDefault();
    const nomTronque = nom.substring(0, 15);

    if(confirm(`Êtes vous sûr de supprimer ${nomTronque === nom ? nom : nomTronque+'...'} ?\nCette action est IRREVERSIBLE.`)){
        window.location.href = `/supprimerAgenda/${id}`;
    }
}