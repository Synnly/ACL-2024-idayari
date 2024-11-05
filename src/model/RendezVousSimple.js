export default class RendezVousSimple {
    constructor(titre, dateDebut, dateFin, idRendezVous, all_day, lieu, description, 
                est_recurrent, dateFinRec) {
        this.title = titre;
        this.start = dateDebut;
        this.end = dateFin;
        this.groupId = idRendezVous;
        this.lieu = lieu;
        this.description = description;
        this.allDay = all_day;
        this.type = est_recurrent;
        this.dateFinRecurrence = dateFinRec;
    }

    est_recurrent() {
        return this.type != 'Simple';
    }
}