// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Formspree submission (AJAX so user stays on page)
const form = document.getElementById('enquiryForm');
const note = document.getElementById('formNote');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  note.textContent = 'भेजा जा रहा है...';
  note.className = 'form-note';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      note.textContent = 'धन्यवाद! आपका फॉर्म मिल गया है, हमारी टीम जल्द संपर्क करेगी।';
      note.className = 'form-note success';
      form.reset();
    } else {
      note.textContent = 'कुछ गड़बड़ हुई। कृपया फोन पर संपर्क करें: 9766284669';
      note.className = 'form-note error';
    }
  } catch (err) {
    note.textContent = 'कुछ गड़बड़ हुई। कृपया फोन पर संपर्क करें: 9766284669';
    note.className = 'form-note error';
  }
});
