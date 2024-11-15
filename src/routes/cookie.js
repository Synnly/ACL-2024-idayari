import { createCookie } from "../token.js";

/**
 * Met à jour le cookie des agendas (utile si on doit le faire en étant coté client)
 * @param {object} req 
 * @param {object} res 
 */
export function updateAgendasCookie(req, res) {
    if (res.locals.user) {
        const agendas = res.locals.agendas;
        const new_agendas = req.body.agendas; // uniquement les displayed
        for (const agenda of Object.keys(new_agendas)) {
            agendas[agenda].displayed = new_agendas[agenda];
        }
        createCookie("agendas", agendas, res);
    }
    res.end();
}

export function updateViewCookies(req, res) {
    if (res.locals.user) {
        createCookie("currentView", req.body.viewType, res);
        createCookie("currentDateStart", req.body.start, res);
    }
    res.end();
}