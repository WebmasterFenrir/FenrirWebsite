import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_PB_URL ?? 'http://127.0.0.1:8090'
const pocketbase = new PocketBase(pbUrl)

export default pocketbase
