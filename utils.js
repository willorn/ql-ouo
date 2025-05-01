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

/**
 * 格式化错误信息，提取并整理详细的错误数据
 * @param {Error} error - 捕获到的错误
 * @param {string} accountInfo - 相关账号信息
 * @returns {string} 格式化后的错误消息
 */
function formatErrorMessage(error, accountInfo) {
  let errorMessage = `账号：${accountInfo}\n处理失败：${error.message || '未知错误'}`;
  
  // 如果有详细错误信息，添加到通知中
  if (error.details) {
    errorMessage += '\n详细错误信息：';
    if (error.details.responseStatus) {
      errorMessage += `\n响应状态码: ${error.details.responseStatus}`;
    }
    if (error.details.responseData) {
      errorMessage += `\n响应数据: ${JSON.stringify(error.details.responseData)}`;
    }
    // 添加错误堆栈信息（可选，可能会很长）
    if (error.details.stack) {
      const stackLines = error.details.stack.split('\n').slice(0, 3).join('\n');
      errorMessage += `\n错误堆栈: ${stackLines}`;
    }
  } else if (error.response) {
    // 兼容直接从axios获取的错误
    errorMessage += `\n响应状态码: ${error.response.status || '未知'}`;
    errorMessage += `\n响应数据: ${JSON.stringify(error.response.data || {})}`;
  } else if (typeof error === 'object') {
    // 尝试将整个错误对象序列化（排除循环引用）
    try {
      const errorObj = {};
      Object.getOwnPropertyNames(error).forEach(key => {
        if (typeof error[key] !== 'function' && key !== 'stack') {
          errorObj[key] = error[key];
        }
      });
      errorMessage += `\n错误详情: ${JSON.stringify(errorObj)}`;
    } catch (e) {
      errorMessage += '\n无法序列化完整错误对象';
    }
  }
  
  return errorMessage;
}

/**
 * 增强错误对象，添加详细信息
 * @param {Error} err - 原始错误对象
 * @returns {Error} 增强后的错误对象
 */
function enhanceError(err) {
  // 收集更详细的错误信息
  const errorDetails = {
    message: err.message,
    stack: err.stack
  };
  
  if (err.response) {
    console.log('响应状态:', err.response.status);
    console.log('响应数据:', JSON.stringify(err.response.data));
    errorDetails.responseStatus = err.response.status;
    errorDetails.responseData = err.response.data;
  }
  
  // 带上详细错误信息
  err.details = errorDetails;
  return err;
}

module.exports = { getCookie, getEmailAndPwdList, formatErrorMessage, enhanceError }
