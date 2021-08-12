# Install
```npm i testrail-wdio-reporter -D```

# Using
In wdio config file u have to do next:

```
const CustomReporter = require('testrail-wdio-reporter')


const wdioConfig = {
...
reporters: 
        [[CustomReporter, {
        suite_id: 1, //number of your suite
        link: 'link to your testrail <title>.testraile.io or other',
        login: 'login',
        apiToken: 'password or api token,
         tests:'it' /* an optional parameter, if present, generates a report after each IT block if not, generate report after each suite (describe/context block)  */
        }]]
...
}

```
## Info
This reporter pushes results after avery test suite (describe or contex blocks),
using Axios to create http requests.

The tests titles (it block or suite) must have a title with number of test case, for example:

```
describe('some suite',()=>{
        it('C1 test case 1',()=>{
                //test
        })

        it('C2 test case 1',()=>{
                //test
        })
})
```
or
```
describe('C1 some test case',()=>{
        it('step 1 of test case',()=>{
                //test
        })

        it('step 2 of test case',()=>{
                //test
        })
})
```
