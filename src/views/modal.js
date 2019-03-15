export default ({ articles, descriptionArticleId }) => {
  const article = articles.find(item => item.id === descriptionArticleId);

  const modal = document.querySelector('#article_description_modal');
  const modalTitle = modal.querySelector('#article_description_modal_title');
  const modalBody = modal.querySelector('#article_description_modal_body');

  modalTitle.textContent = article.title;
  modalBody.textContent = article.description;
};
