'use strict';

var yeoman = require('yeoman-generator');

var util = require('util');
var chalk = require('chalk');
var slug = require('slug');
var gitconfig = require('git-config');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var npmName = require('npm-name');
var GithubApi = require('github');
var shell = require('shelljs');
//var git = require('simple-git');

var copyDotFile = function(fileName) {
  this.fs.copy(
    this.templatePath('_' + fileName),
    this.destinationPath('.' + fileName)
  );
};

var copyTemplate = function(fileName) {
  this.fs.copyTpl(
    this.templatePath('_' + fileName),
    this.destinationPath(fileName),
    this.props
  );
};


var MiniNpmGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg       = require('../package.json');
    this.gitconfig = gitconfig.sync();

    //this.on('end', function () {
    //  if (!this.options[ 'skip-install' ]) {
    //    this.installDependencies();
    //  }
    //});
  },
  prompting:  function () {
    var done = this.async();
    this.log(chalk.magenta('This Yeoman generator will scaffold new npm package for you.'));

    this._promptPkgName();
  },
  _promptPkgName: function () {
    var done    = this.async();
    var prompts = [{
      name:     'pkgName',
      message:  'What is the name of the package?',
      default:  slug(this.appname),
      validate: function (str) {
        return str.length > 0;
      }
    }, {
      type:    'confirm',
      name:    'pkgName',
      message: 'The name above already exists on npm, choose another?',
      default: true,
      when:    function (answers) {
        var done = this.async();
        process.stdout.write(chalk.yellow('Checking if name is available on NPM...'));
        npmName(answers.pkgName)
          .then(function (available) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            if (!available) {
              done(true);
            }
            done(false);
          });
      }
    }];
    this.prompt(prompts, function (props) {
      this.pkgName    = slug(props.pkgName);
      this.pkgVarName = _.camelCase(props.pkgName);

      return this._promptOther();

      //done();

    }.bind(this));
  },
  _promptOther: function () {
    var done = this.async();

    var prompts = [{
      name:    'pkgDesc',
      message: 'Package description?'
    }, {
      name:     'githubName',
      message:  'What is your github username (git config --global github.user)?',
      default:  (this.gitconfig.github && this.gitconfig.github.user) || '',
      validate: function (str) {
        return str.length > 0;
      }
    }, {
      name:     'githubToken',
      message:  'What is your github oauth token (git config --global github.token)?',
      default:  (this.gitconfig.github && this.gitconfig.github.token) || '',
      validate: function (str) {
        return str.length > 0;
      }
    }, {
      type:    'input',
      name:    'keywords',
      message: 'Package keywords',
      filter:  function (value) {
        if (typeof value === 'string') {
          value = value.split(',');
        }
        return value
          .map(function (val) {
            return val.trim();
          })
          .filter(function (val) {
            return val.length > 0;
          });
      }
    }, {
      name:     'fullName',
      message:  'What is your name?',
      default:  (this.gitconfig.user && this.gitconfig.user.name) || '',
      validate: function (str) {
        return str.length > 0;
      }
    }, {
      name:     'emailAddress',
      message:  'What is your email address?',
      default:  (this.gitconfig.user && this.gitconfig.user.email) || '',
      validate: function (str) {
        return str.length > 0;
      }
    }, {
      type: 'confirm',
      name: 'git',
      message: 'Create new Git repository for this project?',
      default: false
    }];

    this.prompt(prompts, function (props) {

      this.pkgDesc      = props.pkgDesc;
      this.keywords     = props.keywords;
      this.githubName   = props.githubName;
      this.githubToken  = props.githubToken;
      this.fullName     = props.fullName;
      this.emailAddress = props.emailAddress;
      this.git          = props.git;

      this.currentYear = new Date().getFullYear();

      done();
    }.bind(this));
  },

  project:     function () {
    //mkdirp('test');
    //
    //this.template('package.json',  'package.json');
    //this.template('README.md',     'README.md');
    //this.template('LICENSE',       'LICENSE');
    //this.template('test-index.js', 'test/index.test.js');
    //
    //this.template('index.js', 'index.js');
    //this.template('cli.js',   'cli.js');
    //
    //this.copy('_editorconfig', '.editorconfig');
    //this.copy('_eslintrc',       '.eslintrc');
    //this.copy('_eslintignore',   '.eslintignore');
    //this.copy('_gitattributes', '.gitattributes');
    //this.copy('_gitignore', '.gitignore');
    //
    //this.copy('_jshintrc', '.jshintrc');
    //this.copy('_jsinspectrc', '.jsinspectrc');
    //this.copy('_travis.yml', '.travis.yml');
    //
    console.log('111',this.git);
    if (this.git) {
      this._createRepo();
    }
  },

  _createRepo: function () {
    //var github = new GithubApi({
    //  version: '3.0.0' // required
    //});
    //
    //github.authenticate({
    //  type:  'oauth',
    //  token: this.githubToken,
    //}, function (err, res) {
    //  console.log('github.authenticate(): err:', err, 'res:', JSON.stringify(res));
    //});
    //
    //github.repos.create({
    //  user:        this.githubName,
    //  name:        this.pkgName,
    //  description: this.pkgDesc
    //}, function (err, res) {
    //  console.log('github.repos.create(): err:', err, 'res:', JSON.stringify(res));
    //
    console.log('222',this.git);
      this._gitInitAndPush(this.githubName, this.pkgName);
    //});
  },

  _gitInitAndPush: function(githubName, pkgName) {
    this.log('git init');
    shell.exec('git init');
    this.log('git remote add origin ...');
    shell.exec(util.format('git remote add origin https://github.com/%s/%s.git', githubName, pkgName));
    this.log('git add --all');
    shell.exec('git add --all');
    this.log('git commit -am "First commit"');
    shell.exec('git commit -am "First commit"');
    this.log('git push --set-upstream origin master');
    shell.exec('git push --set-upstream origin master');
    this.log('git done');
  },

  install: function() {
    //if (!this.options[ 'skip-install' ]) {
    //  this.installDependencies();
    //  //this.npmInstall();
    //}
  }
});

module.exports = MiniNpmGenerator;
