<?php

$table = getTable($_REQUEST['tablename']);
$order = $_REQUEST['order'];
$param = $_REQUEST['param'];
$res = '';
// server, user, pass
$link = mysql_connect("server", "user", "pass") or die (mysql_error());
mysql_select_db("yourdb", $link); 

if($order == 'dellrow') {
	$sql = "DELETE FROM ".$table." WHERE ".$param['id']." = ".$param['idval'];
	$res = mysql_query($sql, $link);
	if($res === false) {
		getError($sql);
	} else {
		$res = array("SQLSTATE" => 'Ok', $param['id'] => $param['idval']);
	}
}
elseif($order == 'addrow') {
	$sql = "INSERT INTO $table (id) VALUES (NULL); ";
	$res = mysql_query($sql, $link);
	$sql = "SELECT MAX(".$param['id'].") as ".$param['id']." FROM $table";
	$res = mysql_query($sql, $link);
	if($res === false) {
		$res = getError($sql);
	} else {
		$res = mysql_fetch_assoc($res);
	}
}
elseif($order == 'update') {
	$sql = "UPDATE ".$table." SET ".$param['col']."  = '".$param['value']."' WHERE ".$param['id']." = ".$param['idval'];
	$res = mysql_query($sql, $link);
	if($res === false) {
		$res = getError($sql);
	} else {
		$res = array("SQLSTATE" => 'Ok', $param['id'] => $param['idval']);
	}
}

mysql_close();
$data = json_encode($res);
header('content-type: application/json');
echo $data;

function getError($sql) {
	if(($errors = mysql_error()) != null) {

		$res = array('SQLERROR' => array('mysql_error' =>mysql_error(), 'code' => mysql_errno()), "query" => $sql);

	}
	return $res;
}
// Associate your simpletable to real database table !
function getTable($table) {
	if($table == 'Simple Table') {
		$table = 'yourtable';
	}
	elseif($table == '') {

	}
	return $table;
} ?>