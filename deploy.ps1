deployPath = "\\tn1mfg-ws-02.battery.mfg\c$\Intranet\Taskmaster"
appOffline = Join-Path deployPath "app_offline.htm"

Set-Content -Path appOffline -Value "<html><body><h1>Maintenance in progress</h1></body></html>" -Encoding UTF8 -Force

dotnet publish -c Release -o deployPath

Remove-Item -Path appOffline -Force