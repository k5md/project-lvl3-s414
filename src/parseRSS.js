import _ from 'lodash';

export default (data) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(data, 'application/xml');
  const channel = xml.querySelector('channel');

  const title = channel.querySelector('title').textContent;
  const description = channel.querySelector('description').textContent;
  const articles = [...channel.querySelectorAll('item')].map(
    article => ({
      id: _.uniqueId(),
      title: article.querySelector('title').textContent,
      link: article.querySelector('link').textContent,
      description: article.querySelector('description').textContent,
    }),
  );

  return {
    feed: { title, description },
    articles,
  };
};
