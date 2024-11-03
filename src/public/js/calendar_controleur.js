import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import {creerModale,envoyerForm,quitModal} from '/js/modif_rendezvous-calendar.js';

/* Script qui contient le model et fait execute les différentes requêtes aux server
AgendaManager connait une instance de Data , c'est selon ces données que l'affichage est mis à jours*/ 

//Récupération de la balise contenant le calendar
const elementCalendrier = document.getElementById('calendar');

export class AgendaManager {

    constructor() {
        // "tableau associatif" qui associe chaque agenda (id) à un ensemble de périodes ({debut, fin})
        // dont les rendez-vous simples sont stockées dans le calendrier
        // ex : '12': Set [ {start: 2 Nov 2024, end: 3 Nov 2024} ]
        this.agendas_periodes = {};
        // variable permettant de retenir l'id du rendez-vous après modification, permet de supprimer les rendez-vous simples n'étant plus pertinent
        this.rendez_vous_change_id = null;

        // liste des agendas
        const agendas = [];
        for (const li of document.getElementById('agendaList').children) {
            agendas.push({nom: li.textContent, id: li.id.split("_")[1]});
        }

        const manager = this;
        this.calendrier = new Calendar(elementCalendrier,{
            //Appel des différents composants 
            plugins : [dayGridPlugin,timeGridPlugin,listPlugin],
            // le format des dates dépend du navigateur
            locale:navigator.languages[0],
            // permet de commencer Lundi
            weekNumberCalculation: "ISO",
            // nombre de semaines dans la vue Mois non fixe, au lieu de toujours 6 (inclut donc parfois des semaines n'étant pas du tout dans le mois)
            fixedWeekCount: false,
            // permet de pas afficher des milliers de rendez-vous par case
            dayMaxEventRows: 3, // pour la vue mois
            eventMaxStack: 4, // pour les vues semaine et jour
            timeZone: 'UTC', //Sans fuseau horaire (à l'affichage)            
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
                const event = info.event;
                manager.rendez_vous_change_id = event.extendedProps.id_rdv;
                window.envoyerForm = envoyerForm;
                window.quitModal = quitModal;
                creerModale({title: event.title, lieu: event.lieu, description: event.description,
                            id: event.extendedProps.id_rdv, start: event.start, end: event.end, allDay: event.allDay,
                            agendas: event.extendedProps.agendas}, agendas);   
            }
        });
    }

    init() {
        this.calendrier.render();

        // Ajout d'écouteurs

        // écouteurs lors de selections d'agenda
        for (const child of document.getElementById('agendaList').children) {
            child.addEventListener('click', (event) => this.selectionAgenda(event.target.id.split("_")[1]));
        }
        document.getElementById('selectAll').addEventListener('click', () => this.selectAll());
        // écouteurs lorsque changement de vue/période
        for (const child of document.getElementsByClassName('fc-button')) {
            child.addEventListener('click', () => this.updateDate());
        };
    }

    // à partir de la liste des rendez-vous simples des agendas, ajoute les rendez-vous si nécessaire dans le calendrier
    // si déjà présent, met à jour la liste d'agendas d'où provient le rendez-vous
    async addData(agendas, updateDate=true) {
        const rendezVous = await this.getRdvFromServer(agendas);
        for (const rdv of rendezVous) {
            rdv.agendas = new Set(rdv.agendas);
            rdv.id = rdv.groupId + "_" + rdv.start;
            // si le rendez-vous est déjà présent, on met à jour la liste des agendas d'où le rendez-vous provient
            if (this.unique_rdv[identifier]) {
                this.unique_rdv[identifier].agendas = this.unique_rdv[identifier].agendas.union(rdv.agendas);
            } else {
                this.unique_rdv[identifier] = rdv;
                this.calendrier.addEvent(rdv);
            }
        }
        // on sait désormais les rendez-vous des agendas dans la période actuellement visible
        if (updateDate) {
            agendas.forEach(e => {
                this.agendas_periodes[e] = new Set([{start: this.calendrier.view.activeStart, end: this.calendrier.view.activeEnd}]);
            });
        }
    }

    // click sur un agenda
    async selectionAgenda(agenda_id) {
        // l'agenda a été déselectionné
        if (this.agendas_periodes[agenda_id]) {
            for (const event of this.calendrier.getEvents()) {
                // si le rendez-vous provient de cet agenda
                if (event.extendedProps.agendas.has(+agenda_id)) {
                    // si le rendez-vous provient uniquement de cet agenda, on le supprime
                    if (event.extendedProps.agendas.size === 1) {
                        delete this.unique_rdv[event.id + "_" + event.start.toISOString()];
                        event.remove();
                    } else {
                        event.extendedProps.agendas.delete(+agenda_id);
                    }
                }
            }
            // on enlève l'agenda
            delete this.agendas_periodes[agenda_id];
        } else {
            // l'agenda a été sélectionné
            await this.addData([agenda_id]);
        }
        this.calendrier.render(); 
    }

    // click sur "Tout sélectionner"
    async selectAll() {
        // on récupère la nouvelle liste des agendas sélectionnés du DOM
        const agendasSelectionnes = document.getElementById('agendaList').getElementsByClassName('active');
        // si tout a été désélectionné, pas besoin de query
        if (agendasSelectionnes.length == 0) {
            this.agendas_periodes = {};
            this.unique_rdv = {};
            this.calendrier.removeAllEvents();
        } else {
            // sinon on récupère les rendez-vous simples des agendas dont on n'a pas encore les infos
            const new_agendas = [];
            for (const elem of agendasSelectionnes) {
                const id = elem.id.split("_")[1];
                if (!this.agendas_periodes[id]) {
                    new_agendas.push(id);
                }
            }
            await this.addData(new_agendas);
        }
        this.calendrier.render(); 
    }

    /* Met à jours le calendrier selon la période actuellement visinle */
    async updateDate(){
        const start = this.calendrier.view.activeStart;
        const end = this.calendrier.view.activeEnd;
        // liste des agendas dont on devra récupérer des infos
        const to_query = [];
        // pour chaque agenda...
        for (const agenda_id of Object.keys(this.agendas_periodes)) {
            const periodes = this.agendas_periodes[agenda_id];
            // variable pour savoir si on connait déjà les rendez-vous de l'agenda dans la période
            let known = false;
            // variables si les rendez-vous simples d'une partie de la période actuellement visible sont connus
            // permet de combiner ces périodes (pour garantir l'intersection vide des périodes)
            let connect_start = null;
            let connect_end = null;
            for (const periode of periodes) {
                // la période actuellement visible is totalement incluse dans une période dont on connait déjà les rendez-vous
                // pas besoin de query
                if (start >= periode.start && end <= periode.end) {
                    known = true;
                }
                // la période actuellement visible est partiellement incluse dans une période connue
                else if (start >= periode.start) {
                    connect_start = periode;
                }
                else if (end <= periode.end) {
                    connect_end = periode;
                }
                // la période actuellement visible englobe une periode connue (ex : passage de vue Jour -> Mois)
                // on supprime les périodes incluses
                else {
                    periodes.delete(periode);
                }
            }
            // garantit l'intersection vide des périodes
            if (connect_start && connect_end) {
                const new_start = connect_start.start;
                const new_end = connect_end.end;
                periodes.delete(connect_start);
                periodes.delete(connect_end);
                periodes.add({start: new_start, end: new_end});
            } else if (connect_start) {
                connect_start.end = end;
            } else if (connect_end) {
                connect_end.start = start;
            }
            // si on ne connait pas déjà les rendez-vous simples on query
            if (!known) {
                to_query.push(agenda_id);
            }
        }
        if (to_query.length > 0) {
            // pas besoin de mettre à jour les périodes dans la fonction addData, cela a été fait plus haut
            await this.addData(to_query, false);
        }
        this.calendrier.render();
    }

    /*Mise à jour d'un rdv dans le fullcalendar (après sa modification) */
    updateRdv(rdvs){
        const events = this.calendrier.getEvents();
        //Suppression des rdvs simples correspondants au rendez-vous du rendez-vous simple supprimé
        for (let i = events.length - 1; i >= 0; i--) {
            if (events[i].id === this.rendez_vous_change_id) {
                delete this.unique_rdv[events[i].id + "_" + events[i].start.toISOString()];
                events[i].remove();
            }
        }
        //Ajouts des nouveaux rdvs
        for (const rdv of rdvs) {
            rdv.agendas = new Set(this.rendez_vous_change_agendas);
            this.unique_rdv[rdv.id + "_" + rdv.start] = rdv;
            this.calendrier.addEvent(rdv);
        }
        // mise à jour des périodes des agendas
        // on ne sait désormais que les rendez-vous dans la période visible
        this.rendez_vous_change_agendas.forEach(e => {
            this.agendas_periodes[e] = new Set([{start: this.calendrier.view.activeStart, end: this.calendrier.view.activeEnd}]);
        })
        this.calendrier.render(); 
    }

    // récupère les rendez-vous simples à partir d'une liste d'agendas et la période actuellement viisble
    async getRdvFromServer(agendas) {
        const ag = encodeURIComponent(JSON.stringify(agendas));
        const res = await fetch(
            "/calendar-data?start=" + this.calendrier.view.activeStart +
                "&end=" + this.calendrier.view.activeEnd +
                "&agendas=" + ag
        ).then((response) => response.json());
        if (res.err === "deconnecte") {
            window.location.href = '/';
            return;
        } else if (res.err) {
            return [];
        }
        return res;
    }
}

//Initialisation du model
const agendaManager = new AgendaManager();
agendaManager.init();

export { agendaManager };
