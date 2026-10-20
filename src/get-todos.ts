class TodoParser {
  // Support all unordered list bullet symbols as per spec (https://daringfireball.net/projects/markdown/syntax#list)
  bulletSymbols: string[] = ["-", "*", "+"];

  // Default completed status markers
  doneStatusMarkers: string[] = ["x", "X", "-"];

  // List of strings that include the Markdown content
  #lines: string[];

  // Boolean that encodes whether nested items should be rolled over
  #withChildren: boolean;

  // Parse content with segmentation to allow for Unicode grapheme clusters
  #parseIntoChars(content: string, contentType = "content"): string[] {
    // Use Intl.Segmenter to properly split grapheme clusters if available,
    // otherwise fall back to Array.from. The fallback should not trigger in
    // Obsidian since it uses Electron which supports Intl.Segmenter.
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(segmenter.segment(content), (s) => s.segment);
    } else {
      // Array.from() splits surrogate pairs correctly but not complex grapheme clusters
      // (e.g., 👨‍👩‍👧‍👦 would be split incorrectly) and fail to match.
      console.error(
        `Intl.Segmenter not available, falling back to Array.from() for ${contentType}`,
      );
      return Array.from(content);
    }
  }

  constructor(
    lines: string[],
    withChildren: boolean,
    doneStatusMarkers: string | null,
  ) {
    this.#lines = lines;
    this.#withChildren = withChildren;
    if (doneStatusMarkers) {
      this.doneStatusMarkers = this.#parseIntoChars(
        doneStatusMarkers,
        "done status markers",
      );
    }
  }

  // Returns true if string s is a todo-item
  #isTodo(s: string): boolean {
    // Extract the checkbox content
    const match = s.match(/\s*[*+-] \[(.+?)\]/);
    if (!match) return false;

    const checkboxContent = match[1];

    // Parse content with segmentation to allow for Unicode grapheme clusters
    const contentChars = this.#parseIntoChars(
      checkboxContent,
      "checkbox content",
    );

    // Valid checkbox content must be exactly one grapheme cluster
    if (contentChars.length !== 1) {
      return false;
    }

    const singleChar = contentChars[0];

    // Exclude grapheme modifiers that are not valid as standalone content
    const graphemeModifiers = ["\u202E", "\u200B", "\u200C", "\u200D"];
    const hasGraphemeModifier = contentChars.some((char) =>
      graphemeModifiers.includes(char),
    );
    if (hasGraphemeModifier) {
      return false;
    }

    // Check if the checkbox content contains any characters that are in doneStatusMarkers
    const hasDoneMarker = contentChars.some((char) =>
      this.doneStatusMarkers.includes(char),
    );

    // Return true (is a todo) if it does NOT contain any done markers
    return !hasDoneMarker;
  }

  // Returns true if line after line-number `l` is a nested item
  #hasChildren(l: number): boolean {
    if (l + 1 >= this.#lines.length) {
      return false;
    }
    const indCurr = this.#getIndentation(l);
    const indNext = this.#getIndentation(l + 1);
    if (indNext > indCurr) {
      return true;
    }
    return false;
  }

  // Returns a list of strings that are the nested items after line `parentLinum`
  #getChildren(parentLinum: number): string[] {
    const children: string[] = [];
    let nextLinum = parentLinum + 1;
    while (this.#isChildOf(parentLinum, nextLinum)) {
      children.push(this.#lines[nextLinum]);
      nextLinum++;
    }
    return children;
  }

  // Returns true if line `linum` has more indentation than line `parentLinum`
  #isChildOf(parentLinum: number, linum: number): boolean {
    if (parentLinum >= this.#lines.length || linum >= this.#lines.length) {
      return false;
    }
    return this.#getIndentation(linum) > this.#getIndentation(parentLinum);
  }

  // Returns the heading level (number of `#`) of string s, or 0 if it is not a heading
  #getHeadingLevel(s: string): number {
    const match = s.match(/^ {0,3}(#{1,6})(\s|$)/);
    return match ? match[1].length : 0;
  }

  // Returns true if string s is a list item
  #isListItem(s: string): boolean {
    return /^\s*([*+-]|\d+[.)])\s/.test(s);
  }

  // Returns the indentation the todo at line `l` should be rolled over with.
  // Ancestors that are not rolled over (e.g. a done parent) are skipped, so the
  // todo moves up to the level of the outermost one instead of being left dangling
  #getRolloverIndentation(l: number): string {
    let childLinum = l;
    for (let p = l - 1; p >= 0 && this.#getIndentation(childLinum) > 0; p--) {
      const line = this.#lines[p];
      if (line.trim() === "" || !this.#isChildOf(p, childLinum)) continue;
      if (!this.#isListItem(line) || this.#isTodo(line)) break;
      childLinum = p;
    }
    return this.#lines[childLinum].slice(0, this.#getIndentation(childLinum));
  }

  // Returns the number of whitespace-characters at beginning of string at line `l`
  #getIndentation(l: number): number {
    return this.#lines[l].search(/\S/);
  }

  // Returns a list of strings that represents all the todos along with there potential children
  getTodos(): string[] {
    let todos: string[] = [];
    // Headings that enclose the current line, outermost first
    let sections: { line: string; level: number; added: boolean }[] = [];
    for (let l = 0; l < this.#lines.length; l++) {
      const line = this.#lines[l];
      const headingLevel = this.#getHeadingLevel(line);
      if (headingLevel > 0) {
        // A heading ends every open section of the same or a deeper level
        sections = sections.filter((s) => s.level < headingLevel);
        sections.push({ line, level: headingLevel, added: false });
      }
      if (this.#isTodo(line)) {
        // Add the enclosing headings before the first todo of their section
        for (const section of sections) {
          if (!section.added) {
            todos.push(section.line);
            section.added = true;
          }
        }
        const indentation = this.#getRolloverIndentation(l);
        const oldIndentationLength = this.#getIndentation(l);
        const reindent = (s: string) =>
          indentation + s.slice(oldIndentationLength);
        todos.push(reindent(line));
        if (this.#withChildren && this.#hasChildren(l)) {
          const cs = this.#getChildren(l);
          todos = [...todos, ...cs.map(reindent)];
          l += cs.length;
        }
      }
    }
    return todos;
  }
}

interface GetTodosOptions {
  lines: string[];
  withChildren?: boolean;
  doneStatusMarkers?: string | null;
}

// Utility-function that acts as a thin wrapper around `TodoParser`
export const getTodos = ({
  lines,
  withChildren = false,
  doneStatusMarkers = null,
}: GetTodosOptions): string[] => {
  const todoParser = new TodoParser(lines, withChildren, doneStatusMarkers);
  return todoParser.getTodos();
};
