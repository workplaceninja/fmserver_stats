/* CONFIGURATION */

var snapshots = 2880;

var url = '';
// You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/
// and then set the url accordingly.

//url = 'http://fmserver_path/serverstats/stats.php';

/* END CONFIGURATION */




/* FMSERVER_STATS v1.3.6
** written by Christopher Bishop @ FuseFX, Inc.
** created April 12, 2019
** updated April 19, 2019
*/



var chartArr = ['server', 'client', 'topcall'];
var chosencolumnArr = [14, 5, 8];
var defaultlinesArr = [1, 10, 10];
var groupArr = [0, 8, 11];
var topx = 20;
var refinput = 30;
var logarithmic = false;
var filter = '';


// The names of the columns in the chart
var headerArr = [
					[	
						'Timestamp', 'Network KB/sec In', 'Network KB/sec Out', 'Disk KB/sec Read', 'Disk KB/sec Written', 'Cache Hit %', 
						'Cache Unsaved %', 'Pro Clients', 'Open Databases', 'ODBC/JDBC Clients', 'WebDirect Clients', 'Custom Web Clients', 
						'Remote Calls/sec', 'Remote Calls In Progress', 'Elapsed Time/call', 'Wait Time/call', 'I/O Time/call', 'Go Clients'
					],
					[	
						'Timestamp', 'Network Bytes In', 'Network Bytes Out', 
						'Remote Calls', 'Remote Calls In Progress', 'Elapsed Time', 
						'Wait Time', 'I/O Time', 'Client name'
					],
					[
						'Timestamp', 'Start Time', 'End Time', 'Total Elapsed',
						'Operation', 'Target', 'Network Bytes In', 'Network Bytes Out',
						'Elapsed Time', 'Wait Time', 'I/O Time', 'Client name'
					]
				];

// Not important - just internal variable names
var valueArr = [
					[		
						'date', 'netin', 'netout', 'diskread', 'diskwrite', 'cachehit', 
						'cacheunsaved', 'proclients', 'opendbs', 'xdbcclients', 'webdclients', 'cwpclients', 
						'callspersec', 'callsinprog', 'elapsed', 'wait', 'io', 'goclients'
					],
					[		
						'date', 'netin', 'netout',
						'calls', 'callsinprog', 'elapsed', 
						'wait', 'io', 'name'
					],
					[		
						'date', 'start', 'end', 'totalelapsed',
						'operation', 'target', 'netin', 'netout',
						'elapsed', 'wait', 'io', 'name'
					]
				];

// Define the color of the lines on the chart
var colorArr = [
					[
						'#901b52', '#1c72f5', '#eb47f9', '#1f189f', '#0977bf', '#8e713c', 
						'#0f2b1f', '#8abdcc', '#a301d5', '#a099da', '#4b8051', '#a8a4a5', 
						'#f83169', '#4b996f', '#34df9d', '#6b039a', '#da7e52', '#ee9915'
					],
					[
						'#901b52', '#1c72f5', '#eb47f9', 
						'#0f2b1f', '#8abdcc', '#a301d5', 
						'#f83169', '#4b996f', '#34df9d'
					],
					[
						'#901b52', '#1c72f5', '#eb47f9', '#1f189f',
						'#0f2b1f', '#8abdcc', '#a301d5', '#a099da',
						'#f83169', '#4b996f', '#34df9d', '#6b039a',
					]
					
				];
				
var groupByArr = [
					[
						false, false, false, false, false, false,
						false, false, false, false, false, false,
						false, false, false, false, false, false
					],
					[
						false, false, false,
						false, false, false,
						false, false, true
					],
					[
						false, false, false, false,
						true, true, false, false,
						false, false, false, true
					]
				];

// This defines which Y axis to use.  (Charts that display in microseconds will not work well with others.)
var pointArr = [
					[
						0, 1, 1, 1, 1, 2, 
						2, 3, 3, 3, 3, 3, 
						4, 4, 5, 5, 5, 3
					],
					[
						0, 1, 1,
						4, 4, 5,
						5, 5, 0
					],
					[
						0, 0, 0, 5,
						0, 0, 1, 1,
						5, 5, 5, 0
					]

				];

// Set which stats are hidden by default
var hiddenArr = [
					[
						true, true, true, true, true, true, 
						true, true, true, true, true, true, 
						false, false, false, false, true, true
					],
					[
						true, false, false,
						false, false, false,
						false, false, true
					],
					[
						true, true, true, false,
						true, true, false, false,
						false, false, false, true
					]
				];

