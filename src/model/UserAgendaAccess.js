import {DataTypes, Model} from "sequelize";

export default class UserAgendaAccess extends Model {

    static initTable = (sequelize) => UserAgendaAccess.init({
        idOwner: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE'
        },
    },
{sequelize, timestamps: false, tableName: "UserAgendaAccess"});
}