import {DataTypes, Model} from "sequelize";

export default class Agenda extends Model {

    static initTable = (sequelize) => Agenda.init({
        idUser: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        nom: {
            type: DataTypes.STRING,
            unique: true,
            primaryKey: true,
        },
    },
    {sequelize, timestamps: false, tableName: "Agendas"});
}