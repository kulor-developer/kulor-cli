var grunt   = require( "grunt" ),
    tool    = require( "../util/tool" ) ,
    log     = require( "../util/log" ) ,
    path    = require( "path" ) ,
    Install = require( "./core/install" ),
    install = new Install(),
    self;

function installDone( plugins , kulorJson ){
    var _dir    = "./bower_components/",
        _cwd    = path.resolve( self.cwd , "src/plugin/" );

    if( !grunt.file.isDir( _cwd ) ){
        grunt.file.mkdir( _cwd );
    }
    install.resolveDependency( _dir , _cwd , function( pluginName ){
        grunt.file.write( "./kulor.json", JSON.stringify(kulorJson, null, "    "));
        log( "load " + pluginName + " success." );
    } , plugins );
}

function installInit(){
    var _json   = {},
        _kulorJson,
        _plugins ,
        _pluginList;
    self   = this;
    if( grunt.file.exists( "kulor.json" ) ){
        _kulorJson = grunt.file.readJSON( "kulor.json" );
    }
    if( self.inputOpts.argv.remain.length > 1 ){
        _kulorJson = _kulorJson || {};
        _kulorJson.plugins  = typeof _kulorJson.plugins == "object" ? _kulorJson.plugins : {};
        _pluginList         = self.inputOpts.argv.remain.slice( 1 , self.inputOpts.argv.remain.length );
        _plugins = tool.arrayToObject( tool.stringToArray( _pluginList.join( ";" ) , [ "#" , ";" ] ) );
        for( var a in _plugins ){
            _json[ a ] = _plugins[ a ] || true;
            _kulorJson.plugins[ a ] = _json[ a ];
        }
    } else if( _kulorJson ){
        _json = typeof _kulorJson.plugins == "object" ? _kulorJson.plugins : {};
    } else {
        return log( "kulor.json not exsits.." );
    }
    install.addPlugins( _json , function(){
        installDone( _json , _kulorJson );
    } );
}

module.exports = installInit;