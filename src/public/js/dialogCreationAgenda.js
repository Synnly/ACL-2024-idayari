
const boiteDialog = document.getElementById("viewDialogCreationAgenda");
const boutonOuvreDialog = document.getElementById("ouvreDialogCreationAgenda");

boutonOuvreDialog.addEventListener("click", ()=> boiteDialog.showModal());

const boutonFermerDialog = document.getElementById("fermerDialogCreationAgenda");
boutonFermerDialog.addEventListener("click", ()=>{
    document.getElementById("nom").value = "";
    boiteDialog.close();
});
