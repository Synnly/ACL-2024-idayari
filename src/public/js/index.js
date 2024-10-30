function toggleAgenda(agenda){
    let node = document.getElementById(decodeURI(agenda));
    node.classList.contains('active') ? node.classList.remove('active') : node.classList.add('active');
    document.getElementById('selectAll').classList.remove('active');
}

function toggleAll(group, allButton){
    let node = document.getElementById(group);
    let button = document.getElementById(allButton);

    if(button.classList.contains("active")){
        button.classList.remove("active");
        for(let child of node.children){
            if(child.classList.contains('active')){
                child.classList.remove('active');
            }
        }
    }
    else{
        button.classList.add("active");
        for(let child of node.children){
            if(!child.classList.contains('active')){
                child.classList.add('active');
            }
        }
    }
}