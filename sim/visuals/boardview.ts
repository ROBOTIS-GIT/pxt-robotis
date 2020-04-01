namespace pxsim.visuals {
    mkBoardView = (opts: pxsim.visuals.BoardViewOptions): BoardView => {
        return new visuals.CMView({
            // runtime: runtime,
            // theme: visuals.randomTheme(),
            // visualDef: opts.visual as BoardImageDefinition,
            // boardDef: opts.boardDef,
            // disableTilt: false,
            // wireframe: opts.wireframe
            runtime: runtime,
            theme: visuals.randomTheme(opts.highContrast, opts.light),
            disableTilt: false,
            wireframe: opts.wireframe,
        });
    }
}