import Agenda from "../model/Agenda.js";
import AgendaRendezVous from "../model/AgendaRendezVous.js";
import RendezVous from "../model/RendezVous.js";
import { Sequelize } from "sequelize";


/*Fonction gère et renvoie les rendez-vous simples pour des agendas donnés dans une période donnée */
export async function calendarGetData(req, res) {
    if (!res.locals.user) {
        return res.json({err: "not auth"});
    }
    const dateStart = new Date(+req.query.start);
    const dateEnd = new Date(+req.query.end);
    RendezVous.findAll({
        attributes: {
            include: [ 
                [
                    Sequelize.literal(`(
                    SELECT GROUP_CONCAT(arv.idAgenda SEPARATOR ',')
                    FROM AgendaRendezVous AS arv
                    WHERE arv.idRendezVous = RendezVous.id)`),
                    'agendas_id',
                ],
            ],
        },
        include: [
            {
                model: Agenda,
                through: AgendaRendezVous,
                where: {
                    id: {
                        [Sequelize.Op.in]: JSON.parse(decodeURIComponent(req.query.agendas)).map(e => +e)
                    },
                },
            },
        ],
    }).then(rendez_vous => {
        const simples = [];
        for (const rdv of rendez_vous) {
            const agendas_id = rdv.dataValues.agendas_id.split(",");
            for (const simple of rdv.get_rendezVous(dateStart, dateEnd)) {
                simple.agendas = agendas_id;
                simples.push(simple);
            };
        }
        return res.json(simples);
    }).catch(err => {
        console.log(err);
        res.status(500).json({ err: "Internal Server Error" });
    });
}


/*Fonction modifie un rendez vous */
export async function modifierRendezVousCalendarPOST(req, res) {
    if (res.locals.user) {
        try {
            console.log("body data:", req.body);
            //Récupération des champs du form
            const { id, title, lieu, description, start, end, allDay, agendas_to_add, agendas_to_remove, freq_type, freq_number, fin_recurrence, date_fin_recurrence, nb_occurence, recurrent} = req.body;
            //Récupération du rdv avec l'id donné
            const rdvToUpdate = await RendezVous.findByPk(id);
            if (!rdvToUpdate) {
                return res.status(404).json({ message: 'Rendez-vous introuvable' });
            }
            //Sauvegarde du rdv
            rdvToUpdate.dateDebut = new Date(start);
            rdvToUpdate.dateFin = new Date(end);
            rdvToUpdate.titre = title;
            rdvToUpdate.lieu = lieu;
            rdvToUpdate.allDay = allDay;
            rdvToUpdate.description = description;

            //la
            console.log("type de rdv:", recurrent,"Type:", freq_type, "Frequency:", freq_number);
            console.log("Fin recurrence:", fin_recurrence, "Occurrences:", nb_occurence, "End date:", date_fin_recurrence);
            console.log("Updated rdv:", rdvToUpdate);
            if(recurrent === "rec"){
                rdvToUpdate.set("type", freq_type === "s" ? "Regular" : freq_type);
                rdvToUpdate.set("frequence", freq_type === "s" ? 7 * Number(freq_number) : Number(freq_number));
            
                //si type recurrence: date de fin
                if(fin_recurrence === "0"){ 
                    const dateFin = addDays(new Date(date_fin_recurrence), 1);
                    dateFin.setHours(0, 0, 0);
                    rdvToUpdate.set("finRecurrence", dateFin);
                    rdvToUpdate.set("nbOccurrences", null);

                //si type recurrence: nombre d'occurrences limité   
                }else if (fin_recurrence === "1"){
                    rdvToUpdate.set("nbOccurrences", Number(nb_occurence));
                    rdvToUpdate.set("finRecurrence", null);

                //si type recurrence: sans fin / jamais de fin
                }else{
                    rdvToUpdate.set("finRecurrence", null);
                    rdvToUpdate.set("nbOccurrences", null);
                }
            
            //on vide tout si on enleve la recurrence
            }else{
                rdvToUpdate.set("type", null);
                rdvToUpdate.set("frequence", null);
                rdvToUpdate.set("finRecurrence", null);
                rdvToUpdate.set("nbOccurrences", null);
            }

            await rdvToUpdate.save();
            
            for (const agenda of agendas_to_add) {
                await AgendaRendezVous.create({
                    idRendezVous: id,
                    idAgenda: +agenda
                });
            }
            for (const agenda of agendas_to_remove) {
                await (AgendaRendezVous.build({
                    idRendezVous: id,
                    idAgenda: +agenda
                }).destroy());
            }
            return res.status(200).json();

        } catch (error) {
            console.error('Erreur lors de la modification du rdv:', error);
            return res.status(500).json({ message: "Une erreur s'est produite" });
        }
    } else {
        return res.status(403).json({ message: 'Unauthorized access' });
    }
}