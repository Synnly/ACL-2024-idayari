
function openDialog() {
    const boiteDialog = document.getElementById("viewDialogCreationAgenda");
    boiteDialog.showModal()

    const boutonFermerDialog = document.getElementById("fermerDialogCreationAgenda");
    boutonFermerDialog.addEventListener("click", ()=>{
        document.getElementById("nom").value = "";
        boiteDialog.close();
    });   
}