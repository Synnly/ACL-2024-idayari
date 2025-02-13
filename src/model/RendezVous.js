import {DataTypes, Model} from "sequelize";
import {addDays, addMonths, addYears, daysDiff, monthDiff, yearDiff} from "../public/js/utils.js";

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
            allowNull: false,
            validate: {
                dateFinIsAfterDateDebut() {
                  if (this.dateFin <= this.dateDebut) {
                    throw new Error(`La date de fin doit être supérieure à la date de début (début : ${this.dateDebut}, fin : ${this.dateFin})`);
                  }
                }
            }
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
            allowNull: false,
            validate : {
                notSimpleTypeImpliesNotNullFrequence(value){
                    if ((this.frequence === null) && (value !== 'Simple')) {
                        throw new Error(`les rdvs non Simple ont une fréquence non null (frequence : ${this.frequence},type : ${value}) `);
                    }
                }
            }
        },
        frequence: {
            type: DataTypes.INTEGER,
            validate: {
                frequenceValidator(value){
                    if ((value !== null) && value < 1) {
                        throw new Error(`La fréquence doit être supérieur à 1 (frequence : ${value})`);
                    }
                }
            },
        },
        finRecurrence: {
            type: DataTypes.DATE,
            allowNull: true
        },
        nbOccurrences: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                nbOccurrencesValidator(value){
                    if ((value !==null) && value < 0)  {
                        throw new Error(`nbOccurrence doit être supérieur à 0 (nbOccurrences : ${value})`);
                    }
                }
            },
        },
        idAgenda: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        color: {
            type: DataTypes.CHAR,
            allowNull: false,
            defaultValue: "3788d8",
        },
        idParent: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        dateDebutDansParent: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {sequelize, timestamps: false, tableName: "RendezVous"});

    fin_par_date() {
        return this.finRecurrence != null;
    }

    fin_par_nb_occurrences() {
        return this.nbOccurrences != null;
    }

    rendez_vous_donnees(dates) {
        return {title :this.titre, 
                groupId: this.id,
                agenda: this.idAgenda.toString(),
                allDay: this.allDay,
                lieu: this.lieu,
                description: this.description,
                type: this.type,
                endRec: this.finRecurrence != null ? this.finRecurrence.valueOf() : this.finRecurrence,
                nbOccurrences: this.nbOccurrences,
                frequence: this.frequence,
                dates: dates,
                color: '#'+this.color,
                idParent: this.idParent,
                dateDebutDansParent: this.dateDebutDansParent != null ? this.dateDebutDansParent.valueOf() : this.dateDebutDansParent
             };
    }

    get_rendezVous(periodeDebut, periodeFin, excluded_dates) {
        // si le rendezVous est après la période, pas besoin de regarder les récurrents
        if (this.dateDebut >= periodeFin || this.deleted) {
            return null;
        }
        if (this.type == 'Simple' || this.idParent) {
            // s'il y a intersection (la condition sur la date de début est déjà vérifiée plus haut)
            if (this.dateFin > periodeDebut) {
                return this.rendez_vous_donnees([{start: this.dateDebut.valueOf(), end: this.dateFin.valueOf()}]);
            }
            return null;
        }
        // oui je pourrais faire des if-else classiques
        const add_function = this.type == 'Daily' || this.type == 'Weekly' ? addDays : (this.type == 'Monthly' ? addMonths : addYears);
        const diff_function = this.type == 'Daily' || this.type == 'Weekly' ? daysDiff : (this.type == 'Monthly' ? monthDiff : yearDiff);
        
        let finRec = null;
        const frequence = this.type == 'Weekly' ? this.frequence * 7 : this.frequence;
        if (this.fin_par_nb_occurrences()) {
            finRec = add_function(this.dateDebut, (this.nbOccurrences-1) * frequence);
            // on décale d'un peu car exclusif
            finRec.setHours(finRec.getHours() + 1);
        }
        if (this.fin_par_date()) {
            finRec = this.finRecurrence;
        }
            
        const dates = [];
        let debut = this.dateDebut;
        let fin = this.dateFin;
        const duree = fin.valueOf() - debut.valueOf();
        let iter = 0;
        // le premier rendez vous récurrent ne rentre pas dans la période, au lieu de parcourir
        // tous les rendez vous récurrents qui ne rentreraient pas, on skip jusqu'au premier rendez-vous récurrent dans la période
        if (fin <= periodeDebut) {
            // si le skip est de 0 la différence n'est assez pas significative
            // ex fin = 12-Nov, periodeDebut = 24-Nov avec une fréquence mensuelle
            // la différence mensuelle est nulle (même mois) mais fin est toujours en arrière
            iter = Math.max(1, Math.ceil(diff_function(fin, periodeDebut) / frequence));
            fin = add_function(fin, iter * frequence);
            debut = add_function(debut, iter * frequence);
        }
        while ((!finRec || debut < finRec) && debut < periodeFin) {
            if (excluded_dates == undefined || !excluded_dates.has(debut.valueOf())) {
                dates.push({start: debut.valueOf(), end: fin.valueOf()});
            }
            iter++;
            fin = add_function(this.dateFin, iter * frequence);
            debut = add_function(this.dateDebut, iter * frequence);
        }
        return this.rendez_vous_donnees(dates);
    }
}