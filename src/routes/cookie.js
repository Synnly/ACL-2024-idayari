import { createCookie } from "../token.js";

/**
 * Met à jour le cookie des agendas (utile si on doit le faire en étant coté client)
 * @param {object} req 
 * @param {object} res 
 */
export function updateAgendasCookie(req, res) {
    if (res.locals.user) {
        createCookie("agendas", req.body.agendas, res);
    }
    res.end();
}