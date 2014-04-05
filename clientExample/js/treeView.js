function treeView(collection) {
  'use strict';
  var $tree = $('#tree');

  /* Remove old jsTree data */
  $tree.empty().removeClass().removeAttr('role');
  /* and.. recreate */
  $tree.append(json2html(collection));

  /* Uncomment to Expand All branches by default */
  /* By default we're storing the existing state of open/closed branches */

  //$tree.on('loaded.jstree', function(event, data) {
  //  data.instance.open_all();
  //});

  $tree.jstree({
    'core': {
      'themes': {
        'icons': false,
        'responsive': false
      },
      'animation': 100
    },
    'plugins': ['state']
  });
  $tree.delegate('a', 'click', function() {
    if ($tree.jstree('is_leaf', this)) {
      document.location.href = this;
    } else {
      $tree.jstree('toggle_node', this);
    }
  });
}

/* If not using jsTree above */

//var el = document.getElementById('tree');
//el.appendChild(json2html(collection));

/* Function to turn json data into unordered list */
function json2html(json) {
  'use strict';
  var i, ret = document.createElement('ul'),
    li, span;
  for (i in json) {
    li = ret.appendChild(document.createElement('li'));
    if (typeof json[i] === 'object' && Object.keys(json[i]).indexOf('_id') === -1) {
      li.className = 'root';
    } else if (typeof json[i] === 'object' && Object.keys(json[i]).indexOf('_id') >= 0) {
      li.className = 'node';
    } else {
      li.className = 'item';
    }
    if (li.className === 'item') {
      span = li.appendChild(document.createElement('span'));
      span.className = 'key';
      span.appendChild(document.createTextNode(i));
    } else {
      span = li.appendChild(document.createElement('span'));
      span.appendChild(document.createTextNode(i));
    }
    if (typeof json[i] === 'object') {
      li.appendChild(json2html(json[i]));
    } else {
      span = li.appendChild(document.createElement('span'));
      span.className = 'value';
      span.appendChild(document.createTextNode(json[i]));
    }
  }
  return ret;
}
