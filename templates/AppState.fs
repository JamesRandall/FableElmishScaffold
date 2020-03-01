module App.State

open Fable.Core
open Browser
open Elmish
open Types

let urlUpdate (result: Option<Router.Page>) model =
  match result with
  | None ->
    console.error("Error parsing url: " + window.location.href)
    model, Router.modifyUrl model.CurrentPage

  | Some page ->
    let model = { model with CurrentPage = page }
    match page with
    // begin dispatcher url update - do not remove
    // end dispatcher url update - do not remove
    | Router.Home ->
      model, Cmd.none

let init result =
  urlUpdate result Model.Empty

let update msg model =
  match (msg, model) with
  // begin dispatcher update - do not remove
  // end dispatcher update - do not remove
  | (Nothing, _) -> model, Cmd.none