<template>
  <div>Logout</div>
</template>
<script>
import { SessionStorage } from 'quasar'

export default {
  data () {
    return {}
  },
  created: function () {
  //  UsersService.logout()
  //  localStorage.setItem('id_token', null)
  SessionStorage.clear()
   localStorage.setItem('user', null)
  this.$router.push({ path: '/Login' })
  }
}
</script>
