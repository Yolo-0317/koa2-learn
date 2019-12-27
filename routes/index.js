const router = require('koa-router')()
const axios = require('axios');
const crypto = require('crypto');
const request = require('request');

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

const getSha1 = function(str) {
  var sha1 = crypto.createHash("sha1"); //定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
  sha1.update(str);
  var res = sha1.digest("hex"); //加密后的值d
  return res;
};

router.post('/string', async (ctx, next) => {
  const { appid, secret } = ctx.request.body;
  const getAccessToken = async () => axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`)
    .then(res => {
      return res.data.access_token;
    });
  const accessToken = await getAccessToken();
  const getSignature = async () => axios.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`)
    .then((res) => {
      const rb = ctx.request.body

      const { noncestr, timestamp, url } = rb;
      const string1 = `jsapi_ticket=${res.data.ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${url}`;
      return {noncestr, timestamp, url, signature: getSha1(string1)};
    })
  const { noncestr, timestamp, url, signature } = await getSignature();
  console.log(noncestr, timestamp, url)
  ctx.response.body = JSON.stringify({ signature, noncestr, timestamp, url, appid })
})

router.get('/sdWXService', async (ctx, next) => {
  const url = `https://yyhd.hazq.com/thinkive/servlet/json?funcNo=100037&url=http://10.20.102.182`;
  const getWxConfigInfo  = async () => request(url);
  const wxConfigInfo = await getWxConfigInfo();
  ctx.body = wxConfigInfo;
})

router.get('/wxTokenService', async (ctx, next) => {
  const rb = ctx.request.body

  const { signature, timestamp, nonce, echostr } = rb;
  ctx.body = echostr;
})

module.exports = router
