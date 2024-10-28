import { afficher  } from "./calendar_affichage.js";
import { ajouterEcouteurs } from "./calendar_ecouteurs.js";
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';

import {creerModale,envoyerForm} from '/js/modif_rendezvous-calendar.js';


//Récupération de la balise contenant le calendar
const elementCalendrier = document.getElementById('calendar');

/* Script qui contient le model et fait execute les différentes requêtes aux server
AgendaManager connait une instance de Data , c'est selon ces données que l'affichage est mis à jours*/
export const tableauRdvs = []; //Tableau enregistrant les rdvs par jour

/*Classe représentant les données nécessaires au fonctionnemnt du calendrier,
c'est dans cette classe que l'on va charger les données recus du serveur */
export class Data {
    constructor(agendas, selectedAgendas, rdvs, user, month, year) {
        this.agendas = agendas;
        this.selectedAgendas = selectedAgendas;
        this.rdvs = rdvs;
        this.user = user;
        this.month = month;
        this.year = year;
    }
}
/*Classe qui va contenir Data (données du model) et va jouer le rôle d'interface pour les requêtes au serveurs */
export class AgendaManager {
    constructor() {
        this.data = {
            agendas: null,
            selectedAgendas: null,
            rdvs: null,
            user: null,
            month: null,
            year: null,
        };
         this.calendrier = new Calendar(elementCalendrier,{
            //Appel des différents composants composants
            plugins : [dayGridPlugin,timeGridPlugin,listPlugin],
            locale:'fr',
            //Attention listWeek potentielleemnet à changer en list
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'} ,
                buttonText: {
                    today:'Aujourd\'hui',
                    month:'Mois',
                    week:'Semaine',
                    list:'Liste',
                    day:"Jour"
                },
        eventClick: function(info) {

            // Accès aux détails rdv
            const title = info.event.title;
            const id = info.event.id;

            const description = info.event.extendedProps.description;
            const lieu = info.event.extendedProps.lieu;

            /* toLocaleDateString(...) : Renvoie une date au format : mardi, 01/10/2024 */
            const start = info.event.start; //.toLocaleDateString("fr-FR", {weekday: "long",year: "numeric",month: "numeric",day: "numeric",});
            const end = info.event.end; //.toLocaleDateString("fr-FR", {weekday: "long",year: "numeric",month: "numeric",day: "numeric",});
            //Rattacher la fonction du formulaire envoyerForm à celle du script modif_rendezvous-calendar
            window.envoyerForm = envoyerForm;
            creerModale({titre:title,description:description,lieu:lieu,dateDebut:start,dateFin:end,id:id})
            //alert(`Titre : ${title}\nDébut : ${start}\nFin : ${end}\nDescription : ${description}\nLieu : ${lieu}\nid : ${id}`);        
        }
        
        
        
        });
  
    }
    /*Au premier accès à la page calendar on fait une première requête 
    pour obtenir les données de bases de l'utilisateur*/
    async init() {
        try {
            const serverResponse = await fetch("/calendar-data");
            const data = await serverResponse.json();
            this.data.agendas = data.agendas;
            this.data.selectedAgendas = data.selectedAgendas;
            this.data.rdvs = data.rdvs;
            this.data.user = data.user;
            this.data.month = data.month;
            this.data.year = data.year;
            //Tableau enregistrant les rdvs par jour
            for (let i = 0; i < 32; i++) {
                tableauRdvs.push([]);
            }
           afficher();
            ajouterEcouteurs(data);
            this.calendrier.removeAllEvents();
            let rdvs = rdvMapping(data.rdvs);
            this.calendrier.addEventSource(rdvs);
            

            this.calendrier.render();
    
            // Ajout d'écouteurs (prev,next : Changements de mois)
            /*Passer this.updateYear directement ne fonctionne pas car la fonction est exécutée directement */
            document.querySelector('.fc-prev-button').addEventListener('click', () => this.updateDate());

            document.querySelector('.fc-next-button').addEventListener('click', () => this.updateDate());
        
        } catch (error) {
            console.log("Aucune donnée", error);
        }
    }
    /*Mets à jours les données du model */
    updateData(newdata) {
        this.data.agendas = newdata.agendas;
        this.data.selectedAgendas = newdata.selectedAgendas;
        this.data.rdvs = newdata.rdvs;
        this.data.user = newdata.user;
        this.data.month = newdata.month;
        this.data.year = newdata.year;
        // let rdvs = rdvMapping(newdata.rdvs);
        ///afficherFullcalendar(rdvs);
        afficher(newdata);
        this.calendrier.removeAllEvents();
        let rdvs = rdvMapping(newdata.rdvs);
        console.log(rdvs);

        this.calendrier.addEventSource(rdvs);
        this.calendrier.render();
            
    }
    /*Met à jours le calendrier selon le mois dans lequel on navigue */
    async updateDate(){
        let currentDate = this.calendrier.getDate(); // Date actuelle du fullcalendar
        let month = currentDate.getMonth() + 1; // mois de 0 à 11
        let year = currentDate.getFullYear();
        fetch("/calendar-data?month=" + month + "&" + "year=" + year)
            .then((response) => response.json())
            .then((data) => this.updateData(data))
            .catch((error) => console.log("Aucune données"));
    }
    /*Mise à jour d'un rdv (après modification) */
    async updateRdv(rdv){
        console.log('All rdvs :');

        let events = this.calendrier.getEvents()
        events.forEach(event => {
            console.log(`ID: ${event.id}, Titre: ${event.title}, Début: ${event.start}, Fin: ${event.end}`);
        });
        console.log('FIN FIN FIN All rdvs :');
        console.log('Pourquoi ca ne marche pas : ',rdv.id);

        console.log('le rdv va être modifié',rdv);
        //récupération du rdv 
        let event = this.calendrier.getEventById(rdv.id); 
        console.log(event);
        if(event){
            console.log('rdv trouvé');
            event.setProp('title', rdv.titre);
            event.setStart(toLocaleDate(rdv.dateDebut));
            event.setEnd(toLocaleDate(rdv.dateFin));
            event.setExtendedProp('description', rdv.description);
            event.setExtendedProp('lieu', rdv.lieu);
        
        }else{
            console.log('rdv introuvable');
        }
        


    }
    /*Requête lors de la sélection et désélection de l'année */
    async selectionAgenda(idAgenda) {
        fetch(
            "/calendar-data?year=" +
                this.data.year +
                "&" +
                "id=" +
                idAgenda +
                "&" +
                "month=" +
                this.data.month
        )
            .then((response) => response.json())
            .then((data) => this.updateData(data))
            .catch((error) => console.log("Aucune données"));
    }

}

/*Map les rdvs récupérées du serveur en events exploitable par le fullcalendar */
export function rdvMapping(rdvs){
    let tabRdvs = [];
    rdvs.forEach(element => {tabRdvs.push({
        "title": element.titre,
        "start": toLocaleDate(element.dateDebut),
        "end": toLocaleDate(element.dateFin),
        'id': element.id,
        "description": element.description,
        "lieu": element.lieu,
    });
        
    });
    return tabRdvs;
}
/*Utilisé par le mapping pour avoir un format de date exploitable par fullcalendar */
export function toLocaleDate(dateString){

    const date = new Date(dateString);
    /* 'sv-SE' sert à mettre la date au format YYYY-MM-DD car par défaut = YYYY/MM/DD
    '2-digit' est possible à la place de numéric */
    let fullCalendarDate = date.toLocaleDateString('sv-SE', {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false, //Format 24h
        timeZone: 'UTC', // 'UTC' ou 'Europe/Paris' selon bd (voir avec Manu)
    });
    // console.log(dateString,fullCalendarDate);
    return fullCalendarDate;
}
//Initialisation du model
const agendaManager = new AgendaManager();
agendaManager.init();

export { agendaManager };
