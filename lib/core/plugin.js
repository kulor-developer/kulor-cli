var grunt   = require( "grunt" ) ,
    log     = require( "../../util/log" ) ,
    bower   = require( "bower" ) ,
    Install = require( "./install" ),
    install = new Install() ,
    path    = require( "path" ) ,
    tool    = {
        getPluginDir    : function(){
            var _cwd        = process.cwd(),
                _pluginDir  = false,
                _getDir     = function(){
                    if( /src\/plugin$/.test( _cwd ) ){
                        _pluginDir = _cwd + "/";
                    } else if( /\/src$/.test( _cwd ) ){
                        _pluginDir = _cwd + "/plugin";
                        grunt.file.mkdir( _pluginDir );
                    } else if( grunt.file.isDir( "./src" ) ){
                        _cwd += "/src";
                        _getDir();
                    }
                };
            _getDir();
            return _pluginDir;
        }
    };

function Plugin(){
    this.config     = {
        dir     : tool.getPluginDir()
    }
}

Plugin.fn = Plugin.prototype;

/*!
 *  add plugin dependencies
 *  @param  pluginDir   {string}
 *  @param  dpArray     [ pluginName , pluginName... ]
 *  @param  callback    function
 *  @return plugin
 */
Plugin.fn.addDependencies     = function( pluginDir , dpArray , callback ){
    var _count          = dpArray.length,
        _dpInstallJson  = {},
        _bower          = "./bower_components/";
    if( dpArray.length == 1 && dpArray[ 0 ] == "" ){
        return callback( {} );
    }
    log( "install plugin dependencies." );
    bower.commands
        .install( dpArray )
        .on( "end" , function( installed ){
            for( var a in installed ){
                _dpInstallJson[ a ] = "~" + installed[ a ].pkgMeta.version;
            }
            install.resolveDependency( _bower , pluginDir , function(){
                if( typeof callback == "function" ){
                    callback( _dpInstallJson );
                }
                install.removeBowerDir( _bower );
            } , _dpInstallJson );
        } );
    return this;
}

/*!
 *  initiliaze plugin develop env
 *  @param  kulorJson   {json}
 *  @param  callback    function
 *  @return plugin
 */
Plugin.fn.init  = function( kulorJson , callback ){
    var pluginDir   = path.resolve( this.config.dir , kulorJson.name ),
        _bowerDir;
    grunt.file.mkdir( pluginDir );
    this.addDependencies( pluginDir , kulorJson.dependencies , function( dpJson ){
        kulorJson.dependencies = dpJson;
        grunt.file.write( path.resolve( pluginDir , "bower.json" ) , JSON.stringify( kulorJson , null , '  ' ) + '\n' );
        grunt.file.write( path.resolve( pluginDir , kulorJson.main ) , "" );
        _bowerDir = path.resolve( pluginDir , "bower_components" );
        install.resolveDependency( _bowerDir , pluginDir , function(){
            grunt.file.delete( _bowerDir , { force : true } );    
            if( typeof callback === "function" ){
                callback( dpJson );
            }
        } , dpJson );
    } );
    return this;
}

/*!
 *  check if has the plugin
 *  @param  pluginName  {string}
 */
Plugin.fn.hasPlugin = function( pluginName ){
    if( !this.config.dir ){
        return false;
    } else {
        return grunt.file.isDir( path.resolve( this.config.dir , pluginName ) );
    }
}

/*!
 *  @return boolean
 */
Plugin.fn.checkIsPluginDir = function(){
    return /src\/plugin\/[\d|\w|\-]+$/.test( process.cwd() );
}

module.exports = Plugin;