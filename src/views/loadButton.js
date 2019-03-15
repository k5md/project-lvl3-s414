export default ({ loading, URLValid }) => {
  const loadButton = document.querySelector('#input_button_feed_add');
  loadButton.innerHTML = '';
  loadButton.textContent = 'Add';
  loadButton.disabled = !URLValid || loading;

  if (loading) {
    const spinner = document.createElement('span');
    spinner.classList.add('spinner-border', 'spinner-border-sm');
    spinner.role = 'status';
    loadButton.textContent = 'Loading...';
    loadButton.appendChild(spinner);
  }
};
