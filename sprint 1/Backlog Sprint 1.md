# Objectif du sprint
Construire le squelette de la partie serveur du projet avec une interface rudimentaire.

# Fonctionnalités
| Nom                                 | Estimation |
|-----------------------------------  |------------|
| Créer un compte                     | 3          |
| S'identifier                        | 2          |
| Se déconnecter                      | 1          |
| Modifier les informations du compte | 2          |
| Créer un agenda                     | 2          |
| Ajouter un rendez-vous              | 3          |

# Descriptions

### Créer un compte
Créer une table Utilisateur dans la BDD.

Créer une ligne dans la table des utilisateurs avec l’email et le mot de passe hachés et salés et le nom d’utilisateur à chaque création de compte.

### S’identifier
Hacher et saler l’email et le mot de passe fournis par l’utilisateur et vérifier que ces informations correspondent à celles dans la base de données puis créer les informations de connexion.

### Se déconnecter
Enlever les données de connexion et renvoyer l’utilisateur vers la page de connexion.

### Modifier les informations du compte
Si un nouveau mot de passe n’est pas fourni, changer les informations du compte dans la base de données par les nouvelles fournies par l’utilisateur.

Si un nouveau mot de passe est fourni, vérifier que l’ancien mot de passe fourni correspond au mot de passe courant, et que le nouveau mot de passe et la confirmation de ce mot de passe correspondent, puis changer les informations du compte dans la base de données par les nouvelles fournies par l’utilisateur.

### Créer un agenda
Créer une table Agenda dans la BDD.

Créer une entité agenda dans la BDD qui est liée à l’entité du compte de l’utilisateur

### Ajouter un rendez-vous
Créer une table Rendez-vous dans la BDD.

Vérifier que la date de début est postérieure à aujourd’hui, puis vérifier que la date de fin est postérieure à la date de début.

Créer une entité rendez-vous dans la BDD avec les données fournies, qui est liée aux entités agenda sélectionnés par l’utilisateur

# Cas d'utilisation

### Créer un compte
Un utilisateur entre un identifiant unique, un email unique et valide, et un mot de passe renseigné deux fois, puis confirme pour créer un compte.

Si l’identifiant ou l’email n’est pas unique, un message s’affiche pour informer que la saisie est incorrecte et empêche la création du compte.

### S’identifier
Un utilisateur renseigne son email et le mot de passe correspondant puis confirme pour se connecter.

Si le mot de passe ne correspond pas à l’email, un message s’affiche pour informer que la saisie est incorrecte et empêche la connexion.

### Se déconnecter
Un utilisateur clique sur le bouton pour fermer la session. Il retourne sur la page de connexion.

### Modifier les informations du compte
Un utilisateur clique sur le bouton de profil afin d’aller sur la page de profil puis clique sur le bouton pour modifier les informations sur la page de son profil et renseigne les nouvelles informations.

S'il souhaite modifier le mot de passe de son compte, il doit renseigner le mot de passe courant ainsi que le nouveau mot de passe 2 fois.

Si les informations saisies sont incorrectes, un message en informe l’utilisateur et empêche la modification des informations du compte.

### Créer un agenda
Un utilisateur clique sur le bouton de création d’un nouvel agenda, une boite modale apparaît où il peut définir le nom de l’agenda.

### Ajouter un rendez-vous

Un utilisateur clique sur le bouton d’ajout de rendez-vous, une boite modale apparaît où l’utilisateur définit un titre, une date de début et de fin, choisit les agenda dans lesquels ajouter le rendez-vous et confirme.
