import indexView from "./views/index.js";

let currentId = 0;

function getNewId() { return ++currentId; }

export function index(req, res) { res.send(indexView()); }

export function getThread(req, res, next) {
    const id = req.params.threadId;
    const thread = forum.threads.find((thread) => thread.id == id);
    if (!thread) { next(createError(404)); } else { res.send(threadView(thread)); }
}