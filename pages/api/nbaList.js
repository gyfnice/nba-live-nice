const superagent = require('superagent');
const cheerio = require('cheerio');

const NBA_HOST = 'https://m.yoozhibo.net';
const getGrapUrl = (targetUrl) => {
  return new Promise((resolve, reject) => {
    superagent.get(targetUrl).end((err, res) => {
      if (err) {
        //console.log('grabCoin error--')
        reject('error');
      }
      resolve(res);
    });
  });
};
const getContent = (content) => {
    const $ = cheerio.load(content);
    let liveLink = null;
    $('.sig-list').find('a').each((i, elem) => {
      if ($(elem).text() === '中文超清') {
        liveLink = $(elem).attr('href');
      }
    })
    if(!liveLink) {
      $('.sig-list').find('a').each((i, elem) => {
        if ($(elem).text() === '高清国语') {
          liveLink = $(elem).attr('href');
        }
      })
    }
    if(!liveLink) {
      $('.sig-list').find('a').each((i, elem) => {
        if ($(elem).text() === '高清国语1') {
          liveLink = $(elem).attr('href');
        }
      })
    }
    if (!liveLink) {
      $('.sig-list').find('a').each((i, elem) => {
        if ($(elem).text() === '高清原声') {
          liveLink = $(elem).attr('href');
        }
      });
    }
    return {
      team: $('.sig-vs').find('.team').eq(0).text(),
      link: liveLink,
    };
}
export default async function (req, res) {
  const response = await getGrapUrl(`${NBA_HOST}/${req.body.query}/`);
  const matchs = [];
  const $ = cheerio.load(response?.text || '');
  $('.daily')
    .eq(0)
    .find('.matches .row')
    .each((i, elem) => {
      matchs.push({
        link: $(elem)
          .find('a')
          .attr('href'),
        time: $(elem)
          .find('.time')
          .text(),
        teamLeft: {
          img: $(elem)
            .find('.team .ht .lazy')
            .attr('data-original'),
          name: $(elem)
            .find('.team .ht .name')
            .text(),
        },
        teamRight: {
          img: $(elem)
            .find('.team .gt .lazy')
            .attr('data-original'),
          name: $(elem)
            .find('.team .gt .name')
            .text(),
        },
      });
    });
  const list = await Promise.all(
    matchs.map(item => {
      return getGrapUrl(`${NBA_HOST}${item.link}`).then(response =>
        getContent(response?.text || 0),
      );
    }),
  );
  const results = matchs.map((item, index) => {
    item.liveLink = list[index].link;
    return item;
  });
  const date = $('.daily')
    .eq(0)
    .find('.date')
    .text();
  res.status(200).json({
    list: results,
    title: date,
  });
}
