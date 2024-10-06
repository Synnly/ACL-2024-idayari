import { Sequelize } from "sequelize";
import User from "./model/User.js";

const user = 'mysql';
const host = "synnly.com:3306";
const pass = "RJ%292tN%27ejL%7BX-dCZyd1%25%3Co%28vZ%27Z%5Bd%28L2B4-%5ESQ%60O"; // Encodé
const dbname = "idayari";
const dialect = "mysql"
export const uri = `${dialect}://${user}:${pass}@${host}/${dbname}`;

export const sequelize = new Sequelize(uri);

await sequelize.authenticate(); // Si connexion impossible le script quitte ici

// synchronise avec la bdd, crée la table si elle n'existe pas encore
await User.initTable(sequelize);
await User.sync();

export default sequelize;