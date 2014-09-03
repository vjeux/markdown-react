markdown-react
==============

React Render for Standard Markdown

```javascript
/** @jsx React.DOM */
var parser = new stmd.DocParser();
var renderer = new stmdReact.ReactRenderer();

React.renderComponent(
  <div>{renderer.render(parser.parse('Hello *world*'))}</div>,
  document.body
);
```


Demo: http://vjeux.github.io/markdown-react/
