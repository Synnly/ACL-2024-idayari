import { DataTypes, Model } from "sequelize";
import crypto from "crypto";

export default class User extends Model {
    /**
     * Crée la table Users dans la base de données
     * @param sequelize L'instance **ouverte** de sequelize
     */
    static initTable = (sequelize) =>
        User.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                username: {
                    type: DataTypes.STRING,
                    unique: true,
                },
                hashedPassword: {
                    type: DataTypes.TEXT,
                },
            },
            // sequelize est un argument nécessaire
            // "timestamps: false" indique de ne pas créer des attributs 'createdAt' et 'updatedAt'
            // "tableName: "Users" indique le nom de la table dans la bdd
            { sequelize, timestamps: false, tableName: "Users" }
        );

    /* Accès aux fonctions suivantes :
      * getAgendas() : retourne (une promesse) de tous les agendas qui l'utilisateur peut voir
                      (inclut les agendas partagés)
      * getMyAgendas() : retourne uniquement les agendas créés par cet utilisateur
      * équivalent avec set/add...
    */

    /**
     * Hache le mot de passe avec SHA265
     * @param password Le mot de passe
     * @returns {string} Le haché en hexadécimal
     */
    static hashPassowrd (password) {
        return crypto.createHash("sha256").update(password).digest("hex");
    }
    static async getById(id){
        return User.findOne({where: { id: id }});
    };
}
