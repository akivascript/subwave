// Generated by LiveScript 1.3.1
var path, nar, common, Table, program, join, basename, echo, onError, toKb, archiveName, list, mapEntry;
path = require('path');
nar = require('../nar');
common = require('./common');
Table = require('cli-table');
program = require('commander');
join = path.join, basename = path.basename;
echo = common.echo, onError = common.onError, toKb = common.toKb, archiveName = common.archiveName;
program.command('list <archive>').description('\n  List archive files').usage('<archive> [options]').option('-d, --debug', 'Enable debud mode. More information will be shown').option('--no-table', 'Disable table format output').on('--help', function(){
  return echo('  Usage examples:\n\n    $ nar list app.nar\n    $ nar list app.nar --no-table\n\t');
}).action(function(){
  return list.apply(this, arguments);
});
list = function(archive, options){
  var debug, table, tableList, opts, onInfo, onEntry, onEnd, list, e;
  debug = options.debug, table = options.table;
  tableList = new Table({
    head: ['Name', 'Destination', 'Size', 'Type']
  });
  opts = {
    path: archive
  };
  onInfo = function(it){
    return echo(
    "Package: " + archiveName(
    it));
  };
  onEntry = function(it){
    if (table) {
      return tableList.push(
      mapEntry(
      it));
    } else {
      return echo(
      join(it.dest, it.archive) + (" (" + toKb(
      it.size) + " KB)").cyan);
    }
  };
  onEnd = function(){
    if (table) {
      return echo(
      tableList.toString());
    }
  };
  list = function(){
    return nar.list(opts).on('error', onError(
    debug)).on('info', onInfo).on('entry', onEntry).on('end', onEnd);
  };
  try {
    return list();
  } catch (e$) {
    e = e$;
    return onError(debug)(
    e);
  }
};
mapEntry = function(it){
  if (it) {
    return [
      basename(it.archive, '.tar'), it.dest, toKb(
      it.size) + ' KB', it.type
    ];
  }
};
