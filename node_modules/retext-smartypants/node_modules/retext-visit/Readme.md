# retext-visit [![Build Status](https://img.shields.io/travis/wooorm/retext-visit.svg?style=flat)](https://travis-ci.org/wooorm/retext-visit) [![Coverage Status](https://img.shields.io/coveralls/wooorm/retext-visit.svg?style=flat)](https://coveralls.io/r/wooorm/retext-visit?branch=master)

**[retext](https://github.com/wooorm/retext)** node visitor.

## Installation

npm:
```sh
$ npm install retext-visit
```

Component:
```sh
$ component install wooorm/retext-visit
```

Bower:
```sh
$ bower install retext-visit
```

## Usage

```js
var Retext = require('retext');
var visit = require('retext-visit');
var inspect = require('retext-inspect');

var retext = new Retext()
    .use(inspect)
    .use(visit);

/**
 * See each function signature below.
 */
```

## API

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#visit(callback)

```js
retext.parse('A simple English sentence.', function (err, tree) {
    if (err) throw err;

    /* Visit every node in the first sentence. */
    tree.head.head.visit(function (node) {
        console.log(node);
    });
    /**
     * Logs:
     *
     * WordNode[1]
     * └─ TextNode: 'A'
     * TextNode: 'A'
     * WhiteSpaceNode[1]
     * └─ TextNode: ' '
     * TextNode: ' '
     * WordNode[1]
     * └─ TextNode: 'simple'
     * TextNode: 'simple'
     * WhiteSpaceNode[1]
     * └─ TextNode: ' '
     * TextNode: ' '
     * WordNode[1]
     * └─ TextNode: 'English'
     * TextNode: 'English'
     * WhiteSpaceNode[1]
     * └─ TextNode: ' '
     * TextNode: ' '
     * WordNode[1]
     * └─ TextNode: 'sentence'
     * TextNode: 'sentence'
     * PunctuationNode[1]
     * └─ TextNode: '.'
     * TextNode: '.'
     */
});
```

Invoke `callback` for every descendant of the operated on context.

Parameters:

- `callback` (`function(Node): boolean?`): Visitor. Stops visiting when it returns `false`.

### [TextOM.Parent](https://github.com/wooorm/textom#textomparent-nlcstparent)#visit(type, callback)

```js
retext.parse('A simple English sentence.', function (err, tree) {
    if (err) throw err;

    /* Visit every word node. */
    tree.visit(tree.WORD_NODE, function (node) {
        console.log(node);
    });
    /**
     * WordNode[1]
     * └─ TextNode: 'A'
     * WordNode[1]
     * └─ TextNode: 'simple'
     * WordNode[1]
     * └─ TextNode: 'English'
     * WordNode[1]
     * └─ TextNode: 'sentence'
     */
});
```

Invoke `callback` for every descendant of the context of `type`.

Parameters:

- `type`: Type of visited nodes.
- `callback` (`function(Node): boolean?`): Visitor. Stops visiting when the return value is `false`.

## Performance

On a MacBook Air.

```
             Visit every node
  7,806 op/s » A section
    670 op/s » An article

             Visit every word node
  6,249 op/s » A section
    521 op/s » An article
```

## License

MIT © [Titus Wormer](http://wooorm.com)
