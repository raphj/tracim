import pluggy

dispatcher = pluggy.PluginManager('tracim.event')
impl = pluggy.HookimplMarker("tracim.event")
spec = pluggy.HookspecMarker("tracim.event")