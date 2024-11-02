export function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/*Pour passer du format Sat Nov 02 2024 15:14:00 GMT+0100 (heure normale d’Europe centrale)
au format 2024-11-02T15:14 pour insérer les dates par défaut dans la modale 
Utilisés dans modif_rendezvous-calendar*/
export function convertDate(date){   
    let year = date.getFullYear();
    //PadStart(2,'0') : 2 = nb min de caratère, '0' = le caractère de remplissage qu'on ajoute 
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Mois (0-11)
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0'); 

    const newDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    return newDate;
}