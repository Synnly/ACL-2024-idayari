# Objectif du sprint

Ajouter le style général du site, visualiser les agendas, modifier les agendas et rendez-vous

# Fonctionnalités

| Nom                                  | Estimation |
| ------------------------------------ | ---------- |
| Modifier un agenda                   | 1          |
| Supprimer un agenda                  | 1          |
| Ajouter un rendez-vous récurrent     | 4          |
| Modifier un rendez-vous en récurrent | 2          |
| Modifier un rendez-vous              | 3          |
| Supprimer un rendez-vous             | 1          |
| Visualiser un agenda                 | 8          |
| Changer d’agenda affiché             | 3          |

# Descriptions

### Modifier un agenda

Modifier les champs d’un agenda

### Supprimer un agenda

Supprimer un agenda de la base de données.

### Ajouter un rendez-vous récurrent

Ajouter un rendez vous qui se répète à intervalles régulières

### Modifier la récurrence d'un rendez-vous

Modifier un rendez-vous afin qu’il se répète à intervalles régulières

### Modifier un rendez-vous

Modifier les champs d’un rendez-vous

### Supprimer un rendez-vous

Supprimer un rendez-vous de la base de données.

### Visualiser un agenda

Visualiser les rendez d’un agenda sélectionné dans une même interface.

### Changer d’agendas affiché

Sélectionner le(s) agendas à afficher dans une même interface

# Cas d'utilisation

### Modifier un agenda

L'utilisateur rentre le nouveau nom de l'agenda puis clique sur le bouton de sauvegarde.

### Supprimer un agenda

L'utilisateur va sur la page de modification de l'agenda puis clique sur le bouton de suppression puis confirme sa suppression dans la modale.

### Ajouter un rendez-vous récurrent

L'utilisateur ajoute un rendez-vous, choisit la date de début, la date de fin. Il indique qu'il est récurrent avec la date de fin de la récurrence, le nombre de récurrences ou rien pour une récurrence infinie puis choisit entre deux types de récurrences :

- Soit il est à intervalle régulier et il choisit le nombre de jours entre chaque récurrence.
- Sinon il chosit un point fixe :
  - Soit un jour du mois
  - Soit un jour de l'année

L'utilisateur confirme la création en cliquant sur un bouton.

### Modifier la récurrence d'un rendez-vous

Si le rendez-vous est récurrent l'utilisateur peut modifier la récurrence ou la supprimer.

Si le rendez-vous n'est pas récurrent l'utilisateur peut indiquer la date de fin de la récurrence, le nombre de récurrences ou rien pour une récurrence infinie puis choisit entre deux types de récurrences :

- Soit il est à intervalle régulier et il choisit le nombre de jours entre chaque récurrence.
- Sinon il chosit un point fixe :
  - Soit un jour du mois
  - Soit un jour de l'année

L'utilisateur confirme la modification en cliquant sur un bouton.

### Modifier un rendez-vous

L'utilisateur renseigne les nouvelles informations du rendez-vous et confirme les modification en cliquant sur un bouton.

### Supprimer un rendez-vous

L'utilisateur va sur la page de modification du rendez-vous puis clique sur le bouton de suppression puis confirme sa suppression dans la modale.

### Visualiser un agenda

L'utilisateur visualise l'agenda pour le mois courant. Il peut avancer ou reculer d'un mois et cliquer sur les rendez-vous du mois pour les modifier

### Changer d’agendas affiché

L'utilisateur sélectionne les agendas qu'il veut visualiser parmis la liste de ses agendas. Si l'utilisateur selectionne un agenda déjà visualisé il est désélectionné.
