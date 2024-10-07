import User from "./model/User.js";
import sequelize from "./database.js";

let currentId = 0;

function getNewId() { return ++currentId; }

export function index(req, res) { res.render("index"); }
export function inscriptionGET(req, res) { res.render("inscription", {errMsg:""}) }
export async function inscriptionPOST(req, res) {
    try {
        const usr = await User.create({
            username: req.body.user_username,
            email: req.body.user_email,
            hashedPassword: User.hashPassowrd(req.body.user_password)
        });
        res.redirect('/');
    }
    catch (e){
        if(e.name === "SequelizeUniqueConstraintError") {
            res.render('inscription',  {errMsg: "Un compte existe déjà avec cette combinaison username/email"})
        }
        else{
            res.redirect('inscription', 400);
        }
    }
}

export function getThread(req, res, next) {
    const id = req.params.threadId;
    const thread = forum.threads.find((thread) => thread.id == id);
    if (!thread) { next(createError(404)); } else { res.send(threadView(thread)); }
}