import axios from 'axios';
import { watch } from 'melanke-watchjs';
import { isURL } from 'validator';
import $ from 'jquery';
import parse from './parseRSS';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';
const updateTimeout = 5000;

const RSSReader = () => {
  const state = {
    loading: false,
    URL: '',
    URLValid: false,
    feeds: [],
    articles: [],
    error: '',
    descriptionArticleId: null,
  };

  const validate = (str) => {
    if (
      str.length === 0
      || !isURL(str)
      || state.feeds.findIndex(feed => feed.link === str) !== -1
    ) {
      return false;
    }
    return true;
  };

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
      .catch(() => {
        state.error = `Could not update feed ${link}`;
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
    state.error = false;

    axios.get(url, { headers: { 'Access-Control-Allow-Origin': '*' } })
      .then(({ data }) => {
        const { feed, articles } = parse(data);

        state.feeds = [...state.feeds, { ...feed, link }];
        state.articles = [...state.articles, ...articles];
        state.URL = '';

        setTimeout(() => updateFeed(feed.id, link), updateTimeout);
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

  const showDescriptionHandler = (e) => {
    const button = $(e.relatedTarget);
    state.descriptionArticleId = button.data('articleId').toString();
  };

  const renderLoadButton = () => {
    const loadButton = document.querySelector('#input_button_feed_add');
    loadButton.innerHTML = '';
    loadButton.textContent = 'Add';
    loadButton.disabled = !state.URLValid || state.loading;

    if (state.loading) {
      const spinner = document.createElement('span');
      spinner.classList.add('spinner-border', 'spinner-border-sm');
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

      showDescriptionButton.classList.add('btn', 'btn-info', 'float-md-right');

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

    error.classList.add('alert', 'alert-danger', 'alert-dismissible');
    error.role = 'alert';
    error.textContent = state.error;
    error.addEventListener('click', closeErrorAlertHandler);

    errorContainer.appendChild(error);
  };

  const renderModal = () => {
    const article = state.articles.find(item => item.id === state.descriptionArticleId);

    const modal = document.querySelector('#article_description_modal');
    const modalTitle = modal.querySelector('#article_description_modal_title');
    const modalBody = modal.querySelector('#article_description_modal_body');

    modalTitle.textContent = article.title;
    modalBody.textContent = article.description;
  };

  const renderURLInput = () => {
    const inputText = document.querySelector('#input_text_feed_add');
    inputText.value = state.URL;
    inputText.disabled = state.loading;

    inputText.classList.remove('is-valid', 'is-invalid');

    if (state.URL.length === 0) {
      return;
    }

    inputText.classList.add(state.URLValid ? 'is-valid' : 'is-invalid');
  };

  const mount = () => {
    const addFeedText = document.querySelector('#input_text_feed_add');
    const addFeedButton = document.querySelector('#input_button_feed_add');

    addFeedText.addEventListener('input', addFeedTextHandler);
    addFeedButton.addEventListener('click', addFeedButtonHandler);

    $('#article_description_modal').on('show.bs.modal', showDescriptionHandler);

    watch(state, 'feeds', () => {
      renderFeeds();
    });

    watch(state, 'URL', () => {
      renderURLInput();
    });

    watch(state, 'articles', () => {
      renderArticles();
    });

    watch(state, ['URLValid', 'loading'], () => {
      renderLoadButton();
      renderURLInput();
    });

    watch(state, 'error', () => {
      renderError();
    });

    watch(state, 'descriptionArticleId', () => {
      renderModal();
    });
  };

  mount();
};

export default RSSReader;
