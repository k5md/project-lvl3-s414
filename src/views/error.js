export default ({ errorText }, closeErrorAlertHandler) => {
  const errorContainer = document.querySelector('#error_container');
  errorContainer.innerHTML = '';

  if (!errorText) {
    return;
  }

  const error = document.createElement('div');

  error.classList.add('alert', 'alert-danger', 'alert-dismissible');
  error.role = 'alert';
  error.textContent = errorText;
  error.addEventListener('click', closeErrorAlertHandler);

  errorContainer.appendChild(error);
};
