/**
 * Created by vip on 15/4/1.
 */
var cp      = require( "child_process"),
    tool    = require( "../util/tool" ) ,
    log     = require( "../util/log" ) ,
    grunt   = require( "grunt" ) ,
    bower   = require( "bower" ) ,
    file    = require( "../util/file" ) ,
    _       = require( "underscore" ) ,
    path    = require( "path" ) ,
    self;

function readInitList(){
    var _json           = _.extend( {
            kulor   : "https://github.com/kulor-developer/kulor.git"
    } , tool.getUserKulorJson().initType );
    return _json;
}

/*!
 *  init single type
 *  git clone & run kulorBuild.js
 */
function getSingleAddType( index , initList , initTypeJson , callback ){
    var _cmds   = [
            "git clone"
        ],
        _done   = function( err ){
            if( !err ) {
                if( grunt.file.isFile( _dir + "/kulorBuild.js" ) ){
                    require( _dir + "/kulorBuild" ).call( self , bower , grunt , tool , log , function(){
                        _next();
                        callback( index );
                    } );
                }
            }
        } ,
        _next   = function(){
            getSingleAddType( ++index , initList , initTypeJson , callback );
        } ,
        _dir;
    if( initList[ index ] ){
        if( initTypeJson[ initList[ index ] ] ){
            _dir    = path.resolve( self.cacheDir , initList[ index ] );
            if( grunt.file.isDir( _dir  ) ){
                _done( false );
            } else {
                if( /\s+/.test( _dir ) ){
                    _dir    = "\"" + _dir + "\"";
                }
                _cmds.push( initTypeJson[ initList[ index ] ] );
                _cmds.push( _dir );
                cp.exec( _cmds.join( " " ) , { cwd : self.cacheDir } , function( err ) {
                    _done( err );
                });
            }
        } else {
            log( _addList[ index ] + " not found." );
            _next();
        }
    } else {
        callback();
    }
}

function init(){
    var _json       = readInitList(),
        _addList    = [ "kulor" ],
        _cacheFolder;
    self   = this;
    tool.file   = file;
    tool.checkGit( function(){
        if( self.inputOpts.add instanceof Array ){
            _addList    = _addList.concat( self.inputOpts.add );
        } else if( self.inputOpts.add ){
            _addList.push( self.inputOpts.add );
        }
        _cacheFolder    = path.resolve( self.baseFolder , "userCache" );
        if( !grunt.file.exists( _cacheFolder ) ){
            if( grunt.file.mkdir( _cacheFolder ) ){
                log( "create folder deny!" );
            }
        }
        getSingleAddType( 0 , _addList , _json , function( index ){
            if( index === _addList.length ){
                log( "kulor init completed." );
            }
        } );
    } );
}

module.exports = init;