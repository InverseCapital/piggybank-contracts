# PiggyBank

PiggyBank is a protocol for decentralized saving accounts. The main purpose is to help and incentivize people to save money if they have the need to do so.

For example, if someone has an upcoming expense and needs to save some money for it, he can lock a deposit into a smart contract and set a withdrawal date, committing to don't touch that money before that date.
If a user withdraws its deposit before the established date then he will be penalized by paying a fee, which will be redistribued among the users who are actually respecting the terms.

## Architecture

The application will be composed of:

### Smart Contracts

The protocol will live on the Polygon blockchain and it will be composed of a main smart contract that handles the creation and withdraw of deposits and rewards distribution.

## Frontend

It will be possible to interact with the protocol through a web interface. It will be made using Next.js, Tailwind CSS and Wagmi library.
The application will allow users to login with Metamask and create, withdraw and visualize deposits and claim their rewards. It will also show some statistics about the protocol and users behaviour.

## Backend:

We'll need to store some data for analytics purposes on a database. We'll then build an API on top of it which will enable to obtain this data.

## Further Development

In order to generate additional returns for users, the protocol could be improved by using the locked money to generate extra income through trusted DeFi protocols, which would also be distributed among consistent users.

Furthermore, the user experience could improved by adding gamification to the whole process. For example, users could get a score based on how much money they have successfully saved and receive rewards based on this ranking.
