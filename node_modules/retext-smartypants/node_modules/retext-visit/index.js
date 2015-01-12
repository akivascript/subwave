'use strict';

/**
 * Invoke `callback` for every descendant of the
 * operated on context.
 *
 * @param {function(Node): boolean?} callback - Visitor.
 *   Stops visiting when the return value is `false`.
 * @this {Node} Context to search in.
 */

function visit(type, callback) {
    var node,
        next;

    node = this.head;

    if (!callback) {
        callback = type;
        type = null;
    }

    while (node) {
        /**
         * Allow for removal of the node by `callback`.
         */

        next = node.next;

        if (!type || node.type === type) {
            if (callback(node) === false) {
                return;
            }
        }

        /**
         * If possible, invoke the node's own `visit`
         *  method, otherwise call retext-visit's
         * `visit` method.
         */

        (node.visit || visit).call(node, type, callback);

        node = next;
    }
}

/**
 * Invoke `callback` for every descendant with a given
 * `type` in the operated on context.
 *
 * @deprecated
 */

function visitType() {
    throw new Error(
        'visitType(type, callback) is deprecated.\n' +
        'Use `visit(type, callback)` instead.'
    )
}

/**
 * Define `plugin`.
 *
 * @param {Retext} retext - Instance of Retext.
 */

function plugin(retext) {
    var TextOM,
        parentPrototype,
        elementPrototype;

    TextOM = retext.TextOM;
    parentPrototype = TextOM.Parent.prototype;
    elementPrototype = TextOM.Element.prototype;

    /**
     * Expose `visit` and `visitType` on Parents.
     *
     * Due to multiple inheritance of Elements (Parent
     * and Child), these methods are explicitly added.
     */

    elementPrototype.visit = parentPrototype.visit = visit;
    elementPrototype.visitType = parentPrototype.visitType = visitType;
}

/**
 * Expose `plugin`.
 */

exports = module.exports = plugin;
