<?php
error_reporting(E_ALL);

$c = mysql_connect("localhost", "root", "elegreg") or die('Connect: ' . mysql_error());

mysql_select_db('dbcarsharing', $c) or die('Error select_db: ' . mysql_error());

$s = "select t.*, kl.bezeichnung as klasse, tgr.name as tarif_name, tfi.name as tfirma, klfi.name as klfirma\n"
    . " from tarif t inner join klasse kl on kl.id = t.klasse_id \n"
    . " inner join tarifgruppe tgr on tgr.id = t.tarif_id \n "
    . " inner join firma tfi on tfi.id = tgr.firma_id \n"
    . " inner join firma klfi on klfi.id = kl.firma_id \n"
    . " limit 1000"
    ;
    
$q = mysql_query($s, $c) or die("Error: " . mysql_error($c));
$erg = array();

while($d = mysql_fetch_array($q,MYSQL_ASSOC)){
    $erg[] = $d;
}
mysql_close($c);
print(json_encode($erg));
?>
