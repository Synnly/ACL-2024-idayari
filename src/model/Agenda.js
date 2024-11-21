import {DataTypes, Model} from "sequelize";

export default class Agenda extends Model {
    /**
     * Crée la table Agendas dans la base de données
     * @param sequelize L'instance **ouverte** de sequelize
     */
    static initTable = (sequelize) => Agenda.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            nom: {
                type: DataTypes.STRING,
            },
            estPartage: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {sequelize, timestamps: false, tableName: "Agendas"}
    );
    /* Accès aux fonctions suivantes :
     * getUsers() : retourne (une promesse) de tous les utilisateurs ayant accès à l'agenda
     * getMyAgendas() : retourne uniquement l'utilisateur qui a créé l'agenda
     * équivalent avec set/add...
     * 
     * A noter qu'un idOwner est ajouté à ce modèle (voir database.js)
    */
}