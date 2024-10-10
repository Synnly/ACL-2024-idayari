import * as routes from "./routes.js";
import express from "express";
import createError from "http-errors";
import morgan from "morgan";
import { fileURLToPath } from "url"

export const app = express();

app.set("views", fileURLToPath(new URL("./views", import.meta.url)));
app.set("view engine", "ejs");

app
    .use(morgan("dev"))
    .use(express.static(fileURLToPath(new URL("./public", import.meta.url))))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .get("/", routes.index)
    .get("/infos_perso", routes.modifierInfosPersoGET)
    .post("/infos_perso", routes.modifierInfosPersoPOST)
    .get("/inscription", routes.inscriptionGET)
    .post("/inscription", routes.inscriptionPOST)
    .get("/threads/:threadId/", routes.getThread)
    .use((req, res, next) => next(createError(404)))
    .use((err, req, res, next) => {
        res.status(err.status || 500).send(`<h1>${err.message || "Internal error"}</h1>`);
    });