const form = document.querySelector('#request-form');
const service = document.querySelector('#service');
const areaGroup = document.querySelector('#area-group');
const area = document.querySelector('#area');
const details = document.querySelector('#details');
const telegramLink = document.querySelector('#telegram-link');
const copyButton = document.querySelector('#copy-text');
const copyStatus = document.querySelector('#copy-status');
const telegramUrl = telegramLink.href;

const itemServices = new Set(['Мытьё окон', 'Химчистка мебели и ковров']);

function draftText() {
  const lines = ['Здравствуйте! Хотелось бы уточнить стоимость и свободное время.'];
  lines.push(`Услуга: ${service.value}.`);
  if (area.value && !area.disabled) lines.push(`Площадь: ${area.value} м².`);
  if (details.value.trim()) lines.push(`Детали: ${details.value.trim()}`);
  return lines.join('\n');
}

function refreshForm() {
  const isItemService = itemServices.has(service.value);
  areaGroup.hidden = isItemService;
  area.disabled = isItemService;
  details.placeholder = isItemService ? 'Опишите предметы и их количество' : 'Что нужно убрать?';
  copyStatus.textContent = '';
}

document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    service.value = link.dataset.service;
    refreshForm();
  });
});

service.addEventListener('change', refreshForm);
window.addEventListener('pageshow', refreshForm);
form.addEventListener('submit', event => event.preventDefault());

telegramLink.addEventListener('click', event => {
  if (!form.reportValidity()) {
    event.preventDefault();
    return;
  }

  const url = new URL(telegramUrl);
  url.searchParams.set('text', draftText());
  telegramLink.href = url.href;
});

form.addEventListener('input', () => {
  telegramLink.href = telegramUrl;
  copyStatus.textContent = '';
});

copyButton.hidden = !navigator.clipboard?.writeText;
copyButton.addEventListener('click', async () => {
  if (!form.reportValidity()) return;

  try {
    await navigator.clipboard.writeText(draftText());
    copyStatus.textContent = 'Текст скопирован. Его можно вставить в чат.';
  } catch {
    copyStatus.textContent = 'Не удалось скопировать. Откройте черновик в Telegram.';
  }
});
