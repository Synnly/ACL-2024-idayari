import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { getRendezVousModal } from '/js/script_rendez_vous.js';
import { json_fetch,normalizedStringComparaison } from './utils.js';

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
                    return ;
                }
                const events = [];
                for (const rdv of rendezVous) {
                    rdv.endRec = rdv.endRec ? new Date(rdv.endRec) : rdv.endRec;
                    rdv.id = rdv.groupId; // permet une suppression + rapide (apparemment)
                    const dates = rdv.dates;
                    delete rdv.dates;
                    for (const date of dates) {
                        const ev = {...rdv};
                        ev.start = new Date(date.start);
                        ev.end = new Date(date.end);
                        events.push(ev);
                    }
                }
                successCallback(events);
            }).catch(err => {
                console.log(err.message);
            });
        },
        id: agenda_id
    };
}

function newRendezVous(manager, _data) {
	getRendezVousModal(_data, (data) => {
		json_fetch('/rendezVous/new', 'POST', data)
			.then((response) => response.json())
			.then((result) => {
				result = result.toString();
				if (manager.agendas[result]) {
					if (manager.new_agenda_no_events.has(result)) {
						manager.calendrier.addEventSource(get_event_source(id));
						manager.new_agenda_no_events.delete(result);
					} else {
						manager.calendrier.getEventSourceById(result).refetch();
					}
					manager.resetSearchBar()
					manager.displayAllEvents();
				}
			});
	});
}

