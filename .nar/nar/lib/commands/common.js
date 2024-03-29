// Generated by LiveScript 1.3.1
var progress, ref$, echo, logError, exit, toKb, isUrl, extend, archiveName, _;
progress = require('progress');
ref$ = require('../utils'), echo = ref$.echo, logError = ref$.logError, exit = ref$.exit, toKb = ref$.toKb, isUrl = ref$.isUrl, extend = ref$.extend, archiveName = ref$.archiveName, toKb = ref$.toKb;
module.exports = _ = {
  echo: echo,
  exit: exit,
  toKb: toKb,
  isUrl: isUrl,
  extend: extend,
  archiveName: archiveName,
  createBar: function(){
    return new progress('[:bar] :percent :etas', {
      total: 1,
      width: 30
    });
  },
  updateBar: function(bar){
    return function(value){
      bar.curr = value;
      try {
        return bar.render();
      } catch (e$) {}
    };
  },
  onDownload: function(){
    return echo(
    'Downloading archive...');
  },
  onStart: function(){
    return echo(
    "Reading archive...");
  },
  onProgress: function(bar){
    return function(state){
      if (bar.total === 1) {
        bar.total = state.total;
        return bar.start = new Date(), bar;
      } else {
        return _.updateBar(bar)(
        state.received);
      }
    };
  },
  onEntry: function(action){
    return function(it){
      return echo(
      (action + " [").green + (toKb(
      it.size) + " KB").cyan + ("] " + (it.path || it.name || '')).green);
    };
  },
  onArchive: function(debug, verbose){
    return function(it){
      if (!(debug && verbose)) {
        return echo(
        "Extract [" + it.type.cyan + "] " + (it.name || ''));
      }
    };
  },
  onError: function(debug){
    return function(err, code){
      echo(
      logError(err, debug));
      return exit(
      code || 1)();
    };
  },
  onExtract: function(it){
    return echo(
    "Extract [" + it.type.cyan + "] " + (it.name || ''));
  },
  onDownloadEnd: function(bar){
    return function(){
      return echo(
      _.updateBar(
      bar)(
      bar.total));
    };
  }
};
