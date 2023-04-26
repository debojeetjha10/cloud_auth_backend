const { createHash } = require("crypto");

const otpGenerator = (key) => {
  key = key + Math.floor(Date.now() / 100000).toString();
  key = createHash("sha256").update(key).digest("hex");
  console.log(key)
  // var hash = 0;
  // if (key.length === 0) return hash;
  // for (let i = 0; i < key.length; i++) {
  //   let chr = key.charCodeAt(i);
  //   hash = (hash << 5) - hash + chr;
  //   hash |= 0; // Convert to 32bit leteger
  // }
  // if (hash < 0) hash *= -1;
  // return hash;
  let otp = 0000;
  let toAdd = 1000;
  for (let i = 0; i < 4; i++) {
    let val = 0;
    for (let j = 0; j < 64; j++) {
      val += getChartoConstValue(key[i * 64 + j]);
    }
    val %= 10;
    otp += toAdd * (val % 10);
    toAdd = Math.floor(toAdd/10);
  }
  return otp;
};


module.exports = otpGenerator;
