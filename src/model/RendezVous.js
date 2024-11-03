import {DataTypes, Model} from "sequelize";
import RendezVousSimple from "./RendezVousSimple.js";
import { addDays, addMonths, addYears, daysDiff, monthDiff, yearDiff} from "../date_utils.js";


function isAfterDateDebut(value) {
    if (value < this.dateDebut) {
        throw new Error("La date de fin doit être supérieur à la date de début.");
    }
}

function isAfterDateDebut2(value) {
    if (value < this.dateDebut) {
        throw new Error("La date de fin de récurrence doit être supérieur à la date de début.");
    }
}

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
                isAfterDateDebut 
            }
        },
        lieu: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.ENUM('Simple', 'Regular', 'Monthly', 'Yearly'),
            defaultValue: 'Simple',
            allowNull: false
        },
        frequence: {
            type: DataTypes.INTEGER
        },
        finRecurrence: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isAfterDateDebut2
            }
        }
    },
    {sequelize, timestamps: false, tableName: "RendezVous"});

    getDuree() {
        return this.dateFin - this.dateDebut;
    }

    is_all_day() {
        return this.dateFin.getMilliseconds() == 999;
    }

    create_rendezVousSimple(debut, fin, agendas_id) {
        return new RendezVousSimple(this.titre, debut, fin, this.id, this.is_all_day(), this.lieu, this.description, agendas_id);
    }

    // PAS DU TOUT TESTE
    async get_rendezVous(periodeDebut, periodeFin) {
        // si le rendezVous est après la période, pas besoin de regarder les récurrents
        if (this.dateDebut > periodeFin) {
            return [];
        }
        // on pourrait être plus lazy
        const agendas_id = [];
        if (this.type == 'Simple') {
            // s'il y a intersection (la condition sur la date de début est déjà vérifiée plus haut)
            if (this.dateFin >= periodeDebut) {
                return [this.create_rendezVousSimple(this.dateDebut, this.dateFin, agendas_id)]
            }
            return [];
        }
        // oui je pourrais faire des if-else classiques
        const add_function = this.type == 'Regular' ? addDays : (this.type == 'Monthly' ? addMonths : addYears);
        const diff_function = this.type == 'Regular' ? daysDiff : (this.type == 'Monthly' ? monthDiff : yearDiff);
        
        const res = [];
        let debut = this.dateDebut;
        let fin = this.dateFin;
        // le premier rendez vous récurrent ne rentre pas dans la période, au lieu de parcourir
        // tous les rendez vous récurrents qui ne rentreraient pas, on skip jusqu'au premier rendez-vous récurrent dans la période
        if (fin < periodeDebut) {
            const skip = Math.ceil(diff_function(fin, periodeDebut)/this.frequence) * this.frequence;
            fin = add_function(fin, skip);
            debut = add_function(debut, skip);
        }
        while ((!this.finRecurrence || debut <= this.finRecurrence) && debut < periodeFin) {
            res.push(this.create_rendezVousSimple(debut, fin, agendas_id));
            debut = add_function(debut, this.frequence);
            fin = add_function(fin, this.frequence);
        }
        return res;
    }
}