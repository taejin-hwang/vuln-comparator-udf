function parse(VER) {
    var matches = VER.match(
        new RegExp(
            `^\\s*([0-9]+(\\.[0-9a-zA-Z]+)*` +
            `(-[0-9A-Za-z-]+(\\.[0-9A-Za-z-]+)*)?)?\\s*$`, "i")
    );

    if (matches == null) {
        return null;
    }

    VER = VER.trim();

    if (VER === "") {
        VER = "0";
    }

    VER = VER.replace("-", ".pre.")

    var segments = split_segments(VER);

    return {
        ns: segments.numeric,
        ss: segments.string
    }
}

function split_segments(VER) {
    var numeric = [];
    var string = [];

    var regExp = new RegExp(`[0-9]+|[a-zA-Z]`, "g");
    var segments = find_all_substring(VER, regExp);

    var isNumeric = true;
    for (const seg of segments) {
        var p = parseInt(seg);
        if (isNaN(p)) {
            isNumeric = false;
            p = seg;
        }

        if (isNumeric) {
            numeric.push(p);
        } else {
            string.push(p);
        }
    }
    return {
        numeric: numeric,
        string: string
    }
}

function find_all_substring(VER, regExp) {
    var m;
    var matches = [];

    do {
        m = regExp.exec(VER);
        if (m) {
            matches.push(m[0].toLowerCase());
        }
    } while (m != null);

    return matches;
}

function copy(arr) {
    var copied = [];
    for (var i = 0; i < arr.length; i++) {
        copied.push(arr[i]);
    }
    return copied;
}

function normalize(ver_split) {
    const len = ver_split.length;
    var copied = copy(ver_split.slice());
    for (var j = len -1; j >= 0; j--) {
        if (isNull(ver_split[j])) {
            copied = copied.slice(0, j);
            continue;
        }
        break;
    }

    return copied;
}

function canonical_segments(VER) {
    var ns = normalize(copy(VER.ns));
    var ss = normalize(copy(VER.ss));
    return ns.concat(ss);
}

function pad(arr, k) {
    var diff = k - arr.length;
    if (diff <= 0) {
        return arr;
    }

    var padded = copy(arr);
    for (var i = 0; i < diff; i++) {
        padded.push(0);
    }
    return padded;
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

function GEM_COMPARE(a, b) {
    if (a === b) {
        return 0;
    } else if (a === "#MAXV#") {
        return -1;
    } else if (b === "#MAXV#") {
        return 1;
    }

    var v1 = parse(a);
    var v2 = parse(b);

    var cs1 = canonical_segments(v1);
    var cs2 = canonical_segments(v2);

    var s1 = pad(cs1, cs2.length);
    var s2 = pad(cs2, cs1.length);

    if (compare_object(s1, s2) !== 0) {
        return compare_object(s1, s2);
    }

    return 0;
}

module.exports = {
    compare: GEM_COMPARE,
    parse: parse
};