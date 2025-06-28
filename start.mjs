import * as puterModule from 'puter'
import config from './puter.config.mjs'

const puter = puterModule.default?.puter || puterModule.puter || puterModule
puter(config)
