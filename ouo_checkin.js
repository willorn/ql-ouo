const axios = require('axios')
const {getCookie, getTraffic, getEmailAndPwdList, formatErrorMessage, enhanceError} = require('./utils')
const notify = require('./sendNotify')

const checkinURL = 'https://login.ouonetwork.com/skyapi?action=checkin'

/** 签到 */
async function ouo_checkin(cookie) {
    try {
        console.log('发送签到请求...')
        const res = await axios(checkinURL, {
            method: 'GET',
            headers: {
                Cookie: cookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            withCredentials: true
        })
        console.log('签到响应:', JSON.stringify(res.data))
        return res.data
    } catch (err) {
        console.log('签到请求失败:', err.message)
        throw enhanceError(err) // 抛出错误而不是退出进程，让上层处理
    }
}

async function run() {
    const [emailList, pwdList] = await getEmailAndPwdList()
    const messages = [];
    for (let i = 0; i < emailList.length; i++) {
        try {
            const email = emailList[i]
            const pwd = pwdList[i]
            let msg = `邮箱：${emailList[i]}`
            const cookie = await getCookie(email, pwd)
            if (cookie.includes('登录失败')) {
                msg += `\n${cookie}`
                messages.push(msg)
                continue
            }
            const checkinRes = await ouo_checkin(cookie);
            // 检查响应格式是否符合预期
            if (checkinRes && typeof checkinRes.data !== 'undefined' && typeof checkinRes.top !== 'undefined') {
                messages.push(`账号：${email}\n签到增加流量：${checkinRes.data} MB， 是第${checkinRes.top}个签到的`);
            } else {
                console.log('签到响应数据格式不符合预期:', JSON.stringify(checkinRes));
                messages.push(`账号：${email}\n签到结果: ${JSON.stringify(checkinRes)}`);
            }
        } catch (error) {
            console.error(`账号 ${emailList[i]} 处理失败:`, error);
            // 使用格式化函数处理错误信息
            messages.push(formatErrorMessage(error, emailList[i]));
        }
    }

    await notify.sendNotify(`OUO VPN 签到通知`, messages.join('\n\n========================\n\n'));
}

run()
