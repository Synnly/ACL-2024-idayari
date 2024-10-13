import { Sequelize } from "sequelize";
import User from "./model/User.js";
import Agenda from "./model/Agenda.js";
import UserAgendaAccess from "./model/UserAgendaAccess.js";
import RendezVous from "./model/RendezVous.js";
import AgendaRendezVous from "./model/AgendaRendezVous.js";

const user = "mysql";
const host = "synnly.com:3306";
const pass = "RJ%292tN%27ejL%7BX-dCZyd1%25%3Co%28vZ%27Z%5Bd%28L2B4-%5ESQ%60O"; // Encodé
const dbname = "idayari";
const dialect = "mysql";
export const uri = `${dialect}://${user}:${pass}@${host}/${dbname}`;

export const sequelize = new Sequelize(uri);

await sequelize.authenticate(); // Si connexion impossible le script quitte ici

// synchronise avec la bdd, crée la table si elle n'existe pas encore
User.initTable(sequelize);
Agenda.initTable(sequelize);
UserAgendaAccess.initTable(sequelize);
RendezVous.initTable(sequelize);
AgendaRendezVous.initTable(sequelize);

User.belongsToMany(Agenda, {through: UserAgendaAccess, foreignKey: "idAgenda"});
Agenda.belongsToMany(User, {through: UserAgendaAccess, foreignKey: "idUser"});

Agenda.belongsToMany(RendezVous, {through: AgendaRendezVous, foreignKey: "idAgenda"});
RendezVous.belongsToMany(Agenda, {through: AgendaRendezVous, foreignKey: "idRendezVous"});
// Nettoyage de la BD.
// Oui c'est débile mais pour une raison qui m'échappe ni
// sequelize.drop() ni sequelize.dropAllSchemas() fonctionne ¯\_(ツ)_/¯

// await UserAgendaAccess.drop();
// await User.drop();
// await Agenda.drop();

// si on a des modifications de la structure des tables
// await User.sync({alter: true});
// await Agenda.sync({alter: true});
// await UserAgendaAccess.sync({alter: true});
// await RendezVous.sync({alter: true});
// await AgendaRendezVous.sync({force: true});

export default sequelize;
