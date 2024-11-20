import { createServer } from "http";
import { app } from "./app.js";
import { initDatabase } from "./database.js";
import dotenv from "dotenv";


dotenv.config(); // Récupère et parse le fichier .env pour récupérer clé SECRET
const server = createServer(app);
const PORT = 3000;

initDatabase()
    .then(_ => {
        server.listen(PORT, () => console.log(`Server launched on port ${PORT}`));
    }).catch(error => console.log(`ERREUR INITIALISATION BASE DE DONNEES: ${error}`))
