import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
import {creerModale,envoyerForm,quitModal} from '/js/modif_rendezvous-calendar.js';

/* Script qui contient le model et fait execute les différentes requêtes aux server
AgendaManager connait une instance de Data , c'est selon ces données que l'affichage est mis à jours*/ 

//Récupération de la balise contenant le calendar
const elementCalendrier = document.getElementById('calendar');

/*Classe représentant les données nécessaires au fonctionnemnt du calendrier,
c'est dans cette classe que l'on va charger les données recus du serveur */
export class Data {
    constructor(agendas_selectionnes, rdvs, month, year) {
        this.agendas_selectionnes = agendas_selectionnes;
        this.rdvs = rdvs;
        this.month = month;
        this.year = year;
    }
}
/*Classe qui va contenir Data (données du model) et va jouer le rôle d'interface pour les requêtes au serveurs */
export class AgendaManager {

    constructor() {
        this.data = {
            agendas_selectionnes: [],
            rdvs: null,
            month: null,
            year: null,
        };
         this.calendrier = new Calendar(elementCalendrier,{
            //Appel des différents composants 
            plugins : [dayGridPlugin,timeGridPlugin,listPlugin],
            locale:'fr',
            //Paramétrage des modes d'affichages du calendrier
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
            //Gestion du clique sur un rendez vous
            eventClick: function(info) {
                // Accès aux détails rdv
                let title = info.event.title;
                let id = info.event.id;
                let description = info.event.extendedProps.description;
                let lieu = info.event.extendedProps.lieu;
                let start = info.event.start; 
                let end = info.event.end;

                window.envoyerForm = envoyerForm;
                window.quitModal = quitModal;
                creerModale({titre:title,description:description,lieu:lieu,dateDebut:start,dateFin:end,id:id})   
            }
        });
  
    }

    /*Au premier accès à la page calendar on fait une première requête 
    pour obtenir les données de bases de l'utilisateur*/
    async init() {
        this.calendrier.render();

        // Ajout d'écouteurs (prev,next : Changements de mois)
        /*Passer this.updateYear directement ne fonctionne pas car la fonction est exécutée directement */
        for (const child of document.getElementById('agendaList').children) {
            child.addEventListener('click', () => this.refresh());
        }
        document.getElementById('selectAll').addEventListener('click', () => this.refresh());
        document.querySelector('.fc-prev-button').addEventListener('click', () => this.updateDate());
        document.querySelector('.fc-next-button').addEventListener('click', () => this.updateDate());
        document.querySelector('.fc-today-button').addEventListener('click', () => this.updateDate());
    }

    /*Mets à jours les données du model */
    updateData(newdata) {
        this.data.rdvs = newdata.rdvs;
        this.data.month = newdata.month;
        this.data.year = newdata.year;
    
        //Mise à jours des rdvs (events) du calendrier
        this.calendrier.removeAllEvents();
        this.calendrier.addEventSource(this.data.rdvs);
        this.calendrier.render();    
    }

    /*Met à jours le calendrier selon le mois ou l'année dans lequels on navigue */
    async updateDate(){
        let currentDate = this.calendrier.getDate(); // Date actuelle du fullcalendar
        this.data.month = currentDate.getMonth() + 1; // mois de 0 à 11
        this.data.year = currentDate.getFullYear();
        this.update();
    }

    /*Mise à jour d'un rdv dans le fullcalendar (après sa modification) */
    async updateRdv(rdv){
        console.log(rdv);
        let firstRdv = rdv[0];
        //Suppression des rdvs correspondants
        let events = this.calendrier.getEvents().filter(event => event.id != firstRdv.id);
        //Ajouts des nouveaux rdvs
        events.push(...rdv);
        this.calendrier.removeAllEvents();
        this.calendrier.addEventSource(events);
        this.calendrier.render(); 
    }

    /*Requête lors de la sélection et désélection de l'année */
    async update() {
        const sel = encodeURIComponent(JSON.stringify(this.data.agendas_selectionnes));
        fetch(
            "/calendar-data?year=" +
                (this.data.year ? this.data.year : "") +
                "&selectionnes=" + sel +
                "&month=" +
                (this.data.month ? this.data.month : "")
        )
            .then((response) => response.json())
            .then((data) => this.updateData(data))
            .catch((error) => console.log("Aucune données"));
    }

    refresh() {
        const agendaSelectionnes = document.getElementById('agendaList').getElementsByClassName('active');
        this.data.agendas_selectionnes = Array.prototype.map.call(agendaSelectionnes, (e) => e.id.split("_")[1]);
        this.update();
    }
}


/*Utilisé par le mapping pour avoir un format de date exploitable par fullcalendar */
export function toLocaleDate(dateString){
    const date = new Date(dateString);
    /* 'sv-SE' sert à mettre la date au format YYYY-MM-DD car par défaut = YYYY/MM/DD numeric identique à 2-digit */
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
    return fullCalendarDate;
}


//Initialisation du model
const agendaManager = new AgendaManager();
agendaManager.init();

export { agendaManager };
