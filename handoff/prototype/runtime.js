/*
 * AStra prototype viewer runtime.
 *
 * Renders the Claude Design canvas artboards in ./pages/*.dc.html locally, with the
 * AStra design system (../design-system/components/bundle.js) and React 18 (./vendor).
 * It is a small re-implementation of the canvas format (x-dc markup, {{ holes }},
 * sc-if, sc-for, x-import, dc-props, DCLogic.renderVals) that is good enough to click
 * through every screen. It is a reference viewer, not production code.
 */
(function () {
  'use strict';

  // Canvas asset ids -> files in this handoff folder (paths relative to prototype/).
  var BLOBS = {
    '9e2d0308574e0dd739947215fe78be46': '../design-system/fonts/Unbounded.woff2',
    '52f7db2d17ed1151fb5edc419ca9f191': '../design-system/fonts/SchibstedGrotesk.woff2',
    'e44578e499896e30b393535e412478a4': '../design-system/fonts/IBMPlexMono-400.woff2',
    '74f0e95277624757400b58c375897663': '../design-system/fonts/IBMPlexMono-500.woff2',
    '21337905e826733e49b25e4089303e0e': '../media/motion/astra-hero-loop-16x9.mp4',
    '1996d83c8e14b8bc93f49b15faf5bb46': '../media/motion/astra-hero-poster-16x9.jpg',
    'b0b6b25785405e5449dd543769fcc566': '../media/motion/astra-hero-loop-9x16.mp4',
    '90730e388cc7a15dbe335a113d36f04c': '../media/motion/astra-hero-poster-9x16.jpg',
    '705d5ee1814d90e132d638bf10ff5b14': '../media/motion/astra-collab-loop-16x9.mp4',
    '07bbb11372a9642364ea93aba8d85a7e': '../media/motion/astra-collab-poster-16x9.jpg',
    'cb89397929b6422b29b98dd0998ba027': '../media/motion/astra-loyalty-loop-16x9.mp4',
    '4456dbc8395fa685d4887e8eb1cfff21': '../media/motion/astra-loyalty-poster-16x9.jpg',
    '27a6ee2726cba4c206decc2a41a1cbc7': '../media/mascot/astra-mascot-wave-1x1.mp4',
    '00afdd88d7eb72d65e2a1c08a18f55d2': '../media/mascot/astra-mascot-wave-1x1.webm',
    '753cadc2e9b8fd61c0bf655e7d999fb9': '../media/mascot/astra-mascot-poster-1x1.jpg'
  };

  var h = React.createElement;
  function DCLogic() {}
  window.DCLogic = DCLogic;

  var camel = function (a) { return a.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); }); };
  var look = function (path, scope) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, scope); };
  var HOLE = /\{\{\s*([\w.]+)\s*\}\}/g;
  function val(str, scope) {
    var m = str.match(/^\s*\{\{\s*([\w.]+)\s*\}\}\s*$/);
    if (m) {
      if (m[1] === 'true') return true;
      if (m[1] === 'false') return false;
      return look(m[1], scope);
    }
    return str.replace(HOLE, function (x, p) { var v = look(p, scope); return v == null ? '' : v; });
  }
  function styleObj(s) {
    var o = {};
    String(s).split(';').forEach(function (d) {
      var i = d.indexOf(':'); if (i < 0) return;
      var k = d.slice(0, i).trim(), v = d.slice(i + 1).trim(); if (!k) return;
      o[k.indexOf('--') === 0 ? k : camel(k)] = v;
    });
    return o;
  }
  var EVENTS = { onclick: 'onClick', onsubmit: 'onSubmit', onchange: 'onChange', oninput: 'onInput', onkeydown: 'onKeyDown', onfocus: 'onFocus', onblur: 'onBlur' };

  function compile(src) {
    src = src.replace(/\/_blob\/([0-9a-f]{32})/g, function (m, id) { return BLOBS[id] || m; });
    var doc = new DOMParser().parseFromString(src, 'text/html');
    var style = doc.querySelector('helmet style');
    var xdc = doc.querySelector('x-dc');
    var rootEl = Array.prototype.find.call(xdc.children, function (e) { return e.tagName === 'DIV'; });
    var code = doc.querySelector('script[data-dc-script]').textContent;
    var props = {};
    try { props = JSON.parse(doc.querySelector('script[data-dc-script]').getAttribute('data-props') || '{}'); } catch (e) {}
    var Comp = new Function('DCLogic', code + '\nreturn Component;')(DCLogic);
    return { style: style ? style.textContent : '', rootEl: rootEl, Comp: Comp, title: (doc.querySelector('title') || {}).textContent || '', preview: props.$preview || {} };
  }

  function makeRenderer(rootEl) {
    var key = 0;
    function conv(node, scope) {
      if (node.nodeType === 3) { var t = node.textContent; return t.indexOf('{{') > -1 ? String(val(t, scope)) : t; }
      if (node.nodeType !== 1) return null;
      var tag = node.tagName.toLowerCase();
      var kids = function () { return Array.prototype.map.call(node.childNodes, function (n) { return conv(n, scope); }).filter(function (x) { return x !== null && x !== ''; }); };
      if (tag === 'sc-if') { return val(node.getAttribute('value'), scope) ? h.apply(null, [React.Fragment, { key: key++ }].concat(kids())) : null; }
      if (tag === 'sc-for') {
        var list = val(node.getAttribute('list'), scope) || [], as = node.getAttribute('as');
        return h.apply(null, [React.Fragment, { key: key++ }].concat(list.map(function (it) {
          var sc = Object.assign({}, scope); sc[as] = it;
          return h.apply(null, [React.Fragment, { key: key++ }].concat(Array.prototype.map.call(node.childNodes, function (n) { return conv(n, sc); }).filter(function (x) { return x !== null; })));
        })));
      }
      if (tag === 'x-import') {
        var name = node.getAttribute('component-from-global-scope').split('.')[1];
        var C = window.AStra[name]; if (!C) { console.warn('Missing component ' + name); return null; }
        var p = { key: key++ };
        Array.prototype.forEach.call(node.attributes, function (a) {
          if (a.name === 'component-from-global-scope') return;
          if (a.name === 'dc-props') { Object.assign(p, val(a.value, scope) || {}); return; }
          p[camel(a.name)] = val(a.value, scope);
        });
        var k = kids(); if (k.length) p.children = k.length === 1 ? k[0] : k;
        return h(C, p);
      }
      var q = { key: key++ };
      Array.prototype.forEach.call(node.attributes, function (a) {
        var n = a.name, v = a.value;
        if (n === 'class') q.className = val(v, scope);
        else if (n === 'style') q.style = styleObj(val(v, scope));
        else if (EVENTS[n]) q[EVENTS[n]] = val(v, scope);
        else if (n === 'for') q.htmlFor = v;
        else if (n === 'tabindex') q.tabIndex = v;
        else if (n === 'value' && (tag === 'input' || tag === 'textarea')) q.defaultValue = val(v, scope);
        else if (n === 'checked' && tag === 'input') q.defaultChecked = true;
        else q[n] = v === '' && n.indexOf('data-') === 0 ? 'true' : val(v, scope);
      });
      var k2 = kids();
      if (tag === 'textarea') { q.defaultValue = k2.join(''); return h(tag, q); }
      return h.apply(null, [tag, q].concat(k2));
    }
    return function (scope) { key = 0; return conv(rootEl, scope); };
  }

  window.AStraViewer = {
    mount: function (container, src, initialState, onReady) {
      var c = compile(src);
      var st = document.getElementById('dc-page-style');
      if (!st) { st = document.createElement('style'); st.id = 'dc-page-style'; document.head.appendChild(st); }
      st.textContent = c.style;
      var render = makeRenderer(c.rootEl);
      var Host = function (props) { React.Component.call(this, props); this.state = initialState || {}; window.__host = this; };
      Host.prototype = Object.create(React.Component.prototype);
      Host.prototype.render = function () { var vals = c.Comp.prototype.renderVals.call(this); return render(vals); };
      if (container.__root) container.__root.unmount();
      container.__root = ReactDOM.createRoot(container);
      container.__root.render(h(Host));
      if (onReady) setTimeout(function () { onReady(c); }, 0);
      return c;
    }
  };
})();
