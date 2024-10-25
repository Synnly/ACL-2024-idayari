import { afficher,afficherFullcalendar /*loadCalendar*/ } from "./calendar_affichage.js";
import { ajouterEcouteurs } from "./calendar_ecouteurs.js";
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';
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
        console.log('who da fuck is this guy',newdata.rdvs);
        let rdvs = rdvMapping(newdata.rdvs);
        console.log(rdvs);
        afficherFullcalendar(rdvs);
        afficher(newdata);
    }
    /*Requête lors de la diminution (-1) de l'année */
    async leftYear() {
        let choosenYear = parseInt(this.data.year, 10) - 1;
        fetch(
            "/calendar-data?year=" +
                choosenYear +
                "&" +
                "month=" +
                this.data.month
        )
            .then((response) => response.json())
            .then((data) => this.updateData(data))
            .catch((error) => console.log("Aucne données"));
    }
    /*Requête lors de l'augmentation (+1) de l'année */
    async rightYear() {
        let choosenYear = parseInt(this.data.year, 10) + 1;
        fetch(
            "/calendar-data?year=" +
                choosenYear +
                "&" +
                "month=" +
                this.data.month
        )
            .then((response) => response.json())
            .then((data) => this.updateData(data))
            .catch((error) => console.log("Aucne données"));
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
    /*Requête lors de la sélection d'un mois */
    async selectionMois(mois) {
        fetch("/calendar-data?month=" + mois + "&" + "year=" + this.data.year)
            .then((response) => response.json())
            .then((data) => this.updateData(data))
            .catch((error) => console.log("Aucune données"));
    }
}

export function rdvMapping(rdvs){
    let tabRdvs = [];
    rdvs.forEach(element => {tabRdvs.push({"title": element.titre,"start": toLocaleDate(element.dateDebut),"end": toLocaleDate(element.dateFin)});
        
    });
    return tabRdvs;
}
export function toLocaleDate(dateString){


const date = new Date(dateString);

const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, //Format 24h
    timeZone: 'UTC', // Utiliser 'UTC' ou 'Europe/Paris' selon bd (voir avec Manu)
};

const formattedDate = date.toLocaleString('sv-SE', options).replace('T', ' ').slice(0, -3);
return formattedDate;
}
//Initialisation du model
const agendaManager = new AgendaManager();
agendaManager.init();

export { agendaManager };
