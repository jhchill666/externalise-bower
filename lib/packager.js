'strict'

var fs    = require('fs')
  , path  = require('path')
  , gutil = require('gulp-util')
  , _     = require('lodash')
  , Package = require('./package');


function BowerUtils (opts) {

    this.opts                = opts = opts || {};
    this.opts.debug          = opts.debug || false;
    this.opts.bowerJson      = opts.bowerJson || "./bower.json";
    this.opts.bowerrc        = opts.bowerrc || "./.bowerrc";
    this.opts.bowerDirectory = opts.bowerDirectory || "./bower_components";
    this.opts.includeDev     = opts.includeDev || true;
    this._packages           = null;
    this._config             = null;
    this._self               = this;

    this.getInstallDirectory();

    for(var opt in opts)
        this.log('Options: ', opt + '=' + opts[opt]);
}


_.extend(BowerUtils.prototype, {

    /**
     * Requires packages to be included into the specified bundle
     */
    'require': function(bundle) {
        var ids = this.getPackageIds();
        var self = this;

        _.forEach(ids, function (id) {
            var p = self.getPackageEndpoint(id);
            self.log('Browserify::require: ', id + ' - '+p[0]);
            
            bundle.require(p[0], {expose:id});
        });
    },

    /**
     * Specifies that the bower packages should be externalised from the current bundle
     */
    'external': function(bundle) {
        var ids = this.getPackageNames();
        var self = this;
        
        _.forEach(ids, function (id) {
            self.log('Browserify::external: ' + id);
            bundle.external(id);
        });

    },

    /**
     * Retrieves all installed packages' id ie. './bower_components/jquery/bower.json#name'
     */
    'getPackageIds': function() {
        return _.map(this.getPackages(), 'id');
    },

    /**
     * Retrieves all installed packages' name ie. './bower.json#dependencies[x]'
     */
    'getPackageNames': function() {
        return _.map(this.getPackages(), 'name');
    },

    /**
     * Retrieves all installed packages' main files ie. './bower_components/jquery/bower.json#main'
     */
    'getPackageFiles': function() {
        return _.map(this.getPackages(), 'files');
    },

    /**
     * resolves the bower install directory.  Usually 'bower_components' unless overriden in .bowerrc
     */
    'getInstallDirectory': function() {
        var rc = path.resolve(this.opts.bowerrc)
          , dir = "./bower_components";

        if (fs.existsSync(rc))
            dir = JSON.parse(fs.readFileSync(rc)).directory;

        this.opts.bowerDirectory = path.resolve(dir);
        return this.opts.bowerDirectory;
    },

    /**
     * Retrieves all packages as BowerPackage instances
     */
    'getPackages': function() {
        if (this._packages)
            return this._packages;

        var self = this;
        _.forEach(this.getInstalledPackages(), function(pkg) {
            self.addPackage(pkg);
        })
        return this._packages;
    },

    /**
     * Adds a new BowerPackage instance to the package map
     */
    'addPackage': function(name) {
        if (!this._packages) this._packages = {};    
        this._packages[name] = new Package(name, this);
    },

    /**
     * Retrieves all installed bower packages
     */
    'getInstalledPackages': function() {
        var bowerConfig = this.loadBowerJson()
          , deps = bowerConfig.dependencies || {}
          , devDeps = bowerConfig.devDependencies || {};

        var packages = _.keys(deps);
        if (this.opts.includeDev)
            packages.concat(_.keys(devDeps))
        return packages;
    },

    /**
     * Resolves and loads the root bower.json file
     */
    'loadBowerJson': function() {
        if (this._config) return this._config;

        if (!fs.existsSync(this.opts.bowerJson))
            throw new gutil.PluginError(PLUGIN_NAME,
                "bower.json file does not exist at " + this.opts.bowerJson);

        this._config = JSON.parse(fs.readFileSync(this.opts.bowerJson, "utf8"));
        return this._config;
    },

    'getPackageEndpoint': function(pkg) {
        var package = this._packages[pkg];
        return (package) ? package.files : [];
    },

    /**
     * Returns an array of arbitrary property values from each installed bower components config file
     */
    'getPackageProps': function(prop) {
        var props = [];
        _.forEach(this.getPackages(), function(pkg) {
            if (pkg.config.hasOwnProperty(prop))
                props.push(pkg.config[prop]);
        });
        this.log(prop+': ', props.join('|'));
        return props;
    },

    /**
     * Log conveniance method
     */
    'log': function(title, message) {
        if (this.opts.debug === true) gutil.log(title + gutil.colors.green(message));
    }
});


module.exports = function(opts) {
    return new BowerUtils(opts);
};




