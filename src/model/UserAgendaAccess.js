import {DataTypes, Model} from "sequelize";

export default class UserAgendaAccess extends Model {

    static initTable = (sequelize) => UserAgendaAccess.init(
        {},
        {sequelize, timestamps: false, tableName: "UserAgendaAccess"}
    );
}