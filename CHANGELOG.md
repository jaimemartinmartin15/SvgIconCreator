# CHANGELOG

## unreleased

Features:

- Highlight svg edit point control and form point when mouse over them for path shapes.

Fixes:

- Avoid adding path commands (mainly Z) when typing in other inputs of the app and the shape is already finished.
- Avoid navigating back and forward when moving a shape left or right using alt key.
- Add scrolling to attributes and shape list components. Limit the max height of the attributes component when path contains a lot of commands.

## 3.1.1

- Update icons and angular-shared dependencies.
- Use svg icons with data-bindings.

## 3.1.0

- Rename animations dialog to bindings dialog.
- Export data-attributes individually as data-attribute-binding.

## 3.0.0

- Redesign user interface.
- Added animations (allow to select angular input name to animate the attribute).
- Allow zoom and drag the canvas.
- Added new attributes to edit: linecap, linejoin, dasharray, fontfamily, ...
- Allow to move all shapes using the keyboad arrows.
- Allow to move selected shape using the keyboad arrows.
- Show error if not possible to load svg, and close dialog automatically after success import.
- Added unit tests.

## 2.0.0

- Refactor all application.
- Upgrade from angular 17 to angular 20.

## 1.0.1

Fix export of optimized lines

Use default names and transparent colors when loading files to avoid errors when exporting later.

## 1.0.0

Initial release:

- Allow to upload a background
- Allow to change the canvas size
- Allow to draw rect, line, path, circle and text shapes
- Allow to choose colors with transparency and width
- Export and import svg and png
- List of shapes and edit their points
- Allow to edit shapes with the mouse in the canvas
