/*eslint no-console: 0*/
import Nightmare from 'nightmare';
import realMouse from 'nightmare-real-mouse';
import nightmareUpload from 'nightmare-upload';

realMouse(Nightmare);
nightmareUpload(Nightmare);
const show = !!process.argv.includes('--show');
export default function createNightmare(width = 1100, height = 600) {
  const nightmare = new Nightmare({
    show,
    typeInterval: 10,
    x: 0,
    y: 0,
    webPreferences: {
      preload: `${__dirname}/custom-preload.js`
    }
  }).viewport(width, height);

  nightmare.on('page', (type, message, error) => {
    fail(error);
  });

  nightmare.on('dom-ready', () => {
    nightmare.inject('css', `${__dirname}/tests.css`);
  });

  nightmare.on('console', (type, message) => {
    //if (message.match(/Unknown prop `storeSubscription`/)) {
      //return;
    //}
    if (type === 'error') {
      fail(message);
    }
    if (type === 'log') {
      console.log(message);
    }
  });

  return nightmare;
}
