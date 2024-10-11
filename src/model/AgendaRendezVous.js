import {DataTypes, Model} from "sequelize";

export default class AgendaRendezVous extends Model {

    static initTable = (sequelize) => AgendaRendezVous.init({
        idAgenda: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Agendas',
                key: 'id',
                uniqueKey: 'idAgenda',
            },
            onDelete: 'CASCADE'
        },
        idRendezVous: {
            type: DataTypes.INTEGER,
            references: {
                model: 'RendezVous',
                key: 'id',
                uniqueKey: 'idRendezVous',
            },
            onDelete: 'CASCADE'
        },
    },
{sequelize, timestamps: false, tableName: "AgendaRendezVous"});
}