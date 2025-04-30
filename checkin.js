const axios = require('axios')
const {getCookie, getTraffic, getEmailAndPwdList} = require('./utils')
const notify = require('./sendNotify')

const checkinURL = 'https://login.ouonetwork.com/skyapi?action=checkin'

/** 签到 */
async function checkin(cookie) {
    try {
        const res = await axios(checkinURL, {
            method: 'GET',
            headers: {
                Cookie: cookie
            },
            withCredentials: true
        })
        return res.data
    } catch (err) {
        console.log(err)
        process.exit(1)
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
            const checkinRes = await checkin(cookie);
            messages.push(`账号：${email}\n签到增加流量：${checkinRes.data} MB， 是第${checkinRes.top}个签到的 `); // 更清晰的成功信息
        } catch (error) {
            console.error(`账号 ${emailList[i]} 处理失败:`, error);
            messages.push(`账号：${emailList[i]}\n处理失败：${error.message || error}`);
        }
    }

    await notify.sendNotify(`OUO VPN 签到通知`, messages.join('\n\n========================\n\n'));
}

run()
