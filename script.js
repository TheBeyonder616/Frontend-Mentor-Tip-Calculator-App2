"use strict";

/**
 * ? Manages class manipulation for DOM elements.
 * @param {Element} el - The element to modify.
 * @param {string} cl - The class to add/remove/toggle.
 */
const cList = {
  add: (el, cl) => el.classList.add(cl),
  rem: (el, cl) => el.classList.remove(cl),
  tog: (el, cl) => el.classList.toggle(cl),
  close: (el, cl) => el.closest(cl),
};

/**
 * ? Provides methods to select DOM elements.
 * @param {Element} el - The context element.
 * @param {string} sl - The selector string.
 * @return {Element|null} - The selected element or null.
 */
const select = {
  el: (el, sl) => el.querySelector(sl),
  elAll: (el, sl) => el.querySelectorAll(sl),
  id: (el) => document.getElementById(el),
};

class TipCalculator {
  constructor() {
    this.bill = 0;
    this.percentage = 0;
    this.count = 0;
    this.tipAmount = 0;
    this.total = 0;
  }

  /**
   * ? Validates the input format.
   * @param {string} input - The input string to validate.
   * @return {boolean} - True if valid, false otherwise.
   */
  _isValid(input) {
    const regex = /^(?!-)([1-9]\d*)(\.\d+)?$/;
    return regex.test(input);
  }

  /**
   * ? Extracts a number from the target element's parent.
   * @param {Event} e - The event object.
   * @return {string} - The extracted number as a string.
   */
  _getNumber(e) {
    const parent = e.target.parentNode;
    const number = parent.textContent.trim().slice("0", "-1");
    return number;
  }

  /**
   * ?Gets the value from the input element.
   * @param {Event} e - The event object.
   * @return {string} - The value of the input.
   */
  _getValue(e) {
    const value = e.target.value;
    return value;
  }

  /**
   * ? Validates the input value.
   * @param {Event} e - The event object.
   * @return {boolean} - True if valid, false otherwise.
   */
  _validateValue(e) {
    const value = this._getValue(e);
    const isValid = this._isValid(value);
    return isValid;
  }

  /**
   * ? Displays an error message.
   * @param {Element} el - The element to display the message in.
   * @param {boolean} empty - Indicates if the input is empty.
   * @return {string} - The error message displayed.
   */
  _message(el, empty) {
    let message;
    empty ? (message = `Filed is required`) : (message = `Invalid Number`);
    return (el.textContent = message);
  }

  /**
   * ?Handles invalid number input.
   * @param {Element} mes - The element to display the message.
   * @param {boolean} valid - Indicates if the input is valid.
   * @param {Event} e - The event object.
   */
  _invalidNumber(mes, valid, e) {
    let time = 200;
    this._message(mes, valid);
    setTimeout(() => (e.target.value = ""), time);
  }

  /**
   * ?Validates the input and adds/removes error class.
   * @param {boolean} valid - Indicates if the input is valid.
   * @param {Element} el - The element to modify.
   * @param {Event} e - The event object.
   * @param {Element} mes - The error message element.
   * @return {number|undefined} - The valid input as a number or undefined.
   */
  _validation(valid, el, e, mes) {
    let message = mes;
    let input = e.target.value;
    if (!valid) {
      cList.add(el, "invalid--section");
      const empty = input === "";
      return empty
        ? this._invalidNumber(message, true, e)
        : this._invalidNumber(message, false, e);
    } else {
      cList.rem(el, "invalid--section");
      return +input;
    }
  }

