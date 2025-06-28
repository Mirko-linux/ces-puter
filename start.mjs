import puterPkg from 'puter'
import config from './puter.config.mjs'

// Imposta la porta dinamica di Render
config.port = process.env.PORT || 1337

// Determina la funzione corretta da chiamare
const run =
  typeof puterPkg === 'function'
    ? puterPkg
    : typeof puterPkg.default === 'function'
    ? puterPkg.default
    : typeof puterPkg.createServer === 'function'
    ? puterPkg.createServer
    : null

if (!run) {
  console.error('❌ Il modulo "puter" non esporta una funzione valida.')
  console.error('Contenuto esportato:', puterPkg)
  process.exit(1)
}

run(config)
