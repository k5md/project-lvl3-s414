export default ({ URL, loading, URLValid }) => {
  const inputText = document.querySelector('#input_text_feed_add');
  inputText.value = URL;
  inputText.disabled = loading;

  inputText.classList.remove('is-valid', 'is-invalid');

  if (URL.length === 0) {
    return;
  }

  inputText.classList.add(URLValid ? 'is-valid' : 'is-invalid');
};
