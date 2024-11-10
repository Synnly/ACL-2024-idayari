import { createCookie } from "../token.js";

export function updateAgendasCookie(req, res) {
    if (res.locals.user) {
        createCookie("agendas", req.body.agendas, res);
    }
    res.end();
}