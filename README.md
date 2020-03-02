# README

This extension can help with the scaffolding out of applications based on Fable and the Elmish pattern. The code it generates is based on the [minimal](https://github.com/fable-compiler/fable2-samples/tree/master/minimal) sample that can be found in the [Fable  sample set](https://github.com/fable-compiler/fable2-samples).

[Available on the Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jamesrandall.fable-elmish-generator&ssr=false)

## Features

* Scaffold out a basic Fable-Elmish application
* Use custom templates for code generation
* Support for either promise or async blocks

## How to Use

The recommended way to use this scaffolder is from an empty Fable application - a good way to get started is by creating the [default SAFE application](https://safe-stack.github.io/docs/quickstart/#create-your-first-safe-app) and removing the boilerplate Fable app source by deleting the files:

Version.fs
Client.fs

From then you can use the _Scaffold Fable-Elmish Application Components_ command to create assets that the extension understands how to modify - you can then create routes for resources and the scaffolder will wire everything up for you.

You will also need to add the following NuGet package:

Fable.Elmish.Browser

Now to add a resource, for example routes to create, list, view and edit a Product entity run the command _Scaffold Fable-Elmish Entity_ and enter the entity name.

This will create the resource, routing for it, boilerplate views, and Elmish message patterns.

## Settings

Settings are maintained in a file called .elmish-scaffold-settings which will be located by walking up the folder structure from the location in which you run a command. You can export a settings file at the current location by running the command _Export Fable-Elmish Scaffold Settings_ which will create a .elmish-scaffold-settings file with the default values.

Setings are described below:

|Setting|Default|Description|
|-------|-------|-----------|
|asyncStyle|async|Possible values are async or promise and this causes the scaffolder to generate async or promise blocks as appropriate|

## Customising the Generated Code

The scaffolder makes use of a set of Handlelbars templates. If you want to customise the generated code you can "eject" the shipped templates and modify them.

To do this run the command _Eject Fable-Elmish Scaffold Templates_. This will place the templates in a folder called .fable-elmish-templates at the current location.

When generating code the scaffolder will walk back up the folder tree from the location you are inserting the code and look for this folder. If it finds it it will use your custom templates, if it doesn't it will use the defaults. This allows you to use different templates in different parts of a solution.

## Release Notes

### 0.0.4

* Added settings support and documentation

### 0.0.3

* Renamed the Rest templates and modules to Api to be a little more agnostic of implementation (for example Fable.Remoting)
* Renamed the session type to be called context and changed the parameter name on updaters from user to context (to better reflect its purpose)

### 0.0.2

* Added a logo

### 0.0.1

* Initial release