// Set which stats are disabled (due to unplottable data)
var disabledArr = [
					[
						true, false, false, false, false, false, 
						false, false, false, false, false, false, 
						false, false, false, false, false, false
					],
					[
						true, false, false,
						false, false, false,
						false, false, true
					],
					[
						true, true, true, false,
						true, true, false, false,
						false, false, false, true
					]
				];




function getParam(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// 0 = server stats, 1 = client stats
var chartnum = getParam('chartnum');
if ( chartnum === '' ) {
	chartnum = 0;
} else {
	chartnum = +chartnum;
	setTimeout(function() { document.getElementById('chartnum').value = chartnum; showPlotPoints(chartnum) }, 50);
}

var sn = getParam('snapshots');
if ( sn !== '' ) {
	snapshots = +sn;
}

var ft = getParam('filter');
if ( ft !== '' ) {
	filter = ft;
	document.getElementById('filter').value = filter;
}


if ( url === '' ) {
	window.alert('You must set the url in the serverstats.js file.');
} else {
	var default_snapshots = 240;
	var chartData = [];
	var csv, chart, graphs, valueaxes, nameobj, sortable;
	var startindex, endindex, chartlength;
	
	getStats(1);
	var refint = setInterval(function() {refreshChart();}, refinput * 1000);
}


function reftoggle () {
	var val = +document.getElementById('ref').value;
	if ( val !== refinput ) {
		refinput = val;
		clearInterval(refint);
		refint = setInterval(function() {refreshChart();}, refinput * 1000);
	}
}


function filtertoggle () {
	var val = document.getElementById('filter').value;
	if ( val !== filter ) {
		filter = val;
		chartData = amReformat(csv);
		createChart();
	}
}


function chartnumtoggle () {
	var val = +document.getElementById('chartnum').value;
	if ( chartnum !== val ) {
		chartnum = val;
		getStats(1);
		showPlotPoints(val);
		showGroupBy(val);
	}
}


function plottoggle () {
	var val = +document.getElementById('plotpoints').value;
	if ( chosencolumnArr[chartnum] !== val ) {
		chosencolumnArr[chartnum] = val;
		chartData = amReformat(csv);
		createChart();
	}
}


function groupbytoggle () {
	var val = +document.getElementById('groupby').value;
	if ( groupArr[chartnum] !== val ) {
		groupArr[chartnum] = val;
		chartData = amReformat(csv);
		createChart();
	}
}


function topxtoggle () {
	var val = +document.getElementById('topx').value;
	if ( topx !== val ) {
		topx = val;
		chartData = amReformat(csv);
		createChart();
	}
}


function logarithmictoggle () {
	var val = document.getElementById('logarithmic').checked;
	logarithmic = val;
	chartData = amReformat(csv);
	createChart();
}


function showPlotPoints (val) {
	if ( val > 0 ) {
		buildPlotPoints();
	}
	document.getElementById('plotpoint').className = (val === 0 ? 'chooser hide' : 'chooser show');
}


function buildPlotPoints () {
	var str = '';
	var x = 0, xcount = headerArr[chartnum].length;
	while ( x < xcount ) {
		if ( disabledArr[chartnum][x] === false ) {
			str += '<option value="' + x + '"' + (chosencolumnArr[chartnum] === x ? ' selected="selected"' : '') + '>' + headerArr[chartnum][x] + '</option>';
		}
		x += 1;
	}
	document.getElementById('plotpoints').innerHTML = str;
}


function showGroupBy (val) {
	if ( val > 0 ) {
		buildGroupBy();
	}
	document.getElementById('groupbydiv').className = (val < 2 ? 'chooser hide' : 'chooser show');
}


function buildGroupBy () {
	var str = '';
	var x = 0, xcount = headerArr[chartnum].length;
	while ( x < xcount ) {
		if ( groupByArr[chartnum][x] === true ) {
			str += '<option value="' + x + '"' + (groupArr[chartnum] === x ? ' selected="selected"' : '') + '>' + headerArr[chartnum][x] + '</option>';
		}
		x += 1;
	}
	document.getElementById('groupby').innerHTML = str;
}


function refreshChart () {
	getStats(0);
}


function getStats (fullrefresh) {
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4) {
			if (xmlhttp.status==200) {
				// Success
				csv = xmlhttp.responseText;
				if ( csv.substring(0,5) === 'Error' ) {
					if ( csv === 'Error - bad path' ) {
						errlog('Error loading data from FM Server - You must enable ' + chartArr[chartnum] + ' stats on FileMaker Server.');
					} else {
						errlog('Error loading data from FM Server - You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/"');
					}
				} else {
					chartData = amReformat(csv);
					errlog('');
					if ( fullrefresh === 1 ) {
						createChart();
					} else {
						updateChart();
					}
				}
			} else {
				errlog('Error loading data from FM Server - ' + xmlhttp.status + '.  You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/"');
			}
		}
	};
	
	if ( fullrefresh === 0 ) {
		updateIndexes();
	}
	
	var thisurl = url + '?type=' + chartArr[chartnum] + '&lines=' + snapshots * defaultlinesArr[chartnum] + '&rnd=' + Math.random();
	
	xmlhttp.open("GET", thisurl, true);
	xmlhttp.timeout = 30000;
	xmlhttp.ontimeout = function() { errlog('Timeout retrieving data from FM Server'); };
	xmlhttp.send();
}


