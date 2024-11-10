import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { authenticate } from "./token.js";
import { index } from './routes/index.js';
import { updateAgendasCookie } from './routes/cookie.js';
import {connexionGET, connexionPOST, deconnexion} from "./routes/connexion.js";
import {inscriptionGET, inscriptionPOST} from "./routes/inscription.js";
import {creationAgendaPOST} from "./routes/creationAgenda.js";
import {creationRendezVousPOST, supprimerRDVGET} from "./routes/rendezVous.js";
import {modifierInfosPersoGET, modifierInfosPersoPOST} from "./routes/modifierInfosPerso.js";
import { calendarGetData, modifierRendezVousCalendarPOST } from "./routes/calendar.js";
import {modifierAgendaGET, modifierAgendaPOST, supprimerAgendaDELETE} from './routes/modifierAgenda.js';

export const app = express();
app
    .set('views', fileURLToPath(new URL('./views', import.meta.url)))
    .set('view engine', 'ejs')

    // middlewares
    .use('/bootstrap', express.static(fileURLToPath(new URL('./node_modules/bootstrap/dist', import.meta.url))))
    .use('/ejs', express.static(fileURLToPath(new URL('./node_modules/ejs/', import.meta.url))))
    .use(express.static(fileURLToPath(new URL("./public", import.meta.url))))
    .use(cookieParser()) //Permet de gérer les cookies dans req.cookie
    .use(authenticate)
    .use(morgan("dev"))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))

    .get("/", index)
    
    .put("/setAgendasCookie", updateAgendasCookie)

    .post("/calendar-rdv",modifierRendezVousCalendarPOST)

    .get("/deconnexion", deconnexion)

    .get("/connexion", connexionGET)
    .post("/connexion", connexionPOST)

    .get("/inscription", inscriptionGET)
    .post("/inscription", inscriptionPOST)

    .post("/agenda/new", creationAgendaPOST)

    .get('/modifierAgendas', modifierAgendaGET)
    .post('/modifierAgendas', modifierAgendaPOST)

    .delete('/supprimerAgenda/:id', supprimerAgendaDELETE)
    .get('/supprimerRDV/:id', supprimerRDVGET)

    .post("/rendezvous/new", creationRendezVousPOST)

    .get('/infos_perso', modifierInfosPersoGET)
    .post('/infos_perso', modifierInfosPersoPOST)

    .get("/calendar-data/", calendarGetData)

    .use((req, res, next) => res.status(404).render('error', {message: "Cette page n'existe pas.", status: 404}))
    .use((err, req, res) => {
    res
        .status(err.status || 500)
        .render('error', {message: err.message || "Internal Error", status: err.status || 500});
});
