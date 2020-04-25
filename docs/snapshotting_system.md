
Applitools Replacement Summary:
---
* Using local snapshotting and comparison
* produces a saveable baseline of images
* produces one image per diff
* no workflow for inspecting, must be done out of band (no applitools UI)
* diffing algorithm is not as advanced as applitools
* open source: 3 components:
  * jest : test runner : maintained by react and other major online communities
  * jest-image-snapshot : the jest integration and state manager : maintained by american express
  * pixelmatch : the actual image diffing library : looks mature, 5 years stable and actively maintained : not sure who backs it

How the new system works and how is it different from the Applitools setup
---

#### Summary 
With applitools it all just worked.
The new system has more moving parts so the user needs to be more like a technician.
This is OK for me but I the next person will struggle without adequate documentation and handover is performed.

The new system has some pros and cons when compared to the existing applitools based system. In summary:
* (pro) new system performs diffs locally, so feedback is much faster
* (con) new system is responsible for storage of the snapshots and diffs, so we need to manage all these files (and versions of files) somehow
    * this poses special challenges when trying to populate and inspect snapshots that are meant to be compared in the remote travis CI environment
    * my solution for this is simple but requires an AWS account and a small (~$1 / month) spend
* (con) new systems diff algorithm is not as sophisticated as applitools. It is clear that applitools has spent a lot of work on the guts of their diff algorithm
* (pro) underlying libraries that drive the test and browser automation are newer, faster, more reliable, more fit for purpose (this is not an applitools thing this is just me spending time making things better)

#### static snapshots
---
* In the repo there are sets of widget configs and sets of test plans that define "render this config with this dimensions", or more complex "merge these two configs then render with these dimensions" <-- this has not changed
* The 'jest' test driver loads each test in the test plan, then takes a named snapshot using the 'jest-image-snapshot' jest plugin. If a snapshot doesn't already exist for that name, then the plugin simply saves the image. If a snapshot does exist for that name, then the plugin uses 'pixelmatch' to compare the existing and new snapshot. If the two images are the same, the test passes. If they are different the test fails and a "diff" image is saved, which is a png showing the old, the new, and a diff.

#### Interactions Tests + Snapshots
---
* These work similar to static snapshots except the test setup is more complex. In the static scenario we simply load the widget. In the interaction scenarios we load the widget, sometimes with an initial config, then interact with it, and we take snapshots at various stages throughout the process. The snapshotting works the same

#### Branches and Environments
---
* when the test is run two params are passed : the branch and the env. the defaults are env:local and branch:master. This determines the snapshot directory to use. This allows us to maintain different sets of snapshots for different branches and environments. The other environment that is used is travis.

Why we need different snapshot sets for different environments

* Images have subtle rendering differences between environments, particularly caused by different graphics cards, different OS, and different browsers. We had this issue with Applitools as well.

Why we need different snapshot sets for different branches

During work on VIS-513 I probably went through 10 rounds of changes where I said : ok I need to see what effect this specific change will have. Having different snapshot sets for master and for VIS-513 allows me to preserve what master looks like while I rebaseline the VIS-513 set on each iteration. When I am finally satisfied, then I rebaseline master, and discard the VIS-513 snapshots.

#### The complication of travisCI
---
This is where we have the biggest "new" caused by moving off applitools.

In the applitools setup, regardless if I was running on my local PC or remotely via travisCI, the images were always uploaded to the applitools server, so I didn't have to worry about storage, and in the TravisCI scenario, I didn't have to worry about "how do I get the images off the remote machine".

In the new setup the images are saved to the local disk. In the travisCI case that means the images, and importantly the "diff images", are saved to the disk on the travisCI machine ? I want those images, how do I get them? If I want to fail a build if the snapshots change, I need to have a baseline that was produced in the TravisCI environment; how do I get that baseline ?

