# CHANGELOG

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
