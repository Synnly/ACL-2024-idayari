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
                            frequence: event.extendedProps.frequence, agenda: event.extendedProps.agenda, removeButton: true};
                getRendezVousModal(data, (data) => {
                    manager.update_event(event, data);
                });
            },

            eventChange: function(info) {
                const oldEvent = info.oldEvent;
                // si on modifie la date de début, on supprime les rendez-vous ayant dépassé la date de fin de récurrence
                if (info.event.start.valueOf() != oldEvent.start.valueOf()) {
                    if (info.event.extendedProps.endRec && info.event.start >= info.event.extendedProps.endRec) {
                        info.event.remove();
                    }
                    for (const ev of info.relatedEvents) {
                        if (ev.extendedProps.endRec && ev.start >= ev.extendedProps.endRec) {
                            ev.remove();
                        }
                    }
                }
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
        const end_rec_value = old_event.extendedProps.endRec ? old_event.extendedProps.endRec.valueOf() : old_event.extendedProps.endRec;
        // si on a changé les infos de recurrence
        // on supprime tous les evenements affichés et on regénère de nouveaux après modifications
        if (new_event.type != old_event.extendedProps.type || new_event.frequence != old_event.extendedProps.frequence ||
            new_event.date_fin_recurrence != end_rec_value || new_event.nb_occurrence != old_event.extendedProps.nbOccurrences) {
            console.log("ok");
            const id = old_event.groupId;
            const startGap = new_event.startDate - old_event.start.valueOf();
            const endGap = new_event.endDate - old_event.end.valueOf();
            this.remove_events(id);
            const data = {id: id, title: new_event.titre, lieu: new_event.lieu, description: new_event.description, agenda: new_event.agenda,
                          startGap: startGap, endGap: endGap, allDay: new_event.allDay, dateFinRecurrence: new_event.date_fin_recurrence,
                          frequence: new_event.frequence, type: new_event.type, nbOccurrences: new_event.nb_occurrence}
            json_fetch("/calendar-rdv", "POST", data)
            .then(_ => {
                if (this.agendas[new_event.agenda].displayed) {
                    this.calendrier.getEventSourceById(new_event.agenda).refetch();
                }
            })
            .catch((error) => {
                console.log(error);
            });
        } else {
            let modified = false;
            let purged = false;
            const old_start_date = old_event.start.valueOf();
            const old_end_date = old_event.end.valueOf();
            if (old_event.extendedProps.agenda !== new_event.agenda) {
                modified = true;
                console.log(old_event.extendedProps.agenda, new_event.agenda);
                old_event.setExtendedProp('agenda', new_event.agenda);
                if (!this.agendas[new_event.agenda].displayed) {
                    this.remove_events(old_event.groupId);
                    purged = true;
                }
            }
            // si les events ont été effacés, pas besoin de vérifier les eventuelles autres modifications
            if (!purged) {
                if (new_event.titre != old_event.title) {
                    old_event.setProp('title', new_event.titre);
                    modified = true;
                }
                if (new_event.startDate != old_event.start.valueOf() || new_event.endDate != old_event.end.valueOf() || new_event.all_day != old_event.allDay) {
                    old_event.setDates(new Date(new_event.startDate), new Date(new_event.endDate), { allDay: new_event.all_day});
                    modified = true;
                }
                if (new_event.lieu != old_event.extendedProps.lieu) {
                    old_event.setExtendedProp('lieu', new_event.lieu);
                    modified = true;
                }
                if (new_event.description != old_event.extendedProps.description) {
                    old_event.setExtendedProp('description', new_event.description);
                    modified = true;
                }
            }
            if (modified) {
                const id = old_event.groupId;
                const startGap = new_event.startDate - old_start_date;
                const endGap = new_event.endDate - old_end_date;
                const data = {id: id, title: new_event.titre, lieu: new_event.lieu, description: new_event.description, agenda: new_event.agenda,
                    startGap: startGap, endGap: endGap, allDay: new_event.allDay}
                json_fetch("/calendar-rdv", "POST", data)
                .catch((error) => {
                    console.log(error);
                });
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