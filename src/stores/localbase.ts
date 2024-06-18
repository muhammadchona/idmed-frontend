import Localbase from 'localbase'

// const db = new Localbase('db')
export default {
    newDb () {
        const db = new Localbase('db')
        db.config.debug = false
    return db
    }
}
