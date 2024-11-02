import Agenda from "../model/Agenda.js";
import RendezVous from "../model/RendezVous.js";
import { getBeginingDay,getEndDay } from "../public/js/utils.js";

/*Direction vers la page calendar */
export function calendarGet(req, res) {
    if (res.locals.user) {
        return res.render("calendar");
    }
    return res.redirect("/");
}

function extractAttributes(obj) {
    return [obj.start, obj.id];
  }
  
  function uniqueArrayByAttributes(arr) {
    return arr.reduce((accumulator, current) => {
      const attributes = extractAttributes(current);
      if (!accumulator.some(item => JSON.stringify(extractAttributes(item)) === JSON.stringify(attributes))) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);
  }

/*Fonction gère et renvoie les Agendas séléctionnés et les rdvs selon l'année, le mois et les agendas choisis
Les paramètre dans la requête sont optionnels et comblés par la fonction si besoin */
export async function calendarGetData(req, res) {
    if (!res.locals.user) {
        return res.redirect("/");
    }

    /*Gestion des intervalles de rdvs à récupérés selon les semaines affichable dans un mois */
    let paramMonth = req.query?.month;
    let paramYear = req.query?.year;
    let aujourdhui = new Date();
    if (!paramMonth) {
        paramMonth = aujourdhui.getMonth() + 1; //Car renvoi mois entre 0 et 11
    }
    if (!paramYear) {
        paramYear = aujourdhui.getFullYear();
    }
   
    let interval = getIntervalle(new Date(paramYear, paramMonth - 2, 2),new Date(paramYear, paramMonth, 2));

    // Premier jour visible du mois (selon année et mois choisi) : peut appartenir au mois précédent
    const firstDate = interval.debut;
    // Dernier jour visibles du mois (selon année et mois choisi) : peut appartenir au mois suivant
    const lastDate = interval.fin;

    //Récupération des agendas de l'utilisateur
    let tabAgenda = JSON.parse(decodeURIComponent(req.query.selectionnes));
    if (tabAgenda) {
        if (! (tabAgenda instanceof Object)) {
            tabAgenda = [tabAgenda];
        }
        tabAgenda = await Promise.all(tabAgenda.map(e => Agenda.findOne({ where: {id : +e}})));
    }
    //Récupération de tout les rdvs des agendas sélectionnés
    const rendezVous = await Promise.all(tabAgenda.map(e => e.getRendezVous()));
    const rendezVousSimple = uniqueArrayByAttributes(rendezVous.flat().map(e => e.get_rendezVous(firstDate, lastDate)).flat());
    //Données à renvoyées au model
    let donnees = {
        rdvs: rendezVousSimple,
        month: paramMonth,
        year: paramYear,
    };
    return res.json(donnees);
}


/*Fonction modifie un rendez vous */
export async function modifierRendezVousCalendarPOST(req, res) {
    if (res.locals.user) {
        try {
            //Récupération des champs du form
            const { idRDV, titre, lieu, description, dateDebut, dateFin } = req.body;
            //Récupération du rdv avec l'id donné
            const rdvToUpdate = await RendezVous.findOne({ where: { id: idRDV } });

            if (!rdvToUpdate) {
                return res.status(404).json({ message: 'Rendez-vous introuvable' });
            }

            /*ATTENTION : On déduit le décallage horaire*/
            let debut =new Date(dateDebut); 
            debut.setHours(debut.getHours() - (debut.getTimezoneOffset()/60))
            let fin =new Date(dateFin);  
            fin.setHours(fin.getHours() - (fin.getTimezoneOffset()/60))

            //Sauvegarde du rdv
            rdvToUpdate.dateDebut = debut;
            rdvToUpdate.dateFin = fin;
            rdvToUpdate.titre = titre;
            rdvToUpdate.lieu = lieu;
            rdvToUpdate.description = description;
            await rdvToUpdate.save();
            
            //Récupération des rdvs avec un interval large
            let interval = getIntervalle(new Date(debut.getFullYear(), debut.getMonth() - 1, 2),new Date(fin.getFullYear(), debut.getMonth()+1, 2));
            let savedRdv = await RendezVous.findOne({where: { id: rdvToUpdate.id }})
            let rdvs = savedRdv.get_rendezVous(interval.debut,interval.fin);
            
            return res.json(rdvs);

        } catch (error) {
            console.error('Erreur lors de la modification du rdv:', error);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } else {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
}

/* Renvoi l'intervalle Large entre 2 dates (on peut modifier un rdv de novembre au mois d'octobre avec fullcalendar) */
export function getIntervalle(startDate,endDate){
    let monthDebut = startDate.getMonth() + 1;
    let yearDebut = startDate.getFullYear();
    let monthEnd = endDate.getMonth() + 1; 
    let yearEnd = endDate.getFullYear();

    let startDay = getBeginingDay(yearDebut,monthDebut);
    // Premier jour visible du mois (selon année et mois choisi)
    let debut = new Date(yearDebut, monthDebut - 1, 1-startDay); // Premier jours
    debut.setHours(- (debut.getTimezoneOffset()/60),0,0); //Déduction du décalage horaire

    let endDay = getEndDay(yearEnd,monthEnd);
    // Dernier jour visibles du mois (selon année et mois choisi) 
    let fin = new Date(yearEnd, monthEnd, (6-endDay)); 
    fin.setHours(23- (fin.getTimezoneOffset()/60),59,59); //PROBLEME SUR LE FUSEAU HORAIRE (artificiellement à 23h59)
   
    return {debut,fin};

}