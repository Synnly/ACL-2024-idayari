export function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function removeDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() - days);
    return result;
}

export function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
}

// quick addMonth and addYears functions, should use moment.js in the future
export function addMonths(date, months) {
    const result = new Date(date.getTime());
    const d = date.getDate();
    result.setMonth(result.getMonth() + months);
    if (result.getDate() != d) {
      result.setDate(0);
    }
    return result;
  }

export function addYears(date, years) {
    const result = new Date(date.getTime());
    result.setFullYear(result.getFullYear() + years);
    return result;
}

export function daysDiff(d1, d2) {
    // nombre de millisecondes en un jour
    const ONE_DAY = 1000 * 60 * 60 * 24;

    const differenceMs = Math.abs(d1 - d2);
    return differenceMs / ONE_DAY;

}

// on suppose que d1 <= d2
export function monthDiff(d1, d2) {
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months;
}

// on suppose que d1 <= d2
export function yearDiff(d1, d2) {
    return d2.getFullYear() - d1.getFullYear();
}


/*Pour passer du format Sat Nov 02 2024 15:14:00 GMT+0100 (heure normale d’Europe centrale)
au format 2024-11-02T15:14 pour insérer les dates par défaut dans la modale 
Utilisés dans modif_rendezvous-calendar*/
export function convertDate(date, withTime=true){
    let year = date.getFullYear();
    //PadStart(2,'0') : 2 = nb min de caratère, '0' = le caractère de remplissage qu'on ajoute 
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Mois (0-11)
    let day = String(date.getDate()).padStart(2, '0');

    if (withTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
        return `${year}-${month}-${day}`;
    }
}