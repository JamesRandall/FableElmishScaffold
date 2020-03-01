# README

This extension can help with the scaffolding out of applications based on Fable and the Elmish pattern. The code it generates is based on the [minimal](https://github.com/fable-compiler/fable2-samples/tree/master/minimal) sample that can be found in the [Fable  sample set](https://github.com/fable-compiler/fable2-samples).

[Available on the Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jamesrandall.fable-elmish-generator&ssr=false)

## Features

* Scaffold out a basic Fable application

## How to Use

The recommended way to use this scaffolder is from an empty Fable application - a good way to get started is by creating the [default SAFE application](https://safe-stack.github.io/docs/quickstart/#create-your-first-safe-app) and removing the boilerplate Fable app source by deleting the files:

Version.fs
Client.fs

From then you can use the _Scaffold Fable-Elmish Application Components_ command to create assets that the extension understands how to modify - you can then create routes for resources and the scaffolder will wire everything up for you.

You will also need to add the following NuGet package:

Fable.Elmish.Browser

Now to add a resource, for example routes to create, list, view and edit a Product entity run the command _Scaffold Fable-Elmish Entity_ and enter the entity name.

This will create the resource, routing for it, boilerplate views, and Elmish message patterns.

## Release Notes

### 0.0.1

* Initial release