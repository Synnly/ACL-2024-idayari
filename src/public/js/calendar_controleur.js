import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import {getRendezVousModal} from '/js/script_rendez_vous.js';
import { json_fetch } from './utils.js';

/* Script qui contient le model et fait execute les différentes requêtes aux server
AgendaManager connait une instance de Data , c'est selon ces données que l'affichage est mis à jours*/ 

function get_event_source(agenda_id) {
    return {
        events: function (info, successCallback, failureCallback) {
            fetch(
                "/calendar-data?start=" + info.start.valueOf() +
                    "&end=" + info.end.valueOf() +
                    "&agenda=" + agenda_id
            ).then((response) => response.json())
            .then(rendezVous => {
                if (rendezVous.err == "not auth") {
                    window.location.href = "/";
                    failureCallback();
                    return ;
                }
                for (const rdv of rendezVous) {
                    // les dates sont récupérées sous forme de chaînes de caractères
                    rdv.start = new Date(rdv.start);
                    rdv.end = new Date(rdv.end);
                    rdv.dateFinRecurrence = rdv.dateFinRecurrence ? new Date(rdv.dateFinRecurrence) : rdv.dateFinRecurrence;
                }
                successCallback(rendezVous);
            }).catch(err => {
                console.log(err.message);
            });
        },
        id: agenda_id
    };
}

class AgendaManager {

