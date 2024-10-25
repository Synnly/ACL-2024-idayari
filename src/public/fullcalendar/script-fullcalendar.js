import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list';

const elementCalendrier = document.getElementById('calendar');
let debut = new Date("2024-10-23 09:00:00");

let fin = new Date("2024-10-23 010:00:00");

let evenements = [{"title": "Ceci est mon premier rdv","start": debut,"end": fin}]



window.onload = () =>{ let calendrier = new Calendar(elementCalendrier,{
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
    //initialView: 'dayGridWeek'
    // initialView: 'dayGridDay'
    // initialView: 'dayGridMonth'
    // initialView:'timeGridWeek'
    // initialView:'timeGridDay'
    // initialView:'list'
     events:evenements



});
calendrier.render();
}
console.log('Hello motto');

// document.addEventListener('DOMContentLoaded', function() {
//     const calendarEl = document.getElementById('calendar')
//     const calendar = new Calendar(calendarEl, {
//       plugins: [dayGridPlugin],
//       headerToolbar: {
//         left: 'prev,next today',
//         center: 'title',
//         right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
//       }
//     })
//     calendar.render()
//   })