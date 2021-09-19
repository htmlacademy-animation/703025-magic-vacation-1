import {SYMBOL_DELAY} from '../constants';

export default (node) => {
  const fragment = document.createDocumentFragment();
  const wordArray = node.innerText.split(` `);
  const key = node.dataset.key;
  node.innerHTML = ``;
  wordArray.forEach((word, wordIndex) => {
    const wordSpan = createSpan(`animated-word`);
    const symbolArray = word.split(``);
    symbolArray.forEach((symbol, symbolIndex) => {
      const symbolSpan = createSpan(`animated-word__symbol`);
      symbolSpan.innerText = symbol;
      symbolSpan.style = `animation-delay: ${SYMBOL_DELAY[key][wordIndex][symbolIndex]}s`;
      return wordSpan.appendChild(symbolSpan);
    });
    fragment.appendChild(wordSpan);
    if (wordIndex < wordArray.length - 1) {
      const spaceSpan = createSpan(`animated-word`);
      spaceSpan.classList.add(`animated-word--space`);
      spaceSpan.innerHTML = ` `;
      fragment.appendChild(spaceSpan);
    }
  });

  node.appendChild(fragment);
};

const createSpan = (className) => {
  const span = document.createElement(`span`);
  span.classList.add(className);
  return span;
};
