/*
 *  pgn4web javascript chessboard
 *  copyright (C) 2009-2013 Paolo Casaschi
 *  see README file and http://pgn4web.casaschi.net
 *  for credits, license and more details
 */

//
// example of external javascript library enhancing pgn4web:
// lookpup player info on the FIDE website based on FIDE id or name
//

"use strict";

function openFidePlayerUrl(name, FideId) {
  if (FideId) { window.open("http://ratings.fide.com/card.phtml?event=" + escape(FideId)); }
  else if (name) { window.open("http://ratings.fide.com/seek.phtml?idcode=&name=" + name + "&offset=0"); }
}

function customShortcutKey_Shift_1() {
  openFidePlayerUrl(gameWhite[currentGame], customPgnHeaderTag('WhiteFideId'));
}

function customShortcutKey_Shift_2() {
  openFidePlayerUrl(gameBlack[currentGame], customPgnHeaderTag('BlackFideId'));
}

