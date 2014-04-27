(function toggleTree() {
  'use strict';
  document.getElementById('tree').addEventListener('click',function(el) {
    var items;
    if (el.target && el.target.nodeName === 'SPAN') {
      if (el.target.parentNode.className === 'node') {
        items = el.target.parentNode.querySelectorAll('.node > ul');
      } else if (el.target.parentNode.className === 'root') {
        items = el.target.parentNode.querySelectorAll('.root > ul');
      }
      Array.prototype.forEach.call(items, function(item) {
        if (item.className === 'collapsed' || item.className === '') {
          item.className = 'expanded';
          el.target.className = 'expanded';
        } else {
          item.className = 'collapsed';
          el.target.className = 'collapsed';
        }
      });
    }
  });
})();

function treeView(collection) {
  'use strict';
  var el = document.getElementById('tree');
  /* Remove existing data */
  while (el.lastChild) {
    el.removeChild(el.lastChild);
  }
  /* Insert new data */
  el.appendChild(json2html(collection));
}

/* Function to turn JSON data into unordered list */
function json2html(json, isChild) {
  'use strict';
  isChild = isChild || false;
  var i, ret = document.createElement('ul'),
    li, span;
  for (i in json) {
    li = ret.appendChild(document.createElement('li'));
    if (typeof json[i] === 'object' && Object.keys(json[i]).indexOf('_id') === -1) {
      if (isChild) {
        li.className = 'root';
      } else {
        li.className = 'treeRoot';
      }
    } else if (typeof json[i] === 'object' && Object.keys(json[i]).indexOf('_id') >= 0) {
      li.className = 'node';
      li.setAttribute('data-node', i);
      /* Obtain with document.querySelectorAll('[data-node="_id"]'); */
    } else {
      li.className = 'item';
    }
    if (li.className === 'item') {
      span = li.appendChild(document.createElement('span'));
      span.className = 'key';
      span.appendChild(document.createTextNode(i));
    } else {
      span = li.appendChild(document.createElement('span'));
      if (li.className !== 'treeRoot') span.className = 'collapsed';
      span.appendChild(document.createTextNode(i));
    }
    if (typeof json[i] === 'object') {
      /* Call with true as these will be child root, not treeRoot */
      li.appendChild(json2html(json[i], true));
    } else {
      span = li.appendChild(document.createElement('span'));
      span.className = 'value';
      span.appendChild(document.createTextNode(json[i]));
    }
  }
  return ret;
}
