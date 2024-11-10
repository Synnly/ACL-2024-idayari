function toggleAgenda(agenda, event){
    const checkbox = document.getElementById(`check_${agenda}`);
    // si ce n'est pas le label ou l'input qui a déclenché la fonction
    // l'input n'est pas mis à jour automatiquement
    if (event.target.tagName != "LABEL" && event.target.tagName != "INPUT") {
        checkbox.checked = !checkbox.checked;
    }
    // si déselection
    if (!checkbox.checked) {
        document.getElementById('selectAll').checked = false;
    } else {
        document.getElementById('selectAll').checked = Array.from(document.getElementById("agendaList").getElementsByTagName("INPUT"))
                                                            .every(child => child.checked);
    }
}

function toggleAll(group, allButton){
    const node = document.getElementById(group);
    const button = document.getElementById(allButton);
    // on vérifie le contraire car le listener par défaut est le premier et change l'état avant cette fonction
    if(!button.checked){
        for(const child of node.children){
            child.firstElementChild.firstElementChild.checked = false;
        }
    } else {
        for(const child of node.children){
            child.firstElementChild.firstElementChild.checked = true;
        }
    }

}