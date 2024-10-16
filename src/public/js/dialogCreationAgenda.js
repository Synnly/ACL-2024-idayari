
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
    const champNom = document.getElementById("nom");
    const nom = champNom.value.trim();
    champNom.value = null;
});

const formulaireAgenda = document.getElementById("formulaireAgenda");
formulaireAgenda.addEventListener("submit", async(e)=>{
    e.preventDefault();
    //const dataFormulaire = new FormData(formulaireAgenda);
    //const nom = dataFormulaire.get("nom");
    const champNom = document.getElementById("nom");
    const nom = champNom.value.trim();
    champNom.value = null;
    

    try {
        const infos = await fetch("/creerAgenda",{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify({nom}),
        });
        const resultat = await infos.json();

        if (resultat.success) {
            /*boiteDialog.close();
            divDialog.hidden = true;
            window.location.reload();*/
            const newAgendaItem = document.createElement('li');
            newAgendaItem.innerHTML = `<h3>${nom}</h3>`;
            document.querySelector('ul').appendChild(newAgendaItem);

            boiteDialog.close();
            divDialog.hidden = true;
        }else{
            messageErreur.textContent = resultat.message;
        }
    } catch (error) {
        messageErreur.textContent = "erreur dans le catch du submit creation Agenda";
        console.error("Erreur catch submit creation Agenda :", error);
    }
});
