"use strict";
/// <reference types="node" />

//const WDIOReporter = require('@wdio/reporter');
const WDIOReporter = require("@wdio/reporter").default;
const axios = require('axios');
const async = require('async')
let numberId;
let params;
let resp;



function createTestRun() {
  let date = new Date()
  let title = params.title == undefined ? `${date.getDate()}.${date.getMonth()} ${date.getHours()}:${date.getMinutes()}` : params.title;


  axios.post(
    `https://${params.link}/index.php?/api/v2/add_run/${params.suite_id}`,
    {
      suite_id: 1,
      name: title,
      include_all: true,
    },
    {
      auth: {
        username: params.login,
        password: params.apiToken,
      },
    },
  )
    .then((response) => {
      //while (response == undefined) { return 1 };
      numberId = response.data.id
      console.log(`Run "${title}" created with number ${numberId}`)
      //console.log(date.getDate())
    })

}


let resultsForIT = []
let resultForDescribe = []



function getObject(case_id, status_id, comment, defect) {
  return {
    "case_id": case_id,
    "status_id": status_id,
    "comment": comment,
    //"defects": defect
  }
}

function pushGlobalResults() {
  //console.log(numberId, test.title, status, comment)
  let link = `https://${params.link}/index.php?/api/v2/add_results_for_cases/${numberId}`
  //console.log(params.tests.toLowerCase() == 'it'? resultsForIT: resultForDescribe)
  //console.log(link)
  axios.post(
    link,
    {
      "results": params.tests.toLowerCase() == 'it' ? resultsForIT : resultForDescribe
    },
    {
      auth: {
        username: params.login,
        password: params.apiToken,
      },
    },
  ).then(function (response) {
    resp = response;
  })

}

function pushResults(testID, status, comment) {
  console.log(numberId, testID, status)
  axios.post(
    `https://${params.link}/index.php?/api/v2/add_result_for_case/${numberId}/${testID}`,
    {
      status_id: status,
      comment: comment,
    },
    {
      auth: {
        username: params.login,
        password: params.apiToken,
      },
    },
  ).then(function (response) {
    console.log('123')
    resp = true;

  })

}


module.exports = class CustomReporter extends WDIOReporter {
  constructor(options) {
    super(options)
    params = options;
    this.write('Some log line');
    createTestRun()
  }

    onTestPass(test) {
      let id = test.title
      // resultsForIT.push(getObject(test.title, 1, 'This test case is passed'))
    }

    onTestFail(test) {
      // resultsForIT.push(getObject(test.title, 5, `This test case is failed:\n ${JSON.stringify(test.errors, null, 3)}`))
    }

    onTestSkip(test) {
      //resultsForIT.push(getObject(test.title, 4, 'This test case is skipped'))
    }
    

    onSuiteEnd(test) {
      // console.log(test)
      // fs.writeFileSync('./filename.json',JSON.stringify(test,null,1))
      //resultForDescribe.push(getObject(test.title, 1, 'This test case is passed'))
      //     let results = `${test.fullTitle}`;
      //  console.log((results.split(' ')[0]).replace('C',''))
      //let numberOfCase = test.fullTitle.split(' ')[0].replace('C', '')
      //console.log(numberOfCase);
      //let status;

      resp = undefined;
      this.sync(test)

  
    }
    onSuiteStart(suite) {
      //  console.log(suite)
    }

    onRunnerEnd() {
      // this.sync()
    }

    sync(test) {
      let values = new Object({
        'general': 0,
        'passed': 0,
        'failed': 0,
        'skipped': 0,
        'errors': []
      })

      async.each(test.tests, function (logs, callback) {
        switch (logs.state) {
          case 'failed': values.failed = values.failed + 1;
            // values.errors.push(logs)
            values.errors.push(`Failed on : ${logs.title} \n ${JSON.stringify(logs.errors, null, 1)}`)
            break;
          case 'passed': values.passed = values.passed + 1;
            break;
          case 'skipped': values.skipped = values.skipped + 1;
            break;
        }
        callback()
      })
      if (values.failed != 0) {
        values.general = 5;
      }
      else if (values.passed == 0 && values.skipped != 0) {
        values.general = 4;
      }
      else {
        values.general = 1;
      }
      pushResults((test.fullTitle.split(' '))[0].replace('C', ''), values.general, JSON.stringify(values, null, 1))

    };
  
    get isSynchronised() {
      return resp !== undefined
    }

  };



