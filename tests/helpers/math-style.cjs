'use strict';

// jsdom 26 parses MathML but its style engine expects an HTMLElement style
// object. Supply inline/inherited visibility for the known MathML fixture.
// MathML selector-specific CSS, layout and real audio need browser validation.
module.exports = function installMathStyleShim(win) {
  const getStyle = win.getComputedStyle.bind(win);
  win.getComputedStyle = function (node, pseudo) {
    if (node.namespaceURI !== 'http://www.w3.org/1998/Math/MathML') return getStyle(node, pseudo);
    const inline = win.document.createElement('span').style;
    inline.cssText = node.getAttribute('style') || '';
    const parent = win.getComputedStyle(node.parentElement);
    return {display: inline.display || 'inline', visibility: inline.visibility || parent.visibility};
  };
};
