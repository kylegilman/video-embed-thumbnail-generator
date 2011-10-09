<?php  

header('content-type: image/jpeg');  

function imagecopymerge_alpha($dst_im, $src_im, $dst_x, $dst_y, $src_x, $src_y, $src_w, $src_h, $pct){
        $opacity=$pct;
        // getting the watermark width
        $w = imagesx($src_im);
        // getting the watermark height
        $h = imagesy($src_im);
        
        // creating a cut resource
        $cut = imagecreatetruecolor($src_w, $src_h);
        // copying that section of the background to the cut
        imagecopy($cut, $dst_im, 0, 0, $dst_x, $dst_y, $src_w, $src_h);
        // inverting the opacity
        $opacity = 100 - $opacity;
        
        // placing the watermark now
        imagecopy($cut, $src_im, 0, 0, $src_x, $src_y, $src_w, $src_h);
        imagecopymerge($dst_im, $cut, $dst_x, $dst_y, $src_x, $src_y, $src_w, $src_h, $opacity);
    } 


$watermark = imagecreatefrompng('AndroidPlay.png');  
$watermark_width = imagesx($watermark);  
$watermark_height = imagesy($watermark);  
$image = imagecreatetruecolor($watermark_width, $watermark_height);  
$image = imagecreatefromjpeg($_GET['src']);
$size = getimagesize($_GET['src']);  
$dest_x = $size[0] / 2 - ($watermark_width / 2) ;  
$dest_y = $size[1] / 2 - ($watermark_height / 2);  
imagecopymerge_alpha($image, $watermark, $dest_x, $dest_y, 0, 0, $watermark_width, $watermark_height, 0);  
imagejpeg($image);  
imagedestroy($image);  
imagedestroy($watermark);  
?>