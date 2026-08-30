const CONNECTION_PATH = 'M60 320 L120 200 L205 250 L290 260 L360 90';

// Home-only decorative visual. The complete diagram is emitted in its final
// static state; JavaScript may add enhancement classes, but never supplies or
// reveals missing geometry.
export function renderHeroVisual() {
  return (
    `<svg class="hero__visual" data-hero-visual viewBox="0 0 400 400" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet">` +
    `<g class="hero__connections">` +
    `<path class="hero__connection hero__connection--base" data-hero-connection d="${CONNECTION_PATH}" pathLength="100"></path>` +
    `<path class="hero__connection hero__connection--reveal" data-hero-reveal d="${CONNECTION_PATH}" pathLength="100"></path>` +
    `<path class="hero__connection hero__connection--signal" data-hero-signal d="${CONNECTION_PATH}" pathLength="100"></path>` +
    `</g>` +
    `<circle class="hero__node hero__node--primary" data-hero-node="source" cx="120" cy="130" r="70"></circle>` +
    `<circle class="hero__node hero__node--destination" data-hero-node="destination" cx="290" cy="260" r="46"></circle>` +
    `<g class="hero__points">` +
    `<circle class="hero__point" data-hero-point cx="60" cy="320" r="5"></circle>` +
    `<circle class="hero__point" data-hero-point cx="120" cy="200" r="5"></circle>` +
    `<circle class="hero__point" data-hero-point cx="205" cy="250" r="5"></circle>` +
    `<circle class="hero__point hero__point--destination" data-hero-point cx="360" cy="90" r="5"></circle>` +
    `</g>` +
    `</svg>`
  );
}
