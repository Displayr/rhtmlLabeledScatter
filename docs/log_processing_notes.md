```

kylez ~/projects/numbers/scatter 🌿  VIS-513
# cat docs/logs/VIS-513-before-dec11.orig.log | grep duration | grep renderContentPage > docs/logs/VIS-513-before-dec11.stats.orig.log
kylez ~/projects/numbers/scatter 🌿  VIS-513
# cat docs/logs/VIS-513-668b8dbf-dec11.orig.log | grep duration | grep renderContentPage > docs/logs/VIS-513-668b8dbf-dec11.stats.orig.log

```

Then run some find/replace:

    '^.*INFO: http://localhost:9000/js/renderContentPage.js \d+:\d+ ' -> ''
    '^"(.+)"$' -> '$1'
    '\\"' -> '"'

Now make into a single json object with a key called tests that is an array of the rows from previous. Must seperate each line with ,

Rename file to json    
    
interesting stats to compare

independent:
* min duration
* max duration
* average duration
* median duration
* min pass rate
* max pass rate
* average pass rate
* median pass rate

covariant:
* total delta duration
* total delta pass rate
* list of A beats B duration by more than X%
* list of B beats A duration by more than X%
* list of A beats B pass rate by more than X%
* list of B beats A pass rate by more than X%

first pass: use positional index as identifier
after: incorporate scenario into stats and use as identifier
  * regen local link
  
  