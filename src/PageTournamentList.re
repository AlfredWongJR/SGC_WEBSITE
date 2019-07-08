open Data.Tournament;
let s = React.string;
/* These can't be definined inline or the comparisons don't work. */
let dateSort = Hooks.KeyDate(dateGet);
let nameSort = Hooks.KeyString(nameGet);

[@react.component]
let make = () => {
  let (tourneys, dispatch) = Hooks.Db.useAllTournaments();
  let (sorted, sortDispatch) =
    Hooks.useSortedTable(
      ~table=tourneys->Belt.Map.String.valuesToArray,
      ~key=dateSort,
      ~isDescending=true,
    );
  let (newTourneyName, setNewTourneyName) = React.useState(() => "");
  let (isDialogOpen, setIsDialogOpen) = React.useState(() => false);
  let (_, windowDispatch) = Window.WindowContext.useWindowContext();
  React.useEffect1(
    () => {
      windowDispatch(Window.SetTitle("Tournament list"));
      Some(() => windowDispatch(Window.SetTitle("")));
    },
    [|windowDispatch|],
  );
  React.useEffect2(
    () => {
      sortDispatch(Hooks.SetTable(tourneys->Belt.Map.String.valuesToArray));
      None;
    },
    (tourneys, sortDispatch),
  );

  let updateNewName = event => {
    setNewTourneyName(event->ReactEvent.Form.currentTarget##value);
    ();
  };
  let makeTournament = event => {
    ReactEvent.Form.preventDefault(event);
    let newId = Utils.nanoid();
    let newTourney =
      t(
        ~byeQueue=[||],
        ~date=Js.Date.make(),
        ~id=newId,
        ~name=newTourneyName,
        ~playerIds=[||],
        ~roundList=[||],
        ~tieBreaks=[|0, 1, 2|],
      );
    dispatch(Hooks.Db.AddItem(newId, newTourney));
    setNewTourneyName(_ => "");
    setIsDialogOpen(_ => false);
    ();
  };
  let deleteTournament = (id, name) => {
    let message = {j|Are you sure you want to delete “$name”?|j};
    if (Utils.confirm(message)) {
      dispatch(Hooks.Db.DelItem(id));
    };
    ();
  };
  <Window.WindowBody>
    <div className="content-area">
      <div className="toolbar toolbar__left">
        <button onClick={_ => setIsDialogOpen(_ => true)}>
          <Icons.plus />
          {s(" Add tournament")}
        </button>
      </div>
      {tourneys->Belt.Map.String.isEmpty
         ? <p> {s("No tournaments are added yet.")} </p>
         : <table>
             <caption> {s("Tournament list")} </caption>
             <thead>
               <tr>
                 <th>
                   <Hooks.SortButton
                     data=sorted dispatch=sortDispatch sortKey=nameSort>
                     {s("Name")}
                   </Hooks.SortButton>
                 </th>
                 <th>
                   <Hooks.SortButton
                     data=sorted dispatch=sortDispatch sortKey=dateSort>
                     {s("Date")}
                   </Hooks.SortButton>
                 </th>
                 <th>
                   <Utils.VisuallyHidden>
                     {s("Controls")}
                   </Utils.VisuallyHidden>
                 </th>
               </tr>
             </thead>
             <tbody className="content">
               {sorted.table
                |> Js.Array.map(t =>
                     <tr key={t->idGet} className="buttons-on-hover">
                       <td>
                         <a href={"#/" ++ t->idGet}> {t->nameGet->s} </a>
                       </td>
                       <td> <Utils.DateFormat date={t->dateGet} /> </td>
                       <td>
                         <button
                           ariaLabel={"Delete " ++ t->nameGet}
                           className="danger button-ghost"
                           title={"Delete " ++ t->nameGet}
                           onClick={_ =>
                             deleteTournament(t->idGet, t->nameGet)
                           }>
                           <Icons.trash />
                         </button>
                       </td>
                     </tr>
                   )
                |> ReasonReact.array}
             </tbody>
           </table>}
      <Utils.Dialog
        isOpen=isDialogOpen onDismiss={() => setIsDialogOpen(_ => false)}>
        <button
          className="button-micro" onClick={_ => setIsDialogOpen(_ => false)}>
          {s("Close")}
        </button>
        <form onSubmit=makeTournament>
          <fieldset>
            <legend> {s("Make a new tournament")} </legend>
            <label htmlFor="tourney-name"> {s("Name:")} </label>
            <input
              id="tourney-name"
              name="tourney-name"
              placeholder="tournament name"
              required=true
              type_="text"
              value=newTourneyName
              onChange=updateNewName
            />
            {s(" ")}
            <input className="button-primary" type_="submit" value="Create" />
          </fieldset>
        </form>
      </Utils.Dialog>
    </div>
  </Window.WindowBody>;
};