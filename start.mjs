import puterPkg from 'puter'
import config from './puter.config.mjs'

const createServer = puterPkg.createServer || puterPkg.default || puterPkg
config.port = process.env.PORT || 1337

createServer(config)
