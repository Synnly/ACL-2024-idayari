import {DataTypes, Model} from "sequelize";

export default class UserAgendaAccess extends Model {

    static initTable = (sequelize) => UserAgendaAccess.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        idUser: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
                uniqueKey: 'idUser',
            },
            onDelete: 'CASCADE'
        },
        idAgenda: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Agendas',
                key: 'id',
                uniqueKey: 'idAgenda',
                constraints: false,
            },
            onDelete: 'CASCADE'
        },
        idOwner: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id',
                uniqueKey: 'idOwner',
            },
            onDelete: 'CASCADE'
        },
    },
{sequelize, timestamps: false, tableName: "UserAgendaAccess"});
}