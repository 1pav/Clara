const request = require('request-promise-native');
const newsRoutes = require('../route/newsRoutes');
apiBaseUrl = 'https://clara-unitn.herokuapp.com/news/'

test('Test news API for DISI', () => {
  expect.assertions(1);
  return request(apiBaseUrl + 'povo').then(res => {
    var obj = JSON.parse(res);
    expect(Array.isArray(obj)).toBe(true);
  });
});

test('Test news API for Economia', () => {
  expect.assertions(1);
  return request(apiBaseUrl + 'economia').then(res => {
    var obj = JSON.parse(res);
    expect(Array.isArray(obj)).toBe(true);
  });
});

test('Test news API for Lettere', () => {
  expect.assertions(1);
  return request(apiBaseUrl + 'lettere').then(res => {
    var obj = JSON.parse(res);
    expect(Array.isArray(obj)).toBe(true);
  });
});

test('Test news API for Psicologia', () => {
  expect.assertions(1);
  return request(apiBaseUrl + 'psicologia').then(res => {
    var obj = JSON.parse(res);
    expect(Array.isArray(obj)).toBe(true);
  });
});

test('Test news API for Sociologia', () => {
  expect.assertions(1);
  return request(apiBaseUrl + 'sociologia').then(res => {
    var obj = JSON.parse(res);
    expect(Array.isArray(obj)).toBe(true);
  });
});

test('Test news API for DICAM', () => {
  expect.assertions(1);
  return request(apiBaseUrl + 'mesiano').then(res => {
    var obj = JSON.parse(res);
    expect(Array.isArray(obj)).toBe(true);
  });
});

test('Test news API for Giurisprudenza', () => {
  expect.assertions(1);
  return request(apiBaseUrl + 'giurisprudenza').then(res => {
    var obj = JSON.parse(res);
    expect(Array.isArray(obj)).toBe(true);
  });
});

test('Test parseXML() for DICAM', () => {
  expect.assertions(1);
  var url = 'http://www.science.unitn.it/avvisiesami/dicam/feed/';
  return newsRoutes.parseXML(url).then(data => {
    expect(Array.isArray(data)).toBe(true);
  });
});

test('Test parseXML() for DISI', () => {
  expect.assertions(1);
  var url = 'http://www.science.unitn.it/cisca/avvisi/feedavvisi.html';
  return newsRoutes.parseXML(url).then(data => {
    expect(Array.isArray(data)).toBe(true);
  });
});

test('Test scrapeSociologiaNews() for "lezioni"', () => {
  url = 'http://www.sociologia.unitn.it/print/230/variazioni-orario-lezioni';
  return newsRoutes.scrapeSociologiaNews(url).then(data => {
    // Expect Array
    expect(Array.isArray(data)).toBe(true);
    // If not Array is not empty, expect that all items have `date` and `text` fields
    for (var i = 0; i < data.length; i++) {
      expect(data[i]).toHaveProperty('date');
      expect(data[i]).toHaveProperty('text');
      // Check that fields are not falsy
      expect(data[i].date).not.toBeFalsy();
      expect(data[i].text).not.toBeFalsy();
    }
  });
});

test('Test scrapeSociologiaNews() for "esami"', () => {
  url = 'http://www.sociologia.unitn.it/print/229/variazioni-esami';
  return newsRoutes.scrapeSociologiaNews(url).then(data => {
    // Expect Array
    expect(Array.isArray(data)).toBe(true);
    // If not Array is not empty, expect that all items have `date` and `text` fields
    for (var i = 0; i < data.length; i++) {
      expect(data[i]).toHaveProperty('date');
      expect(data[i]).toHaveProperty('text');
      // Check that fields are not falsy
      expect(data[i].date).not.toBeFalsy();
      expect(data[i].text).not.toBeFalsy();
    }
  });
});

test('Test orderSociologiaNews()', () => {
  urlLezioni = 'http://www.sociologia.unitn.it/print/230/variazioni-orario-lezioni';
  urlEsami = 'http://www.sociologia.unitn.it/print/229/variazioni-esami';
  return newsRoutes.orderSociologiaNews(newsRoutes.scrapeSociologiaNews(urlLezioni), newsRoutes.scrapeSociologiaNews(urlEsami)).then(data => {
    // Expect Array
    expect(Array.isArray(data)).toBe(true);
    for (var i = 0; i < data.length; i++) {
      // Check that field is not falsy
      expect(data[i]).not.toBeFalsy();
    }
  });
});

test('Test scrapeGLPENews() for Giurisprudenza', () => {
  var url = 'http://www.giurisprudenza.unitn.it/print/371/avvisi-dei-docenti';
  return newsRoutes.scrapeGLPENews(url).then(data => {
    // Expect Array
    expect(Array.isArray(data)).toBe(true);
    for (var i = 0; i < data.length; i++) {
      // Check that field is not falsy
      expect(data[i]).not.toBeFalsy();
    }
  });
});

test('Test scrapeGLPENews() for Lettere', () => {
  var url = 'http://www.lettere.unitn.it/print/273/avvisi';
  return newsRoutes.scrapeGLPENews(url).then(data => {
    // Expect Array
    expect(Array.isArray(data)).toBe(true);
    for (var i = 0; i < data.length; i++) {
      // Check that field is not falsy
      expect(data[i]).not.toBeFalsy();
    }
  });
});

test('Test scrapeGLPENews() for Psicologia', () => {
  var url = 'http://www.cogsci.unitn.it/print/170/avvisi-dei-docenti';
  return newsRoutes.scrapeGLPENews(url).then(data => {
    // Expect Array
    expect(Array.isArray(data)).toBe(true);
    for (var i = 0; i < data.length; i++) {
      // Check that field is not falsy
      expect(data[i]).not.toBeFalsy();
    }
  });
});

test('Test getNewsPromise() for DISI', () => {
  return newsRoutes.getNewsPromise('povo').then(data => {
    // Expect Array
    expect(Array.isArray(data)).toBe(true);
    for (var i = 0; i < data.length; i++) {
      // Check that field is not falsy
      expect(data[i]).not.toBeFalsy();
    }
  });
});
