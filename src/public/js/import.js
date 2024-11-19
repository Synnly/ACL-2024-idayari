const importerAgenda = document.getElementById('importerAgenda');
const list_agendas = document.getElementById('agendaList');

/**
* Le code suivant gère l'écoute du bouton importer , à savoir l'import d'un fichier json séléctionné puis la sauvegarde dans la bd de l'agenda et des rdvs qu'il contient
*/
importerAgenda.addEventListener('click', function(event) {
      event.preventDefault();
      const input = document.createElement('input');
      input.type = 'file';
      input.onchange = _ => {
                const file = input.files[0];    //Fichier sélectionné
                if(file.type === "application/json"){
                    let reader = new FileReader();  //Lecture du fichier sélectionné
                    reader.onload = (event) => {
                        try {
                            let data = JSON.parse(event.target.result)
                            fetch("/agenda-import", {
                                    method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
                                })
                                .then((response) => response.json())
                                .then(data => {
                                    console.log(data);  //Log Provisoire
                                    location.reload();
                                })
                                .catch((error) => {
                                    alert('Erreur lors du chargement du fichier : '+error);
                                });
                        } catch(error){
                            alert('Erreur dans le fichier json ');
                        }
                    }
                    reader.readAsText(file);
                }else{
                    alert("Le fichier n'est pas au format json");
                }
            };
      input.click();
    });

