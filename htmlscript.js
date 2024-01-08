
(function() {

    window.onload = () => {
        for(const program of document.body.children) {
            if(program.tagName !== "PROGRAM") { continue; }
            const env = environment();
            add_default_tags(env);
            for(const node of program.children) {
                eval_node(node, env);
            }
        }
    };

    function environment() {
        return {
            scopes: [{}],
            tags: {},
            flow_state: "none",
            return_val: null,
            last_cond: false
        };
    }

    function add_default_tags(env) {
        env.tags["js"] = node => eval(node.getAttribute("exec"));
        env.tags["set"] = node => {
            const name = node.getAttribute("name");
            const val = eval_node(node.children[0], env);
            for(let scope_idx = env.scopes.length - 1; scope_idx >= 0; scope_idx -= 1) {
                let scope = env.scopes[scope_idx];
                if(Object.keys(scope).includes(name)) {
                    scope[name] = val;
                    return val;
                }
            }
            env.scopes[env.scopes.length - 1][name] = val;
            return val;
        };
        env.tags["get"] = node => {
            const name = node.getAttribute("name");
            for(let scope_idx = env.scopes.length - 1; scope_idx >= 0; scope_idx -= 1) {
                let scope = env.scopes[scope_idx];
                if(Object.keys(scope).includes(name)) {
                    return scope[name];
                }
            }
        };
        env.tags["call"] = node => {
            let called = eval_node(node.children[0], env);
            let params = [];
            for(let param_idx = 1; param_idx < node.children.length; param_idx += 1) {
                params.push(eval_node(node.children[param_idx], env));
            }
            return called(...params);
        };
        env.tags["number"] = node => Number(node.getAttribute("val"));
        env.tags["string"] = node => node.getAttribute("val");
        env.tags["func"] = node => {
            env.flow_state = "none";
            const args = node.getAttribute("args").split(" ");
            return (...arg_vals) => {
                const param_scope = {};
                env.scopes.push(param_scope);
                for(let param_idx = 0; param_idx < Math.min(args.length, arg_vals.length); param_idx += 1) {
                    param_scope[args[param_idx]] = arg_vals[param_idx];
                }
                let last_val;
                for(const cnode of node.children) {
                    last_val = eval_node(cnode, env);
                    switch(env.flow_state) {
                        case "none": case "continue": case "break": break;
                        case "return": return env.return_val;
                    }
                }
                return last_val;
            };
        };
        env.tags["return"] = node => {
            env.flow_state = "return";
            const return_val = eval_node(node.children[0], env);
            env.return_val = return_val;
            return return_val;
        };
        env.tags["add"] = node => eval_node(node.children[0], env) + eval_node(node.children[1], env);
        env.tags["sub"] = node => eval_node(node.children[0], env) - eval_node(node.children[1], env);
        env.tags["mul"] = node => eval_node(node.children[0], env) * eval_node(node.children[1], env);
        env.tags["div"] = node => eval_node(node.children[0], env) / eval_node(node.children[1], env);
        env.tags["mod"] = node => eval_node(node.children[0], env) % eval_node(node.children[1], env);
        env.tags["eq"] = node => eval_node(node.children[0], env) === eval_node(node.children[1], env);
        env.tags["neq"] = node => eval_node(node.children[0], env) !== eval_node(node.children[1], env);
        env.tags["lt"] = node => eval_node(node.children[0], env) < eval_node(node.children[1], env);
        env.tags["lteq"] = node => eval_node(node.children[0], env) <= eval_node(node.children[1], env);
        env.tags["gt"] = node => eval_node(node.children[0], env) > eval_node(node.children[1], env);
        env.tags["gteq"] = node => eval_node(node.children[0], env) >= eval_node(node.children[1], env);
        env.tags["if"] = node => {
            const cond = eval_node(node.children[0], env);
            if(cond) {
                for(let i = 1; i < node.children.length; i += 1) {
                    eval_node(node.children[i], env);
                    if(env.flow_state === "none") { continue; }
                    break;
                }
            }
            env.last_cond = cond;
        };
        env.tags["else"] = node => {
            if(!last_cond) {
                for(const cnode of node.children) {
                    eval_node(cnode, env);
                    if(env.flow_state === "none") { continue; }
                    break;
                }
            }
        };
        env.tags["loop"] = node => {
            env.flow_state = "none";
            while(true) {
                for(const cnode of node.children) {
                    eval_node(cnode, env);
                    if(env.flow_state === "none") { continue; }
                    break;
                }
                if(env.flow_state === "return" || env.flow_state === "break") { break; }
            }
        };
        env.tags["break"] = node => {
            env.flow_state = "break";
        };
        env.tags["continue"] = node => {
            env.flow_state = "continue";
        };
    }

    function eval_node(node, env) {
        for(const known_tag_name of Object.keys(env.tags)) {
            if(node.tagName.toLowerCase() !== known_tag_name) { continue; }
            return env.tags[known_tag_name](node);
        }
    }
 
})();