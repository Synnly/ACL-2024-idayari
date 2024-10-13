import {DataTypes, Model} from "sequelize";

export default class RendezVous extends Model {

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
            validate: {
                isAfterNow(value) {
                    if (value <= Date.now()) {
                        throw new Error("La date de début doit être supérieur à la date d'aujourd'hui.");
                    }
                }
            }
        },
        dateFin: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
               isAfterDateDebut(value) {
                    if (value <= this.dateDebut) {
                        throw new Error("La date de fin doit être supérieur à la date de début.");
                    }
                } 
            }
        },
        lieu: {
            type: DataTypes.STRING
        }
    },
    {sequelize, timestamps: false, tableName: "RendezVous"});
}