import { createOptimizedPicture, fetchPlaceholders } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  const blockClass = block.classList;

  if (blockClass.contains('api')) {
    const data = await fetchApiData();
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        div.className = 'cards-card-body';
        const h3 =document.createElement('h3');
        h3.textContent = item.type;
        div.append(h3);
        const content = document.createElement('div');
        item.values.forEach((d) => {
          const p = document.createElement('p');
          
          p.innerHTML = `<span>${d.value}:</span>${d.legacyValue}`;
          content.append(p);
        });
        div.append(content);
        li.append(div);
        ul.append(li);
        ul.append(li);
      });
    }
    block.append(ul);
  } else {
    [...block.children].forEach((row) => {
      const li = document.createElement('li');
      moveInstrumentation(row, li);
      while (row.firstElementChild) li.append(row.firstElementChild);
      [...li.children].forEach((div) => {
        if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
        else div.className = 'cards-card-body';
      });
      ul.append(li);
    });

    ul.querySelectorAll('picture > img').forEach((img) => {
      const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
      moveInstrumentation(img, optimizedPic.querySelector('img'));
      img.closest('picture').replaceWith(optimizedPic);
    });
    
  block.textContent = '';
  block.append(ul);
  }

}

async function fetchApiData() {
  try {
    const placeholders = await fetchPlaceholders();
    //console.log('Placeholders:', placeholders); // Log the output of fetchPlaceholders

    // Example: Fetch data from an API URL in placeholders
    if (placeholders.apiurl) {
      const response = await fetch(placeholders.apiurl);
      if (!response.ok) {
        console.error('Failed to fetch API data:', response.statusText);
        return [];
      }
      const data = await response.json();
      return data;
    } else {
      console.warn('No API URL found in placeholders.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching placeholders or API data:', error);
    return [];
  }
}
