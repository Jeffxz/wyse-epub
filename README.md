# wyse

A CLI tool to generate epub from html website, markdown and text file, as well as validate epub file

## Install & Update

If you have nodejs installed in your local then all you needed is to run

```
npm install -g wyse
```

## [Convert Local Website, markdown and text file](docs/convert_package.md)

## [Validate epub file](docs/validate.md)

The validate function is inspired by [w3c epubcheck](https://github.com/w3c/epubcheck) but intents to:

* be used by web browser based or node based application
* have strict (to W3C spec) and loose (more epub reading application friendly) validation rules
* have customized validation rule set to ignore or promote certain rule to fit different use cases
