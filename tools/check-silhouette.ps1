param($json,$out)
Add-Type -AssemblyName System.Drawing
$src=[System.Drawing.Bitmap]::FromFile("C:\CLAUDE\KURIO-ADS\public\products\a-moon-jar\01-cover.jpg")
$n=1000; $b=New-Object System.Drawing.Bitmap $n,$n; $g=[System.Drawing.Graphics]::FromImage($b); $g.DrawImage($src,0,0,$n,$n)
$d=Get-Content $json -Raw | ConvertFrom-Json
$pts=@(); foreach($p in $d.points){ $pts+= New-Object System.Drawing.PointF ([float]($p[0]/3)),([float]($p[1]/3)) }
$pen=New-Object System.Drawing.Pen ([System.Drawing.Color]::Red),2; $g.DrawPolygon($pen,[System.Drawing.PointF[]]$pts)
$b.Save($out,[System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $b.Dispose(); $src.Dispose()
