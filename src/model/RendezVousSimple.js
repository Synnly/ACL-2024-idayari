export default class RendezVousSimple {
    constructor(titre, dateDebut, dateFin, idRendezVous, all_day, lieu, description, agendas_id) {
        this.title = titre;
        this.start = dateDebut;
        this.end = dateFin;
        // l'attribut "id" sera pris
        this.groupId = idRendezVous;
        this.lieu = lieu;
        this.description = description;
        this.allDay = all_day;
        this.agendas = agendas_id;
    }
}