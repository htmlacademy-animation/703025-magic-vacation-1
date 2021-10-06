import throttle from 'lodash/throttle';
import splitStringToSpan from '../utils/splitStringToSpan';

const ANIMATE_PRISES_BLOCK = `ANIMATE_PRISES_BLOCK`;
const TOGGLE_FOOTNOTE = `TOGGLE_FOOTNOTE`;
const CLEANUP_FOOTNOTE = `CLEANUP_FOOTNOTE`;

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 2000;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);
    this.prizesAnimationBlock = document.getElementById(`js-prizes-animation-block`);
    this.titlesShouldBeSplit = document.querySelectorAll(`.js-animate-split-text`);
    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChangedHandler = this.onUrlHashChanged.bind(this);
    this.animatePageBg = this.animatePageBg.bind(this);
    this.currentScreen = null;
  }

  init() {
    this.titlesShouldBeSplit.forEach(splitStringToSpan);
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChangedHandler);

    this.onUrlHashChanged();
    this.prizesAnimationBlock.addEventListener(`animationend`, this.animatePageBg);
  }

  onScroll(evt) {
    const currentPosition = this.activeScreen;
    const prevScreen = this.screenElements[this.activeScreen] ? this.screenElements[this.activeScreen].id : null;
    this.reCalculateActiveScreenPosition(evt.deltaY);
    if (currentPosition !== this.activeScreen) {
      this.changePageDisplay(prevScreen);
    }
  }

  onUrlHashChanged() {
    const newIndex = Array.from(this.screenElements).findIndex((screen) => location.hash.slice(1) === screen.id);
    this.activeScreen = (newIndex < 0) ? 0 : newIndex;
    const prevScreen = this.currentScreen;
    this.currentScreen = this.screenElements[newIndex] ? this.screenElements[newIndex].id : null;
    this.changePageDisplay(prevScreen);
  }

  changePageDisplay(prevScreen) {
    let action;
    switch (true) {
      case Boolean(prevScreen === `story` && this.currentScreen === `prizes`):
        action = ANIMATE_PRISES_BLOCK;
        break;
      case Boolean([`rules`, `prizes`].indexOf(prevScreen) >= 0 && [`rules`, `prizes`].indexOf(this.currentScreen) >= 0):
        action = TOGGLE_FOOTNOTE;
        break;
      case prevScreen === `prizes`:
        action = CLEANUP_FOOTNOTE;
        break;
      default:
        break;
    }
    this.changeVisibilityDisplay(action, prevScreen, this.currentScreen);
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  changeVisibilityDisplay(action, prevScreen, currentScreen) {
    switch (true) {
      case action === ANIMATE_PRISES_BLOCK:
        this.prizesAnimationBlock.classList.add(`prizes-animation-block--show`);
        break;
      case action === TOGGLE_FOOTNOTE:
        this.toggleFootnote(prevScreen, currentScreen);
        break;
      case action === CLEANUP_FOOTNOTE:
        this.cleanUpFootnote(prevScreen);
        this.toggleScreens();
        break;
      default:
        this.toggleScreens();
        break;
    }
  }

  animatePageBg(evt) {
    if (evt.animationName === `showPrizesAnimationBlock`) {
      this.prizesAnimationBlock.classList.add(`prizes-animation-block--hide`);
      this.toggleScreens();
    } else {
      this.prizesAnimationBlock.classList.remove(`prizes-animation-block--show`, `prizes-animation-block--hide`);
    }
  }

  toggleScreens() {
    this.screenElements.forEach((screen) => {
      screen.classList.add(`screen--hidden`);
      screen.classList.remove(`active`);
    });
    this.screenElements[this.activeScreen].classList.remove(`screen--hidden`);
    this.screenElements[this.activeScreen].classList.add(`active`);
  }

  changeActiveMenuItem() {
    const activeItem = Array.from(this.menuElements).find((item) => item.dataset.href === this.screenElements[this.activeScreen].id);
    if (activeItem) {
      this.menuElements.forEach((item) => item.classList.remove(`active`));
      activeItem.classList.add(`active`);
    }
  }

  emitChangeDisplayEvent() {
    const event = new CustomEvent(`screenChanged`, {
      detail: {
        'screenId': this.activeScreen,
        'screenName': this.screenElements[this.activeScreen].id,
        'screenElement': this.screenElements[this.activeScreen]
      }
    });

    document.body.dispatchEvent(event);
  }

  toggleFootnote(prevScreen, currentScreen) {
    const currentFootnote = document.getElementById(`${prevScreen}-footnote`);
    const nextFootnote = document.getElementById(`${currentScreen}-footnote`);

    currentFootnote.addEventListener(`animationend`, () => {
      currentFootnote.classList.add(`d-none`);
      nextFootnote.classList.add(`d-block`);
    }, {once: true});

    nextFootnote.addEventListener(`animationend`, () => {
      this.toggleScreens();
      currentFootnote.classList.remove(`hide-child`, `d-none`);
      nextFootnote.classList.remove(`show-child`, `d-block`);
    }, {once: true});

    currentFootnote.classList.add(`hide-child`);
    nextFootnote.classList.add(`show-child`, `no-animation-transform`);
  }

  cleanUpFootnote(prevScreen) {
    const currentFootnote = document.getElementById(`${prevScreen}-footnote`);
    currentFootnote.classList.remove(`hide-child`, `d-none`, `no-animation-transform`);
  }

  reCalculateActiveScreenPosition(delta) {
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
    this.currentScreen = this.screenElements[this.activeScreen] ? this.screenElements[this.activeScreen].id : null;
  }
}
