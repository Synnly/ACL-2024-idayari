function toggleAgenda(agenda){
    let node = document.getElementById(agenda);
    if (node.classList.contains('active')) {
        node.classList.remove('active');
        document.getElementById('selectAll').checked = false;
    } else {
        node.classList.add('active');
        document.getElementById('selectAll').checked = Array.from(document.getElementById("agendaList").children).every(child => child.classList.contains("active"));
    }
    
}

function toggleAll(group, allButton){
    const node = document.getElementById(group);
    const button = document.getElementById(allButton);
    // on vérifie le contraire car le listener par défaut est le premier et change l'état avant cette fonction
    if(!button.checked){
        for(const child of node.children){
            child.classList.remove('active');
        }
    } else {
        for(const child of node.children){
            child.classList.add('active');
        }
    }

}