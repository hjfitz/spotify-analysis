const fetch = require('node-fetch');

const fetchJson = token => url => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

const artist = resp => resp.items.map(item => ({
  name: item.name,
  url: item.external_urls.spotify,
}));

const track = resp => resp.items.map(item => ({
  name: `${item.name} - ${item.artists[0].name}`,
  url: item.external_urls.spotify,
}));

module.exports = {
  fetchJson,
  format: {
    track,
    artist,
  },
};
