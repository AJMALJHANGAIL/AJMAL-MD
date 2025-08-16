# LegendX-MD (Deployable)

This repo is prepared to be easily deployed to **Heroku**, **Railway**, **Replit**, or **Docker**.

## Quick local
```
npm install
node index.js
```

## Heroku (one-click)
- If you push this repo to GitHub, you can add a Heroku Deploy button in README:
```
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=YOUR_GITHUB_REPO_URL)
```
Or use the GitHub Action included (set HEROKU_API_KEY, HEROKU_APP_NAME, HEROKU_EMAIL in repo secrets).

## Railway
- Create a new project on Railway and deploy from GitHub. Set `SESSION_ID` in Environment.

## Replit
- Import from GitHub and run. .replit file automates install+run.

## Docker
- `docker build -t legendx-md .`
- `docker run -e SESSION_ID="<base64>" -v $(pwd)/sessions:/app/sessions -p 9090:9090 legendx-md`

## Notes
- Keep `sessions/` private. Don't commit your session credentials to public repos.
- `SESSION_ID` is optional (you can pair via QR). If you have base64 creds, set it as env var.
