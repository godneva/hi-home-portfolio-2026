const header = document.querySelector('.site-header');
const form = document.querySelector('#lead-form');
const formatSelect = document.querySelector('#publication-format');
const formStatus = document.querySelector('#form-status');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
};

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

document.querySelectorAll('.format-select').forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFormat = button.dataset.format;
    if (selectedFormat) {
      formatSelect.value = selectedFormat;
      formatSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    form.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    window.setTimeout(() => formatSelect.focus({ preventScroll: true }), reduceMotion ? 0 : 750);
  });
});

const revealElements = document.querySelectorAll('.reveal');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
}

const messages = {
  company: 'Укажите название компании',
  name: 'Укажите имя и фамилию',
  phone: 'Укажите номер телефона',
  email: 'Укажите корректный e-mail',
  publication_format: 'Выберите формат публикации'
};

const validateField = (field) => {
  const wrapper = field.closest('.field');
  const error = wrapper.querySelector('.field-error');
  let message = '';

  if (field.required && !field.value.trim()) {
    message = messages[field.name] || 'Заполните поле';
  } else if (field.type === 'email' && !field.validity.valid) {
    message = messages.email;
  }

  wrapper.classList.toggle('has-error', Boolean(message));
  field.setAttribute('aria-invalid', Boolean(message).toString());
  error.textContent = message;
  return !message;
};

form.querySelectorAll('input, select').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.closest('.field').classList.contains('has-error')) validateField(field);
  });
  field.addEventListener('change', () => validateField(field));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input, select')];
  const isValid = fields.map(validateField).every(Boolean);

  if (!isValid) {
    fields.find((field) => field.getAttribute('aria-invalid') === 'true')?.focus();
    return;
  }

  formStatus.hidden = false;
  formStatus.textContent = 'Спасибо. Заявка заполнена.';
  formStatus.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
});
