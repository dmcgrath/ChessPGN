# pgn4web javascript chessboard
# copyright (C) 2009-2014 Paolo Casaschi
# see README file and http://pgn4web.casaschi.net
# for credits, license and more details

# bash script to package the pgn4web release
# run as "bash script.sh"

set +o posix

pgn4webVer=$(grep "var pgn4web_version = " pgn4web.js | awk -F "\'" '{print$2}')

if [ "$1" == "full" ]; then
  pgn4webFilename="pgn4web-full-$pgn4webVer.zip"
else
  pgn4webFilename="pgn4web-$pgn4webVer.zip"
fi

if [ -e ../"$pgn4webFilename" ]; then
  echo "Error: pgn4web package already exists (../$pgn4webFilename)"
  exit 1
fi

pgn4webDirectory="pgn4web-$pgn4webVer"
if [ -e ../"$pgn4webDirectory" ]; then
  echo "Error: pgn4web directory already exists (../$pgn4webDirectory)"
  exit 1
fi

ln -s "$(pwd)" ../"$pgn4webDirectory"

cd ..
zip -9r "$pgn4webFilename" "$pgn4webDirectory" -x *.svn/* -x "$pgn4webDirectory"/jsl.conf -x "$pgn4webDirectory"/live-games-app* -x "$pgn4webDirectory"/live/\* -x "$pgn4webDirectory"/live/ -x "$pgn4webDirectory"/paolo/\* -x "$pgn4webDirectory"/paolo/

if [ "$1" == "full" ]; then
  zip -9r "$pgn4webFilename" "$pgn4webDirectory"/live-games-app* "$pgn4webDirectory"/live/* -x *.svn/*
else
  zip -9r "$pgn4webFilename" "$pgn4webDirectory"/live/*.html "$pgn4webDirectory"/live/*.pgn "$pgn4webDirectory"/live/live-simulation.sh -x *.svn/*
fi

rm $pgn4webDirectory

