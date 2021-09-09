import throttle from 'lodash/throttle';

export default class FullPageScroll {
  constructor() {
    this.THROTTLE_TIMEOUT = 2000;

    this.screenElements = document.querySelectorAll(`.screen:not(.screen--result)`);
    this.menuElements = document.querySelectorAll(`.page-header__menu .js-menu-link`);
    this.prizesAnimationBlock = document.getElementById(`js-prizes-animation-block`);
    this.activeScreen = 0;
    this.onScrollHandler = this.onScroll.bind(this);
    this.onUrlHashChangedHandler = this.onUrlHashChanged.bind(this);
    this.animatePageBg = this.animatePageBg.bind(this);
    this.currentScreen = null;
  }

  init() {
    document.addEventListener(`wheel`, throttle(this.onScrollHandler, this.THROTTLE_TIMEOUT, {trailing: true}));
    window.addEventListener(`popstate`, this.onUrlHashChangedHandler);

    this.onUrlHashChanged();
    this.prizesAnimationBlock.addEventListener(`animationend`, this.animatePageBg);
  }

  onScroll(evt) {
    const currentPosition = this.activeScreen;
    this.reCalculateActiveScreenPosition(evt.deltaY);
    if (currentPosition !== this.activeScreen) {
      this.changePageDisplay();
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
    const shouldAnimatePrizes = Boolean(prevScreen === `story` && this.currentScreen === `prizes`);
    this.changeVisibilityDisplay(shouldAnimatePrizes);
    this.changeActiveMenuItem();
    this.emitChangeDisplayEvent();
  }

  changeVisibilityDisplay(shouldAnimatePrizes) {
    if (shouldAnimatePrizes) {
      this.prizesAnimationBlock.classList.add(`prizes-animation-block--show`);
    } else {
      this.toggleScreens();
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

  reCalculateActiveScreenPosition(delta) {
    if (delta > 0) {
      this.activeScreen = Math.min(this.screenElements.length - 1, ++this.activeScreen);
    } else {
      this.activeScreen = Math.max(0, --this.activeScreen);
    }
  }
}
