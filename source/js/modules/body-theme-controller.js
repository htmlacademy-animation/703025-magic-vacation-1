class BodyThemeController {
  constructor() {
    this.body = document.body;
  }

  reset() {
    if (this.body.classList.contains(`body-loaded`) && this.body.className !== `body-loaded`) {
      this.body.className = `body-loaded`;
    }
  }

  setThemeClass(activeIndex) {
    this.reset();
    let themeClass;
    switch (true) {
      case activeIndex === 2:
        themeClass = `theme-lightblue`;
        break;

      case activeIndex === 4:
        themeClass = `theme-blue`;
        break;

      default:
        themeClass = `theme-default`;
        break;
    }
    this.body.classList.add(themeClass);
  }
}

const bodyThemeController = new BodyThemeController();

export default bodyThemeController;
