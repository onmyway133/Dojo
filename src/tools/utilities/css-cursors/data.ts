export interface CursorInfo {
  value: string;
  description: string;
}

export interface CursorGroup {
  name: string;
  cursors: CursorInfo[];
}

/** CSS `cursor` keywords from CSS Basic User Interface Level 4, grouped as MDN groups them. */
export const cursorGroups: CursorGroup[] = [
  {
    name: "General",
    cursors: [
      { value: "auto", description: "Browser picks based on context (text over text, etc.)" },
      { value: "default", description: "Platform default, usually an arrow" },
      { value: "none", description: "No cursor is shown" },
    ],
  },
  {
    name: "Links and status",
    cursors: [
      { value: "context-menu", description: "A context menu is available" },
      { value: "help", description: "Help information is available" },
      { value: "pointer", description: "A link or clickable element" },
      { value: "progress", description: "Busy in the background, still interactive" },
      { value: "wait", description: "Busy, can't interact yet" },
    ],
  },
  {
    name: "Selection",
    cursors: [
      { value: "cell", description: "A table cell or set of cells can be selected" },
      { value: "crosshair", description: "Precise selection, like a bitmap editor" },
      { value: "text", description: "Text can be selected" },
      { value: "vertical-text", description: "Vertical text can be selected" },
    ],
  },
  {
    name: "Drag and drop",
    cursors: [
      { value: "alias", description: "An alias or shortcut will be created" },
      { value: "copy", description: "Something will be copied" },
      { value: "move", description: "Something will be moved" },
      { value: "no-drop", description: "Can't drop here" },
      { value: "not-allowed", description: "The action is not allowed" },
      { value: "grab", description: "Something can be grabbed and dragged" },
      { value: "grabbing", description: "Something is being dragged" },
    ],
  },
  {
    name: "Resizing and scrolling",
    cursors: [
      { value: "all-scroll", description: "Can scroll in any direction" },
      { value: "col-resize", description: "A column can be resized horizontally" },
      { value: "row-resize", description: "A row can be resized vertically" },
      { value: "n-resize", description: "Edge moves up" },
      { value: "e-resize", description: "Edge moves right" },
      { value: "s-resize", description: "Edge moves down" },
      { value: "w-resize", description: "Edge moves left" },
      { value: "ne-resize", description: "Corner moves up and right" },
      { value: "nw-resize", description: "Corner moves up and left" },
      { value: "se-resize", description: "Corner moves down and right" },
      { value: "sw-resize", description: "Corner moves down and left" },
      { value: "ew-resize", description: "Resize left or right" },
      { value: "ns-resize", description: "Resize up or down" },
      { value: "nesw-resize", description: "Resize along the up-right / down-left diagonal" },
      { value: "nwse-resize", description: "Resize along the up-left / down-right diagonal" },
    ],
  },
  {
    name: "Zooming",
    cursors: [
      { value: "zoom-in", description: "Something can be zoomed in" },
      { value: "zoom-out", description: "Something can be zoomed out" },
    ],
  },
];
