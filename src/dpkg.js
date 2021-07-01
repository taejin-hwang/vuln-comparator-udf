function parse(VER) {
  var version = /^([0-9]*(?=:))?:(.*)/.exec(VER);
  var v = {};
  v.epoch = (version)?version[1]:0;
  version = (version && version[2])?version[2]:VER;
  version = version.split("-");
  v.debian = (version.length>1)?version.pop():"";
  v.upstream = version.join("-");
  return v;
}
function truncateZeros(num) {
  var truncated = num ? num.replace(/\b0+/, "") : "0";
  return truncated ? truncated : "0";
}
function findIndex(ar,fn){
  for(var i = 0;i < ar.length; i++){
    if(fn(ar[i],i)){
      return i;
    }
  }
  return -1;
}
function charCode(c){
  if(c == "~")
    return 0;
  else if(/[a-zA-Z]/.test(c))
    return c.charCodeAt(0)-"A".charCodeAt(0)+1;
  else if(/[.:+-:]/.test(c))
    return c.charCodeAt(0)+"z".charCodeAt(0)+1
}
function compareChunk(a,b){
  var ca = a.split(""),cb=b.split("");
  var diff = findIndex(ca, function(c,index){
    if(cb[index] && c == cb[index]) return false;
    return true;
  });
  if(diff === -1){
    if(cb.length >ca.length){
      if(cb[ca.length] == "~"){
        return 1;
      }else{
        return -1;
      }
    }
    return 0; //no diff found and same length
  }else if(!cb[diff]){
    return (ca[diff] === "~")?-1:1;
  }else{
    return (charCode(ca[diff])>charCode(cb[diff]))?1:-1;
  }
}
function checkLast(matches, sign) {
  if (matches == null) {
    return 0;
  } else {
    var tail = truncateZeros(matches[1].split("")[0]);
    if (tail === "0") {
      return 0;
    } else {
      return -1 * sign;
    }
  }
}

function compareStrings(a,b){
  if(a===b) return 0;
  var parseA = /([^0-9]+|[0-9]+)/g;
  var parseB = /([^0-9]+|[0-9]+)/g;
  var ra,rb;
  while((ra=parseA.exec(a)) !== null && (rb = parseB.exec(b)) !== null ){
    if((isNaN(ra[1]) || isNaN(rb[1])) && ra[1] !== rb[1] ){
      return ra[1] === rb[1] ? compareChunk(ra[1], rb[1]) : ra[1].localeCompare(rb[1])
    }else{ //both are numbers
      ra[1] = truncateZeros(ra[1])
      rb[1] = truncateZeros(rb[1])
      if(ra[1]!==rb[1]){
        return (parseInt(ra[1])>parseInt(rb[1]))?1:-1;
      }
    }
  }
  if(!ra && rb){
    return checkLast(parseB.exec(b), 1);
  }else if(ra && !rb){
    return checkLast(ra, -1);
  }else{
    return 0;
  }
}
function DPKG_COMPARE(a, b){
  var v1 = parse(a);
  var v2 = parse(b);

  if (v1.upstream == "#MAXV#")
    return 1;
  if((v1.epoch>0 || v2.epoch>0) && Math.sign(v1.epoch-v2.epoch)!=0){
    return Math.sign(v1.epoch-v2.epoch);
  }
  if(compareStrings(v1.upstream,v2.upstream) !=0){
    return compareStrings(v1.upstream,v2.upstream);
  }else{
    return compareStrings(v1.debian,v2.debian);
  }

}
module.exports = DPKG_COMPARE;