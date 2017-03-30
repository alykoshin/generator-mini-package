'use strict';

var Generator = require('yeoman-generator');

var util = require('util');
var chalk = require('chalk');
//var slug = require('slug');
var slugify = require('slugify');
var gitconfig = require('git-config');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var npmName = require('npm-name');
var GithubApi = require('github');
var shell = require('shelljs');
//var git = require('simple-git');


//var MiniNpmGenerator = yeoman.Base.extend({
var MiniNpmGenerator = class extends Generator {

  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);

    // Next, add your custom code
    //this.option('babel'); // This method adds support for a `--babel` flag
  }

  initializing() {
    console.log('[initializing]');
    this.pkg       = require('../package.json');
    this.gitconfig = gitconfig.sync();

    //this.on('end', function () {
    //  if (!this.options[ 'skip-install' ]) {
    //    this.installDependencies();
    //  }
    //});
  }


  prompting() {
    console.log('[prompting]');
    //var done = this.async();
    this.log(chalk.magenta('This Yeoman generator will scaffold new npm package for you.'));
    this.log('Make sure you already did:\'mkdir <package-name>; cd <package-name>\'.');

    return this._promptPkgName();
  }


  _promptPkgName() {
    //var done    = this.async();

    var prompts = [
      {
        name:     'pkgName',
        message:  'What is the name of the package?',
        default:  slugify(this.appname),
        validate: function (str) {
          return str.length > 0;
        }
      }, {
        type:    'confirm',
        name:    'pkgName',
        message: 'The name above already exists on npm, choose another?',
        default: true,
        when:    function (answers) {
          //var done = this.async();
          process.stdout.write(chalk.yellow('Checking if name is available on NPM... '));
          return npmName(answers.pkgName)
            .then(function (available) {
              if (available) process.stdout.write(chalk.green('ok\n'));
              else process.stdout.write(chalk.red('NAME NOT AVAILABLE\n'));
              //process.stdout.clearLine();
              //process.stdout.cursorTo(0);
              //done(available);
            })
            ;
        }
      }
    ];
    return this.prompt(prompts)
      .then((props) => {
        this.pkgName    = slugify(props.pkgName);
        this.pkgVarName = _.camelCase(props.pkgName);

        return this._promptOther();

        //done();

      });
  }


  _promptOther() {
    //var done = this.async();

    var prompts = [{
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
      validate: (str) => {
        return str.length > 0;
      }
    }, {
      name:    'pkgDesc',
      message: 'Package description?',
      store   : true
    }, {
      type:    'input',
      name:    'keywords',
      message: 'Package keywords?',
      store   : true,
      filter:  (value) => {
        if (typeof value === 'string') {
          value = value.split(',');
        }
        value = value
          .map((val) => {
            val = val.replace(/[\s'"]/g,''); // Remove spaces, single and double quotes
            return val;//.trim();
          })
          .filter((val) => {
            return val.length > 0;
          })
        //.map(function (val) {              // Add double quotes
        //  return '"' + val + '"';
        //})
        ;
        this.log('keywords:', value);
        return value;
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
      message: 'Create new GitHub repository for this project?',
      default: false
    }, {
      type: 'confirm',
      name: 'cli',
      message: 'Support CLI?',
      default: false
    }];

    return this.prompt(prompts)
      .then((props) => {

        this.pkgDesc      = props.pkgDesc;
        this.keywords     = props.keywords;
        this.githubName   = props.githubName;
        this.githubToken  = props.githubToken;
        this.fullName     = props.fullName;
        this.emailAddress = props.emailAddress;
        this.git          = props.git;
        this.cli          = props.cli;

        this.currentYear = new Date().getFullYear();

      });
  }


  configuring() {
    this.log('[configuring]');
  }


  default() {
    this.log('[default]');
  }

  writing() {
    this.log('[writing]');
    return this._writing();
  }

  conflicts() {
    this.log('[conflicts]');
  }

  install() {
    this.log('[install]');
    return this._install();
  }

  end() {
    this.log('[end]');
  }


  _copyFile(fileName) {
    this.fs.copy(
      this.templatePath(fileName),
      this.destinationPath(fileName)
    );
  }

  _copyDotFile(fileName) {
    this.fs.copy(
      this.templatePath('_' + fileName),
      this.destinationPath('.' + fileName)
    );
  }

  _copyTplFile(fileName) {
    this.fs.copyTpl(
      this.templatePath(fileName),
      this.destinationPath(fileName),
      this
    );
  }


  _writing() {
    //mkdirp('test');
    this._copyTplFile('package.json');
    this._copyTplFile('README.md');
    this._copyTplFile('LICENSE');
    this._copyTplFile('lib/index.js');
    this._copyTplFile('test/index.js');

    this._copyTplFile('index.js');
    if (this.cli) {
      this._copyTplFile('cli.js');
    }

    this._copyDotFile('editorconfig');
    this._copyDotFile('eslintrc');
    this._copyDotFile('eslintignore');
    this._copyDotFile('gitattributes');
    this._copyDotFile('gitignore');
    this._copyDotFile('jshintrc');
    this._copyDotFile('jsinspectrc');
    this._copyDotFile('travis.yml');

    this._copyFile('inch.json');

    if (this.git) {
      this._createRepo();
    }
  }

  _createRepo() {
    var self = this;

    var github = new GithubApi({
      version: '3.0.0' // required
    });

    github.authenticate({
      type:  'oauth',
      token: this.githubToken,
    });

    github.repos.create({
      user:        this.githubName,
      name:        this.pkgName,
      description: this.pkgDesc
    }, function (err, res) {
      console.log('github.repos.create(): err:', err, 'res:', JSON.stringify(res));

      self._gitInitAndPush(self.githubName, self.pkgName);
    });
  }

  _gitInitAndPush(githubName, pkgName) {
    var self = this;

    var commands = [
      'git init',
      util.format('git remote add origin https://github.com/%s/%s.git', githubName, pkgName),
      'git add --all',
      'git commit -am "First commit"',
      'git push --set-upstream origin master'
    ];

    commands.forEach(function(cmd) {
      self.log(cmd);
      shell.exec(cmd);
    });
    self.log('git done');
  }

  _install() {
    if (!this.options[ 'skip-install' ]) {
      //this.installDependencies();
      this.npmInstall();
    }
  }

};


module.exports = MiniNpmGenerator;
