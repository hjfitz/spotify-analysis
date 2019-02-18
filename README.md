## Spotify Analysis

## Prerequisites
1. Mongo
2. Node >=10
3. yarn

## Running
1. clone: `git clone https://github.com/hjfitz/spotify-analysis`
2. get a client id/secret from github here: https://developer.spotify.com/dashboard/applications
3. copy .env-sample to .env and update the details accordingly
4. install deps: `yarn`
5. run! `yarn start`

### .env
* `SPOTIFY_CLIENT_ID`: Client ID from Spotify
* `SPOTIFY_CLIENT_SECRET`: Client secret from Spotify
* `SPOTIFY_CALLBACK_URL`: The URL you setup on your app within Spotify dev tools. Make sure the url is /callback.