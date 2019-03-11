export default class RSSReader {
  constructor(element) {
    this.element = element;
  }

  init() {
    this.element.innerHTML = `
      <main class="container">
        <div class="jumbotron mt-4">
          <h1 class="display-4">RSS Reader</h1>
          <p class="lead">Read RSS-Feeds with ease</p>
          <hr class="my-4">
          <form>
          <div class="input-group mb-3">
            <input class="form-control form-control-lg" type="url" placeholder="RSS Feed url...">
          </div>
            <button type="submit" class="btn btn-primary">Process</button>
          <form>
        </div>
      </main>
    `;
  }
}
