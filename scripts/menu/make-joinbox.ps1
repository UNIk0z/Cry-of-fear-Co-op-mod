[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$OutputFile)
# v0.5.1: the picture of the "Join Simon's Story" box. The adapter shows the
# game's computer login panel on the main menu with this picture instead of
# gfx/vgui/puzzle/computer/computer_logon.tga (client-menu.hpp join_box_patches).
# The panel's own text fields and buttons sit at fixed places in the picture:
# fields at (160,204) and (160,231), 239 x 16; Join at (157,320) and Cancel at
# (238,320), 75 x 23; a close box at (478,447), 29 x 29. Drawn here (this
# project's own art): 554 x 480, 24-bit TGA, bottom-left origin, like the original.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$w=554; $h=480
$bmp=New-Object System.Drawing.Bitmap $w,$h,([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint=[System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Black)
function Brush($r,$gg,$b){ New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($r,$gg,$b)) }
function Pen($r,$gg,$b){ New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb($r,$gg,$b)),1 }
# Panel
$g.FillRectangle((Brush 24 24 24),60,110,434,300)
$g.DrawRectangle((Pen 110 110 110),60,110,434,300)
$g.FillRectangle((Brush 120 0 0),61,111,433,3)
$title=New-Object System.Drawing.Font 'Arial',18,([System.Drawing.FontStyle]::Bold),([System.Drawing.GraphicsUnit]::Pixel)
$text=New-Object System.Drawing.Font 'Arial',13,([System.Drawing.FontStyle]::Regular),([System.Drawing.GraphicsUnit]::Pixel)
$small=New-Object System.Drawing.Font 'Arial',11,([System.Drawing.FontStyle]::Regular),([System.Drawing.GraphicsUnit]::Pixel)
$white=Brush 225 225 225; $grey=Brush 150 150 150
$g.DrawString("JOIN SIMON'S STORY",$title,$white,85,135)
$g.DrawString('Type the host''s address. Leave the port empty for 27015.',$small,$grey,86,165)
$right=New-Object System.Drawing.StringFormat; $right.Alignment=[System.Drawing.StringAlignment]::Far
$g.DrawString('Host IP',$text,$white,(New-Object System.Drawing.RectangleF 60,203,92,18),$right)
$g.DrawString('Port',$text,$white,(New-Object System.Drawing.RectangleF 60,230,92,18),$right)
# Field frames (the game's text fields draw inside them)
foreach ($y in 204,231) { $g.FillRectangle((Brush 10 10 10),159,($y-1),241,18); $g.DrawRectangle((Pen 90 90 90),159,($y-1),241,18) }
$g.DrawString('Example: 26.0.0.5   or   26.0.0.5:27016',$small,$grey,160,256)
# Buttons
$center=New-Object System.Drawing.StringFormat; $center.Alignment=[System.Drawing.StringAlignment]::Center; $center.LineAlignment=[System.Drawing.StringAlignment]::Center
foreach ($b in @(@(157,'Join'),@(238,'Cancel'))) {
    $g.FillRectangle((Brush 45 45 45),$b[0],320,75,23); $g.DrawRectangle((Pen 140 140 140),$b[0],320,74,22)
    $g.DrawString($b[1],$text,$white,(New-Object System.Drawing.RectangleF $b[0],320,75,23),$center)
}
# Close box
$g.DrawRectangle((Pen 110 110 110),478,447,28,28)
$g.DrawString('X',$text,$white,(New-Object System.Drawing.RectangleF 478,447,29,29),$center)
$g.Dispose()
# 24-bit uncompressed TGA, rows bottom to top, BGR.
$out=New-Object System.IO.MemoryStream
$header=New-Object byte[] 18; $header[2]=2; $header[12]=[byte]($w -band 255); $header[13]=[byte]($w -shr 8); $header[14]=[byte]($h -band 255); $header[15]=[byte]($h -shr 8); $header[16]=24
$out.Write($header,0,18)
$row=New-Object byte[] ($w*3)
for ($y=$h-1; $y -ge 0; $y--) {
    for ($x=0; $x -lt $w; $x++) { $c=$bmp.GetPixel($x,$y); $row[$x*3]=$c.B; $row[$x*3+1]=$c.G; $row[$x*3+2]=$c.R }
    $out.Write($row,0,$row.Length)
}
$bmp.Dispose()
[IO.File]::WriteAllBytes([IO.Path]::GetFullPath($OutputFile),$out.ToArray())
Write-Output ('Wrote '+$OutputFile+' ('+$out.Length+' bytes)')