So I did some digging and am familiar with this problem from my work at Console. The term for anything produced during a build that you want after the build is complete is a "build artifact". Fortunately Travis CI has solved this for us :) [Potentially] unfortunately, their only solution is to upload the build artifacts to AWS S3 (Amazon Web Services Simple Storage System). Fortunately, I already have a personal account on AWS S3 so it was easy for me to test out this system. It works pretty good. You run a build, then all your images and diffs are uploaded to s3, and a single "sync" command will download all those images onto your local PC. Then you can inspect, and if you are happy, you can update the baseline locally and commit to git, then the next run of Travis you should see a pass with no diffs.

The Travis -> AWS S3 solution was literally this easy. Add this to .travisci file:

    addons:
      artifacts:
        paths:
          - theSrc/test/snapshots/travis

The only potential issues I see here is that Displayr runs a Microsoft Azure solution and there is no Travis Artifact -> Microsoft Azure solution that I could see. It is pretty trivial (just need a CC) to setup AWS, and I estimate the costs of this solution will be around $1-5 / month.

Travis docs : 

* artifcact API https://docs.travis-ci.com/user/uploading-artifacts/
* same info in blog format : https://blog.travis-ci.com/2012-12-18-travis-artifacts

Remaining Work
---

  * BIG Task : move all components out of scatterplot and into rhtmlBuildUtils, and update docs in rhtmlBuildUtils

    * WARNING: move all to buildUtils will require a deeper understanding of Jest
      * this is because jest has some assumptions about where it is being run from and wants to look in its current npm project. If I have project A that has test files that uses rhtmlBuildUtils that uses jest, then by default jest looks in rhtmlBuildUtils for tests and config, not in project A. To solve this will require some digging into JEST.
      * another challenge is that there is no official programmatic interface to JEST. It is built to be invoked from the command line. This is a well documented limitation that is being worked on, but in mean time we are left with hacks as options : https://github.com/facebook/jest/issues/5048

    * Question: should this include the experiment running framework built in scatter plot ?  

    * Task / Question : How do I update existing modified snapshots in snapshots/travis/branch ?    
      * Travis will not override them if they are different unless the -u flag is passed , so how to get travis to accept the changes and save the files ?
      * current process: is delete the snapshots from git, push, allow travis to create snapshots, retrieve via S3, commit to git
      * this is time consuming

    * Task : expose more options to the jest wrappers
      * two approaches here: programmatic invoke JEST (hard), or have wrapper that builds up command line strings and execs out and checks return code      
      * options/objectives to support to expose
        * update snapshots for X
        * update snapshots for all
        * clear all snapshots
        * nested snapshots directory to avoid collisions ?
        * only run these tests
        * echo browser log output
        * headless: --snapshotTesting.puppeteer.headless=0
        * slowmotion: --snapshotTesting.puppeteer.slowMo=60
        * pixelmatch sensitivity: --snapshotTesting.pixelmatch.customDiffConfig.threshold=0.1
        * viewport dimensions
        * matching thresholds and strategy (ie pixel/perccent)
        * snapshots directory

    * Task: document how to use and current limitations of snapshotting solution
      * BRANCH=VIS-513 jest theSrc/test --ci=0 -t subset 

    * Task: Document: AWS bits
      * aws --profile=personal s3 sync s3://travis-scatter-diffs s3
      * all AWS dependencies : S3 bucket + IAM policy + user + keys
      * reproduce AWS setup and document "best practice setup" --> maybe do this for next repo ?

    * Task: Document : this is how to get an easy to process set of snapshot diffs
      * mkdir .tmp/diffs/; for I in `find theSrc/test/snapshots/local/VIS-513 -type d -name __diff_output__`; do cp $I/* .tmp/diffs/; done

    * Task: detect when a widget fails to load and fail loudly  
 
    * Task : Document:
      * this is how to manually invoke pixelmatch to create a diff
        * pixelmatch theSrc/test/snapshots/local/{master,VIS-513}/testPlans/displayr_regression_set8/tsne_perplexity_7-snap.png .tmp/diff.png 0.1

    * Task : Document:
      * I did some playing around and took notes to show the impact of changing the diff sensitivity. See the scatterplot repo and look for ./docs/pixelmatch_threshold_example
             
    * Task / Issue: 
      * my current mechanism for customising config which is to set ENV variables before shelling out then check those ENV variables is unacceptable