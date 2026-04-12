import gridStylesHref from '@zengrid/core/dist/styles.css?url';

const DEMO_COLUMNS = [
  { field: 'name', header: 'Name', width: 180 },
  { field: 'age', header: 'Age', width: 80 },
  { field: 'country', header: 'Country', width: 120 },
  { field: 'department', header: 'Department', width: 140 },
  { field: 'salary', header: 'Salary', width: 120 },
  { field: 'status', header: 'Status', width: 100 },
  { field: 'date', header: 'Join Date', width: 120 },
  { field: 'hours', header: 'Hours/Week', width: 110 },
  { field: 'performance', header: 'Performance', width: 120 },
  { field: 'id', header: 'Employee ID', width: 120 },
] as const;

const FIRST_NAMES = ['Aria', 'Maya', 'Noah', 'Ethan', 'Lina', 'Sofia', 'Ivy', 'Rohan'];
const LAST_NAMES = ['Patel', 'Kim', 'Nguyen', 'Garcia', 'Shaw', 'Walker', 'Singh', 'Diaz'];
const COUNTRIES = ['United States', 'Germany', 'India', 'Canada', 'Japan', 'Brazil', 'Spain', 'Australia'];
const DEPARTMENTS = ['Platform', 'Design', 'Revenue', 'Support', 'Research', 'Security', 'Ops', 'Growth'];
const STATUSES = ['Active', 'Remote', 'Office', 'On Leave'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const HOURS = ['36h', '38h', '40h', '42h', '44h'];
const PERFORMANCE = ['72%', '78%', '84%', '89%', '93%', '97%'];
const DESKTOP_QUERY = '(min-width: 960px)';
const DEMO_ROW_COUNT = 900;
const GRID_STYLES_ID = 'zengrid-homepage-grid-styles';

function formatCurrency(value: number): string {
  return `$${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function formatDate(index: number): string {
  const month = MONTHS[index % MONTHS.length];
  const day = ((index * 7) % 28) + 1;
  const year = 2020 + (index % 6);
  return `${month} ${day}, ${year}`;
}

function createDemoRows(count: number): string[][] {
  const rows = new Array<string[]>(count);

  for (let index = 0; index < count; index += 1) {
    const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[(index * 3) % LAST_NAMES.length]}`;
    const age = String(22 + ((index * 7) % 43));
    const country = COUNTRIES[(index * 5) % COUNTRIES.length];
    const department = DEPARTMENTS[(index * 2) % DEPARTMENTS.length];
    const salary = formatCurrency(45000 + ((index * 1373) % 105000));
    const status = STATUSES[index % STATUSES.length];
    const joinDate = formatDate(index);
    const hours = HOURS[index % HOURS.length];
    const performance = PERFORMANCE[index % PERFORMANCE.length];
    const employeeId = `#EMP${String(index + 1).padStart(5, '0')}`;

    rows[index] = [name, age, country, department, salary, status, joinDate, hours, performance, employeeId];
  }

  return rows;
}

function bindCopyButton(): void {
  const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement | null;
  const installText = document.getElementById('install-text');

  if (!copyBtn || !installText || copyBtn.dataset.bound === 'true') {
    return;
  }

  copyBtn.dataset.bound = 'true';
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(installText.textContent || '');
    copyBtn.innerHTML = '<span class="copy-icon">✓</span>';
    window.setTimeout(() => {
      copyBtn.innerHTML = '<span class="copy-icon">📋</span>';
    }, 2000);
  });
}

function bindThemeToggle(container: HTMLElement): void {
  const themeBtn = document.getElementById('homepage-theme-toggle') as HTMLButtonElement | null;

  if (!themeBtn || themeBtn.dataset.bound === 'true') {
    return;
  }

  themeBtn.dataset.bound = 'true';
  themeBtn.addEventListener('click', () => {
    const isDark = container.classList.contains('zg-theme-dark');
    container.classList.toggle('zg-theme-dark', !isDark);
    themeBtn.classList.toggle('is-light', isDark);
  });
}

function scheduleAfterIdle(task: () => void): void {
  const requestIdle = (
    window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
    }
  ).requestIdleCallback;

  if (requestIdle) {
    requestIdle(() => task(), { timeout: 1800 });
    return;
  }

  window.setTimeout(task, 500);
}

function ensureGridStyles(): Promise<void> {
  const existingLink = document.getElementById(GRID_STYLES_ID) as HTMLLinkElement | null;

  if (existingLink) {
    return existingLink.dataset.loaded === 'true'
      ? Promise.resolve()
      : new Promise((resolve) => existingLink.addEventListener('load', () => resolve(), { once: true }));
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = GRID_STYLES_ID;
    link.rel = 'stylesheet';
    link.href = gridStylesHref;
    link.addEventListener('load', () => {
      link.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    link.addEventListener('error', () => reject(new Error('Failed to load homepage grid styles.')), { once: true });
    document.head.appendChild(link);
  });
}

async function mountGrid(container: HTMLElement, demoRoot: HTMLElement): Promise<void> {
  if (container.dataset.demoMounted === 'true' || container.dataset.demoLoading === 'true') {
    return;
  }

  container.dataset.demoLoading = 'true';

  try {
    const [{ Grid }] = await Promise.all([import('@zengrid/core'), ensureGridStyles()]);

    const rowCount = DEMO_ROW_COUNT;
    const grid = new Grid(container, {
      rowCount,
      colCount: DEMO_COLUMNS.length,
      rowHeight: 32,
      colWidth: DEMO_COLUMNS.map((column) => column.width),
      columns: DEMO_COLUMNS,
      enableColumnResize: false,
      enableSelection: true,
    });

    grid.setData(createDemoRows(rowCount));
    grid.render();

    container.classList.add('zg-theme-dark');
    container.dataset.demoMounted = 'true';
    demoRoot.dataset.demoReady = 'true';
    bindThemeToggle(container);
  } catch (error) {
    demoRoot.dataset.demoReady = 'error';
    console.error('Grid initialization error:', error);
  } finally {
    delete container.dataset.demoLoading;
  }
}

export function initHomepageGridDemo(): void {
  bindCopyButton();

  const container = document.getElementById('grid-container');
  const demoRoot = container?.closest('.grid-demo') as HTMLElement | null;

  if (!container || !demoRoot) {
    return;
  }

  if (!window.matchMedia(DESKTOP_QUERY).matches) {
    demoRoot.dataset.demoReady = 'static';
    return;
  }

  if (container.dataset.demoObserved === 'true' || container.dataset.demoMounted === 'true') {
    return;
  }

  demoRoot.dataset.demoReady = 'pending';
  container.dataset.demoObserved = 'true';

  const loadGrid = () => scheduleAfterIdle(() => void mountGrid(container, demoRoot));

  if (!('IntersectionObserver' in window)) {
    loadGrid();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) {
      return;
    }

    observer.disconnect();
    delete container.dataset.demoObserved;
    loadGrid();
  }, { rootMargin: '160px 0px' });

  observer.observe(container);
}
