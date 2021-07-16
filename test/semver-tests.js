var {compare, parse} = require('../src/semver');
var expect = require("chai").expect;

describe("Zero Padding Tests", function() {
    it("Equality Tests", function () {
        expect(compare("1.0", "1.0.0")).to.equal(0);
        expect(compare("4.1-alpha", "4.1.0-alpha")).to.equal(0);
        expect(compare('1.2-beta', '1.2-beta')).to.equal(0);
        expect(compare("v1.2", "v1.2.0.0")).to.equal(0);
    });

    it("Less Than Tests", function () {
        expect(compare('1.2.3', '1.4.5')).to.equal(-1);
        expect(compare('0.1.0', '1.0.0')).to.equal(-1);
        expect(compare('1.0.0-alpha', '1.0.0')).to.equal(-1);
        expect(compare('0.1.0', '11')).to.equal(-1);
        expect(compare('0.1.0', '1.1')).to.equal(-1);
        expect(compare('11.1', '11.1.1')).to.equal(-1);
        expect(compare('1.1.4', '1.2')).to.equal(-1);
        expect(compare('v1.2', 'v1.2.0.0.1')).to.equal(-1);
        expect(compare('v1.2.3.0', 'v1.2.3.4')).to.equal(-1);
        expect(compare('v1.7rc1', 'v1.7rc2')).to.equal(-1);
        expect(compare('v1.7rc2', 'v1.7')).to.equal(-1);
        expect(compare("4.1-alpha", "4.1.0-alpha-1")).to.equal(-1);
    });

    it("Greater Than / Reflexive tests", function () {

    });
});

describe("Trailing Zeros Test", function() {
    it("Equality Tests", function () {

    });

    it("Inequality Tests", function () {

    });
});

describe("Empty String Fragments", function() {
    it("Version starts with r", function () {

    });
});

describe("Assorted Inequality Tests", function() {
    it("Random Tests", function () {

    });
});
