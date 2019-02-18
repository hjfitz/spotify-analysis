const express = require('express');
const queryString = require('querystring');
const request = require('request-promise');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const { Schema } = mongoose;
const router = express.Router();

mongoose.connect('mongodb://localhost/test');

mongoose.connection.once('open', () => {
  console.log('*hacker voice* were in');
});

// forgive me father for I have sinned
const userSchema = new Schema({
  displayname: {
    type: String,
    unique: true,
  },
  tracks: Object,
  artists: Object,
});

const User = mongoose.model('User', userSchema);

const fetchJson = token => url => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
const format = resp => resp.items.map(item => ({
  name: item.name,
  url: item.external_urls.spotify,
}));

const formatTrack = resp => resp.items.map(item => ({
  name: `${item.name} - ${item.artists[0].name}`,
  url: item.external_urls.spotify,
}));
/* GET home page. */
router.get('/', async (req, res) => {
  const get = fetchJson(req.session.at);
  // console.log(req.session);
  if (req.session.at) {
    const urls = [
      'https://api.spotify.com/v1/me',

      'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=short_term',
      'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term',
      'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=long_term',

      'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term',
      'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term',
      'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term',
    ];
    const [
      userInfo,
      artistsShort,
      artistsMed,
      artistsLon,
      tracksShort,
      tracksMed,
      tracksLon,
    ] = await Promise.all(urls.map(get));
    const userProps = {
      displayname: userInfo.display_name,
      tracks: {
        long: formatTrack(tracksLon),
        med: formatTrack(tracksMed),
        short: formatTrack(tracksShort),
      },
      artists: {
        long: format(artistsLon),
        med: format(artistsMed),
        short: format(artistsShort),
      },
    };
    console.log(`>parsed for ${userInfo.display_name}`);
    const newUser = new User(userProps);
    const exists = await User.find({ displayname: userInfo.display_name });
    if (exists.length) {
      await User.deleteMany({ displayname: userInfo.display_name });
    }
    await newUser.save();

    return res.render('info', { title: userInfo.display_name, userProps });
  }
  return res.render('index', { title: 'Spotify Analyser' });
});


router.get('/all', async (req, res) => {
  if (!req.session.at) return res.redirect('/login');
  const users = (await User.find({})).map(user => ({
    name: user.displayname,
  }));
  return res.render('all', { users });
});

router.get('/callback', async (req, res) => {
  const base = 'https://accounts.spotify.com/api/token';
  const body = queryString.stringify({
    code: req.query.code,
    grant_type: 'authorization_code',
    redirect_uri: encodeURI(process.env.SPOTIFY_CALLBACK_URL),
  });
  const auth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const opts = {
    body,
    method: 'POST',
    uri: base,
    headers: {
      'Content-Length': body.length,
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${auth}`,

    },
  };
  // send body to google and wait for AT/ID Token
  const resp = await request(opts);
  const { access_token: at } = JSON.parse(resp);
  req.session.at = at;
  res.redirect('/');
});

router.get('/login', (req, res) => {
  const scopes = 'user-read-private user-read-email user-top-read';
  const url = 'https://accounts.spotify.com/authorize'
  + '?response_type=code'
  + `&client_id=${process.env.SPOTIFY_CLIENT_ID}`
  + `&scope=${encodeURIComponent(scopes)}`
  + `&redirect_uri=${encodeURIComponent(process.env.SPOTIFY_CALLBACK_URL)}`;
  res.redirect(url);
});

router.get('/:display_name', async (req, res) => {
  if (!req.session.at) return res.redirect('/login');
  const user = await User.find({ displayname: decodeURIComponent(req.params.display_name) });
  return res.json(user);
});


module.exports = router;
