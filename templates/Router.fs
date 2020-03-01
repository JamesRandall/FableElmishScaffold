module Router

open Browser
open Fable.React.Props
open Elmish.Navigation
open Elmish.UrlParser

// begin entity pages - do not remove
// end entity pages - do not remove

type Page =
  // begin root pages - do not remove
  // end root pages - do not remove
  | Home

let private toHash page =
  match page with
  | Home -> "#/"
  // begin entity paths - do not remove
  // end entity paths - do not remove  

let pageParser: Parser<Page->Page,Page> =
    oneOf [
      // begin match parser - do not remove
      // end match entity routes - do not remove
      map Home top
    ]

let href route =
  Href (toHash route)

let modifyUrl route =
    route |> toHash |> Navigation.modifyUrl

let newUrl route =
    route |> toHash |> Navigation.newUrl

let modifyLocation route =
    window.location.href <- toHash route