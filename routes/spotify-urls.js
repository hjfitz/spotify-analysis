const createAPIUrls = (limit = 50) => [
  `https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=short_term`,
  `https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=medium_term`,
  `https://api.spotify.com/v1/me/top/artists?limit=${limit}&time_range=long_term`,
  `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=short_term`,
  `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=medium_term`,
  `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=long_term`,
];

const scopes = 'user-read-private user-read-email user-top-read';
const callbackUrl = 'https://accounts.spotify.com/authorize'
  + '?response_type=code'
  + `&client_id=${process.env.SPOTIFY_CLIENT_ID}`
  + `&scope=${encodeURIComponent(scopes)}`
  + `&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_CALLBACK_URL)}`;

module.exports = {
  createAPIUrls,
  callbackUrl,
};