    constructor() {
        // "tableau associatif" qui associe chaque agenda (id) à un ensemble de périodes ({debut, fin})
        // dont les rendez-vous simples sont stockées dans le calendrier
        // ex : '12': Set [ {start: 2 Nov 2024, end: 3 Nov 2024} ]
        // this.agendas_periodes = {};
        const manager = this;
        // pour éviter de faire une requête pour un agenda dont on sait qu'il n'y a pas de rendez-vous
        // cet ensemble répertorie les agendas récemment ajoutés et sélectionnés. On n'ajoute pas l'event_source pour éviter le fetch
        // mais cela est fait au premier rendez-vous ajouté
        this.new_agenda_no_events = new Set();
        const event_sources = [];
        // liste des agendas
        this.agendas = {};
        for (const child of document.getElementById('agendaList').children) {
            const id = child.id.split("_")[1];
            const  checkbox = child.firstElementChild.firstElementChild;
            this.agendas[id] = {displayed: checkbox.checked, isOwner: true};
            if (checkbox.checked) {
                event_sources.push(get_event_source(id));
            }
        }

        //Récupération de la balise contenant le calendar
        const elementCalendrier = document.getElementById('calendar');
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
                    text: 'Nouvel évènement',
                    icon: 'bi bi-plus-lg',
                    click: function() {
                        getRendezVousModal({}, "/rendezVous/new", (sent, result) => {
                            result = result.toString();
                            if (manager.agendas[result].displayed) {
                                if (manager.new_agenda_no_events.has(result)) {
                                    manager.calendrier.addEventSource(get_event_source(id));
                                    manager.new_agenda_no_events.delete(result);
                                } else {
                                    manager.calendrier.getEventSourceById(result).refetch();
                                }
                            }
                        });
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
            eventSources: event_sources,
            //Gestion du clique sur un rendez vous
            eventClick: function(info) {
                const event = info.event;
                manager.modified_event = event;
                getRendezVousModal({title: event.title, lieu: event.extendedProps.lieu, description: event.extendedProps.description,
                            id: event.groupId, start: event.start, end: event.end, allDay: event.allDay,
                            agenda: event.extendedProps.agendas});  
            },

            eventChange: function(info) {
                const oldEvent = info.oldEvent;
                const first_event = info.event.toPlainObject();
                let earliestStart = info.event.start;
                let earliestEnd = info.event.end;

                // si on modifie la date de début, on supprime les rendez-vous ayant dépassé la date de fin de récurrence
                if (earliestStart.valueOf() != oldEvent.start.valueOf()) {
                    if (info.event.extendedProps.dateFinRecurrence && info.event.start >= info.event.extendedProps.dateFinRecurrence) {
                        info.event.remove();
                    }
                }
                for (const ev of info.relatedEvents) {
                    if (ev.start < earliestStart) {
                        earliestStart = ev.start;
                        earliestEnd = ev.end;
                    }
                    if (ev.extendedProps.dateFinRecurrence && ev.start >= ev.extendedProps.dateFinRecurrence) {
                        ev.remove();
                    }
                }
                const data = {title: first_event.title, lieu: first_event.extendedProps.lieu, description: first_event.extendedProps.description,
                                id: first_event.groupId, start: earliestStart, end: earliestEnd, allDay: first_event.allDay}
                json_fetch("/calendar-rdv", "POST", data)
                .catch((error) => {
                    info.revert();
                });
            }
        });
    }

    init() {
        this.calendrier.render();
    }
    
    /**
     * On déselectionne un agenda
     * @param {String} agenda_id id de l'agenda
     * @param {*} updateCookie booléen pour savoir si on doit mettre à jour le cookie
     */
    deselectionAgenda(agenda_id, updateCookie=true) {
        // // on enlève l'agenda
        // delete this.agendas_periodes[agenda_id];
        // for (const event of this.calendrier.getEvents()) {
        //     if (!event.extendedProps.agendas.some(e => this.agendas_periodes[e] != undefined)) {
        //         const identifier = event.groupId + "_" + event.start.toISOString();
        //         this.events.delete(identifier);
        //         event.remove();
        //     }
        // }
        this.agendas[agenda_id].displayed = false;
        this.calendrier.getEventSourceById(agenda_id).remove();
        if (updateCookie) {
            this.updateCookie();
        }

    }

    /**
     * On sélectionne un agenda
     * @param {String} agenda_id id de l'agenda sélectionné
     */
    selectionAgenda(agenda_id) {
        // l'agenda a été sélectionné
        // this.addData([agenda_id]);
        this.agendas[agenda_id].displayed = true;
        this.calendrier.addEventSource(get_event_source(agenda_id));
        this.updateCookie();
    }

    /**
     * Met à jour les cookies
     */
    updateCookie() {
        json_fetch("/setAgendasCookie", "PUT", {agendas: this.agendas});
    }

    /**
     * On déselectionne tous les agendas
     */
    deselectAll() {
        // this.agendas_periodes = {};
        Object.keys(this.agendas).forEach(id => this.agendas[id].displayed = false);
        // this.events.clear();
        // this.calendrier.removeAllEvents();
        this.calendrier.getEventSources().forEach(es => es.remove());
        this.updateCookie();
    }

    /**
     * ajoute les rendez-vous de tous les agendas (qui n'étaient pas sélectionnés)
     * @param {HTMLCollection} list_agendas liste de tous les agendas
     */
    selectAll(list_agendas) {
        // sinon on récupère les rendez-vous simples des agendas dont on n'a pas encore les infos
        // const new_agendas = [];
        for (const elem of list_agendas.children) {
            const id = elem.id.split("_")[1];
            if (!this.agendas[id].displayed) {
                // new_agendas.push(id);
                this.agendas[id].displayed = true;
                this.calendrier.addEventSource(get_event_source(id));
            }
        }
        // this.addData(new_agendas);
        this.updateCookie();
    }

    /**
     * ajoute un agenda à la liste des agendas
     * @param {object} data Les données de l'agenda 
     * {id: _, agenda: {nom: _, displayed: _, isOwner: _}}
     */
    addAgenda(data) {
        this.agendas[data.id] = {displayed: data.agenda.displayed, isOwner: data.agenda.isOwner};
        if (data.agenda.displayed) {
            this.new_agenda_no_events.add(data.id);
            // this.agendas_periodes[data.id] = new Set([{start: this.calendrier.view.activeStart, end: this.calendrier.view.activeEnd}]);
        }
    }

    /**
     * Supprime l'agenda
     * @param {String} id id de l'agenda supprimé
     * @param {boolean} was_selected si l'agenda était sélectionné avant suppression
     */
    removeAgenda(id, was_selected) {
        if (was_selected) {
            this.deselectionAgenda(id, false);
        }
        delete this.agendas[id];
        // On ne met pas à jour le cookie ici, c'est déjà fait
    }

    // /* Met à jours le calendrier selon la période actuellement visinle */
    // updateDate(start, end){
    //     // liste des agendas dont on devra récupérer des infos
    //     const to_query = [];
    //     // pour chaque agenda...
    //     for (const agenda_id of Object.keys(this.agendas_periodes)) {
    //         const periodes = this.agendas_periodes[agenda_id];
    //         // variable pour savoir si on connait déjà les rendez-vous de l'agenda dans la période
    //         let known = false;
    //         // variables si les rendez-vous simples d'une partie de la période actuellement visible sont connus
    //         // permet de combiner ces périodes (pour garantir l'intersection vide des périodes)
    //         let connect_start = null;
    //         let connect_end = null;
    //         for (const periode of periodes) {
    //             // la période actuellement visible is totalement incluse dans une période dont on connait déjà les rendez-vous
    //             // pas besoin de query
    //             if (start >= periode.start && end <= periode.end) {
    //                 known = true;
    //             }
    //             // la période actuellement visible est partiellement incluse dans une période connue
    //             else if (start >= periode.start) {
    //                 connect_start = periode;
    //             }
    //             else if (end <= periode.end) {
    //                 connect_end = periode;
    //             }
    //             // la période actuellement visible englobe une periode connue (ex : passage de vue Jour -> Mois)
    //             // on supprime les périodes incluses
    //             else {
    //                 periodes.delete(periode);
    //             }
    //         }
    //         // garantit l'intersection vide des périodes
    //         if (connect_start && connect_end) {
    //             const new_start = connect_start.start;
    //             const new_end = connect_end.end;
    //             periodes.delete(connect_start);
    //             periodes.delete(connect_end);
    //             periodes.add({start: new_start, end: new_end});
    //         } else if (connect_start) {
    //             connect_start.end = end;
    //         } else if (connect_end) {
    //             connect_end.start = start;
    //         }
    //         // si on ne connait pas déjà les rendez-vous simples on query
    //         if (!known) {
    //             to_query.push(agenda_id);
    //         }
    //     }
    //     if (to_query.length > 0) {
    //         // pas besoin de mettre à jour les périodes dans la fonction addData, cela a été fait plus haut
    //         this.addData(to_query, false);
    //     }
    // }

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
        if (old_event.extendedProps.idAgenda !== new_event.idAgenda) {
            old_event.setExtendedProp('idAgenda', new_event.idAgenda);
            if (!this.agendas[new_event.idAgenda].displayed) {
                this.remove_events(old_event.groupId);
            }
        }
    }

    remove_events(id) {
        this.calendrier.getEvents().forEach(ev => {
            if (ev.groupId == id) {
                ev.remove();
            }
        });
    }
}

//Initialisation du model
export const agendaManager = new AgendaManager();
agendaManager.init();