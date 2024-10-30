export default class RendezVousSimple {
    constructor(titre, dateDebut, dateFin, idRendezVous, all_day, lieu, description) {
        this.title = titre;
        this.start = dateDebut;
        this.end = dateFin;
        this.id = idRendezVous;
        this.lieu = lieu;
        this.description = description;
        this.allDay = all_day;
    }
}