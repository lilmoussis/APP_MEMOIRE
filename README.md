⚙️ CAHIER DES CHARGES FONCTIONNEL

🎯 Objectif du système

Le système vise à automatiser et centraliser la gestion d'un parking à travers une solution matérielle (Arduino) connectée à une plateforme logicielle (Web ou Mobile).
L'objectif principal est de permettre le suivi en temps réel des entrées et sorties des véhicules, la gestion automatique de la facturation, et la supervision du taux d'occupation du parking.

 Acteurs du système

  --------------------------------------------------------------------------
  Acteur         Rôle principal           Accès à la plateforme
  ------------------ ---------------------------- --------------------------
  Super            Supervise, configure et      Interface Web
  Administrateur   contrôle l'ensemble du       
                     système.                     

  Gérant         Gère le flux des véhicules,  Interface Web
                     surveille l'état des places. 

  Arduino        Dispositif physique chargé   Communication automatique
                     de la détection et du        via module Wi-Fi (ESP8266)
                     comptage des véhicules.      
  --------------------------------------------------------------------------

 FONCTIONNALITÉS DU SYSTÈME

1.  Super Administrateur

  ----------------------------------------------------------------------------------
  Fonctionnalité     Description        Entrées    Sorties/Résultats
                                                               attendus
  ---------------------- ---------------------- -------------- ---------------------
  Authentification   Accès sécurisé par     Login, mot de  Accès à l'espace
                         identifiant et mot de  passe.         d'administration.
                         passe.                                

  Configuration du     Définir la capacité    Nombre total   Base de données mise
  nombre de places     totale du parking.     de places.     à jour, affichage du
                                                               total.

  Configuration du     Définir les tarifs     Type de        Table tarifaire
  prix par type de       selon le type (moto,   véhicule, prix enregistrée et
  véhicule             voiture, camion,       par heure.     utilisée pour la
                         etc.).                                facturation.

  Gestion des          Ajouter, modifier,     Formulaire     Liste des gérants
  gérants              supprimer des comptes  gérant (nom,   mise à jour.
                         gérants.               login,         
                                                contact...).   

  Gestion des          Visualiser toutes les  -             Historique détaillé
  entrées/sorties      opérations effectuées.                et export possible
                                                               (PDF, Excel).

  Statistiques       Afficher les           Choix période. Graphiques dynamiques
                         statistiques                          (ex : taux
                         d'utilisation du                      d'occupation, revenu
                         parking (par jour,                    généré...).
                         mois, année).                         

  Gestion de           Génération automatique Données        Facture générée et
  facturation          de factures en         d'entrée et de téléchargeable.
                         fonction du temps      sortie.        
                         passé.                                

  Gestion des cartes   Ajouter ou supprimer   ID de carte,   Association
  (RFID / Badge)       les cartes des usagers informations   carte/véhicule
                         enregistrés.           du véhicule.   sauvegardée.
  ----------------------------------------------------------------------------------


2. Gérant

  ---------------------------------------------------------------------------------
  Fonctionnalité     Description          Entrées   Sorties /
                                                                Résultats
                                                                attendus
  ---------------------- ------------------------ ------------- -------------------
  Authentification   Connexion sécurisée à    Login, mot de Accès aux fonctions
                         son espace personnel.    passe.        autorisées.

  Créer une entrée   Enregistrer manuellement Numéro de     Entrée enregistrée
                         ou automatiquement une   carte ou      et place occupée
                         entrée de véhicule.      plaque.       mise à jour.

  Créer une sortie   Enregistrer le départ    Numéro de     Sortie validée,
                         d'un véhicule.           carte ou      facture générée
                                                  plaque.       automatiquement.

  Gestion de           Génération automatique   Données       Facture générée et
  facturation          de factures en fonction  d'entrée et   téléchargeable.
                         du temps passé.          de sortie.    

  Voir les             Visualiser les données   -            Graphique
  statistiques         de fréquentation du                    synthétique.
                         jour.                                  

  Voir les places      Consulter le nombre de   -            Affichage en temps
  disponibles          places encore libres.                  réel.
  ---------------------------------------------------------------------------------


3.  Fonctionnalités Automatisées

  -------------------------------------------------------------------------
  Fonctionnalité   Description             Éléments matériels
                                                   impliqués
  -------------------- --------------------------- ------------------------
  Détection          Le capteur ultrason détecte Capteurs HC-SR04,
  automatique d'entrée un véhicule et envoie       Arduino Uno, ESP8266
  / sortie           l'information à l'Arduino.  

  Mise à jour        Chaque entrée/sortie        Arduino ↔ Serveur
  automatique des      actualise la base de        
  places             données du parking.         

  Commande de la     La barrière s'ouvre/ferme   Servomoteur connecté à
  barrière           automatiquement selon       Arduino
                       l'état d'entrée/sortie.     

  Transmission des   L'Arduino envoie les        Module ESP8266
  données            données via Wi-Fi vers le   
                       serveur Node.js ou          
                       Firebase.                   
  -------------------------------------------------------------------------

  ------------------------------------------------------------------------
  Composant      Rôle                   Interaction principale
  ------------------ -------------------------- --------------------------
  Arduino        Détection, commande et     Envoie les données d'état
                     communication.             au serveur.

  Serveur          Gère les requêtes, met à   Communication
  Node.js          jour la base de données et bidirectionnelle avec
                     les interfaces.            Arduino et les interfaces.

  Base de données  Stockage centralisé des    Serveur ↔ Interfaces.
  (MongoDB /         données.                   
  Firebase)                                   

  Interface Web /  Visualisation et gestion   Appels API REST et
  Mobile           par l'utilisateur.         WebSocket.
  ------------------------------------------------------------------------

4.  Architecture Fonctionnelle Simplifiée

## Diagramme de classes

Classes clés : Parking, Vehicle, EntryRecord, User, Card.

## Diagramme de séquence (Entrée d'un véhicule)

Scénario : détection -> envoi au serveur -> insertion DB -> ouverture
barrière -> mise à jour Web.

## Diagramme d'activités (Processus d'entrée)

Flux : détection, vérification de disponibilité, ouverture barrière ou
notification plein.


## Diagramme de déploiement

Architecture physique : Arduino (capteurs) ↔ Serveur Node.js ↔ Base de
données ↔ Interface Web.