# Project Blitzkarte
Blitzkarte means "Lightning Map" in German, and it is a program which automates a global variation of the social game Diplomacy.
Players control a country as they cooperate and compete to be among the 3 winners.
It is a turn based game where players submit orders for their countries in secret, and then orders are simultaneously processed and announced, revealing everyone's true colors.

Please keep in mind this is currently a work in progress.
## Erzahler
Erzahler is the backend for Blitzkarte. Maintaining a playful German name, it is the "storyteller" for the project, tracking the progress for games, player settings, and more.

## Key Features
### Authentication and Authorization
Users are essentially identified by their username linked with their Google Firebase ID.
Any sensitive request, such as a getting a country's orders, is done by presenting the Firebase idToken, rather than a country name or ID.
For example, when a user playing Brazil and their orders for a game, the underlying request is "This is my idToken, what are my current orders for this game?".
Erzahler will take the token, confirm the authenticity and retrieve the Firebase UID, which is then related to a player, and the associated country can be referenced.
This mechanism prevents the privacy issue of a country id based request such as "What are the orders for Brazil in this game?"

### Proper Development, Testing and Production Workflow
Two pairs of EC2s are dedicated to the testing and live environments.
Utilizing test and www subdomain DNS routing, main and test branches are managed independently, with different databases for each.
This allows for responsible test-driven development of new features in one environment which will not disturb smooth operations of production operations.

## Implementation
Express and Postgres harmonize to track everything in a very intentful database architecture.
Users are tracked with Firebase and linked to their Blitzkarte-specific username.
DB requests are made streamlined through PG-Promise.

## Technologies:
<img height="30" src="https://img.shields.io/badge/typescript-blue?style=for-the-badge&logo=typescript&logoColor=white" />
<img height="30" src="https://img.shields.io/badge/express-white?style=for-the-badge&logo=express&logoColor=blue" />
<img height="30" src="https://img.shields.io/badge/postgresql-white?style=for-the-badge&logo=postgresql&logoColor=blue" />
<img height="30" src="https://img.shields.io/badge/firebase-blue?style=for-the-badge&logo=firebase&logoColor=orange" />
<img height="30" src="https://img.shields.io/badge/pg_promise-black?style=for-the-badge&logo=node.js&logoColor=green" />
