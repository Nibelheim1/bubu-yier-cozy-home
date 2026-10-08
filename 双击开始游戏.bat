@echo off
for %%F in ("%~dp0release\*.html") do start "" "%%~fF"