function errlog (str) {
	var el = document.getElementById('errlog');
	el.innerText = str;
	var cn = (str === '' ? 'noerror' : 'error');
	if ( el.className !== cn ) {
		el.className = cn;
	}
}


function getClr (str) {
	var tot = 0, n = 0, ncount = str.length;
	while ( n < ncount ) {
		tot += str.charCodeAt(n) * Math.pow(256, n % 3);
		n += 1;
	}
	return toColor(tot);
}


function toColor(num) {
    num >>>= 0;
    var b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16;
    return "rgba(" + [r, g, b].join(",") + ")";
}


function amReformat (csv) {
	var cArr = [];
	var retArr = [];
	var csvlines = csv.split("\n");
	var obj = {};
	nameobj = {};
	
	var todaym10 = new Date();
	todaym10.setDate(todaym10.getDate()-10);
	todaym10 = todaym10.getTime();
	
	
	var n, val, y, ycount = headerArr[chartnum].length;
	var x = 1, xcount = csvlines.length;
	var d, lastd = new Date(csvlines[0].split("\t")[0]);
	var valmin = (logarithmic === true ? 1 : 0);
	
	while (x < xcount) {
		csvcolumns = csvlines[x].split("\t");
		d = new Date(csvcolumns[0]);
		
		obj[valueArr[chartnum][0]] = d;
		
		inc = 0;
		if ( chartnum === 0 || filter === '' ) {
			inc = 1;
		} else {
			y = 0;
			while ( y < ycount ) {
				if ( groupByArr[chartnum][y] === true ) {
					if ( (unescape(encodeURIComponent(csvcolumns[y]))).toLowerCase().indexOf(filter.toLowerCase()) > -1 ) {
						inc = 1;
					}
				}
				y += 1;
			}
		}
		
		if ( inc === 1 ) {
			if ( chartnum === 0 ) {
				y = 1;
				while ( y < ycount ) {
					obj[valueArr[chartnum][y]] = Math.max(0, +csvcolumns[y]);
					y += 1;
				}
			} else {
				n = btoa(unescape(encodeURIComponent(csvcolumns[groupArr[chartnum]])));
				val = +csvcolumns[chosencolumnArr[chartnum]];
				nameobj[n] = (nameobj[n] || 0) + val;
				obj[n] = Math.max(0, val);
			}
			
			if ( chartnum === 0 || (d.getTime() !== lastd.getTime() && d.getTime() > todaym10 ) ) {
				cArr.push(obj);
				obj = {};
			}
		
			lastd = new Date(d);
		}
		x += 1;
	}
	
	if ( chartnum > 0 && typeof(obj[valueArr[chartnum][0]]) !== 'undefined' ) {
		cArr.push(obj);
	}
	
	if ( cArr.length > 1 ) {
		if ( cArr[cArr.length - 1][valueArr[chartnum][0]].getTime() === cArr[cArr.length - 2][valueArr[chartnum][0]].getTime() ) {
			// Remove duplicate date at end
			cArr.pop();
		}
	}
	
	
	
	graphs = [];
	valueaxes = [];
	
	if ( chartnum === 0 ) {
		var y = 1;
		while ( y < ycount ) {
			graphs.push(
				{
					"id": "c" + y,
					"balloonText": "[[title]]: [[value]]",
					"bullet": "round",
					"bulletBorderAlpha": 1,
					"bulletColor": colorArr[chartnum][y],
					"bulletSize": 5,
					"color": colorArr[chartnum][y],
					"lineColor": colorArr[chartnum][y],
					"valueAxis": 'g' + pointArr[chartnum][y],
					"hidden": hiddenArr[chartnum][y],
					"title": headerArr[chartnum][y],
					"valueField": valueArr[chartnum][y],
					"useLineColorForBulletBorder": true
				}
			);
			y += 1;
		}
		
		valueaxes = [
			{
				"logarithmic": logarithmic,
				"treatZeroAs": valmin,
				"id": "g1",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left",
				"offset": 130,
				"gridThickness": 0
			}, {
				"logarithmic": logarithmic,
				"treatZeroAs": valmin,
				"id": "g2",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "right",
				"offset": 70,
				"gridThickness": 0
			}, {
				"logarithmic": logarithmic,
				"treatZeroAs": valmin,
				"id": "g3",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left",
				"offset": 70,
				"gridThickness": 0
			}, {
				"logarithmic": logarithmic,
				"treatZeroAs": valmin,
				"id": "g4",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "right",
				"offset": 0,
				"gridThickness": 0
			}, {
				"logarithmic": logarithmic,
				"treatZeroAs": valmin,
				"id": "g5",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left",
				"offset": 0,
				"gridThickness": 0
			}
		];
		
		retArr = cArr;
	} else {
	

		sortable = [];
		var nameval;
		
		for (nameval in nameobj) {
			sortable.push([nameval, nameobj[nameval]]);
		}
		
		sortable.sort(function(a, b) {
			return b[1] - a[1];
		});
		
		
		// Populate data for clients that have no log for a date
		xcount = cArr.length;
		ycount = Math.min(topx, sortable.length);
		x = 0;
		while ( x < xcount ) {
			retArr.push({});
			retArr[x][valueArr[chartnum][0]] = cArr[x][valueArr[chartnum][0]];
			y = 0;
			while ( y < ycount ) {
				retArr[x][sortable[y][0]] = (typeof(cArr[x][sortable[y][0]]) === "undefined" ? valmin : cArr[x][sortable[y][0]]);
				y += 1;
			}
			x += 1;
		}


		x = 0;
		xcount = sortable.length;
		while ( x < topx && x < xcount ) {
			property = sortable[x][0];
			clr = getClr(property);
			graphs.push(
				{
					"id": property,
					"balloonText": "[[title]]: [[value]]",
					"title": abformat(property),
					"valueField": property,
					"lineAlpha": 0.4,
					"fillAlphas": 0.6,
					"valueAxis": 'g1',
					"color": clr,
					"lineColor": clr,
					"forceGap": true,
					"gapPeriod": refinput * 1.02
				}
			);
			x += 1;
		}
		
		valueaxes = [
			{
				"logarithmic": logarithmic,
				"treatZeroAs": valmin,
				"id": "g1",
				"stackType": "regular",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left"
			}
		];
	}
	return retArr;
}


