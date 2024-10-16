
const messageErreur = document.getElementById("messageErreur");
const boiteDialog = document.getElementById("viewDialogCreationAgenda");
const divDialog = document.getElementById("divDialogCreerAgenda");
const boutonOuvreDialog = document.getElementById("ouvreDialogCreationAgenda");

boutonOuvreDialog.addEventListener("click", ()=>{
    divDialog.hidden = false;
    boiteDialog.showModal();
});

const boutonFermerDialog = document.getElementById("fermerDialogCreationAgenda");
boutonFermerDialog.addEventListener("click", ()=>{
    boiteDialog.close();
    divDialog.hidden = true;
});

const formulaireAgenda = document.getElementById("formulaireAgenda");
formulaireAgenda.addEventListener("submit", async(e)=>{
    e.preventDefault();
    const dataFormulaire = new FormData(formulaireAgenda);
    const nom = dataFormulaire.get("nom");

    try {
        const x = await fetch("/creerAgenda",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify({nom}),
        });
        const y = await x.json();

        if (y.success) {
            /*boiteDialog.close();
            divDialog.hidden = true;
            window.location.reload();*/
            // Mettre à jour l'interface utilisateur avec le nouvel agenda sans recharger
            const newAgendaItem = document.createElement('li');
            newAgendaItem.innerHTML = `<h3>${nom}</h3>`; // Créer un nouvel élément agenda
            document.querySelector('ul').appendChild(newAgendaItem); // Ajoute à la liste existante

            // Fermer le dialog
            boiteDialog.close();
            divDialog.hidden = true;
        }else{
                messageErreur.textContent = y.message;
        }

    } catch (error) {
        messageErreur.textContent = "erreur dans le catch du submit creation Agenda";
        console.error("Erreur :", error);
    }
});
