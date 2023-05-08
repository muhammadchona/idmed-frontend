import { Notify } from 'quasar'
import UserLogin from 'src/store/models/userLogin/User'

export default {
  logout () {
    return UserLogin.api().get('logout')
      .catch((error) => {
        if (error.response) {
          console.log(JSON.stringify(error.response))
          alert(JSON.stringify(error.response.data))
        } else if (error.request) {
          console.log(error.request)
        } else {
          console.log('Error', error.message)
        }
      })
  },
  fetchUsers () {
    return UserLogin.api().get('secUser')
      .catch((error) => {
        if (error.response) {
          console.log(error.response)
          alert(error.response.data)
        } else if (error.request) {
          console.log(error.request)
        } else {
          console.log('Error', error.message)
        }
      })
  },
  signup (params) {
    return UserLogin.api().post('user/signup', params)
      .catch((error) => {
        if (error.response) {
          console.log(error.response)
          alert(error.response.data)
        } else if (error.request) {
          console.log(error.request)
        } else {
          console.log('Error', error.message)
        }
      })
  },
  login (params) {
    return UserLogin.api().post('/login', params)
      .catch((error) => {
        if (error.response) {
          Notify.create({
            icon: 'announcement',
            message: 'Utilizador ou a senha inválida',
            type: 'negative',
            progress: true,
            timeout: 3000,
            position: 'top',
            color: 'negative',
            textColor: 'white',
            classes: 'glossy'
          })
          console.log('O erro: ', error.response)
        } else if (error.request) {
          console.log(error.request)
        } else {
          Notify.create({
            icon: 'announcement',
            message: 'Problemas ao conectar-se com o Servidor. ',
            type: 'negative',
            progress: true,
            timeout: 3000,
            position: 'top',
            color: 'negative',
            textColor: 'white',
            classes: 'glossy'
          })
          console.log('Error', error.message)
        }
      })
  },
  updateUser (params) {
    return UserLogin.api().put('secUser/' + params.id, params)
      .catch((error) => {
        if (error.response) {
          console.log(error.response)
        } else if (error.request) {
          console.log(error.request)
        } else {
          console.log('Error', error.message)
        }
      })
  },
  getUser (params) {
    return UserLogin.api().get('secUser/' + params.id).then(resp => {
        this.submitting = false
      console.log(resp.response)
      })
      .catch((error) => {
        if (error.response) {
          console.log(error.response)
        } else if (error.request) {
          console.log(error.request)
        } else {
          console.log('Error', error.message)
        }
      })
  },
  deleteUser (id) {
    return UserLogin.api().delete('user/' + id)
      .catch((error) => {
        if (error.response) {
          console.log(error.response)
        } else if (error.request) {
          console.log(error.request)
        } else {
          console.log('Error', error.message)
        }
      })
  }
}
