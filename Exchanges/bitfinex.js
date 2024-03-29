const Exchange = require('./Exchange')
const ws = require('ws')
const request = require('request')
const Bitfinex = require('bitfinex-api-node')

const bitfinex_socket = new Bitfinex(process.env.BITFINEX_API_KEY, process.env.BITFINEX_API_SECRET, {
    version: 2,
    transform: true
}).ws

const bitfinexExchange = new Exchange('bitfinex', 0.002)

bitfinex_socket.on('open', () => {
    // authenticate
    bitfinex_socket.auth()

    //subscribe to tickers
    request.get('https://api.bitfinex.com/v1/symbols', {
        json: true
    }, (error, response, body) => {
        for (let pair of body) {
            bitfinex_socket.subscribeTicker(pair)
        }
    })
})

bitfinex_socket.on('auth', () => {
    console.log('[BITFINEX] authenticated')
})

bitfinex_socket.on('ticker', (pair, ticker) => {
    bitfinexExchange.setPrice(pair.slice(1), ticker.LAST_PRICE)
})

exports.exchange = bitfinexExchange