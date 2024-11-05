function confirmerSuppression(id){
    event.preventDefault();
    const node = document.getElementById(id.toString());
    const nomTronque = node.placeholder.substring(0, 15);

    if(confirm(`Êtes vous sûr de supprimer ${nomTronque === node.placeholder ? node.placeholder : nomTronque+'...'} ?\nCette action est IRREVERSIBLE.`)){
        window.location.href = `/supprimerAgenda/${id}`;
    }
}

(() => {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

