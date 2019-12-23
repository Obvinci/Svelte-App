
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/ContactCard.svelte generated by Svelte v3.16.4 */

    const file = "src/ContactCard.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let header;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h1;
    	let t1;
    	let t2;
    	let h2;
    	let t3;
    	let t4;
    	let div2;
    	let p;
    	let t5;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			header = element("header");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			t1 = text(/*userName*/ ctx[0]);
    			t2 = space();
    			h2 = element("h2");
    			t3 = text(/*jobTitle*/ ctx[1]);
    			t4 = space();
    			div2 = element("div");
    			p = element("p");
    			t5 = text(/*description*/ ctx[2]);
    			if (img.src !== (img_src_value = /*userImage*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*userName*/ ctx[0]);
    			attr_dev(img, "class", "svelte-p7z0xn");
    			add_location(img, file, 69, 6, 1115);
    			attr_dev(div0, "class", "thumb svelte-p7z0xn");
    			toggle_class(div0, "thumb-placeholder", !/*userImage*/ ctx[3]);
    			add_location(div0, file, 68, 4, 1050);
    			attr_dev(h1, "class", "svelte-p7z0xn");
    			add_location(h1, file, 72, 6, 1199);
    			attr_dev(h2, "class", "svelte-p7z0xn");
    			add_location(h2, file, 73, 6, 1225);
    			attr_dev(div1, "class", "user-data svelte-p7z0xn");
    			add_location(div1, file, 71, 4, 1169);
    			attr_dev(header, "class", "svelte-p7z0xn");
    			add_location(header, file, 67, 2, 1037);
    			add_location(p, file, 77, 4, 1300);
    			attr_dev(div2, "class", "description svelte-p7z0xn");
    			add_location(div2, file, 76, 2, 1270);
    			attr_dev(div3, "class", "contact-card svelte-p7z0xn");
    			add_location(div3, file, 66, 0, 1008);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, header);
    			append_dev(header, div0);
    			append_dev(div0, img);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t1);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(h2, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(p, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*userImage*/ 8 && img.src !== (img_src_value = /*userImage*/ ctx[3])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty[0] & /*userName*/ 1) {
    				attr_dev(img, "alt", /*userName*/ ctx[0]);
    			}

    			if (dirty[0] & /*userImage*/ 8) {
    				toggle_class(div0, "thumb-placeholder", !/*userImage*/ ctx[3]);
    			}

    			if (dirty[0] & /*userName*/ 1) set_data_dev(t1, /*userName*/ ctx[0]);
    			if (dirty[0] & /*jobTitle*/ 2) set_data_dev(t3, /*jobTitle*/ ctx[1]);
    			if (dirty[0] & /*description*/ 4) set_data_dev(t5, /*description*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { userName } = $$props;
    	let { jobTitle } = $$props;
    	let { description } = $$props;
    	let { userImage } = $$props;
    	const writable_props = ["userName", "jobTitle", "description", "userImage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("userName" in $$props) $$invalidate(0, userName = $$props.userName);
    		if ("jobTitle" in $$props) $$invalidate(1, jobTitle = $$props.jobTitle);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("userImage" in $$props) $$invalidate(3, userImage = $$props.userImage);
    	};

    	$$self.$capture_state = () => {
    		return {
    			userName,
    			jobTitle,
    			description,
    			userImage
    		};
    	};

    	$$self.$inject_state = $$props => {
    		if ("userName" in $$props) $$invalidate(0, userName = $$props.userName);
    		if ("jobTitle" in $$props) $$invalidate(1, jobTitle = $$props.jobTitle);
    		if ("description" in $$props) $$invalidate(2, description = $$props.description);
    		if ("userImage" in $$props) $$invalidate(3, userImage = $$props.userImage);
    	};

    	return [userName, jobTitle, description, userImage];
    }

    class ContactCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			userName: 0,
    			jobTitle: 1,
    			description: 2,
    			userImage: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ContactCard",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || ({});

    		if (/*userName*/ ctx[0] === undefined && !("userName" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'userName'");
    		}

    		if (/*jobTitle*/ ctx[1] === undefined && !("jobTitle" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'jobTitle'");
    		}

    		if (/*description*/ ctx[2] === undefined && !("description" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'description'");
    		}

    		if (/*userImage*/ ctx[3] === undefined && !("userImage" in props)) {
    			console.warn("<ContactCard> was created without expected prop 'userImage'");
    		}
    	}

    	get userName() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userName(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get jobTitle() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set jobTitle(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get userImage() {
    		throw new Error("<ContactCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set userImage(value) {
    		throw new Error("<ContactCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.16.4 */
    const file$1 = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (80:0) {:else}
    function create_else_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please enter some data and hit Submit!";
    			add_location(p, file$1, 80, 1, 2010);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(80:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (78:0) {#if formState === "invalid"}
    function create_if_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "The input is invalid!";
    			add_location(p, file$1, 78, 1, 1972);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(78:0) {#if formState === \\\"invalid\\\"}",
    		ctx
    	});

    	return block;
    }

    // (91:0) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please add some contacts.";
    			add_location(p, file$1, 91, 1, 2278);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(91:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:0) {#each createdContacts as contact, i (contact.id)}
    function create_each_block(key_1, ctx) {
    	let h2;
    	let t0;
    	let t1_value = /*i*/ ctx[15] + 1 + "";
    	let t1;
    	let t2;
    	let current;

    	const contactcard = new ContactCard({
    			props: {
    				userName: /*contact*/ ctx[13].name,
    				jobTitle: /*contact*/ ctx[13].title,
    				description: /*contact*/ ctx[13].description,
    				userImage: /*contact*/ ctx[13].image
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("# ");
    			t1 = text(t1_value);
    			t2 = space();
    			create_component(contactcard.$$.fragment);
    			add_location(h2, file$1, 84, 1, 2115);
    			this.first = h2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(contactcard, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*createdContacts*/ 32) && t1_value !== (t1_value = /*i*/ ctx[15] + 1 + "")) set_data_dev(t1, t1_value);
    			const contactcard_changes = {};
    			if (dirty[0] & /*createdContacts*/ 32) contactcard_changes.userName = /*contact*/ ctx[13].name;
    			if (dirty[0] & /*createdContacts*/ 32) contactcard_changes.jobTitle = /*contact*/ ctx[13].title;
    			if (dirty[0] & /*createdContacts*/ 32) contactcard_changes.description = /*contact*/ ctx[13].description;
    			if (dirty[0] & /*createdContacts*/ 32) contactcard_changes.userImage = /*contact*/ ctx[13].image;
    			contactcard.$set(contactcard_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(contactcard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(contactcard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t2);
    			destroy_component(contactcard, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(84:0) {#each createdContacts as contact, i (contact.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t3;
    	let form;
    	let div0;
    	let label0;
    	let t5;
    	let input0;
    	let t6;
    	let div1;
    	let label1;
    	let t8;
    	let input1;
    	let t9;
    	let div2;
    	let label2;
    	let t11;
    	let input2;
    	let t12;
    	let div3;
    	let label3;
    	let t14;
    	let textarea;
    	let t15;
    	let button0;
    	let t17;
    	let button1;
    	let t19;
    	let button2;
    	let t21;
    	let t22;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*formState*/ ctx[4] === "invalid") return create_if_block;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);
    	let each_value = /*createdContacts*/ ctx[5];
    	const get_key = ctx => /*contact*/ ctx[13].id;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Assignment1";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "Assignment2";
    			t3 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "User Name";
    			t5 = space();
    			input0 = element("input");
    			t6 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Job Title";
    			t8 = space();
    			input1 = element("input");
    			t9 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Image URL";
    			t11 = space();
    			input2 = element("input");
    			t12 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Description";
    			t14 = space();
    			textarea = element("textarea");
    			t15 = space();
    			button0 = element("button");
    			button0.textContent = "Submit";
    			t17 = space();
    			button1 = element("button");
    			button1.textContent = "Delete First Contact";
    			t19 = space();
    			button2 = element("button");
    			button2.textContent = "Delete Last Contact";
    			t21 = space();
    			if_block.c();
    			t22 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(a0, "href", "./Assignment1.svelte");
    			add_location(a0, file$1, 51, 5, 961);
    			add_location(li0, file$1, 51, 1, 957);
    			attr_dev(a1, "href", "./Assignment2.svelte");
    			add_location(a1, file$1, 52, 5, 1018);
    			add_location(li1, file$1, 52, 1, 1014);
    			add_location(ul, file$1, 50, 0, 951);
    			attr_dev(label0, "for", "userName");
    			add_location(label0, file$1, 57, 4, 1127);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "userName");
    			add_location(input0, file$1, 58, 4, 1171);
    			attr_dev(div0, "class", "form-control");
    			add_location(div0, file$1, 56, 2, 1096);
    			attr_dev(label1, "for", "jobTitle");
    			add_location(label1, file$1, 61, 4, 1267);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "id", "jobTitle");
    			add_location(input1, file$1, 62, 4, 1311);
    			attr_dev(div1, "class", "form-control");
    			add_location(div1, file$1, 60, 2, 1236);
    			attr_dev(label2, "for", "image");
    			add_location(label2, file$1, 65, 4, 1408);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "id", "image");
    			add_location(input2, file$1, 66, 4, 1449);
    			attr_dev(div2, "class", "form-control");
    			add_location(div2, file$1, 64, 2, 1377);
    			attr_dev(label3, "for", "desc");
    			add_location(label3, file$1, 69, 4, 1543);
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "id", "desc");
    			add_location(textarea, file$1, 70, 4, 1585);
    			attr_dev(div3, "class", "form-control");
    			add_location(div3, file$1, 68, 2, 1512);
    			attr_dev(button0, "type", "submit");
    			add_location(button0, file$1, 72, 1, 1652);
    			add_location(button1, file$1, 73, 1, 1781);
    			add_location(button2, file$1, 74, 1, 1858);
    			attr_dev(form, "id", "form");
    			attr_dev(form, "class", "svelte-1o9y5k0");
    			add_location(form, file$1, 55, 0, 1077);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[10]),
    				listen_dev(input2, "input", /*input2_input_handler*/ ctx[11]),
    				listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[12]),
    				listen_dev(button0, "click", prevent_default(/*addContactCard*/ ctx[6]), false, true, false),
    				listen_dev(button1, "click", prevent_default(/*deleteFirst*/ ctx[7]), false, true, false),
    				listen_dev(button2, "click", prevent_default(/*deleteLast*/ ctx[8]), false, true, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t5);
    			append_dev(div0, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(form, t6);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			set_input_value(input1, /*title*/ ctx[1]);
    			append_dev(form, t9);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t11);
    			append_dev(div2, input2);
    			set_input_value(input2, /*image*/ ctx[2]);
    			append_dev(form, t12);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t14);
    			append_dev(div3, textarea);
    			set_input_value(textarea, /*description*/ ctx[3]);
    			append_dev(form, t15);
    			append_dev(form, button0);
    			append_dev(form, t17);
    			append_dev(form, button1);
    			append_dev(form, t19);
    			append_dev(form, button2);
    			insert_dev(target, t21, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t22, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);

    			if (each_1_else) {
    				each_1_else.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (dirty[0] & /*title*/ 2 && input1.value !== /*title*/ ctx[1]) {
    				set_input_value(input1, /*title*/ ctx[1]);
    			}

    			if (dirty[0] & /*image*/ 4 && input2.value !== /*image*/ ctx[2]) {
    				set_input_value(input2, /*image*/ ctx[2]);
    			}

    			if (dirty[0] & /*description*/ 8) {
    				set_input_value(textarea, /*description*/ ctx[3]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t22.parentNode, t22);
    				}
    			}

    			const each_value = /*createdContacts*/ ctx[5];
    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    			check_outros();

    			if (each_value.length) {
    				if (each_1_else) {
    					each_1_else.d(1);
    					each_1_else = null;
    				}
    			} else if (!each_1_else) {
    				each_1_else = create_else_block(ctx);
    				each_1_else.c();
    				each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(form);
    			if (detaching) detach_dev(t21);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t22);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    			if (each_1_else) each_1_else.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let name = "Torris";
    	let title = "";
    	let image = "";
    	let description = "";
    	let formState = "empty";
    	let createdContacts = [];

    	function addContactCard() {
    		if (name.trim().length == 0 || title.trim().length == 0 || image.trim().length == 0 || description.trim().length == 0) {
    			$$invalidate(4, formState = "invalid");
    			return;
    		}

    		$$invalidate(5, createdContacts = [
    			...createdContacts,
    			{
    				id: Math.random(),
    				name,
    				title,
    				image,
    				description
    			}
    		]);

    		$$invalidate(4, formState = "done");
    		console.log(createdContacts);
    	}

    	function deleteFirst() {
    		$$invalidate(5, createdContacts = createdContacts.slice(1));
    	}

    	function deleteLast() {
    		$$invalidate(5, createdContacts = createdContacts.slice(0, -1));
    	}

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input1_input_handler() {
    		title = this.value;
    		$$invalidate(1, title);
    	}

    	function input2_input_handler() {
    		image = this.value;
    		$$invalidate(2, image);
    	}

    	function textarea_input_handler() {
    		description = this.value;
    		$$invalidate(3, description);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("description" in $$props) $$invalidate(3, description = $$props.description);
    		if ("formState" in $$props) $$invalidate(4, formState = $$props.formState);
    		if ("createdContacts" in $$props) $$invalidate(5, createdContacts = $$props.createdContacts);
    	};

    	return [
    		name,
    		title,
    		image,
    		description,
    		formState,
    		createdContacts,
    		addContactCard,
    		deleteFirst,
    		deleteLast,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		textarea_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'World',
    		age: 18
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
