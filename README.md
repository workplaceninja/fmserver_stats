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


# Features
1.  Ability to expand the time range to a couple days.

The default view shows you the last 240 snapshots (2 hours with 30 second intervals), but you can move the top scroller to show the last 5000 snapshots.  If you want to go back even further, you can edit the stats.php file variable $number_of_lines.  (Doing so will slow down the call.)

2.  Easily toggle on and off the data points you want to see.

3.  Set the refresh rate at the bottom.

If you want to see less than 30 seconds, you must set FileMaker Server to collect more snapshots.


