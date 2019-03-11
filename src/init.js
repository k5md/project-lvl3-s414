import '@babel/polyfill';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import RSSReader from './RSSReader';

export default () => {
  const element = document.getElementById('entrypoint');
  const rssReader = new RSSReader(element);
  rssReader.init();
};
