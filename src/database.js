import { Sequelize } from "sequelize";
import User from "./model/User.js";
import Agenda from "./model/Agenda.js";
import UserAgendaAccess from "./model/UserAgendaAccess.js";
import RendezVous from "./model/RendezVous.js";
import AgendaRendezVous from "./model/AgendaRendezVous.js";
import Token from "./model/Token.js";

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
Token.initTable(sequelize);

// répertorie qui peut voir quel agenda *uniquement*
User.belongsToMany(Agenda, {through: UserAgendaAccess, foreignKey: "idUser"});
Agenda.belongsToMany(User, {through: UserAgendaAccess, foreignKey: "idAgenda"});

// répertorie qui possède quel agenda
// ajoute un champ idOwner à Agendas
Agenda.belongsTo(User, { as: "owner", foreignKey: "idOwner"});
User.hasMany(Agenda, { as: "myAgendas", foreignKey: "idOwner" });

// répertorie les agendas et rendez-vous
Agenda.belongsToMany(RendezVous, {through: AgendaRendezVous, foreignKey: "idAgenda"});
RendezVous.belongsToMany(Agenda, {through: AgendaRendezVous, foreignKey: "idRendezVous"});

// Cookies et leur propriétaire
Token.belongsTo(User, {as: "owner", foreignKey: "idOwner"});
User.hasMany(Token, {as: "myTokens", foreignKey: "idOwner"});

// Nettoyage de la BD.
// Oui c'est débile mais pour une raison qui m'échappe ni
// sequelize.drop() ni sequelize.dropAllSchemas() fonctionne ¯\_(ツ)_/¯

// await UserAgendaAccess.drop();
// await User.drop();
// await Agenda.drop();
// await Token.drop();

// si on a des modifications de la structure des tables
// await User.sync({alter: true});
// await Agenda.sync({alter: true});
// await UserAgendaAccess.sync({force: true});
// await RendezVous.sync({alter: true});
// await AgendaRendezVous.sync({force: true});
// await Token.sync({alter: true});

export default sequelize;
