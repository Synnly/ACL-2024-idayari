export default class RendezVousSimple {
    constructor(titre, dateDebut, dateFin, idRendezVous, all_day, lieu, description, 
                type, dateFinRec) {
        this.title = titre;
        this.start = dateDebut;
        this.end = dateFin;
        this.allDay = all_day;
        this.groupId = idRendezVous;
        this.lieu = lieu;
        this.description = description;
        this.allDay = all_day;
        this.type = type;
        this.dateFinRecurrence = dateFinRec;
    }

    est_recurrent() {
        return this.type != 'Simple';
    }
}