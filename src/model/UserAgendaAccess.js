import {DataTypes, Model} from "sequelize";

export default class UserAgendaAccess extends Model {

    /**
     * Crée la table UserAgendaAccess dans la base de données
     * @param sequelize L'instance **ouverte** de sequelize
     */
    static initTable = (sequelize) => UserAgendaAccess.init(
        {
            statut: {
                type: DataTypes.ENUM("En attente", "Accepté", "Rejeté"),
                allowNull: true
            }
        },
        {sequelize, timestamps: false, tableName: "UserAgendaAccess"}
    );
}