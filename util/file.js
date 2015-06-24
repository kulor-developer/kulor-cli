var log     = require( "./log" ) ,
    os      = require( "os" ) ,
    path    = require( "path" ) ,
    grunt   = require( "grunt" );

var file    = module.exports    = {} ,
    pathSplitString             = /[\/|\\]/g;

function copySingleFile( filePath , rootDir , targetDir ){
    var _dir;
    _dir            = path.resolve( filePath.replace( rootDir , targetDir ) );
    grunt.file.copy( filePath , _dir , { force : true } );
}


/*!
 *  允许递归文件夹式的copy
 *  @from   {dir}
 *  @target {dir}
 *  @cancelCurrentDir   {boolean}   不copy当前目录 
 */
file.copy   = function( from , target , cancelCurrentDir ){
    var _paths      = [] ;
    from     = path.resolve( from );
    target   = path.resolve( target );
    if( grunt.file.isFile( from ) ){
        grunt.file.copy( from , target );
    } else if( grunt.file.isDir( from ) ){
        grunt.file.recurse( from , function( filepath ){
            if( grunt.file.isFile ){
                _paths.push( path.resolve( filepath ) );
            } else {
                log( filepath );
            }
        } );
        if( !cancelCurrentDir ){
            target     = path.resolve( target , path.basename( from ) );
            if( !grunt.file.exists( target ) ){
                grunt.file.mkdir( target );
            }
        }
        for( var i = 0 , len = _paths.length; i < len; i++ ){
            copySingleFile( _paths[ i ] , from , target );
        }
    }
}