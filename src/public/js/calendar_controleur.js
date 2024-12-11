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
				let term = document.getElementById('searchRdv').value;
                for (const rdv of rendezVous) {
                    rdv.endRec = rdv.endRec ? new Date(rdv.endRec) : rdv.endRec;
                    rdv.id = rdv.groupId; // permet une suppression + rapide (apparemment)
                    const dates = rdv.dates;
                    delete rdv.dates;
                    for (const date of dates) {
                        const ev = {...rdv};
                        ev.start = new Date(date.start);
                        ev.end = new Date(date.end);
						
						ev.textColor = getTextColorFromBg(rdv.color);
                        events.push(ev);
						if(normalizedStringComparaison(ev.title,term) || normalizedStringComparaison(ev.lieu,term)|| normalizedStringComparaison(ev.description,term)){
							ev.display ='';
						}else{
							ev.display = 'none';			
						}
                    }
                }
                successCallback(events);
            }).catch(err => {
                console.log(err.message);
				failureCallback();
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
					manager.displayAllEvents();
					manager.resetSearchBar();
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
				const idParent = event.extendedProps.idParent;
				const data = { id: event.groupId, titre: event.title, lieu: event.extendedProps.lieu, description: event.extendedProps.description, start: event.start, end: event.end, all_day: event.allDay, type: event.extendedProps.type, fin_recurrence: event.extendedProps.endRec, nbOccurrences: event.extendedProps.nbOccurrences, frequence: event.extendedProps.frequence, agenda: event.extendedProps.agenda, removeButton: true, readonly: event.extendedProps.readonly, color: event._def.ui.backgroundColor, idParent: idParent };
                getRendezVousModal(data, (form_data, which) => {
					if (!which) {
						manager.update_event(event, form_data);
					} else if (which == "this") {
						// if the event we modify is already special
						if (idParent) {
							manager.update_event(event, form_data, true);
						} else {
							const id = event.groupId;
							const start = form_data.startDate;
							const end = form_data.endDate;
							const color = form_data.color;
							const data2 = { id: id, title: form_data.titre, lieu: form_data.lieu, description: form_data.description, agenda: form_data.agenda, start: start, end: end, allDay: form_data.all_day, type: data.type, fin_recurrence: data.fin_recurrence ? data.fin_recurrence.valueOf() : null, nbOccurrences: data.nbOccurrences, frequence: data.frequence, color: color, dateDebutDansParent: data.start.valueOf() };
							json_fetch('/calendar-rdv-rec-instance', 'POST', data2)
							.then(_ => manager.calendrier.getEventSourceById(data.agenda).refetch())
							.catch(error => console.log(error));
						}
					} else if (which == "all") {
						if (idParent) {
							manager.update_event(event, form_data, null, null, true);
						} else {
							manager.update_event(event, form_data, null, true);
						}
					}
                    
                }, () => event.remove());
            },
            datesSet: function(dateInfo) {
                manager.setViewCookies(dateInfo.view.type);
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
	update_event(old_event, new_event, noRec = false, children = false, parent = false) {

		const data_to_send = {}
		let rec_modified = false;
		if (!noRec) {
			if (new_event.type !== old_event.extendedProps.type) {
				data_to_send['type'] = new_event.type;
				rec_modified = true;
			}

			if (new_event.frequence != old_event.extendedProps.frequence) {
				data_to_send['frequence'] = new_event.frequence;
				rec_modified = true;
			}

			const end_rec_value = old_event.extendedProps.endRec ? old_event.extendedProps.endRec.valueOf() : old_event.extendedProps.endRec;
			if (new_event.date_fin_recurrence != end_rec_value) {
				data_to_send['finRecurrence'] = new_event.date_fin_recurrence;
				rec_modified = true;
			}

			if (new_event.nb_occurrence != old_event.extendedProps.nbOccurrences) {
				data_to_send['nbOccurrences'] = new_event.nb_occurrence;
				rec_modified = true;
			}
		}
		let modified = rec_modified;
		let purged = false;
		const update_children_infos = {};
		if (old_event.extendedProps.agenda != new_event.agenda) {
			modified = purged = true;
			data_to_send['idAgenda'] = new_event.agenda;
			if (children || parent) {
				this.removeEventsByParent(children ? old_event.groupId : old_event.extendedProps.idParent);
			} else {
				this.remove_events(old_event.groupId);
			}
		}

		if (new_event.titre != old_event.title) {
			modified = true;
			data_to_send['titre'] = new_event.titre;
			if (!rec_modified && !purged) {
				old_event.setProp('title', new_event.titre);
				update_children_infos['title'] = ['P', new_event.titre];
			}
		}

		let date_modified = false;
		if (new_event.startDate != old_event.start.valueOf()) {
			modified = date_modified = true;
			data_to_send['startGap'] = new_event.startDate - old_event.start.valueOf();
		}

		if (new_event.endDate != old_event.end.valueOf()) {
			modified = date_modified = true;
			data_to_send['endGap'] = new_event.endDate - old_event.end.valueOf();
		}

		if (new_event.all_day != old_event.allDay) {
			modified = date_modified = true;
			data_to_send['allDay'] = new_event.all_day;
		}

		if (date_modified && !rec_modified && !purged) {
			const all_day_opt ={ allDay: new_event.all_day };
			old_event.setDates(new Date(new_event.startDate), new Date(new_event.endDate), all_day_opt);
			update_children_infos['dateDebutDansParent'] = ['E', data_to_send['startGap'] ?? 0];
		}

		if (new_event.lieu != old_event.extendedProps.lieu) {
			modified = true;
			data_to_send['lieu'] = new_event.lieu;
			if (!rec_modified && !purged) {
				old_event.setExtendedProp('lieu', new_event.lieu);
				update_children_infos['lieu'] = ['E', new_event.lieu]; 
			}
		}

		if (new_event.description != old_event.extendedProps.description) {
			modified = true;
			data_to_send['description'] = new_event.description;
			if (!rec_modified && !purged) {
				old_event.setExtendedProp('description', new_event.description);
				update_children_infos['description'] = ['E', new_event.description]; 
			}
		}

		if("#"+new_event.color !== old_event._def.ui.backgroundColor){
			modified = true;
			data_to_send['color'] = new_event.color;
			if (!rec_modified && !purged) {
				const txtCol = getTextColorFromBg(new_event.color);
				old_event.setProp('backgroundColor', "#" +new_event.color);
				old_event.setProp('borderColor',"#" + new_event.color);
				old_event.setProp('textColor', txtCol);
				update_children_infos['backgroundColor'] = ['P', "#" +new_event.color]; 
				update_children_infos['borderColor'] = ['P', "#" +new_event.color]; 
				update_children_infos['textColor'] = ['P', txtCol]; 
			}
		}
		
		// met à jour les rdv simples associés
		if ((children || parent) && !rec_modified && !purged) {
			const visited = new Set();
			for (const ev of this.calendrier.getEvents()) {
				if (((children && ev.extendedProps.idParent == old_event.groupId) || 
				(parent && ((ev.groupId == old_event.extendedProps.idParent) || (ev.idParent == old_event.extendedProps.idParent)))) && !visited.has(ev.groupId)) {
					for (const key of Object.keys(update_children_infos)) {
						const val = update_children_infos[key];
						if (val[0] == 'P') {
							ev.setProp(key, val[1]);
						} else {
							ev.setExtendedProp(key, val[1]);
						}
					}
					visited.add(ev.groupId);
				}
			}
		}

		if (modified) {
			data_to_send['id'] = parent ? old_event.extendedProps.idParent : old_event.groupId;
			data_to_send['rec_changes'] = rec_modified;
			data_to_send['update_spec_date'] = parent || children;
			data_to_send['real_id'] = old_event.groupId;
			json_fetch('/calendar-rdv', 'POST', data_to_send)
			.then(_ => {
				if ((purged && this.agendas[new_event.agenda]) || rec_modified) {
					this.calendrier.getEventSourceById(new_event.agenda).refetch();
				}
			})
			.catch(error => console.log(error));
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
				event.setProp('display','auto');
			}else{
				event.setProp('display','none');			
			}
		});
	}

	/**
	 * Réaffiche tous les rendez vous (désinvisibilise plutôt)
	 */
	displayAllEvents(){
		this.calendrier.getEvents().forEach((event) => {
			event.setProp('display','auto');
		});
	}
	/**
	 * Réinitialise le texte de la barre de recherche
	 */
	resetSearchBar(){
		document.getElementById("searchRdv").value ="";
	}

	removeEventsByParent(id) {
		for (const ev of this.calendrier.getEvents()) {
			if (ev.id == id || ev.extendedProps.idParent == id) {
				ev.remove();
			}
		}

	}
	/**
	 * Permet de récupérer l'interval affiché du calendrier
	 * @returns interval affiché
	 */
	getDisplayedDatInterval(){
		let view = this.calendrier.view;
		return {startDate : view.currentStart,endDate:view.currentEnd}
	}
}

/**
 * Calcul de la luminance, détermine en gros le niveau de luminosité d'une couleur et permet
 * de choisir la bonne couleur de texte (pour eviter de rien y voir)
 * @param {String} bgColor la couleur choisis
 * @returns La couleur du texte
 */
function getTextColorFromBg(bgColor) {
    const color = bgColor.replace('#', '');

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}


export const agendaManager = new AgendaManager();
agendaManager.init();