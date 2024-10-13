import {DataTypes, Model} from "sequelize";

export default class AgendaRendezVous extends Model {

    static initTable = (sequelize) => AgendaRendezVous.init(
        // tout est créé par les fonctions belongsTomany() dans database.js
        {},
        {sequelize, timestamps: false, tableName: "AgendaRendezVous"}
    );
}