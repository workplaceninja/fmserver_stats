# fmserver_stats v1.3.6
Web replacement for the missing FileMaker 17+ server statistics

FileMaker Server 17 removed the useful Statistics pane for server stats like Elapsed Time, Cache Hit %, etc.  This brings it back, and in a more improved way.

It also allows you to graph client and top call statistics on a timeline.  You choose the plot point, and it'll show you by default the top 20 clients in that category.

It works with Server 16 - 18, and might work with earlier versions (untested).


![FileMaker Server Stats Image](/css/screenshot_server_2.png?raw=true "")

![FileMaker Client Stats Image](/css/screenshot_client_2.png?raw=true "")

![FileMaker Top Call Stats Image](/css/screenshot_topcalls_2.png?raw=true "")


# Installation
1. On the FileMaker Server, make sure that server logging is turned on.

      In 16 and below:
      
        * Go to the Admin Console, then Database Server      
        * Enable Usage Statistics, Client Statistics, and Top Call Statistics (if desired)
        * Set the Collection Interval to whatever you desire (30 sec default)
        
      In 17+:
      
        * Open a command line and enter the following (as desired):
          fmsadmin enable serverstats
          fmsadmin enable clientstats
          fmsadmin enable topcallstats
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



# Warnings
This is untested on an OS X server, so there might be a few things to tweak to get it working.

For client or top call statistics, you have to re-enable them in FileMaker Server each time the server is restarted.  You could set up a Task Schedule to enable via command line every so often to have it automatically start up.  (Server statistics will stay enabled.)



# Features
1.  Ability to expand the time range of the stats.

The default view shows you the last 240 snapshots (2 hours with 30 second intervals), but you can move the top scroller to show the last 2,880 snapshots.  If you want to go back even further, you can edit the snapshots variable in serverstats.js.  (Doing so will slow down the calls to FM Server.)

(For the client or top call stats, you will get 10x the number of snapshots.  This is because there are multiple lines per date.)

2.  Easily toggle on and off the data points you want to see.

3.  Set the refresh rate at the top.

4.  Plot client statistics on a graph.  (Choose from several plot points.)

5.  Plot top call statistics on a graph.  (Choose from several plot points and groupings.)

6.  Enable Log Scale, making the Y axis logarithmic (10, 100, 1000, 10000, etc)

7.  Filter down to any text

If you want to see snapshots more frequently than every seconds, you must change these settings in FileMaker Server to collect more snapshots.


