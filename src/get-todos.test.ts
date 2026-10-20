import { expect, test } from "vitest";
import { getTodos } from "./get-todos";

test("single todo element should return itself", () => {
  // GIVEN
  const lines = ["- [ ] tada"];

  // WHEN
  const result = getTodos({ lines });

  // THEN
  const todos = ["- [ ] tada"];
  expect(result).toStrictEqual(todos);
});

test("single incomplete element should return itself", () => {
  // GIVEN
  const lines = ["- [/] tada"];

  // WHEN
  const result = getTodos({ lines });

  // THEN
  const todos = ["- [/] tada"];
  expect(result).toStrictEqual(todos);
});

test("single done todo element should not return itself", () => {
  // GIVEN
  const lines = ["- [x] tada"];

  // WHEN
  const result = getTodos({ lines });

  // THEN
  const todos: string[] = [];
  expect(result).toStrictEqual(todos);
});

test("single canceled todo element should not return itself", () => {
  // GIVEN
  const lines = ["- [-] tada"];

  // WHEN
  const result = getTodos({ lines });

  // THEN
  const todos: string[] = [];
  expect(result).toStrictEqual(todos);
});

test("get todos with children", function () {
  // GIVEN
  const lines = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
    "- this isn't copied",
  ];

  // WHEN
  const todos = getTodos({ lines: lines, withChildren: true });

  // THEN
  const result = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos (with alternate symbols) with children", function () {
  // GIVEN
  const lines = [
    "+ [ ] TODO",
    "    + [ ] Next",
    "    * some stuff",
    "* [ ] Another one",
    "    - [ ] More children",
    "    + another child",
    "- this isn't copied",
  ];

  // WHEN
  const todos = getTodos({ lines: lines, withChildren: true });

  // THEN
  const result = [
    "+ [ ] TODO",
    "    + [ ] Next",
    "    * some stuff",
    "* [ ] Another one",
    "    - [ ] More children",
    "    + another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos (with alternate symbols and partially checked todos) with children", function () {
  // GIVEN
  const lines = [
    "+ [x] Completed TODO",
    "    + [ ] Next",
    "    * some stuff",
    "* [ ] Another one",
    "    - [x] Completed child",
    "    + another child",
    "- this isn't copied",
  ];

  // WHEN
  const todos = getTodos({ lines: lines, withChildren: true });

  // THEN
  const result = [
    "    + [ ] Next",
    "* [ ] Another one",
    "    - [x] Completed child",
    "    + another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos (with custom ✅ done status and 🟣 not-done child status) with children", function () {
  // GIVEN
  const lines = [
    "+ [✅] Completed TODO",
    "    + [🟣] Next",
    "    * some stuff",
    "* [🟣] Another one",
    "    - [✅] Completed child",
    "    + another child",
    "- this isn't copied",
  ];

  // WHEN
  const todos = getTodos({
    lines: lines,
    withChildren: true,
    doneStatusMarkers: "✅",
  });

  // THEN
  const result = [
    "    + [🟣] Next",
    "* [🟣] Another one",
    "    - [✅] Completed child",
    "    + another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos (with default dash prefix and finished todos) with children", function () {
  // GIVEN
  const lines = [
    "- [x] Completed TODO",
    "    - [ ] Next",
    "    * some stuff",
    "- [ ] Another one",
    "    - [x] Completed child",
    "    + another child",
    "* this isn't copied",
  ];

  // WHEN
  const todos = getTodos({ lines: lines, withChildren: true });

  // THEN
  const result = [
    "    - [ ] Next",
    "- [ ] Another one",
    "    - [x] Completed child",
    "    + another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos without children", () => {
  // GIVEN
  const lines = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
    "- this isn't copied",
  ];

  // WHEN
  const todos = getTodos({ lines });

  // THEN
  const result = [
    "- [ ] TODO",
    "    - [ ] Next",
    "- [ ] Another one",
    "    - [ ] More children",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos without children (with 🟣 not-done child status)", () => {
  // GIVEN
  const lines = [
    "- [ ] TODO",
    "    - [🟣] Next",
    "    - some stuff",
    "- [🟣] Another one",
    "    - [ ] More children",
    "    - another child",
    "- this isn't copied",
  ];

  // WHEN
  const todos = getTodos({ lines });

  // THEN
  const result = [
    "- [ ] TODO",
    "    - [🟣] Next",
    "- [🟣] Another one",
    "    - [ ] More children",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos with correct alternate checkbox children", function () {
  // GIVEN
  const lines = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - [x] Completed task",
    "    - some stuff",
    "- [ ] Another one",
    "    - [ ] Another child",
    "    - [/] More children",
    "    - another child",
    "- this isn't copied",
  ];

  // WHEN
  const todos = getTodos({ lines: lines, withChildren: true });

  // THEN
  const result = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - [x] Completed task",
    "    - some stuff",
    "- [ ] Another one",
    "    - [ ] Another child",
    "    - [/] More children",
    "    - another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos with children doesn't fail if child at end of list", () => {
  // GIVEN
  const lines = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
  ];

  // WHEN
  const todos = getTodos({ lines, withChildren: true });

  // THEN
  const result = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos with nested children also adds nested children", () => {
  // GIVEN
  const lines = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "        - some stuff",
    "        - some stuff",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
  ];

  // WHEN
  const todos = getTodos({ lines, withChildren: true });

  // THEN
  const result = [
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "        - some stuff",
    "        - some stuff",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos doesn't add intermediate other elements", () => {
  // GIVEN
  const lines = [
    "# Some title",
    "",
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "",
    "## Some title",
    "",
    "Some text",
    "...that continues here",
    "",
    "- Here is a bullet item",
    "- Here is another bullet item",
    "1. Here is a numbered list item",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
  ];

  // WHEN
  const todos = getTodos({ lines, withChildren: true });

  // THEN
  const result = [
    "# Some title",
    "- [ ] TODO",
    "    - [ ] Next",
    "    - some stuff",
    "## Some title",
    "- [ ] Another one",
    "    - [ ] More children",
    "    - another child",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos supports custom done status markers", () => {
  // GIVEN
  const lines = [
    "- [ ] Incomplete task",
    "- [x] Completed task (x)",
    "- [X] Completed task (X)",
    "- [-] Completed task (-)",
    "- [C] Task with custom status (C)",
    "- [?] Task with custom status (?)",
  ];

  // WHEN - only consider 'C' and '?' as done
  const todos = getTodos({ lines, doneStatusMarkers: "C?" });

  // THEN - x, X, and - should be considered incomplete now
  const result = [
    "- [ ] Incomplete task",
    "- [x] Completed task (x)",
    "- [X] Completed task (X)",
    "- [-] Completed task (-)",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos supports custom status marker edge cases (exclusion)", () => {
  // GIVEN
  const lines = [
    "- [ ] Normal task",
    // Emojis and symbols
    "- [✅] Checkmark emoji",
    "- [❌] Cross emoji",
    "- [✔️] Heavy checkmark",
    "- [✓] Checkmark symbol",
    "- [✗] Ballot X",
    "- [👍] Thumbs up",
    // Control and non-printable characters
    "- [\u0000] Null",
    "- [\u0007] Bell",
    "- [\u0008] Backspace",
    "- [\u001B] Escape",
    // Combining characters
    "- [a\u0300] Letter with accent",
    "- [e\u0301] Letter with acute",
    // Regex special characters
    "- [.] Dot",
    "- [*] Star",
    "- [+] Plus",
    "- [?] Question",
    "- [(] Open paren",
    "- [)] Close paren",
    "- [[] Open bracket",
    "- []] Close bracket",
    "- [{] Open brace",
    "- [}] Close brace",
    "- [^] Caret",
    "- [$] Dollar",
    "- [|] Pipe",
    "- [\\] Backslash",
    "- [/] Forward slash",
    // Simple accented characters (should be valid)
    "- [à] Simple accented character",
    "- [é] Simple accented character 2",
  ];

  // WHEN - using all types of characters as done markers
  const todos = getTodos({
    lines,
    doneStatusMarkers:
      "✅❌✔️✓✗👍\u0000\u0007\u0008\u001B\u202Ea\u0300e\u0301.*+?()[]{}\\^$|/àé",
  });

  // THEN - only the normal task should be returned
  const result = ["- [ ] Normal task"];
  expect(todos).toStrictEqual(result);
});

test("get todos supports custom status marker edge cases (inclusion)", () => {
  // GIVEN
  const lines = [
    "- [ ] Normal task",
    // Emojis and symbols
    "- [✅] Checkmark emoji",
    "- [❌] Cross emoji",
    "- [✔️] Heavy checkmark",
    "- [✓] Checkmark symbol",
    "- [✗] Ballot X",
    "- [👍] Thumbs up",
    // Control and non-printable characters
    "- [\u0000] Null",
    "- [\u0007] Bell",
    "- [\u0008] Backspace",
    "- [\u001B] Escape",
    // Combining characters
    "- [a\u0300] Letter with accent",
    "- [e\u0301] Letter with acute",
    // Regex special characters
    "- [.] Dot",
    "- [*] Star",
    "- [+] Plus",
    "- [?] Question",
    "- [(] Open paren",
    "- [)] Close paren",
    "- [[] Open bracket",
    "- []] Close bracket",
    "- [{] Open brace",
    "- [}] Close brace",
    "- [^] Caret",
    "- [$] Dollar",
    "- [|] Pipe",
    "- [\\] Backslash",
    "- [/] Forward slash",
    // Simple accented characters (should be valid)
    "- [à] Simple accented character",
    "- [é] Simple accented character 2",
  ];

  // WHEN - only consider 'C' as done
  const todos = getTodos({ lines, doneStatusMarkers: "C" });

  // THEN - only the normal task should be returned
  const result = [
    "- [ ] Normal task",
    // Emojis and symbols
    "- [✅] Checkmark emoji",
    "- [❌] Cross emoji",
    "- [✔️] Heavy checkmark",
    "- [✓] Checkmark symbol",
    "- [✗] Ballot X",
    "- [👍] Thumbs up",
    // Control and non-printable characters
    "- [\u0000] Null",
    "- [\u0007] Bell",
    "- [\u0008] Backspace",
    "- [\u001B] Escape",
    // Combining characters
    "- [a\u0300] Letter with accent",
    "- [e\u0301] Letter with acute",
    // Regex special characters
    "- [.] Dot",
    "- [*] Star",
    "- [+] Plus",
    "- [?] Question",
    "- [(] Open paren",
    "- [)] Close paren",
    "- [[] Open bracket",
    "- []] Close bracket",
    "- [{] Open brace",
    "- [}] Close brace",
    "- [^] Caret",
    "- [$] Dollar",
    "- [|] Pipe",
    "- [\\] Backslash",
    "- [/] Forward slash",
    // Simple accented characters (should be valid)
    "- [à] Simple accented character",
    "- [é] Simple accented character 2",
  ];
  expect(todos).toStrictEqual(result);
});

test("should not match malformed todos", () => {
  const lines = [
    "- [ ] valid todo",
    "- [x] done", // done, should NOT match
    // Malformed, should not match
    "- [] empty",
    "- [  ] multiple spaces",
    "- [✅\u200B\u0300] multiple special",
    "- [.*+?()] multiple regexp",
    "- [a\u0300\u200B] multimple combining",
    // Grapheme modifiers, not valid on their own
    "- [\u202E] RTL override",
    "- [\u200B] Zero-width space",
    "- [\u200C] Zero-width non-joiner",
    "- [\u200D] Zero-width joiner",
  ];
  const todos = getTodos({ lines });
  expect(todos).toStrictEqual(["- [ ] valid todo"]);
});

// If a parent todo is checked (for example "- [x] Parent task"), the child todos should be moved back so it doesn't break the top level.
test.each(["#", "##", "###", "####", "#####", "######"])(
  "get todos rolls over the %s section heading together with its todos",
  (hashes) => {
    // GIVEN
    const lines = [`${hashes} Work`, "- [ ] Write report", "- [ ] Review PR"];

    // WHEN
    const todos = getTodos({ lines });

    // THEN
    const result = [`${hashes} Work`, "- [ ] Write report", "- [ ] Review PR"];
    expect(todos).toStrictEqual(result);
  },
);

test.each(["#", "##", "###", "####", "#####", "######"])(
  "get todos only rolls over %s section headings that contain open todos",
  (hashes) => {
    // GIVEN
    const lines = [
      "- [ ] Not in a section",
      "",
      `${hashes} Work`,
      "- [ ] Write report",
      "    - [ ] Gather numbers",
      "- [x] Send email",
      "",
      `${hashes} Done section`,
      "- [x] Already finished",
      "",
      `${hashes} Home`,
      "- [ ] Buy groceries",
    ];

    // WHEN
    const todos = getTodos({ lines, withChildren: true });

    // THEN
    const result = [
      "- [ ] Not in a section",
      `${hashes} Work`,
      "- [ ] Write report",
      "    - [ ] Gather numbers",
      `${hashes} Home`,
      "- [ ] Buy groceries",
    ];
    expect(todos).toStrictEqual(result);
  },
);

test("get todos rolls over the parent headings of nested sections", () => {
  // GIVEN
  const lines = [
    "# Projects",
    "## Work",
    "### Reports",
    "- [ ] Write report",
    "### Reviews",
    "- [x] Review PR",
    "## Home",
    "- [ ] Buy groceries",
    "# Notes",
    "## Ideas",
    "- [x] Already finished",
    "###### Deep",
    "- [ ] Deep todo",
  ];

  // WHEN
  const todos = getTodos({ lines });

  // THEN
  const result = [
    "# Projects",
    "## Work",
    "### Reports",
    "- [ ] Write report",
    "## Home",
    "- [ ] Buy groceries",
    "# Notes",
    "## Ideas",
    "###### Deep",
    "- [ ] Deep todo",
  ];
  expect(todos).toStrictEqual(result);
});

test("get todos does not roll over a heading for todos that come before it", () => {
  // GIVEN
  const lines = ["- [ ] Before any heading", "## Empty section", "Some text"];

  // WHEN
  const todos = getTodos({ lines });

  // THEN
  expect(todos).toStrictEqual(["- [ ] Before any heading"]);
});

test("get todos does not treat non-headings as section headings", () => {
  // GIVEN
  const lines = [
    "#tag",
    "####### Seven hashes",
    "    # Indented code",
    "- [ ] Write report",
  ];

  // WHEN
  const todos = getTodos({ lines });

  // THEN
  expect(todos).toStrictEqual(["- [ ] Write report"]);
});
