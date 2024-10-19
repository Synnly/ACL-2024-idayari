import {DataTypes, Model} from "sequelize";

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

    isAllDay() {
        return dateFin.getMilliseconds() == 999;
    }
}