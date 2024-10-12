import { Sequelize } from "sequelize";
import User from "./model/User.js";
import Agenda from "./model/Agenda.js";
import UserAgendaAccess from "./model/UserAgendaAccess.js";

const user = 'mysql';
const host = "synnly.com:3306";
const pass = "RJ%292tN%27ejL%7BX-dCZyd1%25%3Co%28vZ%27Z%5Bd%28L2B4-%5ESQ%60O"; // Encodé
const dbname = "idayari";
const dialect = "mysql"
export const uri = `${dialect}://${user}:${pass}@${host}/${dbname}`;

export const sequelize = new Sequelize(uri);

await sequelize.authenticate(); // Si connexion impossible le script quitte ici

// Nettoyage de la BD.
// Oui c'est débile mais pour une raison qui m'échappe ni
// sequelize.drop() ni sequelize.dropAllSchemas() fonctionne ¯\_(ツ)_/¯
// await User.initTable(sequelize);
// await Agenda.initTable(sequelize);
// await UserAgendaAccess.initTable(sequelize);

// await UserAgendaAccess.drop();
// await User.drop();
// await Agenda.drop();

// synchronise avec la bdd, crée la table si elle n'existe pas encore
await User.initTable(sequelize);
await Agenda.initTable(sequelize);
await UserAgendaAccess.initTable(sequelize);

await User.sync({alter: true});
await Agenda.sync({alter: true});
await UserAgendaAccess.sync({alter: true});

export default sequelize;