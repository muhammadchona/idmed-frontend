export default {
  data () {
    return {
      website: typeof cordova === 'undefined', // this.$q.platform.is.mobile,
      mobile: typeof cordova !== 'undefined'
    }
 }
}
