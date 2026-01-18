import './style.css'

document.querySelector('#app').innerHTML = `
  <div class="page">
    <header class="hero">
      <p class="eyebrow">Fahrzeugpflege in Amberg</p>
      <h1>Autoaufbereitung Stoll</h1>
      <div class="hero-actions">
        <a class="btn btn-primary" href="tel:+49XXXXXXXXXX">Jetzt anrufen</a>
      </div>
      <div class="trust-row">
      
      </div>
    </header>

    <section class="section" id="leistungen">
      <h2>Leistungen</h2>
      <div class="pill-stack">
        <article class="pill-card">
          <h3>Innenaufbereitung</h3>
        </article>
        <article class="pill-card">
          <h3>Außenaufbereitung</h3>
        </article>
        <article class="pill-card">
          <h3>Politur</h3>
        </article>
        <article class="pill-card">
          <h3>Spachtelarbeiten</h3>
        </article>
      </div>
    </section>

    <section class="section contact" id="kontakt">
      <h2>Kontakt</h2>
      <a class="btn btn-primary btn-large" href="tel:+4915233725772">+4915233725772</a>
      
    </section>

    <footer class="footer">
      <a href="./impressum.html">Impressum</a>
      <a href="./datenschutz.html">Datenschutz</a>
    </footer>
  </div>
`
