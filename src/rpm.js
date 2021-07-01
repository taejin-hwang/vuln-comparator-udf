function isAlphaNumeric(ch) {
    if (ch >= '0' && ch <= '9')
        return true;
    if (ch >= 'a' && ch <= 'z')
        return true;
    if (ch >= 'A' && ch <= 'Z')
        return true;
    return false;
}
function isDigit(ch){
    return ch >= '0' && ch <= '9';
}
function isAlpha(ch){
    if (ch >= 'a' && ch <= 'z')
        return true;
    if (ch >= 'A' && ch <= 'Z')
        return true;
    return false;
}

function rpmVersionCompare(vA, vB) {
    if (vA == vB) return 0;
    var iA = 0;
    var iB = 0;
    var chA = vA.charAt(0);
    var chB = vB.charAt(0);

    var iAx = iA;
    var iBx = iB;

    while (iA < vA.length || iB < vB.length) {
        while (iA < vA.length) {
            chA = vA.charAt(iA);
            if (isAlphaNumeric(chA) || chA == '~' || chA == '^')
                break;
            iA++;
        }
        while (iB < vB.length) {
            chB = vB.charAt(iB);
            if (isAlphaNumeric(chB) || chB == '~' || chB == '^')
                break;
            iB++;
        }
        if (chA == '^' || chB == '^') {
            if (iA == vA.length) return -1;
            if (iB == vB.length) return 1;
            if (chA != '^') return 1;
            if (chB != '^') return -1;
            iA++;
            iB++;
            continue;
        }

        if (iA == vA.length || iB == vB.length) break;

        iAx = iA;
        iBx = iB;
        var isnum = 0;
        if (isDigit(vA.charAt(iAx))) {
            while (iAx < vA.length && isDigit(vA.charAt(iAx))) iAx++;
            while (iBx < vB.length && isDigit(vB.charAt(iBx))) iBx++;
            isnum = 1;
        }
        else {
            while (iAx < vA.length && isAlpha(vA.charAt(iAx))) iAx++;
            while (iBx < vB.length && isAlpha(vB.charAt(iBx))) iBx++;
            isnum = 0;
        }
        var oldch1 = iAx;
        var oldch2 = iBx;

        if (iA == iAx) return -1;
        if (iB == iBx) return (isnum ? 1: -1);

        if (isnum) {
            while (vA.charAt(iA) == '0') iA++;
            while (vB.charAt(iB) == '0') iB++;
        }
        lenA = iAx - iA;
        lenB = iBx - iB;
        if (lenA > lenB) return 1;
        if (lenA < lenB) return -1;

        str1 = vA.substring(iA, iAx);
        str2 = vB.substring(iB, iBx);
        rc = (str1 > str2);
        if (str1 > str2 ) return 1;
        if (str1 < str2) return -1;
        iA = iAx;
        iB = iBx;
    }
    if (iA == vA.length && iB == vB.length) return 0;
    if (iA == vA.length) return -1;
    return 1;
}

function rpmParse(VER) {
    var v = {};
    idx = VER.indexOf(':');
    if (idx == -1) {
        v.epoch = 0;
        v.version = VER;
    }
    else {
        v.epoch = parseInt(VER.substring(0, idx));
        v.version = VER.substring(idx+1);
    }
    idxVer = v.version.indexOf('-');
    if (idxVer == -1) {
        v.release = '';
    }
    else {
        v.release = v.version.substring(idxVer+1);
        v.version = v.version.substring(0, idxVer);
    }
    return v;
}
function RPM_COMPARE(VER1, VER2) {
    var v1 = rpmParse(VER1);
    var v2 = rpmParse(VER2);
    if (v2.version == '#MAXV#' && v1.version == '#MAXV#')
        return 0;
    if (v1.version == '#MAXV#')
        return 1;
    if (v2.version == '#MAXV#')
        return -1;
    var ret = 0;
    if (v1.epoch > v2.epoch)
        ret = 1;
    else if (v1.epoch < v2.epoch)
        ret = -1;
    if (ret == 0) {
        ret = rpmVersionCompare(v1.version, v2.version);
        if (ret == 0)
            ret = rpmVersionCompare(v1.release, v2.release);
    }
    return ret;
}
module.exports = RPM_COMPARE;
