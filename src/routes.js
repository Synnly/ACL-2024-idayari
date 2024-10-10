import User from "./model/User.js";
import sequelize from "./database.js";

let currentId = 0;

function getNewId() { return ++currentId; }

export function index(req, res) { res.render("index"); }
export function modifierInfosPersoGET(req, res) {
     res.render("infos_perso", {errMsg:""});
}
export async function modifierInfosPersoPOST(req, res){
    try {
            const user = await User.findOne({
            where : {
                username: req.body.user_username_change_info
            }
        })
        if (user) {
            res.render('infos_perso', { errMsg: "Vous ne pouvez pas chosir cet username !" });
        }
        else {
            const username = req.body.user_username_change_info;
            const password = req.body.user_password_change_info;
            const lastUsername = "Mettre l'ancien username ici"
            if(username !== '' || password !== ''){
                let data = {};
                if(username !== ''){
                    data.username = username;
                }
                if(password !== ''){
                    data.password = password;
                }
            //     if(Object.keys(data).length > 0){ Me manque les infos du compte connecté
            //         await User.update(data, {
            //             where: {
            //                 username : lastUsername
            //             }
            //         });
            //     }
            }
            res.render('infos_perso', { errMsg: "Les modifications se sont bien effectuées" });
        }
    }catch (e){
        res.render('infos_perso', { errMsg: "erreur" + e });
    }
}

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