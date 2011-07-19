<?php
error_reporting(E_ALL);

//require_once "Net/Ping.php";
/*require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata_Photos');
Zend_Loader::loadClass('Zend_Gdata_ClientLogin');
Zend_Loader::loadClass('Zend_Gdata_AuthSub');*/

if (array_key_exists("l", $_GET)) $l = urldecode($_GET["l"]);

class Pic {
	public $filename;
	public $caption;

	public function __construct($f, $c) {
		$this->filename = $f;
		$this->caption = $c;
	}

	public function toJSON() {
		return '{"filename": "'.$this->filename.'", "caption": "'.$this->caption.'"}';
	}
}

class Album {
	public $name;
	public $loc;
	public $cover;
	public $pics;

	/*public function __construct($n, $c, $l) {
		$this->name = $n;
		$this->cover = $c;
		$this->pics = array();
		$this->loc = $l;
		$this->grabPics($l);
	}*/

	public function __construct($l) {
		$this->loc = $l;
		$this->pics = array();
		$this->loadAlbum();
	}

	private function loadAlbum() {
		// TODO: Look for a picasa.ini first!
		$this->name = basename($this->loc);
		$this->cover = 0;
		$this->loadPics($this->loc);
	}

	//private function loadPicasaAlbum() {
	//}

	private function loadPics($l) {
		if ($handle = opendir($l)) {
			while (false !== ($file = readdir($handle))) {
				if ($file != "." && $file != ".." && !is_dir($l.'/'.$file)) 
					if ($file != ".picasa.ini") {
						$exif = exif_read_data($l.'/'.$file, 0, true);
						echo $file.":<br />\n";
						foreach ($exif as $key => $section) {
							foreach ($section as $name => $val) {
								echo "$key.$name: $val<br />\n";
							}
						}

					}
						
					$this->addPic(new Pic($file, "Test"));
			}
	
			closedir($handle);
		}
	}

	public function addPic($p) {
		array_push($this->pics, $p);
	}

	public function getPic($i) {
		return $this->pics[$i];
	}


	public function toJSON() {
		$json = '{"name": "'.$this->name.'", "cover": '.$this->cover.', "pics": [';
		$num_pics = count($this->pics);
		for($j = 0; $j < $num_pics; $j++) {
			if ($j > 0) $json .= ",";
			$json .= $this->pics[$j]->toJSON();
		}
		$json .= ']}';
		return $json;
	}
}

// Retrieve all albums
$albums = array();
//readdir($l) looking for directories
array_push($albums, new Album($l));

//header('Content-type: application/javascript');
echo '[';
//foreach ($albums as $album)
	//echo $album->toJSON();
echo ']';
?>
