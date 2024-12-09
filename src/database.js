import { Sequelize } from "sequelize";
import User from "./model/User.js";
import Agenda from "./model/Agenda.js";
import UserAgendaAccess from "./model/UserAgendaAccess.js";
import RendezVous from "./model/RendezVous.js";

/**
 * Initialise la base de données
 * @returns une promesse
 */
export async function initDatabase() {
    const user = "mysql";
    const host = "synnly.com:3306";
    const pass = "RJ%292tN%27ejL%7BX-dCZyd1%25%3Co%28vZ%27Z%5Bd%28L2B4-%5ESQ%60O"; // Encodé
    const dbname = "idayari";
    const dialect = "mysql";
    const uri = `${dialect}://${user}:${pass}@${host}/${dbname}`;
    const sequelize = new Sequelize(uri, {logging: false});

    return sequelize.authenticate().then(_ => {
        initTables(sequelize);
        // si modification de la base de données, décommenter puis commenter
        // syncTables();
    });
}

/**
 * initialise les tables et les classes Modèle
 * @param {Sequelize} sequelize l'instance de Sequelize spécifique la base de données
 */
function initTables(sequelize) {
    // synchronise avec la bdd, crée la table si elle n'existe pas encore
    User.initTable(sequelize);
    Agenda.initTable(sequelize);
    UserAgendaAccess.initTable(sequelize);
    RendezVous.initTable(sequelize);

    // répertorie qui peut voir quel agenda *uniquement*
    User.belongsToMany(Agenda, {through: UserAgendaAccess, foreignKey: "idUser", onDelete: 'CASCADE'});
    Agenda.belongsToMany(User, {through: UserAgendaAccess, foreignKey: "idAgenda", onDelete: 'CASCADE'});

    // répertorie qui possède quel agenda
    // ajoute un champ idOwner à Agendas
    Agenda.belongsTo(User, { as: "owner", foreignKey: "idOwner", onDelete: 'CASCADE'});
    User.hasMany(Agenda, { as: "myAgendas", foreignKey: "idOwner", onDelete: 'CASCADE'});

    Agenda.hasMany(RendezVous, { as:"agenda", foreignKey: "idAgenda", onDelete: 'CASCADE'});
    RendezVous.belongsTo(Agenda, { foreignKey: "idAgenda", onDelete: 'CASCADE'});

    RendezVous.hasMany(RendezVous, { as: "instances", foreignKey: "idParent", onDelete: 'CASCADE' });
    RendezVous.belongsTo(RendezVous, { foreignKey: "idParent", onDelete: 'CASCADE'});
}

/**
 * Synchronise les tables
 */
async function syncTables() {
    await User.sync({alter: true});
    await Agenda.sync({alter: true});
    await UserAgendaAccess.sync({alter: true});
    await RendezVous.sync({alter: true});
}
