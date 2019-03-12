import axios from 'axios';
import { watch } from 'melanke-watchjs';

import parse from './parseRSS';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';

const RSSReader = () => {
  const state = {
    URL: '',
    URLValid: false,
    UILoadButtonDisabled: false,
    feeds: [],
    articles: [],
  };

  const validate = () => true;

  const addFeedButtonHandler = () => {
    const url = `${corsProxy}${state.URL}`;
    console.log('fetching', url);

    axios.get(url, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(({ data }) => {
        const { feed, articles } = parse(data);
        state.feeds = [...state.feeds, feed];
        state.articles = [...state.articles, ...articles];
        console.log('fetched', feed, articles, state);
      });
  };

  const addFeedTextHandler = () => {
    const URL = document.querySelector('#input_text_feed_add').value;

    const UILoadButtonDisabled = validate(state.URL);
    state.URL = URL;
    state.UILoadButtonDisabled = UILoadButtonDisabled;
    console.log(URL, 'in handler url', state);
  };

  const mount = () => {
    const addFeedText = document.querySelector('#input_text_feed_add');
    const addFeedButton = document.querySelector('#input_button_feed_add');

    const feedsList = document.querySelector('#feeds_list');
    const articlesList = document.querySelector('#articles_list');

    addFeedText.addEventListener('input', () => addFeedTextHandler());
    addFeedButton.addEventListener('click', () => addFeedButtonHandler());

    // view section

    watch(state, 'URL', () => {
      console.log('url changed');
      addFeedText.value = state.URL;
    });

    watch(state, 'feeds', () => {
      console.log('feeds changed');
      state.feeds.forEach((feed) => {
        console.log(feed);
        const feedsListItem = document.createElement('li');
        feedsListItem.classList.add('list-group-item');
        const title = document.createElement('div');
        title.textContent = feed.title;

        const description = document.createElement('div');
        description.textContent = feed.description;

        feedsListItem.appendChild(title);
        feedsListItem.appendChild(description);

        feedsList.appendChild(feedsListItem);
      });
    });

    watch(state, 'articles', () => {
      console.log('articles changed');
      state.articles.forEach((article) => {
        console.log(article);
        const articlesListItem = document.createElement('li');
        articlesListItem.classList.add('list-group-item');
        const link = document.createElement('a');
        link.textContent = article.title;
        link.href = article.link;

        articlesListItem.appendChild(link);

        articlesList.appendChild(articlesListItem);
      });
    });
  };

  mount();
};

export default RSSReader;
