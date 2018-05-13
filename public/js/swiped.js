// adapted version of https://github.com/mishk0/swiped
// replaced Swiped with Zzwiped to be able to distinguish with vertical version

(function() {
    var msPointer = window.navigator.msPointerEnabled;

    var touch = {
        start: msPointer ? 'MSPointerDown' : 'touchstart',
        move: msPointer ? 'MSPointerMove' : 'touchmove',
        end: msPointer ? 'MSPointerUp' : 'touchend'
    };

    var prefix = (function () {
        var styles = window.getComputedStyle(document.documentElement, '');
        var pre = (Array.prototype.slice
                .call(styles)
                .join('')
                .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
            )[1];

        return '-' + pre + '-';
    })();

    var transitionEvent = (function() {
        var t,
            el = document.createElement("fakeelement");

        var transitions = {
            "transition"      : "transitionend",
            "OTransition"     : "oTransitionEnd",
            "MozTransition"   : "transitionend",
            "WebkitTransition": "webkitTransitionEnd"
        };

        for (t in transitions){
            if (el.style[t] !== undefined){
                return transitions[t];
            }
        }
    })();

    var cssProps = {
        'transition': prefix + 'transition',
        'transform': prefix + 'transform'
    };

    // delegate events to the document element
    function delegate(event, cbName) {
        document.addEventListener(event, function(e) {
            Zzwiped._elems.forEach(function(Zzwiped){
                var target = e.target;

                while (target) {
                    if (target === Zzwiped.elem) {
                        Zzwiped[cbName](e);

                        return false;
                    }
                    target = target.parentNode;
                }

                return false;
            });

        });
    }

    function extend() {
        var current = [].shift.call(arguments);
        var options = arguments[0];

        for (var i in options) {
            if (options.hasOwnProperty(i)) {
                current[i] = options[i];
            }
        }

        return current;
    }

    var fn = function() {};

    var Zzwiped = function(o) {
        var defaultOptions = {
            duration: 200,
            tolerance: 50,
            time: 200,
            dir: 1,
            right: 0,
            left: 0,
            willOpenClass: 'js-swiped--will-open',
            willOpenRightClass: 'js-swiped--will-open-right',
            willOpenLeftClass: 'js-swiped--will-open-left'
        };

        o = extend(defaultOptions, o || {});

        this.duration = o.duration;
        this.tolerance = o.tolerance;
        this.time = o.time;
        this.width = o.left || o.right;
        this.elem = o.elem;
        this.list = o.list;
        this.dir = o.dir;
        this.group = o.group;
        this.id = Zzwiped.elemId++;
        
        this.onOpen = typeof o.onOpen === 'function' ? o.onOpen : fn;
        this.onClose = typeof o.onClose === 'function' ? o.onClose : fn;

        this.willOpenClass = o.willOpenClass;
        this.willOpenRightClass = o.willOpenRightClass;
        this.willOpenLeftClass = o.willOpenLeftClass;

        this.right = o.right;
        this.left = o.left;

        if (
            (o.right > 0 && o.tolerance > o.right) ||
            (o.left > 0 && o.tolerance > o.left)
        ) {
            console.warn('tolerance must be less then left and right');
        }
    };

    Zzwiped._elems = [];
    Zzwiped.groupCounter = 0;
    Zzwiped.elemId = 0;

    Zzwiped.init = function(o) {
        Zzwiped.groupCounter++;

        var elems = document.querySelectorAll(o.query);
        var group = [];

        delete o.query;

        [].forEach.call(elems, function(elem){
            var option = extend({elem: elem, group: Zzwiped.groupCounter}, o);

            group.push(new Zzwiped(option));
        });

        Zzwiped._bindEvents();
        Zzwiped._elems = Zzwiped._elems.concat(group);

        if (group.length === 1) {
            return group[0];
        }

        return group;
    };

    Zzwiped._closeAll = function(groupNumber) {
        Zzwiped._elems.forEach(function(Zzwiped) {
            if (Zzwiped.group === groupNumber) {
                Zzwiped.close(true);
            }
        });
    };

    Zzwiped.prototype.transitionEnd = function(node, cb) {
        var that = this;

        function trEnd() {
            cb.call(that);
            node.removeEventListener(transitionEvent, trEnd);
        }

        node.addEventListener(transitionEvent, trEnd);
    };

    /**
     * swipe.x - initial coordinate Х
     * swipe.y - initial coordinate Y
     * swipe.delta - distance
     * swipe.startSwipe - swipe is starting
     * swipe.startScroll - scroll is starting
     * swipe.startTime - necessary for the short swipe
     * swipe.touchId - ID of the first touch
     */

    Zzwiped.prototype.touchStart = function(e) {
        var touch = e.changedTouches[0];

        if (e.touches.length !== 1) {
            return;
        }

        this.touchId = touch.identifier;
        this.x = touch.pageX;
        this.y = touch.pageY;
        this.startTime = new Date();

        this.willOpen = false;

        this.resetValue();

        if (this.list) {
            Zzwiped._closeAll(this.group);
        } else {
            this.close(true);
        }
    };

    Zzwiped.prototype.touchMove = function(e) {
        var touch = e.changedTouches[0];

        // touch of the other finger
        if (!this.isValidTouch(e)) {
            return;
        }

        this.delta = touch.pageX - this.x;

        this.dir = this.delta < 0 ? -1 : 1;
        this.width = this.delta < 0 ? this.right : this.left;

        this.defineUserAction(touch);

        if (this.startSwipe) {
            this.move();

            //prevent scroll
            e.preventDefault();

        }
    };

    Zzwiped.prototype.touchEnd = function(e) {
        if (!this.isValidTouch(e, true) || !this.startSwipe) {
            return;
        }

        // if swipe is more then 150px or time is less then 150ms
        if (this.dir * this.delta > this.tolerance || new Date() - this.startTime < this.time) {
            this.open();
        } else {
            this.close();
        }

        e.stopPropagation();
        e.preventDefault();
    };

    /**
     * Animation of the opening
     */
    Zzwiped.prototype.open = function(isForce) {
        this.animation(this.dir * this.width);
        this.swiped = true;

        if (!isForce) {
            this.transitionEnd(this.elem, this.onOpen);
        }

        this.resetValue();
    };

    /**
     * Animation of the closing
     */
    Zzwiped.prototype.close = function(isForce) {
        this.animation(0);
        this.swiped = false;
        this.elem.classList.remove(this.willOpenClass, this.willOpenRightClass, this.willOpenLeftClass);

        if (!isForce) {
            this.transitionEnd(this.elem, this.onClose);
        }

        this.resetValue();
    };

    /**
     * Toggle current object's open/closed state
     */
    Zzwiped.prototype.toggle = function() {
        if (this.swiped) {
            this.close();
        } else {
            this.open();
        }
    };

    /**
     * reset to initial values
     */
    Zzwiped.prototype.resetValue = function() {
        this.startSwipe = false;
        this.startScroll = false;
        this.delta = 0;
    };


    /**
     * Bind touchMove, touchEnd and touchStart events
     */
    Zzwiped._bindEvents = function() {
        if (Zzwiped.eventBinded) {
            return false;
        }

        delegate(touch.move, 'touchMove');
        delegate(touch.end, 'touchEnd');
        delegate(touch.start, 'touchStart');

        Zzwiped.eventBinded = true;
    };

    /**
     * detect of the user action: swipe or scroll
     */
    Zzwiped.prototype.defineUserAction = function(touch) {
        var DELTA_X = 10;// threshold
        var DELTA_Y = 10;

        if (Math.abs(this.y - touch.pageY) > DELTA_Y && !this.startSwipe) {
            this.startScroll = true;
        } else if (Math.abs(this.delta) > DELTA_X && !this.startScroll) {
            this.startSwipe = true;
        }
    };

    /**
     * Which of the touch was a first, if it's a multitouch
     * touchId saved on touchstart
     * @param {object} e - event
     * @returns {boolean}
     */
    Zzwiped.prototype.isValidTouch = function(e, isTouchEnd) {
        // take a targetTouches because need events on this node
        // targetTouches is empty in touchEnd, therefore take a changedTouches
        var touches = isTouchEnd ? 'changedTouches' : 'targetTouches';

        return e[touches][0].identifier === this.touchId;
    };

    Zzwiped.prototype.move = function() {
        if ((this.dir > 0 && (this.delta < 0 || this.left === 0)) || (this.dir < 0 && (this.delta > 0 || this.right === 0))) {
            return false;
        }

        var deltaAbs = Math.abs(this.delta);

        if (deltaAbs > this.width) {
            // linear deceleration
            this.delta = this.dir * (this.width + (deltaAbs - this.width) / 8);
        }

        if (this.dir * this.delta > this.tolerance) {
            if (!this.willOpen) {
                this.willOpen = true;
                let willOpenDirectionClass = this.willOpenLeftClass;
                if (this.dir === 1) {
                    willOpenDirectionClass = this.willOpenRightClass;
                }
                this.elem.classList.add(this.willOpenClass, willOpenDirectionClass);
            }
        } else {
            if (this.willOpen) {
                this.willOpen = false;
                this.elem.classList.remove(this.willOpenClass, this.willOpenRightClass, this.willOpenLeftClass);
            }
        }

        this.animation(this.delta, 0);
    };

    Zzwiped.prototype.animation = function(x, duration) {
        duration = duration === undefined ? this.duration : duration;

        this.elem.style.cssText = cssProps.transition + ':' + cssProps.transform + ' ' + duration + 'ms; ' +
        cssProps.transform  + ':' + 'translate3d(' + x + 'px, 0px, 0px)';
    };

    Zzwiped.prototype.destroy = function(isRemoveNode) {
        var id = this.id;

        Zzwiped._elems.forEach(function(elem, i) {
            if (elem.id === id) {
                Zzwiped._elems.splice(i, 1);
            }
        });

        if (isRemoveNode) {
            this.elem.parentNode.removeChild(this.elem);
        }
    };

    // expose Zzwiped
    window.Zzwiped = Zzwiped;
})();
