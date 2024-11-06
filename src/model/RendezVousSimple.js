export default class RendezVousSimple {
    constructor(titre, dateDebut, dateFin, idRendezVous, all_day, lieu, description, 
                type, dateFinRec, nbOccur, freq) {
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
        this.nbOccurrences = nbOccur;
        this.frequence = freq;
    }

    est_recurrent() {
        return this.type != 'Simple';
    }
}