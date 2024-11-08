import { createServer } from "http";
import { app } from "./app.js";
import { initDatabase } from "./database.js";

const server = createServer(app);
const PORT = 3000;

initDatabase()
    .then(_ => {
        server.listen(PORT, () => console.log(`Server launched on port ${PORT}`));
    }).catch(error => console.log(`ERREUR INITIALISATION BASE DE DONNEES: ${error}`))
