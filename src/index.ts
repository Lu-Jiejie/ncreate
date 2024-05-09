import ky from 'ky'

const res = await ky('https://api.github.com/repos/lu-jiejie/ts-starter/contents')

console.log(res)
