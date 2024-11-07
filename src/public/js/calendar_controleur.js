import bootstrap5Plugin from '@fullcalendar/bootstrap5';
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
        this.events = new Set();
        const manager = this;
        // liste des agendas
        const agendas = Array.prototype.map.call(document.getElementById('agendaList').children, (li) => Object({nom: li.textContent, id: li.id.split("_")[1]}));

        this.calendrier = new Calendar(elementCalendrier,{
            //Appel des différents composants 
            plugins : [dayGridPlugin,timeGridPlugin,listPlugin, bootstrap5Plugin],
            // le format des dates dépend du navigateur
            locale:navigator.languages[0],
            // permet de commencer Lundi
            weekNumberCalculation: "ISO",
            // nombre de semaines dans la vue Mois non fixe, au lieu de toujours 6 (inclut donc parfois des semaines n'étant pas du tout dans le mois)
            fixedWeekCount: false,
            // permet de pas afficher des milliers de rendez-vous par case
            dayMaxEventRows: 2, // pour la vue mois
            eventMaxStack: 3, // pour les vues semaine et jour
            navLinks: true,
            slotDuration: '01:00:00',
            height: "100%",
            customButtons: {
                new_event: {
                    text: 'nouvel évènement',
                    icon: 'bi bi-plus-lg',
                    click: function() {
                        window.location.href = '/rendezVous/new'
                    }
                }
            },
            themeSystem: 'bootstrap5',
            //Paramétrage des modes d'affichages du calendrier
            headerToolbar: {
                left: 'today prev,next',
                center: 'title',
                right: 'new_event dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today:'Aujourd\'hui',
                month:'Mois',
                week:'Semaine',
                day:"Jour"
            },
            views: {
                dayGridMonth: {
                    dayHeaderFormat: { weekday: 'long' }
                },
                timeGridWeek: {
                    dayHeaderFormat: { weekday: 'long', month: 'numeric', day: 'numeric', omitCommas: true }
                }
            },
            datesSet: function(info) {
                manager.updateDate(info.start, info.end);
            },
            //Gestion du clique sur un rendez vous
            eventClick: function(info) {
                const event = info.event;
                manager.modified_event = event;
                window.envoyerForm = envoyerForm;
                window.quitModal = quitModal;
                creerModale({title: event.title, lieu: event.extendedProps.lieu, description: event.extendedProps.description,
                            id: event.groupId, start: event.start, end: event.end, allDay: event.allDay,
                            type: event.extendedProps.type, fin_recurrence: event.extendedProps.endRec, nbOccurrences: event.extendedProps.nbOccurrences,
                            frequence: event.extendedProps.frequence,
                            agendas: event.extendedProps.agendas}, agendas);   
            },

            eventChange: function(info) {
                manager.go = false;
                const oldEvent = info.oldEvent;
                const first_event = info.event.toPlainObject();
                let earliestStart = info.event.start;
                let earliestEnd = info.event.end;

                // si on modifie la date de début
                // on met à jour la liste des "identifiants" (pour l'unicité...)
                // et on supprime les rendez-vous ayant dépassé la date de fin de récurrence
                if (earliestStart.valueOf() != oldEvent.start.valueOf()) {
                    manager.events.forEach(e => {
                        if (e.split("_")[0] == oldEvent.groupId) {
                            manager.events.delete(e);
                        }
                    });
                    // date de fin exclusive
                    if (!info.event.extendedProps.endRec || info.event.start < info.event.extendedProps.endRec) {
                        manager.events.add(info.event.groupId + "_" + info.event.start.toISOString());
                    } else {
                        info.event.remove();
                    }
                }
                for (const ev of info.relatedEvents) {
                    if (ev.start < earliestStart) {
                        earliestStart = ev.start;
                        earliestEnd = ev.end;
                    }
                    if (!ev.extendedProps.endRec || ev.start < ev.extendedProps.endRec) {
                        manager.events.add(ev.groupId + "_" + ev.start.toISOString());
                    } else {
                        ev.remove();
                    }
                }
                const data = {title: first_event.title, lieu: first_event.extendedProps.lieu, description: first_event.extendedProps.description,
                                id: first_event.groupId, start: earliestStart, end: earliestEnd, allDay: first_event.allDay,
                                agendas_to_add: first_event.extendedProps.agendas.filter(e => !oldEvent.extendedProps.agendas.includes(e)),
                                agendas_to_remove: oldEvent.extendedProps.agendas.filter(e => !first_event.extendedProps.agendas.includes(e)),
                                dateFinRecurrence: first_event.extendedProps.endRec ? new Date(first_event.extendedProps.endRec) : first_event.extendedProps.endRec,
                                frequence: first_event.extendedProps.frequence, type: first_event.extendedProps.type, nbOccurrences: first_event.extendedProps.nbOccurrences}
                fetch("/calendar-rdv", {
                    method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
                })
                .then(_ => manager.go = true)
                .catch((error) => {
                    info.revert();
                });
            }
        });
    }

    init() {
        this.calendrier.render();
        // écouteur selections d'agenda
        for (const child of document.getElementById('agendaList').children) {
            child.addEventListener('click', (event) => this.selectionAgenda(event.target.id.split("_")[1]));
        }
        document.getElementById('selectAll').addEventListener('click', () => this.selectAll());
    }

    addEventsFromRDV(rendezVous, agendas_to_add=null) {
        for (const rdv of rendezVous) {
            const identifier = rdv.groupId + "_" + rdv.start;
            // si le rendez-vous est déjà présent, on met à jour la liste des agendas d'où le rendez-vous provient
            if (!this.events.has(identifier)) {
                // les dates sont récupérées sous forme de chaînes de caractères
                rdv.start = new Date(rdv.start);
                rdv.end = new Date(rdv.end);
                rdv.endRec = rdv.endRec ? new Date(rdv.endRec) : rdv.endRec;
                if (agendas_to_add) {
                    rdv.agendas = agendas_to_add;
                }
                this.events.add(identifier);
                this.calendrier.addEvent(rdv);
            }
        }
    }

        // à partir de la liste des rendez-vous simples des agendas, ajoute les rendez-vous si nécessaire dans le calendrier
    // si déjà présent, met à jour la liste d'agendas d'où provient le rendez-vous
    addData(agendas, updateDate=true) {
        const ag = encodeURIComponent(JSON.stringify(agendas));
        fetch(
            "/calendar-data?start=" + this.calendrier.view.activeStart.valueOf() +
                "&end=" + this.calendrier.view.activeEnd.valueOf() +
                "&agendas=" + ag
        ).then((response) => response.json())
        .then(rendezVous => {
            if (rendezVous.err == "not auth") {
                window.location.href = "/";
                return ;
            }
            this.addEventsFromRDV(rendezVous);
            if (updateDate) {
                agendas.forEach(e => {
                    this.agendas_periodes[e] = new Set([{start: this.calendrier.view.activeStart, end: this.calendrier.view.activeEnd}]);
                });
            }
        })
        .catch(err => {
            console.log(err.message);
        });
    }

    addDataFromRDV(id, agendas, rdv_agendas) {
        fetch(
            "/calendar-data-rdv?start=" + this.calendrier.view.activeStart.valueOf() +
                "&end=" + this.calendrier.view.activeEnd.valueOf() +
                "&id=" + id
        )
        .then((response) => response.json())
        .then(rendezVous => {
            if (rendezVous.err == "not auth") {
                window.location.href = "/";
                return ;
            }
            this.addEventsFromRDV(rendezVous, rdv_agendas);
            agendas.forEach(e => {
                this.agendas_periodes[e] = new Set([{start: this.calendrier.view.activeStart, end: this.calendrier.view.activeEnd}]);
            });
        })
        .catch(err => {
            console.log(err.message);
        });
    }

    // click sur un agenda
    selectionAgenda(agenda_id) {
        // l'agenda a été déselectionné
        if (this.agendas_periodes[agenda_id]) {
            // on enlève l'agenda
            delete this.agendas_periodes[agenda_id];
            for (const event of this.calendrier.getEvents()) {
                if (!event.extendedProps.agendas.some(e => this.agendas_periodes[e] != undefined)) {
                    const identifier = event.groupId + "_" + event.start.toISOString();
                    this.events.delete(identifier);
                    event.remove();
                }
            }
        } else {
            // l'agenda a été sélectionné
            this.addData([agenda_id]);
        }
    }

    // click sur "Tout sélectionner"
    async selectAll() {
        // on récupère la nouvelle liste des agendas sélectionnés du DOM
        const agendasSelectionnes = document.getElementById('agendaList').getElementsByClassName('active');
        // si tout a été désélectionné, pas besoin de query
        if (agendasSelectionnes.length == 0) {
            this.agendas_periodes = {};
            this.events.clear();
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
            this.addData(new_agendas);
        }
    }

    /* Met à jours le calendrier selon la période actuellement visinle */
    updateDate(start, end){
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
            this.addData(to_query, false);
        }
    }

    /*Mise à jour d'un rdv dans le fullcalendar (après sa modification) */
    update_event(new_event){
        const old_event = this.modified_event;

        if (new_event.title != old_event.title) {
            old_event.setProp('title', new_event.title);
        }
        if (new_event.start.valueOf() != old_event.start.valueOf() || new_event.end.valueOf() != old_event.end.valueOf() || new_event.allDay != old_event.allDay) {
            old_event.setDates(new_event.start, new_event.end, { allDay: new_event.allDay});
        }
        if (new_event.lieu != old_event.extendedProps.lieu) {
            old_event.setExtendedProp('lieu', new_event.lieu);
        }
        if (new_event.description != old_event.extendedProps.description) {
            old_event.setExtendedProp('description', new_event.description);
        }

        const is_different = new Set(old_event.extendedProps.agendas).symmetricDifference(new Set(new_event.agendas)).size != 0;
        if (is_different) {
            old_event.setExtendedProp('agendas', new_event.agendas);
        }
        const agendas_to_refresh = new_event.agendas.filter(e => this.agendas_periodes[e.toString()] != undefined);

        // modification d'infos de récurrence
        if (new_event.freq_type != old_event.extendedProps.type ||
            new_event.freq_number != old_event.extendedProps.frequence ||
            new_event.date_fin_recurrence != old_event.extendedProps.endRec ||
            new_event.nb_occurrence != old_event.extendedProps.nbOccurrences) {
            const id = old_event.groupId;
            this.remove_events(id);
            const data = {id: id, dateFinRecurrence: new_event.date_fin_recurrence ? new Date(new_event.date_fin_recurrence) : new_event.date_fin_recurrence,
                          frequence: new_event.freq_number, type: new_event.freq_type, nbOccurrences: new_event.nb_occurrence}
            fetch("/calendar-rdv-recurrence", {
                method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
            })
            .then(_ => {
                if (agendas_to_refresh.length > 0) {
                    this.addDataFromRDV(id, agendas_to_refresh, new_event.agendas);
                }
            })
            .catch((error) => {
                console.log(error);
            });
        } else if (agendas_to_refresh.length == 0) {
            this.remove_events(old_event.groupId);
        }
    }

    remove_events(id) {
        this.calendrier.getEvents().forEach(ev => {
            if (ev.groupId == id) {
                ev.remove();
                const identifier = ev.groupId + "_" + ev.start.toISOString();
                this.events.delete(identifier);
            }
        });
    }
}

//Initialisation du model
const agendaManager = new AgendaManager();
agendaManager.init();

export { agendaManager };