class AgendaManager {
	constructor() {
		const manager = this;
		// pour éviter de faire une requête pour un agenda dont on sait qu'il n'y a pas de rendez-vous
		// cet ensemble répertorie les agendas récemment ajoutés et sélectionnés. On n'ajoute pas l'event_source pour éviter le fetch
		// mais cela est fait au premier rendez-vous ajouté
		this.new_agenda_no_events = new Set();
		const event_sources = [];
		// liste des agendas
		this.agendas = {};
		for (const child of document.getElementById('agendaList').children) {
			const id = child.id.split('_')[1];
			const checkbox = child.firstElementChild.firstElementChild;
			this.agendas[id] = checkbox.checked;
			if (checkbox.checked) {
				event_sources.push(get_event_source(id));
			}
		}

        //Récupération de la balise contenant le calendar
        const elementCalendrier = document.getElementById('calendar');
        const options = {
            //Appel des différents composants 
            plugins : [dayGridPlugin,timeGridPlugin,listPlugin, bootstrap5Plugin, interactionPlugin],
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
            selectable: true,
            customButtons: {
                new_event: {
                    text: 'Nouvel évènement',
                    icon: 'bi bi-plus-lg',
                    click: function() {
                        newRendezVous(manager, {});
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
                const data = { id: event.groupId, titre: event.title, lieu: event.extendedProps.lieu, description: event.extendedProps.description, start: event.start, end: event.end, all_day: event.allDay, type: event.extendedProps.type, fin_recurrence: event.extendedProps.endRec, nbOccurrences: event.extendedProps.nbOccurrences, frequence: event.extendedProps.frequence, agenda: event.extendedProps.agenda, removeButton: true, readonly: event.extendedProps.readonly };
                getRendezVousModal(data, (data) => {
                    manager.update_event(event, data);
                });
            },
            datesSet: function(dateInfo) {
                manager.setViewCookies(dateInfo.view.type);
				manager.resetSearchBar();
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
            },

            select: function(selectionInfo) {
                newRendezVous(manager, {start: selectionInfo.start, end: selectionInfo.end, all_day: selectionInfo.allDay});
            }
        };
        if (savedViewType) {
            options.initialView = savedViewType;
            options.initialDate = savedDateStart;
        }
        this.calendrier = new Calendar(elementCalendrier,options);
    }

	init() {
		this.calendrier.render();
	}

	/**
	 * On déselectionne un agenda
	 * @param {String} agenda_id id de l'agenda
	 * @param {*} updateCookie booléen pour savoir si on doit mettre à jour le cookie
	 */
	deselectionAgenda(agenda_id, updateCookie = true) {
		this.agendas[agenda_id] = false;
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
		this.agendas[agenda_id] = true;
		this.calendrier.addEventSource(get_event_source(agenda_id));
		this.updateCookie();
	}

	/**
	 * Met à jour les cookies
	 */
	updateCookie() {
		json_fetch('/setAgendasCookie', 'PUT', { agendas: this.agendas });
	}

    setViewCookies(view) {
        json_fetch("/setViewCookies", "PUT", {viewType: view, start: this.calendrier.view.currentStart.toISOString()});
    }

    /**
     * On déselectionne tous les agendas
     */
    deselectAll() {
        Object.keys(this.agendas).forEach(id => this.agendas[id] = false);
        this.calendrier.getEventSources().forEach(es => es.remove());
        this.updateCookie();
    }

    /**
     * ajoute les rendez-vous de tous les agendas (qui n'étaient pas sélectionnés)
     * @param {HTMLCollection} list_agendas liste de tous les agendas
     */
    selectAll(list_agendas) {
        // on récupère les rendez-vous simples des agendas dont on n'a pas encore les infos
        for (const elem of list_agendas.children) {
            const id = elem.id.split("_")[1];
            if (!this.agendas[id]) {
                // new_agendas.push(id);
                this.agendas[id]= true;
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
		this.agendas[data.id] = data.agenda.displayed;
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
	update_event(old_event, new_event) {
		const end_rec_value = old_event.extendedProps.endRec ? old_event.extendedProps.endRec.valueOf() : old_event.extendedProps.endRec;
		// si on a changé les infos de recurrence
		// on supprime tous les evenements affichés et on regénère de nouveaux après modifications
		if (new_event.type != old_event.extendedProps.type || new_event.frequence != old_event.extendedProps.frequence || new_event.date_fin_recurrence != end_rec_value || new_event.nb_occurrence != old_event.extendedProps.nbOccurrences) {
			const id = old_event.groupId;
			const startGap = new_event.startDate - old_event.start.valueOf();
			const endGap = new_event.endDate - old_event.end.valueOf();
			this.remove_events(id);
			const data = { id: id, title: new_event.titre, lieu: new_event.lieu, description: new_event.description, agenda: new_event.agenda, startGap: startGap, endGap: endGap, allDay: new_event.allDay, dateFinRecurrence: new_event.date_fin_recurrence, frequence: new_event.frequence, type: new_event.type, nbOccurrences: new_event.nb_occurrence };
			json_fetch('/calendar-rdv', 'POST', data)
				.then((_) => {
					if (this.agendas[new_event.agenda]) {
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
				old_event.setExtendedProp('agenda', new_event.agenda);
				if (!this.agendas[new_event.agenda]) {
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
					old_event.setDates(new Date(new_event.startDate), new Date(new_event.endDate), { allDay: new_event.all_day });
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
				const data = { id: id, title: new_event.titre, lieu: new_event.lieu, description: new_event.description, agenda: new_event.agenda, startGap: startGap, endGap: endGap, allDay: new_event.allDay };
				json_fetch('/calendar-rdv', 'POST', data).catch((error) => {
					console.log(error);
				});
			}
		}
	}

	remove_events(id) {
		let elem = this.calendrier.getEventById(id);
		while (elem) {
			elem.remove();
			elem = this.calendrier.getEventById(id);
		}
	}
	/**
	 * Filtrage des rendez vous par terme recherché
	 * @param {*} term (terme recherché dans les titres/lieux/descriptions)
	 */
	filterByTerm(term){
		this.calendrier.getEvents().forEach((event) => {
			if(normalizedStringComparaison(event.title,term) || normalizedStringComparaison(event.extendedProps.lieu,term)|| normalizedStringComparaison(event.extendedProps.description,term)){
				//classNames est la listes des classes css associé à l'event
				event.setProp('classNames', event.classNames.filter(classe => classe !== 'invisible-rdv'));
				event.setExtendedProp('hidden',false);
			}else{
				event.setExtendedProp('hidden',true);
				event.setProp('classNames', [...event.classNames, 'invisible-rdv']);
			}
		});
	}

	/**
	 * Réaffiche tous les rendez vous
	 */
	displayAllEvents(){
		this.calendrier.getEvents().forEach((event) => {
			event.setProp('classNames', event.classNames.filter(classe => classe !== 'invisible-rdv'));
		});
	}
	/**
	 * Réinitialise le texte de la barre de recherche
	 */
	resetSearchBar(){
		document.getElementById("searchRdv").value ="";
	}
}

export const agendaManager = new AgendaManager();
agendaManager.init();