export class TypedText {
  #text;
  constructor() {
    this.#text = [];
  }
  append(newText) {
    this.#text.push(newText);
  }
  toString() {
    return this.#text.join("");
  }
  length() {
    return this.#text.length;
  }
  backspace() {
    this.#text.pop();
  }
}
