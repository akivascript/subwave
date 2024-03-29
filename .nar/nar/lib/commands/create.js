// Generated by LiveScript 1.3.1
var nar, common, utils, program, echo, exit, onEntry, onError, createBar, onProgress, updateBar, onDownloadEnd, exists, isDir, isFile, isString, options, create, normalize, apply, getMode;
nar = require('../nar');
common = require('./common');
utils = require('../utils');
program = require('commander');
echo = common.echo, exit = common.exit, onEntry = common.onEntry, onError = common.onError, createBar = common.createBar, onProgress = common.onProgress, updateBar = common.updateBar, onDownloadEnd = common.onDownloadEnd;
exists = utils.exists, isDir = utils.isDir, isFile = utils.isFile, isString = utils.isString;
options = ['dependencies', 'devDependencies', 'peerDependencies', 'globalDependencies', 'patterns', 'binary', 'binaryPath', 'os', 'arch', 'node', 'proxy'];
program.command('create [path]').description('\n  Create a nar archive').usage('<path> [options]').option('-o, --output <path>', 'Output directory. Default to current directory').option('-f, --file <name>', 'Define the archive file name').option('-r, --dependencies', 'Include dependencies').option('-x, --dev-dependencies', 'Include development dependencies').option('-p, --peer-dependencies', 'Include peer dependencies').option('-g, --global-dependencies <names>', 'Include global dependencies, comma separated').option('-n, --omit-dependencies', 'Create archive without embed any type of dependencies').option('-i, --patterns <patterns>', 'Glob patterns to use for files include/exclude, comma separated').option('-b, --binary', 'Include node binary').option('-e, --executable', 'Create nar as self executable binary').option('-l, --binary-path <path>', 'Custom node binary to embed into the archive').option('-s, --os <name>', 'Node.js OS binary platform to embed. Default to current OS').option('-a, --arch <name>', 'Node.js OS binary architecture to embed. Default to ' + process.arch).option('-q, --node <name>', 'Node.js version to embed. Default to ' + process.version).option('--proxy <url>', 'Proxy server URL to use to download binaries').option('-d, --debug', 'Enable debug mode. More information will be shown').option('-v, --verbose', 'Enable verbose mode. A lot of information will be shown').on('--help', function(){
  return echo('  Usage examples:\n\n    $ nar create\n    $ nar create some/dir --debug\n    $ nar create path/to/package.json -o some/dir\n    $ nar create --verbose --binary\n    $ nar create --global-dependencies \'npm,grunt\' --patterns \'!.tmp,src/**\'\n\t');
}).action(function(){
  return create.apply(this, arguments);
});
create = function(pkgpath, options){
  var debug, verbose, output, file, executable, bar, opts, onStart, onDownload, onArchive, onGenerate, onEnd, create, e;
  debug = options.debug, verbose = options.verbose, output = options.output, file = options.file, executable = options.executable;
  bar = createBar();
  opts = {
    dest: output,
    file: file
  };
  apply(options, opts);
  if (opts.binaryPath) {
    opts.binary = true;
  }
  if (options.omitDependencies) {
    opts.dependencies = false;
    opts.devDependencies = false;
    opts.peerDependencies = false;
  }
  if (pkgpath) {
    if (!exists(
    pkgpath)) {
      exit(1)(
      'Error: path do not exists');
    }
    if (isFile(
    pkgpath)) {
      pkgpath = path.dirname(
      pkgpath);
    }
    if (!isDir(
    pkgpath)) {
      exit(1)(
      'Error: path must be a directory');
    }
    opts.path = pkgpath;
  }
  onStart = function(){
    return echo(
    'Creating archive...');
  };
  onDownload = function(){
    return echo(
    'Downloading node binary...');
  };
  onArchive = function(it){
    if (!(debug && verbose)) {
      return echo(
      "Add [" + it.type.cyan + "] " + (it.name || ''));
    }
  };
  onGenerate = function(){
    return echo(
    'Generating executable...');
  };
  onEnd = function(output){
    return echo(
    "Created in: " + output);
  };
  create = function(){
    var archive;
    archive = nar[getMode(
    executable)](opts).on('start', onStart).on('error', onError(
    debug)).on('download', onDownload).on('downloadEnd', onDownloadEnd(
    bar)).on('progress', onProgress(
    bar)).on('generate', onGenerate).on('end', onEnd);
    if (debug || verbose) {
      return archive.on('entry', onEntry(
      'Add'));
    } else {
      return archive.on('archive', onArchive);
    }
  };
  try {
    return create();
  } catch (e$) {
    e = e$;
    return onError(debug)(
    e);
  }
};
normalize = function(type, value){
  if (type === 'globalDependencies' || type === 'patterns') {
    return value.split(',').map(function(it){
      return it.trim();
    });
  } else {
    return value;
  }
};
apply = function(args, opts){
  return options.filter(function(it){
    return args[it] === true || isString(
    args[it]);
  }).forEach(function(it){
    return opts[it] = normalize(it, args[it]), opts;
  });
};
getMode = function(exec){
  if (exec) {
    return 'createExec';
  } else {
    return 'create';
  }
};
