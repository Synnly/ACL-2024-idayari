import {DataTypes, Model} from "sequelize";

export default class User extends Model {
    // pour des méthodes/attributs (avec un nom différent des attributs définis en dessous)

    static initTable = (sequelize) => User.init(
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
            email: {
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
        {sequelize, timestamps: false, tableName: "Users"}
    );
}
