module App.Types

type Session =
  {
    UserId : int
  }

type Model =
  { CurrentPage : Router.Page
    Session: Session option
    // begin dispatcher models - do not remove
    // end dispatcher models - do not remove
  }

  static member Empty =
    { CurrentPage = Router.Home
      Session = None
      // begin dispatcher model initialisation - do not remove
      // end dispatcher model initialisation - do not remove
    }

type Msg =
  // begin dispatcher messages - do not remove
  // end dispatcher messages - do not remove
  | Nothing // we need a placeholder for now so we can insert something here, will clean up later