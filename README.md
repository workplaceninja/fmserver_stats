# fmserver_stats
PHP replacement for the missing FileMaker 17+ server statistics

FileMaker Server 17 removed the useful Statistics pane for server stats like Elapsed Time, Cache Hit %, etc.  This brings it back, and in a more improved way.

It actually works with Server 16 - 18, and might work with earlier versions (untested).


![FileMaker Server Stats Image](/css/screenshot.png?raw=true "")


# Installation
1.  On the FileMaker Server, make sure that server logging is turned on.
      In 16 and below:
        * Go to the Admin Console, go to Database Server, then make sure Usage Statistics is checked.
        * In the same panel, set the Collection Interval to whatever you desire (30 sec default).
      In 17+:
        * Open a command line and enter the following:
          fmsadmin enable serverstats
          fmsadmin set serverconfig statsinterval=30
          
2.  Copy the file php/serverstats/stats.php over to the FileMaker Server.
      In Windows:
        * C:/Program Files/FileMaker/FileMaker Server/HTTPServer/conf/serverstats/
      In OS X:
        * /Library/FileMaker Server/HTTPServer/htdocs/serverstats/
        
3.  Edit the $url in your js/serverstats.js file.
        
4.  Host index.html, css/*, js/*, and amcharts/* on a PHP server of your choosing.
    (It can also be in the FileMaker Server HTTPServer folder.)
    
That should be it.  Load up http://path_to_serverstats/ and you should see your FileMaker Server's statistics.


# Warning
This is untested on an OS X server, so there might be a few things to tweak to get it working.
