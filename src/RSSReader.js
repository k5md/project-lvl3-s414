import axios from 'axios';
import { watch } from 'melanke-watchjs';
import { isURL } from 'validator';
import $ from 'jquery';

import parse from './parseRSS';
import render from './views';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const updateTimeout = 5000;

const RSSReader = () => {
  const state = {
    loading: false,
    URL: '',
    URLValid: false,
    feeds: [],
    articles: [],
    errorText: '',
    descriptionArticleId: null,
  };

  const validate = str => str.length === 0
    || (isURL(str) && !state.feeds.some(feed => feed.link === str));

  const updateFeed = (feedId, link) => {
    const url = `${corsProxy}${link}`;
    axios.get(url, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(({ data }) => {
        const { articles } = parse(data);

        const oldArticlesLinks = state.articles
          .filter(article => article.channelId === feedId)
          .map(article => article.link);

        const newArticles = articles
          .filter(article => !(oldArticlesLinks.includes(article.link)))
          // NOTE: new articles have incorrect (new) channelId after parse, changing it to feedId
          .map(article => ({ ...article, channelId: feedId }));

        state.articles = [...state.articles, ...newArticles];
      })
      .finally(() => {
        setTimeout(() => updateFeed(feedId, link), updateTimeout);
      });
  };

  const addFeedButtonHandler = (e) => {
    e.preventDefault();
    const link = state.URL;
    const url = `${corsProxy}${link}`;
    state.loading = true;
    state.errorText = '';

    axios.get(url, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(({ data }) => {
        const { feed, articles } = parse(data);

        state.feeds = [...state.feeds, { ...feed, link }];
        state.articles = [...state.articles, ...articles];
        state.URL = '';

        setTimeout(() => updateFeed(feed.id, link), updateTimeout);
      })
      .catch(() => {
        state.errorText = 'Could not fetch data';
      })
      .finally(() => {
        state.loading = false;
      });
  };

  const addFeedTextHandler = () => {
    const URL = document.querySelector('#input_text_feed_add').value;
    const URLValid = validate(URL);

    state.URL = URL;
    state.URLValid = URLValid;
  };

  const closeErrorAlertHandler = () => {
    state.errorText = '';
  };

  const showDescriptionHandler = (e) => {
    const button = $(e.relatedTarget);
    state.descriptionArticleId = button.data('articleId').toString();
  };

  const mount = () => {
    const addFeedText = document.querySelector('#input_text_feed_add');
    const addFeedButton = document.querySelector('#input_button_feed_add');

    addFeedText.addEventListener('input', addFeedTextHandler);
    addFeedButton.addEventListener('click', addFeedButtonHandler);

    $('#article_description_modal').on('show.bs.modal', showDescriptionHandler);

    watch(state, 'feeds', () => render.feeds(state));
    watch(state, 'URL', () => render.URLInput(state));
    watch(state, 'articles', () => render.articles(state));
    watch(state, ['URLValid', 'loading'], () => {
      render.loadButton(state);
      render.URLInput(state);
    });
    watch(state, 'errorText', () => render.error(state, closeErrorAlertHandler));
    watch(state, 'descriptionArticleId', () => render.modal(state));
  };

  mount();
};

export default RSSReader;
