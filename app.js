const form = document.querySelector('#request-form');
const service = document.querySelector('#service');
const areaGroup = document.querySelector('#area-group');
const area = document.querySelector('#area');
const details = document.querySelector('#details');
const telegramLink = document.querySelector('#telegram-link');
const copyButton = document.querySelector('#copy-text');
const copyStatus = document.querySelector('#copy-status');
const telegramUrl = telegramLink.href;
const taskGroup = document.querySelector('#task-group');
const taskOptions = document.querySelector('#task-options');
const planTitle = document.querySelector('#plan-title');
const planNote = document.querySelector('#plan-note');
const planItems = document.querySelector('#plan-items');

const itemServices = new Set(['Мытьё окон', 'Химчистка мебели и ковров']);
const planOptions = {
  'Генеральная уборка': ['Кухня и фасады', 'Ванная и санузел', 'Полы и плинтусы', 'Труднодоступные места'],
  'Уборка после ремонта': ['Строительная пыль', 'Следы скотча и наклеек', 'Стёкла и рамы', 'Плинтусы и полы'],
  'Регулярная уборка': ['Полы', 'Пыль на поверхностях', 'Кухня', 'Санузел'],
  'Уборка офиса': ['Рабочие места', 'Зона отдыха', 'Входная группа', 'Санузлы'],
  'Мытьё окон': ['Стёкла', 'Рамы', 'Подоконники', 'Балконное остекление'],
  'Химчистка мебели и ковров': ['Диван', 'Кресло', 'Ковёр', 'Стулья'],
};
const savedTasks = new Map();

function selectedTasks() {
  return Array.from(taskOptions.querySelectorAll(':checked'), task => task.value);
}

function updatePlan() {
  const tasks = selectedTasks();
  planTitle.textContent = service.value || 'Выберите тип уборки';
  planNote.textContent = tasks.length ? 'В запрос попадут эти пункты.' : 'Подскажем, какие детали стоит указать по этому типу работ.';
  planItems.replaceChildren(...tasks.map(task => {
    const item = document.createElement('li');
    item.textContent = task;
    return item;
  }));
}

function draftText() {
  const lines = ['Здравствуйте! Хотелось бы уточнить стоимость и свободное время.'];
  lines.push(`Услуга: ${service.value}.`);
  if (area.value && !area.disabled) lines.push(`Площадь: ${area.value} м².`);
  const tasks = selectedTasks();
  if (tasks.length) lines.push(`Что нужно обсудить: ${tasks.join(', ')}.`);
  if (details.value.trim()) lines.push(`Детали: ${details.value.trim()}`);
  return lines.join('\n');
}

function refreshForm() {
  const isItemService = itemServices.has(service.value);
  areaGroup.hidden = isItemService;
  area.disabled = isItemService;
  details.placeholder = isItemService ? 'Опишите предметы и их количество' : 'Что нужно убрать?';
  const choices = planOptions[service.value] ?? [];
  taskGroup.hidden = !choices.length;
  taskOptions.replaceChildren(...choices.map(task => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = task;
    input.checked = savedTasks.get(service.value)?.includes(task) ?? false;
    const text = document.createElement('span');
    text.textContent = task;
    label.append(input, text);
    return label;
  }));
  updatePlan();
  telegramLink.href = telegramUrl;
  copyStatus.textContent = '';
}

document.querySelectorAll('[data-service]').forEach(link => {
  link.addEventListener('click', () => {
    service.value = link.dataset.service;
    refreshForm();
  });
});

service.addEventListener('change', refreshForm);
taskOptions.addEventListener('change', () => {
  savedTasks.set(service.value, selectedTasks());
  updatePlan();
});
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
