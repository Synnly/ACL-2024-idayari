import {DataTypes, Model} from "sequelize";
import RendezVousSimple from "./RendezVousSimple.js";
import { addDays, addMonths, addYears, daysDiff, monthDiff, yearDiff} from "../public/js/utils.js";

export default class RendezVous extends Model {
    /**
     * Crée la table RendezVous dans la base de données
     * @param sequelize L'instance **ouverte** de sequelize
     */
    static initTable = (sequelize) => RendezVous.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        titre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT
        },
        dateDebut: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        dateFin: {
            type: DataTypes.DATE,
            allowNull: false
        },
        allDay: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        lieu: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.ENUM('Simple', 'Daily', 'Weekly', 'Monthly', 'Yearly'),
            defaultValue: 'Simple',
            allowNull: false
        },
        frequence: {
            type: DataTypes.INTEGER
        },
        finRecurrence: {
            type: DataTypes.DATE,
            allowNull: true
        },
        nbOccurrences: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        idAgenda: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {sequelize, timestamps: false, tableName: "RendezVous"});

    is_recurrent() {
        return this.type != 'Simple';
    }

    fin_par_date() {
        return this.finRecurrence != null;
    }

    fin_par_nb_occurrences() {
        return this.nbOccurrences != null;
    }

    getDuree() {
        return this.dateFin - this.dateDebut;
    }

    create_rendezVousSimple(debut, fin) {
        return new RendezVousSimple(this.titre, debut, fin, this.id, this.allDay, this.lieu, this.description,
                                    this.type, this.finRecurrence);
    }

    get_rendezVous(periodeDebut, periodeFin) {
        // si le rendezVous est après la période, pas besoin de regarder les récurrents
        if (this.dateDebut >= periodeFin) {
            return [];
        }
        if (this.type == 'Simple') {
            // s'il y a intersection (la condition sur la date de début est déjà vérifiée plus haut)
            if (this.dateFin > periodeDebut) {
                return [this.create_rendezVousSimple(this.dateDebut, this.dateFin)]
            }
            return [];
        }
        // oui je pourrais faire des if-else classiques
        const add_function = this.type == 'Daily' || this.type == 'Weekly' ? addDays : (this.type == 'Monthly' ? addMonths : addYears);
        const diff_function = this.type == 'Daily' || this.type == 'Weekly' ? daysDiff : (this.type == 'Monthly' ? monthDiff : yearDiff);
        
        let finRec = null;
        const frequence = this.type == 'Weekly' ? this.frequence * 7 : this.frequence;
        if (this.fin_par_nb_occurrences()) {
            finRec = add_function(this.dateDebut, (this.nbOccurrences-1) * frequence);
            finRec.setHours(23, 59, 59);
        }
        if (this.fin_par_date()) {
            finRec = this.finRecurrence;
        }
            
        const res = [];
        let debut = this.dateDebut;
        let fin = this.dateFin;
        // le premier rendez vous récurrent ne rentre pas dans la période, au lieu de parcourir
        // tous les rendez vous récurrents qui ne rentreraient pas, on skip jusqu'au premier rendez-vous récurrent dans la période
        if (fin <= periodeDebut) {
            let diff = Math.ceil(diff_function(fin, periodeDebut)/frequence);
            // le skip était de 0 car la différence n'était assez pas significative
            // ex fin = 12-Nov, periodeDebut = 24-Nov avec une fréquence mensuelle
            // la différence mensuelle est nulle (même mois) mais fin est toujours en arrière
            if (diff == 0) {
                diff = 1;
            }
            const skip = diff * frequence;
            fin = add_function(fin, skip);
            debut = add_function(debut, skip);
        }
        while ((!finRec || debut < finRec) && debut < periodeFin) {
            res.push(this.create_rendezVousSimple(debut, fin));
            debut = add_function(debut, frequence);
            fin = add_function(fin, frequence);
        }
        return res;
    }
}