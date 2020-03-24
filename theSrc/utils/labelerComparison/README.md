# usage Example

Record snapshot logs from Branch A

    jest theSrc/test/runSnapshotTests.jest.test.js -t subset | tee -a ./theSrc/test/utils/labelerComparison/logs/VIS-513-with-perf-optimisations.log
    
Record snapshot logs from Branch A    

    jest theSrc/test/runSnapshotTests.jest.test.js -t subset | tee -a ./theSrc/test/utils/labelerComparison/logs/VIS-513-rc4-without-perf-optimisations.log
    
Process log files

    # node theSrc/test/utils/labelerComparison/bin/log_parser_jest.js 
    ? choose log file 
     ◯ ...
     ◉ VIS-513-rc4-without-perf-optimisations.log
    ❯◉ VIS-513-with-perf-optimisations.log

    # this generates files in the stats folder
    
    # find theSrc/test/utils/labelerComparison/stats/ -mmin -5 # (this bash foo lists files modified within last 5 min)
    theSrc/test/utils/labelerComparison/stats/
    theSrc/test/utils/labelerComparison/stats//VIS-513-rc4-without-perf-optimisations.stats.json
    theSrc/test/utils/labelerComparison/stats//VIS-513-with-perf-optimisations.stats.json
    
Compare the two stats files
    
    kylez ~/projects/numbers/scatter 🌿  VIS-513-rc4
    # node theSrc/test/utils/labelerComparison/bin/compare_two_test_runs.js 
    ? choose baseline file VIS-513-rc4-without-perf-optimisations.stats.json
    ? choose candidate file (Use arrow keys)
      ... 
    ❯ VIS-513-with-perf-optimisations.stats.json
    
Have a look at the output (this output suggests the perf optimisations had a good impact on runtime):
    
    using VIS-513-rc4-without-perf-optimisations as baseline
    using VIS-513-with-perf-optimisations as candidate
    
                                baseline : candidate
       min_duration           : 107      : 57       
       max_duration           : 1455     : 1172     
       average_duration       : 448      : 320      
       median_duration        : 391      : 272      
       min_pass_rate          : 0.037    : 0.037    
       max_pass_rate          : 0.113    : 0.113    
       average_pass_rate      : 0.073    : 0.073    
       median_pass_rate       : 0.073    : 0.073    
       min_accept_worse_rate     : 0.002    : 0.002    
       max_accept_worse_rate     : 0.005    : 0.005    
       average_accept_worse_rate : 0.004    : 0.004    
       median_accept_worse_rate  : 0.004    : 0.004   
      
    duration ratio frequencies (candidate / baseline):
     0.6: 4
     0.7: 12
     0.8: 19
     0.9: 1
    
    pass rate delta frequencies (candidate - baseline):
     0.000: 36
    
    accept worse rate delta frequencies (candidate - baseline):
     0.000: 36
    
    counts:
     baseline beats checkpoint on duration by more than 10%: 0
     baseline beats checkpoint on duration by more than 25%: 0
     baseline beats checkpoint on duration by more than 50%: 0
     checkpoint beats baseline on duration by more than 10%: 36
     checkpoint beats baseline on duration by more than 25%: 30
     checkpoint beats baseline on duration by more than 50%: 0
     baseline beats checkpoint on pass_rate by more than 10%: 0
     baseline beats checkpoint on pass_rate by more than 25%: 0
     baseline beats checkpoint on pass_rate by more than 50%: 0
     checkpoint beats baseline on pass_rate by more than 10%: 0
     checkpoint beats baseline on pass_rate by more than 25%: 0
     checkpoint beats baseline on pass_rate by more than 50%: 0
     baseline beats checkpoint on accept_worse_rate by more than 10%: 0
     baseline beats checkpoint on accept_worse_rate by more than 25%: 0
     baseline beats checkpoint on accept_worse_rate by more than 50%: 0
     checkpoint beats baseline on accept_worse_rate by more than 10%: 0
     checkpoint beats baseline on accept_worse_rate by more than 25%: 0
     checkpoint beats baseline on accept_worse_rate by more than 50%: 0     
    

    
        
