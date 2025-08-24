# Email & WhatsApp Sender Application

A web application for sending bulk emails and WhatsApp messages to clients.

## Features

- Send personalized emails with HTML templates
- Send WhatsApp messages via WhatsApp Business API
- Upload contact lists via CSV or Excel files
- Track sending progress and results
- Export campaign results

## Setup for Development

1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Start the server: `npm run dev`
5. Open http://localhost:3000 in your browser

## Deployment on Render

1. Fork this repository or push it to your GitHub account
2. Connect your repository to Render
3. Render will automatically detect the render.yaml file and deploy the application

## Environment Variables

For production, set the following environment variables in your Render dashboard:

- `NODE_ENV`: Set to "production"
- `PORT`: The port your application will run on (default: 3000)

## Security Notes

- Never commit sensitive credentials to version control
- Use environment variables for email passwords and WhatsApp tokens
- The uploads directory is ephemeral on Render - files are deleted after processing