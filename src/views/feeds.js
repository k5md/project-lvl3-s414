export default ({ feeds }) => {
  const feedsListContainer = document.querySelector('#feeds_list_container');
  const feedsList = document.querySelector('#feeds_list');
  feedsList.innerHTML = '';

  if (feeds.length > 0) {
    if (!document.querySelector('#articles_text')) {
      const feedsText = document.createElement('p');
      feedsText.textContent = 'Feeds:';
      feedsText.id = 'feeds_text';
      feedsListContainer.insertBefore(feedsText, feedsList);
    }
  }

  feeds.forEach((feed) => {
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
