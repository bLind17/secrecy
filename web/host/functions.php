<?php

// Program to display URL of current page. 
function getGameURL()
{
	if(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') 
		$link = "https"; 
	else
		$link = "http"; 

	$link .= "://"; 

	// Append the host to URL
	$link .= $_SERVER['HTTP_HOST']; 
	
	// Append the folder structure to URL
	$link .= $_SERVER['REQUEST_URI']; 
		
	// Remove "host" subfolder
	$folder_name = "host";
	$link = substr_replace($link ,"", (strlen($folder_name) + 1) * -1);
	return $link; 
}

?>