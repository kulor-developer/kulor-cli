var grunt   = require( "grunt" ),
    nopt    = require( "nopt" ),
    log     = require( "../util/log" ),
    cmds    = require( "../util/cmds" ) ,
    path    = require( "path" );

function Kulor(){
    this.baseFolder = path.resolve( __dirname , "../" );
    this.inputOpts  = nopt( cmds.options , cmds.shortOpts , process.argv , 2 );
    this.cwd        = process.cwd();
    this.bowerDir   = path.resolve( this.cwd , "bower_components/" );
    this.packageJson= JSON.parse( grunt.file.read( path.resolve( this.baseFolder , "package.json" ) ) );
    this.cacheDir   = path.resolve( this.baseFolder , "userCache/" );
}

Kulor.fn = Kulor.prototype;

Kulor.fn.require = function( moduleName , newoduleName ){
    var _modalName  = newoduleName || moduleName ,
        _path       = path.resolve( this.baseFolder , "lib" , moduleName );
    this[ _modalName ] = require( _path );
    return this;
};

Kulor.fn.extend = function( json ){
    for( var a in json ){
        this[ a ] = json[ a ];
    }
}

Kulor.fn.init = function(){
    var _cmd;
    if( process.argv.length >= 3 ){
        _cmd = cmds.cmd[ process.argv[ 2 ] ];
        if( this.inputOpts.help ) {
            _cmd    = "help";
        }
        if( _cmd == "version" ){
            log( "kulor version :" + this.packageJson.version );
        } else if( _cmd ){
            this.require( _cmd );
            this[ _cmd ].apply( this );
        } else {
            log( "Error commend input , run \"kulor -h\" for more" );
        }
    } else {
        log( "run \"kulor -h\" for more" );
    }
};

module.exports  = Kulor;