import { Sequelize } from "sequelize";

const user = 'mysql';
const host = "synnly.com:3306";
const pass = "RJ%292tN%27ejL%7BX-dCZyd1%25%3Co%28vZ%27Z%5Bd%28L2B4-%5ESQ%60O"; // Encodé
const dbname = "testJs";
const dialect = "mysql"
export const uri = `${dialect}://${user}:${pass}@${host}/${dbname}`;

const sequelize = new Sequelize(uri)

await sequelize.authenticate(); // Si connexion impossible le script quitte ici

// Suppression des tables
await sequelize.drop();

/**
 * ATTENTION, APRES CETTE LIGNE IL EST IMPÉRATIF DE RECRÉER UNE INSTANCE DE
 * SEQUELIZE SANS QUOI LES FONCTIONS ET REQUÊTES NE FONCTIONNERONT PAS
 */
await sequelize.close()