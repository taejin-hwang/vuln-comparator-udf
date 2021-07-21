function parse(VER) {
    VER = standardize(VER);
    var matches = VER.match(
        new RegExp(
        `^v?([0-9]+(\\.[0-9]+)*)` +
        `(-([0-9]+[0-9A-Za-z\\-~]*(\\.[0-9A-Za-z\\-~]+)*)|(-?([A-Za-z\\-~]+[0-9A-Za-z\\-~]*(\\.[0-9A-Za-z\\-~]+)*)))?` +
        `(\\+([0-9A-Za-z\\-~]+(\\.[0-9A-Za-z\\-~]+)*))?` +
        `?$`, "i")
    );
    return matches != null ? groups_to_ver(matches) : null;
}

function standardize(VER) {
    var release = VER.match("\\.RELEASE");
    if (release != null) {
        VER = VER.substr(0, release.index);
    }


    var suffix = VER.match("\\.[A-Za-z]");
    if (suffix != null) {
        VER = VER.substr(0, suffix.index) + VER.substr(suffix.index+1)
    }

    var expr = new RegExp("^(RELEASE\\.)", "i");
    if (VER.match(expr) != null) {
        VER = VER.replace(expr, "");
    }

    return VER;
}

function groups_to_ver(matches) {
    var segments = [];

    var split = matches[1].split(".");
    for (var i = 0; i < split.length; i++) {
        segments.push(parseInt(split[i]));
    }

    var pre = matches[7];
    if (pre == null) {
        pre = matches[4] == null ? "" : matches[4];
    }

    var VER =  {
        segments: segments,
        buildMetadata: matches[10],
        preRelease: pre
    };

    return VER;
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
        if (ver_split[j] == null || ver_split[j] === "0") {
            copied = copied.slice(0, j);
            continue;
        }
        break;
    }

    return copied;
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

function compare_release(a, b) {
    if (a === b) {
        return 0;
    }
    if (isNull(a)) {
        return 1;
    } else if (isNull(b)) {
        return -1;
    } else {
        return compare_single(a, b);
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

function SEMVER_COMPARE(a, b) {
    if (a === b) {
        return 0;
    } else if (a === "#MAXV#") {
        return 1;
    } else if (b === "#MAXV#") {
        return -1;
    }

    var v1 = parse(a);
    var v2 = parse(b);

    var s1 = normalize(v1.segments);
    var s2 = normalize(v2.segments);

    s1 = pad(s1, s2.length);
    s2 = pad(s2, s1.length);

    if (compare_object(s1, s2) !== 0) {
        return compare_object(s1, s2);
    }

    return compare_release(v1.preRelease, v2.preRelease);
}

module.exports = {
    compare: SEMVER_COMPARE,
    parse: parse
};