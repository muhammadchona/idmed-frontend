import CryptoJS from 'crypto-js'
export default {
  data () {
    return {
      passKey: 'a6489554-f07d-404d-8dd6-b6ea9c307b28'
    }
  },
  methods: {
   encrypt (obj) {
    Object.keys(obj).forEach(key => {
      if (key === 'value' || key === 'name' || key === 'description' || key === 'code' || key === 'password') {
        obj[key] = CryptoJS.AES.encrypt(JSON.stringify(obj[key]), this.passKey).toString()
      }
    })
    return obj
   },
   decrypt (obj) {
    Object.keys(obj).forEach(key => {
      if (key === 'value' || key === 'name' || key === 'description' || key === 'code' || key === 'password') {
        console.log(JSON.stringify(obj[key]))
        console.log(obj[key])
        console.log(CryptoJS.AES.decrypt(JSON.stringify(obj[key]), this.passKey).toString())
        console.log(CryptoJS.AES.decrypt(JSON.stringify(obj[key]), this.passKey).toString(CryptoJS.enc.Utf8))
        obj[key] = CryptoJS.AES.decrypt(JSON.stringify(obj[key]), this.passKey).toString(CryptoJS.enc.Utf8)
      }
    })
    return obj
   },
   encryptPlainText (text) {
    console.log(text)
   // console.log(CryptoJS.AES.encrypt(text, this.passKey).toString())
    text = CryptoJS.AES.encrypt(text, this.passKey).toString()
   // text = CryptoJS.AES.decrypt(text, this.passKey).toString(CryptoJS.enc.Utf8)
    return text
  },
  decryptPlainText (text) {
    console.log(text)
   // console.log(CryptoJS.AES.encrypt(text, this.passKey).toString())
   // text = CryptoJS.AES.encrypt(text, this.passKey).toString()
    text = CryptoJS.AES.decrypt(text, this.passKey).toString(CryptoJS.enc.Utf8).replace('"', '').replace('"', '')
    return text
  }
 }
}
