const express = require('express');
const queryString = require('querystring');
const request = require('request-promise');
const mongoose = require('mongoose');
const { callbackUrl, createAPIUrls } = require('./spotify-urls');
const { fetchJson, format } = require('./util');

const { Schema } = mongoose;
const router = express.Router();

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

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


/* GET home page. */
router.get('/', async (req, res) => {
  const get = fetchJson(req.session.at);
  // console.log(req.session);
  if (req.session.at) {
    const userInfo = await get('https://api.spotify.com/v1/me');
    const exists = await User.find({ displayname: userInfo.display_name });
    if (exists.length) {
      res.render('info', { title: exists[0].displayname, userProps: exists[0] });
      await User.deleteMany({ displayname: userInfo.display_name });
    } else {
      const urls = createAPIUrls(50);
      const [
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
          long: format.track(tracksLon),
          med: format.track(tracksMed),
          short: format.track(tracksShort),
        },
        artists: {
          long: format.artist(artistsLon),
          med: format.artist(artistsMed),
          short: format.artist(artistsShort),
        },
      };
      console.log(`>parsed for ${userInfo.display_name}`);
      const newUser = new User(userProps);
      await newUser.save();
      return res.render('info', { title: userInfo.display_name, userProps });
    }
  }
  return res.render('index', { title: 'Spotify Analyser', callbackUrl });
});


router.get('/all', async (req, res) => {
  if (!req.session.at) return res.redirect(callbackUrl);
  const users = await User.find({});
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
  console.log(JSON.parse(resp));
  req.session.at = at;
  res.redirect('/');
});


router.get('/:display_name', async (req, res) => {
  if (!req.session.at) return res.redirect(callbackUrl);
  const user = await User.find({ displayname: decodeURIComponent(req.params.display_name) });
  return res.json(user);
});


module.exports = router;
