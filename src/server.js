import { createServer } from "http";
import { app } from "./app.js";

const server = createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server launched on port ${PORT}`));