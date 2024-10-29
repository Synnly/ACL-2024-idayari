export default class RendezVousSimple {
    constructor(id, titre, dateDebut, dateFin, idRendezVous, all_day, lieu, description,type) {
        this.id = id;
        this.titre = titre;
        this.dateDebut = dateDebut;
        this.dateFin = dateFin;
        this.rendezVous = idRendezVous;
        this.lieu = lieu;
        this.description = description;
        this.is_all_day = all_day;
        this.type = type;
    }
}