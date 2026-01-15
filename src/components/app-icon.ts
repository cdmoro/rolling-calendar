class AppIcon extends HTMLElement {
  static observedAttributes = ['name'];

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const name = this.getAttribute('name');
    if (!name) return;

    this.innerHTML = `
      <svg class="icon icon-${name}" aria-hidden="true">
        <use href="#icon-${name}"></use>
      </svg>
    `;
  }
}

customElements.define('app-icon', AppIcon);
