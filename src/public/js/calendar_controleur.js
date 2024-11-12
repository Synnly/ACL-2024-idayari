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
                    rdv.endRec = rdv.endRec ? new Date(rdv.endRec) : rdv.endRec;
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
                        getRendezVousModal({}, (data) => {
                            json_fetch("/rendezVous/new", "POST", data)
                            .then(response => response.json())
                            .then(result => {
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
                const data = {id: event.groupId, titre: event.title, lieu: event.extendedProps.lieu, description: event.extendedProps.description,
                            start: event.start, end: event.end, all_day: event.allDay, type: event.extendedProps.type, 
                            fin_recurrence: event.extendedProps.endRec, nbOccurrences: event.extendedProps.nbOccurrences,
                            frequence: event.extendedProps.frequence, agenda: event.extendedProps.idAgenda, removeButton: true};
                getRendezVousModal(data, (data) => {
                    manager.update_event(event, data);
                });
            },

            eventChange: function(info) {
                manager.go = false;
                const oldEvent = info.oldEvent;
                const first_event = info.event.toPlainObject();
                let earliestStart = info.event.start;
                let earliestEnd = info.event.end;

                // si on modifie la date de début, on supprime les rendez-vous ayant dépassé la date de fin de récurrence
                if (earliestStart.valueOf() != oldEvent.start.valueOf()) {
                    if (info.event.extendedProps.endRec && info.event.start >= info.event.extendedProps.endRec) {
                        info.event.remove();
                    }
                }
                for (const ev of info.relatedEvents) {
                    if (ev.start < earliestStart) {
                        earliestStart = ev.start;
                        earliestEnd = ev.end;
                    }
                    if (ev.extendedProps.endRec && ev.start >= ev.extendedProps.endRec) {
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
        Object.keys(this.agendas).forEach(id => this.agendas[id].displayed = false);
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

    /*Mise à jour d'un rdv dans le fullcalendar (après sa modification) */
    update_event(old_event, new_event){
        if (new_event.freq_type != old_event.extendedProps.type || new_event.freq_number != old_event.extendedProps.frequence ||
            new_event.date_fin_recurrence != old_event.extendedProps.endRec || new_event.nb_occurrence != old_event.extendedProps.nbOccurrences) {
            const id = old_event.groupId;
            this.remove_events(id);
            const data = {id: id, dateFinRecurrence: new_event.date_fin_recurrence ? new Date(new_event.date_fin_recurrence) : new_event.date_fin_recurrence,
                          frequence: new_event.freq_number, type: new_event.freq_type, nbOccurrences: new_event.nb_occurrence}
            fetch("/calendar-rdv", {
                method: "POST", headers: {"Content-Type": "application/json"},body: JSON.stringify(data)
            })
            .then(_ => {
                
            })
            .catch((error) => {
                console.log(error);
            });
        } else {
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
    }

    // pourraît être optimisé
    remove_events(id) {
        this.calendrier.getEvents().forEach(ev => {
            if (ev.groupId === id) {
                ev.remove();
            }
        });
    }
}

//Initialisation du model
export const agendaManager = new AgendaManager();
agendaManager.init();