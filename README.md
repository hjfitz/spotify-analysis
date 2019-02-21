## Spotify Analysis

## Prerequisites
* Docker

if not docker:
* Node 10
* yarn
* mongo
## Running
* clone: `git clone https://github.com/hjfitz/spotify-analysis`
* get a client id/secret from spotify here: https://developer.spotify.com/dashboard/applications
* copy .env-sample to .env and update the details accordingly
* run! `docker-compose up`
**or if not using docker:**
* Instal dependencies and run! `yarn && yarn start`
### .env
* `SPOTIFY_CLIENT_ID`: Client ID from Spotify
* `SPOTIFY_CLIENT_SECRET`: Client secret from Spotify
* `SPOTIFY_CALLBACK_URL`: The URL you setup on your app within Spotify dev tools. Make sure the url is /callback.