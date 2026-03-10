/**
 * Accordion Block — Expandable/collapsible FAQ-style sections.
 * Used for Q&A content, FAQs, and any expandable content sections.
 *
 * Content structure (rows):
 *   Each row: two cells — [question/title] [answer/content]
 *   OR single cell rows with <strong> as question, rest as answer
 *
 * Auto-block structure (from FAQ page):
 *   Each row wraps a question-answer pair detected from default content.
 */
export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  block.textContent = '';
  block.setAttribute('role', 'list');

  rows.forEach((row) => {
    const cells = [...row.children];
    let question = '';
    let answerContent = null;

    if (cells.length >= 2) {
      // Two-cell structure: cell 1 = question, cell 2 = answer
      question = cells[0].textContent.trim();
      answerContent = cells[1];
    } else {
      // Single-cell: look for <strong> as question
      const strong = row.querySelector('strong');
      if (strong) {
        question = strong.textContent.trim();
        // Clone the cell content and remove the strong element
        answerContent = document.createElement('div');
        const elems = [...cells[0].children];
        let foundStrong = false;
        elems.forEach((el) => {
          if (el === strong || el.contains(strong)) {
            foundStrong = true;
            return;
          }
          if (foundStrong) {
            answerContent.appendChild(el.cloneNode(true));
          }
        });
        // If no children after strong, use remaining text
        if (!answerContent.hasChildNodes()) {
          const text = cells[0].innerHTML.split('</strong>')[1] || '';
          answerContent.innerHTML = text;
        }
      } else {
        // Treat the whole row as a heading/category
        const heading = row.querySelector('h2, h3, h4');
        if (heading) {
          const category = document.createElement('div');
          category.className = 'accordion-category';
          category.appendChild(heading.cloneNode(true));
          block.appendChild(category);
          return;
        }
        return;
      }
    }

    if (!question) return;

    const item = document.createElement('details');
    item.className = 'accordion-item';
    item.setAttribute('role', 'listitem');

    const summary = document.createElement('summary');
    summary.className = 'accordion-question';
    summary.textContent = question;

    const answer = document.createElement('div');
    answer.className = 'accordion-answer';
    if (answerContent) {
      // Move actual nodes if possible
      while (answerContent.firstChild) {
        answer.appendChild(answerContent.firstChild);
      }
    }

    item.appendChild(summary);
    item.appendChild(answer);
    block.appendChild(item);
  });
}
