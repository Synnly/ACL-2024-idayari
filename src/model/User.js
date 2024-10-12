import { DataTypes, Model } from "sequelize";
import crypto from "crypto";

export default class User extends Model {
  // pour des méthodes/attributs (avec un nom différent des attributs définis en dessous)

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
  /**
   * Hache le mot de passe avec SHA265
   * @param password Le mot de passe
   * @returns {string} Le haché en hexadécimal
   */
  static hashPassowrd = (password) => {
    return crypto.createHash("sha256").update(password).digest("hex");
  };
}
