import * as routes from './routes.js';
import express from 'express';
import createError from 'http-errors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { authenticate } from "./token.js";

export const app = express();

app.set('views', fileURLToPath(new URL('./views', import.meta.url)));
app.set('view engine', 'ejs');

app
    .use(cookieParser()) //Permet de gérer les cookies dans req.cookie
    .use(authenticate)
    .use(morgan("dev"))
    .use(express.static(fileURLToPath(new URL("./public", import.meta.url))))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .get("/", routes.index)

    .get("/deconnexion", routes.deconnexion)

    .get("/connexion", routes.connexionGET)
    .post("/connexion", routes.connexionPOST)

    .get("/inscription", routes.inscriptionGET)
    .post("/inscription", routes.inscriptionPOST)

    .get("/creerAgenda", routes.creationAgendaGET)
    .post("/creerAgenda", routes.creationAgendaPOST)

    .get("/rendezvous/new", routes.creationRendezVousGET)
    .post("/rendezvous/new", routes.creationRendezVousPOST)

    .get('/infos_perso', routes.modifierInfosPersoGET)
    .post('/infos_perso', routes.modifierInfosPersoPOST)

    .use((req, res, next) => next(createError(404)))
    .use((err, req, res, next) => {
    res
        .status(err.status || 500)
        .send(`<h1>${err.message || "Internal error"}</h1>`);
});
