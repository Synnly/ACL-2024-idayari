import * as routes from "./routes.js";
import express from "express";
import createError from "http-errors";
import morgan from "morgan";
import { fileURLToPath } from "url"

export const app = express();
app
    .use(morgan("dev"))
    .use(express.static(fileURLToPath(new URL("./public", import.meta.url))))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .get("/", routes.index)
    .get("/threads/:threadId/", routes.getThread)
    .use((req, res, next) => next(createError(404)))
    .use((err, req, res, next) => {
        res.status(err.status || 500).send(`<h1>${err.message || "Internal error"}</h1>`);
    });