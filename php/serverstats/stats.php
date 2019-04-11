<?php
	header('Access-Control-Allow-Origin: *');
	
	$number_of_lines = 5000;
	
	
	
	if ( function_exists ('getParam') === FALSE ) {
		function getParam($p) {
			return (isset($_REQUEST[$p]) ? $_REQUEST[$p] : '');
		}
	}
	
	
	function GetFileMakerLog($type)
	{
		global $number_of_lines;
		
		$logPaths = array();
	
		// Location of your logs directory. If it's different for your server, change it here.
		if (stristr(PHP_OS, 'darwin')) {					  										  // Check before 'win' since 'win' is in 'darwin'!
			$logBase = '/Library/FileMaker Server/Logs/';
		}
		else if (stristr(PHP_OS, 'win')) {
			$logBase = 'C:\Program Files\FileMaker\FileMaker Server\Logs\\';
		}
		else {
			$logBase = ''; // Cloud? Not sure what the path is...
		}
	
		if ($logBase != '') {																		 // Define the paths to the log files in the OS
			$logPaths = array(	'fmdapi'       => $logBase .'fmdapi.log',
								'access'       => $logBase .'Access.log',
								'event'        => $logBase .'Event.log',
								'stderr'       => $logBase .'stderr',
								'stdout'       => $logBase .'stdout',
								'topcallstats' => $logBase .'TopCallStats.log',
								'wpedebug'     => $logBase .'wpe_debug.log',
								'wpe'          => $logBase .'wpe.log',
								'server'       => $logBase .'Stats.log'
							);
	
			$logType = strtolower($type);
			$logPath = array_key_exists($logType, $logPaths) ? $logPaths[$logType] : '';
	
			if ($logPath != '') {
				echo ReadFromEndByLine($logPath, $number_of_lines);
				exit;
			}
			else {
				echo 'Error - bad path';
			}
		}
		else {
			echo 'Error - unknown host type';
		}
	}
	
	
	$type = getParam('type');
	GetFileMakerLog($type);
	
	
	function ReadFromEndByLine($filepath, $lines = 1, $adaptive = true) {
		// Open file
		$f = @fopen($filepath, "rb");
		if ($f === false) return false;
		// Sets buffer size, according to the number of lines to retrieve.
		// This gives a performance boost when reading a few lines from the file.
		if (!$adaptive) $buffer = 4096;
		else $buffer = ($lines < 2 ? 64 : ($lines < 10 ? 512 : 4096));
		// Jump to last character
		fseek($f, -1, SEEK_END);
		// Read it and adjust line number if necessary
		// (Otherwise the result would be wrong if file doesn't end with a blank line)
		if (fread($f, 1) != "\n") $lines -= 1;
		
		// Start reading
		$output = '';
		$chunk = '';
		// While we would like more
		while (ftell($f) > 0 && $lines >= 0) {
			// Figure out how far back we should jump
			$seek = min(ftell($f), $buffer);
			// Do the jump (backwards, relative to where we are)
			fseek($f, -$seek, SEEK_CUR);
			// Read a chunk and prepend it to our output
			$output = ($chunk = fread($f, $seek)) . $output;
			// Jump back to where we started reading
			fseek($f, -strlen($chunk), SEEK_CUR);
			// Decrease our line counter
			$lines -= substr_count($chunk, "\n");
		}
		// While we have too many lines
		// (Because of buffer size we might have read too many)
		while ($lines++ < 0) {
			// Find first newline and remove all text before that
			$output = substr($output, strpos($output, "\n") + 1);
		}
		// Close file and return
		fclose($f);
		return trim($output);

	}

?>
