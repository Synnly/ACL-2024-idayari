import {DataTypes, Model} from "sequelize";

export default class AgendaRendezVous extends Model {

    /**
     * Crée la table AgendaRendezVous dans la base de données
     * @param sequelize L'instance **ouverte** de sequelize
     */
    static initTable = (sequelize) => AgendaRendezVous.init(
        // tout est créé par les fonctions belongsTomany() dans database.js
        {},
        {sequelize, timestamps: false, tableName: "AgendaRendezVous"}
    );
}