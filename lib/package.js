'strict'

var fs    = require('fs')
  , path  = require('path')
  , gutil = require('gulp-util')
  , _     = require('lodash');


function BowerPackage (name, collection) {

    this.name                = name;
    this.collection          = collection;

    this.path                = collection.opts.bowerDirectory;
    this.id                  = name;
    
    this.files               = null;
    this.config              = null;
    this.json                = null;
    this.main                = null;
    this.self                = this;

    this.configure();
    this.getFiles();
}


_.extend(BowerPackage.prototype, {
    'configure': function() {
        if (this._json) return;

        this.path = path.resolve(path.join(this.path.toString(), this.name.toString()));
        this.config = path.resolve(path.join(this.path, 'bower.json'));

        if (!fs.existsSync(this.config))
            this.config.replace('/bower.json', '/.bower.json');

        this.json = JSON.parse(fs.readFileSync(this.config, "utf8"));

        this.id = this.json.name;
        this.main = Array.isArray(this.json.main) ? this.json.main : [this.json.main];

        for(var pkg in this.json.dependencies) {
            this.collection.addPackage(pkg);
        }
    },

    'getFiles': function() {
        if (this.files) return this.files;
        this.files = [];

        var file, scope = this;
        _.forEach(this.main, function(f){
            file = path.join(scope.path.toString(), f.toString());

            if (path.extname(file) == '.js') {
                scope.files.push(path.resolve(file));

            // if (scope.collection.opts.debug === true)
                gutil.log(scope.name + ' - ' + gutil.colors.green(file));
            }
        })  

        // gutil.log(scope.name + ' - ' + gutil.colors.green(this.files.join('|')));
        return this.files;
    }
});


module.exports = BowerPackage;