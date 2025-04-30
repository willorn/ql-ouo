const { initInstance, getEnv } = require('./qlApi.js')
const axios = require('axios')

const loginURL = 'https://login.ouonetwork.com/api/v1/passport/auth/login'

function extractArr(envStr) {
  if (typeof envStr === 'string') {
    envStr = envStr.trim()
  }

  if (Array.isArray(envStr)) {
    return envStr
  } else if (envStr.includes('\n')) {
    return envStr.split('\n').map(v => v.trim()).filter(Boolean)
  }
  return [envStr]
}

/** 获取邮箱和密码数组 */
async function getEmailAndPwdList() {
  let instance = null
  try {
    instance = await initInstance()
  } catch (e) { }

  let emailEnv = process.env.VPN_OUO_EMAIL || []
  let pwdEnv = process.env.VPN_OUO_PWD || []

  try {
    if (instance) {
      emailEnv = await getEnv(instance, 'VPN_OUO_EMAIL')
      pwdEnv = await getEnv(instance, 'VPN_OUO_PWD')
    }
  } catch { }

  const emailList = extractArr(emailEnv)
  const pwdList = extractArr(pwdEnv)

  const emailLen = emailList.length
  const pwdLen = pwdList.length

  if (!emailLen || !pwdLen) {
    console.log('未获取到邮箱和密码, 程序终止')
    process.exit(1)
  }

  if (emailLen !== pwdLen) {
    console.log('邮箱和密码数量不一致, 程序终止')
    process.exit(1)
  }

  console.log(`✅ 成功读取 ${emailLen} 对邮箱和密码`)

  return [emailList, pwdList]
}

/** 登录获取 cookie */
async function getCookie(email, pwd) {
  const formData = new FormData()
  formData.append('email', email)
  formData.append('passwd', pwd)
  let msg = ''
  try {
    const res = await axios(loginURL, {
      method: 'POST',
      data: formData
    })
    if (res.data.ret === 0) {
      msg = `❌ 登录失败：${res.data.msg}`
      console.log(msg)
      return msg
    }
    console.log(`✅ 登录成功：${email}`)
    return res.headers['set-cookie'].join('; ')
  } catch (e) {
    msg = `❌ 登录失败：${e.message}`
    console.log(msg)
    return msg
  }
}

module.exports = { getCookie, getEmailAndPwdList }
