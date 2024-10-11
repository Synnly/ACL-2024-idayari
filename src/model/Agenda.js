import {DataTypes, Model} from "sequelize";

export default class Agenda extends Model {

    static initTable = (sequelize) => Agenda.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nom: {
            type: DataTypes.STRING,
        },
    },
    {sequelize, timestamps: false, tableName: "Agendas"});
}