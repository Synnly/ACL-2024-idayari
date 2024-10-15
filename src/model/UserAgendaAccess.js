import {DataTypes, Model} from "sequelize";

export default class UserAgendaAccess extends Model {

    /**
     * Crée la table UserAgendaAccess dans la base de données
     * @param sequelize L'instance **ouverte** de sequelize
     */
    static initTable = (sequelize) => UserAgendaAccess.init(
        {},
        {sequelize, timestamps: false, tableName: "UserAgendaAccess"}
    );
}