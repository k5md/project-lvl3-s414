import axios from 'axios';
import { watch } from 'melanke-watchjs';
import { isURL } from 'validator';
import parse from './parseRSS';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';

const RSSReader = () => {
  const state = {
    loading: false,
    URL: '',
    URLValid: false,
    feeds: [],
    articles: [],
    error: '',
  };

  const validate = (str) => {
    if (
      str.length === 0
      || !isURL(str)
      || state.feeds.findIndex(feed => feed.URL === str) !== -1
    ) {
      return false;
    }
    return true;
  };

  const addFeedButtonHandler = (e) => {
    e.preventDefault();
    const link = state.URL;
    const url = `${corsProxy}${link}`;
    state.loading = true;

    axios.get(url, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(({ data }) => {
        const { feed, articles } = parse(data);

        state.feeds = [...state.feeds, { ...feed, URL: link }];
        state.articles = [...state.articles, ...articles];
        state.URL = '';
      })
      .catch(() => {
        state.error = 'Could not fetch data';
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
    state.error = '';
  };

  const renderLoadButton = () => {
    const loadButton = document.querySelector('#input_button_feed_add');
    loadButton.innerHTML = '';
    loadButton.textContent = 'Add';
    loadButton.disabled = !state.URLValid;

    if (state.loading) {
      const spinner = document.createElement('span');
      spinner.classList.add('spinner-border');
      spinner.classList.add('spinner-border-sm');
      spinner.role = 'status';
      loadButton.textContent = 'Loading...';
      loadButton.appendChild(spinner);
    }
  };

  const renderFeeds = () => {
    const feedsList = document.querySelector('#feeds_list');
    feedsList.innerHTML = '';

    state.feeds.forEach((feed) => {
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
  };

  const renderArticles = () => {
    const articlesList = document.querySelector('#articles_list');
    articlesList.innerHTML = '';

    state.articles.forEach((article) => {
      const articlesListItem = document.createElement('li');
      articlesListItem.classList.add('list-group-item');
      const link = document.createElement('a');
      link.textContent = article.title;
      link.href = article.link;

      articlesListItem.appendChild(link);

      articlesList.appendChild(articlesListItem);
    });
  };

  const renderError = () => {
    const errorContainer = document.querySelector('#error_container');
    errorContainer.innerHTML = '';

    if (!state.error) {
      return;
    }

    const error = document.createElement('div');

    error.classList.add('alert');
    error.classList.add('alert-danger');
    error.classList.add('alert-dismissible');
    error.role = 'alert';
    error.textContent = state.error;
    error.addEventListener('click', closeErrorAlertHandler);

    errorContainer.appendChild(error);
  };

  const mount = () => {
    const addFeedText = document.querySelector('#input_text_feed_add');
    const addFeedButton = document.querySelector('#input_button_feed_add');

    addFeedText.addEventListener('keyup', addFeedTextHandler);
    addFeedButton.addEventListener('click', addFeedButtonHandler);

    // view section

    watch(state, 'feeds', () => {
      renderFeeds();
    });

    watch(state, 'articles', () => {
      renderArticles();
    });

    watch(state, ['URLValid', 'loading'], () => {
      renderLoadButton();
    });

    watch(state, 'error', () => {
      renderError();
    });
  };

  mount();
};

export default RSSReader;
