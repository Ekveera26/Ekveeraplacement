// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu after clicking a link (mobile)
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Admission form submit feedback (Formspree AJAX)
const admissionForm = document.getElementById('admission-enquiry-form');
if (admissionForm) {
  admissionForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = admissionForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'भेजा जा रहा है...';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(admissionForm);
      const response = await fetch(admissionForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        submitBtn.textContent = 'Enquiry भेज दी गई ✔';
        admissionForm.reset();
      } else {
        submitBtn.textContent = 'भेजने में समस्या हुई, दोबारा कोशिश करें';
      }
    } catch (err) {
      submitBtn.textContent = 'भेजने में समस्या हुई, दोबारा कोशिश करें';
    } finally {
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 3500);
    }
  });
}
