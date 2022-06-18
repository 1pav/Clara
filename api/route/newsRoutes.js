const rp = require('request-promise-native');
const xml = require('xml-js');
const windows1252 = require('windows-1252');
const jsonutil = require("../utils/jsonUtil.js");
const cheerio = require('cheerio');
const request = require('request-promise-native');

//***BEGIN SECTION POVO and MESIAMO***
function parseXML(url) {
  // Set encoding to null to return body as Buffer	
  return rp.get(url, {
      encoding: null
    })
    .then((body) => {

      // Decode as win-1252
      str = windows1252.decode(body.toString('binary'));
      str = str.replace(/\r\r/g, ' ').replace(/\r/g, ' ');
      obj = xml.xml2js(str, {
        compact: true
      });

      obj = obj.rss.channel.item;
      outputData = [];
      obj.forEach((entry) => {
        outputData.push(entry.description._cdata);
      });
      return outputData;
    })
    .catch((err) => {
      console.error('Failed to get XML: ', err);
    });
}


function getDicamNews() {
  url = 'http://www.science.unitn.it/avvisiesami/dicam/feed/';
  return parseXML(url);
}

function getDisiNews() {
  url = 'http://www.science.unitn.it/cisca/avvisi/feedavvisi.html';
  return parseXML(url);
}
//***END SECTION POVO and MESIANO

//***BEGIN SECTION SOCIOLOGIA***
function scrapeSociologiaNews(url) {
  var json = [];
  return request(url).then((html) => {
    var $ = cheerio.load(html);
    var currentDate = 19960626;
    $('p').addClass('DATA');
    $('strong').addClass('DATA');
    $('.DATA').filter(function () {
      var content = $(this).text();

      if (/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(content)) {
        currentDate = '' + content.substring(6, 10) + content.substring(3, 5) + content.substring(0, 2);
      } else if (/^([0-9]{1,2} [a-zA-Z]{5,9} [0-9]{4})$/.test(content)) {
        monthTable = {
          'gennaio': '01',
          'febbraio': '02',
          'marzo': '03',
          'aprile': '04',
          'maggio': '05',
          'giugno': '06',
          'luglio': '07',
          'agosto': '08',
          'settembre': '09',
          'ottobre': '10',
          'novembre': '11',
          'dicembre': '12',
        }
        contentCut = content.split(' ');

        currentDate = '' + contentCut[2] + monthTable[contentCut[1]];

        if (contentCut[0].length == 1) contentCut[0] = '0' + contentCut[0];

        currentDate = currentDate + '' + contentCut[0];
      } else if (content.length > 1 && content != 'Source URL:' && content[0] != '\n') {
        if ($(this)[0]['name'] == 'strong') {
          json.push({
            'date': currentDate,
            'text': content,
          });
        } else {
          json[json.length - 1]['text'] += ' ' + content;
        }
      }
    });
    return json;
  });
}

function orderSociologiaNews(res1, res2) {
  var resultJson = [];
  return Promise.all([res1, res2])
    .then((rr) => {
      var json;

      json = rr[0];
      rr[1].forEach((entry) => {
        json.push(entry);
      });

      json.sort(function (a, b) {
        return a['data'] - b['data'];
      });

      json.forEach((entry) => {
        resultJson.push(entry.text);
      });
      return resultJson;
    })
    .catch((err) => {
      console.error(err);
    });
}

function getSociologiaNews() {
  urlLezioni = 'http://www.sociologia.unitn.it/print/230/variazioni-orario-lezioni';
  urlEsami = 'http://www.sociologia.unitn.it/print/229/variazioni-esami';
  return orderSociologiaNews(
    scrapeSociologiaNews(urlLezioni),
    scrapeSociologiaNews(urlEsami)
  );
}

//***END SECTION SOCIOLOGIA***

//***BEGIN SECTION GIURISPRUDENZA, LETTERE, PSICOLOGIA, ECONOMIA***

function scrapeGLPENews(url) {
  var json = [];
  return request(url).then((html) => {
    var $ = cheerio.load(html);
    var currentDate = 19960626;
    $('.avviso').filter(function () {
      var content = $(this);
      json.push(
        content[0]['children'][1]['children'][1]['children'][0]['data'] + '\n' + //NAME
        content[0]['children'][3]['children'][1]['children'][0]['children'][0]['data'] + '\n' + //TEXT
        content[0]['children'][1]['children'][1]['attribs']['href'] + '\n' + //LINK
        content[0]['children'][1]['children'][3]['data'].split('                ')[1] //DATE
        .split('            ')[0]);
    });
    return json;
  });
}

function getGiurisprudenzaNews() {
  url = 'http://www.giurisprudenza.unitn.it/print/371/avvisi-dei-docenti';
  return scrapeGLPENews(url);
}

function getLettereNews() {
  url = 'http://www.lettere.unitn.it/print/273/avvisi'
  return scrapeGLPENews(url);
}

function getPsicologiaNews() {
  url = 'http://www.cogsci.unitn.it/print/170/avvisi-dei-docenti';
  return scrapeGLPENews(url);
}

function getEconomiaNews() {
  url = 'http://www.economia.unitn.it/print/68/avvisi-dei-docenti'
  return scrapeGLPENews(url);
}

//***END SECTION GIURISPRUDENZA, LETTERE, PSICOLOGIA, ECONOMIA***

//***BEGIN SECTION UNIFIED***
function getNewsPromise(department) {
  switch (department) {
    case "povo":
      return getDisiNews();
    case "mesiano":
      return getDicamNews();
    case "sociologia":
      return getSociologiaNews();
    case "economia":
      return getEconomiaNews();
    case "giurisprudenza":
      return getGiurisprudenzaNews();
    case "lettere":
      return getLettereNews();
    case "psicologia":
      return getPsicologiaNews();
    default:
      return null;
  }
}

function getNewsByDepartment(req, res) {
  getNewsPromise(req.params.deptName)
    .then((jsonData) => {
      if (jsonData == null) {
        res.status(500);
        res.json({
          error: {
            message: 'Department not found'
          }
        });
      } else {
        res.json(jsonData);
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

module.exports = {
  getNewsByDepartment: getNewsByDepartment,
  // The following functions are exported for testing
  parseXML: parseXML,
  orderSociologiaNews: orderSociologiaNews,
  scrapeSociologiaNews: scrapeSociologiaNews,
  scrapeGLPENews: scrapeGLPENews,
  getNewsPromise: getNewsPromise
};