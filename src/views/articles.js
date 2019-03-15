export default ({ articles }) => {
  const articlesListContainer = document.querySelector('#articles_list_container');
  const articlesList = document.querySelector('#articles_list');

  articlesList.innerHTML = '';

  if (articles.length > 0) {
    if (!document.querySelector('#articles_text')) {
      const articlesText = document.createElement('p');
      articlesText.textContent = 'Articles:';
      articlesText.id = 'articles_text';
      articlesListContainer.insertBefore(articlesText, articlesList);
    }
  }

  articles.forEach((article) => {
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
