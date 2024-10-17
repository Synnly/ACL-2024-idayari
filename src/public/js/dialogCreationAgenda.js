
const boiteDialog = document.getElementById("viewDialogCreationAgenda");
const boutonOuvreDialog = document.getElementById("ouvreDialogCreationAgenda");

boutonOuvreDialog.addEventListener("click", ()=> boiteDialog.showModal());

const boutonFermerDialog = document.getElementById("fermerDialogCreationAgenda");
boutonFermerDialog.addEventListener("click", ()=>{
    boiteDialog.close();
    document.getElementById("nom").value = "";
});