  /**
   * ? Determines the percentage input.
   * @param {Event} e - The event object.
   */
  _getPercentage(e) {
    const parent = cList.close(e.target, `[data-display="validation"]`);
    const percentageInput = select.el(
      parent,
      '[data-input="percentage-custom"'
    );
    const radios = select.elAll(parent, `[data-input="percentage"]`);

    const isValid = {
      invalidInput: () => {
        let time = 200;
        this.percentage = 0;
        setTimeout(() => (percentageInput.value = ""), time);
      },
      validInput: () => {
        radios.forEach((radio) => (radio.checked = false));
        this.percentage = this.handleErrorDisplay(e);
      },
      validRadio: () => {
        percentageInput.value = "";
        this.percentage = +this._getNumber(e);
      },
    };

    const type = e.target.type;

    switch (type) {
      case "radio":
        const notChecked = !e.target.checked;
        if (notChecked) return;
        isValid.validRadio();
        break;
      case "number":
        const invalid = !percentageInput.value || !this._validateValue(e);
        invalid ? isValid.invalidInput() : isValid.validInput();
        break;
      default:
        this.percentage = 0;
        break;
    }
  }

  /**
   * ? Displays validation errors for the percentage input.
   * @param {Event} e - The event object.
   * @return {number|undefined} - The valid input as a number or undefined.
   */
  handleErrorDisplay(e) {
    const validEl = cList.close(e.target, `[data-display="validation"]`);
    const messageEl = select.el(validEl, `[data-display="error"]`);
    const isInvalid = !this._validateValue(e);
    return isInvalid
      ? this._validation(false, validEl, e, messageEl)
      : this._validation(true, validEl, e, messageEl);
  }

  /**
   * ?Calculates the tip amount.
   * @return {number} - The calculated tip amount.
   */
  _calculateTipAmount() {
    if (!this.bill && !this.percentage) return 0;
    this.tipAmount = this.bill * (this.percentage / 100);
    return this.tipAmount;
  }

  /**
   * ?Calculates the total amount including tip.
   * @return {number} - The total amount including tip.
   */
  _calculateTotalAmount() {
    return this.bill + this._calculateTipAmount();
  }

  /**
   * ?Calculates the tip amount per person.
   * @return {number} - The tip amount per person.
   */
  calculateTipPerPerson() {
    return this.count > 0 ? this._calculateTipAmount() / this.count : 0;
  }

  /**
   * ? Calculates the total amount per person.
   * @return {number} - The total amount per person.
   */
  calculateTotalPerPerson() {
    return this.count > 0 ? this._calculateTotalAmount() / this.count : 0;
  }

  /**
   * ? Checks if all values are set.
   * @return {boolean} - True if all values are set, false otherwise.
   */
  _allSet() {
    return [this.bill, this.percentage, this.count].every((value) => value > 0);
  }

  // !============================================={Display}
  /**
   * ? Displays errors related to percentage input.
   */
  _percentageError() {
    //? Percentage
    const percentage = select.el(document, `[data-input="percentage-custom"]`);
    const valid = cList.close(percentage, `[data-display="validation"]`);
    const error = select.el(valid, `[data-display="error"]`);

    if (this.percentage === 0) {
      this._message(error, true);
      cList.add(valid, "invalid--section");
    } else cList.rem(valid, "invalid--section");
  }

  _handleErrorAll() {
    const bill = select.el(document, `[data-input="bill"]`);
    const count = select.el(document, `[data-input="people"]`);
    const billCount = [bill, count];

    billCount.forEach((bill) => {
      const valid = cList.close(bill, `[data-display="validation"]`);
      const error = select.el(valid, `[data-display="error"]`);
      if (bill.value === "") {
        this._message(error, true);
        cList.add(valid, "invalid--section");
      }
    });

    this._percentageError();
  }

  /**
   * ? Handles errors for all input fields.
   */
  _handleAllCalculation() {
    const tip = select.el(document, `[data-display="tip"]`);
    const total = select.el(document, `[data-display="total"]`);
    const tipPerPerson = this.calculateTipPerPerson().toFixed(2);
    const totalPerPerson = this.calculateTotalPerPerson().toFixed(2);
    tip.textContent = `$${tipPerPerson}`;
    total.textContent = `$${totalPerPerson}`;
  }
  /**
   * ? Initiates calculation if all values are set.
   */
  _calculate() {
    if (!this._allSet()) return;
    this._handleAllCalculation();
  }

