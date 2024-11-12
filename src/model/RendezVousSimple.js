export default class RendezVousSimple {
    constructor(titre, dateDebut, dateFin, idRendezVous, idAgenda, all_day, lieu, description, 
                type, dateFinRec, nbOccur, freq) {
        this.title = titre;
        this.start = dateDebut;
        this.end = dateFin;
        this.allDay = all_day;
        this.groupId = idRendezVous;
        this.idAgenda = idAgenda;
        this.lieu = lieu;
        this.description = description;
        this.allDay = all_day;
        this.type = type;
        this.endRec = dateFinRec;
        this.nbOccurrences = nbOccur;
        this.frequence = freq;
    }

    est_recurrent() {
        return this.type != 'Simple';
    }
}