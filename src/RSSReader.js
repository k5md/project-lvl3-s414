import axios from 'axios';
import { watch } from 'melanke-watchjs';
import { isURL } from 'validator';
import $ from 'jquery';
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
    state.error = false;

    axios.get(url, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(({ data }) => {
        const { feed, articles } = parse(data);

        state.feeds = [...state.feeds, { ...feed, URL: link }];
        state.articles = [...state.articles, ...articles];
      })
      .catch(() => {
        state.error = 'Could not fetch data';
      })
      .finally(() => {
        state.URL = '';
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

  const showDescriptionHandler = (e) => {
    const button = $(e.relatedTarget);
    const article = state.articles.find(item => item.id === button.data('articleId').toString());

    if (!article) {
      return;
    }

    const modal = document.querySelector('#article_description_modal');
    const modalTitle = modal.querySelector('#article_description_modal_title');
    const modalBody = modal.querySelector('#article_description_modal_body');

    modalTitle.textContent = article.title;
    modalBody.textContent = article.description;
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
    const feedsListContainer = document.querySelector('#feeds_list_container');
    const feedsList = document.querySelector('#feeds_list');
    feedsList.innerHTML = '';

    if (state.feeds.length > 0) {
      if (!document.querySelector('#articles_text')) {
        const feedsText = document.createElement('p');
        feedsText.textContent = 'Feeds:';
        feedsText.id = 'feeds_text';
        feedsListContainer.insertBefore(feedsText, feedsList);
      }
    }

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
    const articlesListContainer = document.querySelector('#articles_list_container');
    const articlesList = document.querySelector('#articles_list');

    articlesList.innerHTML = '';

    if (state.articles.length > 0) {
      if (!document.querySelector('#articles_text')) {
        const articlesText = document.createElement('p');
        articlesText.textContent = 'Articles:';
        articlesText.id = 'articles_text';
        articlesListContainer.insertBefore(articlesText, articlesList);
      }
    }

    state.articles.forEach((article) => {
      const articlesListItem = document.createElement('div');
      articlesListItem.classList.add('list-group-item');

      const link = document.createElement('a');
      link.textContent = article.title;
      link.classList.add('float-md-left');
      link.href = article.link;

      const showDescriptionButton = document.createElement('button');
      showDescriptionButton.textContent = 'Description';

      showDescriptionButton.classList.add('btn');
      showDescriptionButton.classList.add('btn-info');
      showDescriptionButton.classList.add('float-md-right');

      showDescriptionButton.dataset.toggle = 'modal';
      showDescriptionButton.dataset.target = '#article_description_modal';
      showDescriptionButton.dataset.articleId = article.id;

      articlesListItem.appendChild(link);
      articlesListItem.appendChild(showDescriptionButton);

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

    addFeedText.addEventListener('input', addFeedTextHandler);
    addFeedButton.addEventListener('click', addFeedButtonHandler);

    $('#article_description_modal').on('show.bs.modal', showDescriptionHandler);

    // view section

    watch(state, 'feeds', () => {
      renderFeeds();
    });

    watch(state, 'URL', () => {
      const inputText = document.querySelector('#input_text_feed_add');
      inputText.value = state.URL;
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
