import { createServer } from 'puter'
import config from './puter.config.mjs'

config.port = process.env.PORT || 1337
createServer(config)
