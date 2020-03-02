module App

open Elmish
open Fable.React
open Fable.React.Props
open App.State
open App.Types

let private renderPage model dispatch =
  match model with
  // begin dispatcher rendering - do not remove
  // end dispatcher rendering - do not remove
  | { CurrentPage = Router.Home } -> div [] [str "home page"]
  | _ ->
    div [] [str "page not found"]

let private root model dispatch =
  div [ ] [
    // insert your chrome here
    renderPage model dispatch
  ]  

#if DEBUG
open Elmish.Debug
#endif
open Elmish.Navigation
open Elmish.UrlParser
open Elmish.HMR

Program.mkProgram init update root
|> Program.toNavigable (parseHash Router.pageParser) urlUpdate
#if DEBUG
|> Program.withConsoleTrace
#endif
|> Program.withReactSynchronous "elmish-app"
#if DEBUG
|> Program.withDebugger
#endif
|> Program.run
