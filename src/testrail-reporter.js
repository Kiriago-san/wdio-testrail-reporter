"use strict";
/// <reference types="node" />
var Testrail = require('testrail-api');
//const WDIOReporter = require('@wdio/reporter');
const WDIOReporter = require("@wdio/reporter").default;
const axios = require('axios');
const async = require('async')
let numberId,
  params,
  resp;
let resultsForIT = []



function getObject(case_id, status_id, comment, defect) {
  return {
    "case_id": case_id,
    "status_id": status_id,
    "comment": comment,
  }
}

function pushGlobalResults() {
  resp = undefined;

  let link = `https://${params.link}/index.php?/api/v2/add_results_for_cases/${numberId}`
  axios.post(
    link,
    {
      "results": resultsForIT
    },
    {
      auth: {
        username: params.login,
        password: params.apiToken,
      },
    },
  ).then((response) => {
    resp = true;
  })

}

function pushResults(testID, status, comment) {
  resp = undefined;
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
    resp = true;
  })

}


module.exports = class CustomReporter extends WDIOReporter {
  constructor(options) {
    super(options)
    params = options;
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
        numberId = response.data.id
        this.write(`Run "${title}" created with number ${numberId}`);
      })
  }

  onTestPass(test) {
    if (params.tests) {
      resultsForIT.push(getObject((test.title.split(' '))[0].replace('C', ''), 1, 'This test case is passed'))
    }
  }

  onTestFail(test) {
    if (params.tests) {
      resultsForIT.push(getObject((test.title.split(' '))[0].replace('C', ''), 5, `This test case is failed:\n ${JSON.stringify(test.errors, null, 3)}`))
    }
  }

  onTestSkip(test) {
    if (params.tests) {
      resultsForIT.push(getObject((test.title.split(' '))[0].replace('C', ''), 4, 'This test case is skipped'))
    }
  }

  onSuiteEnd(test) {
    if (params.tests == undefined) {
      this.sync(test, true)
    }
  }


  onRunnerEnd() {
    if (params.tests != undefined) {
      this.sync();
    }
    this.write('\nThe results are pushed!')
  }

  sync(test, isSuite = false) {
    if (isSuite) {
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
    }
    else {
      pushGlobalResults();
    }
  };

  get isSynchronised() {
    return resp !== undefined
  }

};
