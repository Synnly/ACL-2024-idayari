# Idayari

## Description
Idayari est une application web qui permet de gérer des agendas et rendez-vous.

## Installation
```bash
npm install && npm start 
```

## Fonctionnalités
- Création de compte
    - À partir d'un nom d'utilisateur et d'un mot de passe
- Authentification
- Modifications des informations personnelles
- Création d'agendas
- Création de rendez-vous récurrents ou simples
- Modification ou suppression d'agendas        
- Modification ou suppression de rendez-vous 
- Sélection des agendas affichés (multiple possible)

- Modifier un rendez-vous en récurrent
- Créer un partage d'agenda 
- Ajouter un agenda partagé
- Annuler un partage d'agenda
- Importer un agenda en JSON
- Exporter un agenda en JSON 

- Rechercher un RDV par critères
- Arrêter un partage (côté propriétaire) 
- Partager un agenda de manière sécurisé
- Supprimer un agenda reçu d'un partage 

- Modifier des instances particulières de rendez-vous récurrents
- Supprimer des instances particulières de rendez-vous récurrents

## Auteurs
- FERNANDES DOS SANTOS Emanuel (Synnly)
- LAGARDE Tristan (Niuub)
- AIACHI Morade (radmoparker)
- CUNY Mederic (CMederic, Az-Teck)
- MAVOUNGOU Franck (Outsider1010)
- BASUALDO Lautaro (Lautaro Basualdo)

## Lien
Trello : https://trello.com/invite/b/66e83d0065d4b233d7f78c49/ATTI4d79310e1555c5c599467cb6075aa3d49DDBB039/acl

## Mode d'emploi 
- Modifier des instances particulières de rendez-vous récurrents : 
    - Modifier la récurrence dans une instance particulière pour cette instance uniquement ne fait rien (et c'est normal)
    - Modifier l'agenda attaché au rdv empeche de créer des instances particulières de ce rdv
    - Modifier la date du rendez-vous global n'affecte pas la date des instances spéciales et vice-versa (même en sélectionnant "pour tous  les rendez-vous")

- Rechercher un RDV par critères :
    - La recherche s'effectue sur les agendas séléctionnés
    - La recherche trouve des correspondance dans les champs titre, description et lieu
    - On peut naviguer entre les mois, (dé)séléctionner les agendas pendant la recherche (recherche dynamique)

- Partager un agenda :
    - Suppression d'un ou plusieurs utilisateurs
    - Partage vers un ou plusieurs utilisateurs
    