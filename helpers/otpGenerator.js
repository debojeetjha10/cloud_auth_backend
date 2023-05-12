const { createHash } = require("crypto");
const { getChartoConstValue } = require('../constants')
const otpGenerator = (key) => {
  key = key + Math.floor(Date.now() / 100000).toString();
  key = createHash("sha256").update(key).digest("hex");
  console.log(key)
  let otp = '';
  for (let i = 0; i < 4; i++) {
    let val = 0;
    for (let j = 0; j < 16; j++) {
      val += getChartoConstValue((key[i * 16 + j].toString()).toUpperCase());
    }
    console.log(val);
    otp += (val % 10).toString();
  }
  console.log(otp);
  return otp;
};


module.exports = otpGenerator;
