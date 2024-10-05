import { Sequelize, DataTypes, Model } from "sequelize";

const user = 'mysql';
const host = "synnly.com:3306";
const pass = "RJ%292tN%27ejL%7BX-dCZyd1%25%3Co%28vZ%27Z%5Bd%28L2B4-%5ESQ%60O"; // Encodé
const dbname = "idayari";
const dialect = "mysql"
export const uri = `${dialect}://${user}:${pass}@${host}/${dbname}`;

const sequelize = new Sequelize(uri);

await sequelize.authenticate(); // Si connexion impossible le script quitte ici

class User extends Model {
    // pour des méthodes/attributs (avec un nom différent des attributs définis en dessous)
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
	type: DataTypes.STRING,
	unique: true,
    },
    email: {
	type: DataTypes.STRING,
	unique: true,
    },
    hashedPassword: {
	type: DataTypes.TEXT,
    },
  },
  // sequelize est un argument nécessaire
  // "timestamps: false" indique de ne pas créer des attributs 'createdAt' et 'updatedAt'
  // "tableName: "Users" indique le nom de la table dans la bdd
  { sequelize, timestamps: false, tableName: "Users" },
);

// synchronise avec la bdd, crée la table si elle n'existe pas encore
await User.sync();

/**
 * ATTENTION, APRES CETTE LIGNE IL EST IMPÉRATIF DE RECRÉER UNE INSTANCE DE
 * SEQUELIZE SANS QUOI LES FONCTIONS ET REQUÊTES NE FONCTIONNERONT PAS
 */
await sequelize.close();
