function parse(VER) {
    var matches = VER.match(
        new RegExp(
        `^\\s*v?` +
        `(?:` +
        `(?:(?<epoch>[0-9]+)!)?` + // epoch
        `(?<release>[0-9]+(?:\\.[0-9]+)*)` + // release segment
        `(?<pre>[-_\\.]?(?<pre_l>(a|b|c|rc|alpha|beta|pre|preview))[-_\\.]?(?<pre_n>[0-9]+)?)?` + // pre-release
        `(?<post>(?:-(?<post_n1>[0-9]+))|(?:[-_\\.]?(?<post_l>post|rev|r)[-_\\.]?(?<post_n2>[0-9]+)?))?` + // post release
        `(?<dev>[-_\\.]?(?<dev_l>dev)[-_\\.]?(?<dev_n>[0-9]+)?)?)` + // dev release
        `(?:\\+(?<local>[a-z0-9]+(?:[-_\\.][a-z0-9]+)*))?\\s*$`, "i")
    );
    return matches != null ? groups_to_ver(matches.groups) : null;
}
function groups_to_ver(groups) {
    var epoch = 0, preN = 0, postN = 0, devN = 0;
    var preL = "", postL = "", devL = "";
    var release = [];
    var local = "#MINV";

    const prerelease_aliases = {
        "a":       "a",
        "alpha":   "a",
        "b":       "b",
        "beta":    "b",
        "rc":      "rc",
        "c":       "rc",
        "pre":     "rc",
        "preview": "rc",
    };

    const postrelease_aliases = {
        "post": "post",
        "rev":  "post",
        "r":    "post",
    }

    for (const key of Object.keys(groups)) {
        var m = groups[key];

        if (m == null || m === "") {
            continue;
        }

        switch (key) {
            case "epoch":
                epoch = parseInt(m);
                break;
            case "release":
                release = normalize(m.split("."));
                break;
            case "pre_l":
                preL = prerelease_aliases[m.toLowerCase()];
                break;
            case "pre_n":
                preN = parseInt(m);
                break;
            case "post_l":
                postL = postrelease_aliases[m.toLowerCase()];
                break;
            case "post_n1":
            case "post_n2":
                if (postL === "") {
                    postL = "post";
                }
                postN = parseInt(m);
                break;
            case "dev_l":
                devL = m.toLowerCase();
                break;
            case "dev_n":
                devN = parseInt(m);
                break;
            case "local":
                local = m.toLowerCase();
                break;
        }
    }

    const pre = {
        letter: preL,
        number: preN
    };

    const post = {
        letter: postL,
        number: postN
    };

    const dev = {
        letter: devL,
        number: devN
    };

    const VER = {
        epoch: epoch,
        release: release,
        pre: pre,
        post: post,
        dev: dev,
        local: local,
    };

    if (isNull(VER.pre) && isNull(VER.post) && !isNull(VER.dev)) {
        VER.pre = "#MINV";
    } else if (isNull(VER.pre)) {
        VER.pre = "#MAXV";
    }

    if (isNull(VER.post)) {
        VER.post = "#MINV";
    }

    if (isNull(VER.dev)) {
        VER.dev = "#MAXV";
    }

    if (local !== "#MINV") {
        VER.local = parse_local(local);
    }

    return VER;
}

function normalize(ver_split) {
    const len = ver_split.length;
    var copy = ver_split.slice();

    for (var i = 0; i < ver_split.length; i++) {
        copy[i] = parseInt(ver_split[i]);
    }

    for (var j = len -1; j >= 0; j--) {
        if (ver_split[j] == null || ver_split[j] === "0") {
            copy = copy.slice(0, j);
            continue;
        }
        break;
    }
    
    return copy;
}

function parse_local(local) {
    var split = local.split(".");
    for (var i = 0; i < split.length; i++) {
        if (isFinite(split[i])) {
            split[i] = parseInt(split[i]);
        }
    }
    return split;
}

function compare(a, b) {
    var typeA = detectType(a);
    var typeB = detectType(b);

    var constMap = {
        "null" : -1,
        "#MINV" : -1,
        "#MAXV" : 1
    }

    for (const key of Object.keys(constMap)) {
        if (compare_constant(typeA, typeB, key, constMap[key]) != null) {
            return compare_constant(typeA, typeB, key, constMap[key]);
        }
    }

    if (typeA === "object" && typeB === "object") {
        return compare_object(a, b);
    } else {
        return compare_single(a, b);
    }
}

function compare_object(objA, objB) {
    var valA = Object.values(objA);
    var valB = Object.values(objB);

    for (var i = 0; i < Math.min(valA.length, valB.length); i++) {
        if (compare_single(valA[i], valB[i]) !== 0) {
            return compare_single(valA[i], valB[i]);
        }
    }

    return compare_single(valA.length, valB.length);
}

function compare_constant(typeA, typeB, constant, sign) {
    if (typeA === constant && typeB !== constant) {
        return sign;
    } else if (typeA !== constant && typeB === constant) {
        return -sign;
    } else if (typeA === constant && typeB === constant) {
        return 0;
    } else {
        return null;
    }
}

function compare_single(a, b) {
    var typeA = typeof a;
    var typeB = typeof b;

    if (typeA === "string" && typeB === "number") {
        return -1;
    } else if (typeA === "number" && typeB === "string") {
        return 1;
    } else {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        } else {
            return 0;
        }
    }
}

function isNull(obj) {
    switch (typeof obj) {
        case "string":
            return obj === "";
        case "number":
            return obj === 0;
        case "object":
            return obj == null || Object.values(obj).every(val => isNull(val));
    }
}

function detectType(value) {
    if (value == null) return "null";
    if (value === "#MAXV") return "#MAXV";
    if (value === "#MINV") return "#MINV";

    switch (typeof value) {
        case "string":
            return "str";
        case "number":
            return "num";
        case "object":
            return "object";
    }
}

function PY_COMPARE(a, b) {
    if (a === b) {
        return 0;
    }
    var v1 = parse(a);
    var v2 = parse(b);

    for (const key of Object.keys(v1)) {
        if (compare(v1[key], v2[key])) {
            return compare(v1[key], v2[key]);
        }
    }
    return 0;
}

module.exports = {
    compare: PY_COMPARE,
    parse: parse
};