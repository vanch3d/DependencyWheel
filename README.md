# d3-dependencyWheel

A d3-module (version 4) implementation of a dependency graph.

The module is based on the original [Dependency Wheel](https://github.com/fzaninotto/DependencyWheel) 
and has been refactored to be more compliant with current patterns for d3 modules, 
see Mike Bostock's [guidelines](https://bost.ocks.org/mike/d3-plugin/). 

## Installing

If you use NPM, `npm install d3-calendar`. Otherwise, download the [latest release](https://github.com/vanch3d/d3-calendar/releases/latest). 

## Usage

Make sure to include both d3 (version 4, not included) and the module, in this order.
```html
<script src="d3.min.js"></script>
<script src="/dist/d3-dependencyWheel.min.js"></script>
```

Check the [examples](https://github.com/vanch3d/DependencyWheel/tree/master/examples) 
for mode detailed instructions.

## API Reference

<a href="#d3_dependencyWheel" name="d3_dependencyWheel">#</a> d3.<b>dependencyWheel</b>()

Constructs a new dependency graph

> TO DO

## Changelog 

- v2.0.0
  - refactored project for consistency with d3v4 modules
- v1.2.0
  - added customisation for chart's color and tooltip
  - added optional attributes for packages in data structure