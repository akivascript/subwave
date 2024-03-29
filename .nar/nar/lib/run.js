// Generated by LiveScript 1.3.1
var fw, utils, extract, download, join, spawn, EventEmitter, next, tmpdir, read, has, rm, delimiter, isWin, isArray, replaceEnvVars, isUrl, handleExit, hooksKeys, regexQuotes, regexSpaces, run, apply, readNarJson, getHooks, isBinaryValid, exec, getCommandScript, parseCommand, parseFlags, cleanSpaces, setEnvironment, extendPath, slice$ = [].slice;
fw = require('fw');
utils = require('./utils');
extract = require('./extract');
download = require('./download');
join = require('path').join;
spawn = require('child_process').spawn;
EventEmitter = require('events').EventEmitter;
next = utils.next, tmpdir = utils.tmpdir, read = utils.read, has = utils.has, rm = utils.rm, delimiter = utils.delimiter, isWin = utils.isWin, isArray = utils.isArray, replaceEnvVars = utils.replaceEnvVars, isUrl = utils.isUrl, handleExit = utils.handleExit;
hooksKeys = ['prestart', 'start', 'stop', 'poststop'];
regexQuotes = /^[\'\"]+|[\'\"]+$/g;
regexSpaces = /\s+/g;
module.exports = run = function(options){
  var ref$, path, hooks, args, dest, clean, emitter, cleanDir, onError, onEntry, onArchive, onProgress, onDownloadEnd, onEnd, onDownload, hooksFn, appRunner, extractArchive, downloadArchive, doExtract, e;
  ref$ = options = apply(
  options), path = ref$.path, hooks = ref$.hooks, args = ref$.args, dest = ref$.dest, clean = ref$.clean;
  emitter = new EventEmitter;
  cleanDir = function(){
    try {
      if (clean) {
        return rm(dest);
      }
    } catch (e$) {}
  };
  onError = function(err, code, cmd){
    cleanDir();
    return emitter.emit('error', err, code, cmd);
  };
  onEntry = function(entry){
    if (entry) {
      return emitter.emit('entry', entry);
    }
  };
  onArchive = function(archive){
    if (archive) {
      return emitter.emit('archive', archive);
    }
  };
  onProgress = function(status){
    return emitter.emit('progress', status);
  };
  onDownloadEnd = function(it){
    return emitter.emit('downloadEnd', it);
  };
  onEnd = function(options, nar){
    cleanDir();
    return emitter.emit('end', options, nar);
  };
  onDownload = function(){
    return emitter.emit(
    'download');
  };
  hooksFn = function(nar){
    var buf, addHookFn, addStartMainScript, hook, ref$, cmd, own$ = {}.hasOwnProperty;
    buf = [];
    addHookFn = function(cmd, hook){
      if (args && has(args, hook) && args[hook]) {
        cmd += ' ' + parseFlags(
        isArray(
        args[hook])
          ? args[hook].join(' ')
          : args[hook]);
      }
      return buf.push(
      exec(emitter, cmd, dest, hook));
    };
    addStartMainScript = function(){
      if (nar.manifest.main) {
        return buf.push(
        exec(emitter, "node " + nar.manifest.main, dest, 'start'));
      }
    };
    for (hook in ref$ = getHooks(
    nar)) if (own$.call(ref$, hook)) {
      cmd = ref$[hook];
      if (hooks || (!hooks && hook === 'start')) {
        addHookFn(cmd, hook);
      }
    }
    if (!buf.length) {
      addStartMainScript();
    }
    return buf;
  };
  appRunner = function(options){
    var nar;
    nar = readNarJson(
    dest);
    emitter.emit('info', nar);
    setEnvironment(
    dest);
    if (nar.binary) {
      extendPath(
      dest);
      if (!isBinaryValid(
      nar)) {
        return onError(
        new Error('Unsupported binary platform or processor'));
      }
    }
    return fw.series(hooksFn(
    nar), function(err){
      if (err) {
        return onError(
        err);
      }
      return onEnd(options, nar);
    });
  };
  extractArchive = function(){
    emitter.emit(
    'extract');
    return extract(
    options).on('error', onError).on('entry', onEntry).on('archive', onArchive).on('end', appRunner);
  };
  downloadArchive = function(){
    options.url = path;
    return download(
    options).on('download', onDownload).on('error', onError).on('progress', onProgress).on('end', function(it){
      options.path = it;
      onDownloadEnd(
      it);
      return extractArchive();
    });
  };
  doExtract = function(){
    return next(function(){
      if (!path) {
        return onError(
        new Error('Required archive path option'));
      }
      handleExit(
      cleanDir);
      if (isUrl(
      path)) {
        return downloadArchive();
      } else {
        return extractArchive();
      }
    });
  };
  try {
    doExtract();
  } catch (e$) {
    e = e$;
    onError(
    "Cannot run the archive: " + e);
  }
  return emitter;
};
apply = function(options){
  return {
    gzip: true,
    path: options.path,
    args: options.args || {},
    auth: options.auth,
    proxy: options.proxy,
    strictSSL: options.strictSSL,
    dest: options.dest || tmpdir(
    options.path),
    clean: options.clean != null ? options.clean : true,
    hooks: options.hooks != null ? options.hooks : true
  };
};
readNarJson = function(dest){
  return read(
  join(dest, '.nar.json'));
};
getHooks = function(nar){
  var scripts, hooks;
  scripts = nar.manifest.scripts;
  hooks = {};
  hooksKeys.forEach(function(it){
    if (scripts && has(scripts, it)) {
      return hooks[it] = scripts[it], hooks;
    }
  });
  return hooks;
};
isBinaryValid = function(nar){
  var ref$, platform, arch;
  ref$ = nar.info, platform = ref$.platform, arch = ref$.arch;
  return platform === process.platform && (arch === process.arch || (arch === 'ia32' && process.arch === 'x64'));
};
exec = function(emitter, command, cwd, hook){
  return function(done){
    var ref$, cmd, args, cmdStr, child;
    ref$ = parseCommand(
    getCommandScript(
    command)), cmd = ref$.cmd, args = ref$.args;
    emitter.emit('command', cmdStr = cmd + " " + args.join(' '), hook);
    if (hook === 'start') {
      emitter.emit('start', cmdStr);
    }
    child = spawn(cmd, args, {
      cwd: cwd,
      env: process.env
    });
    child.stdout.on('data', function(it){
      return emitter.emit('stdout', it.toString());
    });
    child.stderr.on('data', function(it){
      return emitter.emit('stderr', it.toString());
    });
    child.on('error', (function(it){
      return done(it);
    }));
    return child.on('exit', function(code){
      if (code !== 0) {
        return done(new Error("Command failed with exit code: " + code), code, cmdStr);
      } else {
        emitter.emit('exit', code, hook);
        return done();
      }
    });
  };
};
getCommandScript = function(cmd){
  var script;
  if (cmd === 'node' || /^node /.test(cmd)) {
    script = join(__dirname, '../scripts', isWin ? 'node.bat' : 'node.sh');
    if (!isWin) {
      script = "/usr/bin/env bash " + script;
    }
    cmd = (script + " ") + cmd.replace(/^node/, '');
  }
  return cmd;
};
parseCommand = function(cmd){
  var ref$, args;
  ref$ = cleanSpaces(
  replaceEnvVars(
  cmd)).split(' '), cmd = ref$[0], args = slice$.call(ref$, 1);
  return {
    cmd: cmd,
    args: args
  };
};
parseFlags = function(flags){
  return (flags || '').trim().replace(regexQuotes, '').trim();
};
cleanSpaces = function(it){
  return it.replace(regexSpaces, ' ');
};
setEnvironment = function(dest){
  process.env.NODE_PATH = join(dest, '.node');
  return process.env.NODE_NAR = '1';
};
extendPath = function(dest){
  return process.env.PATH = join(dest, '.node/bin') + (delimiter + "" + process.env.PATH);
};
