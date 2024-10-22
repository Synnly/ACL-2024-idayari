import express from 'express';
import createError from 'http-errors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { authenticate } from "./token.js";
import {index, modifierRendezVousPOST} from "./routes/index.js";
import {connexionGET, connexionPOST, deconnexion} from "./routes/connexion.js";
import {inscriptionGET, inscriptionPOST} from "./routes/inscription.js";
import {creationAgendaPOST} from "./routes/creationAgenda.js";
import {creationRendezVousGET, creationRendezVousPOST} from "./routes/rendezVous.js";
import {modifierInfosPersoGET, modifierInfosPersoPOST} from "./routes/modifierInfosPerso.js";

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
    .get("/", index)
    .post("/",modifierRendezVousPOST)

    .get("/deconnexion", deconnexion)

    .get("/connexion", connexionGET)
    .post("/connexion", connexionPOST)

    .get("/inscription", inscriptionGET)
    .post("/inscription", inscriptionPOST)

    .post("/agenda/new", creationAgendaPOST)

    .get("/rendezvous/new", creationRendezVousGET)
    .post("/rendezvous/new", creationRendezVousPOST)

    .get('/infos_perso', modifierInfosPersoGET)
    .post('/infos_perso', modifierInfosPersoPOST)

    .use((req, res, next) => next(createError(404)))
    .use((err, req, res, next) => {
    res
        .status(err.status || 500)
        .send(`<h1>${err.message || "Internal error"}</h1>`);
});
