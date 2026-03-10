export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Row 0: Title (H1)
  const titleRow = rows[0];
  const titleDiv = document.createElement('div');
  titleDiv.className = 'esb-subnav-title';
  if (titleRow) {
    const h1 = titleRow.querySelector('h1') || titleRow.querySelector('h2');
    if (h1) {
      titleDiv.append(h1);
    } else {
      const h = document.createElement('h1');
      h.textContent = titleRow.textContent.trim();
      titleDiv.append(h);
    }
  }
  block.append(titleDiv);

  // Row 1: Action buttons
  if (rows[1]) {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'esb-subnav-actions';
    const links = rows[1].querySelectorAll('a');
    links.forEach((a) => {
      const btn = document.createElement('a');
      btn.href = a.href;
      btn.className = 'esb-subnav-action-btn';
      btn.textContent = a.textContent.trim();
      actionsDiv.append(btn);
    });
    if (links.length === 0) {
      // Plain text — split by | for button labels
      const text = rows[1].textContent.trim();
      text.split('|').forEach((label) => {
        const btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'esb-subnav-action-btn';
        btn.textContent = label.trim();
        actionsDiv.append(btn);
      });
    }
    block.append(actionsDiv);
  }

  // Row 2: Sub-navigation links
  if (rows[2]) {
    const navDiv = document.createElement('nav');
    navDiv.className = 'esb-subnav-links';
    const links = rows[2].querySelectorAll('a');
    links.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.href;
      link.textContent = a.textContent.trim();
      // Highlight active link based on current URL
      if (window.location.pathname === new URL(a.href, window.location.origin).pathname) {
        link.classList.add('active');
      }
      navDiv.append(link);
    });
    if (links.length === 0) {
      const text = rows[2].textContent.trim();
      text.split('|').forEach((label) => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = label.trim();
        navDiv.append(link);
      });
    }
    block.append(navDiv);
  }
}
