import { DataTypes, Model } from "sequelize";
import sequelize from "../database.js";

export default class Token extends Model {

    /**
     * Crée la table Tokens dans la base de données
     * @param sequelize L'instance **ouverte** de sequelize
     */
    static initTable = (sequelize) =>{
        Token.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                string: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                expirationDate: {
                    type: DataTypes.DATE,
                    allowNull: false
                },
                salt: {
                    type: DataTypes.BIGINT,
                    allowNull: false
                }
            },
        {sequelize, timestamps: false, tableName: "Tokens"}
        );
    }

    /**
     * Vérifie si le token est toujours valide
     * @param tokenString Le token
     * @returns {Promise<boolean>} Vrai s'il existe et est encore valide, faux sinon
     */
    static async isValid(tokenString){
        const token = await Token.findOne({ where: {string: tokenString }});
        return token && token.expirationDate > Date.now();
    }

    /**
     * Supprime le token s'il n'est plus valide, ainsi que le cookie associé
     * @example await Token.checkValidity(req, res).then((valid) => (valid ? pageConnecté : index ou connection))
     * @param req La requete
     * @param res La reponse
     * @returns {Promise<boolean>} Faux s'il a été supprimé, vrai sinon
     */
    static async checkValidity(req, res){
        if(req.cookies.accessToken) {
            const token = await Token.findOne({where: {string: req.cookies.accessToken}});
            if(!token){ // Token pas trouvé
                res.clearCookie("accessToken");
                return false;
            }
            else if (token.expirationDate < Date.now()) {   // Token expiré
                await token.destroy();
                res.clearCookie("accessToken");
                return false;
            }
        }
        return true;
    }

    /**
     * Supprime le token de la base de données
     * @param tokenString Le token
     */
    static async deleteToken(tokenString){
        if(tokenString) {
            const token = await Token.findOne({where: {string: tokenString}});
            if (token) {
                await token.destroy();
            }
        }
    }
}