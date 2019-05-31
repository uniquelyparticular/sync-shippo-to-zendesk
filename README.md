# @particular./sync-shippo-to-zendesk

[![npm version](https://img.shields.io/npm/v/@particular./sync-shippo-to-zendesk.svg)](https://www.npmjs.com/package/@particular./sync-shippo-to-zendesk) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![CircleCI](https://img.shields.io/circleci/project/github/uniquelyparticular/sync-shippo-to-zendesk.svg?label=circleci)](https://circleci.com/gh/uniquelyparticular/sync-shippo-to-zendesk)
![dependency status: david](https://img.shields.io/david/uniquelyparticular/sync-shippo-to-zendesk.svg)

> Add a Zendesk Sunshine Event whenever a Shipping Status change is triggered in Shippo

Asynchronous microservice that is triggered by [Shippo](https://goshippo.com) webhooks to create a Sunshine Event inside of [Zendesk](https://zendesk.com).

Built with [Micro](https://github.com/zeit/micro)! 🤩

## 🛠 Setup

Both a [Zendesk](https://zendesk.com) _and_ [Shippo](https://goshippo.com) account are needed for this to function.

Create a `.env` at the project root with the following credentials:

```dosini
ZENDESK_SUBDOMAIN=
ZENDESK_INTEGRATION_EMAIL=
ZENDESK_INTEGRATION_SECRET=
```

`ZENDESK_SUBDOMAIN` is the first part of the URL for your Zendesk account (ie. https://{ZENDESK_SUBDOMAIN}.zendesk.com/).

While logged in to your Zendesk instance create a new User to run the Webhooks under by going to `Settings` > `People` > `Add User` > `Role: Staff`; this email address will be used as your `ZENDESK_INTEGRATION_EMAIL` above.

Find your `ZENDESK_INTEGRATION_SECRET` within your Zendesk instance by going to `Settings` > `API` > enable `Token Access` > add `Active API Tokens [+]` > `API Token`.

## 📦 Package

Run the following command to build the app

```bash
yarn install
```

Start the development server

```bash
yarn dev
```

The server will typically start on PORT `3000`, if not, make a note for the next step.

Start ngrok (change ngrok port below from 3000 if yarn dev deployed locally on different port above)

```bash
ngrok http 3000
```

Make a note of the https `ngrok URL` provided.

## ⛽️ Usage

Next head over to the Shippo [API Settings](https://app.goshippo.com/settings/api) area, add a new webhook with the following details:

| Event Type    | Mode   | URL                 |
| ------------- | ------ | ------------------- |
| Track Updated | `Test` | _`ngrok URL` above_ |

## 🚀 Deploy

You can easily deploy this function to [now](https://now.sh).

_Contact [Adam Grohs](https://www.linkedin.com/in/adamgrohs/) @ [Particular.](https://uniquelyparticular.com) for any questions._