  /**
   * ? Calculates values and handles error displays.
   */
  _calculateAndHandleError() {
    const allSet = this._allSet();
    !allSet ? this._handleErrorAll() : this._handleAllCalculation();
  }

  /**
   * ? Initializes values based on input events.
   * @param {Event} e - The event object.
   */
  initValue(e) {
    const inputHandlers = {
      bill: () => {
        this.bill = this.handleErrorDisplay(e);
        this._calculate();
      },
      "percentage-custom": () => {
        this._getPercentage(e);
        this._calculate();
        this._percentageError();
      },
      percentage: () => {
        this._getPercentage(e);
        this._calculate();
        this._percentageError();
      },
      people: () => {
        this.count = this.handleErrorDisplay(e);
        this._calculateAndHandleError();
      },
    };

    const input = e.target.dataset.input;
    inputHandlers[input]
      ? inputHandlers[input]?.()
      : console.warn(`NO handler for input: ${input}`);
  }
  // !======================================{Reset}

  /**
   * ? Resets all calculated values.
   */
  _resetValues() {
    this.bill = 0;
    this.percentage = 0;
    this.count = 0;
    this.tipAmount = 0;
    this.total = 0;
  }

  /**
   * ? Resets input fields.
   */
  _resetInput() {
    const billInput = select.el(document, `[data-input="bill"]`);
    const percentageCustomInput = select.el(
      document,
      `[data-input="percentage-custom"]`
    );
    const peopleInput = select.el(document, `[data-input="people"]`);
    billInput.value = "";
    percentageCustomInput.value = "";
    peopleInput.value = "";
  }

  /**
   * ? Resets radio button inputs.
   */
  _resetRadio() {
    const radios = select.elAll(document, `[data-input="percentage"]`);
    radios.forEach((radio) => (radio.checked = false));
  }

  /**
   * ? Resets display values for tip and total.
   */
  _resetDisplay() {
    const tipDisplay = select.el(document, `[data-display="tip"]`);
    const totalDisplay = select.el(document, `[data-display="total"]`);
    tipDisplay.textContent = "$0.00";
    totalDisplay.textContent = "$0.00";
  }

  /**
   * ? Resets error messages in the UI.
   */
  _resetErrorMessage() {
    const errorDisplays = select.elAll(document, `[data-display="error"]`);
    errorDisplays.forEach((errorEl) => (errorEl.textContent = ""));
  }

  /**
   * ? Resets all fields and values.
   */
  reset() {
    this._resetValues();
    this._resetInput();
    this._resetRadio();
    this._resetDisplay();
    this._resetErrorMessage();
  }
}

const tip = new TipCalculator();
const main = select.id("main");
const form = select.el(document, `[data-input="form"]`);

/**
 * ? Creates a debounced version of a function.
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @return {Function} - The debounced function.
 */
const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

/**
 * ? Handles input events for the calculator.
 * @param {Event} e - The event object.
 */
const handleInput = debounce((e) => tip.initValue(e), 100);

/**
 * ? Handles click events, particularly for reset actions.
 * @param {Event} e - The event object.
 */
const handleClick = debounce((e) => {
  const reset = cList.close(e.target, `[data-reset]`);
  if (reset) tip.reset();
}, 100);

/**
 * ? Handles key events, especially the Enter key.
 * @param {Event} e - The event object.
 */
const handleKey = debounce((e) => {
  const target = e.target;
  const key = e.key === "Enter";
  const percentage = cList.close(target, `[data-input="percentage"]`);
  const isClicked = percentage && key;
  if (isClicked) {
    percentage.checked = true;
    tip.initValue(e);
  }
}, 100);

/**
 * ? Initializes event listeners for DOM elements.
 */
const initDom = () => {
  form.addEventListener("input", handleInput);
  main.addEventListener("click", handleClick);
  form.addEventListener("keydown", handleKey);
};

document.addEventListener("DOMContentLoaded", initDom);
