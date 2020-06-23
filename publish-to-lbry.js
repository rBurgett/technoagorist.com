const request = require('superagent');
const fs = require('fs-extra-promise');
const path = require('path');

/*
http://localhost:5279/
{
  "method": "publish",
  "params": {
    "name": "a-new-stream",
    "bid": "1.0",
    "file_path": "/tmp/tmpxe9u833p",
    "validate_file": false,
    "optimize_file": false,
    "tags": [],
    "languages": [],
    "locations": [],
    "channel_account_id": [],
    "funding_account_ids": [],
    "preview": false,
    "blocking": false}
}
*/

const base = path.resolve(__dirname);
const mediaDir = path.join(base, 'media');
const dataDir = path.join(base, 'data');
const videosDir = path.join(base, 'videos');

const getEpisodes = async function() {
  const episodesDir = path.join(dataDir, 'episodes');
  const folders = await fs.readdirAsync(episodesDir);
  const episodes = [];
  for(const folder of folders) {
    const episodeDir = path.join(episodesDir, folder);
    const data = await fs.readJsonAsync(path.join(episodeDir, 'episode.json'));
    const notes = await fs.readFileAsync(path.join(episodeDir, 'notes.md'), 'utf8');
    episodes.push(Object.assign({}, data, {NOTES: notes}));
  }
  return episodes;
};

(async function() {
  try {

    const episodes = await getEpisodes();

    // console.log(JSON.stringify(episodes[episodes.length - 1], null, '  '));

    // const { body } = await request
    //   .post('http://localhost:5279')
    //   .set('Content-Type', 'application/json')
    //   .send({
    //     method: 'account_list',
    //     params: {
    //       show_seed: true
    //     }
    //   });
    // console.log(JSON.stringify(body, null, '  '));
    // await fs.writeJsonAsync('wallets.json', body);
    // return;

    // const { body } = await request
    //   .post('http://localhost:5279')
    //   .set('Content-Type', 'application/json')
    //   .send({
    //     method: 'resolve',
    //     params: {
    //       urls: '@TechnoAgorist#8/ta_0013#f'
    //       // urls: 'iphone-video-camera#2659b289a213993e907ade68027472f65d56e72b'
    //       // urls: 'pewdiepie#a'
    //     }
    //   });
    // console.log(JSON.stringify(body, null, '  '));
    // return;

    const { body } = await request
      .post('http://localhost:5279')
      .set('Content-Type', 'application/json')
      .send({
        method: 'get',
        params: {
          uri: 'lbry://@ThisIsMLGA#5/mlga_0029#e',
          save_file: false
        }
      });
    console.log(JSON.stringify(body, null, '  '));
    return;

    for(const episode of episodes.slice(-1)) {

      const { NUMBER } = episode;
      let numberStr = NUMBER.toString();
      while(numberStr.length < 4) {
        numberStr = '0' + numberStr;
      }

      const name = `ta_${numberStr}`;
      console.log(name);

      const params = {
        name,
        bid: '0.01',
        file_path: path.join(videosDir, `ta_${numberStr}.mp4`),
        validate_file: true,
        optimize_file: true,
        title: episode.TITLE,
        description: episode.DESCRIPTION,
        thumbnail_url: `https://technoagorist.com/images/ta_${numberStr}-video.png`,
        author: 'Ryan Burgett',
        tags: [],
        languages: ['en'],
        locations: [{country: 'US'}],
        channel_name: '@TechnoAgorist',
        license: 'Creative Commons Attribution-NonCommercial 4.0 International License',
        license_url: 'https://creativecommons.org/licenses/by-nc/4.0/',
        channel_account_id: [],
        funding_account_ids: [],
        preview: false,
        blocking: false
      };

      const { statusCode, body } = await request
        .post('http://localhost:5279')
        .set('Content-Type', 'application/json')
        .send({
          method: 'publish',
          params
        });

      // console.log(statusCode);
      // console.log(JSON.stringify(body, null, '  '));
      if(body.error) {
        console.log(JSON.stringify(body, null, '  '));
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 660000));

    }

  } catch(err) {
    console.error(err);
  }
})();