function abformat (b64) {
	var a = atob(b64);
	var p = a.indexOf(' (');
	if ( p > -1 ) {
		a = a.substring(0, p);
	}
	return a;
}


function updateIndexes () {
	startindex = chart.startIndex;
	endindex = chart.endIndex;
	chartlength = chartData.length;
}


function updateChart () {
	chart.dataProvider = chartData;
	chart.validateData();
	var newlen = chartData.length;
	
	if ( endindex > chartlength - 4 ) {
		//reset zoom to new end
		chart.zoomToIndexes((newlen - (endindex - startindex)) - 1, newlen - 1);
	}
	
	updateIndexes();
}


function createChart () {
	
	chart = AmCharts.makeChart("chartdiv", {
	    "type": "serial",
	    "theme": "light",
	    "marginRight": 80,
		"autoMarginOffset": 20,
		"marginTop": 7,
		"zoomOutOnDataUpdate": false,
		"legend": {
			"horizontalGap": 10,
			"position": "bottom",
			"useGraphSettings": true,
			"markerSize": 10
		},
		"dataProvider": chartData,
		"valueAxes": valueaxes,
		"mouseWheelZoomEnabled": true,
		"graphs": graphs,
		"chartScrollbar": {
			"autoGridCount": true,
			"graph": "c14",
			"scrollbarHeight": 40
		},
		"chartCursor": {
		   "limitToGraph": "c14",
		   "categoryBalloonDateFormat": "MMM D, YYYY JJ:NN:SS"
		},
		"categoryField": valueArr[chartnum][0],
		"categoryAxis": {
			"parseDates": true,
			"minPeriod": "5ss",
			"axisColor": "#DADADA",
			"dashLength": 1,
			"minorGridEnabled": true
		},
		"export": {
			"enabled": true,
			"position": "top-left"
		}
	});
	
	chart.addListener("rendered", zoomChart);
	zoomChart();
	
	updateIndexes();
}


function zoomChart() {
    chart.zoomToIndexes(chartData.length - default_snapshots, chartData.length - 1);
}
