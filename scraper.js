/* globals require:true, console:true */
'use strict';

var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs')

var vizsec2004 = 'http://dl.acm.org/citation.cfm?id=1029208&preflayout=flat'
  , vizsec2005 = 'http://www.computer.org/csdl/proceedings/vizsec/2005/2782/00/index.html'
  , vizsec2006 = 'http://dl.acm.org/citation.cfm?id=1179576&preflayout=flat'
  , vizsec2007 = 'http://link.springer.com/book/10.1007/978-3-540-78243-8/page/1'
  , vizsec2008 = 'http://link.springer.com/book/10.1007/978-3-540-85933-8/page/1'
  , vizsec2009 = 'http://www.computer.org/csdl/proceedings/vizsec/2009/5413/00/index.html'
  , vizsec2010 = 'http://dl.acm.org/citation.cfm?id=1850795&preflayout=flat'
  , vizsec2011 = 'http://dl.acm.org/citation.cfm?id=2016904&preflayout=flat'
  , vizsec2012 = 'http://dl.acm.org/citation.cfm?id=2379690&preflayout=flat'

getBibtex('vizsec-2004.bib', vizsec2004, 'acm')
getBibtex('vizsec-2005.bib', vizsec2005, 'ieee')
getBibtex('vizsec-2006.bib', vizsec2006, 'acm')
getBibtex('vizsec-2007.bib', vizsec2007, 'springer')
getBibtex('vizsec-2008.bib', vizsec2008, 'springer')
getBibtex('vizsec-2009.bib', vizsec2009, 'ieee')
getBibtex('vizsec-2010.bib', vizsec2010, 'acm')
getBibtex('vizsec-2011.bib', vizsec2011, 'acm')
getBibtex('vizsec-2012.bib', vizsec2012, 'acm')


function getBibtex(fileName, url, publisher) {
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if (publisher === 'springer')
        getSpringer(fileName, body)
      else if (publisher === 'acm')
        getAcm(fileName, body)
      else if (publisher === 'ieee')
        getIeee(fileName, body)
    }
    else {
      console.log('Error for ' + url + '\n' + error)
    }
  })
}

function getIeee (fileName, body) {
  var $ = cheerio.load(body)
  var titles = $('a.remote')
  for (var i = 0; i < titles.length; i++ ) {
    var url = titles[i].attribs.href
      , bibtexUrl = 'http://www.computer.org' + url.split('-abs')[0] + '-reference.bib'
    request(bibtexUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        fs.appendFileSync(fileName, body + '\n')
      }
    })
  }
}


function getAcm (fileName, body) {
  var $ = cheerio.load(body)
  var titles = $('.text12 a').filter(function (i, el) {
    return el.attribs.title ? el.attribs.title === 'DOI' : false
  })
  for (var i = 0; i < titles.length; i++ ) {
    var url = titles[i].attribs.href
      , fragment = url.split('/')[4]
      , id = fragment.split('.')[1]
      , parentId = fragment.split('.')[0]
      , bibtexUrl = 'http://dl.acm.org/downformats.cfm?id=' + id + '&parent_id=' + parentId + '&expformat=bibtex'
    request(bibtexUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        fs.appendFileSync(fileName, body + '\n')
      }
    })
  }
}

function getSpringer (fileName, body) {
  var $ = cheerio.load(body)
  var titles = $('.title').children('a')
  for (var i = 0; i < titles.length; i++ ) {
    var bibtexUrl = 'http://link.springer.com/export-citation/' + titles[i].attribs.href + '.bib'
    request(bibtexUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        fs.appendFileSync(fileName, body)
      }
    })
  }
}