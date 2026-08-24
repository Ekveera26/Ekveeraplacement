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

// Form submit feedback for all AJAX forms (Formspree)
document.querySelectorAll('form.ajax-form').forEach(function (formEl) {
  formEl.addEventListener('submit', async function (e) {
    e.preventDefault();
    const submitBtn = formEl.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const fileInput = formEl.querySelector('input[type="file"]');
    const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

    submitBtn.textContent = 'भेजा जा रहा है...';
    submitBtn.disabled = true;

    async function trySubmit(includeFile) {
      const formData = new FormData(formEl);
      if (!includeFile && fileInput) {
        formData.delete(fileInput.name);
      }
      return fetch(formEl.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
    }

    try {
      let response = await trySubmit(true);

      if (response.ok) {
        submitBtn.textContent = 'भेज दिया गया ✔';
        formEl.reset();
      } else if (hasFile) {
        // File attachment likely caused the failure — retry without it
        // so the person's core details still reach us.
        response = await trySubmit(false);
        if (response.ok) {
          submitBtn.textContent = 'भेज दी गई ✔ (फाइल के बिना — कृपया फाइल WhatsApp पर भेजें)';
          formEl.reset();
        } else {
          submitBtn.textContent = 'भेजने में समस्या हुई, दोबारा कोशिश करें';
        }
      } else {
        submitBtn.textContent = 'भेजने में समस्या हुई, दोबारा कोशिश करें';
      }
    } catch (err) {
      submitBtn.textContent = 'भेजने में समस्या हुई, दोबारा कोशिश करें';
    } finally {
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 5000);
    }
  });
});
