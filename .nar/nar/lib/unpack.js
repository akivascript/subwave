// Generated by LiveScript 1.3.1
var fs, tar, createGunzip, EventEmitter, _, next, unpack, apply;
fs = require('fs');
tar = require('tar');
createGunzip = require('zlib').createGunzip;
EventEmitter = require('events').EventEmitter;
_ = require('./utils'), next = _.next;
module.exports = unpack = function(options){
  var ref$, path, checksum, errored, emitter, onEnd, onEntry, onError, doExtract, extractArchive, extractGzip, extractNormal, calculateChecksum;
  options == null && (options = {});
  ref$ = apply(
  options), path = ref$.path, checksum = ref$.checksum;
  errored = false;
  emitter = new EventEmitter;
  onEnd = function(){
    if (!errored) {
      return emitter.emit('end');
    }
  };
  onEntry = function(entry){
    if (entry) {
      return emitter.emit('entry', entry);
    }
  };
  onError = function(err){
    if (err && !/unexpected eof/.test(err.message)) {
      if (!errored) {
        emitter.emit('error', err);
      }
      return errored = true;
    }
  };
  doExtract = function(){
    return next(function(){
      var extractor;
      extractor = extractArchive(options);
      if (checksum) {
        return calculateChecksum(checksum, path, extractor);
      } else {
        return extractor();
      }
    });
  };
  extractArchive = function(options){
    return function(){
      var dest, gzip, stream;
      dest = options.dest, gzip = options.gzip;
      if (!dest) {
        dest = process.cwd();
      }
      stream = fs.createReadStream(path);
      stream.on('error', onError);
      if (gzip) {
        return extractGzip(stream, dest);
      } else {
        return extractNormal(stream, dest);
      }
    };
  };
  extractGzip = function(stream, dest){
    var gzstream;
    gzstream = stream.pipe(createGunzip());
    gzstream.on('error', onError);
    return extractNormal(gzstream, dest);
  };
  extractNormal = function(stream, dest){
    var extract;
    extract = tar.Extract({
      path: dest
    });
    extract.on('entry', onEntry);
    return stream.pipe(extract).on('error', onError).on('end', onEnd);
  };
  calculateChecksum = function(hash, file, cb){
    return _.checksum(file, function(err, nhash){
      if (err) {
        return onError(
        err);
      }
      if (hash === nhash) {
        return cb();
      } else {
        return onError(
        new Error("Checksum verification failed: " + nhash));
      }
    });
  };
  doExtract();
  return emitter;
};
apply = function(options){
  return {
    dest: options.dest || process.cwd(),
    gzip: options.gzip || false,
    path: options.path || null,
    checksum: options.checksum || null
  };
};