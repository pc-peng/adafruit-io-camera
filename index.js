'use strict';

const Motion = require('motion').Stream,
      Camera = require('./lib/camera'),
      AdafruitIO = require('adafruit-io'),
      env = process.env;

const aio = new AdafruitIO(
  env.AIO_CLIENT_USER,
  env.AIO_CLIENT_KEY,
  { success: ready, failure: error }
);

function ready() {

  const feed = aio.Feeds.writable(env.AIO_CAMFEED || 'picam');

  const camera = new Camera({
    vflip: (env.CAM_VFLIP === 'true' || env.CAM_VFLIP === '1'),
    hflip: (env.CAM_HFLIP === 'true' || env.CAM_HFLIP === '1'),
    timelapse: env.CAM_RATE ? parseInt(env.CAM_RATE) * 1000 : 2000
  });

  if(env.MOTION === 'true' || env.MOTION === '1') {

    const motion = new Motion({
      threshold: env.MOTION_THRESH ? parseInt(env.MOTION_THRESH) : 0x15,
      minChange: env.MOTION_MINCHANGE ? parseInt(env.MOTION_MINCHANGE) : 10,
      minimumMotion: env.MOTION_MINSECONDS ? parseInt(env.MOTION_MINSECONDS) : 1,
      prebuffer: 0,
      postbuffer: 0
    });

    camera.pipe(motion);

    return motion.on('data', (img) => {
      feed.write(img.toString('base64'));
    });

  }

  return camera.on('data', (img) => {
    feed.write(img.toString('base64'));
  });

}

function error(err) {
  console.error(err);
}

