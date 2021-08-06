# Install
```npm i testrail-wdio```

# Using
In wdio config file u have to do next:

```
const CustomReporter = require('testrail-wdio')


const wdioConfig = {
...
reporters: 
        [[CustomReporter, {
        suite_id:1,
        link:'link to your testrail <title>.testraile.io or other',
        login:'login',
        apiToken: 'password or api token,
        }]]
...
}

```
## Info
This reporter pushes results after avery test suite (describe or contex bloks),
using Axios to create http requests 