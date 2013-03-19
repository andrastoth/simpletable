<?php
$link = mysql_connect("server", "user", "pass") or die (mysql_error());// server, user, pass
mysql_select_db("yourdb",$link);
$firstrow = true;
$firstrow_data = '';
$sql = "SELECT * FROM yourtable ORDER BY id ASC";
$res = mysql_query($sql,$link);
    while($row = mysql_fetch_assoc($res)) {
        if($firstrow == true) {
            echo '<table id = "simple" ><thead><tr>';
        } else {
            echo '<tr>';
        }
        foreach($row as $key => $value) {
            if($firstrow == true) {
                echo '<th nowrap>'.headDefinier($key).'</th>';
                $firstrow_data = $firstrow_data.'<td data = '.$key.' nowrap>'.typeChecker($value).'</td>';
            } else {
                echo '<td data = '.$key.' nowrap>'.typeChecker($value).'</td>';
            }
        }
        if($firstrow == true) {
            $firstrow = false;
            echo '</tr><tbody>';
            echo '<tr>'.$firstrow_data.'</tr>';
        } else {
            echo '</tr>';
        }
    }
echo '</tbody>';
echo '</table>';
function typeChecker($data) {
if($data instanceof DateTime) {
    $data = $data -> format('Y-m-d H:m:s');
}else{
    $data =$data;//set by your settings  iconv('','',$data);
    }
    return $data;
}
function headDefinier($data) {
$nevek = array('id' => 'ID', 'date' => 'Date', 'location' => 'Location','ip' => 'IP','country_code' => 'Country code',
'country_name' => 'Country name','region' => 'Region','city' => 'City', 'postal_code' => 'Postal code',
'latitude' => 'Latitude', 'longitude' => 'Longitude');
if(isset($nevek[$data])){
    $data = $nevek[$data];
    }
    return $data;
}
mysql_close();
?>
