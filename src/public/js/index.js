function toggleAgenda(agenda){
    let node = document.getElementById(decodeURI(agenda));
    node.classList.contains('active') ? node.classList.remove('active') : node.classList.add('active');
    document.getElementById('selectAll').classList.remove('active');
}

function toggleAll(){
    let nodesAgenda = document.getElementById("agendaList");
    let nodesPartage = document.getElementById("partageList");

    let button = document.getElementById("selectAll");

    if(button.classList.contains("active")){
        button.classList.remove("active");
        for(const child of nodesAgenda.children){
            if(child.classList.contains('active')){
                child.classList.remove('active');
            }
        }
        for(const child of nodesPartage.children){
            if(child.classList.contains('active')){
                child.classList.remove('active');
            }
        }
    }
    else{
        button.classList.add("active");
        for(const child of nodesAgenda.children){
            if(!child.classList.contains('active')){
                child.classList.add('active');
            }
        }
        for(const child of nodesPartage.children){
            if(!child.classList.contains('active')){
                child.classList.add('active');
            }
        }
    }

}