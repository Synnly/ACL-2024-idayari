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
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Mois (0-11)

    //PadStart(2,'0') : 2 = nb min de caratère, '0' = le caractère de remplissage qu'on ajoute 
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0'); 

    const newDate = `${year}-${month}-${day}T${hours}:${minutes}`;

    return newDate;
}

/*Va servir à savoir quel jour commence le 1er du mois */
const weekdays = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi", "Vendredi", "Samedi"];

/*Renvoie l'indice du premier jour du mois */
export function getBeginingDay(year,month){

    let firstDayInMonth = new Date(year,month - 1,1);

    /* Renvoie une date au format : mardi, 01/10/2024 */
    let dateString = firstDayInMonth.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    //Pour récupérer uniquement le jour
    dateString = dateString.split(" ")[0];
    //Pour être sur que la première lettre est une majuscule
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

    /*Récupère l'index du jour de la semaine  (paddingDays = jours qui appartiennent aux mois précédent de 1 jusqu'à paddingDays)*/
    let paddingDays = weekdays.indexOf(dateString);

    return paddingDays;
}

/*Renvoie l'indice du dernier jour du mois */
/*lE CODE suivant nous donne le bon jour avec la Mauvaise Date (Problème fuseau horaire?) */
export function getEndDay(year,month){
    /* Note : 3eme paramètre jour du mois sauf 0 = 1 jours avant le premier jours du mois*/
    let lastDayInMonth = new Date(year,month,0);

    /* Renvoie une date au format : mardi, 01/10/2024 */
    let dateString = lastDayInMonth.toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });
    //Pour récupérer uniquement le jour
    dateString = dateString.split(" ")[0];
    //Pour être sur que la première lettre est une majuscule
    dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

    /*Récupère l'index du jour de la semaine (paddingDays = jours qui appartiennent aux mois précédent de 1 jusqu'à paddingDays)*/
    let paddingDays = weekdays.indexOf(dateString);
    
    return paddingDays;
}