var compare = require('../src/dpkg');
var expect = require("chai").expect;

describe("Zero Padding Tests", function() {
    it("Equality Tests", function () {
        expect(compare('1.15-1', '1.15-1')).to.equal(0);
        expect(compare('1.0000015-1', '1.15-1')).to.equal(0);
        expect(compare('1:0.0', '01:0.0')).to.equal(0);
        expect(compare('1:1.4', '01:01.4')).to.equal(0);
        expect(compare('2:3.01', '02:03.1')).to.equal(0);
        expect(compare('1:1.0', '01:01.0')).to.equal(0);
    });

    it("Less Than Tests", function () {
        expect(compare('1.14-1', '1.15-1')).to.equal(-1);
        expect(compare('1.000001-1', '1.15-1')).to.equal(-1);
        expect(compare('1:0.0', '01:01.0')).to.equal(-1);
        expect(compare('1:2.4', '01:03.4')).to.equal(-1);
        expect(compare('2:3.01', '02:03.2')).to.equal(-1);
        expect(compare('1:01.0', '01:02.0')).to.equal(-1);
    });

    it("Greater Than / Reflexive tests", function () {
        expect(compare( '1.15-1', '1.14-1')).to.equal(1);
        expect(compare('1.15-1', '1.000001-1')).to.equal(1);
        expect(compare('01:01.0', '1:0.0')).to.equal(1);
        expect(compare( '01:03.4', '1:2.4')).to.equal(1);
        expect(compare( '02:03.2', '2:3.01')).to.equal(1);
        expect(compare( '01:02.0', '1:01.0')).to.equal(1);
    });
});

describe("Trailing Zeros Test", function() {
    it("Equality Tests", function () {
        expect(compare('1.18.-r2', '1.18.0-r2')).to.equal(0);
        expect(compare('1.-r2', '1.0-r2')).to.equal(0);
        expect(compare('1.2.3.-r2', '1.2.3.0-r2')).to.equal(0);
        expect(compare('1.0-r2', '1.-r2')).to.equal(0);
    });

    it("Inequality Tests", function () {
        expect(compare('1.18.-r2', '1.18.1-r2')).to.equal(-1);
        expect(compare('1.18.1-r2', '1.18.-r2')).to.equal(1);
        expect(compare('1.-r2', '1.1-r2')).to.equal(-1);
        expect(compare('0.9.-r2', '1.0.1-r2')).to.equal(-1);
        expect(compare('1:1.12.-r2', '1:1.12.1-r2')).to.equal(-1);
    });
});

describe("Empty String Fragments", function() {
    it("Version starts with r", function () {
        expect(compare('r3', '3')).to.equal(1);
        expect(compare('0.105-14', '0.105-r10')).to.equal(-1);
    });
});

describe("Assorted Inequality Tests", function() {
    it("Random Tests", function () {
        expect(compare('0a-0', '0b-0')).to.equal(-1);
        expect(compare('1.0.1', '1.0.0')).to.equal(1);
        expect(compare('1.0.1~rc1', '1.0.0~rc2')).to.equal(1);
        expect(compare('1.0.0~rc1', '1.0.0~rc1+v1')).to.equal(-1);
        expect(compare('1.0.1~rc1', '1.0.0~rc1+v1')).to.equal(1);
        expect(compare('1.0.0~rc1+v1', '1.0.0~rc1+v2')).to.equal(-1);
        expect(compare('1.0.1+v1', '1.0.0+v10')).to.equal(1);
        expect(compare('2.11-9', '2.10-18+deb7u4')).to.equal(1);
        expect(compare('2:1.1235-1', '2:1.1234-4')).to.equal(1);
    });
});
