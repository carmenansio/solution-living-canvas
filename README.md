# Folder Structure

- **client**: client app development, using Phaser Vite TypeScript Template
- **server**: server that serves the application, using Express.js

## Client

Development

```
cd client
npm install
ng serve
```

Build

```
cd server
npm install
npm run build
cp -r dist ../server/resources
```

## Server

```
npm install
npm run dev
```

## Google Cloud project setup

Install the GCloud SDK to have access to GCloud on the command-line: https://cloud.google.com/sdk/docs/install

Via the Google Cloud console, create a project:
- https://console.cloud.google.com/welcome
- And enable the Gemini API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com?
- And enable the Vertex API: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com

Back in the terminal console, authenticate with GCloud to connect the Cloud project to the server app on the command-line:
```
gcloud auth login
gcloud config set project PROJECT_ID
```
